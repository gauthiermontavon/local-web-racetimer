var categories = new LDB.Collection('categories');
var lapsEvent = new LDB.Collection('lapsEvent');

var dataCat = [];
categories.find({}, function(results){
	dataCat = results;
});

var dataLap = [];
lapsEvent.find({}, function(results){
	dataLap = results;
});


var deleteCatButton = '<button onclick="deleteCategory(\'$id$\');return false;" type="button" class="btn btn-outline-danger"><svg class="bi"><use xlink:href="#trash"/></svg>Supprimer</button>';

var deleteLapButton = '<button onclick="deleteLapEvent(\'$id$\');return false;" type="button" class="btn btn-outline-danger"><svg class="bi"><use xlink:href="#trash"/></svg>Supprimer</button>';

function reloadData(){
	populateDataPage();
}
//function must be there if page contains dynamic data (implement interface)
function populateDataPage(){
	console.log('populate for settings.html, doesnt nothing only to avoid error');

};
function populateDataCategories(){
	var table = "" ;
 
		for(var i in dataCat){
			
			
			console.log('category id db:'+dataCat[i]._id);
			table += "<tr>";
			table += "<td>"+i+"</td>" 
					+ "<td>" + dataCat[i].desc +"</td>" 
					+ "<td>" + dataCat[i].minYear +"</td>" 
					+ "<td>" + dataCat[i].maxYear +"</td>"
					+ "<td>" + deleteCatButton.replace("$id$",dataCat[i]._id)+"</td>";
			table += "</tr>";
		}
 
	document.getElementById("catList-data").innerHTML = table;
 
};
function populateDataLapsEvent(){
	var table = "" ;
 
		for(var i in dataLap){
			table += "<tr>";
			table += "<td>"+i+"</td>" 
					+ "<td>" + dataLap[i].desc +"</td>" 
					+ "<td>" + dataLap[i].distance +"</td>" 
					+ "<td>" + deleteLapButton.replace("$id$",dataLap[i]._id)+"</td>";
			table += "</tr>";
		}
	document.getElementById("lapEventList-data").innerHTML = table;
 
};


function addCategory(){

	var formdata = new FormData(document.getElementById("form-category"));
	var category = {
	  desc: formdata.getAll("description"),
	  minYear: formdata.getAll("yearMin"),
	  maxYear: formdata.getAll("yearMax")
	  
	};

	categories.save(category, function(_category){
	  console.log('New cat:', _category);
		categories.find({}, function(results){
			dataCat = results;
			populateDataCategories();
			clearAllFormInputs("form-category");
		});
	});
};

function deleteCategory(_id){
	console.log('delete category with id:'+_id);

	categories.find({ _id: _id }, function(items){
		for(var i in items){
			items[i].delete();
		}
	});
	categories.find({ }, function(items){
			dataCat = items;
	});

	populateDataCategories();

	
};

function addLapEvent(){

	var formdata = new FormData(document.getElementById("form-lapEvent"));
	var lapEvent = {
	  desc: formdata.getAll("description"),
	  distance: formdata.getAll("distance") 
	};

	lapsEvent.save(lapEvent, function(_lap){
	  console.log('New lap envet:', _lap);
		lapsEvent.find({}, function(results){
			dataLap = results;
			populateDataLapsEvent();
			clearAllFormInputs("form-lapEvent");
		});
	});
};

function deleteLapEvent(_id){
	console.log('delete lapevent with id:'+_id);

	lapsEvent.find({ _id: _id }, function(items){
	for(var i in items){
		items[i].delete();
	}
	lapsEvent.find({ }, function(items){
		dataLap = items;
	});

	populateDataLapsEvent();
	});
	
};
