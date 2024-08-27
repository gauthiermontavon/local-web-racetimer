//FIXME arrayRankingsAthletes vs dataAthletes
/*
dataAthletes : contient uniquement les données à sauvegarder dans DB
arrayRankingsAthletes : données issues de dataAthletes + données à afficher de la course live (status, btn actions)
voir si optimal, ou si il faut directmeent éditer les dataAthletes durant le "LIVE"
*/


//TODO make it const to another file not loaded through dynamic routing...
var StatusAthleteRace = {
	DNS: "DNS",
	DNF: "DNF",
	READY: "ready",
	FINISHED: "finished",
	RACING: "racing"
};

var runningAnimHtml = '<div class="text-center"><div class="spinner-border spinner-border-sm text-primary" role="status"></div></div>';

//var buttonsAction = '<div class="input-group w-50"><input type="text" id="newBib-$id$" class="form-control" aria-describedby="button-addon4">';
var buttonsAction =  '<div class="input-group-append" id="button-addon4">';
buttonsAction +=	'<button id="btn-dns-$bib$" onclick="dnsBib(event,\'$bib$\');return false;" class="btn btn-sm btn-outline-primary" type="button" id="button-addon1">DNS</button>'
buttonsAction +=	'<button id="btn-dnf-$bib$" onclick="dnfBib(event,\'$bib$\');return false;" class="btn btn-sm btn-outline-primary" type="button" id="button-addon2">DNF</button>'
buttonsAction +=   '<button onclick="startManualBib(\'$bib$\');return false;" type="button" class="btn btn-sm btn-outline-primary"><svg class="bi"><use xlink:href="#chrono"/></svg>Manuel</button>'

buttonsAction +=	'</div>';


var dataAthletes = [];
//displayedArray
var arrayRankingsAthletes = []; //==> resuts

var athletesColl = new LDB.Collection('athletes');
var lapsEventColl = new LDB.Collection('lapsEvent');
//counter to keep if athlete is expected on finish line
var cptAthleteOnFinishLine = 0;
var cptAthleteOnStartLine = 0;


function reloadData(){
	
	
	$('#table_rankings').bootstrapTable('destroy');
	$('#table_rankings').bootstrapTable({data:arrayRankingsAthletes});
};


function init(){
	console.log('data initialization');
	athletesColl.find({}, function(results){
		dataAthletes = results;
		cptAthleteOnStartLine = dataAthletes.length;
		document.getElementById("info-status-race").innerHTML= "("+cptAthleteOnFinishLine+"/"+cptAthleteOnStartLine+")";
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
	
	console.log('dataAthletes:'+JSON.stringify(dataAthletes));
	console.log('arrayRankingsAthletes:'+JSON.stringify(arrayRankingsAthletes));
			
	//==> bib,name,catégorie,team,discipline,temps VTT, temps CàP, temps total, status, action	
	
	//find athlete / order by team, bib
	$('#table_rankings').bootstrapTable('destroy');
	$('#table_rankings').bootstrapTable({data:arrayRankingsAthletes});
	
	renderBibButtonsHTML();
};

//DEPRECATED: SOLO doesnt contain lapEvent anymore...check startlist.js 
function lapsEventStrToArray(str){
	return str.split(",");
};

/**
 render HTML methods
 */
 
function updateStatusRaceInfosHTML(){
	document.getElementById("info-status-race").innerHTML= "("+cptAthleteOnFinishLine+"/"+cptAthleteOnStartLine+")";
	if(cptAthleteOnStartLine==cptAthleteOnFinishLine){
		stopRace();
	}		
}
function renderBibButtonsHTML(){
	
	arrayRankingsAthletes = arrayRankingsAthletes.sort((a, b) => a.bib - b.bib);
	var htmlButtons = '';
	var cpt = 0;
	var bibPerRow = 10;
	console.log('length of bib array:'+arrayRankingsAthletes.length);
	for(var i in arrayRankingsAthletes){
		cpt = cpt + 1;
		if(cpt === 1){
			htmlButtons += '<div class="row g-0 row-cols-auto">'
		}
		console.log('new line?:'+cpt%bibPerRow);
		htmlButtons += '<div class="col"><button id="btn-bib-'+arrayRankingsAthletes[i].bib+'" type="button" style="width:45px;" class="btn btn-outline-warning" onclick="clickButtonBib('+arrayRankingsAthletes[i].bib+')"';
		if(!isBibInMainStartRace(arrayRankingsAthletes[i].bib)){
			htmlButtons += 'disabled ';
		}
		htmlButtons += '>'+arrayRankingsAthletes[i].bib+'</button></div>';
		if(cpt%bibPerRow === 0 && cpt<arrayRankingsAthletes.length){
			htmlButtons += '</div><div class="row g-0 row-cols-auto">'
		}
		if(cpt === arrayRankingsAthletes.length){
			htmlButtons += '</div>';
		}
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
	
	ath.status = StatusAthleteRace.DNS.toString();
	cptAthleteOnFinishLine+=1;
	updateStatusRaceInfosHTML();
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
	cptAthleteOnFinishLine+=1;
	updateStatusRaceInfosHTML();
	reloadData();
};

function startManualBib(_bib){
	console.log('manual start');
	var current = Date.now();
	var ranking = arrayRankingsAthletes.find((obj) => obj.bib === _bib.toString());
	
	console.log('ranking found for bib:'+JSON.stringify(ranking));
	
	
	//if ranking is a solo ou différent de Fun
	if(ranking.team === 0 && ranking.cat != 'Fun'){
		alert('Départ manuel autorisé seulement pour une équipe catégorie Fun - coureur à pied');
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
			alert('Départ manuel autorisé seulement pour une équipe ou catégorie Fun - coureur à pied');
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
function updateStyleBibFlag(_bib,isTeamOrFun,srcEvent){
	console.log('class list of btn :'+srcEvent.classList);
	
	var btnBib = document.getElementById('btn-bib-'+_bib);
		console.log('id :'+srcEvent.id.substring(0,7));
	switch (srcEvent.id.substring(0,7)){
		case 'btn-bib':
			console.log('click on bib');
			if(isTeamOrFun){
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
function finishLapForBib(_bib){
	var current = Date.now();
	// updateClass: btn-outline-warning -> -=> btn-outline-success -> btn-success/disable
	
	var btnBib = document.getElementById('btn-bib-'+_bib);
	
	
	
	var ranking = arrayRankingsAthletes.find((obj) => obj.bib === _bib.toString());
	
	console.log('ranking found for bib:'+JSON.stringify(ranking));
	
	
	//if ranking is a solo
	if(ranking.team === 0 && ranking.cat !== 'Fun'){
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
		
	}else if(ranking.cat === 'Fun'){
			updateStyleBibFlag(_bib,true,btnBib);
			if(ranking.startTimeLap1 != 0){
				ranking.endTimeLap1 = current;
				ranking.timerlap1 = calculateTimer(ranking.startTimeLap1,ranking.endTimeLap1);
				
			}else if (ranking.startTimeLap2 != 0){
				ranking.endTimeLap2 = current;
				ranking.timerlap2 = calculateTimer(ranking.startTimeLap2,ranking.endTimeLap2);
			}
			finishEventForBib(ranking,current);
			
	}
	//if ranking is a team mate
	else{
		console.log('finish team mate or fun');
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
			cptAthleteOnFinishLine+=1;
			updateStatusRaceInfosHTML();
			
			//start timer for team mate startTimeLap2
			//si il n'est pas ready, il ne faut pas le démarrer, peut etre déja parti car manual start ?
			if(rankingTeamMate.status === StatusAthleteRace.READY.toString()){
				console.log('second team has already started..');
				rankingTeamMate.status = StatusAthleteRace.RACING.toString() ;
				rankingTeamMate.startTimeLap2 = current;
				rankingTeamMate.timerlap2 = runningAnimHtml;
				document.getElementById('btn-bib-'+rankingTeamMate.bib).disabled = false;
			}
			if(rankingTeamMate.status === StatusAthleteRace.FINISHED.toString()){
				console.log('second team has already finish..');
				ranking.timertotal = calculateTimer(ranking.startTimeLap1,rankingTeamMate.endTimeLap2);
				rankingTeamMate.timertotal = ranking.timertotal;
			}
			
		}
		if(orderSettingLap==2){
			finishEventForTeam(ranking,rankingTeamMate,current);
		}
		
	
	}
	reloadData();
	
};

function finishEventForBib(_objRankAth, currentTime){
	if(_objRankAth.cat !== 'Fun'){
		_objRankAth.endTimeLap2 = currentTime;
		_objRankAth.timerlap2 = calculateTimer(_objRankAth.startTimeLap2,_objRankAth.endTimeLap2);
		_objRankAth.timertotal = calculateTimer(_objRankAth.startTimeLap1,_objRankAth.endTimeLap2);
	}
	_objRankAth.status = StatusAthleteRace.FINISHED.toString() ;
	cptAthleteOnFinishLine+=1;
	updateStatusRaceInfosHTML();
};
//
function finishEventForTeam(_objRankAth,_objRankTeamMate, currentTime){
	console.log('FINSHED EVENT FOR TEAM');
	_objRankAth.endTimeLap2 = currentTime;
	_objRankAth.timerlap2 = calculateTimer(_objRankAth.startTimeLap2,_objRankAth.endTimeLap2);
	//TODO: manage if team mate second, finish befoire first one, in case of manual start without waiting end of lap 1
	_objRankAth.timertotal = calculateTimer(_objRankTeamMate.startTimeLap1,_objRankAth.endTimeLap2);
	_objRankTeamMate.timertotal = calculateTimer(_objRankTeamMate.startTimeLap1,_objRankAth.endTimeLap2);
	_objRankAth.status = StatusAthleteRace.FINISHED.toString() ;
	cptAthleteOnFinishLine+=1;
	updateStatusRaceInfosHTML();
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
//TODO: gère aussi les catégories Fun càp
function setStartTimeLap1Athletes(){
	var currentTime = Date.now();
	
	for(var i in arrayRankingsAthletes){
		var bib = arrayRankingsAthletes[i].bib;
		if(isBibInMainStartRace(bib) && arrayRankingsAthletes[i].status != StatusAthleteRace.DNS.toString()){
			arrayRankingsAthletes[i].timerlap1 = runningAnimHtml;
			arrayRankingsAthletes[i].startTimeLap1 = currentTime;
			arrayRankingsAthletes[i].status = StatusAthleteRace.RACING.toString() ;
		}
	}
	
	/*
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
	}*/
	
	reloadData();
	
	
};


function saveResults(){
	
	athletesColl.find({}, function(results){
		console.log('dataAthletes in DB before save :'+JSON.stringify(results));
	
	});
	
	
	//pour chaque ath+ses données LIVE race, classé par bib
	arrayRankingsAthletes = arrayRankingsAthletes.sort((a, b) => a.bib - b.bib);
	for(var i in arrayRankingsAthletes){
		//on persiste les données live timer et on save en DB
		athletesColl.find({ bib: arrayRankingsAthletes[i].bib }, function(results){
			if(results[0]){
				results[0].timerlap1 = arrayRankingsAthletes[i].timerlap1;
				results[0].timerlap2 = arrayRankingsAthletes[i].timerlap2;
				results[0].timertotal = arrayRankingsAthletes[i].timertotal;
				results[0].save();
			};
		});
	}
	athletesColl.find({}, function(results){
		console.log('dataAthletes in DB after save :'+JSON.stringify(results));
	
	});
	
	

};

//TIMER FEATURES

var timer;
var mainStartTime;
var running = false;
var idElementTimer = "maintimer";

function startRace(){
	document.getElementById("main-menu").setAttribute("disabled",true);
	document.getElementById("main-link").setAttribute("disabled",true);
	document.getElementById("race-init-btn").setAttribute("disabled",true);
	if(!running){
		startTimer();
	
		setStartTimeLap1Athletes();
	}
};

function stopRace(){
	//TODO: saveRankings fo results
	saveResults();
	//document.getElementById("main-menu").setAttribute("disabled",false);
	//document.getElementById("main-link").setAttribute("disabled",false);
	//document.getElementById("race-init-btn").setAttribute("disabled",false);
	document.getElementById("main-menu").removeAttribute("disabled");
	document.getElementById("main-link").removeAttribute("disabled");
	document.getElementById("race-init-btn").removeAttribute("disabled");
	if(running){
		stopTimer();
	}
}


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
