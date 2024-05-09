//TODO make it const to another file not loaded through dynamic routing...
var StatusAthleteRace = {
	DNS: "DNS",
	DNF: "DNF",
	READY: "ready",
	FINISHED: "finished",
	RACING: "racing"
};

const runningAnimHtml = '<div class="text-center"><div class="spinner-border spinner-border-sm text-primary" role="status"></div></div>';

//var buttonsAction = '<div class="input-group w-50"><input type="text" id="newBib-$id$" class="form-control" aria-describedby="button-addon4">';
var buttonsAction =  '<div class="input-group-append" id="button-addon4">';
buttonsAction +=	'<button id="btn-dns-$bib$" onclick="dnsBib(event,\'$bib$\');return false;" class="btn btn-sm btn-outline-primary" type="button" id="button-addon1">DNS</button>'
buttonsAction +=	'<button id="btn-dnf-$bib$" onclick="dnfBib(event,\'$bib$\');return false;" class="btn btn-sm btn-outline-primary" type="button" id="button-addon2">DNF</button>'
buttonsAction +=   '<button onclick="startManualBib(\'$bib$\');return false;" type="button" class="btn btn-sm btn-outline-primary"><svg class="bi"><use xlink:href="#chrono"/></svg>Manuel</button>'

buttonsAction +=	'</div>';


var dataAthletes = [];
var dataLapsRace = [];
//displayedArray
var arrayRankingsAthletes = [];

var athletesColl = new LDB.Collection('athletes');
var lapsRaceColl = new LDB.Collection('lapsRace');
var lapsEventColl = new LDB.Collection('lapsEvent');


function reloadData(){
	
	
	$('#table_rankings').bootstrapTable('destroy');
	$('#table_rankings').bootstrapTable({data:arrayRankingsAthletes});
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
	athletesColl.find({}, function(results){
		dataAthletes = results;
	});
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
			timerlap1:'-',
			timerlap2:'-',
			timertotal:'-',
			status:StatusAthleteRace.READY.toString(),
			action: buttonsAction.replaceAll("$bib$",dataAthletes[i].bib)
		};
		
		arrayRankingsAthletes.push(rankingAth);

	}
			
	//==> bib,name,catégorie,team,discipline,temps VTT, temps CàP, temps total, status, action	
	
	//find athlete / order by team, bib
	$('#table_rankings').bootstrapTable('destroy');
	$('#table_rankings').bootstrapTable({data:arrayRankingsAthletes});
	//console.log('data initialization full datas:'+JSON.stringify(arrayRankingsAthletes));

	/*
	lapsRaceColl.save(dataLapsRace, function(_laps){
	  console.log('all laps save:', _laps);
	});*/
	
	renderBibButtonsHTML();
};

//DEPRECATED: SOLO doesnt contain lapEvent anymore...check startlist.js 
function lapsEventStrToArray(str){
	return str.split(",");
};

/**
 render HTML methods
 */
function renderBibButtonsHTML(){
	
	arrayRankingsAthletes = arrayRankingsAthletes.sort((a, b) => a.bib - b.bib);
	var htmlButtons = '';
	for(var i in arrayRankingsAthletes){
		htmlButtons += '<button id="btn-bib-'+arrayRankingsAthletes[i].bib+'" type="button" class="btn btn-outline-warning" onclick="clickButtonBib('+arrayRankingsAthletes[i].bib+')"';
		if(!isBibInMainStartRace(arrayRankingsAthletes[i].bib)){
			htmlButtons += 'disabled ';
		}
		htmlButtons += '>'+arrayRankingsAthletes[i].bib+'</button>';
		console.log(arrayRankingsAthletes[i].bib+' in main start?:'+isBibInMainStartRace(arrayRankingsAthletes[i].bib));
	}

	//console.log('render bib grid'+htmlButtons);
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

function dnsBib(event,_bib){
	console.log('dns bib :'+_bib);
	
	updateStyleBibFlag(_bib,null,event.target);
	var ath = arrayRankingsAthletes.find((obj) => obj.bib === _bib.toString());
	
	ath.status = StatusAthleteRace.DNS.toString() ;
	reloadData();
	
};
function dnfBib(event,_bib){
	console.log('dnf bib :'+_bib);
	
	updateStyleBibFlag(_bib,null,event.target);
	var ath = arrayRankingsAthletes.find((obj) => obj.bib === _bib.toString());
	ath.status = StatusAthleteRace.DNF.toString() ;
	if(ath.timerlap1.includes('spinner-border')){
		ath.timerlap1 = '-';
	}
	if(ath.timerlap2.includes('spinner-border')){
		ath.timerlap2 = '-';
	}
	reloadData();
};

function startManualBib(_bib){
	console.log('manual start');
	var current = Date.now();
	var ranking = arrayRankingsAthletes.find((obj) => obj.bib === _bib.toString());
	
	console.log('ranking found for bib:'+JSON.stringify(ranking));
	
	
	//if ranking is a solo
	if(ranking.team === 0){
		alert('Départ manuel autorisé seulement pour une équipe - coureur à pied');
	}
	else{
		var orderSettingLap = getOrderSettingForLapEvent(ranking.lapEvent);
		if(orderSettingLap==2 && running){
			//finishEventForTeam(ranking,rankingTeamMate,current);
			//start timer for team mate startTimeLap2
			ranking.startTimeLap2 = current;
			ranking.timerlap2 = runningAnimHtml;
			ranking.status = StatusAthleteRace.RACING.toString() ;
			document.getElementById('btn-bib-'+ranking.bib).disabled = false;
			reloadData();
		}
		else{
			alert('Départ manuel autorisé seulement pour une équipe - coureur à pied');
		}
	}
	
};

function isBibInMainStartRace(_bib){
	//get desc of first lap of the race
	var descFirstLapEvent = getLapEventDescForOrderSettings(1);
	var ranking = arrayRankingsAthletes.find((obj) => obj.bib === _bib.toString());
	console.log('first lap of event :'+descFirstLapEvent);
	if(ranking.status === StatusAthleteRace.DNS.toString()){
		return false;
	}else{
		return ranking.lapEvent.includes(descFirstLapEvent);
	}
	
};
function updateStyleBibFlag(_bib,isTeam,srcEvent){
	console.log('class list of btn :'+srcEvent.classList);
	
	var btnBib = document.getElementById('btn-bib-'+_bib);
		console.log('id :'+srcEvent.id.substring(0,7));
	switch (srcEvent.id.substring(0,7)){
		case 'btn-bib':
			console.log('click on bib');
			if(isTeam){
				srcEvent.className = srcEvent.className.replace("btn-outline-warning","btn-success");
				srcEvent.className = srcEvent.className.replace("btn-outline-success","btn-success");
			}
			else{
				srcEvent.className = srcEvent.className.replace("btn-outline-success","btn-success");
				srcEvent.className = srcEvent.className.replace("btn-outline-warning","btn-outline-success");
				
			}
			if(srcEvent.classList.contains('btn-success')){
					srcEvent.disabled = true;
			}
			break;
		case 'btn-dns':
			console.log('click on dns');
			
				btnBib.className = btnBib.className.replace("btn-outline-warning","btn-secondary");
				btnBib.className = btnBib.className.replace("btn-outline-success","btn-secondary");
				btnBib.disabled = true;
			break;
		case 'btn-dnf':
				btnBib.className = btnBib.className.replace("btn-outline-warning","btn-danger");
				btnBib.className = btnBib.className.replace("btn-outline-success","btn-danger");
				btnBib.disabled = true;
			break;
	}
	
};
//
function finishLapForBib(_bib){
	var current = Date.now();
	// updateClass: btn-outline-warning -> -=> btn-outline-success -> btn-success/disable
	
	var btnBib = document.getElementById('btn-bib-'+_bib);
	
	
	
	var ranking = arrayRankingsAthletes.find((obj) => obj.bib === _bib.toString());
	
	console.log('ranking found for bib:'+JSON.stringify(ranking));
	
	
	//if ranking is a solo
	if(ranking.team === 0){
		updateStyleBibFlag(_bib,false,btnBib);
		console.log('finish solo');
		
		if(ranking.endTimeLap1 == 0){
			
			ranking.endTimeLap1 = current;
			ranking.timerlap1 = calculateTimer(ranking.startTimeLap1,ranking.endTimeLap1);
			ranking.startTimeLap2 = current;
			ranking.timerlap2 = runningAnimHtml;
		}
		else{
			
			finishEventForBib(ranking,current);
		}
		
	}
	//if ranking is a team mate
	else{
		console.log('finish team mate');
		updateStyleBibFlag(_bib,true,btnBib);
		var rankingTeamMate = arrayRankingsAthletes.find((obj) => (obj.team === ranking.team) && (obj.bib != _bib.toString()));
		console.log('found team mate :'+JSON.stringify(rankingTeamMate));
		
		//var lapEventArray = lapsEventStrToArray(ranking.lapEvent);
		//var orderSettingLap = getOrderSettingForLapEvent(lapEventArray[0]);
		var orderSettingLap = getOrderSettingForLapEvent(ranking.lapEvent);
		console.log('ordre for lap to finish:'+orderSettingLap);
		if(orderSettingLap==1){
			ranking.endTimeLap1 = current;
			ranking.timerlap1 = calculateTimer(ranking.startTimeLap1,ranking.endTimeLap1);
			ranking.status = StatusAthleteRace.FINISHED.toString() ;
			//start timer for team mate startTimeLap2
			//si il n'est pas ready, il ne faut pas le démarrer, peut etre déja parti car manual start ?
			if(rankingTeamMate.status === StatusAthleteRace.READY.toString()){
				rankingTeamMate.startTimeLap2 = current;
				rankingTeamMate.timerlap2 = runningAnimHtml;
				document.getElementById('btn-bib-'+rankingTeamMate.bib).disabled = false;
			}
		}
		if(orderSettingLap==2){
			finishEventForTeam(ranking,rankingTeamMate,current);
		}
		
	
	}
	reloadData();
	
};

function finishEventForBib(_objRankAth, currentTime){
	_objRankAth.endTimeLap2 = currentTime;
	_objRankAth.timerlap2 = calculateTimer(_objRankAth.startTimeLap2,_objRankAth.endTimeLap2);
	_objRankAth.timertotal = calculateTimer(_objRankAth.startTimeLap1,_objRankAth.endTimeLap2);
	_objRankAth.status = StatusAthleteRace.FINISHED.toString() ;
};

function finishEventForTeam(_objRankAth,_objRankTeamMate, currentTime){
	console.log('FINSHED EVENT FOR TEAM');
	_objRankAth.endTimeLap2 = currentTime;
	_objRankAth.timerlap2 = calculateTimer(_objRankAth.startTimeLap2,_objRankAth.endTimeLap2);
	//TODO: manage if team mate second, finish befoire first one, in case of manual start without waiting end of lap 1
	_objRankAth.timertotal = calculateTimer(_objRankTeamMate.startTimeLap1,_objRankAth.endTimeLap2);
	_objRankTeamMate.timertotal = calculateTimer(_objRankTeamMate.startTimeLap1,_objRankAth.endTimeLap2);
	_objRankAth.status = StatusAthleteRace.FINISHED.toString() ;
}
function getLapEventDescForOrderSettings(_order){
	//FIXME: find({ desc:_desc} doesnt work
	var returnValue = '';
	lapsEventColl.find({}, function(results){	
		for(var i in results){
			if(parseInt(results[i].order) === _order){
				returnValue = results[i].desc.toString();
			}
		}
	});
	
	return returnValue;
};
function getOrderSettingForLapEvent(_desc){
	//FIXME: find({ desc:_desc} doesnt work
	var returnValue = 0;
	lapsEventColl.find({}, function(results){
		
		for(var i in results){
		
			if(results[i].desc.toString() === _desc.toString()){
				returnValue = parseInt(results[i].order);
			}
		}
	});
	
	return returnValue;
};

function setStartTimeLap1Athletes(){
	var currentTime = Date.now();
	var rankingsSolo = arrayRankingsAthletes.filter((obj) => obj.team === 0 );
	
	for (var i in rankingsSolo){
		if(rankingsSolo[i].status != StatusAthleteRace.DNS.toString()){
			console.log('start race - set timer 1 to bib:'+rankingsSolo[i].bib);
			
			rankingsSolo[i].timerlap1 = runningAnimHtml;
			rankingsSolo[i].startTimeLap1 = currentTime;
			rankingsSolo[i].status = StatusAthleteRace.RACING.toString() ;
		}
	}
	//TODO : have to be sure that is the first and second part
	var rankingTeamFirst = arrayRankingsAthletes.filter((obj) => obj.team > 0);
	
	for (var i in rankingTeamFirst){
		
		var order = getOrderSettingForLapEvent(rankingTeamFirst[i].lapEvent);
		if(getOrderSettingForLapEvent(rankingTeamFirst[i].lapEvent)==1 && rankingTeamFirst[i].status != StatusAthleteRace.DNS.toString() ){
			console.log('start race - set timer 1 to bib:'+rankingTeamFirst[i].bib);
			rankingTeamFirst[i].timerlap1 = runningAnimHtml;
			rankingTeamFirst[i].startTimeLap1 = currentTime;
			rankingTeamFirst[i].status = StatusAthleteRace.RACING.toString() ;
		}
		else{
			console.log('start race - bib '+rankingTeamFirst[i].bib+' will start after teammate or with manual start');
		}
	}
	
	reloadData();
	
	
};
function startRace(){
	startTimer();
	
	setStartTimeLap1Athletes();
	
	for(var i in arrayRankingsAthletes){
		
		//htmlButtons += '<button id="btn-bib-'+arrayRankingsAthletes[i].bib+'" type="button" class="btn btn-outline-warning" onclick="clickButtonBib('+arrayRankingsAthletes[i].bib+')">'+arrayRankingsAthletes[i].bib+'</button>';
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

function calculateTimer(start,end){
	var resultTime = end - start;
	var hours = Math.floor(resultTime / 3600000);
    var minutes = Math.floor((resultTime % 3600000) / 60000);
    var seconds = Math.floor((resultTime % 60000) / 1000);
	
	var formattedTime = formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);
	return formattedTime;
	
}


function formatTime(time) {
	return time < 10 ? '0' + time : time;
}
