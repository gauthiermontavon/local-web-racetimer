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
//displayedArray
var arrayRankingsAthletes = [];

var athletesColl = new LDB.Collection('athletes');
var lapsRaceColl = new LDB.Collection('lapsRace');
var lapsEventColl = new LDB.Collection('lapsEvent');

var dataLapsEvent = [];
lapsEventColl.find({}, function(results){
	dataLapsEvent = results;
});


function reloadData(){
	athletesColl.find({}, function(results){
		dataAthletes = results;
	});
};

function saveRankings(){
	//from arrayRankingsAthletes -> to dataLapsRace and save to Collection
	
	var lapRace = {
			bibAthlete:dataAthletes[i].bib,
			startTimeLap1:0,
			endTimeLap1:0,
			startTimeLap2:0,
			endTimeLap2:0,
			status:StatusAthleteRace.READY.toString()
			
		};
		
		
	dataLapsRace.push(lapRace);
};

function init(){
	console.log('data initialization');
	//TODO: check bib attribution and team completed
	dataAthletes = dataAthletes.sort((a, b) => a.bib - b.bib);
	for(var i in dataAthletes){
		
		var rankingAth = {
			bib:dataAthletes[i].bib,
			name:dataAthletes[i].name,
			cat:dataAthletes[i].cat,
			team:dataAthletes[i].team,
			lapEvent:dataAthletes[i].lapEvent,
			startTimeLap1:0,
			endTimeLap1:0,
			startTimeLap2:0,
			endTimeLap2:0,
			timerlap1:0,
			timerlap2:0,
			timertotal:0,
			status:StatusAthleteRace.READY.toString(),
			action:''
		};
		
		arrayRankingsAthletes.push(rankingAth);

	}
			
	//==> bib,name,catégorie,team,discipline,temps VTT, temps CàP, temps total, status, action	
	
	//find athlete / order by team, bib
	$('#table_rankings').bootstrapTable('destroy');
	$('#table_rankings').bootstrapTable({data:arrayRankingsAthletes});
	console.log('data initialization full datas:'+JSON.stringify(arrayRankingsAthletes));

	/*
	lapsRaceColl.save(dataLapsRace, function(_laps){
	  console.log('all laps save:', _laps);
	});*/
	
	renderBibButtonsHTML();
};


function lapsEventStrToArray(str){
	return str.split(",");
}

/**
 render HTML methods
 */
function renderBibButtonsHTML(){
	arrayRankingsAthletes = arrayRankingsAthletes.sort((a, b) => a.bib - b.bib);
	var htmlButtons = '';
	for(var i in arrayRankingsAthletes){
		htmlButtons += '<button id="btn-bib-'+arrayRankingsAthletes[i].bib+'" type="button" class="btn btn-outline-warning" onclick="clickButtonBib('+arrayRankingsAthletes[i].bib+')">'+arrayRankingsAthletes[i].bib+'</button>';
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
	
	
	var ranking = arrayRankingsAthletes.find((obj) => obj.bib === _bib.toString());
	
	var lapEventArray = lapsEventStrToArray(ranking.lapEvent);
	
	if(lapEventArray.length == 1){
		if(getOrderSettingForLapEvent(lapEventArray[0])==1){
			ranking.endTimeLap1 = '';
			//TODO: start timer for team mate startTimeLap2
		}
		if(getOrderSettingForLapEvent(lapEventArray[0])==2){
			ranking.endTimeLap2 = '';
		}
	}
	else if(lapEventArray.length == 2){
		if(ranking.endTimeLap1 == 0){
			ranking.endTimeLap1 ='';
			ranking.startTimeLap2 = '';
		}
		else{
			ranking.endTimeLap2 = '';
		}
	
	}
	
	//getOrderSettingForLapEvent
	/*
	if(lapEventArray.length == 1 && lapEventArray[0] === 'VTT'
	lapsEventStrToArray
	if(ranking.timerlap1 == 0)
		
	ranking.timerlap1 = ;
	*/
	
};

function finishEventForBibOrTeam(){

};

function getOrderSettingForLapEvent(_desc){
	var lapEvent = dataLapsEvent.find((obj) => obj.desc === _desc.toString());
	return lapEvent.order;
}

function startRace(){
	startTimer();
	for(var i in arrayRankingsAthletes){
		
		htmlButtons += '<button id="btn-bib-'+arrayRankingsAthletes[i].bib+'" type="button" class="btn btn-outline-warning" onclick="clickButtonBib('+arrayRankingsAthletes[i].bib+')">'+arrayRankingsAthletes[i].bib+'</button>';
	}
	
};


//TIMER FEATURES





var timer;
var mainStartTime;
var running = false;
var idElementTimer = "maintimer";

function startTimer() {
      if (!running) {
        mainStartTime = Date.now();
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
    var currentTime = Date.now() - mainStartTime;
    var hours = Math.floor(currentTime / 3600000);
    var minutes = Math.floor((currentTime % 3600000) / 60000);
    var seconds = Math.floor((currentTime % 60000) / 1000);

    document.getElementById(idElementTimer).textContent = formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);
}

function formatTime(time) {
	return time < 10 ? '0' + time : time;
}
