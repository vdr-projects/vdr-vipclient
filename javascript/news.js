
function NewsInfo() {
   var htmltext = "<h1 class=mainmenu" + cssres[css_nr][Set_Res] + ">";

   xmlhttp=new XMLHttpRequest();
   xmlhttp.open('GET',newssite[newssiteID],false);

   xmlhttp.send();
  try {
   xmlDoc=xmlhttp.responseXML; 
   htmltext += xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue;
   htmltext += "</h1><pre class=newsmenu" + cssres[css_nr][Set_Res] + ">\n";
   var x=xmlDoc.getElementsByTagName("item");
   for (var i=0;i<x.length && i<10;i++) {
	 if (x.length !== 0) {
		if (i !== 0) {
			htmltext += " \u0003 " + i; 
		} else {
			htmltext += " \u0003 - ";
		} 
		htmltext += " \u0003 " + x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue + " \u0003 \n";
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



