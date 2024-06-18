const { jsPDF } = window.jspdf;

var categories = new LDB.Collection('categories');
var lapsEvent = new LDB.Collection('lapsEvent');
//TODO make it const to another file not loaded through dynamic routing...
var StatusAthleteRace = {
	DNS: "DNS",
	DNF: "DNF",
	READY: "ready",
	FINISHED: "finished",
	RACING: "racing"
};

function clearAllFormInputs(idFormElement){
	document.getElementById(idFormElement).reset();
};

function setupApplication(){
 //TODO: init discipline
 //TODO: init catégorie : team + function
 
	console.log('setup App...');
	initCategories();
	console.log('[SETUP] : Categories initialization done...');
	initLapEvents();
	console.log('[SETUP] : Events initialization done...');
};

function initCategories(){
	categories.drop();
	var items = [
		{
			desc: "Team",
			minYear: 1900,
			maxYear: 2100,
			custom: false
		},
		{
			desc: "Fun",
			minYear: 1900,
			maxYear: 2100,
			custom: false		
		},
		{
			desc: "A",
			minYear: 1992,
			maxYear: 2004,
			custom: true		
		},
		{
			desc: "S1",
			minYear: 1979,
			maxYear: 1991,
			custom: true			
		},
		{
			desc: "S2",
			minYear: 1950,
			maxYear: 1978,
			custom: true			
		},
		{
			desc: "D",
			minYear: 1900,
			maxYear: 2100,
			custom:false		
		},
		
	
	];

	categories.save(items, function(_items){
		 console.log('Default categories created:', _items);	
	});
};

function initLapEvents(){
	lapsEvent.drop();
	var items = [
		{	
			desc: 'VTT',
			order:  1,
			distance: 15
		},
		{	
			desc: 'Course à pied',
			order:  2,
			distance: 5
		},
	];

	lapsEvent.save(items, function(_items){
	  console.log('Default events created:', _items);	
	});
};