//
// Javascript VDR client for Motorola VIP19x0 & VIP19x3
//
// Martin Voerman Rekordc@gmail.com
//
// TODO 
//
// Sound mapping for AC3
// auto epg switch language for EIT Cache
// 
// make VDR connection
// 	get/set/create/edit timers
// 	make/view recordings
//
// Mainmenu
// set/save changes to cfg.custom.xxx
//	 change IP server
//

var Version = "0.10	2012/12/xx"
var nrChannels = channels.length;
var nrMedia = recording.length - 1;


function onLoad() {
  document.addEventListener("keydown", onKeyDown, false);
  video = document.getElementById("videoplane");
	createPlayer();
        getBoxSize();
	embedTeletextElement();
	toi.audioOutputService.setVolume(AudioOut, StartVolume);
	toi.audioOutputService.setMuteState(AudioOut, false);
	showDisplay((currChan.toString()), false, 100, 0 );
	play(channels[currChan]);
	eitCache = toi.dvbEitService.createInstance();
	eitCache.setFilterMode(eitCache.FILTER_MODE_PF_AND_SCHEDULE);
//	eitCache.setFilterMode(eitCache.FILTER_MODE_PF_ONLY);
	eitCache.addEventListener(eitCache.ON_CACHE_UPDATED, onCacheUpdated);
	FullScreen();
	showOSD();
}


function onUnload() {
  try {
    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) {
      mediaPlayer.close();
      alert("Has closed.");
    }
    mediaPlayer.releaseInstance();
    mediaPlayer = null;

    document.removeEventListener("keydown", onKeyDown, false);
  }
  catch (e) {
    alert("onUnload error:" + e);
  }
}

function getBoxSize() {
   var w=videoWidth;
   var h=videoHeight;
   //get the screen size from viewBox object.
   var viewboxstring = document.documentElement.getAttributeNS(null, "viewBox");
   if (null != viewboxstring && "" != viewboxstring) {
      var vbArray = viewboxstring.split(" ");
      if (vbArray.length >= 4) {
         w=vbArray[2];
         h=vbArray[3];
      }
   }
	videoWidth = w;
	videoHeight = h;
}


function incChan(step) {
    currChan = currChan + step;
    if (currChan == nrChannels) {
        currChan = 1;
    }
}

function decChan(step) {
    currChan = currChan - step;
    if (currChan == 0) {
        currChan = nrChannels - 1;
    }
}

function createPlayer() {
  try {
    mediaPlayer = toi.mediaService.createPlayerInstance();
  } catch(e) {
    alert("Failed creating player: " + e);
  }
}

function play(uri) {
  try {
    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) {
      mediaPlayer.close();
    }
    uri = ServerAdres + uri;
    mediaPlayer.open(uri);
    mediaPlayer.play(1000);
	if(isFullscreen) {
	showOSD();
	}
	showDisplay((currChan.toString()), false, 100, 0 );
  } catch (e) {
    alert("Failed opening stream: " + e);
    return;
  }
}

function preview(urip) {
	if(SwitchGuide) {
	play(urip);
	}
	showChannelList();
	if (isSchedule) {
	GetSchedule(currChan,10);
	}
}


function FullScreen() {

    video.setAttribute("overlay","500");
    video.setAttribute("x", "0");
    video.setAttribute("y", "0");
    video.setAttribute("width", videoWidth);
    video.setAttribute("heigth", videoHeight);
    alert ("Display :" + videoWidth + "x" + videoHeight);
}


function onKeyDown(event) {
    if(isVisible) {
 	onKeyTeletext(event.keyIdentifier);
    } else if(isMediaMenu) {
	onKeyMedia(event.keyIdentifier);
    } else if(isSetupMenu) {
	onKeyMenu(event.keyIdentifier);
    } else {

    switch(event.keyIdentifier) {
    case "Up":
	if(isFullscreen) {
		count = 0;
		prevChan = currChan;
		do
		{
		        incChan(1);
		}
		while (!channels[currChan]);
	        play(channels[currChan]);
	} else {
	// swap up <> down in guide mode
		count = 0;
		do
		{
		        decChan(1);
		}
		while (!channels[currChan]);
	        preview(channels[currChan]);
	}
        break;
    case "Down":
	if(isFullscreen) {
		count = 0;
		prevChan = currChan;
		do
		{
		        decChan(1);
		}
		while (!channels[currChan]);
	        play(channels[currChan]);
	} else {
	// swap up <> down in guide mode
		count = 0;
		do
		{
		        incChan(1);
		}
		while (!channels[currChan]);
	        preview(channels[currChan]);
	}
	break;
    case "Left":
	count = 0;
	prevChan = currChan;
	if (currChan > 9) {
	decChan(9);
	} else {
	currChan = nrChannels - currChan;
	}
	do
	{
	        decChan(1);
	}
	while (!channels[currChan]);
	if(isFullscreen) {
	        play(channels[currChan]);
	} else {
	        preview(channels[currChan]);
	}
	break;
    case "Right":
	count = 0;
	prevChan = currChan;
	if (currChan < (nrChannels - 9 )) {
	incChan(9);
	} else {
	currChan = nrChannels - currChan;
	}
	do
	{
	        incChan(1);
	}
	while (!channels[currChan]);
	if(isFullscreen) {
	        play(channels[currChan]);
	} else {
	        preview(channels[currChan]);
	}
	break;
  case "Red":
	if(isFullscreen) {
		if(showClock == 0 )	{
		 	showDisplay("", true, 80, 1 );
			showClock = 1;
		} else if(showClock == 1 ) {
			showClock = 0;
	 		showDisplay((currChan.toString()), false, 100, 0 );
		}
	} else {
		if(NowNext) {	
			settimer();
			switchtimer.style.opacity = 1;
			setTimeout("switchtimer.style.opacity = 0; ", 2000);
		}
	}
        break;
   case "Green":
	if(isFullscreen) {
		if(!epgactive) {
			audio = audio + 1;
			is = toi.informationService;
			if(audio == 1) {	
				is.setObject("cfg.media.audio.languagepriority","dut,eng",is.STORAGE_VOLATILE);
				document.getElementById("osdlang").setAttribute("visibility","visible");
				document.getElementById("osdlangtxt").textContent = "Nederlands"
				setTimeout("document.getElementById('osdlang').setAttribute('visibility','invisible');", 3000);
			} else if(audio == 2) {
				is.setObject("cfg.media.audio.languagepriority","ger,deu,eng",is.STORAGE_VOLATILE);
				document.getElementById("osdlang").setAttribute("visibility","visible");
				document.getElementById("osdlangtxt").textContent = "Deutsch"
				setTimeout("document.getElementById('osdlang').setAttribute('visibility','invisible');", 3000);
			} else if(audio == 3) {
				is.setObject("cfg.media.audio.languagepriority","eng",is.STORAGE_VOLATILE);
				document.getElementById("osdlang").setAttribute("visibility","visible");
				document.getElementById("osdlangtxt").textContent = "English"
				setTimeout("document.getElementById('osdlang').setAttribute('visibility','invisible');", 3000);
				audio = 0;
			}
		} else {
			if (document.getElementById("EPGnow").getAttribute("visibility") == "visible" ){
				document.getElementById("EPGnow").setAttribute("visibility","invisible");
				document.getElementById("EPGnext").setAttribute("visibility","visible");
			} else {
				document.getElementById("EPGnow").setAttribute("visibility","visible");
				document.getElementById("EPGnext").setAttribute("visibility","invisible");
			}
		}
	} else {
		colorkeys.innerHTML = "<font color=red size=3>" +  NN[3 + NowNext] + "</font><font color=green size=3>" + NN[NowNext] + "</font><font color=yellow size=3> Schedule </font><font color=blue size=3> INFO </font>";
		NowNext = 1 - NowNext;
		showChannelList();
	}

	break;
   case "Yellow":
	if(isFullscreen) {
		if(!epgactive) {
			GetSchedule(currChan,15);
			schedule.style.opacity = 1;
			schedule.style.height = "75%";
			setTimeout("schedule.style.opacity = 0;schedule.style.height = '45%';", 3000);
		}
	} else {
		GetSchedule(currChan,10);
		schedule.style.opacity = 1 - schedule.style.opacity;
		channelList.style.opacity = 1 - schedule.style.opacity;
		schedkeys.style.opacity = schedule.style.opacity;
		colorkeys.style.opacity = 1 - schedule.style.opacity;
		isSchedule = schedule.style.opacity;
	}
	break;
   case "Blue":
	if(isFullscreen) {

	} else {
		SetOsdInfo();
			if (NowNext){
				document.getElementById("EPGnow").setAttribute("visibility","invisible");
				document.getElementById("EPGnext").setAttribute("visibility","visible");
			} else {
				document.getElementById("EPGnow").setAttribute("visibility","visible");
				document.getElementById("EPGnext").setAttribute("visibility","invisible");
			}

		setTimeout("epgactive = 0; document.getElementById('EPGnow').setAttribute('visibility','invisible'); document.getElementById('EPGnext').setAttribute('visibility','invisible');", 5000);
	}
	break;
   case "BrowserBack":
	if(count) {
		count = 0;
		if(isFullscreen) {
			showDisplay((currChan.toString()), false, 100, 0 );
		}
		Change = 0;
	} else {
		if(isFullscreen) {
			if(epgactive) {
			epgactive = 0;
			document.getElementById("EPGnow").setAttribute("visibility","invisible");
			document.getElementById("EPGnext").setAttribute("visibility","invisible");
			} else {
			//SHOW epg info
			SetOsdInfo();
			document.getElementById("EPGnow").setAttribute("visibility","visible");
			document.getElementById("EPGnext").setAttribute("visibility","invisible");
			epgactive = 1;		
			}
		} else if(!isFullscreen){
			isFullscreen = 1;
			FullScreen();
			currChan = preChan;
		}
	}
	break;

   case "Enter":
	// OK key on frontpanel
   case "Accept":
	if(isFullscreen) {
	// fullscreen    
		if(!count) {
		showOSD();
		} else {
			CheckChannel(Change);
			count = 0;
			if(ChangeOK) { 	
				play(channels[currChan]);
				ChangeOK = 0;
				}
		  }
	} else {
	// if not fullscreen
		if(count){
			CheckChannel(Change);
			count = 0;
			if(ChangeOK) { 	
				preview(channels[currChan]);
				ChangeOK = 0;
				}
		  } else {
		isFullscreen = 1;
		FullScreen();
	        play(channels[currChan]);
		}
	}
        break;

   case "Menu":
		if(isFullscreen) {
		isSetupMenu = 1;
		document.getElementById("MENU").setAttribute("visibility","visible");
		InitMenu();
		}
		break;
   case "Scroll":
		if(isFullscreen) {
			NowNext = 0;
			video.width = "320px";
			video.height = "240px";
			video.left = "380px";
			video.top = "300px";
			showChannelList();
			isFullscreen = 0;
			if(!SwitchGuide) {
			preChan = currChan;
			}
		} else {
			isFullscreen = 1;
			FullScreen();
			if(!SwitchGuide) {
			currChan = preChan;
			}
		}
		break;
    case "TV":
	currChan = prevChan;
 	showDisplay((currChan.toString()), false, 100, 0 );
        play(channels[currChan]);
        break;

    case KEY_0:
	digit = 0;
	Makedigit();
        break;
    case KEY_1:
	digit = 1;
	Makedigit();
        break;
    case KEY_2:
	digit = 2;
	Makedigit();
        break;
    case KEY_3:
	digit = 3;
	Makedigit();
        break;
    case KEY_4:
	digit = 4;
	Makedigit();
        break;
    case KEY_5:
	digit = 5;
	Makedigit();
        break;
    case KEY_6:
	digit = 6;
	Makedigit();
        break;
    case KEY_7:
	digit = 7;
	Makedigit();
        break;
    case KEY_8:
	digit = 8;
	Makedigit();
        break;
    case KEY_9:
	digit = 9;
	Makedigit();
        break;
    case "Teletext":
	if(isFullscreen) {
		isVisible = 1;
		setVisible(isVisible);
		}
	break;
    case "VolumeMute":
	state = toi.audioOutputService.getMuteState(AudioOut);
	toi.audioOutputService.setMuteState(AudioOut, !state);
	if (state) {
	document.getElementById("osdmute").setAttribute("visibility","invisible") ;
	} else {
	document.getElementById("osdmute").setAttribute("visibility","visible") ;
	}
	break;
    case "VolumeUp":
	Volume = Volume + 10;
        if (Volume > 100) {
            Volume = 100;
        }
        toi.audioOutputService.setVolume(AudioOut, Volume);
	showVolume();
	break;
    case "VolumeDown":
	Volume = Volume - 10;
        if (Volume < 0) {
            Volume = 0;
        }
        toi.audioOutputService.setVolume(AudioOut, Volume);
	showVolume();
	break;

	case "MediaRewind":
		break;
	case "MediaForward":
		break;
	case "MediaPlayPause":
		break;
	case "MediaStop":
	mediaList.style.opacity = 0.8;
	isMediaMenu = 1;
	showDisplay("STOP", false, 100, 0 );
	currMed = 0;
	showMediaList();
	break;
	case "MediaRecord":
	break;

	default:
        break;
    }
  }
}

function Makedigit() {
	prevChan = currChan;
	Change = (Change*10) + digit;
	count = count + 1;
	if(isFullscreen) {
		showDisplay((Change.toString()), false, 100, 0 );
//		document.getElementById("osdnr").setAttribute("visibility","visible"); 
	}

    if (count>2) {
	CheckChannel(Change);
	count = 0;
	}
    if(ChangeOK) { 
	if(isFullscreen) {
	        play(channels[currChan]);
	} else {
	        preview(channels[currChan]);
	}
	ChangeOK = 0;
	}
}

function CheckChannel(CheckThis) {
// function to check if channel exists
	if(channels[CheckThis]) {
		ChangeOK = 1;
		currChan = CheckThis;
	} else {
		ChangeOK = 0;
	}
	if(prevChan == currChan) { 
	ChangeOK = 0 ;
	}
	if(isFullscreen) {
	showDisplay((currChan.toString()), false, 100, 0 );
	}
	Change = 0;

}


function showDisplay(showtxt,colonState,intensity,currentMode) {
	if(!showClock){
	toi.frontPanelService.setSegmentDisplayState(toi.statics.ToiFrontPanelServiceSegmentDisplayState.create(showtxt,colonState,intensity,currentMode));
	}
}

function SetLed(NumLed,color,blinkfreq){
	var fps = toi.frontPanelService;
	var state = toi.statics.ToiFrontPanelServiceLedState.create(color, blinkfreq);
	fps.setLedState(NumLed, state);
}


function showOSD() {
	if (osdtimeout) {
		clearTimeout(osdtimeout);
	}
	SetOsdInfo();
	document.getElementById("OSD").setAttribute("visibility","visible");
	osdtimeout = setTimeout("document.getElementById('OSD').setAttribute('visibility','invisible');", 3000);
}

function showVolume() {
	if (osdVolumetimeout) {
		clearTimeout(osdVolumetimeout);
	}
	document.getElementById("osdvolume").textContent = "VOLUME : \uE007" + (new Array(Volume)).join("\uE008") + (new Array(100 - Volume)).join("\uE009") + "\uE00A";
	document.getElementById("osdvolume").setAttribute("visibility","visible");
	osdVolumetimeout = setTimeout("document.getElementById('osdvolume').setAttribute('visibility','invisible');", 3000);
}



function SetOsdInfo() {
    date_time();
    GetEPG(currChan);
    makeOSD();
    return;
}

function onCacheUpdated() {
	if (osdtimeout) {
	SetOsdInfo();
	} 
//	if (!isFullscreen) {
//		showChannelList();
//	}
	if (isSchedule) {
	GetSchedule(currChan,10);
	}

}

function makeOSD(){
document.getElementById("osdnr").textContent = currChan;
document.getElementById("osdtime").textContent = result;
document.getElementById("osdname").textContent = Left(channelsnames[currChan],30);
document.getElementById("epgchannel").textContent = Left(channelsnames[currChan],30);
document.getElementById("epgchanneln").textContent = Left(channelsnames[currChan],30);

	tijd = EPG[0][2][currChan];
	date = new Date(tijd*1000); 
	tijd = date.toUTCString();
	tijd = new Date(tijd);
	dateCurrent = new Date();
	var EPGminutes = Math.floor((dateCurrent.getTime() - date.getTime()) /1000/60);

	var tm = tijd.getMinutes();
	var th = tijd.getHours();
	if(th<10)
        {
                th = "0"+th;
        }
        if(tm<10)
        {
                tm = "0"+tm;
        }
	document.getElementById("osdtimenow").textContent = th + ":" + tm;
	document.getElementById("epgtime").textContent = th + ":" + tm;

	tijd = EPG[1][2][currChan];
	date = new Date(tijd*1000); 
	tijd = date.toUTCString();
	tijd = new Date(tijd);
	var tm = tijd.getMinutes();
	var th = tijd.getHours();
	if(th<10)
        {
                th = "0"+th;
        }
        if(tm<10)
        {
                tm = "0"+tm;
        }
	document.getElementById("osdtimenext").textContent = th + ":" + tm;
	document.getElementById("epgtimen").textContent = th + ":" + tm;

document.getElementById("osdpnow").textContent = EPG[0][1][currChan] + " " +  EPG[0][6][currChan];
document.getElementById("epginfo").textContent = EPG[0][1][currChan] + " " +  EPG[0][6][currChan];
document.getElementById("osdpnext").textContent = EPG[1][1][currChan] + " " +  EPG[1][6][currChan];
document.getElementById("epginfon").textContent = EPG[1][1][currChan] + " " +  EPG[1][6][currChan];

document.getElementById("epgextinfo").textContent = EPG[0][4][currChan] + EPG[0][5][currChan];
document.getElementById("epgextinfon").textContent = EPG[1][4][currChan] + EPG[1][5][currChan];

document.getElementById("osddurationnow").textContent = EPGminutes + " / " + (EPG[0][3][currChan] - EPGminutes) + " min";
document.getElementById("epgduration").textContent = EPGminutes + " / " + (EPG[0][3][currChan] - EPGminutes) + " minutes";
document.getElementById("osddurationnext").textContent = EPG[1][3][currChan] + " min";
document.getElementById("epgdurationn").textContent = EPG[1][3][currChan] + " minutes";

}



function settimer() {
	if(SwitchTimer) {	
		tijd = EPG[NowNext][2][currChan];
		date = new Date(tijd*1000); 
		tijd = date.toUTCString();
		tijd = new Date(tijd);
		var tm = tijd.getMinutes();
		var th = tijd.getHours();
		if(th<10) {
                th = "0"+th;
	        }
        	if(tm<10) {
                tm = "0"+tm;
	        }
		dateCurrent = new Date();
		var StartTime = Math.floor((date.getTime() - dateCurrent.getTime()));
		timerChan = currChan;
		TimerActions = "isVisible = 0; isFullscreen = 1; FullScreen(); setVisible(isVisible); currChan = timerChan; play(timerChan); osdtimer.innerHTML = '';SetLed(0,0,0);"
		// only 1 switch timer possible
		if(switchtimerID) {
			clearTimeout(switchtimerID);
		}
		switchtimerID = setTimeout(TimerActions, StartTime);
		switchtimericon = "\uE00C";
		switchtimer.innerHTML = "<font color=black size=4><p>  Name      : " + EPG[NowNext][1][currChan] + "</p><p>  channel   : " + channelsnames[currChan] +  "</p><p>  Starttime : " + th + ":" + tm + "</p></font>";
		SetLed(0,2,1);
	} else {
	//
	// No Switch timer so send timer info to Server
	//
	}
}

// linker n tekens van string
function Left(str, n){
  if (n <= 0)
    return "";
  else if (n > String(str).length)
    return str;
  else
    return String(str).substring(0,n);
}

// rechter n tekens van string
function Right(str, n){
  if (n <= 0)
    return "";
  else if (n > String(str).length)
    return str;
  else {
    var iLen = String(str).length;
    return String(str).substring(iLen, iLen - n);
  }
}

function date_time()
{
        date = new Date;
        year = date.getFullYear();
        month = date.getMonth();
        d = date.getDate();
        day = date.getDay();
        h = date.getHours();
        if(h<10)
        {
                h = "0"+h;
        }
        m = date.getMinutes();
        if(m<10)
        {
                m = "0"+m;
        }
        s = date.getSeconds();
        if(s<10)
        {
                s = "0"+s;
        }
        result = d + "\uE003" + months[month] + "\uE003" + h + ':' +m;
        return;
}

// EPG Section

function GetEPG(epgchan)
{
	EPGShortnow = "";
	EPGExtnow = "";
	EPGShortnext = "";
	EPGExtnext = "";
	cds = 0;
  try {
	// streaminfo
	// SI[x] 0-sat,1-NID,2-TID,3-SID
 	SI=channels[epgchan].split("-");
	is = toi.informationService;
	is.setObject("cfg.locale.ui","ger",is.STORAGE_VOLATILE);
	if(SI[0]=="S28.2E") {
		is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);
	} 
	if((SI[0]=="S23.5E" && SI[1]=="3") || SI[2]=="1026" || SI[2]=="1097" || SI[2]=="1105" || SI[2]=="1119") {
		is.setObject("cfg.locale.ui","dut",is.STORAGE_VOLATILE);
		cds = 1;
	}

	 eitService = toi.statics.ToiDvbEitCacheServiceItem.create(SI[1],SI[2],SI[3]);
	 eitCache.addService(eitService);
	 event = eitCache.getPresentEvent(eitService);
	if(event.freeCaMode){
		document.getElementById("osdca").textContent = "\uE00D" + switchtimericon ;
	} else {
		document.getElementById("osdca").textContent = "\uE00F" + switchtimericon;
	}

	if (event.name)
	{
	 events = eitCache.getEvents(eitService, 1000000000, 2000000000);
 	    extEventsnow = eitCache.getExtendedEventInfo(eitService, events.infoSequence[0].eventId);
 	    extEventsnext = eitCache.getExtendedEventInfo(eitService, events.infoSequence[1].eventId);
	    EPGShortnow = extEventsnow.shortInfo;
	    EPGShortnext = extEventsnext.shortInfo;
	    EPGExtnow = extEventsnow.extendedInfo;
	    EPGExtnext = extEventsnext.extendedInfo; 
	}

	EPG[0][1][epgchan] = event.name;
	EPG[0][2][epgchan] = event.time;
	EPG[0][3][epgchan] = (event.duration/60).toFixed(0);
	EPG[0][4][epgchan] = "";
	EPG[0][5][epgchan] = "";

	if(EPGShortnow) {
	EPG[0][4][epgchan] = EPGShortnow;
	}
	if(EPGExtnow) {
	EPG[0][5][epgchan] = EPGExtnow;
	}

	if(cds){
	 // CDS has short info, other providers, a little longer.
	 EPG[0][6][epgchan] = EPGShortnow;
	} else {
	 EPG[0][6][epgchan] = "";
	}

	event = eitCache.getFollowingEvent(eitService);

	EPG[1][1][epgchan] = event.name;
	EPG[1][2][epgchan] = event.time;
	EPG[1][3][epgchan] = (event.duration/60).toFixed(0);
	EPG[1][4][epgchan] = "";
	EPG[1][5][epgchan] = "";

	if(EPGShortnext) {
	EPG[1][4][epgchan] = EPGShortnext;
	}
	if(EPGExtnext) {
	EPG[1][5][epgchan] = EPGExtnext;
	}

	if(cds){
	 // CDS has short info, other providers, a little longer.
	 EPG[1][6][epgchan] = EPGShortnow;
	} else {
	 EPG[1][6][epgchan] = "";
	}


  } catch(e) {
    alert("Get EPG problem: " + e);
  }
} 



function GetSchedule(schchan,tablelength){
  try {
 	SI=channels[schchan].split("-");
	is = toi.informationService;
	is.setObject("cfg.locale.ui","ger",is.STORAGE_VOLATILE);
	if(SI[0]=="S28.2E") {
		is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);
	} 
	if((SI[0]=="S23.5E" && SI[1]=="3") || SI[2]=="1026" || SI[2]=="1097" || SI[2]=="1105" || SI[2]=="1119") {
		is.setObject("cfg.locale.ui","dut",is.STORAGE_VOLATILE);
		cds = 1;
	}

	 eitService = toi.statics.ToiDvbEitCacheServiceItem.create(SI[1],SI[2],SI[3]);
	 eitCache.addService(eitService);
	 event = eitCache.getPresentEvent(eitService);
	 events = eitCache.getEvents(eitService, 1000000000, 2000000000);

	if (event.name)	{
	    if (events.more) {
	      var t = eitCache.getEvents(eitService, 1000000000, 2000000000);
	      events.infoSequence.concat(t.infoSequence);
	      events.more = t.more;
	    }

	    var txt = "<table><tr>";
	    var i = 0;
	    for (i = 0; i < events.infoSequence.length && i < tablelength; i++) {

		while ((i > 0) && (events.infoSequence[i].eventId == events.infoSequence[(i-1)].eventId)) {
			i = i +1;
		}

		tijd = events.infoSequence[i].time;
		date = new Date(tijd*1000); 
		tijd = date.toUTCString();
		tijd = new Date(tijd);
		var tm = tijd.getMinutes();
		var th = tijd.getHours();
		if(th<10)
	        	{
	                th = "0"+th;
	        	}
	        if(tm<10)
	        	{
	                tm = "0"+tm;
	        	}

	      txt = txt + "<td>" + th + ":" + tm + "     (" + events.infoSequence[i].duration/60 + ")  " + events.infoSequence[i].name + "</td></tr>";
	    }
	   txt = txt + "</table>";
	   schedule.innerHTML = channelsnames[schchan] + txt;
	} else {
		schedule.innerHTML = "<p>" + channelsnames[schchan] + "</p> ";
	}

  } catch(e) {
    alert("Get EPG problem: " + e);
		schedule.innerHTML = "<p>" + channelsnames[schchan] + "</p><p> NO EPG </p>";
  }

}

// End of EPG section



// Channelslist / EPG Guide
//
// show currchan - 5
// highlite currchan
// show currchan + 5
// 
// check if chan is OK
// 
function showChannelList() {
	var liststyle = "";
	var htmlstring = "<table border='0'><tr>";
	listChan = currChan-5;
	for(var i=currChan-5; i<=currChan+5; i++) {
		if (listChan<1) {
			listChan=nrChannels-2;
			}
		if (listChan>nrChannels-2) {
			listChan=0;
			}
			do
			{
				listChan = listChan + 1;
			}
			while (!channels[listChan] && (listChan<nrChannels));
		GetEPG(listChan);
		if ( listChan == currChan) { 
			liststyle = " style='background:#fc5;'";
		}  else {
			liststyle = "";
		}
		EpgInfo[0] = EPG[0][7][listChan];
		EpgInfo[1] = EPG[1][7][listChan];
		htmlstring = htmlstring + "<td" + liststyle + ">" + listChan + "</td><td" +liststyle + ">" + Left(channelsnames[listChan],15) + "</td><td" +liststyle + ">"  + Left(EpgInfo[NowNext],64) + "</td></tr>";
	}
	htmlstring = htmlstring + "</table>";
	channelList.innerHTML = htmlstring;
        chanlistepg.innerHTML = "<center><font color=black size=4><p>" + EPG[NowNext][1][currChan] + "</p></font><font color=black size=3><p>" + Left(EPG[NowNext][4][currChan],250) + "</p></font></center>" ;

}

// END of Channelslist / EPG Guide


// MENU

function onKeyMenu(keyCode) {
  switch(keyCode) {
    case "Menu":
    case "BrowserBack":
	isSetupMenu = 0;
	document.getElementById("MENU").setAttribute("visibility","invisible");
    break;
    case "Left":
    break;
    case "Right":
    break;
    case "Red":
	if(showClock == 0 )	{
	 	showDisplay("", true, 80, 1 );
		showClock = 1;
	} else if(showClock == 1 ) {
		showClock = 0;
 		showDisplay((currChan.toString()), false, 100, 0 );
	}
	InitMenu();
    break;
    case "Green":
			audio = audio + 1;
			is = toi.informationService;
			if(audio == 1) {	
				is.setObject("cfg.media.audio.languagepriority","dut,eng",is.STORAGE_VOLATILE);
			} else if(audio == 2) {
				is.setObject("cfg.media.audio.languagepriority","ger,deu,eng",is.STORAGE_VOLATILE);
			} else if(audio == 3) {
				is.setObject("cfg.media.audio.languagepriority","eng",is.STORAGE_VOLATILE);
				audio = 0;
			}
	InitMenu();
    break;
    case "Yellow":
	clearTimeout(switchtimerID);
	switchtimerID = 0;
	InitMenu();
	osdtimer.innerHTML = "";
	SetLed(0,0,0);
    break;
    case "Blue":
	if(SwitchGuide == 0 )	{
		SwitchGuide = 1;
	} else if(SwitchGuide == 1 ) {
		SwitchGuide = 0;
	}
	InitMenu();
    break;
    case "MediaRewind":
    break;
    case "MediaForward":
    break;
    case "MediaStop":
    break;
    case "Teletext":
    break;
    case "TV":
    break;
	case KEY_0:
	break;
	case KEY_1:
	break;
	case KEY_2:
	break;
	case KEY_3:
	break;
	case KEY_4:
	break;
	case KEY_5:
	break;
	case KEY_6:
	break;
	case KEY_7:
	break;
	case KEY_8:
	break;
	case KEY_9:
	break;
  }
}

function InitMenu() {
	document.getElementById("menuheader").textContent = "SETTINGS";
	document.getElementById("menu0").textContent = "<RED>    Frontdisplay Clock : " + showClock;
	document.getElementById("menu1").textContent = "<GREEN>  Prio audio track : " + (toi.informationService.getObject("cfg.media.audio.languagepriority"));
	document.getElementById("menu2").textContent = "<YELLOW> Switch timer : " + Boolean(switchtimerID);
	document.getElementById("menu3").textContent = "<BLUE>   Preview guide : " + SwitchGuide + " ";
}

// END Menu

// Mediaplayer

function onKeyMedia(keyCode) {
  switch(keyCode) {
    case "BrowserBack":
    case "TV":
	mediaList.style.opacity = 0;
 	showDisplay((currChan.toString()), false, 100, 0 );
	isMediaMenu = 0;
        play(channels[currChan]);
        break;
    break;
    case "Down":
	if (mediaList.style.opacity != 0) {
	do
	{
	        incMed(1);
	}
	while (!recording[currMed]);
	showMediaList();
	} else {
	      speed = 0;
	      mediaPlayer.play(0);
	      showDisplay("PAUS", false, 100, 0 );
	}
        break;
    case "Up":
	if (mediaList.style.opacity != 0) {
	do
	{
	        decMed(1);
	}
	while (!recording[currMed]);
	showMediaList();
	} else {
	      speed = 1000;
	      mediaPlayer.play(1000);
	      showDisplay("PLAY", false, 100, 0 );
	}
	break;
  case "Accept":
	if (mediaList.style.opacity != 0) {
	mediaList.style.opacity = 0;
	speed = 1000;
	playRec(recording[currMed]);
	} else {
	osdmedia.style.opacity = 1 - osdmedia.style.opacity;
	ShowMediaOSD();
//	mediaPlayer.playFromPosition(60000,1000);
	}
        break;
   case "Green":
			audio = audio + 1;
			is = toi.informationService;
			if(audio == 1) {	
				is.setObject("cfg.media.audio.languagepriority","dut,eng",is.STORAGE_VOLATILE);
				document.getElementById("osdlang").setAttribute("visibility","visible");
				document.getElementById("osdlangtxt").textContent = "Nederlands"
				setTimeout("document.getElementById('osdlang').setAttribute('visibility','invisible');", 3000);
			} else if(audio == 2) {
				is.setObject("cfg.media.audio.languagepriority","ger,deu,eng",is.STORAGE_VOLATILE);
				document.getElementById("osdlang").setAttribute("visibility","visible");
				document.getElementById("osdlangtxt").textContent = "Deutsch"
				setTimeout("document.getElementById('osdlang').setAttribute('visibility','invisible');", 3000);
			} else if(audio == 3) {
				is.setObject("cfg.media.audio.languagepriority","eng",is.STORAGE_VOLATILE);
				document.getElementById("osdlang").setAttribute("visibility","visible");
				document.getElementById("osdlangtxt").textContent = "English"
				setTimeout("document.getElementById('osdlang').setAttribute('visibility','invisible');", 3000);
				audio = 0;
			}
	break;
    case "MediaRewind":
	    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) {
	    speed = speed - 1000;
	    if (speed < -9000) {
		speed = -9000;
		}
	    mediaPlayer.play(speed);
	    showDisplay("PL" + ((speed/1000).toString()), false, 100, 0 );
	    }
    break;
    case "MediaForward":
	    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) {
	    speed = speed + 1000;
	    if (speed > 9000) {
		speed = 9000;
		}
	    mediaPlayer.play(speed);
	    showDisplay("PL" + ((speed/1000).toString()), false, 100, 0 );
	    }
    break;
    case "MediaStop":
	    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) {
	    mediaPlayer.close();
	    }
	    speed = 1000;
	    mediaList.style.opacity = 0.8;
	    showDisplay("STOP", false, 100, 0 );
	    showMediaList();
    break;
	case "MediaPlayPause":
	    if (mediaPlayer.getState() != mediaPlayer.STATE_PAUSED) {
	      mediaPlayer.play(0);
	      showDisplay("PAUS", false, 100, 0 );
	    } else {
	      speed = 1000;
	      mediaPlayer.play(1000);
	      showDisplay("PLAY", false, 100, 0 );
    	    }
	break;
    case "VolumeMute":
	state = toi.audioOutputService.getMuteState(AudioOut);
	toi.audioOutputService.setMuteState(AudioOut, !state);
	if (state) {
	document.getElementById("osdmute").setAttribute("visibility","invisible") ;
	} else {
	document.getElementById("osdmute").setAttribute("visibility","visible") ;
	}
	break;
    case "VolumeUp":
	Volume = Volume + 10;
        if (Volume > 100) {
            Volume = 100;
        }
        toi.audioOutputService.setVolume(AudioOut, Volume);
	showVolume();
	break;
    case "VolumeDown":
	Volume = Volume - 10;
        if (Volume < 0) {
            Volume = 0;
        }
        toi.audioOutputService.setVolume(AudioOut, Volume);
	showVolume();
	break;
	default:
        break;
  }
}

function showMediaList() {
	var liststyle = "";
	var htmlstring = "<p><center><font size=4>RECORDINGS</font></center></p><table border='0'><tr>";
	listMed = currMed-7;
	for(var i=currMed-7; i<=currMed+7; i++) {
		if (listMed<0) {
			listMed=nrMedia-2;
			}
		if (listMed>nrMedia-1) {
			listMed= -1;
			}
			do
			{
				listMed = listMed + 1;
			}
			while (!recording[listMed] && (listMed<nrMedia));
		if ( listMed == currMed) { 
			liststyle = " style='background:#fc5;'";
		}  else {
			liststyle = "";
		}
		htmlstring = htmlstring + "<td" + liststyle + ">\uE003\uE003" + Left(recording[listMed],60) + "</td></tr>";
	}
	htmlstring = htmlstring + "</table>";
	mediaList.innerHTML = htmlstring;
}


function incMed(step) {
    currMed = currMed + step;
    if (currMed == nrMedia + 1) {
        currMed = 0;
    }
}

function decMed(step) {
    currMed = currMed - step;
    if (currMed < 0) {
        currMed = nrMedia;
    }
}

function playRec(uri) {
  try {
    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) {
      mediaPlayer.close();
    }
    uri = "file://" + uri;
    mediaPlayer.open(uri);
    mediaPlayer.play(1000);
	showDisplay("PLAY", false, 100, 0 );
  } catch (e) {
    alert("Failed opening recording: " + e);
    return;
  }
}


function ShowMediaOSD() {
// Display Name/ length
	osdmedia.innerHTML = "<font size=4> Elapsed time : " + mediaPlayer.getPosition() + "</font>";
}

// END of Mediaplayer

// TELETEXT

function embedTeletextElement() {
  teletext = document.createElement("foreignObject");
  teletext.setAttribute("id", "teletext");
  teletext.setAttribute("x", "10");
  teletext.setAttribute("y", "10");
  teletext.setAttribute("width", videoWidth);
  teletext.setAttribute("height", videoHeight);
  teletext.setAttribute("requiredExtensions", "application/motorola-teletext-plugin");
    document.documentElement.appendChild(teletext);
  teletext.setAttribute("display", "none");
  return teletext;
}


function setVisible(isVisible) {
  if (isVisible) {
    video.setAttribute("width", (videoWidth/2));
    video.setAttribute("x", (videoWidth/2));
    teletext.setAttribute("width", (videoWidth/2));
    teletext.setAttribute("height", videoHeight);
    teletext.setAttribute("display", "inline");
  } else {
    teletext.setAttribute("display", "none");
  }
}

function onKeyTeletext(keyCode) {
  switch(keyCode) {
    case "Left":
      teletext.gotoNextPage();
    break;
    case "Right":
      teletext.gotoPreviousPage();
    break;
    case "Red":
      teletext.inputRedKey();
    break;
    case "Green":
      teletext.inputGreenKey();
    break;
    case "Yellow":
      teletext.inputYellowKey();
    break;
    case "Blue":
      teletext.inputCyanKey();
    break;
    case "MediaRewind":
      teletext.gotoPreviousSubpage();
    break;
    case "MediaForward":
      teletext.gotoNextSubpage();
    break;
    case "MediaStop":
	teletext.setAttribute("width", videoWidth);
	teletext.setAttribute("height", videoHeight);
	teletext.transparent = !teletext.transparent;
	FullScreen();
    break;
    case "BrowserBack":
    case "Teletext":
	isVisible = 0;
	setVisible(isVisible);
	FullScreen();		
    break;

    case "TV":
      teletext.gotoIndexPage();
    break;

	case KEY_0:
	    teletext.inputDigit(0);
	break;
	case KEY_1:
	    teletext.inputDigit(1);
	break;
	case KEY_2:
	    teletext.inputDigit(2);
	break;
	case KEY_3:
	    teletext.inputDigit(3);
	break;
	case KEY_4:
	    teletext.inputDigit(4);
	break;
	case KEY_5:
	    teletext.inputDigit(5);
	break;
	case KEY_6:
	    teletext.inputDigit(6);
	break;
	case KEY_7:
	    teletext.inputDigit(7);
	break;
	case KEY_8:
	    teletext.inputDigit(8);
	break;
	case KEY_9:
	    teletext.inputDigit(9);
	break;



  }
}

