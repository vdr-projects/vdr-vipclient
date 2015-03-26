
function NewsInfo() {
   if (newssiteID > (newssite.length - 1)) { newssiteID = (newssite.length - 1) }
   if (newssiteID < 0) { newssiteID = 0 }

   var htmltext = "<h1 class=mainmenu" + cssres[css_nr][Set_Res] + ">";

   xmlhttp=new XMLHttpRequest();
   xmlhttp.open('GET',newssite[newssiteID],false);

   xmlhttp.send();
  try {
   xmlDoc=xmlhttp.responseXML; 
   htmltext += xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue;
   htmltext += "</h1><pre class=newsmenu" + cssres[css_nr][Set_Res] + ">\n";
   var x=xmlDoc.getElementsByTagName("item");

   if (newsID > x.length) { newsID = x.length }
   if (newsID > 9) { newsID = 9 }
   if (newsID < 0) { newsID = 0 }

   for (var i=0;i<x.length && i<10;i++) {
	 if (x.length !== 0) {
		if (i == newsID) {
			//hi light selection
			htmltext += "<span class=newsselect" + cssres[css_nr][Set_Res] + ">";
		} 
		htmltext += " \u0003 " + x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue + " \u0003 \n";
		if (i == newsID) {
			htmltext += "</span>";
		} 
	 } else { 
		htmltext += "\n";
	 }
	}
	htmltext += "<table class='center newsinfo" + cssres[css_nr][Set_Res] + "'><tr>";
	htmltext += "<th>";
	htmltext += xmlDoc.getElementsByTagName("item")[newsID].getElementsByTagName("description")[0].childNodes[0].nodeValue;
	htmltext += "</th></tr></table>";
	htmltext += "</pre>";
  } catch(e) {
   htmltext = "<h1 class=mainmenu" + cssres[css_nr][Set_Res] + "><pre>\n\n\n" + Lang[67] + "\n\n\n</pre></h1>";
  alert(e);
  }
	mainmenu.innerHTML = htmltext;
}



