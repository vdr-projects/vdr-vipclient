function WeatherInfo() {

//weather
//http://www.latlong.net/
// find long lan
//
//

var lat=52.41;
var lon=6.61;

   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET","http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&mode=xml&units=metric&lang=nl",false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
	var htmltext = "<h1 class=mainmenu" + cssres[css_nr][Set_Res] + ">" + " Current Weather </h1><pre class=mainmenu" + cssres[css_nr][Set_Res] +">";
	htmltext += "  Plaats      : " + xmlDoc.getElementsByTagName("city")[0].getAttribute("name") + ",";
	htmltext += xmlDoc.getElementsByTagName("country")[0].childNodes[0].nodeValue + "\n";
	htmltext += "  Temperatuur : " + Math.round(xmlDoc.getElementsByTagName("temperature")[0].getAttribute("value")*10)/10; 
	htmltext += " " + xmlDoc.getElementsByTagName("temperature")[0].getAttribute("unit") + "\n";
	htmltext += "  Min/Max     : " + xmlDoc.getElementsByTagName("temperature")[0].getAttribute("min") + "/";
	htmltext += xmlDoc.getElementsByTagName("temperature")[0].getAttribute("max");
	htmltext += " " + xmlDoc.getElementsByTagName("temperature")[0].getAttribute("unit") + "\n";
	htmltext += "  Luchtvochth : " + xmlDoc.getElementsByTagName("humidity")[0].getAttribute("value");
	htmltext += xmlDoc.getElementsByTagName("humidity")[0].getAttribute("unit") + "\n";
	htmltext += "  Wind        : " + xmlDoc.getElementsByTagName("speed")[0].getAttribute("value") + " m/s, ";
	htmltext += xmlDoc.getElementsByTagName("direction")[0].getAttribute("name") + "\n";
	htmltext += "  Bewolking   : " + xmlDoc.getElementsByTagName("clouds")[0].getAttribute("value") + "%\n";
	htmltext += "\n  Update      : " + xmlDoc.getElementsByTagName("lastupdate")[0].getAttribute("value") + "\n";
	htmltext += "</pre>";
	mainmenu.innerHTML = htmltext;

}
