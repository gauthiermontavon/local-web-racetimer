
var dataAthletes = [];
var dataCat = [];

var athletesColl = new LDB.Collection('athletes');
var lapsRaceColl = new LDB.Collection('lapsRace');
var lapsEventColl = new LDB.Collection('lapsEvent');

var categories = new LDB.Collection('categories');
var pdfdataCatMap = new Map();

function reloadData(){
	
	console.log('data initialization for results');
	athletesColl.find({}, function(results){
		dataAthletes = results;
	});

	console.log('JSON:'+JSON.stringify(dataAthletes));
	$('#table_rankings').bootstrapTable('destroy');
	$('#table_rankings').bootstrapTable({data:dataAthletes});
	
	init();
};

function init(){
	console.log('INIT');
	pdfdataCatMap.clear();
	categories.find({}, function(results){
		console.log('JSON categori init for results:'+JSON.stringify(results));
		dataCat = results;
		//Initialise empty arrays for each categories in the map used to displaying in PDF
		for(var i in dataCat){
			console.log('CAT DESC:'+dataCat[i].desc);
			 pdfdataCatMap.set(dataCat[i].desc,new Array());	 
		}
		
		console.log("pdfdataCatMap_2:"+JSON.stringify(pdfdataCatMap));
	});
	
};


function printResults(){
	/*const doc = new jsPDF({
	  orientation: "landscape",
	  unit: "in",
	  format: [4, 2]
	});

	doc.text("Hello world!", 1, 1);
	doc.save("two-by-four.pdf");
	*/
	//
	var headersCategories = createHeaders([
	  "rang_A",
	  "cat_A",
	  "chrono_A",
	  "rang_S1",
	  "cat_S1",
	  "chrono_S1",
	  "rang_S2",
	  "cat_S2",
	  "chrono_S2",
	  "rang_D",
	  "cat_D",
	  "chrono_D",
	  "rang_Team",
	  "cat_Team",
	  "chrono_Team",
	]);

	var headersScratch = createHeaders([
	  "rang",
	  "athlete",
	  "chrono"
	]);
	//generatedata => formatDataForRankingVTT();
	var doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });

	doc.table(1, 1, formatDataForRankingVTT(), headersCategories, { autoSize: true });
	
	doc.save("two-by-four.pdf");
};


//var formatDataForRankingVTT = function() {
function formatDataForRankingVTT(){
	//order by timer VTT (timerlap1)
	console.log("pdfdataCatMap:"+JSON.stringify(pdfdataCatMap));
	dataAthletes = dataAthletes.sort((a,b) => a.timerlap1 - b.timerlap1);
	//push each athlete according to his category = pdfdataCatMap("team")[0] : first athlete of team
	for(var i in dataAthletes){
		console.log("push athlete into category "+dataAthletes[i].cat+":"+JSON.stringify(dataAthletes[i]));
		if(dataAthletes[i].timerlap1 === '-'){
			console.log('no because no timer for VTT');
		}else{
			pdfdataCatMap.get(dataAthletes[i].cat).push(dataAthletes[i]);
		}
	} 
	
	/*
	var data = {
		rang_A:,
		cat_A:,
		chrono_A:,
		rang_S1:,
		cat_S1:,
		chrono_S1:,
		rang_S2:,
		cat_S2:,
		chrono_S2:,
		rang_D:,
		cat_D:,
		chrono_D:,
		rang_Team:,
		cat_Team:,
		chrono_Team:
	};
	*/
	
	var result = [];
	var data = {};
	var processingResult = true;
	var rang = 1;
	while(processingResult){
		var somebodyAtRang = false;
		data = {};
		for(var i in dataCat){
			//Si il y a quelque pour cette catégorie au rang courant
			var athlete = pdfdataCatMap.get(dataCat[i].desc)[rang-1];
			console.log('PRINT PROCESS ['+dataCat[i].desc+']rang '+rang);
			console.log('athlete found:'+athlete);
			if(athlete){
				somebodyAtRang = true;
				data["rang_"+dataCat[i].desc] = rang;
				data["cat_"+dataCat[i].desc] = athlete.name;
				data["chrono_"+dataCat[i].desc] = athlete.timerlap1;
			}
			else{
				data["rang_"+dataCat[i].desc] = rang;
				data["cat_"+dataCat[i].desc] = "";
				data["chrono_"+dataCat[i].desc] = "";
			}
			
		}
		
		processingResult = somebodyAtRang;
		//Si personne n'est trouvé. on ajoute pas la ligne et le traitement du classement se termine
		if(somebodyAtRang){
			console.log('ADD data to result, data:'+JSON.stringify(data));
			result.push(data);
		}
		rang++;
		
	}
	return result;
};

function createHeaders(keys) {
  var result = [];
  for (var i = 0; i < keys.length; i += 1) {
    result.push({
      id: keys[i],
      name: keys[i],
      prompt: keys[i],
      width: 65,
      align: "center",
      padding: 0
    });
  }
  return result;
};
