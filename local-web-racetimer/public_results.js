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


async function loadLatestResults() {

  let results_url = '../public_results/latest.json';
  if (location.protocol === 'file:') {
          results_url = './data_json/latest.json';
  }

  const response = await fetch(results_url);
  const data = await response.json();
}

//charge les données stockés dans le fichier json (public_results/results_{timestamp}.json)
async function reloadData(){
  console.log('data initialization for results');

  dataAthletes = await loadLatestResults();

  console.log(dataAthletes);

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


window.addEventListener("load", (event) => {
  reloadData();
});
