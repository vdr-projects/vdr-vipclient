window.onkeydown = onKeyDown;

function onLoad() {

	is = toi.informationService;
	ss = toi.schedulerService;
	aos = toi.audioOutputService;
	vos = toi.videoOutputService;
	fps = toi.frontPanelService;
	ams = toi.assetManagerService;

	GetSettings();
	createPlayer();
	createEitCache();

	if(pipPlayer){
		addPipVideoplane();
		createPip();
	}
	if(PipSwitchGuide){
		createPip();
	}

	embedTeletextPlugin();
	aos.setVolume(AudioOut, StartVolume);
	aos.setMuteState(AudioOut, false);
	showDisplay(currChan.toString(), false, 100, 0 );
	play(channels[currChan]);

	if (EPGMode) {
		eitCache.setFilterMode(eitCache.FILTER_MODE_PF_AND_SCHEDULE);
	} else {
		eitCache.setFilterMode(eitCache.FILTER_MODE_PF_ONLY);
	}
	eitCache.addEventListener(eitCache.ON_CACHE_UPDATED, onCacheUpdated);
	mediaPlayer.addEventListener(mediaPlayer.ON_DATA_AVAILABLE,onDataAvailableEvent);
	mediaPlayer.addEventListener(mediaPlayer.ON_STATE_CHANGED, MPD); 

	if (is.getObject("var.capabilities.dvr") == "FALSE") { 
		mediaRecorder = 0;
		// No harddisk, no recorder functions possible
	}

	if (is.getObject("config.architecture.target") !== "vip1903" && fullupdate !== 2) { 
		fullupdate = 0;
		// No 19x3 so better turn fullupdate EPG off
	}

	if (mediaRecorder) {
		createRecorder();
		mediaRecorder.addEventListener(mediaRecorder.ON_STATE_CHANGED, onRecorderStateChanged);
		om = toi.assetManagerService.getAssetOperationManager(); //toi.OperationManager;
		rma = om.createOperation("Remove Asset");
	}

	    is.addEventListener(is.ON_OBJECTS_CHANGED, onEvent);
	    is.subscribeObject(onEvent, "var.io.state", true);

	    ss.addEventListener(ss.ON_SCHEDULED_START, onScheduledStart);
	    ss.addEventListener(ss.ON_SCHEDULED_STOP, onScheduledStop);
	    ss.setCategorySubscription(onScheduledStart, "*");
	    ss.setCategorySubscription(onScheduledStop, "*");

	setOSDscale();
	SetupFonts();

	setOSDtimer();
	showOSD();
	videoplane.subtitles = Boolean(ShowSubs);
	colorkeys.innerHTML = "<font color=red> " +  NN[4] + " </font><font color=green > " + NN[1] + " </font><font color=yellow> " + NN[2] + " </font><font color=blue> " + NN[5] + " </font>";
	medialist.innerHTML = "<h1><center style='font-size:" + fsRec + ";" + color_main_head + ";'>" + Lang[0] + "</center></h1>";
}




function GetSettings() {
	//test for settings, create if not excists.
	try {
		if (!is.getObject("vip.serveraddress")) {} 
	} catch(e) {
		is.setObject("vip.serveraddress","0",is.STORAGE_PERMANENT)
	}

	try {
		if (!is.getObject("vip.languagepriority")) {} 
	} catch(e) {
		is.setObject("vip.languagepriority","0",is.STORAGE_PERMANENT)
	}

	try {
		if (!is.getObject("vip.OSDlanguage")) {} 
	} catch(e) {
		is.setObject("vip.OSDlanguage","0",is.STORAGE_PERMANENT)
	}

	try {
		if (!is.getObject("vip.testing")) {} 
	} catch(e) {
		is.setObject("vip.testing","0",is.STORAGE_PERMANENT)
	}


	try {
		if (!is.getObject("vip.resolution")) {} 
	} catch(e) {
		is.setObject("vip.resolution","2",is.STORAGE_PERMANENT)
	}

	try {
		if (!is.getObject("vip.testing2")) {} 
	} catch(e) {
		is.setObject("vip.testing2","0",is.STORAGE_PERMANENT)
		//show info if channel is on hardcoded list of non free
	}

	try {
		if (!is.getObject("vip.fav_max_channel")) {} 
	} catch(e) {
		is.setObject("vip.fav_max_channel","0",is.STORAGE_PERMANENT)
	}

	try {
		if (!is.getObject("vip.showsubs")) {} 
	} catch(e) {
		is.setObject("vip.showsubs","1",is.STORAGE_PERMANENT)
	}


	var sel_group;
	for (var i=0;i<10;i++) {
		sel_group = "vip.group." + i;
		try {
			if (!is.getObject(sel_group)) {} 
		} catch(e) {
			if (!minChan[i]) {
				is.setObject(sel_group,"0",is.STORAGE_PERMANENT)
			} else {
				is.setObject(sel_group,"1",is.STORAGE_PERMANENT)
			}
		}
	}

	for (var i=0;i<10;i++) {
		if (minChan[i]) {minchan[i] = minChan[i];}
		sel_group = "vip.group." + i;
		if (is.getObject(sel_group) == "0") { minChan[i] = "";}
	}

	audio = Number(is.getObject("vip.languagepriority"));
	server_ip = server_ip_array[Number(is.getObject("vip.serveraddress"))];
	for (var i=0;i<10;i++) { if (ServerAdres[i] !== "FullURL" && ServerAdres[i] !== "MultiCast") {ServerAdres[i] = server_ip + StreamPort;} }
	ServerAdres[Fav_group] = server_ip + StreamPort;

	lang_nr = Number(is.getObject("vip.OSDlanguage"));
	loadjs(langfile[lang_nr]);

	experimental = Number(is.getObject("vip.testing"));// Use some experimental code
	testing2 = Number(is.getObject("vip.testing2"));// Use some experimental code
	ShowSubs = Number(is.getObject("vip.showsubs"));

	Set_Res = Number(is.getObject("vip.resolution"));
	VideoOutput();
	Read_Fav();

	is.setObject("cfg.media.subtitling.languagepriority",subs_prio,is.STORAGE_PERMANENT);
	// set default subtitle language to 


	//if needed types can be set here. Default of the box is normal.
	//is.setObject("cfg.media.subtitling.typepriority","hearing_impaired",is.STORAGE_PERMANENT);
	//is.setObject("cfg.media.subtitling.typepriority","normal",is.STORAGE_PERMANENT);
	//is.setObject("cfg.media.audio.typepriority","normal",is.STORAGE_PERMANENT);
	//is.setObject("cfg.media.audio.typepriority","hearing_impaired",is.STORAGE_PERMANENT);
	//is.setObject("cfg.media.audio.typepriority","visually_impaired",is.STORAGE_PERMANENT);


	for (var x = 0;  x < 10; x++) { 
		searchtimers[x] = "" ; // To solve displaying undefined
		timers[x] = "" ;
		if (maxChan[x]) { //check changed to maxChan because minChan can be unset from menu
			for (var i = minChan[x];  i < (maxChan[x]+1); i++) { 
			EPG[0][4][i] = "";EPG[1][4][i] = "";EPG[0][5][i] = "";EPG[1][5][i] = "";
			EPG[0][7][i] = "";EPG[1][7][i] = "";AvInfo[i] = "";
			}
		}
	}
	for (var i = minChan[Fav_group];  i < (maxChan[Fav_group]+10); i++) { 
		EPG[0][4][i] = "";EPG[1][4][i] = "";EPG[0][5][i] = "";EPG[1][5][i] = "";EPG[0][7][i] = "";EPG[1][7][i] = "";AvInfo[i] = "";
	}
	//Check if there is a SmartTV or Restfulapi VDR server plugin but not when box ip isn't the same range as server ip
 	test_ip = server_ip.split(".");
	box_ip = (is.getObject("config.ipaddress")).split(".");

	if (("http://" + box_ip[0] == test_ip[0]) && (box_ip[1] == test_ip[1]) && (box_ip[2] == test_ip[2])) {
		CheckPlugins();
	}

// override check for testing :
//	smartTVplugin = 0 ;
//	Restfulapiplugin = 1;
	if (smartTVplugin && Restfulapiplugin == 0) {
		// smartTVplugin YES
		// Restfulapiplugin NO
		get_timer = 1;
		if (get_recordings == 0 ) {get_recordings = 1;}
		get_marks = 1;
	} else if (smartTVplugin == 0 && Restfulapiplugin) {
		// smartTVplugin NO
		// Restfulapiplugin YES
		get_timer = 0;
		if (get_recordings == 1 ) {get_recordings = 0;}
		get_marks = 0;
	} else if (smartTVplugin == 0 && Restfulapiplugin == 0) {
		// smartTVplugin NO
		// Restfulapiplugin NO
		get_recordings = 2; //from streamdev
	}
}

function loadjs(filename){
	var oHead = document.getElementsByTagName('HEAD').item(0);
	var oScript= document.createElement("script");
	oScript.type = "text/javascript";
	oScript.src= filename;
	oHead.appendChild( oScript);
}

function onEvent(event) {
var numObjs = event.objectNames.length;
  for (var i=0; i<numObjs; i++) {
	if(event.objectNames[i] == "var.io.state" && is.getObject(event.objectNames[i]) == "standby" && KillStream == 1){
		try {
			if (isMediaMenu) { 
				if (medialist.style.opacity == 0) {setResume();} // No mediamenu on screen so set resume.
			}
			mediaPlayer.close();
			SetLed(2,2,0);// At request no more blinking on standby.

		} catch(e) {
		alert(e);
		}
	} else if(event.objectNames[i] == "var.io.state" && is.getObject(event.objectNames[i]) == "normal" && KillStream == 1){
		play(channels[currChan]);
		if(isMediaMenu) {
			if (mediaList.style.opacity == 0) {
			if (get_recordings == 1) {
			setTimeout("GetMarks(); getResume(); playRec(recLink[currMed]+ '?mode=streamtoend&time=' + position);",100);
			} else if (get_recordings == 2) {
			setTimeout("playRec(recLink[currMed]+ '?pos=time.' + position);",100);
			}

			} else {
				showDisplay("STOP", false, 100, 0 );
				showMediaList();
			}
		}
	}
  }
}
	
function onUnload() {
	try {
		mediaPlayer.close();
		mediaPlayer.releaseInstance();
	if(TimeShift){
		mediaPlayer.stopTimeshiftBuffering();
		mediaPlayer.discardTimeshiftBuffer();
		}
	if(mediaRecorder){
		om.releaseOperation(rma);
		mediaRecorder.close();
		mediaRecorder.releaseInstance();
	}
	if(pipPlayer){
		pipPlayer.close();
		pipPlayer.releaseInstance();
	}

	is.removeEventListener(is.ON_OBJECTS_CHANGED, onEvent);
	eitCache.removeEventListener(eitCache.ON_CACHE_UPDATED, onCacheUpdated);
	mediaPlayer.removeEventListener(mediaPlayer.ON_DATA_AVAILABLE,onDataAvailableEvent);
	mediaPlayer.removeEventListener(mediaPlayer.ON_STATE_CHANGED, MPD); 
	mediaRecorder.removeEventListener(mediaRecorder.ON_STATE_CHANGED, onRecorderStateChanged);

	} catch(e) {
		alert(e);
	}
}

function incChan(step) {
    currChan += step;
    if (currChan > maxChan[ChanGroup]) {
        currChan = minChan[ChanGroup];
    }
    osdnr.style.opacity = isFullscreen; 
    OSDchannr(currChan);
}

function decChan(step) {
    currChan -= step;
    if (currChan < minChan[ChanGroup] ) {
        currChan = maxChan[ChanGroup] ;
    }
    osdnr.style.opacity = isFullscreen; 
    OSDchannr(currChan);
}

function VolumeUp() {
	if (Volume < 5) {
		var VolStep = 1;
	} else {
		var VolStep = VolumeStep;
	}

	Volume += VolStep;
        if (Volume > 100) {
            Volume = 100;
        }
        aos.setVolume(AudioOut, Volume);
	showVolume();
}

function VolumeDown() {
	if (Volume > 5) {
		var VolStep = VolumeStep;
	} else {
		var VolStep = 1;
	}

	Volume -= VolStep;
        if (Volume < 0) {
            Volume = 0;
        }
        aos.setVolume(AudioOut, Volume);
	showVolume();
}


function VolumeMute() {
	state = aos.getMuteState(AudioOut);
	aos.setMuteState(AudioOut, !state);
	mute = 1 - state;
        osdmute.style.opacity = mute; 
}

function createEitCache() {
  try {
	eitCache = toi.dvbEitService.createInstance();
  } catch(e) {
    alert("Failed getting eitCache: " + e);
  }
}

function createPlayer() {
  try {
    mediaPlayer = toi.mediaService.createPlayerInstance();
  } catch(e) {
    alert("Failed creating player: " + e);
  }
}


function createRecorder() {
	try {
		mediaRecorder = toi.mediaService.createRecorderInstance();
	} catch(e) {
		alert("Cannot create media recorder: " + e);
		mediaRecorder = "";
	}
}

function createPip() {
  try {
    pipPlayer = toi.mediaService.createPipPlayerInstance();
  } catch(e) {
    alert("Failed creating PIP player: " + e);
  }
}


function addPipVideoplane() {
  var pipVideoDiv = document.getElementById("pipVideoDiv");
  pipVideoDiv.innerHTML = "<videoplane id='pipvideoplane' index=1 style='position:fixed;left:70%;top:60%;height:20%;width:20%;z-index:50;'></videoplane>";
  document.body.appendChild(pipVideoDiv);
}

function pipplay(uri) {
try {
	if (pipPlayer.getState() != pipPlayer.STATE_IDLE) {
		pipPlayer.close();
	 }
	if (PIPDelayID != -1) { clearTimeout(PIPDelayID); PIPDelayID = -1; }

	if (ServerAdres[ChanGroup] == "MultiCast" ) {
 	SI=channels[currChan].split("-");
	uri = SI[4];
	} else if (ServerAdres[ChanGroup] == "FullURL" ) {
	// uri = ready!
	} else {
	uri = ServerAdres[ChanGroup] + uri;
	}
	pipPlayer.open(uri);
	PIPDelayID = setTimeout("pipPlayer.play(1000);", 500);
  } catch (e) {
    alert("Failed opening PIP stream: " + e);
    return;
  }
}


function play(uri) {
  try {
    if (initialDelayID != -1) { clearTimeout(initialDelayID); initialDelayID = -1; }
    if (PlayDelayID != -1) { clearTimeout(PlayDelayID); PlayDelayID = -1; }
    if (initialDelayPlayID != -1) { clearTimeout(initialDelayPlayID); initialDelayPlayID = -1; }

    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) { mediaPlayer.close(); }
    if (isSchedule) { schedule.style.opacity = 0; isSchedule = 0;}
    if (epgactive) { osdepginfo.style.opacity = 0; osdepginfonext.style.opacity = 0; epgactive = 0;}

    if (ServerAdres[ChanGroup] == "MultiCast" ) { SI=channels[currChan].split("-"); uri = SI[4];
    } else if (ServerAdres[ChanGroup] == "FullURL" ) {	// uri = ready!
    } else { uri = ServerAdres[ChanGroup] + uri; }

    URL = uri;
    initialDelayPlayID = setTimeout("mediaPlayer.open(URL);mediaPlayer.play(1000);GetEPG(currChan);ExtraStuff();",initialDelayPlay);
    initialDelayPlay = 500; // wait 500 ms before zap to next channel
    PlayDelayID = setTimeout("initialDelayPlay = 0;",5000);
    SetLed(1,1,0);

    if(isFullscreen) { showOSD(); }

    showDisplay(currChan.toString(), false, 100, 0 );
        
  } catch (e) {
    alert("Failed opening stream: " + e);
    return;
  }
}

function preview(urip) {
	if(SwitchGuide) {
		play(urip);
	} else if (PipSwitchGuide && fullupdate) {
		pipplay(urip);
	}

	if (isSchedule) { schedule.style.opacity = 0; isSchedule = 0;}
	if (epgactive) { osdepginfo.style.opacity = 0; osdepginfonext.style.opacity = 0; epgactive = 0;}
	showChannelList();
}


function onDataAvailableEvent(event) {
	dataAvailable = event.status;
	//alert("onDataAvailableEvent : " + event.status);
	if(event.status==true) {
		updateStreamInfo(currChan);
	} 
}


function updateStreamInfo(currStream) {

var streamInfo = mediaPlayer.getStreamInfo();
var cList = streamInfo.availableComponents;
var x;
var xs = 0;
var subs = "";
if (currMed!= -1) {
	if (streamInfo.playTime != -1) {
		recDura[currMed] = streamInfo.playTime;
	}
}
xx = 0;
AvInfo[currStream] = "";
lang_prio_dyn.length = 0;
subs_prio_dyn.length = 0;
Radioicon = "\uE00E";

for(x=0; x<cList.length;x++) {
	if(cList[x].type == 0) {
	lang_prio_dyn[xx] = mediaPlayer.getAudioStreamInfo(cList[x]).language;
	AvInfo[currStream] = AvInfo[currStream] + " Audio " + xx + " " + mediaPlayer.getAudioStreamInfo(cList[x]).encoding + " - " + mediaPlayer.getAudioStreamInfo(cList[x]).language + " , ";

	//
//	alert (mediaPlayer.getAudioStreamInfo(cList[x]).sampleRate);
//	alert (mediaPlayer.getAudioStreamInfo(cList[x]).channelFormat);
	// AUDIO_CHANNEL_FORMAT_UNKNOWN = 0
	// AUDIO_CHANNEL_FORMAT_SINGLE_MONO = 1
	// AUDIO_CHANNEL_FORMAT_DUAL_MONO = 2
	// AUDIO_CHANNEL_FORMAT_STEREO = 3
	// AUDIO_CHANNEL_FORMAT_3_FRONT_1_BACK = 4
	// AUDIO_CHANNEL_FORMAT_3_FRONT_2_BACK = 5
	// AUDIO_CHANNEL_FORMAT_3_FRONT_2_BACK_LFE = 6
	// AUDIO_CHANNEL_FORMAT_3_FRONT_2_SIDE_2_BACK_LFE = 7
//	alert (mediaPlayer.getAudioStreamInfo(cList[x]).channelMode);
	// AUDIO_CHANNEL_MODE_NORMAL = 0
	// AUDIO_CHANNEL_MODE_DUAL_MONO_LEFT_ONLY = 1
	// AUDIO_CHANNEL_MODE_DUAL_MONO_RIGHT_ONLY = 2
	// AUDIO_CHANNEL_MODE_DUAL_MONO_STEREO = 3
	// AUDIO_CHANNEL_MODE_DUAL_MONO_MIXED = 4

	if (lang_prio_dyn[xx] !== "NAR") { 
		xx += 1; 
	} else { 
		lang_prio_dyn.length = xx;
	}


	}
	if(cList[x].type == 1) {
	Radioicon = "\uE00F";
	AvInfo[currStream] = AvInfo[currStream] + " Video " + mediaPlayer.getVideoStreamInfo(cList[x]).encoding + " size : " + mediaPlayer.getVideoStreamInfo(cList[x]).resolutionX + " x " + mediaPlayer.getVideoStreamInfo(cList[x]).resolutionY;
	if (mediaPlayer.getVideoStreamInfo(cList[x]).aspectRatio == "0") { AvInfo[currStream] = AvInfo[currStream] + " (?:?)"; }
	if (mediaPlayer.getVideoStreamInfo(cList[x]).aspectRatio == "1") { AvInfo[currStream] = AvInfo[currStream] + " (4:3)"; }
	if (mediaPlayer.getVideoStreamInfo(cList[x]).aspectRatio == "2") { AvInfo[currStream] = AvInfo[currStream] + " (16:9)"; }
	}

	if(cList[x].type == 2) {
		if (xs == 0) { subs = " SUBS : " } else { subs += " , ";}
		subs_prio_dyn[xs] = mediaPlayer.getSubtitleStreamInfo(cList[x]).language;
		subs = subs + subs_prio_dyn[xs];
		xs += 1;
	}

	if(cList[x].type == 3) {
	alert("COMPONENT_SUBTITLE_CAPTION");
	//This is an ARIB specific type of subtitles
	}
	if(cList[x].type == 4) {
	alert("COMPONENT_SUBTITLE_SUPERIMPOSE");
	//This is an ARIB specific type of subtitles and used mainly for displaying alert messages on screen.
	}
	if(cList[x].type == 5) {
//		alert("TeletextStreamInfo : " + mediaPlayer.getTeletextStreamInfo(cList[x]).language)
		AvInfo[currStream] += " TXT";
	}


	}
	AvInfo[currStream] += subs;
}


function VideoOutput() {

videoConfig = vos.getVideoConfiguration();

 var session = null;
  try {
    var currentOutput = 0; //0 = normaly HDMI
    displayInfo=videoConfig.getDisplayInfo(videoConfig.getVideoOutputs()[currentOutput]);
    var desiredMode = VideoOutputModes[Set_Res];

    // create the session
    session = vos.createVideoConfigurationSession();
    session.setDefaultVideoMode(videoConfig.getVideoOutputs()[currentOutput], desiredMode);
    session.apply();
    session.releaseInstance();

  }
  catch (e) {
    if (session != null) {
      session.releaseInstance();
    }
    alert(e);
  }

setOSDscale();
SetupFonts();

}

function addzero(zero)
{
if (zero<10)
  {
  zero="0" + zero;
  }

return zero;
}

function ExtraStuff(){
	if(TimeShift){
	    initialDelayID = setTimeout("startTimeshiftBuffering();", 5000);
	}
	if(testing2) {
			if (CAdelayID != -1) { clearTimeout(CAdelayID); CAdelayID = -1; switchtimer.style.opacity = 0;}
		if ( 	(currChan > 10 && currChan < 26 )  || (currChan > 40 && currChan < 50 )   || (currChan > 50 && currChan < 120 ) ||
			(currChan > 151 && currChan < 200) || (currChan > 604 && currChan < 612 ) || (currChan > 624 && currChan < 631) ||
			(currChan > 632 && currChan < 700) || (currChan > 8004 && currChan < 8027) )
		{
			//Show info if set nonfree
			switchtimer.style.background = "red";
			switchtimer.innerHTML = "<pre><center>\n" + Lang[90] +"\n\n </center></pre>"; // Non free channel message
			switchtimer.style.opacity = 1;
			CAdelayID = setTimeout("switchtimer.style.opacity = 0;",ShowSetTimer);
		}
	}

}

function startTimeshiftBuffering() {
    // check that media player is working
    if (mediaPlayer.getState() != mediaPlayer.STATE_PLAYING ) {
      alert("Media Player must be playing when starting timeshift buffering!");
      return;
    }

    mediaPlayer.startTimeshiftBuffering(600);
}


function FullScreen() {
	videoplane.style.width = "100%";
	videoplane.style.height = "100%";
	videoplane.style.left = "0px";
	videoplane.style.top = "0px";
	if(PipSwitchGuide){
		if (pipPlayer.getState() != pipPlayer.STATE_IDLE) {
			pipPlayer.close();
		 }
	}
}


function onKeyDown(event) {
//show key info, needed when a 'new' remote is used
//alert( "keyIdentifier  : " + event.keyIdentifier +"\n"+"ctrlKey    : " + event.ctrlKey +"\n"+"altKey     : " + event.altKey  +"\n"+"shiftKey  : " + event.shiftKey +"\n"+"RAW  : " + event );

    if(isVisible) {
 	onKeyTeletext(event.keyIdentifier);
    } else if(isSetupMenu) {
	onKeyMenu(event.keyIdentifier);
    } else if(isMediaMenu) {
	onKeyMedia(event.keyIdentifier);
    } else {

    switch(event.keyIdentifier) {

    case "ChannelUp":
    case "Up":
	if(isFullscreen) {
		count = 0; Change = 0;
		prevChan = currChan;
		do
		{
		        incChan(1);
		}
		while (!channels[currChan]);
	        play(channels[currChan]);
	} else {
	// swap up <> down in guide mode
		count = 0; Change = 0;
		do
		{
		        decChan(1);
		}
		while (!channels[currChan]);
	        preview(channels[currChan]);
	}
        break;
    case "ChannelDown":
    case "Down":
	if(isFullscreen) {
		count = 0; Change = 0;
		prevChan = currChan;
		do
		{
		        decChan(1);
		}
		while (!channels[currChan]);
	        play(channels[currChan]);
	} else {
	// swap up <> down in guide mode
		count = 0; Change = 0;
		do
		{
		        incChan(1);
		}
		while (!channels[currChan]);
	        preview(channels[currChan]);
	}
	break;
    case "Left":
	count = 0; Change = 0;
	if(isFullscreen) {
	defChan[ChanGroup] = currChan;
	do
		{
		do
			ChanGroup -= 1;
		while (protChn[ChanGroup] == 1 && ShowProtectedChannels == 1) 
		if (ChanGroup < 0) {
			ChanGroup = 9;
			}
		}
	while (!minChan[ChanGroup]);
	currChan = defChan[ChanGroup];
	play(channels[currChan]);
	} else {
	prevChan = currChan;
	if (currChan > (minChan[ChanGroup] + 8)) {
	decChan(9);
	} else {
		currChan = baseChn[ChanGroup] + (maxChan[ChanGroup] - currChan);
	}
	do
	{
	        decChan(1);
	}
	while (!channels[currChan]);
        preview(channels[currChan]);
	}
	break;
    case "Right":
	count = 0; Change = 0;
	if(isFullscreen) {
	defChan[ChanGroup] = currChan;
	do
		{
		do
			ChanGroup += 1;
		while (protChn[ChanGroup] == 1 && ShowProtectedChannels == 1)
		if (ChanGroup > 9) {
			ChanGroup = 0;
			}
		}
	while (!minChan[ChanGroup]);
	currChan = defChan[ChanGroup];
	play(channels[currChan]);

	} else {
	prevChan = currChan;
	if (currChan < (maxChan[ChanGroup] - 9 )) {
	incChan(9);
	} else {
		currChan = baseChn[ChanGroup] + (maxChan[ChanGroup] - currChan);
	}
	do
	{
	        incChan(1);
	}
	while (!channels[currChan]);
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
			showDisplay(currChan.toString(), false, 100, 0 );
		}
	} else if(isSchedule == 0){
	   if(NowNext) {	
		settimer(EPG[1][2][currChan],EPG[1][1][currChan],0,1,"",(EPG[1][4][currChan] + EPG[1][5][currChan]),EPG[1][6][currChan].toString());
	   }
	}
        break;
   case "Green":
	if(isFullscreen) {
		if(!epgactive) {
			if (audio_dyn < (lang_prio_dyn.length -1)) { audio_dyn += 1} else { audio_dyn = 0 }
			if (lang_prio_dyn.length > 1) {
				is.setObject("cfg.media.audio.languagepriority",lang_prio_dyn[audio_dyn] + "," + lang_prio[audio],is.STORAGE_PERMANENT);
				osdlang.style.opacity = 1;
				osdlang.innerHTML = "<img src='unmute.png'> " + lang_prio_dyn[audio_dyn] + " ";
				setTimeout("osdlang.style.opacity = 0; ", 3000);
			}
		}
	} else if(isSchedule == 0 && !epgactive){
		colorkeys.innerHTML = "<font color=red> " +  NN[3 + NowNext] + " </font><font color=green> " + NN[NowNext] + " </font><font color=yellow> " + NN[2] + " </font><font color=blue> " + NN[5] + " </font>";
		NowNext = 1 - NowNext;
		showChannelList();
	}

	if(epgactive) {
		NowNext = 1 - NowNext;
		osdepginfo.style.opacity = 1 - osdepginfo.style.opacity ;
		osdepginfonext.style.opacity = 1 - osdepginfo.style.opacity;
	}


	break;
   case "Yellow":
	if(isFullscreen) {
		if(epgactive) {
			osdepginfo.style.opacity = 0;
			osdepginfonext.style.opacity = 0;
			epgactive = 0;
		}
		medialist.style.opacity = 0.9;
		set_yellow_key = 1;
		setTimeout("getSchedule(currChan);LoadMediaSettings();",100);
	} else {
		GetSchedule(currChan,15);
		schedule.style.opacity = 1 - schedule.style.opacity;
		isSchedule = schedule.style.opacity;
		if(isSchedule == 1){
			colorkeys.innerHTML = "<font color=red> " +  NN[4] + " </font><font color=green> " + NN[4] + " </font><font color=yellow> " + NN[6] + " </font><font color=blue> " + NN[4] + " </font>";
			} else {
			colorkeys.innerHTML = "<font color=red> " +  NN[3 + (1 - NowNext)] + " </font><font color=green> " + NN[1 - NowNext] + " </font><font color=yellow> " + NN[2] + " </font><font color=blue> " + NN[5] + " </font>";
			}
	}
	break;

   case "Info":
   case "Blue":
   case KEY_EPG:
//	if(isFullscreen) {
//	RestartPortal();
//	} else 
	if(isSchedule == 0) {
			if(!epgactive) {
			updateOSDtime(currChan);
			SetOsdInfo();
				if(isFullscreen) { NowNext = 0;}
				if (NowNext) {
					osdepginfo.style.opacity = 0;
					osdepginfonext.style.opacity = 1;
				} else {
					osdepginfo.style.opacity = 1;
					osdepginfonext.style.opacity = 0;
				}			
			epgactive = 1;		
			} else {
			osdepginfo.style.opacity = 0;
			osdepginfonext.style.opacity = 0;
			epgactive = 0;
			}
//		setTimeout("epgactive = 0; osdepginfo.style.opacity = 0; osdepginfonext.style.opacity = 0;", 5000);
	}
	break;
   case "BrowserBack":
	if(count) {
		count = 0;
		osdnr.style.opacity = 0;
		if(isFullscreen) {
			showDisplay(currChan.toString(), false, 100, 0 );
		}
		Change = 0;
	} else {
		if(isSchedule) {
			isSchedule = 0;
			schedule.style.opacity = 0;
			colorkeys.innerHTML = "<font color=red> " +  NN[3 + (1 - NowNext)] + " </font><font color=green> " 
				+ NN[1 - NowNext] + " </font><font color=yellow> " + NN[2] + " </font><font color=blue> " 
				+ NN[5] + " </font>";
			break;
		}

		if(isFullscreen) {
		//SHOW epg info
			if(!epgactive) {
//			SetOsdInfo();
//			osdepginfo.style.opacity = 1;
//			osdepginfonext.style.opacity = 0;
//			epgactive = 1;		
			} else {
			osdepginfo.style.opacity = 0;
			osdepginfonext.style.opacity = 0;
			epgactive = 0;
			}
//		setTimeout("epgactive = 0; osdepginfo.style.opacity = 0; osdepginfonext.style.opacity = 0;", 5000);
		} else if(!isFullscreen){
			osdepginfo.style.opacity = 0;
			osdepginfonext.style.opacity = 0;
			epgactive = 0;
			isFullscreen = 1;
			FullScreen();
			currChan = preChan;
			ChanGroup = preGrp;
		}
	}
	break;

   case "Enter":
	// OK key on frontpanel
   case KEY_OK:
	if(isFullscreen) {
	// fullscreen
		if (osdmain.style.opacity !== 0) {opacity = 0; OSD(opacity);}
		if(count == 0) {
			if (osdtimeout) {
				clearTimeout(osdtimeout);
				osdtimeout = 0;
				opacity = 0;
				OSD(opacity);
				break;
				}
		osdepg.innerHTML = "";
		showOSD();
	        GetEPG(currChan);
		updateOSDtime(currChan);
		osdepg.innerHTML = "<p>" + EPG[0][7][currChan] + "</p>\n<p>" + EPG[1][7][currChan] + "</p>";
//		showOSD();
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
		if(isSchedule) { isSchedule = 0; schedule.style.opacity = 0; }
	        play(channels[currChan]);
		}
	}
        break;

   case "Menu":
		if(isFullscreen) {
			if(count) {
				count = 0;
				osdnr.style.opacity = 0;
				showDisplay(currChan.toString(), false, 100, 0 );
				Change = 0;
			}
		osdepginfo.style.opacity = 0;
		osdepginfonext.style.opacity = 0;
		isSetupMenu = 1;
		mainmenu.style.opacity = 0.8;
		menu = 0;
		InitMenu(menu);
		}
		break;
   case KEY_FAV:
   case "Scroll":
		if(isFullscreen) {
			NowNext = 0;
			videoplane.style.width = (320*Xfactor[Set_Res])+"px";
			videoplane.style.height = (240*Yfactor[Set_Res])+"px";
			videoplane.style.left = (380*Xfactor[Set_Res])+"px";
			videoplane.style.top = (300*Yfactor[Set_Res])+"px";
			isFullscreen = 0;
			ClearScreen();
			channellist.style.opacity = 1;
			colorkeys.innerHTML = "<font color=red> " +  NN[3 + (1 - NowNext)] + " </font><font color=green> " + NN[1 - NowNext] + " </font><font color=yellow> " + NN[2] + " </font><font color=blue> " + NN[5] + " </font>";
			colorkeys.style.opacity = 1;
			showChannelList();
			if(!SwitchGuide) {
			preChan = currChan;
			preGrp = ChanGroup;
			}
		} else {
			isSchedule = 0;
			schedule.style.opacity = 0;
			isFullscreen = 1;
			FullScreen();
			if(!SwitchGuide) {
			currChan = preChan;
			ChanGroup = preGrp;
			}
		}
		break;
    case "TV":
    case "RADIO":
	if(isFullscreen) {
		if(ChanGroup !== 9) {
		//Radio
		defChan[ChanGroup] = currChan;
		ChanGroup = 9;
		currChan = defChan[9];
		} else {
		//TV
		defChan[ChanGroup] = currChan;
		ChanGroup = 0;
		currChan = defChan[0];
		}
		isSetupMenu = 0;
		mainmenu.style.opacity = 0;
		play(channels[currChan]);
	}
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

   case KEY_A:// |> key on old long kpn 1710/1760 remote
        break;
   case KEY_B:// hh key on old long kpn 1710/1760 remote
	if (prevChan !== currChan) {
		currChan = [prevChan, prevChan = currChan][0];
		count = 0;
		play(channels[currChan]);
		}
	break;
   case KEY_C:// @ key on old long kpn 1710/1760 remote
	if(isFullscreen && Fav_max_channel !== 0 && ChanGroup !== Fav_group) {
	timerID = (defChan[Fav_group] - Fav_base - 1); if (timerID < 0) { timerID = 0;}
	maxTimers = Fav_max_channel;
	GotoFav(defChan[Fav_group]);
	} else if(isFullscreen && ChanGroup == Fav_group) {
	timerID = (currChan - Fav_base - 1);
	}
	if(isFullscreen && Fav_max_channel !== 0) {
		if(count) {
			count = 0;
			osdnr.style.opacity = 0;
			showDisplay(currChan.toString(), false, 100, 0 );
			Change = 0;
		}
		osdepginfo.style.opacity = 0;
		osdepginfonext.style.opacity = 0;
		isSetupMenu = 1;
		mainmenu.style.opacity = 0.8;
		menu = 10;
		InitMenu(menu);
	}


        break;
   case KEY_D:// >@ key on old long kpn 1710/1760 remote
	if (protChn[ChanGroup] !== 1 && ChanGroup !== Fav_group) {
		AddtoFav();
	}
	break;

   case "Teletext":
	if(isFullscreen) {
		ClearScreen();
		isVisible = 1;
		setVisible(isVisible);
		}
	break;
    case "VolumeMute":
	VolumeMute();
	break;
    case "VolumeUp":
	VolumeUp();
	break;
    case "VolumeDown":
	VolumeDown();
	break;

    case "MediaRewind":
	if(isFullscreen) {
	      mediaPlayer.play(mediaPlayer.PACE_REWIND);
	} else {
		count = 0; Change = 0;
		defChan[ChanGroup] = currChan;
		do {
			do
				ChanGroup -= 1;
			while (protChn[ChanGroup] == 1 && ShowProtectedChannels == 1) 
			if (ChanGroup < 0) {
				ChanGroup = 9;
			}
		}
		while (!minChan[ChanGroup]);
		currChan = defChan[ChanGroup];
		preview(channels[currChan]);
	}
	break;
    case "MediaForward":
	if(isFullscreen) {
	      mediaPlayer.play(mediaPlayer.PACE_FASTFORWARD);
	} else {
	count = 0; Change = 0;
	defChan[ChanGroup] = currChan;
	do{
		do
			ChanGroup += 1;
		while (protChn[ChanGroup] == 1 && ShowProtectedChannels == 1)
		if (ChanGroup > 9) {
			ChanGroup = 0;
			}
		}
	while (!minChan[ChanGroup]);
	currChan = defChan[ChanGroup];
        preview(channels[currChan]);
	}
	break;
	case "MediaPlayPause":

		if(isFullscreen && PauseOnServer) {
		   	if(mediaPlayer.getState() == mediaPlayer.STATE_PLAYING) {
				isPause = 1;
				ServerPause();
				SetLed(1,1,10);
//				setTimeout("mediaPlayer.play(0);",5000);
				mediaPlayer.play(0);
				break;
			}
			if(mediaPlayer.getState() == mediaPlayer.STATE_PAUSED || mediaPlayer.getState() == mediaPlayer.STATE_FASTFORWARDING ||
			   mediaPlayer.getState() == mediaPlayer.STATE_REWINDING) {
				SetLed(1,1,0);
				mediaPlayer.play(mediaPlayer.PACE_PLAY);
				break;
			}

		}

		if(TimeShift){
			if(mediaPlayer.getState() == mediaPlayer.STATE_PAUSED || mediaPlayer.getState() == mediaPlayer.STATE_FASTFORWARDING || mediaPlayer.getState() == mediaPlayer.STATE_REWINDING) {
				SetLed(1,1,0);
				mediaPlayer.play(mediaPlayer.PACE_PLAY);
				break;
			}
		   	if(mediaPlayer.getState() == mediaPlayer.STATE_PLAYING) {
				SetLed(1,1,10);
				mediaPlayer.play(0);
				break;
			}
		}
		break;
	case "MediaStop":
		try {
		SetLed(1,1,0);
		if(TimeShift){ mediaPlayer.playFromPosition(mediaPlayer.POSITION_LIVE,mediaPlayer.PACE_PLAY); }
		} catch(e) {
			alert(e);
		}
	break;
	case KEY_REC:
	case KEY_REC2:
	if(isSchedule == 0) {
			if(epgactive) {
				ServerTimer(channels[currChan],EPG[NowNext][6][currChan]);
				settimer(EPG[NowNext][2][currChan],EPG[NowNext][1][currChan],(EPG[NowNext][3][currChan]*60),2);
			} else {
				ServerRecordStart();
			}
	}
//	if(isFullscreen && !epgactive) {
//		ServerRecordStart();
//	} else if(isSchedule == 0){
//		if(NowNext) {
//		} else {
//			// make timer for recording
//			ServerTimer(channels[currChan],EPG[NowNext][6][currChan]);
//			settimer(EPG[NowNext][2][currChan],EPG[NowNext][1][currChan],(EPG[NowNext][3][currChan]*60),2);
//		} else {
//			ServerRecordStart();
//		}
//	}


	break;
	case KEY_OPNAMES:
	case KEY_FILM:
	case KEY_DVR:
	if (smartTVplugin) {
	// jump to recordings menu.
		if(isFullscreen) {
			if(count) {
				count = 0;
				osdnr.style.opacity = 0;
				showDisplay(currChan.toString(), false, 100, 0 );
				Change = 0;
			}
		osdepginfo.style.opacity = 0;
		osdepginfonext.style.opacity = 0;
		medialist.style.opacity = 0.9;
		mainmenu.style.opacity = 0;
		recPath = "/recordings.xml";
		setTimeout("getRecList();LoadMediaSettings();",100);
		}
		break;
	}
	default:
        break;
    }
  }
}


function GotoFav(ChanID) {
		count = 0; Change = 0;
		prevChan = ""; Fav_key1 = "";
		defChan[ChanGroup] = currChan;
		ChanGroup = Fav_group;
		currChan = ChanID;
		play(channels[currChan]);
}


function AddtoFav() {
	Fav_max_channel  += 1;
	maxChan[Fav_group] = Fav_base + Fav_max_channel;
	channelsnames[(Fav_base + Fav_max_channel)] = channelsnames[currChan];
	channels[(Fav_base + Fav_max_channel)] = channels[currChan];
		is.setObject(("vip.channelsnames." + Fav_max_channel),channelsnames[currChan],is.STORAGE_PERMANENT)
		is.setObject(("vip.channels." + Fav_max_channel),channels[currChan],is.STORAGE_PERMANENT)
		is.setObject("vip.fav_max_channel",Fav_max_channel.toString(),is.STORAGE_PERMANENT)
	settimer(0,channels[currChan],Fav_max_channel ,2);
}


function Read_Fav() {
	Fav_max_channel = Number(is.getObject("vip.fav_max_channel"));
	maxChan[Fav_group] = Fav_base + Fav_max_channel;
		for (var i=1; i<=Fav_max_channel; i++) {
		channelsnames[(i+Fav_base)] = is.getObject(("vip.channelsnames." + i));
		channels[(i+Fav_base)] = is.getObject(("vip.channels." + i));
		}
}


function Makedigit() {
	prevChan = currChan;
	Change = (Change*10) + digit;
	count += 1;
	osdnr.style.opacity = isFullscreen; 
        OSDchannr(Change);
	if(isFullscreen) {
		showDisplay((Change.toString()), false, 100, 0 ); 
	}

    if (count>channeldigits) {
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
	CheckThis = baseChn[ChanGroup] + CheckThis;
	if(channels[CheckThis]) {
		ChangeOK = 1;
		currChan = CheckThis;
	} else {
		ChangeOK = 0;
	}
	if(prevChan == currChan) { 
	ChangeOK = 0 ;
	}
	osdnr.style.opacity = 0;
	if(isFullscreen) {
	showDisplay(currChan.toString(), false, 100, 0 );
	}
	Change = 0;

}


function showDisplay(showtxt,colonState,intensity,currentMode) {
	if(!showClock){
		if (Number(showtxt) > 8999 && Number(showtxt) < 10000) { showtxt = "R" + Right(showtxt,3); }
		if (Number(showtxt) > 9999 && Number(showtxt) < 20000) { showtxt = "F" + Right(showtxt,3); }
	showtxt = Right(showtxt,4);
	fps.setSegmentDisplayState(toi.statics.ToiFrontPanelServiceSegmentDisplayState.create(showtxt,colonState,intensity,currentMode));
	}
}


function SetLed(NumLed,color,blinkfreq){
	var state = toi.statics.ToiFrontPanelServiceLedState.create(color, blinkfreq);
	fps.setLedState(NumLed, state);
}


function showOSD() {
	if (osdtimeout) {
		clearTimeout(osdtimeout);
	}
	SetOsdInfo();
	opacity = 0.8;
	OSD(opacity);
	osdtimeout = setTimeout("fadeOut(); osdtimeout = 0;", ShowOsdTime);
}

function showVolume() {
	if (osdVolumetimeout) {
		clearTimeout(osdVolumetimeout);
	}
	osdvolume.innerHTML = Lang[1] + " : " + Volume + "% \uE007" + (new Array(Volume)).join("\uE008") + (new Array(100 - Volume)).join("\uE009") + "\uE00A";
	osdvolume.style.opacity = 1;
	osdVolumetimeout = setTimeout("osdvolume.style.opacity = 0;", ShowOsdTime);
}


function OSD(opacity) {
    osdmain.style.opacity = opacity;
    osdnr.style.opacity = opacity;
    osdtime.style.opacity = opacity;
    osdname.style.opacity = opacity;
    osdepg.style.opacity = opacity;
    osdca.style.opacity = opacity;
    osdtimer.style.opacity = opacity;
}


function SetOsdInfo() {
    OSDchannr(currChan);
    date_time();
    OSDhtml();
    return;
}

function onCacheUpdated() {
        GetEPG(currChan);
	if (osdtimeout) { SetOsdInfo();	} 
}

function OSDchannr(channr) {
//	Show logo's
	if (experimental) {
//	osdnr.innerHTML = "<img src='" + channels[currChan] + ".logo.jpg' style='width:80%; max-height:100%; position:absolute; left:10%;' >";
	}
	osdnr.innerHTML = "<center>" + Right(channr,3) + "</center>";
}

function OSDhtml(){
    osdtime.innerHTML = result;
	if (ShowSource == 1) {
	    osdname.innerHTML = channels[currChan].split("-")[0] + "\uE003" + Left(channelsnames[currChan],30);
	} else {
	    osdname.innerHTML = Left(channelsnames[currChan],30);
	}
    osdepg.innerHTML = "<p>" + EPG[0][7][currChan] + "</p>\n<p>" + EPG[1][7][currChan] + "</p>";
    osdepginfo.innerHTML =  "<center><p style='" + color_epg_head + ";' >" + currChan + "\uE003" + channelsnames[currChan] + "</p><p style='" + color_epg_avinfo + ";' >" + AvInfo[currChan] + "</p><p style='" + color_epg_title + ";'>" + EPG[0][7][currChan] + EPG[0][9][currChan] + EPG[0][8][currChan] + "</p>\n<p style='" + color_epg_info + ";'>" + EPG[0][4][currChan] + "</p>\n<p>" + Left(EPG[0][5][currChan],750) + "</p></center>";
    osdepginfonext.innerHTML =  "<center><p style='" + color_epg_head + ";'>"  + currChan + "\uE003" + channelsnames[currChan] + "</p><p style='" + color_epg_title + ";'>" +  EPG[1][7][currChan] + EPG[1][9][currChan] + EPG[1][8][currChan] + "</p>\n<p style='" + color_epg_info + ";'>" + EPG[1][4][currChan] + "</p>\n<p>" + Left(EPG[1][5][currChan],750) + "</p></center>";
}

function updateOSDtime(timchan) {

	tijd = EPG[0][2][timchan];
	date = new Date(tijd*1000); 
	tijd = date.toUTCString();
	tijd = new Date(tijd);
	dateCurrent = new Date();
	var EPGminutes = Math.floor((dateCurrent.getTime() - date.getTime()) /1000/60);
	var tm = tijd.getMinutes();
	var th = tijd.getHours();
	th=addzero(th);
	tm=addzero(tm);

	EPG[0][7][timchan] =  th + ":" + tm + " (" + EPGminutes + " / " + ((EPG[0][3][timchan])-EPGminutes).toFixed(0) + ")" + " " + EPG[0][1][timchan] + " ";
	if (!EPG[0][2][timchan] || ((EPG[0][3][timchan]-EPGminutes) < 0))
	{
		EPG[0][7][timchan] = " ";
	}

}


function settimer(ProgTime,ProgName,ProgDura,SwitchTimer,BackGroundColor,ProgDesc,ProgEvID) {

if (!BackGroundColor) { BackGroundColor = DefaultBGColor;}
// 1 - switchonly, 2 - record on server (display info only), 3 - record local
	if(SwitchTimer == 1) {	
		  try {
		    var x = ss.schedule("SwitchOnly","notification", ProgTime , ProgDura);
		    ss.setParameter(x, "Channel", currChan.toString() );
		    ss.setParameter(x, "Title", ProgName );
		    ss.setParameter(x, "Info", ProgDesc);
		    ss.setParameter(x, "active", "False");
		    ss.setParameter(x, "Type", "\uE00C"); //Timer Symbol
		    ss.setParameter(x, "resume", "0");
		    ss.setParameter(x, "Eventid", ProgEvID);

		  }
		  catch (e) {
			    ProgName = "ERROR" ;
			    BackGroundColor = "red";
		  }
	} else if(SwitchTimer == 3) {
		ProgTime -= preRecTime;
		ProgDura = Number(ProgDura) + (afterRecTime + preRecTime);
		var y = (new Date().getTime()/1000).toFixed(0); 
		if(ProgTime < y) { 
			ProgDura = ProgDura - (y - ProgTime);
			ProgTime = y; 
			}
			
		  try {
		    var x = ss.schedule("RecLocal","record_hd_from_ip", ProgTime , ProgDura);
		    if (x != 0) {
			    ss.setParameter(x, "Channel", currChan.toString() );
			    ss.setParameter(x, "Title", ProgName );
			    ss.setParameter(x, "Info", ProgDesc);
			    ss.setParameter(x, "active", "False");
			    ss.setParameter(x, "Type", "\uE00C"); //Timer Symbol
			    ss.setParameter(x, "resume", "0");
			    ss.setParameter(x, "Eventid", ProgEvID);
		    } else {
			    ProgName = "ERROR" ;
			    BackGroundColor = "red";
		    }
		  } catch (e) {
		    alert(e);
		  }
	}

	if ( ProgTime == 0 && SwitchTimer == 2 && ProgDura !== 0 ) {
		var x = Lang[3] + ProgDura + "</pre>";
	} else if ( ProgTime == 0 && SwitchTimer == 2) {
		var x = "</pre>";
	} else {
		tijd = ProgTime;
		date = new Date(tijd*1000); 
		tijd = date.toUTCString();
		tijd = new Date(tijd);
		var tm = tijd.getMinutes();
		var th = tijd.getHours();
		th=addzero(th);
		tm=addzero(tm);
		var x = Lang[4] + th + ":" + tm  + "</pre>";
	}

	switchtimer.style.background = BackGroundColor;
	switchtimer.innerHTML = "<pre>" + Lang[2] + Left(ProgName,30) + "\n" + Lang[3] + channelsnames[currChan] + "\n" + x;
	setOSDtimer();

	switchtimer.style.opacity = 1;
	setTimeout("switchtimer.style.opacity = 0;", ShowSetTimer);

}


function setOSDtimer() {
		// Only for type "SwitchOnly"
		var today = new Date;
		today = today / 1000;
		var x = ss.getBookingIds("SwitchOnly", today, 0)
		if (x.length !== 0) {
		tijd = ss.getNextStartTime("SwitchOnly");
		date = new Date(tijd*1000); 
		tijd = date.toUTCString();
		tijd = new Date(tijd);
		var tm = tijd.getMinutes();
		var th = tijd.getHours();
		th=addzero(th);
		tm=addzero(tm);
		osdtimer.innerHTML = "<p style='" + color_osdtimer + ";font-size:" + fsList + ";'>" + th + ":" + tm + "</p>";
		SetLed(0,2,1);
		switchicon = "\uE00C";
		osdca.innerHTML = CAicon + switchicon + RECicon;
		} else {
		osdtimer.innerHTML = " ";
		SetLed(0,0,0);
		switchicon = '\uE003';
		osdca.innerHTML = CAicon + switchicon + RECicon;
		}
}

// Left n characters of str
function Left(str, n){
  if (n <= 0)
    return "";
  else if (n > String(str).length)
    return str;
  else
    return String(str).substring(0,n);
}

// Right n characters of str
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

function fadeIn() {
    opacity += 0.2;
	    OSD(opcity);
    if (opacity >= 1) {
	setTimeout("fadeOut()", 200);
	return;
    }
    setTimeout("fadeIn()", 100);
}

function fadeOut() {
    opacity -= 0.5;
	OSD(opacity);
    if (opacity <= 0) {
	return;
    }
    setTimeout("fadeOut()", 100);
}

function RestartPortal(){

    try {
	ids = toi.applicationService.getApplicationIds();
	for ( i = 0; i < ids.length; ++i ){
	    info = toi.applicationService.getInfo(ids[i]);
	    if (info.applicationName == "WebKit Portal"){
		 dump("Killing app " + ids[i] + ": " + info.applicationName);
		 toi.applicationService.kill(ids[i]);
	    }
	}
    }
    catch(e) { dump(e) };
}

function date_time()
{
        date = new Date;
        year = date.getFullYear();
        month = date.getMonth();
        d = date.getDate();
        day = date.getDay();
        h = date.getHours();
        m = date.getMinutes();
	h=addzero(h);
	m=addzero(m);
        result = ''+days[day]+' '+d+' '+months[month]+' '+year+' '+h+':'+m;
        return;
}

function date_time_rec()
{
        date = new Date(Number(recStrt[currMed])*1000);
        year = date.getFullYear();
        month = date.getMonth();
	month = addzero(month + 1);
        d = date.getDate();
	d = addzero(d);
        day = date.getDay();
        h = date.getHours();
        m = date.getMinutes();
	h = addzero(h);
	m = addzero(m);
	if (year!==1970) { 
        	result = ' ' + d + '-' + month + '-' + year + ' ' + h + ':' + m;
	} else {
		result = "";
	}
	return;
}

// EPG Section

function GetEPG(epgchan)
{
	EPG[0][7][epgchan] = "";
	EPGShortnow = "";
	EPGExtnow = "";
	EPG[1][7][epgchan] = "";
	EPGShortnext = "";
	EPGExtnext = "";
	SI="";
  try {

	eitCache.clearServices();

	 StreamInfo(epgchan);

	 eitService = toi.statics.ToiDvbEitCacheServiceItem.create(SI[1],SI[2],SI[3]);
	 eitCache.addService(eitService);
	 event = eitCache.getPresentEvent(eitService);
	if(event.freeCaMode){
		CAicon = "\uE00D";
	} else {
		CAicon = Radioicon;
	}

		osdca.innerHTML = CAicon + switchicon + RECicon;

	if (event.name)	{
	 events = eitCache.getEvents(eitService, (Math.round(new Date().getTime()/1000.0)), 2000000000);
 	    extEventsnow = eitCache.getExtendedEventInfo(eitService, events.infoSequence[0].eventId);
	    EPGShortnow = extEventsnow.shortInfo;
	    EPGExtnow = extEventsnow.extendedInfo;
	    Extok = 1;

	} else { Extok = 0; }



	EPG[0][1][epgchan] = event.name;
	EPG[0][2][epgchan] = event.time;
	EPG[0][3][epgchan] = (event.duration/60);
//	EPG[0][4][epgchan] = "";
//	EPG[0][5][epgchan] = "";
	EPG[0][6][epgchan] = event.eventId;
	if (event.parentalRating) {
		EPG[0][8][epgchan] = "<br>(" + Lang[5] + (event.parentalRating + 3) + " )";
	} else {
		EPG[0][8][epgchan] = "";
	}

	if (event.contentNibbles) {
		connib = event.contentNibbles;
		Nibbles();
		EPG[0][9][epgchan] = "<br>" + content;
	} else {
		EPG[0][9][epgchan] = "";
	}


	if(EPGShortnow) {
	EPG[0][4][epgchan] = EPGShortnow;
	} else {
	EPG[0][4][epgchan] = "";
	}
	if(EPGExtnow) {
	EPG[0][5][epgchan] = EPGExtnow;
	} else {
	EPG[0][5][epgchan] = "";
	}

	if (EPG[0][5][epgchan] == EPG[0][4][epgchan]) { EPG[0][5][epgchan] = "";}



	updateOSDtime(epgchan);

	 event = eitCache.getFollowingEvent(eitService);
	if (Extok) {
		for (var i = 0; i < events.infoSequence.length && i < 4; i++) {
	 	    extEvents = eitCache.getExtendedEventInfo(eitService, events.infoSequence[i].eventId);
			if (extEvents.eventId == event.eventId) {
			    EPGShortnext = extEvents.shortInfo;
			    EPGExtnext = extEvents.extendedInfo; 
			}
		}
	}

	EPG[1][1][epgchan] = event.name;
	EPG[1][2][epgchan] = event.time;
	EPG[1][3][epgchan] = (event.duration/60);
//	EPG[1][4][epgchan] = "";
//	EPG[1][5][epgchan] = "";
	EPG[1][6][epgchan] = event.eventId;
	if (event.parentalRating) {
		EPG[1][8][epgchan] = "<br>(" + Lang[5] + (event.parentalRating + 3) + " )";
	} else {
		EPG[1][8][epgchan] = "";
	}

	if (event.contentNibbles) {
		connib = event.contentNibbles;
		Nibbles();
		EPG[1][9][epgchan] = "<br>" + content;
	} else {
		EPG[1][9][epgchan] = "";
	}

	if(EPGShortnext) {
	EPG[1][4][epgchan] = EPGShortnext;
	} else {
	EPG[1][4][epgchan] = "";
	}
	if(EPGExtnext) {
	EPG[1][5][epgchan] = EPGExtnext;
	} else {
	EPG[1][5][epgchan] = "";
	}
	
	if (EPG[1][5][epgchan] == EPG[1][4][epgchan]) { EPG[1][5][epgchan] = "";}

	tijd = event.time;
	date = new Date(tijd*1000); 
	tijd = date.toUTCString();
	tijd = new Date(tijd);
	var tm = tijd.getMinutes();
	var th = tijd.getHours();
	th=addzero(th);
	tm=addzero(tm);
	 EPG[1][7][epgchan] = th + ":" + tm + " (" + (event.duration/60).toFixed(0) + ")" + "          " + event.name + " ";

	if (!event.time) 
	{
		EPG[1][7][epgchan] = " ";
	}


  } catch(e) {
    alert("Get EPG problem: " + e);
    CAicon = "\uE01A";
  }
} 


function Nibbles() {
	content = "";
	if (connib >= 0x00001000 && connib < 0x00002000) { content = CLang[0]; }
	if (connib >= 0x00002000 && connib < 0x00003000) { content = CLang[10]; }
	if (connib >= 0x00003000 && connib < 0x00004000) { content = CLang[20]; }
	if (connib >= 0x00004000 && connib < 0x00005000) { content = CLang[30]; }
	if (connib >= 0x00005000 && connib < 0x00006000) { content = CLang[40]; }
	if (connib >= 0x00006000 && connib < 0x00007000) { content = CLang[50]; }
	if (connib >= 0x00007000 && connib < 0x00008000) { content = CLang[60]; }
	if (connib >= 0x00008000 && connib < 0x00009000) { content = CLang[70]; }
	if (connib >= 0x00009000 && connib < 0x0000A000) { content = CLang[80]; }
	if (connib >= 0x0000A000 && connib < 0x0000B000) { content = CLang[90]; }
	if (connib >= 0x0000B000 && connib < 0x0000C000) { content = CLang[100]; }
	// alert(connib);
}


function GetSchedule(schchan,tablelength){
	//Old style Schedule, used in Guide View.
	SI = "";
  try {
	 StreamInfo(schchan);

	 eitService = toi.statics.ToiDvbEitCacheServiceItem.create(SI[1],SI[2],SI[3]);
	 eitCache.addService(eitService);
	 event = eitCache.getPresentEvent(eitService);
	 events = eitCache.getEvents(eitService, (Math.round(new Date().getTime()/1000.0)), 2000000000);

	if (event.name)	{
	    if (events.more) {
	      var t = eitCache.getEvents(eitService, (Math.round(new Date().getTime()/1000.0)), 2000000000);
	      events.infoSequence.concat(t.infoSequence);
	      events.more = t.more;
	    }

	    var txt = "<table><tr>";
	    var i = 0;
	    for (i = 0; i < events.infoSequence.length && i < tablelength; i++) {

		while ((i > 0) && (events.infoSequence[i].eventId == events.infoSequence[(i-1)].eventId)) {
			i = i + 1;
		}

		tijd = events.infoSequence[i].time;
		date = new Date(tijd*1000); 
		tijd = date.toUTCString();
		tijd = new Date(tijd);
		var tm = tijd.getMinutes();
		var th = tijd.getHours();
		th=addzero(th);
		tm=addzero(tm);

	      txt = txt + "<td style='font-size:" + fsSchedList + ";" + color_sched_font + ";'>\uE003\uE003\uE003\uE003\uE003" + th + ":" + tm + "     (" + (events.infoSequence[i].duration/60).toFixed(0) + ")  " + Left(events.infoSequence[i].name,30) + "</td></tr>";
	    }
	   txt = txt + "</table>";
	   schedule.innerHTML = "<p style='" + color_sched_head + ";font-size:" + fsSched + ";'>" + "\uE003" + schchan + "\uE003" + channelsnames[schchan] + txt + "</p>";
	} else {
	  schedule.innerHTML = "<p style='" + color_sched_head + ";font-size:" + fsSched + ";'>" + "\uE003" + schchan + "\uE003" + channelsnames[schchan] + "</p>";
	}

  } catch(e) {
    alert("Get EPG problem: " + e);
    schedule.innerHTML = "<p style='" + color_sched_head + ";font-size:" + fsSched + ";'>" + "\uE003" + schchan + "\uE003" + channelsnames[schchan] + "</p><p>" + Lang[6] + "</p>";
  }

}


function StreamInfo(si) {
	// EPG Filter
	// streaminfo
	// SI[x] 0-sat,1-NID,2-TID,3-SID
 	SI=channels[si].split("-");

	//default setting : English
	is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);

	if(SI[0]=="C") {
	// Default on Cable - Dutch // Ziggo.
	is.setObject("cfg.locale.ui","dut",is.STORAGE_VOLATILE);
	}

	if(SI[0]=="T") {
	// DVB-T default German.
	is.setObject("cfg.locale.ui","ger",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="8720") {
	// KPN DVB-T (might also be used for some german)
	is.setObject("cfg.locale.ui","dut",is.STORAGE_VOLATILE);
	}

	if(SI[0]=="S19.2E") {
	// Default on 19E German.
	is.setObject("cfg.locale.ui","ger",is.STORAGE_VOLATILE);
	}

	if(SI[0]=="S28.2E") {
	// Default on 28E English
	is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);
	} 

	if(SI[0]=="S42.0E") {
	is.setObject("cfg.locale.ui","tur",is.STORAGE_VOLATILE);
	} 

	if(SI[0]=="S42.0E" && SI[3]=="3601") {
	is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);
	} 

	if(SI[1]=="133") {
	//sky deutchland
	is.setObject("cfg.locale.ui","DEU",is.STORAGE_VOLATILE);
	}

	if(SI[2]=="1107") {
	//Sat1/pro7 deutchland
	is.setObject("cfg.locale.ui","DEU",is.STORAGE_VOLATILE);
	}

//	if(SI[2]=="1057") {
//	//RTL HD transponder
//	is.setObject("cfg.locale.ui","GER",is.STORAGE_VOLATILE);
//	}

//	if(SI[2]=="1057" && SI[3]=="61204") {
//	//Sport1 HD (daytime only?)
//	is.setObject("cfg.locale.ui","DEU",is.STORAGE_VOLATILE);
//	}

	if(SI[2]=="1055" || SI[2]=="1053" || SI[2]=="1041" || SI[2]=="1017" || SI[2]=="1109") {
	//HD+ transponder
	is.setObject("cfg.locale.ui","DEU",is.STORAGE_VOLATILE);
	}

	if(SI[0]=="S13.0E" && (SI[2]=="1600" || SI[2]=="1000" || SI[2]=="1500" || SI[2]=="1300" || SI[2]=="300" || SI[2]=="1100" )) {
	//NC+ (Polish)
	is.setObject("cfg.locale.ui","pol",is.STORAGE_VOLATILE);
	}

	if(SI[0]=="S13.0E" && (SI[2]=="11200" || SI[2]=="400" || SI[2]=="12000" || SI[2]=="11400" || SI[2]=="11900" || SI[2]=="11600" )) {
	//NC+ (Polish)
	is.setObject("cfg.locale.ui","pol",is.STORAGE_VOLATILE);
	}

	if(SI[0]=="S13.0E" && (SI[2]=="11000" || SI[2]=="1400")) {
	//NC+ (Polish)
	is.setObject("cfg.locale.ui","pol",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="113") {
	//PolSat
	is.setObject("cfg.locale.ui","pol",is.STORAGE_VOLATILE);
	}

	if((SI[0]=="S19.2E" && SI[2]=="1059") ) {
		//TVP transponder
		is.setObject("cfg.locale.ui","pol",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="64511") {
	//sky Italia
	is.setObject("cfg.locale.ui","ita",is.STORAGE_VOLATILE);
	}

	if(SI[0]=="S13.0E" && (SI[2]=="5400" || SI[2]=="12400" || SI[2]=="65419" || SI[2]=="65417" )) {
	//Rai Italia
	is.setObject("cfg.locale.ui","ita",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="53" ) {
	//Canal Digitaal/ TV Vlaanderen 
	is.setObject("cfg.locale.ui","dut",is.STORAGE_VOLATILE);
	}

	if(SI[0]=="S19.2E" && SI[2]=="1048" && SI[3]=="4320" ) {
	//BVN
	is.setObject("cfg.locale.ui","dut",is.STORAGE_VOLATILE);
	}


	if(SI[1]=="54") {
	//ZON / 30W
	is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="83") {
	//MEO / 30W
	is.setObject("cfg.locale.ui","por",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="49") {
	//Digital 30W
	is.setObject("cfg.locale.ui","spa",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="3" && ( SI[2]=="3202" || SI[2]=="3208" || SI[2]=="3211" || SI[2]=="3222" || SI[2]=="3225") ) {
	//Canal Digitaal/ TV Vlaanderen (NID:3 is used for more than only CDS/TVV on 23East)
	is.setObject("cfg.locale.ui","dut",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="3" && SI[2]=="3208" && SI[3]=="7037") {
	// Some other EPG
	is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="3" && ( SI[2]=="3217") ) {
	// 23E - Deluxe HD
	is.setObject("cfg.locale.ui","DEU",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="3" && SI[2]=="3212" && ( SI[3]=="14052" || SI[3]=="14055" ) ) {
	is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="3" && ( SI[2]=="3205" || SI[2]=="3209" || SI[2]=="3210" || SI[2]=="3221" || SI[2]=="3219" || SI[2]=="3226")) {
	//Canal Digitaal/ TV Vlaanderen use CZE channels on 23East
	// Strangly set filter to cze but epg is in Dutch. (But not for JimJam)
	is.setObject("cfg.locale.ui","cze",is.STORAGE_VOLATILE);
	}

	if(SI[1]=="3" && SI[2]=="3211" && ( SI[3]=="20863" || SI[3]=="20865") ) {
	//MGM & Film+ CZ
	is.setObject("cfg.locale.ui","cze",is.STORAGE_VOLATILE);
	}

	if((SI[0]=="S13.0E" && SI[3]=="14003") || (SI[0]=="S13.0E" && SI[3]=="14009") || (SI[0]=="S13.0E" && SI[3]=="14051") || (SI[0]=="S13.0E" && SI[3]=="951")) {
	//Swiss ITA channels
		is.setObject("cfg.locale.ui","ita",is.STORAGE_VOLATILE);
	}

	if((SI[0]=="S13.0E" && SI[2]=="12800")) {
		is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);
	}

	if((SI[0]=="S13.0E" && SI[3]=="14002") || (SI[0]=="S13.0E" && SI[3]=="14008") || (SI[0]=="S13.0E" && SI[3]=="17203") || (SI[0]=="S13.0E" && SI[3]=="17204") ) {
	//Swiss FRA channels
		is.setObject("cfg.locale.ui","fra",is.STORAGE_VOLATILE);
	}

	if((SI[0]=="S13.0E" && SI[3]=="17201") || (SI[0]=="S13.0E" && SI[3]=="17202") || (SI[0]=="S13.0E" && SI[3]=="901") || (SI[0]=="S13.0E" && SI[3]=="907") || (SI[0]=="S13.0E" && SI[3]=="911") ) {
	//Swiss GER channels
		is.setObject("cfg.locale.ui","ger",is.STORAGE_VOLATILE);
	}

	if((SI[0]=="S19.2E" && SI[2]=="1111" && SI[3]=="7290") ) {
		//Sky News on WDR HD transponder
		is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);
	}

	if(SI[0]=="S19.2E" && ( (SI[2]=="1018") || (SI[2]=="1020") || (SI[2]=="1022") || (SI[2]=="1024") || (SI[2]=="1026") || (SI[2]=="1068") || (SI[2]=="1070") || (SI[2]=="1072") || (SI[2]=="1074") || (SI[2]=="1076") || (SI[2]=="1080") || (SI[2]=="1084") || (SI[2]=="1086") || (SI[2]=="1090") || (SI[2]=="1092") || (SI[2]=="1094") || (SI[2]=="1096") || (SI[2]=="1100") || (SI[2]=="1102") || (SI[2]=="1106") || (SI[2]=="1110") || (SI[2]=="1112") || (SI[2]=="1114") || (SI[2]=="1116") || (SI[2]=="1118") || (SI[2]=="1120"))) {
	//CanalSat S19.2
		is.setObject("cfg.locale.ui","fra",is.STORAGE_VOLATILE);
	}

	// MTV transponder 1078 / 1066
	if(SI[0]=="S19.2E" && SI[2]=="1078" && ( SI[3]=="28674" || SI[3]=="28675" || SI[3]=="28677" )) {
	//Nick JR France
		is.setObject("cfg.locale.ui","fra",is.STORAGE_VOLATILE);
	}
	if(SI[0]=="S19.2E" && SI[2]=="1078" && SI[3]=="28679") {
	//Nick NL
		is.setObject("cfg.locale.ui","dut",is.STORAGE_VOLATILE);
	}
	if(SI[0]=="S19.2E" && SI[2]=="1078" && ( SI[3]=="28673" || SI[3]=="28676" )) {
	//Deutsch
		is.setObject("cfg.locale.ui","ger",is.STORAGE_VOLATILE);
	}

	if(SI[0]=="S19.2E" && SI[2]=="1066") {
		is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);
	}
	if(SI[0]=="S19.2E" && SI[2]=="1066" && ( SI[3]=="28652" || SI[3]=="28661" )) {
		is.setObject("cfg.locale.ui","fra",is.STORAGE_VOLATILE);
	}

	//Canal Sat 
	if(SI[0]=="S19.2E" && SI[1]=="1" && SI[2]=="1088" ) {
	is.setObject("cfg.locale.ui","fre",is.STORAGE_VOLATILE);
	}

	if(SI[0]=="S13.0E" && SI[1]=="319") {
	is.setObject("cfg.locale.ui","fre",is.STORAGE_VOLATILE);
	}

	//Euronews / Eurosport
	if(SI[0]=="S13.0E" && SI[1]=="318" && SI[2]=="200") {
	is.setObject("cfg.locale.ui","fra",is.STORAGE_VOLATILE);
	}

	//bloomberg 19.2E
	if(SI[0]=="S19.2E" && SI[2]=="1026" && SI[3]=="10067") {
	is.setObject("cfg.locale.ui","eng",is.STORAGE_VOLATILE);
	}

	//Canal+
	if(SI[0]=="S19.2E" && SI[1]=="1" && SI[2]=="1060" ) {
	is.setObject("cfg.locale.ui","spa",is.STORAGE_VOLATILE);
	}

	//Russian
	if(SI[0]=="S13.0E" && SI[2]=="8100") {
		is.setObject("cfg.locale.ui","ger",is.STORAGE_VOLATILE);
		//doesn't work but dvbsnoop does show 'ISO639_2_language_code:  ger' 
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
		do
			{
				listChan += 1;
				if (listChan<minChan[ChanGroup]) {
					listChan=maxChan[ChanGroup];
					}
				if (listChan>maxChan[ChanGroup]) {
					listChan=minChan[ChanGroup];
				}
			}

		while (!channels[listChan] && (listChan<maxChan[ChanGroup]));
		if (fullupdate) { GetEPG(listChan); }
		if ( listChan == currChan) { 
			if (!fullupdate) { GetEPG(listChan); }
			liststyle = "background:" + color_bg + ";";
		}  else {
			liststyle = "";
		}
		EpgInfo[0] = EPG[0][7][listChan];
		EpgInfo[1] = EPG[1][7][listChan];
		htmlstring = htmlstring + "<td style='" + liststyle + "font-size:" + fsList + ";'>\uE003\uE003" + listChan + "\uE003</td><td style='" + liststyle + "font-size:" + fsList + ";'>" + Left(channelsnames[listChan],15) + "\uE003</td><td style='" + liststyle + "font-size:" + fsList + ";'>"  + Left(EpgInfo[NowNext],64) + "</td></tr>";
	}
	htmlstring = htmlstring + "</table>";
	channellist.innerHTML = htmlstring;
        chanlistepg.innerHTML = "<center><p style='" + color_chan_epg + ";font-size:" + fsEpg + ";'>" + EPG[NowNext][1][currChan] + "</p><p style='" + color_chan_epg + ";font-size:" + fsList + ";'>" + Left(EPG[NowNext][4][currChan],250) + "</p></center>" ;

}


// END of Channelslist / EPG Guide

// TeleTXT section

function embedTeletextPlugin() {
  teletext = document.createElement("embed");
  teletext.id = "teletext";
  teletext.type = "application/motorola-teletext-plugin";
  teletext.style.position = "absolute";
  teletext.style.width = "100%";
  teletext.style.height = "100%";
  teletext.style.top = "10px"; // has to be 1 rather than 0
  teletext.style.left = "10px"; // has to be 1 rather than 0
  teletext.style.zIndex = "501";
  return teletext;
}


function setVisible(isVisible) {
  if (isVisible) {
    videoplane.style.width = "50%";
    videoplane.style.left = "50%";
    document.body.appendChild(teletext);
    teletext.style.width = "50%";
    teletext.style.visibility = "visible";
    channellist.style.visibility = "hidden";
    colorkeys.style.visibility = "hidden";
  } else {
    teletext.style.visibility = "hidden";
    channellist.style.visibility = "visible";
    colorkeys.style.visibility = "visible";
  }
}


function onKeyTeletext(keyCode) {
  switch(keyCode) {
    case "Left":
      teletext.api.gotoNextPage();
    break;
    case "Right":
      teletext.api.gotoPreviousPage();
    break;
    case "Red":
      teletext.api.inputRedKey();
    break;
    case "Green":
      teletext.api.inputGreenKey();
    break;
    case "Yellow":
      teletext.api.inputYellowKey();
    break;
    case "Blue":
      teletext.api.inputCyanKey();
    break;
    case "MediaRewind":
      teletext.api.gotoPreviousSubpage();
    break;
    case "MediaForward":
      teletext.api.gotoNextSubpage();
    break;
    case "MediaStop":
	teletext.style.width = "100%";
	teletext.api.transparent = !teletext.api.transparent;
	FullScreen();
    break;
    case "BrowserBack":
    case "Teletext":
	isVisible = 0;
	FullScreen();
	setVisible(isVisible);		
    break;

    case "TV":
      teletext.api.gotoIndexPage();
    break;

	case KEY_0:
	    teletext.api.inputDigit(0);
	break;
	case KEY_1:
	    teletext.api.inputDigit(1);
	break;
	case KEY_2:
	    teletext.api.inputDigit(2);
	break;
	case KEY_3:
	    teletext.api.inputDigit(3);
	break;
	case KEY_4:
	    teletext.api.inputDigit(4);
	break;
	case KEY_5:
	    teletext.api.inputDigit(5);
	break;
	case KEY_6:
	    teletext.api.inputDigit(6);
	break;
	case KEY_7:
	    teletext.api.inputDigit(7);
	break;
	case KEY_8:
	    teletext.api.inputDigit(8);
	break;
	case KEY_9:
	    teletext.api.inputDigit(9);
	break;



  }
}

// end of TeleTXT section


// Menu section

function onKeyMenu(keyCode) {
  switch(keyCode) {
    case "BrowserBack":
	if ((menu == 5 || menu == 7) && osdepginfo.style.opacity == 1) {
		osdepginfo.style.opacity = 0;
	} else if (menu == 10 || menu == MainMenu) {
		isSetupMenu = 0;
		mainmenu.style.opacity = 0;
		osdepginfo.style.opacity = 0;
	} else if (menu !== MainMenu) {
		if (menu == 3 ) { isFullscreen = 0; play(channels[currChan]); isFullscreen = 1;MPDListener = 0;}
		menu = MainMenu;
		InitMenu(menu);
	}
	break;
    case "Menu":
	if (menu == 3 ) { play(channels[currChan]);MPDListener = 0;}
	isSetupMenu = 0;
	mainmenu.style.opacity = 0;
	osdepginfo.style.opacity = 0;
    break;

    case "Left":
    break;
    case "Right":
    break;
    case "Up":
	if (menu == 2) {
	    timerID -= 1;
		    if (timerID < 1) { timerID = 1; }
	} else 	if (menu == 5 || menu == 7 || menu == 10) {
	    timerID -= 1;
		    if (timerID < 0) { timerID = 0; }
	}
		InitMenu(menu);
    break;
    case "Down":
	if (menu == 2) {
	    timerID += 1;
		var x = ss.getBookingIds("*", 0, 0);
		    if (timerID > x.length ) { timerID = x.length; }
	} else 	if (menu == 5 || menu == 7 || menu == 10) {
	    timerID += 1;
			if (timerID > (maxTimers - 1) && maxTimers !== 0) { timerID = maxTimers - 1; }
	}
		InitMenu(menu);
    break;
    case KEY_OK:
    	if (menu == 2 && isMediaMenu !== 1) {
		var x = ss.getBookingIds("*", 0, 0);
		try {
			recLink[0] = ss.getParameter(x[timerID-1], "assetURI");
			recGUID[0] = ss.getParameter(x[timerID-1], "assetId");
			recChan[0] = ss.getParameter(x[timerID-1], "Channel");
			recTitl[0] = ss.getParameter(x[timerID-1], "Title");
			recDura[0] = ss.getBooking(x[timerID-1]).duration;// Is updated if real length is different
			recStrt[0] = ss.getBooking(x[timerID-1]).start;
			recDesc[0] = ss.getParameter(x[timerID-1], "Info");
			recDummy[0] = x[timerID-1];
			resume_position = Number(ss.getParameter(x[timerID-1], "resume"));
			localRecording = 1;
			currMed = 0;
			getRecOK = 0;
			LoadMediaSettings();
			isSetupMenu = 0;
			medialist.style.opacity = 0;
			mainmenu.style.opacity = 0;
			playRec(recLink[0],resume_position);
			} catch(e) {
				alert("error : " + e);
			}
	}
	if (menu == 10) { 
		GotoFav((timerID + Fav_base + 1));
		isSetupMenu = 0;
		mainmenu.style.opacity = 0;
		osdepginfo.style.opacity = 0;
	}
	if (menu == 5) {
		// Show EPG info Timer
		osdepginfo.style.opacity = 1 - osdepginfo.style.opacity;
		osdepginfo.innerHTML = "<center><pre style='" + color_timerinfo + ";'>\n\n\n" + Lang[0] + "\n\n\n </pre></center>" ;
		setTimeout("ShowTimerInfo();",100);
	}
	if (menu == 7) {
		// Show more info Current SearchTimer
		osdepginfo.style.opacity = 1 - osdepginfo.style.opacity;
	       	osdepginfo.innerHTML = "<center><pre style='" + color_main_head + ";'>" + searchtimersSearch[timerID] + "\n\n\n\n<center>" + Lang[0] + "</center></pre>" ;
		setTimeout("ShowSearchTimerInfo();",100);
	}

    break;
    case "Red":
    	if (menu == 1) {
		if (subs_dyn < (subs_prio_dyn.length -1)) { subs_dyn += 1} else { subs_dyn = 0 }
		if (subs_prio_dyn.length > 0) {
			is.setObject("cfg.media.subtitling.languagepriority", (subs_prio_dyn[subs_dyn] + "," + subs_prio),is.STORAGE_PERMANENT);
		} else {
			is.setObject("cfg.media.subtitling.languagepriority",subs_prio,is.STORAGE_PERMANENT);
		}
		InitMenu(menu);
		break;
	} else if (menu == 2) {
		var x = ss.getBookingIds("*", 0, 0);
		if (x.length > 0) {
			if (mediaRecorder) {
			  try {
				if (ss.getParameter(x[timerID-1], "active") == "True") {
					ss.setParameter(x[timerID-1], "active", "False");
					mediaRecorder.close();
				}
			  } catch (e) {
				alert(e);
			  }

			  try {
				ams.removeAsset(rma, ss.getParameter(x[timerID-1], "assetId"));
			  } catch(e) {
				alert("Error remove asset" + e);
			  }
			}

			//Remove timer from schedule DB

			ss.remove(x[timerID-1]);
			timer[timerID] = "";
			timerID -= 1; if (timerID < 1) { timerID = 1;}
			LoadTimers();
			//if (timer.length !== 0) { do { timerID = timerID + 1; } while (!timer[timerID] && (timerID < timer.length)) }
			setOSDtimer();
			InitMenu(menu);
		}
	} else 	if (menu == 5 && smartTVplugin) {
		osdepginfo.style.opacity = 0;
		mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[7] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>\n\n\n<center>" + Lang[0] + "</center></pre>";
		DeleteTimers();
		setTimeout("LoadTimersServer();InitMenu(menu);",100);
	} else 	if (menu == 10) {
		channels[(timerID + Fav_base + 1)]="";
		channelsnames[(timerID + Fav_base + 1)]="";
		is.setObject(("vip.channelsnames." + (timerID + 1)),"",is.STORAGE_PERMANENT)
		is.setObject(("vip.channels." + (timerID + 1)),"",is.STORAGE_PERMANENT)
		if (Fav_max_channel == (timerID + 1)) { 
			Fav_max_channel = timerID;
			maxTimers = Fav_max_channel;
			is.setObject("vip.fav_max_channel",Fav_max_channel.toString(),is.STORAGE_PERMANENT)
			timerID -= 1; if (timerID < 0) {timerID = 0;}
		}
		setTimeout("InitMenu(menu);",100);
	}
    break;
    case "Green":
    	if (menu == 1) {
		Set_Res = Set_Res + 1;
		if (Set_Res > (VideoOutputModes.length-1)) { Set_Res = 0;}
		// save the info
		is.setObject("vip.resolution",Set_Res.toString(),is.STORAGE_PERMANENT)

		VideoOutput();
		InitMenu(menu);
	} else if (menu == 2 && mediaRecorder) {
		var x = ss.getBookingIds("*", 0, 0);
		if (ss.getBooking(x[timerID-1]).category == "RecLocal") {
			ss.reschedule(x[timerID-1],"SwitchOnly","notification",ss.getBooking(x[timerID-1]).start,ss.getBooking(x[timerID-1]).duration)
		} else if (ss.getBooking(x[timerID-1]).category == "SwitchOnly") {
			ss.reschedule(x[timerID-1],"RecLocal","record_hd_from_ip",ss.getBooking(x[timerID-1]).start,ss.getBooking(x[timerID-1]).duration)
		}
		LoadTimers();
		InitMenu(menu);
	} else 	if (menu == 5 && smartTVplugin) {
		activate_timers(timerID);
		InitMenu(menu);
	} else 	if (menu == 10) {
		//move up
		if (timerID !== 0) {
			x = timerID + Fav_base + 1;
			x1 = channels[x];
			y1 = channelsnames[x];
			x2 = channels[(x - 1)];
			y2 = channelsnames[(x - 1)];
			is.setObject(("vip.channelsnames." + (timerID + 1)),y2,is.STORAGE_PERMANENT)
			is.setObject(("vip.channels." + (timerID + 1)),x2,is.STORAGE_PERMANENT)
			is.setObject(("vip.channelsnames." + timerID),y1,is.STORAGE_PERMANENT)
			is.setObject(("vip.channels." + timerID),x1,is.STORAGE_PERMANENT)
			channelsnames[x] = y2;
			channels[x] = x2;
			channelsnames[(x - 1)] = y1;
			channels[(x - 1)] = x1;
			timerID -= 1;
			setTimeout("InitMenu(menu);",100);
		}
	} 
    break;
    case "Yellow":
	if (menu == MainMenu) {
		menu = 4; // INFO menu
		InitMenu(menu);
	} else 	if (menu == 1) {
		menu = 9; // INFO2 menu
		InitMenu(menu);
	} else 	if (menu == 10) {
		//move down
		if (timerID !== (maxTimers - 1)) {
			x = timerID + Fav_base + 1;
			x1 = channels[x];
			y1 = channelsnames[x];
			x2 = channels[(x + 1)];
			y2 = channelsnames[(x + 1)];
			is.setObject(("vip.channelsnames." + (timerID + 1)),y2,is.STORAGE_PERMANENT)
			is.setObject(("vip.channels." + (timerID + 1)),x2,is.STORAGE_PERMANENT)
			is.setObject(("vip.channelsnames." + (timerID + 2)),y1,is.STORAGE_PERMANENT)
			is.setObject(("vip.channels." + (timerID + 2)),x1,is.STORAGE_PERMANENT)
			channelsnames[x] = y2;
			channels[x] = x2;
			channelsnames[(x + 1)] = y1;
			channels[(x + 1)] = x1;
			timerID += 1;
			setTimeout("InitMenu(menu);",100);
		}
	}
    break;
    case "Blue":
		if (menu == 0) {
		RestartPortal();
	} else if (menu == 2) {
		// Show Info local timer/ recording
		var x = ss.getBookingIds("*", 0, 0);
		var y = Number(ss.getParameter(x[timerID-1], "Channel"));
		osdepginfo.style.opacity = 1 - osdepginfo.style.opacity;
	       	osdepginfo.innerHTML = "<center><pre style='" + color_timerinfo + ";'>" + ss.getParameter(x[timerID-1], "Title") + "\n " + "\n" + y + " - " + channelsnames[y] + "(" + ss.getParameter(x[timerID-1], "Eventid") + ")" + "\n </pre><p style='" + color_epg_info + ";'>" + ss.getParameter(x[timerID-1], "Info") + "</p></center>" ;
	} else 	if (menu == 5) {
		// Show EPG info Timer
		osdepginfo.style.opacity = 1 - osdepginfo.style.opacity;
		osdepginfo.innerHTML = "<center><pre style='" + color_timerinfo + ";'>\n\n\n" + Lang[0] + "\n\n\n </pre></center>" ;
		setTimeout("ShowTimerInfo();",100);
	} else 	if (menu == 7) {
		// Show info SearchTimers
	       	osdepginfo.innerHTML = SearchTimer[timerID] ;
		osdepginfo.style.opacity = 1 - osdepginfo.style.opacity;
	} else if (menu == 10) {
		if (protChn[ChanGroup] !== 1 && ChanGroup !== Fav_group) {
			AddtoFav();
		}
	}
    break;
    case "MediaRewind":
	 if (menu == 1) {
		if (experimental) { // mute output 0 (analog out), keep output 3 'decoder output' unmuted
			aos.setVolume(0, 0); 
			}
	}
    break;
    case "MediaForward":
	 if (menu == 1) {
		if (experimental) { aos.setVolume(0, 100); }
	}

    break;
    case "MediaStop":
	if (menu == 1) {
		//set sleep timer.
		SleepTimer += 15;
		if (SleepTimerID != -1) {
		  clearTimeout(SleepTimerID);
		  SleepTimerID = -1;
		}
		if (SleepTimer > 90) {
			SleepTimer = 0;
		} else {
			SleepTimerID = setTimeout("SleepTimer = 0;toi.platformService.setStandby(true);", (SleepTimer * 60 * 1000));
		}
	} else if (menu == 2) {
		var x = ss.getBookingIds("*", 0, 0);
		var y = Number((new Date().getTime()/1000).toFixed(0)) + 2;
		//stop current recording after 2 sec.
		ss.reschedule(x[timerID-1],"RecLocal","record_hd_from_ip", y , 0)
		ss.setParameter(x[timerID-1], "Type", "\uE01C");
		LoadTimers();
	}
	InitMenu(menu);
    break;
    case "Teletext":
    break;
    case "TV":
    break;
	case KEY_1:
		if (menu == MainMenu) {
		menu = 1;
		} else if (menu == 1) {
		 ShowSubs = 1 - ShowSubs;
		 videoplane.subtitles = Boolean(ShowSubs); // Enable subtitles or Disable subtitles
		 is.setObject("vip.showsubs",ShowSubs.toString(),is.STORAGE_PERMANENT);
		} else	if (menu == 8) {
			SetGroup(1);
		}

	InitMenu(menu);
	break;
	case KEY_2:
		if (menu == MainMenu) {
			LoadTimers();
			timerID = 1;
				//if (timer.length !== 0) { do { timerID += 1; } while (!timer[timerID] && (timerID < timer.length)) }
			menu = 2;
		}

		if (menu == 1) {
			if(subsmode == 0 ) {	
				is.setObject("cfg.media.subtitling.modepriority","Teletext,DVB",is.STORAGE_PERMANENT);
				subsmode = 1;
			} else {
				is.setObject("cfg.media.subtitling.modepriority","DVB,Teletext",is.STORAGE_PERMANENT);
				subsmode = 0;
			}
		}

		if (menu == 8) {
		SetGroup(2);
		}
		InitMenu(menu);
	break;
	case KEY_3:
	if (menu == 0) {
			isSetupMenu = 0;
			medialist.style.opacity = 0.9;
			mainmenu.style.opacity = 0;
			setTimeout("getSchedule(currChan);LoadMediaSettings();",100);
	} else	if (menu == 1) {
			if (audio < (lang_prio.length -1)) { audio += 1} else { audio = 0 }
				is.setObject("vip.languagepriority",audio.toString(),is.STORAGE_PERMANENT);
				is.setObject("cfg.media.audio.languagepriority",lang_prio[audio],is.STORAGE_PERMANENT);
		InitMenu(menu);
	} else	if (menu == 8) {
		SetGroup(3);
		InitMenu(menu);
	} 

	break;
	case KEY_4:
		if (menu == 0) {
			isSetupMenu = 0;
			medialist.style.opacity = 0.9;
			mainmenu.style.opacity = 0;
			recPath = "/recordings.xml";
			setTimeout("getRecList();LoadMediaSettings();",100);
		} else if (menu == 1) {
		//Init here. menu = 0 don't need init!
		menu = 8;
		InitMenu(menu);
		} else if (menu == 8) {
		SetGroup(4);
		InitMenu(menu);
		}

	break;
	case KEY_5:
		if (menu == MainMenu && (Restfulapiplugin || smartTVplugin)) {
			mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[7] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>\n\n\n<center>" + Lang[0] + "</center></pre>";
			timerID = 0;
			menu = 5;
			setTimeout("LoadTimersServer();InitMenu(menu);",200);
		}

	if (menu == 1) {
		var x = is.getObject("vip.serveraddress");
		x = Number(x);
		if (x < (server_ip_array.length -1)) { x += 1} else { x = 0 }
		is.setObject("vip.serveraddress",x.toString(),is.STORAGE_PERMANENT);

		server_ip = server_ip_array[x];
		for (var i=0;i<10;i++) {
			if (ServerAdres[i] !== "FullURL" && ServerAdres[i] !== "MultiCast") {ServerAdres[i] = server_ip + StreamPort;}
		}
		InitMenu(menu);
		}

		if (menu == 8) {
		SetGroup(5);
		InitMenu(menu);
		}
	break;
	case KEY_6:
	if (menu == 0 && Restfulapiplugin) {
			isSetupMenu = 0;
			medialist.style.opacity = 0.9;
			mainmenu.style.opacity = 0;
			setTimeout("getServerSchedule();LoadMediaSettings();",100);
			}

	if (menu == 1) {
		if(showClock == 0 )	{
		 	showDisplay("", true, 80, 1 );
			showClock = 1;
		} else if(showClock == 1 ) {
			showClock = 0;
	 		showDisplay(currChan.toString(), false, 100, 0 );
		}
		InitMenu(menu);
	}
		if (menu == 8) {
		SetGroup(6);
		InitMenu(menu);
		}

	break;
	case KEY_7:
		if (menu == 0 && smartTVplugin) {
			isSetupMenu = 0;
			medialist.style.opacity = 0.9;
			mainmenu.style.opacity = 0;
			recPath = "/media.xml";
			setTimeout("getRecList();LoadMediaSettings();",100);
			}


		if (menu == 1) {
			ShowProtectedChannels = 1 - ShowProtectedChannels;
			if (ProtectID) { clearTimeout(ProtectID); }
			if (ShowProtectedChannels == 0 && ProtectTimeOut !== 0 ) {
				ProtectID = setTimeout("ShowProtectedChannels = 1; if (protChn[ChanGroup] == 1) {ChanGroup = 0; currChan = defChan[ChanGroup]; play(currChan); }",ProtectTimeOut);
				}
			if (ShowProtectedChannels == 1 && protChn[ChanGroup] == 1) { ChanGroup = 0; currChan = defChan[ChanGroup]; play(currChan); }
			isSetupMenu = 0;
			mainmenu.style.opacity = 0;
		}
		if (menu == 8) {
		SetGroup(7);
		InitMenu(menu);
		}

	break;
	case KEY_8:
	if (menu == MainMenu && Restfulapiplugin) {
			mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[8] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>\n\n\n<center>" + Lang[0] + "</center></pre>";
			timerID = 0;
			menu = 7;
			setTimeout("LoadSearchTimersServer();InitMenu(menu);",200);
		}
	if (menu == 1) {
		if(SwitchGuide == 0 )	{
			SwitchGuide = 1;
		} else if(SwitchGuide == 1 ) {
			SwitchGuide = 0;
		}
		InitMenu(menu);
	}
	if (menu == 8) {
		SetGroup(8);
		InitMenu(menu);
	}


	break;
	case KEY_9:
		if ((menu == 0 || menu == 3) && ShowMPD) {
			menu = 3;
			playMPD(server_ip + MPDAddress);
		} else if (menu == 1) {
			if (lang_nr < (OSDLang.length -1)) { lang_nr += 1} else { lang_nr = 0 }
			is.setObject("vip.OSDlanguage",lang_nr.toString(),is.STORAGE_PERMANENT);
			loadjs(langfile[lang_nr]);
			setTimeout("InitMenu(menu);",100);
		} else if (menu == 8) {
			SetGroup(9);
		}

		InitMenu(menu);
	break;
	case KEY_0:
		if (menu !== MainMenu && menu !== 8 ) {
			if (menu == 3 ) { isFullscreen = 0; play(channels[currChan]); isFullscreen = 1; MPDListener = 0;}
			menu = MainMenu;	
			InitMenu(menu);
		} else if (menu == 8) {
			SetGroup(0);
			InitMenu(menu);
		} else if (menu == 0) {
			timerID = 0; maxTimers = Fav_max_channel;
			menu = 10; if (ChanGroup !== Fav_group) { Fav_key1 = Lang[86]; }
			InitMenu(menu);
		}

	break;
    case "VolumeMute":
	VolumeMute();
	break;
    case "VolumeUp":
	VolumeUp();
	break;
    case "VolumeDown":
	VolumeDown();
	break;
    case KEY_A:// |> key on old long kpn 1710/1760 remote
        break;
    case KEY_B:// hh key on old long kpn 1710/1760 remote
        break;
    case KEY_C:// @ key on old long kpn 1710/1760 remote
	if (menu == 10 ) {
		isSetupMenu = 0;
		mainmenu.style.opacity = 0;
		osdepginfo.style.opacity = 0;
	}
        break;
    case KEY_D:// >@ key on old long kpn 1710/1760 remote
        break;

	default:
        break;
  }
}


function InitMenu(menu) {

// 0 = Main Menu
// 1 = settings menu
// 2 = Timers menu
// 3 = MPD Menu
// 4 = INFO Menu
// 5 = Timers from Server
// 6 = Main Menu (when watching recording)
// 7 = SearchTimers from Server
// 8 = ChannelGroups enable/disable
// 9 = INFO2 menu
// 10 = Favorite Edit menu

osdepginfo.style.opacity = 0;

if(menu == 0) { // Main Menu
	MainMenu = 0;
	var htmltext = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[9] + "\n ( " + Version + " )</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>   1 -" + Lang[10] + "\n   2 -" + Lang[7] + "\n   3 -" + Lang[11];
	htmltext += "\n   4 -" + Lang[12]; 
	if (Restfulapiplugin) { 
		htmltext += "\n   5 -" + Lang[13]; 
	} else { 
		htmltext += "<font style='" + color_notset +";'>" + "\n   5 -" + Lang[13] + "<font style='" + color_main_font +";'>" ;
	}
	if (Restfulapiplugin) { 
		htmltext += "\n   6 -" + Lang[14]; 
	} else {
		htmltext += "<font style='" + color_notset +";'>" + "\n   6 -" + Lang[14] + "<font style='" + color_main_font +";'>" ;  
	}
	if (smartTVplugin) { 
		htmltext += "\n   7 -" + Lang[15]; 
	} else { 
		htmltext += "<font style='" + color_notset +";'>" + "\n   7 -" + Lang[15] + "<font style='" + color_main_font +";'>" ; 
	}
	if (Restfulapiplugin) { 
		htmltext += "\n   8 -" + Lang[16];
	} else {
		htmltext += "<font style='" + color_notset +";'>" + "\n   8 -" + Lang[16] + "<font style='" + color_main_font +";'>" ;  
	}
	if (ShowMPD) { 
		htmltext += "\n   9 -" + Lang[17]; 
	} else { 
		htmltext += "<font style='" + color_notset +";'>" + "\n   9 -" + Lang[17] + "<font style='" + color_main_font +";'>" ; 
	}

	htmltext += "\n   0 - " + Lang[83] + "\n\n   <font style='color:red;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "<font style='color:green;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "<font style='color:yellow;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[35] + "   <font style='color:blue;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[18] + "</pre>";
	mainmenu.innerHTML = htmltext;
}

if(menu == 6) { // Main Menu when watching recording
	MainMenu = 6;
	mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[9] + "\n ( " + Version + " )</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>   1 -" + Lang[10] + "\n   2 -" + Lang[7] + "\n\n\n   5 -" + Lang[13] + "\n\n\n   8 -" + Lang[16] + "\n\n\n\n   <font style='color:red;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "<font style='color:green;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "<font style='color:yellow;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[35] + "   <font style='color:blue;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "</pre>";
}


if(menu == 1) { // settings menu
	var htmltext = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[10] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>   1 - ";
	if (ShowSubs) { htmltext += "\uE017"; } else { htmltext += "\uE016"; }
	htmltext += Lang[20] + ": " + (is.getObject("cfg.media.subtitling.languagepriority"));
	if (subs_prio_dyn.length > 0) { htmltext += " (" + (subs_dyn + 1 ) + "/" + subs_prio_dyn.length + ") "; }
	htmltext += "\n   2 - \uE003" + Lang[22] + (is.getObject("cfg.media.subtitling.modepriority"));
	htmltext += "\n   3 - \uE003" + Lang[24] + (is.getObject("cfg.media.audio.languagepriority")); 
	htmltext += "\n   4 - " + Lang[82] + "\n   5 - VDR : " + server_ip + "\n   6 - ";
	if (showClock) { htmltext += "\uE017"; } else { htmltext += "\uE016"; }
	htmltext += Lang[25] + "\n   7 - ";
	if (ShowProtectedChannels) { htmltext += "\uE017"; } else { htmltext += "\uE016"; }
	htmltext += Lang[26] + "\n   8 - ";
	if (SwitchGuide) { htmltext += "\uE017"; } else { htmltext += "\uE016"; }
	htmltext += Lang[27] + "\n   9 -" + Lang[23] + OSDLang[lang_nr] + "\n   \u25AA -" + Lang[29];

	if (SleepTimer) { htmltext += SleepTimer + Lang[30]; } else { htmltext += Lang[31]; }

	htmltext += "\n\n   <font style='color:red;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[20];
	htmltext += "<font style='color:green;'>\u25CF<font style='" + color_main_font + ";'> - " + VideoOutputModes_txt[VideoOutputModes[Set_Res]] + " ";  
	htmltext += "<font style='color:yellow;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[35];
	htmltext += "<font style='color:blue;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] +"</pre>";
//	htmltext += "\n   0 -" + Lang[9] +"</pre>";
	mainmenu.innerHTML = htmltext;
}

if(menu == 2) { // Timers menu
	booking = "";
	var x = timerID - 2;
	var y = ss.getBookingIds("*", 0, 0);
	if (y.length !== 0) {
	for (var i=0;i<10;i++) {
		if (timer.length !== 0) { do { x += 1; } while (!timer[x] && (x < timer.length)) }

			if (i == 0) {
			booking += "<font style='background:" + color_bg + ";-webkit-border-radius:25px;" + color_main_font + ";font-size:" + fsMenu + ";'>";
			} else if (i == 1) {
			booking += "</font>";
			} 

		if (timer.length > x) {
			try {
				if (ss.getParameter(y[x], "assetURI")) {
				// test if there is a file with the timer if so more info is added
					if (Number(ss.getParameter(y[x], "resume")) == 0 ) {
						booking += "\uE003\uE010";
					} else {
						booking += "\uE003\uE003";
					}			
				}
			} catch(e) {
			    booking += "\uE003\uE003";
			}
			booking += ss.getParameter(y[x], "Type");
			booking += timer[x];
		} else {
			booking += "\n";
		}
	}
	}
	if (mediaRecorder) { var x = NN[3]; } else { var x =  Lang[19]; }
	mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[7] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>\n   0 -" + Lang[9] + "\n" + booking + "   <font style='color:red;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[48] + "<font style='color:green;'>\u25CF<font style='" + color_main_font + ";'> - " + x + "  <font style='color:yellow;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "<font style='color:blue;'>\u25CF<font style='" + color_main_font + ";'> - " + NN[5] + "</pre>";
}

if(menu == 3) { // MPD Menu
	mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[33] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>" + Lang[34] + "\n 0 -" + Lang[9] + "</pre>";
}

if(menu == 4) { // INFO Menu
	var htmltext = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[35] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>";
	try {
		htmltext += "\n   Product name: " + is.getObject("config.productdisplayname");
		htmltext += "\n   Build date : " + is.getObject("config.build.date");
		htmltext += "\n\n   IP address : " + is.getObject("config.ipaddress");

		var x = is.getObject("cfg.ip.eth0.mode");
		if (x == "DHCP") { htmltext += "\n \uE003\uE017 "; } else { htmltext += "\n \uE003\uE016 "; }
		htmltext += "DHCP";
		var x = is.getObject("var.capabilities.dvr");
		if (x !== "FALSE") { htmltext += "\n \uE003\uE017 "; } else { htmltext += "\n \uE003\uE016 "; }
		htmltext += "DVR \n";
		htmltext += "\n   VDR address : " + server_ip;
		htmltext += "\n   Vip Client\uE003\uE003\uE003: " + Version;
		htmltext += "\n   Channel list\uE003: " + Chan_Ver;

	} catch(e) {
		alert("Error : " + e);
	}
	htmltext += "\n\n   0 -" + Lang[9] + "</pre>";
	mainmenu.innerHTML = htmltext;

}

if(menu == 5) { // Timers from Server
	if (timerOK) {
	//	booking = "<center>" + Lang[32] + "</center>";
	booking = "<font style='background:" + color_bg + ";-webkit-border-radius:25px;" + color_main_font + ";font-size:" + fsMenu + ";'>";
	var x = timerID - 1;
	for (var i=0;i<10;i++) {
		if (maxTimers !== 0) { do { x += 1; } while (!timers[x] && (x < maxTimers)) }
		if (maxTimers > x) { booking += timers[x]; } else { booking += "\n"; }
		if (i == 0) { booking += "</font>"; } 
	}
	if (get_timer) {
	mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[7] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>\n" + booking + "\n   <font style='color:red;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[48] + "<font style='color:green;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[49] + "<font style='color:yellow;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "   <font style='color:blue;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[28] + "</pre>";
	 } else {
	mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[7] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>\n" + booking + "\n   <font style='color:red;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "<font style='color:green;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "<font style='color:yellow;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "   <font style='color:blue;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[28] + "</pre>";
	 }
	}
}


if(menu == 7) { // SearchTimers from Server
	if (timerOK) {
	// 	booking = "<center>" + Lang[32] + "</center>";
	booking = "<font style='background:" + color_bg + ";-webkit-border-radius:25px;" + color_main_font + ";font-size:" + fsMenu + ";'>";
	var x = timerID - 1;
	for (var i=0;i<10;i++) {
		if (maxTimers !== 0) { do { x += 1; } while (!searchtimers[x] && (x < maxTimers)) }
		if (maxTimers > x) { booking += searchtimers[x]; } else { booking += "\n"; }
		if (i == 0) { booking += "</font>"; } 
	}
	mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[8] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>\n" + booking + "\n   <font style='color:red;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "<font style='color:green;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "<font style='color:yellow;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[19] + "   <font style='color:blue;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[28] + "</pre>";

	}
}

if(menu == 8) { // ChannelGroups enable/disable
	var htmltext = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[80] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>\n";
	for (var i=0;i<10;i++) {
		if (maxChan[i]) { 
			htmltext += "<font style='" + color_main_font + ";'>"; 
		} else { 
			htmltext += "<font style='" + color_notset + ";'>"; 
		}

		htmltext += "\uE003" + i + "\uE003-\uE003";
		if (is.getObject(("vip.group." + i)) == "1") { htmltext += "\uE017"; } else { htmltext += "\uE016"; }
		htmltext += "\uE003" + Lang[81] + i + "\n";
	}
	htmltext += "</pre>";
	mainmenu.innerHTML = htmltext;
	}

if(menu == 9) { // INFO2 Menu
	var htmltext = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[35] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>";
	try {
		if (fullupdate !== 0) { htmltext += "\n \uE017 "; } else { htmltext += "\n \uE016 "; }
		htmltext += "Full EPG Update ";

		experimental = Number(is.getObject("vip.testing"));
		if (experimental) { htmltext += "\n \uE017 "; } else { htmltext += "\n \uE016 "; }
		htmltext += "Experimental";
		if (Number(is.getObject("vip.testing2"))) { htmltext += "\n \uE017 "; } else { htmltext += "\n \uE016 "; }
		htmltext += "Experimental 2 (Info box 'not in package')";
		if (Restfulapiplugin) { htmltext += "\n \uE017 "; } else { htmltext += "\n \uE016 "; }
		htmltext += "Has Restfulapiplugin"
		if (smartTVplugin) { htmltext += "\n \uE017 "; } else { htmltext += "\n \uE016 "; }
		htmltext += "Has smartTVplugin"
		htmltext += "\n gettimers from";
		if (get_timer == 1) { 
			htmltext += " smarttvweb "; 
		} else { 
			htmltext += " restfulapi "; 
		}

		htmltext += "\n getmarks from";
		if (get_marks == 1) { htmltext += " smarttvweb "; } else { htmltext += " restfulapi "; }
		htmltext += "\n getrecordings from";
		if (get_recordings == 1) { 
			htmltext += " smarttvweb "; 
		} else if (get_recordings == 0) { 
			htmltext += " restfulapi "; 
		} else {
			htmltext += " streamdev "; 
		}
		htmltext += "\n EPGMode : "
		if (EPGMode) { htmltext += "Full EPG"; } else { htmltext += "Now/Next Only"; }
	} catch(e) {
		alert("Error : " + e);
	}
	htmltext += "\n\n   0 -" + Lang[9] + "</pre>";
	mainmenu.innerHTML = htmltext;

}

if(menu == 10) { // Favorite edit Menu
	var htmltext = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[83]
	htmltext += "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>\n"
	htmltext += "<font style='background:" + color_bg + ";-webkit-border-radius:25px;" + color_main_font + ";font-size:" + fsMenu + ";'>";
	var x = timerID;
	for (var i=0;i<10;i++) {
		if (maxTimers !== 0) { x += 1;}
		if (maxTimers >= x && x !== 0) { htmltext += " \u0003\u0003 " + x + " \u0003\u0003 " + channelsnames[(x + Fav_base)] + " \u0003\u0003\u0003 \n"; } else { htmltext += "\n"; }
		if (i == 0) { htmltext += "</font>"; } 
	}
	htmltext += "\n   <font style='color:red;'>\u25CF<font style='" + color_main_font + ";'> -" + Lang[87]; 
	htmltext += "<font style='color:green;'>\u25CF<font style='" + color_main_font + ";'> -"
	if (timerID == 0) { htmltext += Lang[19] } else { htmltext += Lang[84] } //no move up
	htmltext += "<font style='color:yellow;'>\u25CF<font style='" + color_main_font + ";'> -"
	if (timerID == (maxTimers - 1) || x == 0) { htmltext += Lang[19] } else { htmltext += Lang[85] } //no move down
	htmltext += "<font style='color:blue;'>\u25CF<font style='" + color_main_font + ";'> -" + Fav_key1 + "</pre>";
	mainmenu.innerHTML = htmltext;
}

} // end of initmenu

function SetGroup(isgroup) {
	is.setObject("vip.group." + isgroup,(1 - is.getObject("vip.group." + isgroup)).toString(),is.STORAGE_PERMANENT);
	if (is.getObject("vip.group." + isgroup) == "0") { minChan[isgroup] = "";} else {minChan[isgroup] = minchan[isgroup];}
}

function LoadTimers() {
		timer.length = 0;
		var booking = "";
		var x = ss.getBookingIds("*", 0, 0);
			for (var i=0;i<x.length;i++) { 
				var y = ss.getBooking(x[i]);
				booking = " ID " + x[i];
				booking += " " + Left(y.category,1);
				tijd = y.start;
				date = new Date(tijd*1000); 
				tijd = date.toUTCString();
				tijd = new Date(tijd);
			        month = tijd.getMonth();
			        d = tijd.getDate();
		        	day = tijd.getDay();
				var tm = tijd.getMinutes();
				var th = tijd.getHours();
				th=addzero(th);
				tm=addzero(tm);

//				booking += " Start " + Left(days[day],3) + " " + d + " " + Left(months[month],3) + " " + th + ":" + tm + "   " + (y.duration/60).toFixed(0) + " min";
				booking += " " + d + " " + Left(months[month],3) + " " + th + ":" + tm + "   " + (y.duration/60).toFixed(0) + " min";

				booking += " " + Left(channelsnames[ss.getParameter(x[i], "Channel")],8);
				booking += "  " + Left(ss.getParameter(x[i], "Title"),15);
				timer[i] = booking + "\n" ;

				}
}


function LoadTimersServer() {
try {

 if (get_timer==1) {
   //Get timers from SmartTVweb
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + recServ + "/timers.xml?" + new Date().getTime()),false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
   var x=xmlDoc.getElementsByTagName("timer");
   maxTimers = x.length;
   timers.length = 0; // clear timers[i] tries to clear crap if current x.length < previous x.length
   if (x.length > 0) {
    for (var i=0;i<x.length;i++)
	  { 
	  var fill = "\uE003\uE003\uE003\uE003\uE003\uE003\uE003\uE003\uE003\uE003";
	  timersFlag[i] = x[i].getElementsByTagName("flags")[0].childNodes[0].nodeValue;
	  timersStrt[i] = Right("000" + x[i].getElementsByTagName("start")[0].childNodes[0].nodeValue,4);
	  timersStop[i] = Right("000" + x[i].getElementsByTagName("stop")[0].childNodes[0].nodeValue,4);

	  timersEvnt[i] = x[i].getElementsByTagName("eventid")[0].childNodes[0].nodeValue; // event_id
	  timersID[i] = x[i].getElementsByTagName("index")[0].childNodes[0].nodeValue; // index
	  timersChan[i]  = x[i].getElementsByTagName("channelid")[0].childNodes[0].nodeValue; // channel_id
	  timersName[i] = x[i].getElementsByTagName("channelname")[0].childNodes[0].nodeValue + fill;
	  timersDay[i] = x[i].getElementsByTagName("day")[0].childNodes[0].nodeValue;
	  timersDays[i] = new Date(timersDay[i]*1000);
	  timersDays[i] = timersDays[i].getDate() + "\uE003" + Left(months[timersDays[i].getMonth()],4);
	  timersFile[i] = x[i].getElementsByTagName("file")[0].childNodes[0].nodeValue + fill + fill;

	  if (timersFlag[i] == "1") { 
		timers[i] = "\uE003\uE00C\uE003";
	  } else if (timersFlag[i] == "9" || timersFlag[i] == "11" ) { 
		timers[i] = "\uE003\uE00B\uE003";
	  } else if (timersFlag[i] == "0") { 
		timers[i] = "\uE003\uE003\uE003";
	  }  else { 
		timers[i] = "\uE003?\uE003";
	  }

	  timers[i] += timersDays[i] + "\uE003" + timersStrt[i] + "\uE003" + timersStop[i] + "\uE003" + Left(timersName[i],8) + "\uE003" + Left(timersFile[i],15) + "\n" ;
    }
   }
    timerOK = 1;
 } else if (get_timer == 0) {
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + RestFulAPI + "/timers.xml"),false);  // ?" + new Date().getTime()),false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
   var x=xmlDoc.getElementsByTagName("timer");
   maxTimers = x.length;
   timers.length = 0; // clear timers[i] tries to clear crap if current x.length < previous x.length
   if (x.length > 0) {
    for (var i=0;i<x.length;i++)
	  { 
	  var fill = "\uE003\uE003\uE003\uE003\uE003\uE003\uE003\uE003\uE003\uE003";
	  timersID[i] = x[i].getElementsByTagName("param")[0].childNodes[0].nodeValue;
	  timersChan[i] = x[i].getElementsByTagName("param")[11].childNodes[0].nodeValue;
	  timersFlag[i] = x[i].getElementsByTagName("param")[1].childNodes[0].nodeValue;
	  timersStrt[i] = Right("00" + x[i].getElementsByTagName("param")[2].childNodes[0].nodeValue,4);
	  timersStop[i] = Right("00" + x[i].getElementsByTagName("param")[3].childNodes[0].nodeValue,4);
	  timersEvnt[i] = x[i].getElementsByTagName("param")[8].childNodes[0].nodeValue;
	  timersDays[i] = x[i].getElementsByTagName("param")[9].childNodes[0].nodeValue;
	  if (timersDays[i] == "-------" ) { 
		timersDays[i] = x[i].getElementsByTagName("param")[10].childNodes[0].nodeValue;
	  } else { 
		timersDays[i] += "\uE003\uE003\uE003";
	  }
	  timersName[i] = x[i].getElementsByTagName("param")[15].childNodes[0].nodeValue + fill;
	  timersFile[i] = x[i].getElementsByTagName("param")[14].childNodes[0].nodeValue + fill + fill;
	  if (timersFlag[i] == "1") { 
		timers[i] = "\uE003\uE00C\uE003";
	  } else if (timersFlag[i] == "9") { 
		timers[i] = "\uE003\uE00B\uE003";
	  } else { 
		timers[i] = "\uE003\uE003\uE003";
	  }
	  timers[i] += timersDays[i] + "\uE003" + timersStrt[i] + "\uE003" + timersStop[i] + "\uE003" + Left(timersName[i],8) + "\uE003" + Left(timersFile[i],15) + "\n" ;
   } 
  }
   timerOK = 1;
 }
  } catch(e) {
    timerOK = 0;
    alert("Get Timers problem: " + e);
    mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[7] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'><center>\n  " + Lang[36] + ": \n " + server_ip + "</center></pre>";
  }
}

function DeleteTimers() {
if (get_timer==1) {
 try {

	xmlhttp=new XMLHttpRequest();
 //
 // SmartTVWeb
 //	xmlhttp.open("GET",(server_ip + recServ + "/deleteTimer?guid=" + timersChan[timerID] + "&dy=" + timersDay[timerID] 
 //			+ "&st=" + timersStrt[timerID] + "&sp=" + timersStop[timerID] + "&" + new Date().getTime()),false);
	xmlhttp.open("GET",(server_ip + recServ + "/deleteTimer?index=" + timersID[timerID] + "&" + new Date().getTime()),false);
	xmlhttp.send();

  } catch(e) {
    alert("Deleting Timers problem: " + e);
  }
 }
}

function activate_timers(){
if (get_timer==1) {
	// (De)activate timers.
 try {

	xmlhttp=new XMLHttpRequest();
	if (timersFlag[timerID] == "0") { 
	xmlhttp.open("GET",(server_ip + recServ + "/activateTimer?index=" + timersID[timerID] + "&activate=true&" + new Date().getTime()),false);
	} else {
	xmlhttp.open("GET",(server_ip + recServ + "/activateTimer?index=" + timersID[timerID] + "&activate=false&" + new Date().getTime()),false);
	}
	xmlhttp.send();

	if (timersFlag[timerID] == "0") { 
		timers[timerID] = timers[timerID].substr(0, 1) + "\uE00C" + timers[timerID].substr(2);
		timersFlag[timerID] = "1"
	} else {
		timers[timerID] = timers[timerID].substr(0, 1) + "\uE003" + timers[timerID].substr(2);
		timersFlag[timerID] = "0"
	}
  } catch(e) {
    alert("(De)Activate Timers problem: " + e);
  }
 }
}


function ShowTimerInfo() {
 if (osdepginfo.style.opacity == 1) {
  //Like Show EPG Info
  //setup some dummy vars
  var info1 = ""; var info2 = ""; var info3 = ""; var info4="";
  if (timersEvnt[timerID] > 0) {

	try {
	   xmlhttp=new XMLHttpRequest();
	   xmlhttp.open("GET",(server_ip + RestFulAPI + "/events/" + timersChan[timerID] + "/" + timersEvnt[timerID] + ".xml?" + new Date().getTime()),false);  
	   xmlhttp.send();
	   xmlDoc=xmlhttp.responseXML;
	   var x=xmlDoc.getElementsByTagName("event");
		// x[0].getElementsByTagName("param")[1].childNodes[0].nodeValue --> Title
		// x[0].getElementsByTagName("param")[2].childNodes[0].nodeValue --> Short_text
		// x[0].getElementsByTagName("param")[3].childNodes[0].nodeValue --> Description
		// x[0].getElementsByTagName("param")[5].childNodes[0].nodeValue --> ChannelsName

		info1 = x[0].getElementsByTagName("param")[1].childNodes[0].nodeValue;
		info2 = x[0].getElementsByTagName("param")[5].childNodes[0].nodeValue;
		info4 = x[0].getElementsByTagName("param")[3].childNodes[0].nodeValue;
		info3 = x[0].getElementsByTagName("param")[2].childNodes[0].nodeValue + "</p><p>";

	  } catch(e) {
	    alert("Get EPG problem: " + e);

	  }
  } else {
	info3 = Lang[37];
  }
       	osdepginfo.innerHTML = "<center><pre style='" + color_timerinfo + ";'>" + Left(info1,60) + "\n " + timersDays[timerID] + " " + 
	timersStrt[timerID] + " - " + timersStop[timerID] + "\n" + info2 + "\n </pre><p>" + info3 + Left(info4,750) + "</p></center>" ;
 }
}

function LoadSearchTimersServer() {
try {
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + RestFulAPI + "/searchtimers.xml?" + new Date().getTime()),false); //"),false);  // 
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
   var x=xmlDoc.getElementsByTagName("searchtimer");
   maxTimers = x.length;
   searchtimers.length = 0; // clear timers[i] tries to clear crap if current x.length < previous x.length
   if (x.length > 0) {
     for (var i=0;i<x.length;i++)
	  { 
	  var fill = "\uE003\uE003\uE003\uE003\uE003\uE003\uE003\uE003\uE003\uE003";
	  searchtimersID[i] = x[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
	  searchtimersSearch[i] = x[i].getElementsByTagName("search")[0].childNodes[0].nodeValue;
	  searchtimersFlag[i] = x[i].getElementsByTagName("use_as_searchtimer")[0].childNodes[0].nodeValue;
	  if (searchtimersFlag[i] == "1") { 
		searchtimers[i] = "\uE003\uE017\uE003";
	  } else if (searchtimersFlag[i] == "0") { 
		searchtimers[i] = "\uE003\uE016\uE003";
	  }  else { 
		searchtimers[i] = "\uE003?\uE003";
	  }

		// Extended INFO
		SearchTimer[i] = "<center><pre style='" + color_main_head + ";'>" + x[i].getElementsByTagName("search")[0].childNodes[0].nodeValue + "\n </pre></center><pre>";
		if ((x[i].getElementsByTagName("use_as_searchtimer")[0].childNodes[0].nodeValue) == 0) {
			SearchTimer[i]  += "\uE003\uE016\uE003" + Lang[40] + "\n";
		} else {
			SearchTimer[i]  += "\uE003\uE017\uE003" + Lang[40] + "\n";
		}
		SearchTimer[i] = SearchTimer[i] + "\uE003\uE003\uE003Mode :\uE003" + (searchmode[x[i].getElementsByTagName("mode")[0].childNodes[0].nodeValue]) + "\n";
		if ((x[i].getElementsByTagName("use_time")[0].childNodes[0].nodeValue) == 1) {
			SearchTimer[i]  += "\uE003\uE017\uE003" + Lang[41] + "\uE003" + 
					x[i].getElementsByTagName("start_time")[0].childNodes[0].nodeValue + 
					"\uE003-\uE003" + x[i].getElementsByTagName("stop_time")[0].childNodes[0].nodeValue  + "\n";
		} else {
			SearchTimer[i]  += "\uE003\uE016\uE003" + Lang[41] + "\uE003" + "\n";
		}
		if ((x[i].getElementsByTagName("use_dayofweek")[0].childNodes[0].nodeValue) == 0) {
			SearchTimer[i] += "\uE003\uE016\uE003" + Lang[47] + "\uE003" + "\n";
		} else {
			//bit is used for dayofweek.
			var dowx = x[i].getElementsByTagName("dayofweek")[0].childNodes[0].nodeValue;
			var dow = "";
			if (dowx > 0) { var y = 1;} else { var y = 0;}
			dowx = Math.abs(dowx);
			for (var dowi=0; dowi<7; dowi++)
			{
				var mask = 1 << dowi;
				if ((dowx & mask) != 0) { dow += days[(dowi+y)] + "\uE003";}
			}
			SearchTimer[i] += "\uE003\uE017\uE003" + Lang[47] + "\uE003:\uE003" + dow + "\n";
		}


		if ((x[i].getElementsByTagName("use_channel")[0].childNodes[0].nodeValue) == 0) {
			SearchTimer[i] += "\uE003\uE016\uE003" + Lang[42] + "\uE003" + "\n";
		} else {
			SearchTimer[i] += "\uE003\uE017\uE003" + Lang[42] + "\uE003:\uE003" + 
					searchchan[(x[i].getElementsByTagName("use_channel")[0].childNodes[0].nodeValue)] + "\uE003" + 
					x[i].getElementsByTagName("channels")[0].childNodes[0].nodeValue + "\n";
		}

		SearchTimer[i]  += "\n</pre>";
		// End of Extended INFO


	  searchtimers[i] += searchtimersSearch[i]  + "\uE003\uE003\n" ;
    }
	  timerOK = 1;
   }
  } catch(e) {
    timerOK = 0;
    alert("Get SearchTimers problem: " + e);
    mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[8] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'><center>\n  " + Lang[43] + ": \n " + server_ip + RestFulAPI + "</center></pre>";
  }
}

function ShowSearchTimerInfo() {
  // info about a search timer.
  //Like Show EPG Info
  //setup some dummy vars

  var info1 = ""; var info2 = "";

	try {
	   xmlhttp=new XMLHttpRequest();
	   xmlhttp.open("GET",(server_ip + RestFulAPI + "/searchtimers/search/" + searchtimersID[timerID] + ".xml?" + new Date().getTime()),false);  
	   xmlhttp.send();
	   xmlDoc=xmlhttp.responseXML;
	   var x=xmlDoc.getElementsByTagName("event");
	   var maxinfo = x.length; if (maxinfo > 15) { maxinfo = 15;}
		
	   for (var i=0;i<maxinfo;i++)
		  { 
			info2 = x[i].getElementsByTagName("param")[16].childNodes[0].nodeValue; // Timer exists
			if (info2 == "true") {
				info1 += "\uE003\uE00C\uE003";
			} else {
				info1 += "\uE003\uE003\uE003";
			}
			info2 = x[i].getElementsByTagName("param")[17].childNodes[0].nodeValue; // Timer active
			if (info2 == "true") {
				info1 += "\uE017\uE003";
			} else {
				info1 += "\uE016\uE003";
			}

			info2 = x[i].getElementsByTagName("param")[6].childNodes[0].nodeValue; // Time
			        date = new Date(Number(info2)*1000);
	        		month = date.getMonth();
			        d = date.getDate();
		        	day = date.getDay();
			        h = date.getHours();
			        m = date.getMinutes();
				h=addzero(h);
				m=addzero(m);
			info2 = Left(days[day],3) + "\uE003" + d + "\uE003" + Left(months[month],3) + "\uE003" + h + ':' + m;
			info1 += info2;
			info2 = "\uE003\uE003" + x[i].getElementsByTagName("param")[7].childNodes[0].nodeValue/60 + "\uE003"; // Duration
			info1 += "\uE003" + Right(info2,3) + Lang[56] + "\uE003" + x[i].getElementsByTagName("param")[5].childNodes[0].nodeValue + "\uE003"; // Channel
			info1 += "\uE003" + Left(x[i].getElementsByTagName("param")[1].childNodes[0].nodeValue,25) + "\uE003"; // Programm Title
			info1 += "\n";
			
		}

	  } catch(e) {
	    alert("Get SearchTimer INFO problem: " + e);

	  }

       	osdepginfo.innerHTML = "<center><pre style='" + color_main_head + ";'>" + searchtimersSearch[timerID] + "\n </pre></center><pre>" + info1 + "</pre>" ;

}

// End of Menu section

// MPD Section

function MPD(ev) {
//     alert("Media player state changed: " + ev);
//     alert("Media player state changed: state=" + ev.state + ", reason=" + ev.reason + ", code=" + ev.code);
//     alert("Media player error :" + mediaPlayer.getError().details);
if (MPDListener == 0) {
	if (ev.state == 6 ) { 
		if (ev.reason == "CommandClose" && ErrorAgain == 0) {
			setTimeout("mediaPlayer.open(URL);mediaPlayer.play(1000);GetEPG(currChan);ExtraStuff();",500);
			ErrorAgain = 1;
		} else {
			ErrorAgain = 0;
			alert("Media player state changed: state=" + ev.state + ", reason=" + ev.reason + ", code=" + ev.code);
			showDisplay("ERRR", false, 100, 0 ); 
			if (experimental) {
				settimer(0,ev.reason,0,2,ErrorColor);
			} else {
				settimer(0,Lang[67],0,2,ErrorColor);
			}
		}
	}
	
} else {
	if ( ev.state == 6 && ev.reason == "HostUnreachable" ) {
	    showDisplay("ERRR", false, 100, 0 );
	mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[60] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>" + Lang[34] + "\n   0 -" + Lang[9] + "\n   9 -" + Lang[61] + "\n\n<center style='" + color_main_head + ";'>" + Lang[62] + ": \n" + server_ip + MPDAddress + "</center></pre>";
	  } else if ( ev.state == 2 ) { // && ev.reason == "PositionEnd" ) {
	    showDisplay("STOP", false, 100, 0 );
	mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[60] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>" + Lang[34] + "\n   0 -" + Lang[9] + "\n   9 -" + Lang[63] + "\n\n<center style='" + color_main_head + ";'>" + Lang[64] + ": \n" + server_ip + MPDAddress + "\n" + Lang[65] + "</center></pre>";
	  } else if ( ev.state == 3 && ev.reason == "CommandPlay" ) {
	showDisplay("MPD", false, 100, 0 );
	mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[60] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>" + Lang[34] + "\n   0 -" + Lang[9] + "\n\n\n<center style='" + color_main_head + ";'>" + Lang[64] + ": \n" + server_ip + MPDAddress + "</center></pre>";
	  } else {
	    showDisplay("ERRR", false, 100, 0 );
	mainmenu.innerHTML = "<h1><center style='font-size:" + fsMenuMain + ";" + color_main_head + ";'>" + Lang[60] + "</center></h1><pre style='" + color_main_font + ";font-size:" + fsMenu + ";'>" + Lang[34] + "\n   0 -" + Lang[9] + "\n   9 -" + Lang[63] + "\n\n<center style='" + color_main_head + ";'>Error : " + ev.state + "\n" + Lang[66] + ": " + ev.reason + "</center></pre>";
	}
}

}

function playMPD(uri) {
  try {
    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) {
      mediaPlayer.close();
    }
	MPDListener = 1;
	mediaPlayer.open(uri);
	mediaPlayer.play(1000);
  } catch (e) {
    alert("Failed opening recording: " + e);
    return;
  }
}


// End of MPD Section

// Media Player Section

function LoadMediaSettings() {
		subgroup = 0;
		subsubgroup = 0;
		isMediaMenu = 1;
		isFullscreen = 0;
		if (getRecOK !== 2) { showDisplay("STOP", false, 100, 0 ); }
		currMed = 0;
		if (getRecOK) { showMediaList();}
		mediaPlayer.addEventListener(mediaPlayer.ON_POSITION_CHANGED, ShowMediaOSD);
		mediaPlayer.addEventListener(mediaPlayer.ON_STATE_CHANGED, onStateChanged);
}

function UnloadMediaSettings() {
	mediaPlayer.removeEventListener(mediaPlayer.ON_POSITION_CHANGED, ShowMediaOSD);
	mediaPlayer.removeEventListener(mediaPlayer.ON_STATE_CHANGED, onStateChanged);
	medialist.style.opacity = 0;
	osdmedia.style.opacity = 0;
	osdtime.style.opacity = 0;
	osdepginfo.style.opacity = 0;
	medialist.innerHTML = "<h1><center style='font-size:" + fsRec + ";" + color_main_head + ";'>" + Lang[0] + "</center></h1>";
	showDisplay(currChan.toString(), false, 100, 0 );
	isMediaMenu = 0;
	isFullscreen = 1;
	isPause = 0;
	set_yellow_key = 0;
	localRecording = 0;
	if (mediaPlayer.getState() != mediaPlayer.STATE_PLAYING ) {
        play(channels[currChan]);
	}
}



function onKeyMedia(keyCode) {
if (DelisOK) {
	switch(keyCode) {
	case KEY_OK:
	  medialist.innerHTML = "<h1><center style='font-size:" + fsRec + ";" + color_main_head + ";'>" + Lang[0] + "</center></h1>";
	  switchtimer.style.opacity = 0;
	  setTimeout("DelRec2(); getRecList(); showMediaList();",100)
	default:
	  switchtimer.style.opacity = 0;
	  DelisOK = 0;
	break;
  	} // end of switch
} else if (medialist.style.opacity != 0) { 
  switch(keyCode) {
    case "BrowserBack":
	if (subgroup && osdepginfo.style.opacity == 0) { 	
		subgroup = 0;
		subsubgroup = 0;
		if (ShowSubDir) {
			MakeRecList2();
		} else {
			MakeRecList();
		}
		setTimeout("showMediaList();",100)
		break;
	}
	if (osdepginfo.style.opacity == 1) { osdepginfo.style.opacity = 0; break; }
    case "TV":
	UnloadMediaSettings();
        break;
    case "Yellow":
	if (set_yellow_key) { 
		//hide/display schedule with same button
		UnloadMediaSettings();
	}
	break;
    case "Right":
	if (getRecOK !== 0) {
           for (var i=0;i<10;i++) {
		do
		{
		        incMed(1);
		}
	//	while (!recTitl[currMed]);
		while (!recList[currMed]);
	   }	
	showMediaList();
	}
	break;
    case "Left":
	if (getRecOK !== 0) {
           for (var i=0;i<10;i++) {
		do
		{
		        decMed(1);
		}
	//	while (!recTitl[currMed]);
		while (!recList[currMed]);
	   }
	showMediaList();
	}
	break;
    case "Down":
	if (getRecOK !== 0) {
	do
	{
	        incMed(1);
	}
	//	while (!recTitl[currMed]);
		while (!recList[currMed]);
	showMediaList();
	}
        break;
    case "Up":
	if (getRecOK !== 0) {
	do
	{
	        decMed(1);
	}
	//	while (!recTitl[currMed]);
		while (!recList[currMed]);
	showMediaList();
	}
	break;
  case KEY_OK:
  case "MediaPlayPause":
	if (getRecOK == 2) {
		ShowInfo();
		osdepginfo.style.opacity = 1 - osdepginfo.style.opacity;
	}
	if (getRecOK == 1) {
		if (recGroup[currMed] !== 0 && subgroup == 0 && ShowSubDir) {
			if (subgroup_old) {
			setTimeout("MakeRecList_sublevel(recGroup[currMed]); showMediaList();",100)
			} else {
			setTimeout("MakeRecList3(recGroup[currMed]); showMediaList();",100)
			}
			subgroup = 1;
		} else if (recSubGroup[currMed] !== 0 && subgroup == 1 && subsubgroup == 0 && ShowSubDir && subgroup_old) {
			setTimeout("MakeRecList_sublevel2(recGroup[currMed],recSubGroup[currMed]); showMediaList();",100)
			subsubgroup = 1;
		} else {
			recList[currMed] = "\u0003" + recList[currMed].substring(1);
			medialist.style.opacity = 0;
			if (get_recordings == 1) {
			setTimeout("GetMarks(); getResume(); playRec(recLink[currMed]+ '?mode=streamtoend&time=' + position);",100);
			} else if (get_recordings == 2) {
//			setTimeout("playRec(recLink[currMed]+ '?pos=resume');position = (mediaPlayer.getPosition()/1000);",100)
			position = 0;
			setTimeout("playRec(recLink[currMed]);",100)
			}
		}
	}
        break;
    case "Red":
	if (getRecOK == 1 && (recGroup[currMed] == 0 || subgroup == 1)) { 
	   // Only delete item if it isn't a subdir marker
	   DelRec(); 
	}
	if (getRecOK == 2) { //set timer
			settimer(recStrt[currMed],recTitl[currMed],recDura[currMed],1,color_switchtimer,recDesc[currMed],recGUID[currMed].toString());
	 }
	break;
    case "Blue":
	// only show info if not a subdir marker or if in EPG mode
	if ( (getRecOK == 1 && (recGroup[currMed] == 0 || subgroup == 1)) || getRecOK == 2) {
	ShowInfo();
	osdepginfo.style.opacity = 1 - osdepginfo.style.opacity;
	}
	break;
    case "Green":
	if (getRecOK == 2 && mediaRecorder) { //set timer only if mediaRecorder = 1, unit has harddisk
			settimer(recStrt[currMed],recTitl[currMed],recDura[currMed],3,"",recDesc[currMed],recGUID[currMed].toString());
	 }
	break;

    case "VolumeMute":
	VolumeMute();
	break;
    case "VolumeUp":
	VolumeUp();
	break;
    case "VolumeDown":
	VolumeDown();
	break;

    case KEY_REC:
    case KEY_REC2:
	// make timer for recording
	if (getRecOK == 2) { //set timer
			settimer(recStrt[currMed],recTitl[currMed],recDura[currMed],2);
			ServerTimer(channels[currChan],recGUID[currMed]);
	 } 
        break;
   case KEY_0:
	if (getRecOK == 1 && (recGroup[currMed] == 0 || recSubGroup[currMed] == 0 || subsubgroup == 1)) { 
	// Only rewind file if it isn't a subdir marker
	setResumeNull();
	showMediaList();
	}
	break;
   case KEY_1:
	if (getRecOK == 1 && (recGroup[currMed] == 0 || recSubGroup[currMed] == 0 || subsubgroup == 1)) { 
		// Only do reccmds if it isn't a subdir marker
		reccmds(1);
	}
	break;
   case KEY_2:
	if (getRecOK == 1 && (recGroup[currMed] == 0 || recSubGroup[currMed] == 0 || subsubgroup == 1)) { 
		// Only do reccmds if it isn't a subdir marker
		reccmds(2);
	}
	break;
   case KEY_3:
	if (getRecOK == 1 && (recGroup[currMed] == 0 || recSubGroup[currMed] == 0 || subsubgroup == 1)) { 
		// Only do reccmds if it isn't a subdir marker
		reccmds(3);
	}
	break;
   case KEY_4:
	if (getRecOK == 1 && (recGroup[currMed] == 0 || recSubGroup[currMed] == 0 || subsubgroup == 1)) { 
		// Only do reccmds if it isn't a subdir marker
		reccmds(4);
	}
	break;
   case KEY_5:
	if (getRecOK == 1 && (recGroup[currMed] == 0 || recSubGroup[currMed] == 0 || subsubgroup == 1)) { 
		// Only do reccmds if it isn't a subdir marker
		reccmds(5);
	}
	break;
   case KEY_6:
	if (getRecOK == 1 && (recGroup[currMed] == 0 || recSubGroup[currMed] == 0 || subsubgroup == 1)) { 
		// Only do reccmds if it isn't a subdir marker
		reccmds(6);
	}
	break;
   case KEY_7:
	if (getRecOK == 1 && (recGroup[currMed] == 0 || recSubGroup[currMed] == 0 || subsubgroup == 1)) { 
		// Only do reccmds if it isn't a subdir marker
		reccmds(7);
	}
	break;
   case KEY_8:
	if (getRecOK == 1 && (recGroup[currMed] == 0 || recSubGroup[currMed] == 0 || subsubgroup == 1)) { 
		// Only do reccmds if it isn't a subdir marker
		reccmds(8);
	}
	break;
   case KEY_9:
	if (getRecOK == 1 && (recGroup[currMed] == 0 || recSubGroup[currMed] == 0 || subsubgroup == 1)) { 
		// Only do reccmds if it isn't a subdir marker
		reccmds(9);
	}
	break;



	default:
        break;
  } // end of switch
} else { 
  switch(keyCode) {
    case "BrowserBack":
//		ShowInfo();
//		osdepginfo.style.opacity = 1 - osdepginfo.style.opacity;
		break;
    case "TV":
	setResume();
	play(channels[currChan]);
	UnloadMediaSettings();
        break;
    break;
    case "Down":
	if (mediaPlayer.getState() != mediaPlayer.STATE_PAUSED) {
	      showDisplay("PAUS", false, 100, 0 );
	      mediaPlayer.play(0);
	}
        break;
    case "Up":
	if (mediaPlayer.getState() != mediaPlayer.STATE_PLAYING) {
		if (currMed == -1 || localRecording == 1 ) {
		      showDisplay("PLAY", false, 100, 0 );
		      mediaPlayer.play(1000);
		} else {		
		      position += (mediaPlayer.getPosition()/1000);
			if (get_recordings == 1) {
			      playRec((recLink[currMed] + "?mode=streamtoend&time=" + position));
			} else if (get_recordings == 2) {
			      playRec((recLink[currMed] + "?pos=time." + position));
			}
		}
	}
	break;
  case KEY_OK:
	osdmedia.style.opacity = 1 - osdmedia.style.opacity;
	osdtime.style.opacity = osdmedia.style.opacity;
	ShowMediaOSD();
        break;
   case "Green":
	if (audio_dyn < (lang_prio_dyn.length -1)) { audio_dyn += 1} else { audio_dyn = 0 }
	if (lang_prio_dyn.length > 1) {
		is.setObject("cfg.media.audio.languagepriority",lang_prio_dyn[audio_dyn] + "," + lang_prio[audio],is.STORAGE_PERMANENT);
		osdlang.style.opacity = 1;
		osdlang.innerHTML = "<img src='unmute.png'> " + lang_prio_dyn[audio_dyn] + " ";
		setTimeout("osdlang.style.opacity = 0; ", 3000);
	}
	break;
    case "Yellow":
	 ShowSubs = 1 - ShowSubs;
	 videoplane.subtitles = Boolean(ShowSubs); // Enable subtitles or Disable subtitles
	break;
    case "Blue":
	if ( isPause == 0 ) {
		ShowInfo();
		osdepginfo.style.opacity = 1 - osdepginfo.style.opacity;
	}
	break;
    case "Red":
	GetMarks();
	ShowMediaOSD();
	break;

   case "Menu":
	osdepginfo.style.opacity = 0;
	osdepginfonext.style.opacity = 0;
	isSetupMenu = 1;
	mainmenu.style.opacity = 0.8;
	menu = 6;
	InitMenu(menu);
	break;

    case "VolumeMute":
	VolumeMute();
	break;
    case "VolumeUp":
	VolumeUp()
	break;
    case "VolumeDown":
	VolumeDown();
	break;


    case KEY_REC:
    case KEY_REC2:
	break;
    case "MediaRewind":
	    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) {
	      mediaPlayer.play(-4000);
	    showDisplay("REW", false, 100, 0 );
	    }
    break;
    case "MediaForward":
	    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) {
	      mediaPlayer.play(4000);
	    showDisplay("FF", false, 100, 0 );
	    }
    break;
    case "MediaStop":
	    if (currMed == -1 || isPause == 1 || localRecording == 1) {
		    if (localRecording == 1) { 
			ss.setParameter(recDummy[0], "resume", mediaPlayer.getPosition().toString());
		    }
		    osdepginfo.style.opacity = 0;
		    isFullscreen = 1; play(channels[currChan]); 
		    UnloadMediaSettings();		
	    } else {
		    setResume();
		    osdepginfo.style.opacity = 0;
		    isFullscreen = 0; play(channels[currChan]); isFullscreen = 1;
		    medialist.style.opacity = 0.9;
		    showDisplay("STOP", false, 100, 0 );
		    showMediaList();
	    }
    break;
	case "MediaPlayPause":
	    if (mediaPlayer.getState() != mediaPlayer.STATE_PAUSED) {
	      showDisplay("PAUS", false, 100, 0 );
	      mediaPlayer.play(0);
	    } else {
		if (currMed == -1 || localRecording == 1) {
		      showDisplay("PLAY", false, 100, 0 );
		      mediaPlayer.play(1000);
		} else {		
			position += (mediaPlayer.getPosition()/1000);
			if (get_recordings == 1) {
				playRec((recLink[currMed] + "?mode=streamtoend&time=" + position));
			} else if (get_recordings == 2) {
				playRec((recLink[currMed] + "?pos=time." + position));
			}
		}
    	    }
	break;
    case KEY_1:
	if (localRecording != 1 ) {
		position += (mediaPlayer.getPosition()/1000) - 30;
		if (position <= 0) { position = 0;} 
			if (get_recordings == 1) {
			      playRec((recLink[currMed] + "?mode=streamtoend&time=" + position));
			} else if (get_recordings == 2) {
			      playRec((recLink[currMed] + "?pos=time." + position));
			}
	} else {
		mediaPlayer.playFromPosition((mediaPlayer.getPosition()-30000),1000);
	}
	break;
    case KEY_4:
	if (localRecording != 1 ) {
		position += (mediaPlayer.getPosition()/1000) - 60;
		if (position <= 0) { position = 0;} 
			if (get_recordings == 1) {
			      playRec((recLink[currMed] + "?mode=streamtoend&time=" + position));
			} else if (get_recordings == 2) {
			      playRec((recLink[currMed] + "?pos=time." + position));
			}
	} else {
		mediaPlayer.playFromPosition((mediaPlayer.getPosition()-60000),1000);

	}
	break;
    case KEY_7:
	if (localRecording != 1 ) {
		position += (mediaPlayer.getPosition()/1000) - 240;
		if (position <= 0) { position = 0;} 
			if (get_recordings == 1) {
			      playRec((recLink[currMed] + "?mode=streamtoend&time=" + position));
			} else if (get_recordings == 2) {
			      playRec((recLink[currMed] + "?pos=time." + position));
			}
	} else {
		mediaPlayer.playFromPosition((mediaPlayer.getPosition()-240000),1000);

	}
	break;

    case KEY_5:
	if (localRecording != 1 ) {
	if (recMark.length>posMark && get_recordings == 1) {	
		position = recMark[posMark]; 
		playRec(recLink[currMed] + "?mode=streamtoend&time=" + position); 
	}
	}
	break;
    case KEY_2:
	if (localRecording != 1 ) {
	if (posMark>0 && get_recordings == 1) {	
		posMark -= 1;
		position = recMark[posMark]; 
		playRec(recLink[currMed] + "?mode=streamtoend&time=" + position); 
	}
	}
	break;
    case KEY_8:
	if (localRecording != 1 ) {
	if (recMark[posMark+1] && get_recordings == 1) {	
		posMark += 1;
		position = recMark[posMark]; 
		playRec(recLink[currMed] + "?mode=streamtoend&time=" + position); 
	}
	}
	break;



    case KEY_3:
	if (localRecording != 1 ) {
		position += (mediaPlayer.getPosition()/1000) + 30;
		if (get_recordings == 1) {
			if (position >= recDura[currMed]) {
			 	BackToTV();
			} else {
				playRec((recLink[currMed] + "?mode=streamtoend&time=" + position));
			}
		} else if (get_recordings == 2) {
			playRec((recLink[currMed] + "?pos=time." + position));
		}
	} else {
		mediaPlayer.playFromPosition((mediaPlayer.getPosition()+30000),1000);
	}
	break;
    case KEY_6:
	if (localRecording != 1 ) {
		position += (mediaPlayer.getPosition()/1000) + 60;
		if (get_recordings == 1) {
			if (position >= recDura[currMed]) {
			 	BackToTV();
			} else {
				playRec((recLink[currMed] + "?mode=streamtoend&time=" + position));
			}
		} else if (get_recordings == 2) {
			playRec((recLink[currMed] + "?pos=time." + position));
		}
	} else {
		mediaPlayer.playFromPosition((mediaPlayer.getPosition()+60000),1000);
	}
	break;
    case KEY_9:
	if (localRecording != 1 ) {
		position += (mediaPlayer.getPosition()/1000) + 240;
		if (get_recordings == 1) {
			if (position >= recDura[currMed]) {
			 	BackToTV();
			} else {
				playRec((recLink[currMed] + "?mode=streamtoend&time=" + position));
			}
		} else if (get_recordings == 2) {
			playRec((recLink[currMed] + "?pos=time." + position));
		}
	} else {
		mediaPlayer.playFromPosition((mediaPlayer.getPosition()+240000),1000);
	}
	break;
   case KEY_0:
	if (localRecording != 1 ) {
	position = 0; posMark = 0;
			if (get_recordings == 1) {
			      playRec((recLink[currMed] + "?mode=streamtoend&time=" + position));
			} else if (get_recordings == 2) {
			      playRec((recLink[currMed] + "?pos=time." + position));
			}
	} else {
		mediaPlayer.playFromPosition(0,1000)
	}
	break;

	default:
        break;
  } // end of switch
 } // end of if
}

function getRecList() {
	getVDRstatus();
	MaxInGroup = 14;
	subgroup = 0;
	subsubgroup = 0;
try {
 if (get_recordings ==1) {
	 // get recordings from smartTVWeb
	  xmlhttp=new XMLHttpRequest();
	   xmlhttp.open("GET",(server_ip + recServ + recPath + "?" + new Date().getTime()),false);
	   xmlhttp.send();
	   xmlDoc=xmlhttp.responseXML; 
	   var x=xmlDoc.getElementsByTagName("item");
	   nrMedia = x.length - 1;
	   recTitl.length = 0;
	   rec_lst.length = 0;

	 if (recPath == "/recordings.xml") {
	   for (var i=0;i<x.length;i++)
		  { 
			rec_lst[i] = new Array();
			for (var yy=0;yy<9;yy++) { rec_lst[i][yy] = new Array(); }
			  rec_lst[i][0] = (x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue);
			  rec_lst[i][0] = rec_lst[i][0].split("~");
			  rec_lst[i][1] = (x[i].getElementsByTagName("enclosure")[0].getAttribute('url'));
			  rec_lst[i][2] = (x[i].getElementsByTagName("description")[0].childNodes[0].nodeValue);
			  rec_lst[i][3] = (x[i].getElementsByTagName("duration")[0].childNodes[0].nodeValue);
			  rec_lst[i][4] = (x[i].getElementsByTagName("start")[0].childNodes[0].nodeValue);
			  rec_lst[i][5] = (x[i].getElementsByTagName("isnew")[0].childNodes[0].nodeValue);
			  rec_lst[i][6] = (x[i].getElementsByTagName("guid")[0].childNodes[0].nodeValue);
			  //Get channel number from recordings, shows right names only if server & client use same channel order
			  recDummy = rec_lst[i][6].split(".");
			  recDummy = recDummy[(recDummy.length-2)].split("-");
			  rec_lst[i][7] = recDummy[0] + "\uE003-\uE003" + channelsnames[(recDummy[0])];
			  rec_lst[i][8] = protChn[Number(Left((recDummy[0] / 1000),1))];

	 }

	  //Get channel number from recordings
		rec_lst.sort();
	   	for (var i=0;i<x.length;i++) {
			recTitl[i] = rec_lst[i][0];
			recLink[i] = rec_lst[i][1];
			recDesc[i] = rec_lst[i][2];
			recDura[i] = rec_lst[i][3];
			recStrt[i] = rec_lst[i][4];
			rec_New[i] = rec_lst[i][5];
			recGUID[i] = rec_lst[i][6];
			recChan[i] = rec_lst[i][7];
			recProt[i] = rec_lst[i][8];
		}
		recProt[i] = 1;
	 } else {

	 // old recordings list function
	 // also used for media listing

	   for (var i=0;i<x.length;i++) { 
	          recTitl[i] = (x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue);
	          recTitl[i] = recTitl[i].split("~");
	 //          recLink[i] = (x[i].getElementsByTagName("link")[0].childNodes[0].nodeValue);
	          recLink[i] = (x[i].getElementsByTagName("enclosure")[0].getAttribute('url'));
	          recDesc[i] = (x[i].getElementsByTagName("description")[0].childNodes[0].nodeValue);
	          recDura[i] = (x[i].getElementsByTagName("duration")[0].childNodes[0].nodeValue);
	          recStrt[i] = (x[i].getElementsByTagName("start")[0].childNodes[0].nodeValue);
	          rec_New[i] = (x[i].getElementsByTagName("isnew")[0].childNodes[0].nodeValue);
	          recGUID[i] = (x[i].getElementsByTagName("guid")[0].childNodes[0].nodeValue);
                  //Media directory
                  recChan[i] = "Media File";
                  recProt[i] = 0; // No protection for Media Files.
	         }
	// try to fix display double entries in the last directory. (Only shown for some time after deleting files, should be fixed now)
	recProt[i] = 1;
   }
} else if (get_recordings == 2) {
//get recordings from streamdev
//no media directory or delete support
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + StreamPort + "recordings.rss?" + new Date().getTime()),false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
   var x=xmlDoc.getElementsByTagName("item");
   nrMedia = x.length - 1;
   recTitl.length = 0;

   for (var i=0;i<x.length;i++)
	  { 
			  rec_lst[i] = new Array();
			  for (var yy=0;yy<9;yy++) { rec_lst[i][yy] = new Array(); }
			  rec_lst[i][0] = x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue.split("  ");
			  rec_lst[i][0] = rec_lst[i][0][1].split("~");
			  rec_lst[i][1] = x[i].getElementsByTagName("enclosure")[0].getAttribute('url');
			  rec_lst[i][2] = Lang[37];
			  rec_lst[i][3] = Lang[37];
			  rec_lst[i][4] = x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
			  rec_lst[i][4] = rec_lst[i][4].split(" ");
			  rec_lst[i][4] = rec_lst[i][4][1] + " " + rec_lst[i][4][2];
			  rec_lst[i][5] = Lang[37];
			  rec_lst[i][6] = x[i].getElementsByTagName("link")[0].childNodes[0].nodeValue;
			  rec_lst[i][7] = 0;
			  rec_lst[i][8] = 0;
	 }

		rec_lst.sort();
	   	for (var i=0;i<x.length;i++) {
			recTitl[i] = rec_lst[i][0];
			recLink[i] = rec_lst[i][1];
			recDesc[i] = rec_lst[i][2];
			recDura[i] = rec_lst[i][3];
			recStrt[i] = rec_lst[i][4];
			rec_New[i] = rec_lst[i][5];
			recGUID[i] = rec_lst[i][6];
			recChan[i] = rec_lst[i][7];
			recProt[i] = rec_lst[i][8];
		}


	recProt[i] = 1;
} else if (get_recordings == 0) {
	 // get recordings from restfulapi
	  xmlhttp=new XMLHttpRequest();
	   xmlhttp.open("GET",(server_ip + RestFulAPI + "/recordings.xml?" + new Date().getTime()),false);
	   xmlhttp.send();
	   xmlDoc=xmlhttp.responseXML; 
	   var x=xmlDoc.getElementsByTagName("recording");
	   nrMedia = x.length - 1;
	   recTitl.length = 0;
	   rec_lst.length = 0;

	   for (var i=0;i<x.length;i++)
		  { 
			rec_lst[i] = new Array();
			for (var yy=0;yy<9;yy++) { rec_lst[i][yy] = new Array(); }
			  rec_lst[i][0] = x[i].getElementsByTagName("param")[1].childNodes[0].nodeValue;
			  rec_lst[i][0] = rec_lst[i][0].split("~");
			  rec_lst[i][1] = x[i].getElementsByTagName("param")[2].childNodes[0].nodeValue;
			  rec_lst[i][2] = x[i].getElementsByTagName("param")[13].textContent; 
			  rec_lst[i][3] = x[i].getElementsByTagName("param")[8].childNodes[0].nodeValue;
			  rec_lst[i][4] = x[i].getElementsByTagName("param")[14].childNodes[0].nodeValue;
			  rec_lst[i][5] = x[i].getElementsByTagName("param")[4].childNodes[0].nodeValue;
			  rec_lst[i][6] = x[i].getElementsByTagName("param")[0].childNodes[0].nodeValue;
			  //Get channel number from recordings, shows right names only if server & client use same channel order
			  recDummy = rec_lst[i][1].split(".");
			  recDummy = recDummy[(recDummy.length-2)].split("-");
			  rec_lst[i][7] = recDummy[0] + "\uE003-\uE003" + channelsnames[(recDummy[0])];
			  rec_lst[i][8] = protChn[Number(Left((recDummy[0] / 1000),1))];

	 }

	  //Get channel number from recordings
		rec_lst.sort();
	   	for (var i=0;i<x.length;i++) {
			recTitl[i] = rec_lst[i][0];
			recLink[i] = rec_lst[i][1];
			recDesc[i] = rec_lst[i][2];
			recDura[i] = rec_lst[i][3];
			recStrt[i] = rec_lst[i][4];
			rec_New[i] = rec_lst[i][5];
			recGUID[i] = rec_lst[i][6];
			recChan[i] = rec_lst[i][7];
			recProt[i] = rec_lst[i][8];
		}
		recProt[i] = 1;
	// try to fix display double entries in the last directory. (Only shown for some time after deleting files, should be fixed now)
}


//end of get_recordings
	if (ShowSubDir) {
		MakeRecList2();
	} else {
		MakeRecList();
	}
	if (i!==0) { getRecOK = 1; } else {
	getRecOK = 0;
	medialist.innerHTML = "<h1><center style='font-size:" + fsRec + ";" + color_main_head + ";'>" + Lang[38] + "</center><pre>\n\n\n" + Lang[37] + "</pre></h1>";
	}

  } catch(e) {
    alert("Get Recordings problem: " + e);
	getRecOK = 0;
	medialist.innerHTML = "<h1><center style='font-size:" + fsRec + ";" + color_main_head + ";'>" + Lang[38] + "</center><pre>\n\n\n" + Lang[39] + "</pre></h1>";
  }
}


function GetMarks() {

if (get_marks==1) {
 try {
   posMark = 0;
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + recServ + "/getMarks.xml?guid=" + recGUID[currMed] + "&" + new Date().getTime()),false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML;
   recMark = [];
   var x=xmlDoc.getElementsByTagName("mark");
	   for (var i=0;i<x.length;i++)
		{
		var y = x[i].childNodes[0].nodeValue.split(",");
		recMark[i] = Number(y[0]);
		}
  } catch(e) {
    alert("Getting Marks problem: " + e);
  }
 } else {
  try {
   posMark = 0;
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + RestFulAPI + "/recordings/" + currMed + ".xml?marks=true&" + new Date().getTime()),false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML;
   recMark = [];
   var x=xmlDoc.getElementsByTagName("mark");
	   for (var i=0;i<x.length;i++)
		{
		var y = x[i].childNodes[0].nodeValue.split(":");
		recMark[i] = Number(y[0]*3600) + Number(y[1]*60) + Number(y[2]);
		}
  } catch(e) {
    alert("Getting Marks problem: " + e);
  }
 }
}


function setResume() {
if (get_recordings == 1) {
try {
	position += (mediaPlayer.getPosition()/1000)
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", server_ip + recServ + "/setResume.xml?guid=" + recGUID[currMed] + "&resume=" + position, false);
        xmlhttp.send();
	recList[currMed] = "\uE003" + recList[currMed].substring(1);
  } catch(e) {
    alert("Setting Resume problem: " + e);
  }
}
}

function getResume() {
position = 0;
if (get_recordings == 1) {
try {
	  var xmlhttp = new XMLHttpRequest();
	  var i = 0;
	  xmlhttp.open("GET", server_ip + recServ + "/getResume.xml?guid=" + recGUID[currMed] + "&" + new Date().getTime(), false);
	  xmlhttp.send();
	  xmlDoc=xmlhttp.responseXML; 
	  i = xmlDoc.getElementsByTagName("resume")[0].childNodes[0].nodeValue.split(",");
	  position = Number(i[0]);
  } catch(e) {
    alert("Getting Resume problem: " + e);
  }
}
}


function setResumeNull() {
if (get_recordings == 1) {
try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", server_ip + recServ + "/setResume.xml?guid=" + recGUID[currMed] + "&resume=0", false);
        xmlhttp.send();
	recList[currMed] = "\uE010" + recList[currMed].substring(1);
  } catch(e) {
    alert("Setting Resume problem: " + e);
  }
}
}

function reccmds(option) {
try {
	option = Number(option);
	if (RecCmds[option] > -1 ) {
	        var xmlhttp = new XMLHttpRequest();
	        xmlhttp.open("POST", server_ip + recServ + "/execreccmd?cmd=" + RecCmds[option] + "&guid=\"" + recGUID[currMed] + "\"", false);
	        xmlhttp.send();
		recList[currMed] = RecCmdsIcon[option] + recList[currMed].substring(1);
		showMediaList();
	}
  } catch(e) {
    alert("Execute reccmds problem: " + e);
  }

}



function CheckPlugins() {
try {
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + recServ + "/vdrstatus.xml?" + new Date().getTime()),false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
	smartTVplugin = 1;
  } catch(e) {
    alert("NO smartTVplugin: " + e);
	smartTVplugin = 0;
  }

//Check for Restfulapi

try {
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + RestFulAPI + "/info.xml?" + new Date().getTime()),false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
    Restfulapiplugin = 1;
  } catch(e) {
    alert("NO Restfulapiplugin: " + e);
    Restfulapiplugin = 0;
  }
}

function getVDRstatus() {
if (smartTVplugin == 1) {
try {
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + recServ + "/vdrstatus.xml?" + new Date().getTime()),false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
//   var x=xmlDoc.getElementsByTagName("vdrstatus");
   var x=xmlDoc.getElementsByTagName("diskspace");
	  free_space = x[0].getElementsByTagName("free")[0].childNodes[0].nodeValue;
	  perc_space = x[0].getElementsByTagName("percent")[0].childNodes[0].nodeValue;
  } catch(e) {
    alert("Get VDR Status problem: " + e);
  }
}
if (smartTVplugin == 0 && Restfulapiplugin == 1) {
try {
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + RestFulAPI + "/info.xml?" + new Date().getTime()),false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
   var x=xmlDoc.getElementsByTagName("diskusage");
	  free_space = x[0].getElementsByTagName("free_mb")[0].childNodes[0].nodeValue;
	  perc_space = x[0].getElementsByTagName("used_percent")[0].childNodes[0].nodeValue;
  } catch(e) {
    alert("Get VDR Status problem: " + e);
  }
 }
}


function DelRec() {
	if (osdepginfo.style.opacity == 1) {osdepginfo.style.opacity = 0;}
try {
	//popup for confirm
	switchtimer.style.background = "red";
	switchtimer.style.opacity = 1;
	switchtimer.innerHTML = "<pre><center>" + Lang[44] +"\n" + Lang[45] + "\n\n " + Left(recTitl[currMed],30) + "</center></pre>"; // Recording Name
	DelisOK = 1
  } catch(e) {
    alert("Delete Recordings problem: " + e);
  }
}

function DelRec2() {
  if (get_recordings == 1) {
	try {
	   xmlhttp=new XMLHttpRequest();
	   xmlhttp.open("POST",(server_ip + recServ + "/deleteRecording.xml?id=" + recGUID[currMed] ),false);
	   xmlhttp.send();
	   recList[currMed] = "";
	   recGroup[currMed] = -1;
	   recProt[currMed] = 0;
	  } catch(e) {
	    alert("Delete Recordings problem: " + e);
	  }
  } else if (get_recordings == 0) {
//	try {
//	   xmlhttp=new XMLHttpRequest();
//	   xmlhttp.open("DELETE",(server_ip + RestFulAPI + "/recordings/" + recGUID[currMed] ),true);
//	   xmlhttp.send();
//	   recList[currMed] = "";
//	   recGroup[currMed] = -1;
//	   recProt[currMed] = 0;
//	  } catch(e) {
//	    alert("Delete Recordings problem: " + e);
//	  }
//
  }
}




function MakeRecList() {
//old style list
   var x = "";
   var xx = "";
   for (var i=0;i<recTitl.length;i++)
	{
	if (recTitl[i][recMap + 2]) { 
		if (recTitl[i][recMap + 1] != xx) {
						var y = recTitl[i][recMap].length + 1;
						if (recTitl[i][recMap] != x) {
								recList[i] = "\uE002 " + recTitl[i][recMap] + " \uE002 " + String(recTitl[i]).substring(y);
							} else {
								recList[i] = "\uE003 " + new Array(y).join("\uE003") + " \uE002 " + String(recTitl[i]).substring(y);
							}
					} else {
						var y = recTitl[i][recMap + 1].length + recTitl[i][recMap].length + 4;
						recList[i] = new Array(y).join("\uE003") + String(recTitl[i]).substring(y - 2);
						}
	} else if (recTitl[i][recMap + 1]) { 
					if (recTitl[i][recMap] != x) {
						recList[i] = "\uE002" + recTitl[i];
					} else {
						var y = recTitl[i][recMap].length + 4;
						recList[i] = new Array(y).join("\uE003") + String(recTitl[i]).substring(y - 3);
					}
				} else { 
					recList[i] = "\uE003" + recTitl[i];
				}
	if (get_recordings == 2 ) {
		result = recStrt[i];
	} else{ 
		AddInfo(i);
	}

	if (rec_New[i] == "true" ) 
		{ 
		recList[i] = "\uE010" + result + "\uE003" + recList[i]; 
		} else { 
		recList[i] = "\uE003" + result + "\uE003" + recList[i]; 
		}
	x = recTitl[i][recMap];
	xx = recTitl[i][recMap + 1];
	if ((recProt[i] == 1) && (ShowProtectedChannels == 1)) { recList[i] = "";}
	}
}

function MakeRecList2() {
//new style with sub maps
   var x = "";
   var xx = 0;
   for (var i=0;i<recTitl.length;i++)
	{
	 if (recTitl[i][1]) { 
					if (recTitl[i][0] != x) {
						recList[i] = "\uE002\uE003" + recTitl[i][0];
						xx += 1;
					} else {
						recList[i] = "" ; 
					}
					recGroup[i] = xx;
				} else { 
					recGroup[i] = 0;
						if (get_recordings == 2 ) {
							result = recStrt[i];
						} else{ 
							AddInfo(i);
							if (recChan[i] !== "Media File") {result += "\uE003" + (recDura[i]/60).toFixed(0);}
						}
						if (rec_New[i] == "true" ) { 
							recList[i] = "\uE010" + result + "\uE003" + recTitl[i]; 
						} else { 
							recList[i] = "\uE003" + result + "\uE003" + recTitl[i];
						}
				}

	if ((recProt[i] == 1) && (ShowProtectedChannels == 1)) { recList[i] = "";}

	x = recTitl[i][0];
	}
}

function MakeRecList3(GroupID) {

   MaxInGroup = -1;
   for (var i=0;i<recTitl.length;i++)
	{
		if (recGroup[i] == GroupID) {
			var tmp = "";
			   for (var ii=1;ii<recTitl[i].length;ii++)
				{
				tmp += "\uE003" + recTitl[i][ii];
				}
			if (get_recordings == 2 ) {
				result = recStrt[i];
			} else{ 
				AddInfo(i);
				if (recChan[i] !== "Media File") {result += "\uE003" + (recDura[i]/60).toFixed(0);}
			}
			if (rec_New[i] == "true" ) { 
				recList[i] = "\uE010" + result + tmp; // recTitl[i]; 
			} else { 
				recList[i] = "\uE003" + result + tmp; //recTitl[i]; 
			}

			MaxInGroup = MaxInGroup + 1;
			if ((recProt[i] == 1) && (ShowProtectedChannels == 1)) { recList[i] = "";}

		} else {
			recList[i] = "" ; 
		}
	}
}

//
//
// sub-sublevel testing
//
//

function MakeRecList_sublevel(GroupID) {
//new style with sub maps on sub maps
   var x = "";
   var xx = 0;
   recList.length = 0;
   MaxInGroup = -1;
   for (var i=0;i<recTitl.length;i++)
	{
	if (recGroup[i] == GroupID) {
	 Group_Header[GroupID] = recTitl[i][0];
		 if (recTitl[i][2]) { 
					if (recTitl[i][1] != x) {
						
						recList[i] = "\uE002\uE003" + recTitl[i][1];
						xx += 1;
					} else {
						recList[i] = "" ; 
					}
					recSubGroup[i] = xx;
		} else { 
					recSubGroup[i] = 0;
					var tmp = "";
					for (var ii=1;ii<recTitl[i].length;ii++)
						{
							tmp += "\uE003" + recTitl[i][ii];
						}
					if (get_recordings == 2 ) {
						result = recStrt[i];
					} else{ 
						AddInfo(i);
						if (recChan[i] !== "Media File") {result += "\uE003" + (recDura[i]/60).toFixed(0);}
					}
					if (rec_New[i] == "true" ) { 
						recList[i] = "\uE010" + result + tmp; // recTitl[i]; 
					} else { 
						recList[i] = "\uE003" + result + tmp; //recTitl[i]; 
					}
		}
		if ((recProt[i] == 1) && (ShowProtectedChannels == 1)) { recList[i] = "";}
		if (recList[i] != "") { MaxInGroup = MaxInGroup + 1; }
		x = recTitl[i][1];
	}
	}
//MakeRecList_sublevel2(GroupID,0);
}


function MakeRecList_sublevel2(GroupID,SubGroupID) {
   MaxInGroup = -1;
   for (var i=0;i<recTitl.length;i++)
	{
		if (recGroup[i] == GroupID && recSubGroup[i] == SubGroupID) {
			var tmp = ""; var xx = "\uE003";
			   for (var ii=2;ii<recTitl[i].length;ii++)
				{
					if (recTitl[i][(ii+1)]) {
						tmp += "\uE003\uE002" + recTitl[i][ii];
						xx = "/";
					} else {
						tmp += xx + recTitl[i][ii];
					}
				}
			if (get_recordings == 2 ) {
				result = recStrt[i];
			} else{ 
				AddInfo(i);
				if (recChan[i] !== "Media File") {result += "\uE003" + (recDura[i]/60).toFixed(0);}
			}
			if (rec_New[i] == "true" ) { 
				recList[i] = "\uE010" + result + tmp; // recTitl[i]; 
			} else { 
				recList[i] = "\uE003" + result + tmp; //recTitl[i]; 
			}

			MaxInGroup = MaxInGroup + 1;
			if ((recProt[i] == 1) && (ShowProtectedChannels == 1)) { recList[i] = "";}

		} else {
			recList[i] = "" ; 
		}
	}
}

//
//
// End of sub-sublevel testing
//
//

function AddInfo(info) {
//Add Date to item
        date = new Date(Number(recStrt[info])*1000);
        year = date.getFullYear();
        month = date.getMonth();
        d = date.getDate();
        h = date.getHours();
        m = date.getMinutes();
	month=addzero(month + 1);
	d=addzero(d);
	h=addzero(h);
	m=addzero(m);
	if ( year==1970 ) { 
		result = "\uE003";
	} else {
	        result = "\uE003" + d + '-' + month + '-' + year + ' ' + h + ':' + m;
	}
//
}

function showMediaList() {
	if (osdepginfo.style.opacity == 1) {osdepginfo.style.opacity = 0;}
	osdmedia.style.opacity = 0;
	osdtime.style.opacity = 0;
	var liststyle = "";
	listMed = currMed - 1;
	var MaxMed = -1;

	if (getRecOK == 1) {
		var htmlstring = "<h1><center style='font-size:" + fsRec + ";" + color_main_head + ";'>" + Lang[38] + "(" + Lang[46] + (100 - perc_space) + "%, " + (free_space/1024).toFixed(0) + " GB) </center></h1><table border='0'><tr>";

		if (subgroup) {
			htmlstring = "<h1><center style='font-size:" + fsRec + ";" + color_main_head + ";'>" + Group_Header[Number(recGroup[currMed])] + "</center></h1><table border='0'><tr>";
			if (MaxInGroup < 14){ MaxMed = MaxInGroup; } else {MaxMed = 14; }
		}
		if (!subgroup) { 
			for(var i=0; i<=nrMedia; i++) {
				if (recList[i]) { MaxMed += 1;}
			}
		}

	} else {

		if (nrMedia < 14) {MaxMed = nrMedia; } else {MaxMed = 14; }
		var htmlstring = "<h1><center style='font-size:" + fsRec + ";" + color_main_head + ";'>" + Lang[11] + channelsnames[currChan] + " </center></h1><table border='0'><tr>";
	}

	if (MaxMed > 14) { MaxMed = 14; }
	if (MaxMed < 0 ) { MaxMed = 0; }

	for(var i=currMed; i<=currMed + MaxMed; i++) {
		if (listMed>=nrMedia) { listMed= -1; }
		if (listMed<-1) { listMed=nrMedia - 1; } 
//		if (listMed>nrMedia) { listMed= -1; }

		do
			{
				listMed += 1;
			}
		while (!recList[listMed] && (listMed<=nrMedia));

		if ( listMed == currMed) { 
			liststyle = " style='background:" + color_bg + ";-webkit-border-radius:25px;";
		}  else {
			liststyle = " style='";
		}
		
//		alert(recList[listMed]);
//		alert(listMed + " : " + nrMedia);
		if (listMed > nrMedia) { recList[listMed] = ""; }

		if (recList[listMed]) {
		//Solves empty string at the end.
		htmlstring += "<td" + liststyle + "font-size:" + fsReclist + ";'>\uE003" + Left(recList[listMed],60) + "\uE003\uE003</td></tr>";
		}
	}
	medialist.innerHTML = htmlstring + "</table>";
	//ShowInfo();
}

function getServerSchedule() {
try {
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + RestFulAPI + "/events/" + channels[currChan] + ".xml?timespan=" + serverEPGdays + "&" + new Date().getTime()),false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
   var x=xmlDoc.getElementsByTagName("event");
   nrMedia = x.length - 1;
   for (var i=0;i<x.length;i++)
	  { 

/*	// restful api layout dd 10/04/2013
	// <event>
	// 1 <param name="id">516</param>
	// 2 <param name="title">Thuis</param>
	// 3 <param name="short_text"/ >
	// 4 <param name="description">Soapserie (BE).</param>
	// 5 <param name="channel">S19.2E-53-1105-4016</param>
	// 6 <param name="channel_name">BVN (S)</param>
	// 7 <param name="start_time">1365608700</param>
	// 8 <param name="duration">1500</param>
	// 9 <param name="table_id">78</param>
	// 10 <param name="version">7</param>
	// 11 <param name="parental_rating">0</param>
	// 12 <param name="vps">0</param>
	// 13 <param name="images">0</param>
	// 14 <param name="components">
	//	<component stream="1" type="1" language="dut" description="4:3"/ >
	//	<component stream="2" type="1" language="dut" description=""/ ></param>
	// 15 <param name="contents">
	// 16 <content name="Soap/Melodrama/Folkloric"/ ></param>
	// 17 <param name="raw_contents"><raw_content name="21"/ ></param>
	// 18 <param name="timer_exists">false</param>
	// 19 <param name="timer_active">false</param>
	// 20 <param name="timer_id"/ >
	// </event>
*/

	recTitl[i] = x[i].getElementsByTagName("param")[1].childNodes[0].nodeValue;
		try { 
			recDesc[i] = x[i].getElementsByTagName("param")[3].childNodes[0].nodeValue; 
		} catch(e) {
			recDesc[i] = "";
		}
	recDura[i] = x[i].getElementsByTagName("param")[7].childNodes[0].nodeValue;
	recStrt[i] = x[i].getElementsByTagName("param")[6].childNodes[0].nodeValue;
	recChan[i] = currChan + "\uE003-\uE003" + channelsnames[currChan];
	recGUID[i] = x[i].getElementsByTagName("param")[0].childNodes[0].nodeValue;

        date = new Date(Number(recStrt[i])*1000);
	        year = date.getFullYear();
	        month = date.getMonth();
	        d = date.getDate();
        	day = date.getDay();
	        h = date.getHours();
	        m = date.getMinutes();
		h=addzero(h);
		m=addzero(m);
	recList[i] = ''+days[day]+' '+d+' '+months[month]+' '+year+' '+h+':'+m + " " + recTitl[i];

	  }
 	getRecOK = 2;
  } catch(e) {
    alert("Get EPG problem: " + e);
	getRecOK = 0;
	medialist.innerHTML = "<h1><center style='font-size:" + fsRec + ";" + color_main_head + ";'>" + Lang[50] + "</center><pre>\n\n\n" + Lang[51] + "</pre></h1>";
  }
}

function getSchedule(schchan){
	SI = "";
	recTitl.length = 0;
	nrMedia = 0;
  try {
	 StreamInfo(schchan);

	 eitService = toi.statics.ToiDvbEitCacheServiceItem.create(SI[1],SI[2],SI[3]);
	 eitCache.addService(eitService);
	 event = eitCache.getPresentEvent(eitService);
	 events = eitCache.getEvents(eitService, (Math.round(new Date().getTime()/1000.0)), 2000000000);

	if (event.name)	{
	    if (events.more) {
	      var t = eitCache.getEvents(eitService, (Math.round(new Date().getTime()/1000.0)), 2000000000);
	      events.infoSequence.concat(t.infoSequence);
	      events.more = t.more;
	    }
	    nrMedia = events.infoSequence.length - 1;
	    for (var i = 0; i < events.infoSequence.length; i++) {

		// Double info or scrollbar twice on the screen if nrMedia < 14
		while ((i > 0) && (events.infoSequence[i].eventId == events.infoSequence[(i-1)].eventId) && (nrMedia > 14)) {
			recList[i] = "";
			i += 1;
		}

		recTitl[i] = events.infoSequence[i].name;
		recDesc[i] = eitCache.getExtendedEventInfo(eitService,events.infoSequence[i].eventId).extendedInfo;
		if (recDesc[i] == "" ) { recDesc[i] = eitCache.getExtendedEventInfo(eitService,events.infoSequence[i].eventId).shortInfo;}
		recDura[i] = events.infoSequence[i].duration;
		recStrt[i] = events.infoSequence[i].time;
		recChan[i] = schchan + "\uE003-\uE003" + channelsnames[schchan];
		recGUID[i] = events.infoSequence[i].eventId;

	        date = new Date(Number(recStrt[i])*1000);
		        year = date.getFullYear();
		        month = date.getMonth();
		        d = date.getDate();
	        	day = date.getDay();
		        h = date.getHours();
		        m = date.getMinutes();
			h=addzero(h);
			m=addzero(m);
			recList[i] = ' ' + days[day] + ' ' + d + ' ' + months[month] + ' ' + year + " " + h + ":" + m + " (" + (recDura[i]/60).toFixed(0) + ") " + Left(recTitl[i],30);
		}
	getRecOK = 2;
	} else {
	getRecOK = 0;

	medialist.innerHTML = "<h1><center style='font-size:" + fsRec + ";" + color_main_head + ";'>" + Lang[11] + "</center><pre>\n\n\n" + Lang[52] + "</pre></h1>";

	if (experimental) {
	medialist.innerHTML += "<img src='" + channels[schchan] + ".jpg' style='width:100%; position:absolute; left:0%; top:-11%;'>";
	}

	}
  } catch(e) {
	getRecOK = 0;
	medialist.innerHTML = "<h1><center style='font-size:" + fsRec + ";" + color_main_head + ";'>" + Lang[11] + "</center><pre>\n\n\n" + Lang[53] + "</pre></h1>";
  }

}



function incMed(step) {
    currMed += step;
    if (currMed > nrMedia ) {
        currMed = 0;
    }
}

function decMed(step) {
    currMed -= step;
    if (currMed < 0) {
        currMed = nrMedia;
    }
}

function playRec(uri,posrec) {
  try {
    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) {
      mediaPlayer.close();
    }
	if (osdepginfo.style.opacity == 1) {osdepginfo.style.opacity = 0;}
	mediaPlayer.open(uri);
	if (posrec) {
		mediaPlayer.playFromPosition(posrec,1000);
	} else {
		mediaPlayer.play(1000);
	}
	showDisplay("PLAY", false, 100, 0 );
  } catch (e) {
    alert("Failed opening recording: " + e);
    return;
  }
}


function pauseRec(uri) {
  try {
    if (mediaPlayer.getState() != mediaPlayer.STATE_IDLE) {
      mediaPlayer.close();
    }
	if (osdepginfo.style.opacity == 1) {osdepginfo.style.opacity = 0;}
	mediaPlayer.open(uri);
	mediaPlayer.play(0);
	showDisplay("PAUS", false, 100, 0 );
  } catch (e) {
    alert("Failed opening recording: " + e);
    return;
  }
}



function createNewAsset() {
	try {
		assetId = ams.createAsset(ams.ASSET_PVR);
//		alert("Created " + assetId);
	} catch(e) {
		alert("Couldn't create asset: " + e);
	}
}

function onStateChanged(ev) {
//    alert("Media player state changed: state=" + ev.state + ", reason=" + ev.reason + ", code=" + ev.code);

	if ( ( ev.state == 6 && ev.reason == "HostUnreachable" ) || ( ev.state == 2 && ev.reason == "PositionEnd" )) {
	BackToTV();
	}

}

// Start recording/ timeshift

function ServerRecordStart() {
//Record current program

	try {
	   xmlhttp=new XMLHttpRequest();
	   xmlhttp.open("GET",(server_ip + recServ + "/addTimer?guid=" + channels[currChan] + "&" + new Date().getTime() ),false);
	   xmlhttp.send();

		if (xmlhttp.responseXML == null) {
		    //settimer(EPG[NowNext][2][currChan],Lang[55],0,2);
		    //Timer not set, try direct recording
		    ServerRecord();
		    settimer(0,Lang[57],0,2);
		} else {
		   settimer(EPG[NowNext][2][currChan],EPG[NowNext][1][currChan],0,2);
		}

	  } catch(e) {
	    alert("Sending Timers to server problem: " + e);
	    settimer(0,Lang[55],0,2,ErrorColor);
	  }

}


function ServerRecord() {
//Instant record on server

  try {
	xmlhttp=new XMLHttpRequest();
	//switch server to current channel
	xmlhttp.open("POST",(server_ip + RestFulAPI + "/remote/switch/" + channels[currChan]),true);
	xmlhttp.send();
	//start recording
	setTimeout("xmlhttp.open('POST',(server_ip + RestFulAPI + '/remote/Record'),false);xmlhttp.send();",5000);
  } catch(e) {
   alert("Sending key to server problem: " + e);
   settimer(0,Lang[55],0,2,ErrorColor);
  }

//end of function
}



function ServerPause() {
//Instant pause on server
	ServerRecord();
	settimer(EPG[NowNext][2][currChan],Lang[70],0,2);
	setTimeout("getPauseFile();",6000);
//end of function
}




function getPauseFile() {

try {
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + RestFulAPI + "/recordings.xml?" + new Date().getTime()),false);
   xmlhttp.send();
   xmlDoc=xmlhttp.responseXML; 
   var x=xmlDoc.getElementsByTagName("recording");
   nrMedia = x.length - 1;
   for (var i=0;i<x.length;i++)
	  { 
	var xx = x[i].getElementsByTagName("param")[2].childNodes[0].nodeValue.split(".");
	xx = xx[(xx.length-2)].split("-");

	if ( xx[0] == currChan ) {
		recLink[0] = server_ip + recServ + x[i].getElementsByTagName("param")[2].childNodes[0].nodeValue;
		}

	 }

  } catch(e) {
    alert("Get Recordings problem: " + e);
  }
	getRecOK = 0;
	recDura[0] = 0; // 3600;// set to 1 hour
	LoadMediaSettings();// sets currMed to 0
	recTitl[0] = "Time Shift File"
	position = 0;
	pauseRec(recLink[0]);

}



function ServerTimer(guid,evid) {

try {
   xmlhttp=new XMLHttpRequest();
   xmlhttp.open("GET",(server_ip + recServ + "/addTimer?guid=" + guid + "&evid=" + evid + "&" + new Date().getTime() ),false);
   xmlhttp.send();
  } catch(e) {
    alert("Sending Timers to server problem: " + e);
  }


}



function BackToTV() {
	    play(channels[currChan]);
	    if (isPause == 1 || localRecording == 1) { 
		UnloadMediaSettings(); 
	    } else {
	    	medialist.style.opacity = 0.9;
	    	showDisplay("STOP", false, 100, 0 );
	    	showMediaList();
		AvInfo.length = 0;
	    }
}


function onRecorderStateChanged(event) {
//  alert("EVENT! " + event.reason + " *** " + event.state);
  RECicon = "\uE003"; // 0xE003 0x83 Fixed width blank
  switch (event.state) {
    case mediaRecorder.STATE_IDLE:
	//  "STATE_IDLE";
      break;
    case mediaRecorder.STATE_CONNECTING:
	//  "STATE_CONNECTING";
      break;
    case mediaRecorder.STATE_PAUSED:
	//  "STATE_PAUSED";
      break;
    case mediaRecorder.STATE_RECORDING:
	//  "STATE_RECORDING";
	RECicon = "\uE00B"; // 0xE00B 0x8B REC
      break;
    case mediaRecorder.STATE_FAILED:
	//  "STATE_FAILED";
	RECicon = "\uE01A"; // Bomb Icoon
      break;
  }

}

function ShowMediaOSD() {
if (get_recordings == 1) {
	// Display Name/ length 
	var pos = position + (mediaPlayer.getPosition()/1000);
	var pos2 = (pos / Number(recDura[currMed])) * 100;
	if (pos2 < 1) { pos2 = 1;} 
	if (pos2 >100) {pos2 = 100;} // in case of viewing while still recording.
	if (pos>recMark[posMark] && recMark.length-1>posMark) { posMark += 1;}
	pos2 = ((pos2 * 140) / 100).toFixed(0);  // make it 40% bigger
	var pos5 = "\uE007" + new Array(pos2 - 1).join("\uE008") + new Array(140 - pos2).join("\uE009") + "\uE00A"
	var pos4 = "";
	var pos6 = pos5;
	var fontc = color_progress1;
	var x = 0;
	  for (var i=0; i<recMark.length; i++) {
		var pos3 = recMark[i] / Number(recDura[currMed]) * 100;
		pos3 = ((pos3 * 140) / 100).toFixed(0); // make it 40% bigger
		pos4 += fontc + Left(pos6,pos3 - x);
		if (fontc == "</font>" + color_progress2) { fontc = "</font>" + color_progress1; } else { fontc = "</font>" + color_progress2;}
		x = pos3;
		pos6 = Right(pos5,140 - pos3);
		}
	pos4 += "</font>" + color_progress1 + pos6 + "</font>";
	var x = (Number(recDura[currMed])/60).toFixed(0);
	if (pos/60 > x) { x = (pos/60).toFixed(0);}
	date_time();
	osdtime.innerHTML = result;
	date_time_rec();
	osdmedia.innerHTML = "<pre style='" + color_media_osd + ";font-size:" + fsMedia +";'> \n  " + (pos/60).toFixed(0) + " / " + x + "  " + Left(recTitl[currMed],40) + "\n  " + pos4 + "\n " + result + " </pre>";
} else if ( get_recordings == 2) {
	var pos = position + (mediaPlayer.getPosition()/1000);
	date_time();
	osdtime.innerHTML = result;
	osdmedia.innerHTML = "<pre style='" + color_media_osd + ";font-size:" + fsMedia +";'> \n  " + (pos/60).toFixed(0) + " \n " + Left(recTitl[currMed],40) + "\n  \n " + recStrt[currMed] + " </pre>";
}
}

function ShowInfo() {
//Like Show EPG Info
  if ( medialist.style.opacity == 0 ) { updateStreamInfo(currMed);} else { AvInfo[currMed] = "";}
  if (get_recordings == 2) {
	result = recStrt[currMed]
       	osdepginfo.innerHTML = "<center><pre style='" + color_epg_head + ";'>" + Left(recTitl[currMed],60) 
				+ "\n </pre><p style='" + color_epg_avinfo + ";'>" + AvInfo[currMed] 
				+ "</p><pre style='" + color_epg_title + ";'> " + result + "\n " 
				+ "???" + Lang[54]
				+ "</pre><p style='" + color_epg_info + ";'> Sorry STREAMDEV-plugin : " + Lang[37] + "</p></center>";
  } else {
        date = new Date(Number(recStrt[currMed])*1000);
        year = date.getFullYear();
        month = date.getMonth();
        d = date.getDate();
        day = date.getDay();
        h = date.getHours();
        m = date.getMinutes();
	h = addzero(h);
	m = addzero(m);
        result = '' + days[day] + ' ' + d + ' ' + months[month] + ' ' + year + ' ' + h + ':' + m;

	if (year!==1970) { 	
       		osdepginfo.innerHTML = "<center><pre style='" + color_epg_head + ";'>" + Left(recTitl[currMed],60) 
					+ "</pre><p style='" + color_epg_avinfo + ";'>" + AvInfo[currMed] 
					+ "</p><pre style='" + color_epg_title + ";'> " + result + "\n " 
					+ (recDura[currMed] / 60).toFixed(0) + Lang[54] + "\n " + recChan[currMed] + "  "
					+ "\n </pre><p style='" + color_epg_info + ";'>" + Left(recDesc[currMed],750) + "</p></center>";
	} else {
		//info for non-vdr recordings
	       	osdepginfo.innerHTML = "<center><pre style='" + color_epg_head + ";'>" + Left(recTitl[currMed],60) 
					+ "\n </pre><p style='" + color_epg_avinfo + ";'>" + AvInfo[currMed] + " " + "\n \n </p></center>";
	}
  }
}

function onScheduledStart(event) {
  // event is of type ToiSchedulerServiceBooking, see docs
    var timertype = event.booking.category;

  if ( timertype == "SwitchOnly") {
	ClearScreen();
	isFullscreen = 1; FullScreen(); 
	isVisible = 0; setVisible(isVisible); 

	//Switch from recordings
	if (isMediaMenu) { 
		if (medialist.style.opacity == 0) {setResume();} // No mediamenu on screen so set resume.
		UnloadMediaSettings();
	}

	prevChan = currChan;
	currChan = Number(ss.getParameter(event.booking.id, "Channel"));
	ChanGroup = Number(Left((currChan / 1000),1));

	// check if Group isn't protected
	if ((protChn[ChanGroup] == 1) && (ShowProtectedChannels == 1)) {
		currChan = prevChan;
		ChanGroup = Number(Left((currChan / 1000),1));
	}

	// switch only if not already on that channel.
	if (currChan !== prevChan) {
		play(channels[currChan]);
	} 
	ss.remove(event.booking.id);
	setOSDtimer();
  } else {
	  try {
	    createNewAsset();

		var recChannr = Number(ss.getParameter(event.booking.id, "Channel"));
		var recGroup = Number(Left((recChannr / 1000),1));
		var recChan = 0;
		if (ServerAdres[recGroup] == "MultiCast" ) {
		 	SI=channels[recChannr].split("-");
			recChan = SI[4];
		} else {
			recChan = ServerAdres[recGroup] + channels[recChannr];
		}

	    mediaRecorder.open(recChan, assetId);

	    var propList = new Array(ams.PROPERTY_SYSTEM_PLAYBACKURI);
	    var properties = ams.getProperties(assetId, propList);
	    var assetURI = properties[0].value;

	    // save the assetId in the booking
	    ss.setParameter(event.booking.id, "assetURI", assetURI);
	    ss.setParameter(event.booking.id, "assetId", assetId);
	    ss.setParameter(event.booking.id, "active", "True");
	    ss.setParameter(event.booking.id, "Type", "\uE00B");

	    mediaRecorder.record();
//	    alert("Recording to " + assetURI);
	  }
	  catch (e) {
	    alert(e);
	  }
	}
}


function onScheduledStop(event) {
    var timertype = event.booking.category;
	if ( timertype == "SwitchOnly") {
	    ss.remove(event.booking.id);
	    setOSDtimer();
	} else {
	  try {
	    ss.setParameter(event.booking.id, "active", "False");
	    ss.setParameter(event.booking.id, "Type", "\uE01C");
	    mediaRecorder.close();
	  }
	  catch (e) {
	    alert(e);
	  }
	} 

}


function ClearScreen() {
	isSchedule = 0; schedule.style.opacity = 0;
	isSetupMenu = 0;
	epgactive = 0;
	osdepginfonext.style.opacity = 0;
	osdepginfo.style.opacity = 0;
	mainmenu.style.opacity = 0;
}

