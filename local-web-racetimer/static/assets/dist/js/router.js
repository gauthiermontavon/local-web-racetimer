
const routeWhitelist = ["settings", "startlist", "race","results"];
var routeChange = function(){
	console.log('route to '+location.hash);
	var route = location.hash.substr(1);
	console.log('route to '+route);
	if (route === '') route = 'startlist';
	if (routeWhitelist.includes(route)) {
		fetch("./"+route+".html").then(response => {
			return response.text()
		})
		.then(data => {
			var target = document.getElementById("router-outlet");
			target.innerHTML = '';
			target.replaceChildren();
			target.innerHTML = data;
			var newScript = document.createElement("script");
			console.log('load script '+route+".js");
			newScript.src = "./"+route+".js";
			//once script injected is loaded, we can call method residing inside of it
			newScript.onload = function(){
				reloadData();
			}
			target.appendChild(newScript);
			
		
		});
	}
};

routeChange();