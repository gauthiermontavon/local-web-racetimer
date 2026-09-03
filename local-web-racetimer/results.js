var catRankingsVTT = [
	{"rang":"1"},
	{"rang":"2"},
	{"rang":"3"},
	{"rang":"4"},
	{"rang":"5"},
	{"rang":"6"},
	{"rang":"7"},
	{"rang":"8"},
	{"rang":"9"},
	{"rang":"10"},
	{"rang":"11"},
	{"rang":"12"},
	{"rang":"13"},
	{"rang":"14"},
	{"rang":"15"}
];

var catRankingsCAP = [
	{"rang":"1"},
	{"rang":"2"},
	{"rang":"3"},
	{"rang":"4"},
	{"rang":"5"},
	{"rang":"6"},
	{"rang":"7"},
	{"rang":"8"},
	{"rang":"9"},
	{"rang":"10"},
	{"rang":"11"},
	{"rang":"12"},
	{"rang":"13"},
	{"rang":"14"},
	{"rang":"15"}
];

var catRankingsTotal = [
	{"rang":"1"},
	{"rang":"2"},
	{"rang":"3"},
	{"rang":"4"},
	{"rang":"5"},
	{"rang":"6"},
	{"rang":"7"},
	{"rang":"8"},
	{"rang":"9"},
	{"rang":"10"},
	{"rang":"11"},
	{"rang":"12"},
	{"rang":"13"},
	{"rang":"14"},
	{"rang":"15"}
];

var dataAthletes = [];
var dataCat = [];

var athletesColl = new LDB.Collection('athletes');
var categories = new LDB.Collection('categories');

var pdfdataCatMap = new Map();

function reloadData(){

	console.log('data initialization for results');
	athletesColl.find({}, function(results){
		dataAthletes = results;
	});
	console.log('vtt rankings before init:'+JSON.stringify(catRankingsVTT));
	fillCatRankingsVTT();
	fillCatRankingsCAP();
	fillCatRankingsTotal();

	//console.log('JSON:'+JSON.stringify(dataAthletes));
	console.log('vtt rankings after:'+JSON.stringify(catRankingsVTT));
	$('#table_rankings').bootstrapTable('destroy');
	$('#table_rankings').bootstrapTable({data:dataAthletes, printStyles: ['https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css']});

	$('#table_rankings_vtt').bootstrapTable('destroy');
	$('#table_rankings_vtt').bootstrapTable({data:catRankingsVTT, printStyles: ['https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css']});

	$('#table_rankings_cap').bootstrapTable('destroy');
	$('#table_rankings_cap').bootstrapTable({data:catRankingsCAP, printStyles: ['https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css']});

	$('#table_rankings_total').bootstrapTable('destroy');
	$('#table_rankings_total').bootstrapTable({data:catRankingsTotal, printStyles: ['https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css']});

	init();
};

function fillCatRankingsVTT(){
	//classement VTT - timerlap1
	//dataAthletes = dataAthletes.sort((a,b) => a["timerlap1"] - b["timerlap1"]);
	dataAthletes = dataAthletes.sort(function(a,b){
		let x = a.timerlap1.toLowerCase();
		let y = b.timerlap1.toLowerCase();
		if (x < y) {return -1;}
		if (x > y) {return 1;}
		return 0;
	});
	for(var i in dataAthletes){
		console.log(dataAthletes[i].timerlap1);
	}
	for(var i in dataAthletes){
		var catCurrentAth = dataAthletes[i].cat;
		console.log("cat for athlete:"+dataAthletes[i].cat);
		//on ignore ceux qui n'ont pas de temps attribué
		if(dataAthletes[i].timerlap1 !== '-'){
			for(var j in catRankingsVTT){
				//si pas encore d'athlete de la categorie, on ajoute
				if(catRankingsVTT[j][catCurrentAth+"_chrono"] == undefined){
					catRankingsVTT[j][catCurrentAth+"_chrono"] = dataAthletes[i].timerlap1;
					catRankingsVTT[j][catCurrentAth+"_name"] = dataAthletes[i].name;
					break;
				}
			}
		}
	}
};

function fillCatRankingsCAP(){
	//classement CAP - timerlap2

	dataAthletes = dataAthletes.sort(function(a,b){
		let x = a.timerlap2.toLowerCase();
		let y = b.timerlap2.toLowerCase();
		if (x < y) {return -1;}
		if (x > y) {return 1;}
		return 0;
	});

	for(var i in dataAthletes){
		var catCurrentAth = dataAthletes[i].cat;
		console.log("cat for athlete:"+dataAthletes[i].cat);
		//on ignore ceux qui n'ont pas de temps attribué
		if(dataAthletes[i].timerlap2 !== '-'){
			for(var j in catRankingsCAP){
				//si pas encore d'athlete de la categorie, on ajoute
				if(catRankingsCAP[j][catCurrentAth+"_chrono"] == undefined){
					catRankingsCAP[j][catCurrentAth+"_chrono"] = dataAthletes[i].timerlap2;
					catRankingsCAP[j][catCurrentAth+"_name"] = dataAthletes[i].name;
					break;
				}
			}
		}
	}
};
function fillCatRankingsTotal(){
	//classement Total - timertotal
	dataAthletes = dataAthletes.sort(function(a,b){
		let x = a.timertotal.toLowerCase();
		let y = b.timertotal.toLowerCase();
		if (x < y) {return -1;}
		if (x > y) {return 1;}
		return 0;
	});
	for(var i in dataAthletes){
		console.log(dataAthletes[i].timertotal);
	}
	for(var i in dataAthletes){
		var catCurrentAth = dataAthletes[i].cat;
		console.log("cat for athlete:"+dataAthletes[i].cat);
		//on ignore ceux qui n'ont pas de temps attribué
		if(dataAthletes[i].timertotal !== '-'){
			for(var j in catRankingsTotal){
				//si pas encore d'athlete de la categorie, on ajoute
				if(catRankingsTotal[j][catCurrentAth+"_chrono"] == undefined){
					catRankingsTotal[j][catCurrentAth+"_chrono"] = dataAthletes[i].timertotal;
					catRankingsTotal[j][catCurrentAth+"_name"] = dataAthletes[i].name;
					break;
				}
			}
		}
	}
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
  console.log("EXPORT local STORAGE ------------------");
	 console.log(JSON.stringify(localStorage));
		//TODO: publish
		localStorage.clear();

		localStorage.setItem('LocalDB_athletes','[{\"__collection\":\"athletes\",\"bib\":\"1\",\"name\":[\"MONTAVON Gauthier\"],\"year\":[\"1983\"],\"cat\":\"S1\",\"team\":0,\"lapEvent\":\"VTT, Course à pied\",\"timerlap1\":\"00:00:03\",\"timerlap2\":\"00:00:00\",\"timertotal\":\"00:00:04\",\"ranked\":\"true\",\"_id\":\"548d0ec9178826199972576e4\"},{\"__collection\":\"athletes\",\"bib\":\"2\",\"name\":[\"SCHNEIDER Davie\"],\"year\":[\"1981\"],\"cat\":\"S1\",\"team\":0,\"lapEvent\":\"VTT, Course à pied\",\"timerlap1\":\"00:00:04\",\"timerlap2\":\"00:00:02\",\"timertotal\":\"00:00:06\",\"ranked\":\"true\",\"_id\":\"a3942b5717882620100964cab\"},{\"__collection\":\"athletes\",\"bib\":\"3\",\"name\":[\"GREINER Arthur\"],\"year\":[\"2005\"],\"cat\":\"A\",\"team\":0,\"lapEvent\":\"VTT, Course à pied\",\"timerlap1\":\"00:00:02\",\"timerlap2\":\"00:00:01\",\"timertotal\":\"00:00:04\",\"ranked\":\"true\",\"_id\":\"af69c4a717882620303740b70\"},{\"__collection\":\"athletes\",\"bib\":\"4\",\"name\":[\"TARBY Fx\"],\"year\":[\"1975\"],\"cat\":\"S2\",\"team\":0,\"lapEvent\":\"VTT, Course à pied\",\"timerlap1\":\"00:00:02\",\"timerlap2\":\"00:00:00\",\"timertotal\":\"00:00:03\",\"ranked\":\"true\",\"_id\":\"85685f381788262039004b29e\"},{\"__collection\":\"athletes\",\"bib\":\"5\",\"name\":[\"FRICHE Fabrice\"],\"year\":[\"1985\"],\"cat\":\"Team\",\"team\":1,\"lapEvent\":[\"VTT\"],\"timerlap1\":\"00:00:07\",\"timerlap2\":\"-\",\"timertotal\":\"00:00:07\",\"ranked\":\"true\",\"_id\":\"3aee95da17882620759095f38\"},{\"__collection\":\"athletes\",\"bib\":\"6\",\"name\":[\"EMERY Charline\"],\"year\":[\"2000\"],\"cat\":\"Team\",\"team\":1,\"lapEvent\":[\"Course à pied\"],\"timerlap1\":\"-\",\"timerlap2\":\"00:00:00\",\"timertotal\":\"00:00:07\",\"ranked\":\"true\",\"_id\":\"ca25308c17882620759097eaa\"},{\"__collection\":\"athletes\",\"bib\":\"7\",\"name\":[\"JULMY Christophe\"],\"year\":[\"\"],\"cat\":\"Team\",\"team\":2,\"lapEvent\":[\"VTT\"],\"timerlap1\":\"00:00:05\",\"timerlap2\":\"-\",\"timertotal\":\"00:00:08\",\"ranked\":\"true\",\"_id\":\"f055d5f7178826209602377f5\"},{\"__collection\":\"athletes\",\"bib\":\"8\",\"name\":[\"PILLOUD Manu\"],\"year\":[\"\"],\"cat\":\"Team\",\"team\":2,\"lapEvent\":[\"Course à pied\"],\"timerlap1\":\"-\",\"timerlap2\":\"00:00:03\",\"timertotal\":\"00:00:08\",\"ranked\":\"true\",\"_id\":\"572b157517882620960237a7e\"}]');

		localStorage.setItem('LocalDB_categories','[{\"__collection\":\"categories\",\"desc\":\"Team\",\"minYear\":1900,\"maxYear\":2100,\"custom\":false,\"_id\":\"f5887f3517882704122145cb9\"},{\"__collection\":\"categories\",\"desc\":\"Fun\",\"minYear\":1900,\"maxYear\":2100,\"custom\":false,\"_id\":\"298841111788270412214d328\"},{\"__collection\":\"categories\",\"desc\":\"A\",\"minYear\":1994,\"maxYear\":2006,\"custom\":true,\"_id\":\"8f28832a1788270412214493c\"},{\"__collection\":\"categories\",\"desc\":\"S1\",\"minYear\":1981,\"maxYear\":1993,\"custom\":true,\"_id\":\"928197b61788270412214f1c9\"},{\"__collection\":\"categories\",\"desc\":\"S2\",\"minYear\":1950,\"maxYear\":1980,\"custom\":true,\"_id\":\"9f3718cc1788270412214bc99\"},{\"__collection\":\"categories\",\"desc\":\"D\",\"minYear\":1900,\"maxYear\":2100,\"custom\":false,\"_id\":\"c9e1678d17882704122146109\"}]');
};


function printResults(){

	 var printDate = new Intl.DateTimeFormat('fr-CH', {
    dateStyle: 'long'
  }).format(new Date());
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
	doc.setFontSize(16);
	doc.text("Cigathlon du "+printDate,120,10);
	doc.setFontSize(10);
	doc.text("Classement  VTT",130,20);

	doc.table(10, 25, formatDataForRanking("timerlap1"), headersCategories, { autoSize: true, fontSize:6 });
	doc.setFontSize(10);
	doc.text("Classement course à pied",130,100);

	doc.table(10, 120, formatDataForRanking("timerlap2"), headersCategories, { autoSize: true, fontSize:6 });

	doc.save("two-by-four.pdf");
};


//parameter timerlap = timerlap1/timerlap2/timertotal
function formatDataForRanking(timerlap){
	//order by timer
	console.log("pdfdataCatMap:"+JSON.stringify(pdfdataCatMap));

	dataAthletes = dataAthletes.sort((a,b) => a[timerlap] - b[timerlap]);


	//push each athlete according to his category = pdfdataCatMap("team")[0] : first athlete of team
	for(var i in dataAthletes){
		console.log("push athlete into category "+dataAthletes[i].cat+":"+JSON.stringify(dataAthletes[i]));
		if(dataAthletes[i][timerlap] === '-'){
			console.log('no because no timer for this lap');
		}else{
			pdfdataCatMap.get(dataAthletes[i].cat).push(dataAthletes[i]);
		}
	}

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
				data["rang_"+dataCat[i].desc] = rang.toString();
				data["cat_"+dataCat[i].desc] = athlete.name;
				data["chrono_"+dataCat[i].desc] = athlete[timerlap];
			}
			else{
				data["rang_"+dataCat[i].desc] = rang.toString();
				data["cat_"+dataCat[i].desc] = " ";
				data["chrono_"+dataCat[i].desc] = " ";
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
