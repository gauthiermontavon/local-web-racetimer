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

function generatePublishResultsFilename() {
  const now = new Date();

  const pad = n => String(n).padStart(2, '0');

  const filename =
    `results_${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;
  return filename;
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
			minYear: 1994,
			maxYear: 2006,
			custom: true
		},
		{
			desc: "S1",
			minYear: 1981,
			maxYear: 1993,
			custom: true
		},
		{
			desc: "S2",
			minYear: 1950,
			maxYear: 1980,
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


function chronoFormatToEpoch(chrono){
	//var originalFormat = '01:02:03';

	// get todays date
	var time = new Date();

	// set the correct time
	var timeValues = chrono.split(':').map((element) => Number(element));
	time.setHours(timeValues[0], timeValues[1], timeValues[2]);
	console.log('correct time values:', time.toString());

	// get epoch value
	var epoch = time.valueOf();
	console.log('epoch:', epoch);
	return epoch;
}

//"settings", "startlist", "race","results"
function initMainMenu(_forRoute) {
  console.debug('INIT MAIN MENU'+_forRoute);
  switch (_forRoute) {
    case "startlist":
      document.getElementById("main-menu").removeAttribute("disabled");
      document.getElementById("main-link").removeAttribute("disabled");
      document.getElementById("race-menu").setAttribute("disabled",true);
      document.getElementById("results-menu").setAttribute("disabled", true);
      break;
    case "race":
      document.getElementById("main-menu").setAttribute("disabled",true);
      document.getElementById("main-link").setAttribute("disabled", true);

      break;
    case "results":
      document.getElementById("main-link").removeAttribute("disabled");
      document.getElementById("main-menu").removeAttribute("disabled");

      document.getElementById("startlist-menu").removeAttribute("disabled");
      document.getElementById("race-menu").removeAttribute("disabled");
      document.getElementById("results-menu").removeAttribute("disabled");
      document.getElementById("settings-menu").removeAttribute("disabled");

      break;
    case "settings":
      document.getElementById("main-link").removeAttribute("disabled");
      document.getElementById("main-menu").removeAttribute("disabled");

      document.getElementById("startlist-menu").removeAttribute("disabled");
      document.getElementById("race-menu").removeAttribute("disabled");
      document.getElementById("results-menu").removeAttribute("disabled");
      document.getElementById("settings-menu").removeAttribute("disabled");

      break;

  }
};
