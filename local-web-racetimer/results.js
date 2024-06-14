
var dataAthletes = [];
var dataLapsRace = [];
//displayedArray
var arrayRankingsAthletes = [];

var athletesColl = new LDB.Collection('athletes');
var lapsRaceColl = new LDB.Collection('lapsRace');
var lapsEventColl = new LDB.Collection('lapsEvent');


function reloadData(){
	
	console.log('data initialization for results');
	athletesColl.find({}, function(results){
		dataAthletes = results;
	});

	console.log('JSON:'+JSON.stringify(dataAthletes));
	$('#table_rankings').bootstrapTable('destroy');
	$('#table_rankings').bootstrapTable({data:dataAthletes});
};

function init(){
	

};

function filterCategory(_cat){
	
	console.log('filter cat:'+_cat);
	if(_cat===''){
		console.log('filter cat empty');
		$('#table_rankings').bootstrapTable('filterBy', {});
	}else{
	}
	 $('#table_rankings').bootstrapTable('filterBy', {
        cat: ["Seniors"]
      });
};
