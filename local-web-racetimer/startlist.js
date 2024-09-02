var data = [];
var dataTeam = [];
var dataCat = [];
var dataLaps = [];
var dataTeams = [];
var athletesColl = new LDB.Collection('athletes');
var teams = new LDB.Collection('teams');
var categories = new LDB.Collection('categories');
var lapsEvent = new LDB.Collection('lapsEvent');

var buttonsAction = '<div class="input-group w-50" id="action-row-$index$"><input type="text" id="newBib-$id$" class="form-control" aria-describedby="button-addon4" value="" onkeydown="if(event.keyCode == 13){updateBib(\'$id$\')}">';
buttonsAction +=  '<div class="input-group-append" id="button-addon4">';
buttonsAction +=	'<button onclick="updateBib(\'$id$\');return false;" class="btn btn-outline-secondary" type="button" id="button-addon2">#</button>'
buttonsAction +=   '<button onclick="deleteAthlete(\'$id$\');return false;" type="button" class="btn btn-outline-danger"><svg class="bi"><use xlink:href="#trash"/></svg>Supprimer</button>'

buttonsAction +=	'</div></div>';

function reloadData(){


	athletesColl.find({}, function(results){
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

	for(var i in data){
		data[i].action =  buttonsAction.replaceAll("$index$",i).replaceAll("$id$",data[i]._id);

	}

	$('#table_startlist').bootstrapTable('destroy');
	$('#table_startlist').bootstrapTable({data:data});
	
	//document.getElementById("startList-data").innerHTML = table;
	
	renderOptionsForLapsEvent();
 
};
/**
 render HTML methods
 */
function renderOptionsForLapsEvent(){
	var options = '<option selected>Choisir...</option>';
	for (var i in dataLaps){
		options += '<option value="'+dataLaps[i].desc+'">'+dataLaps[i].desc+'</option>';
	}
	
	document.getElementById('inputLap1').innerHTML=options;
	document.getElementById('inputLap2').innerHTML=options;
	document.getElementById('inputLapFun').innerHTML=options;
};



function addAthleteSolo(){
	var formdata = new FormData(document.getElementById("form-solo"));
	var athlete = {
		bib : 0,
		name: formdata.getAll("fullname"),
		year: formdata.getAll("year"),
		cat: getCategoryForAthlete(formdata.getAll("year")).desc,
		team: 0,
		lapEvent : formatAllLapsEvent(),
		timerlap1:'-',
		timerlap2:'-',
		timertotal:'-',
		ranked:'true'
	  
	};

	athletesColl.save(athlete, function(_athlete){
	  console.log('New athlete:', _athlete);
	  reloadData();
	  clearAllFormInputs("form-solo");
	
	});
};
function addAthleteFun(){
	var formdata = new FormData(document.getElementById("form-fun"));
	var athlete = {
		bib : 0,
		name: formdata.getAll("fullname"),
		year: formdata.getAll("year"),
		cat: 'Fun',
		team: 0,
		lapEvent : formdata.getAll("lapFun"),
		timerlap1:'-',
		timerlap2:'-',
		timertotal:'-',
		ranked:'true'
	  
	};

	athletesColl.save(athlete, function(_athlete){
	  console.log('New athlete:', _athlete);
	  reloadData();
	  clearAllFormInputs("form-fun");
	
	});
};

function addTeam(){
	var formdata = new FormData(document.getElementById("form-team"));
	
	console.log('lastteam id:'+getLastCreatedTeam().pubId);
	
	
	var team = {
		pubId : getLastCreatedTeam().pubId+1,
		name : 'NOT_USED'
	};
	
	teams.save(team, function(_team){
		console.log('team created:'+ JSON.stringify(team));
	});
	

	var team_athletes = [
		{
			bib:0,
			name: formdata.getAll("fullname1"),
			year: formdata.getAll("year1"),
			cat: 'Team',
			team: team.pubId,
			lapEvent : formdata.getAll("lap1"),
			timerlap1:'-',
			timerlap2:'-',
			timertotal:'-',
			ranked:'true'  
		},
		{
			bib:0,
			name: formdata.getAll("fullname2"),
			year: formdata.getAll("year2"),
			cat: 'Team',
			team: team.pubId,
			lapEvent : formdata.getAll("lap2"),
			timerlap1:'-',
			timerlap2:'-',
			timertotal:'-',
			ranked:'true'
		}
	];

	athletesColl.save(team_athletes, function(_athletes){
	  console.log('New athletes for team n°'+team.pubId+':' +JSON.stringify(_athletes));
	  reloadData();
	  clearAllFormInputs("form-team");
	});
};

function deleteAthlete(_id){
	
	console.log('delete athlete with id:'+_id);
	
	var teamMember = false;

	athletesColl.find({ _id: _id }, function(items){
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
	
	athletesColl.find({ }, function(items){
			data = items;
	});

	reloadData();
	
};

function updateBib(_id){
	
	console.log('updateBib index current:'+event.target.parentNode.id.substring(11));
	//event.target.parentNode.id
	var nextInputIndex = parseInt(event.target.parentNode.id.substring(11))+1;
	console.log('updateBibnext Index:'+nextInputIndex);
	
	var nextInput = document.getElementById('action-row-'+nextInputIndex).getElementsByClassName("form-control")[0];
	
	
		console.log('next input to focus:'+nextInput.id);
	//action-row-$index$
	
	console.log('newBib-'+_id);
	console.log('updateBib'+document.getElementById('newBib-'+_id).value);
	
	athletesColl.find({ _id: _id }, function(results){
		if(results[0]){
			console.log('updateBib:'+JSON.stringify(results[0]));
			results[0].bib = document.getElementById('newBib-'+_id).value;
			results[0].save();
		}
	});
	
	//nextInput.focus();
	
	reloadData();
	document.getElementById(nextInput.id).focus();
};

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
			console.log('getCategoryForAthlete '+dataCat[i].custom);
			if (yearInt >= minYear && yearInt <= maxYear && dataCat[i].custom){
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
