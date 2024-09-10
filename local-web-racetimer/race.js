//FIXME arrayRankingsAthletes vs dataAthletes
/*
dataAthletes : contient uniquement les données à sauvegarder dans DB
arrayRankingsAthletes : données issues de dataAthletes + données à afficher de la course live (status, btn actions)
voir si optimal, ou si il faut directmeent éditer les dataAthletes durant le "LIVE"
*/

/************************************************** 
CTRL+Z détection for undo bib during race */
var keysPressed =  [];
document.addEventListener('keydown', (event) => {
   keysPressed[event.key] = true;

   if (keysPressed['Control'] && event.key == 'z') {
       if(running){
			//alert('we can undo');
			undoLastBibEntered();
	   }
   }
   
   if(event.code.substring(0,5) == 'Digit' && running) {
	   event.preventDefault();
	   document.getElementById('input-bib').value += event.key;
	   //console.log('put bib');
   }
   
   if(event.key == 'Enter'){
		keyPressedBibInput(document.getElementById('input-bib'));
   }
});

document.addEventListener('keyup', (event) => {
   delete keysPressed[event.key];
});
/**********************************************************/

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
buttonsAction +=	'<button id="btn-dns-$bib$"  onclick="dnsBib(event,\'$bib$\');return false;" class="btn btn-sm btn-outline-primary" type="button" id="button-addon1">DNS</button>'
buttonsAction +=	'<button id="btn-dnf-$bib$" onclick="dnfBib(event,\'$bib$\');return false;" class="btn btn-sm btn-outline-primary" type="button" id="button-addon2">DNF</button>'
buttonsAction +=   '<button onclick="startManualBib(event,\'$bib$\');return false;" type="button" class="btn btn-sm btn-outline-primary"><svg class="bi"><use xlink:href="#chrono"/></svg>Manuel</button>'

buttonsAction +=	'</div>';


var dataAthletes = [];
//displayedArray
var arrayRankingsAthletes = []; //==> resuts

var athletesColl = new LDB.Collection('athletes');
var lapsEventColl = new LDB.Collection('lapsEvent');
//counter to keep if athlete is expected on finish line
var cptAthleteOnFinishLine = 0;
var cptAthleteOnStartLine = 0;

var listInsertedBib = [];



function reloadData(){
	
	
	$('#table_rankings').bootstrapTable('destroy');
	$('#table_rankings').bootstrapTable({data:arrayRankingsAthletes});
};


function init(){
	console.log('data initialization');
	dataAthletes = [];
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
			timersplit:'-',
			status:StatusAthleteRace.READY.toString(),
			action: buttonsAction.replaceAll("$bib$",dataAthletes[i].bib)
		};
		
		arrayRankingsAthletes.push(rankingAth);

	}
	
	console.log('dataAthletes:'+JSON.stringify(dataAthletes));
	console.log('arrayRankingsAthletes:'+JSON.stringify(arrayRankingsAthletes));
			
	//==> bib,name,catégorie,team,discipline,temps VTT, temps CàP, temps total, status, action	
	
	//find athlete / order by team, bib
	var featureEdit = false;
	$('#table_rankings').on('click-cell.bs.table', function(e,value,row,$element){
		if(!running && featureEdit){
			var ranking = arrayRankingsAthletes.find((obj) => obj.bib === $element.bib.toString());
			console.log('WE WANT EDIT FIELD:'+e+' row:'+row+' value:'+value);
			console.log('WE WANT EDIT FIELD value:'+JSON.stringify($element));
			
			if(value=='timerlap1'){
				ranking.timerlap1= '<input id="edit_1" type=\"text\" value=\"'+ranking.timerlap1+'\">';
				
			}
			if(value=='timerlap2'){
				ranking.timerlap1= '<input type=\"text\" value=\"\">';
			}
			
			
			
			//$('#table_rankings').bootstrapTable('refresh');
			reloadData();
			document.getElementById('edit_1').focus();
		}
		
	});
	
	
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
		htmlButtons += '<div class="col"><button disabled id="btn-bib-'+arrayRankingsAthletes[i].bib+'" type="button" style="width:45px;" onclick="clickButtonBib('+arrayRankingsAthletes[i].bib+')"';
		if(!isBibInMainStartRace(arrayRankingsAthletes[i].bib)){
			htmlButtons += 'class="btn btn-outline-warning bib-not-main-start" ';
		}else{
			htmlButtons += 'class="btn btn-outline-warning bib-main-start" ';
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

function keyPressedBibInput(ele) {
    if(event.key === 'Enter') {
		
		clickButtonBib(ele.value);
		ele.value = '';
    }
};

function clickButtonBib(_bib){
	
	if(document.getElementById('btn-bib-'+_bib) && !document.getElementById('btn-bib-'+_bib).disabled){
		console.log('click  bib n°'+_bib);
		listInsertedBib.push(_bib);
		document.getElementById("input-bib-info").innerHTML = listInsertedBib.join(", ");
		finishLapForBib(_bib);
	}else{
	}

};

function undoLastBibEntered(){
	//TODO/FIXME : manager team mate undo start if undo the first one
	var _bib = listInsertedBib.pop();
	document.getElementById("input-bib-info").innerHTML = listInsertedBib.join(", ");
	console.log("last inserted bib 2:"+_bib);
	var ranking = arrayRankingsAthletes.find((obj) => obj.bib === _bib.toString());
	console.log("ranking status: "+ranking.status);
	console.log("ranking endTimeLap1: "+ranking.endTimeLap1);
	console.log("ranking endTimeLap2: "+ranking.endTimeLap2);
	if(ranking.endTimeLap2 > 0 ){
		ranking.timerlap2 = runningAnimHtml;
		ranking.endTimeLap2 = 0;
		ranking.timersplit = '';
		cptAthleteOnFinishLine-=1;
	}
	else if (ranking.endTimeLap1 > 0){
		
		ranking.timerlap1 = runningAnimHtml;
		ranking.endTimeLap1 = 0;
		ranking.timerlap2 = '-';
		ranking.startTimeLap2 = 0;
		ranking.timersplit = '';
		if(ranking.status == StatusAthleteRace.DNF.toString()){
			cptAthleteOnFinishLine-=1;
		}
	}
	ranking.status = StatusAthleteRace.RACING.toString();
	
	//FIXMEMESi c'est une team et que première coureur, il faut ressetter son coéquipier qui part en 2e, sinon on fait rien au coéquipier
	if(ranking.team > 0 && ranking.endTimeLap1 > 0){
		//FIXME => doesnt work ??
		cptAthleteOnFinishLine-=1;
		var teammate = getTeamMate(ranking);
		teammate.timerlap2 = '-';
		teammate.startTimeLap2 = 0;
		teammate.timersplit = '';
		teammate.status = StatusAthleteRace.READY.toString();
			
		updateStyleBibFlag(_bib,teammate.bib,document.getElementById('undo-bib'));	
	}else{
		updateStyleBibFlag(_bib,null,document.getElementById('undo-bib'));	
	}
	updateStatusRaceInfosHTML();
	reloadData();

};


function dnsBib(event,_bib){
	event.preventDefault();
	console.log('dns bib :'+_bib+' this jquery:'+$(this));
	var ath = arrayRankingsAthletes.find((obj) => obj.bib === _bib.toString());
	if(ath.status == StatusAthleteRace.READY.toString()){
		updateStyleBibFlag(_bib,null,event.target);
		ath.status = StatusAthleteRace.DNS.toString();
		cptAthleteOnStartLine-=1;
		updateStatusRaceInfosHTML();
		
		reloadData();
	}else{
		alert('Seul un athlète pas encore parti peut être déclaré non partant');
	}
	
};
function dnfBib(event,_bib){
	var current = Date.now();
	event.preventDefault();
	console.log('dnf bib :'+_bib);
	
	var ath = arrayRankingsAthletes.find((obj) => obj.bib === _bib.toString());
	if(ath.status == StatusAthleteRace.RACING.toString()){
		
		listInsertedBib.push(_bib);
		document.getElementById("input-bib-info").innerHTML = listInsertedBib.join(", ");
		updateStyleBibFlag(_bib,null,event.target);
		
		ath.status = StatusAthleteRace.DNF.toString() ;
		if(ath.timerlap1.includes('spinner-border')){
			ath.endTimeLap1 = current;
			ath.timerlap1 = calculateTimer(ath.startTimeLap1,ath.endTimeLap1);
		}
		if(ath.timerlap2.includes('spinner-border')){
			ath.endTimeLap2 = current;
			ath.timerlap2 = calculateTimer(ath.startTimeLap2,ath.endTimeLap2);
		}
		cptAthleteOnFinishLine+=1;
		updateStatusRaceInfosHTML();
		reloadData();
	}else{
		alert('Seul un athlète en course peut abandonner');
	}
};

function startManualBib(event,_bib){
	event.preventDefault();
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
		//TODO: si partenaire pas arrivé, le départ n'est pas autorisé si partenaire est toujours en course
		//TODO: manager fun catégorie
		if(orderSettingLap==2 && running){
			if(ranking.cat != 'Fun' && getTeamMate(ranking).status === StatusAthleteRace.RACING.toString()){
				alert('Départ manuel interdit si le partenaire est toujours en course');
			}
			else{	
				if(ranking.status === StatusAthleteRace.READY.toString() || (ranking.status === StatusAthleteRace.RACING.toString()
					&& confirm("Réinitialiser le chrono pour ce coureur (dossard "+ranking.bib+") ?"))){
						//start timer for team mate startTimeLap2
						ranking.startTimeLap2 = current;
						ranking.timerlap2 = runningAnimHtml;
						ranking.status = StatusAthleteRace.RACING.toString() ;
						document.getElementById('btn-bib-'+ranking.bib).disabled = false;
						reloadData();
					}
			}
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
//for fun category, pass 2 same bibnumber for 2 first args
//FIXME: if undo DNF, style still the same red
function updateStyleBibFlag(_bib,_bibTeamMate,srcEvent){
	console.log('class list of btn :'+srcEvent.classList);
	
	var btnBib = document.getElementById('btn-bib-'+_bib);
	var btnBibTeamMate = document.getElementById('btn-bib-'+_bibTeamMate);
	console.log('update style for bib main : '+'btn-bib-'+_bib);
	console.log('update style for bib main : '+'btn-bib-'+_bibTeamMate);
	
	switch (srcEvent.id.substring(0,7)){
		case 'btn-bib':
			console.log('click on bib');
			if(_bibTeamMate){
				srcEvent.className = srcEvent.className.replace("btn-outline-warning","btn-success");
				//FIXME: check if second line required... not sure..
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
		case 'undo-bi':	
			if(_bibTeamMate){
				btnBib.className = btnBib.className.replace("btn-success","btn-outline-warning");
				//si team
				if(_bib !== _bibTeamMate){
					console.log('bib <> bibteammate undo');
					btnBibTeamMate.disabled = true;
				}
			}
			else{
				btnBib.className = btnBib.className.replace("btn-success","btn-outline-success");
				btnBib.className = btnBib.className.replace("btn-outline-success","btn-outline-warning");
				btnBib.className = btnBib.className.replace("btn-danger","btn-outline-warning");
			}
			//re-enable le button bib correspondante
			btnBib.disabled = false;
			
		
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
		updateStyleBibFlag(_bib,null,btnBib);
		console.log('finish solo');
		
		if(ranking.endTimeLap1 == 0){
			
			ranking.endTimeLap1 = current;
			ranking.timersplit = current;
			ranking.timerlap1 = calculateTimer(ranking.startTimeLap1,ranking.endTimeLap1);
			ranking.startTimeLap2 = current;
			ranking.timerlap2 = runningAnimHtml;
		}
		else{
			
			finishEventForBib(ranking,current);
		}
		
	}else if(ranking.cat === 'Fun'){
			updateStyleBibFlag(_bib,_bib,btnBib);
			if(ranking.startTimeLap1 != 0){
				ranking.endTimeLap1 = current;
				ranking.timersplit = current;
				ranking.timerlap1 = calculateTimer(ranking.startTimeLap1,ranking.endTimeLap1);
				
			}else if (ranking.startTimeLap2 != 0){
				ranking.endTimeLap2 = current;
				ranking.timersplit = current;
				ranking.timerlap2 = calculateTimer(ranking.startTimeLap2,ranking.endTimeLap2);
			}
			finishEventForBib(ranking,current);
			
	}
	//if ranking is a team mate
	else{
		console.log('finish team mate or fun');
		
		var rankingTeamMate = arrayRankingsAthletes.find((obj) => (obj.team === ranking.team) && (obj.bib != _bib.toString()));
		console.log('found team mate :'+JSON.stringify(rankingTeamMate));
		updateStyleBibFlag(_bib,rankingTeamMate.bib,btnBib);
		
		//var lapEventArray = lapsEventStrToArray(ranking.lapEvent);
		//var orderSettingLap = getOrderSettingForLapEvent(lapEventArray[0]);
		var orderSettingLap = getOrderSettingForLapEvent(ranking.lapEvent);
		console.log('ordre for lap to finish:'+orderSettingLap);
		if(orderSettingLap==1){
			ranking.endTimeLap1 = current;
			ranking.timersplit = current;
			ranking.timerlap1 = calculateTimer(ranking.startTimeLap1,ranking.endTimeLap1);
			ranking.status = StatusAthleteRace.FINISHED.toString() ;
			cptAthleteOnFinishLine+=1;
			updateStatusRaceInfosHTML();
			
			//start timer for team mate startTimeLap2
			//si il n'est pas ready, il ne faut pas le démarrer, peut etre déja parti car manual start ?
			if(rankingTeamMate.status === StatusAthleteRace.READY.toString()){
				//le split est aussi mis au co-équipier pour qu'il soit affiché en dessous dans le tableau
				rankingTeamMate.timersplit = current;
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
	//TODO order by  timertotal if defined , else timer2 if defined, else timer1
	console.log('-------------------------------------------------->>>>>>>>>>>>>>>>>> FINISH LAP for ranking');
	
	reloadData();
	$('#table_rankings').bootstrapTable('sortBy', {field: 'timersplit', sortOrder: 'desc'});
	
};


function finishEventForBib(_objRankAth, currentTime){
	if(_objRankAth.cat !== 'Fun'){
		_objRankAth.timersplit = currentTime;
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
	_objRankAth.timersplit = currentTime;
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

function getTeamMate(rankingObj){
 return arrayRankingsAthletes.find((obj) => (obj.team === rankingObj.team) && (obj.bib != rankingObj.bib.toString()));
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
	document.getElementById("input-bib").disabled = false;
	document.getElementById("undo-bib").disabled = false;
	document.getElementById("input-bib").focus();
	
	var bibs = document.getElementById("grid-bib").getElementsByClassName("bib-main-start");
	for(var i=0; i<bibs.length;i++){
		bibs[i].disabled = false;
	}
	
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
};
function resetRace(){
	
	for(var i in arrayRankingsAthletes){
		var bib = arrayRankingsAthletes[i].bib;
		if(arrayRankingsAthletes[i].status != StatusAthleteRace.DNS.toString()){
			arrayRankingsAthletes[i].timerlap1 = '-';
			arrayRankingsAthletes[i].timerlap2 = '-';
			arrayRankingsAthletes[i].startTimeLap1 = 0;
			arrayRankingsAthletes[i].endTimeLap1 = 0;
			arrayRankingsAthletes[i].startTimeLap2 = 0;
			arrayRankingsAthletes[i].endTimeLap2 = 0;
			arrayRankingsAthletes[i].timertotal = '-';
			arrayRankingsAthletes[i].timersplit = '-';
			arrayRankingsAthletes[i].status = StatusAthleteRace.READY.toString() ;
		}
	}
	cptAthleteOnFinishLine = 0;
	updateStatusRaceInfosHTML();
	listInsertedBib = [];
	document.getElementById("input-bib-info").innerHTML = "";
	
	renderBibButtonsHTML();
	reloadData();
	

	resetTimer();
};



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
	console.log('calculateTimer start:'+start+',end:'+end);
	var resultTime = end - start;
	var hours = Math.floor(resultTime / 3600000);
    var minutes = Math.floor((resultTime % 3600000) / 60000);
    var seconds = Math.floor((resultTime % 60000) / 1000);
	
	var formattedTime = formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);
	return formattedTime;
	
}

function calculateTimerAddition(time1,time2){
	
	var resultTime = chronoFormatToEpoch(time1)+chronoFormatToEpoch(time2);
	var hours = Math.floor(resultTime / 3600000);
    var minutes = Math.floor((resultTime % 3600000) / 60000);
    var seconds = Math.floor((resultTime % 60000) / 1000);
	
	var formattedTime = formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);
	return formattedTime;
}




function formatTime(time) {
	return time < 10 ? '0' + time : time;
}
