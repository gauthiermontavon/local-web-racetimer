//TODO make it const to another file not loaded through dynamic routing...
var StatusAthleteRace = {
	DNS: "DNS",
	DNF: "DNF",
	READY: "ready",
	FINISHED: "finished",
	RACING: "racing"
};


var dataAthletes = [];
var dataLapsRace = [];

var arrayAthletesLap = [];

var athletesColl = new LDB.Collection('athletes');
var lapsRaceColl = new LDB.Collection('lapsRace');


function reloadData(){


	athletesColl.find({}, function(results){
		dataAthletes = results;
	});
	//populateDataPage();
};


function init(){
	console.log('data initialization');
	//TODO: check bib attribution and team completed
	dataAthletes = dataAthletes.sort((a, b) => a.bib - b.bib);
	for(var i in dataAthletes){
		var lapRace = {
			bibAthlete:dataAthletes[i].bib,
			startTimeLap1:0,
			endTimeLap1:0,
			startTimeLap2:0,
			endTimeLap2:0,
			status:StatusAthleteRace.READY.toString();
			
		};
		
		dataLapsRace.push(lapRace);
	
		dataLapsRace.push
	}
	
	
	
	//build fusionned array (dataAthletes and dataLapsRace) bib as common index 
	
	var lapAthleteResult = dataLapsRace.find((obj) => obj.bib === _bib.toString());
	
	
		delete lapRace.__collection; //remove key collection (from LDBCollection)
		delete lapRace._id; //remove key collection (from LDBCollection)
		lapRace.timerlap1 = 0;
		lapRace.timerlap2 = 0;
		lapRace.year = 
		lapRace.name = 
		lapRace.cat =
		lapRace.la
		//si team => un seul lap
		if(lapRace.team > 0){
			lapRace.remainingLaps = "1";
		}else{
			lapRace.remainingLaps = "2";
		}
		lapRace.completedLaps = "0";
		lapRace.status = StatusAthleteRace.READY.toString();
		//lapRace.action = '<button type="button" class="btn btn-outline-secondary">DNS</button><button type="button" class="btn btn-outline-warning">DNF</button>';
		console.log('data initialization '+i+':'+JSON.stringify(lapRace));
		
		
		
				
		
	//==> bib,name,catégorie,team,discipline,temps VTT, temps CàP, temps total, status, action	
	
	
	
	//find athlete / order by team, bib
	$('#table_rankings').bootstrapTable('destroy');
	$('#table_rankings').bootstrapTable({data:dataLapsRace});
	console.log('data initialization full datas:'+JSON.stringify(dataLapsRace));

	
	lapsRaceColl.save(dataLapsRace, function(_laps){
	  console.log('all laps save:', _laps);
	});
	
	renderBibButtonsHTML();
};


function lapsEventStrToArray(str){
	return str.split(",");
}

/**
 render HTML methods
 */
function renderBibButtonsHTML(){
	dataLapsRace = dataLapsRace.sort((a, b) => a.bib - b.bib);
	var htmlButtons = '';
	for(var i in dataLapsRace){
		htmlButtons += '<button id="btn-bib-'+dataLapsRace[i].bib+'" type="button" class="btn btn-outline-warning" onclick="clickButtonBib('+dataLapsRace[i].bib+')">'+dataLapsRace[i].bib+'</button>';
	}

	console.log('render bib grid'+htmlButtons);
	document.getElementById('grid-bib').innerHTML=htmlButtons;
};

function clickButtonBib(_bib){
	console.log('click  bib n°'+_bib);
	finishLapForBib(_bib);

};
function enterOnBibInput(_bib){
	console.log('enter  bib n°'+_bib);
	finishLapForBib(_bib);
};

//
function finishLapForBib(_bib){
	// updateClass: btn-outline-warning -> -=> btn-outline-success -> btn-success/disable
	var btnBib = document.getElementById('btn-bib-'+_bib);
	console.log('class list of btn :'+btnBib.classList);
	if(btnBib.classList.contains('btn-outline-warning')){
		console.log('replace');
		btnBib.className = btnBib.className.replace("btn-outline-warning","btn-outline-success");
	}
	else if(btnBib.classList.contains('btn-outline-success')){
		console.log('replace2');
		btnBib.className = btnBib.className.replace("btn-outline-success","btn-success");
		btnBib.disabled = true;
	}
	console.log('class list of btn 2 :'+btnBib.classList);
	var lapAthleteResult = dataLapsRace.find((obj) => obj.bib === _bib.toString());
	
	
		if(results[0]){
			console.log('updateBib:'+JSON.stringify(results[0]));
			results[0].bib = document.getElementById('newBib-'+_id).value;
			results[0].save();
		}
	
	
	//lapAthleteResult.
	console.log('athlete lap:'+JSON.stringify(lapAthleteResult));
};

function finishEventForBibOrTeam(){

};
//TIMER FEATURES
function updateTimerForBib(bib,lapEvent){
}




var timer;
var startTime;
var running = false;
var idElementTimer = "maintimer";

function startTimer() {
      if (!running) {
        startTime = Date.now();
        timer = setInterval(updateTimer, 1000);
        running = true;
	  }
};

function stopTimer() {
      if (running) {
        clearInterval(timer);
        running = false;
       
      }
};
function resetTimer() {
      stopTimer();
      document.getElementById(idElementTimer).textContent = '00:00:00';
};
function updateTimer() {
      var currentTime = Date.now() - startTime;
      var hours = Math.floor(currentTime / 3600000);
      var minutes = Math.floor((currentTime % 3600000) / 60000);
      var seconds = Math.floor((currentTime % 60000) / 1000);

      document.getElementById(idElementTimer).textContent = formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);
}

  
    function formatTime(time) {
      return time < 10 ? '0' + time : time;
    }
