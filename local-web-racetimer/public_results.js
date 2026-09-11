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
const catVTT = new Set();
const catCAP = new Set();
const catTotal = new Set();

async function loadLatestResults() {

  let results_url = '../public_results/latest.json';
  if (location.protocol === 'file:') {
          results_url = './data_json/latest.json';
  }

  const response = await fetch(results_url);
  const data = await response.json();
  return data;
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



};

function generateColsDef(_setCategories) {
  console.log('generateColsDef:',[..._setCategories])
  //génération des définitions de colonnes pour la table, basé sur les catégories rencontrées ( catVTT Set)
  const columnsDefinition = [
    {
      title: '#',
      field: 'rang'
    }
  ];
  _setCategories.forEach(category => {
    columnsDefinition.push({
      title: `Catégorie ${category}`,
      field: `${category}_name`
    });
    columnsDefinition.push({
      title: 'Chrono',
      field: `${category}_chrono`
    });
    columnsDefinition.push({
      title: '',
      class: 'cat-separator'
    });
  });
  return columnsDefinition;
}

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
		//on ignore ceux qui n'ont pas de temps attribué pour le VTT
    if (dataAthletes[i].timerlap1 !== '-') {
      //on maintient une liste des catégories rencontrées en VTT
      catVTT.add(catCurrentAth);
			for(var j in catRankingsVTT){
				//si pas encore d'athlete de la categorie à rang j, on ajoute
				if(catRankingsVTT[j][catCurrentAth+"_chrono"] == undefined){
					catRankingsVTT[j][catCurrentAth+"_chrono"] = dataAthletes[i].timerlap1;
					catRankingsVTT[j][catCurrentAth+"_name"] = dataAthletes[i].name;
					break;
				}
			}
		}
  }

 	$('#table_rankings_vtt').bootstrapTable('destroy');
	$('#table_rankings_vtt').bootstrapTable({columns: generateColsDef(catVTT),data:catRankingsVTT, printStyles: ['https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css']});



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
    if (dataAthletes[i].timerlap2 !== '-') {
      //on maintient une liste des catégories rencontrées en CAP
      catCAP.add(catCurrentAth);
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
  console.log('GENERATE CAP........');
 	$('#table_rankings_cap').bootstrapTable('destroy');
	$('#table_rankings_cap').bootstrapTable({columns: generateColsDef(catCAP),data:catRankingsCAP, printStyles: ['https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css']});

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
    if (dataAthletes[i].timertotal !== '-') {
      //on maintient une liste des catégories rencontrées en total (trophée)
      catTotal.add(catCurrentAth);
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

  $('#table_rankings_total').bootstrapTable('destroy');
	$('#table_rankings_total').bootstrapTable({columns:generateColsDef(catTotal),data:catRankingsTotal, printStyles: ['https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css']});

};

/**
 * Events interactions
 */
window.addEventListener("load", (event) => {
  console.log('public_results:window.load');
  reloadData();
});

document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', () => {

        document.querySelector('.toggle-btn.active')?.classList.remove('active');
        button.classList.add('active');

        document.querySelectorAll('.toggle-content').forEach(div => {
            div.classList.add('d-none');
        });

        document.querySelector(button.dataset.target).classList.remove('d-none');
    });
});
