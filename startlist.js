var data = [];
var dataTeam = [];
var dataCat = [];
var dataLaps = [];
var dataTeams = [];
var athletes = new LDB.Collection('athletes');
var teams = new LDB.Collection('teams');
var categories = new LDB.Collection('categories');
var lapsEvent = new LDB.Collection('lapsEvent');




var buttonsAction = '<div class="input-group w-50"><input type="text" id="newBib-$id$" class="form-control" aria-describedby="button-addon4">';
buttonsAction +=  '<div class="input-group-append" id="button-addon4">';
buttonsAction +=	'<button onclick="updateBib(\'$id$\');return false;" class="btn btn-outline-secondary" type="button" id="button-addon2">#</button>'
 buttonsAction +=   '<button onclick="deleteAthlete(\'$id$\');return false;" type="button" class="btn btn-outline-danger"><svg class="bi"><use xlink:href="#trash"/></svg>Supprimer</button>'

buttonsAction +=	'</div></div>';


var deleteAthleteButton = '<button onclick="deleteAthlete(\'$id$\');return false;" type="button" class="btn btn-outline-danger"><svg class="bi"><use xlink:href="#trash"/></svg>Supprimer</button>';

var editBibButton = '<div class="input-group w-50"><input type="text" class="form-control"><button class="btn btn-outline-secondary" type="button" id="button-addon2">#</button></div>';

$('#table_startlist').bootstrapTable();

$('#table').bootstrapTable("load",[{
    id: 1,
    name: 'Item 1',
    price: '$1'
  }, {
    id: 2,
    name: 'Item 2',
    price: '$2'
  }]);

function reloadData(){


	athletes.find({}, function(results){
		data = results;
	});
	
	teams.find({},function(results){
		dataTeams = results;
	});

	categories.find({}, function(results){
		dataCat = results;
	});
	
	lapsEvent.find({}, function(results){
		dataLaps = results;
	});
	
	populateDataPage();
}
/**
function must be there if page contains dynamic data (implement interface)
*/
function populateDataPage(){
	console.log('populate for startlist.html');
	var table = "" ;

	for(var i in data){
			table += "<tr>";
			table += "<td>"+data[i].bib+"</td>" 
					+ "<td>" + data[i].name +"</td>" 
					+ "<td>" + data[i].year +"</td>" 
					+ "<td>" + data[i].cat +"</td>"
					+ "<td>" + data[i].team +"</td>"
					+ "<td>" + data[i].lapEvent +"</td>"
					+ "<td>" + data[i].ranked +"</td>"
					+ "<td>" + buttonsAction.replaceAll("$id$",data[i]._id)+"</td>";
			table += "</tr>";
	}
 
	document.getElementById("startList-data").innerHTML = table;
	
	renderOptionsForLapsEvent();
 
};
/**
 render HTML methods
 */
function renderOptionsForLapsEvent(){
	var options = '<option selected>Choisir...</option>';
	for (var i in dataLaps){
		options += '<option value="'+dataLaps[i]._id+'">'+dataLaps[i].desc+'</option>';
	}
	
	document.getElementById('inputLap1').innerHTML=options;
	document.getElementById('inputLap2').innerHTML=options;
}

function addAthlete(){
	var formdata = new FormData(document.getElementById("form-solo"));
	//TODO calculate category
	var athlete = {
		bib : 0,
	  name: formdata.getAll("fullname"),
	  year: formdata.getAll("year"),
	  cat: getCategoryForAthlete(formdata.getAll("year")).desc,
	  team: 0,
	  lapEvent : formatAllLapsEvent(),
	  ranked:'true'
	  
	};

	athletes.save(athlete, function(_athlete){
	  console.log('New athlete:', _athlete);
	  reloadData();
	  clearAllFormInputs("form-solo");
	
	});
};

function addTeam(){
	var formdata = new FormData(document.getElementById("form-team"));
	
	console.log('lastteam id:'+getLastCreatedTeam().pubId);
	console.log('cat for new athlete1:'+getCategoryForAthlete(formdata.getAll("year1")));
	
	var team = {
		pubId : getLastCreatedTeam().pubId+1,
		name : 'NOT_USED'
	};
	
	teams.save(team, function(_team){
		console.log('team created:'+ JSON.stringify(team));
	});
	
	//TODO : get id of category team
	//TODO: get last Team id to get 
	
	var team_athletes = [
		{
			bib:0,
			name: formdata.getAll("fullname1"),
			year: formdata.getAll("year1"),
			cat: getCategoryForAthlete(formdata.getAll("year1")).desc,
			team: team.pubId,
			lapEvent : formdata.getAll("lap1"),
			ranked:'true'  
		},
		{
			bib:0,
			name: formdata.getAll("fullname2"),
			year: formdata.getAll("year2"),
			cat: getCategoryForAthlete(formdata.getAll("year2")).desc,
			team: team.pubId,
			lapEvent : formdata.getAll("lap2"),
			ranked:'true'
		}
	];

	athletes.save(team_athletes, function(_athletes){
	  console.log('New athletes for team n°'+team.pubId+':' +JSON.stringify(_athletes));
	  reloadData();
	  clearAllFormInputs("form-team");
	});
};

function deleteAthlete(_id){
	
	console.log('delete athlete with id:'+_id);
	
	var teamMember = false;

	athletes.find({ _id: _id }, function(items){
		for(var i in items){
			if (items[i].team > 0){
				teamMember = true;
			}
			items[i].delete();
		}
	});
	
	if (teamMember) {
		console.log('TODO: delete team member and team + put a message box to notice user');
	}
	
	athletes.find({ }, function(items){
			data = items;
	});

	populateDataPage();
	
};

function updateBib(_id){
	console.log('newBib-'+_id);
	console.log('updateBib'+document.getElementById('newBib-'+_id).value);
	
	athletes.find({ _id: _id }, function(results){
		if(results[0]){
			results[0].bib = document.getElementById('newBib-'+_id).value;
			results[0].save();
		}
	});
	
	populateDataPage();
}

function getLastCreatedTeam(){
	
	var maxPublicId = 0;
	var lastTeam = {
		pubId : 0,
		name : 'NOT_USED'
	};
	for (var i in dataTeams){
			console.log('getLastTeam - one team '+dataTeams[i].pubId);
			var pubId = parseInt(dataTeams[i].pubId);
			if (pubId > maxPublicId){
				maxPublicId = pubId;
				lastTeam = dataTeams[i];
			}
	}
	return lastTeam;
};

function getCategoryForAthlete(year){
	var yearInt = parseInt(year);
	for (var i in dataCat){
			var minYear = parseInt(dataCat[i].minYear);
			var maxYear = parseInt(dataCat[i].maxYear);
			console.log('getCategoryForAthlete '+yearInt+' min'+minYear+' max'+maxYear);
			if (yearInt >= minYear && yearInt <= maxYear){
				return dataCat[i];
			}
	}

	return {};
};
//return lap,lap,lap
function formatAllLapsEvent(){
	var formatted = '';
	for (var i in dataLaps){
		formatted += dataLaps[i].desc+", ";
	}
	return formatted.slice(0, -2);
};
