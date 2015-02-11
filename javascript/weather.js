function WeatherInfo_current() {

   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET","http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&type=accurate&mode=xml&units=metric",false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
	htmltext = "<h1 class=mainmenu" + cssres[css_nr][Set_Res] + ">" + " Current Weather </h1><pre class=mainmenu" + cssres[css_nr][Set_Res] +">";
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

function WeatherInfo() {

   var htmltext = "<h1 class=mainmenu" + cssres[css_nr][Set_Res] + "> Weather Forecast </h1>";
   htmltext += "\n\n"

   xmlhttp=new XMLHttpRequest();
   xmlhttp.open('GET','http://api.openweathermap.org/data/2.5/forecast/daily?q=' + city + '&type=accurate&mode=xml&units=metric&cnt=7',false);
   xmlhttp.send();
  try {
   xmlDoc=xmlhttp.responseXML; 
   var x=xmlDoc.getElementsByTagName("time");

   htmltext += "<table class='center weather" + cssres[css_nr][Set_Res] + "'><tr>";

   var date = new Date();
   var y = date.getDay();
   for (var i=0;i<x.length;i++) {
	htmltext += "<th>" + days[y] + "</th>";
	y++;if (y > 6) {y = 0} ;
	}
   htmltext += "</tr>";

   htmltext += "<tr>";

   for (var i=0;i<x.length;i++) {
	htmltext += "<th>" + x[i].getAttribute('day') + "</th>";
	}
   htmltext += "</tr>";

   htmltext += "<tr>";
   for (var i=0;i<x.length;i++) {
	htmltext += "<th><img class='imgsize" + cssres[css_nr][Set_Res] + "' src='http://openweathermap.org/img/w/" + x[i].getElementsByTagName("symbol")[0].getAttribute('var') + ".png' /></th>";
	}
   htmltext += "</tr>";

   htmltext += "<tr>";
   for (var i=0;i<x.length;i++) {
	htmltext += "<th> " + Lang[100] + x[i].getElementsByTagName("temperature")[0].getAttribute('day') + "</th>";
	}
   htmltext += "</tr>";

   htmltext += "<tr>";
   for (var i=0;i<x.length;i++) {
	htmltext += "<th> " + Lang[101] + x[i].getElementsByTagName("temperature")[0].getAttribute('night') + "</th>";
	}
   htmltext += "</tr>";

   htmltext += "<tr>";
   for (var i=0;i<x.length;i++) {
	htmltext += "<th>";
	if (x[i].getElementsByTagName("precipitation")[0].getAttribute('value')) {
		htmltext += x[i].getElementsByTagName("precipitation")[0].getAttribute('value');
		htmltext += " mm " + x[i].getElementsByTagName("precipitation")[0].getAttribute('type') + "</th>";
	}
	htmltext += "</th>";
   }
   htmltext += "</tr>";

   htmltext += "<tr>";
   for (var i=0;i<x.length;i++) {
	htmltext += "<th> " + Lang[102] + x[i].getElementsByTagName("windDirection")[0].getAttribute('code');
	htmltext += "<br> " + x[i].getElementsByTagName("windSpeed")[0].getAttribute('mps') + " m/s </th>";
	}
   htmltext += "</tr>";

   htmltext += "</table><br><br>";

   var x=xmlDoc.getElementsByTagName("location");
   htmltext += "<table class='center weather" + cssres[css_nr][Set_Res] + "'><tr>";
   htmltext += "<th>";
   htmltext += Lang[103];
   htmltext += "</th><th> : ";
   htmltext += x[0].getElementsByTagName("name")[0].childNodes[0].nodeValue;
   htmltext += "," + x[0].getElementsByTagName("country")[0].childNodes[0].nodeValue;
   htmltext += "</th></tr><tr><th>";
   htmltext += Lang[104];
   htmltext += "</th><th> : ";
   htmltext += x[0].getElementsByTagName("location")[0].getAttribute('latitude');
   htmltext += "</th></tr><tr><th>";
   htmltext += Lang[105];
   htmltext += "</th><th> : ";
   htmltext += x[0].getElementsByTagName("location")[0].getAttribute('longitude');
   htmltext += "</th></tr><tr><th>";
   htmltext += Lang[106];
   htmltext += "</th><th> : ";
   htmltext += Right(xmlDoc.getElementsByTagName("sun")[0].getAttribute('rise'),8);
   htmltext += "</th></tr><tr><th>";
   htmltext += Lang[107];
   htmltext += "</th><th> : ";
   htmltext += Right(xmlDoc.getElementsByTagName("sun")[0].getAttribute('set'),8);
   htmltext += "</th></tr></table>";

  } catch(e) {
   htmltext = "<h1 class=mainmenu" + cssres[css_nr][Set_Res] + "><pre>\n\n\n" + Lang[67] + "\n\n\n</pre></h1>";
  alert(e);
  }

	mainmenu.innerHTML = htmltext;

}


