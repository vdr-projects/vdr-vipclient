
var fsAudio; var fsTime; var fsName; var fsMenu; var fsChan; var fsCA; var fsMenuMain; var fsEpg;
var fsEpginfo; var fsList; var fsSchedList; var fsSched; var fsRec; var fsReclist; var fsMedia; var fsKeys;

var color_bg = "#fc5";
var color_main_head = "color:white";
var color_main_font = "color:black";
//var color_main_font = "color:lightgreen";
var color_epg_head = "color:white";
var color_epg_title = "color:white";
var color_epg_avinfo = "color:black";
//var color_epg_avinfo = "color:lightgreen";
var color_epg_info = "color:yellow";
var color_sched_head = "color:white";
var color_sched_font = "color:black";
//var color_sched_font = "color:lightgreen";
var color_chan_epg = "color:black";
//var color_chan_epg = "color:lightgreen";
var color_osdtimer = "color:black";
//var color_osdtimer = "color:lightgreen";
var color_timerinfo = "color:white";
var color_media_osd = "color:white";
var color_progress1 = "<font color=red>";
var color_progress2 = "<font color=white>";
var color_notset = "color:grey";
//var color_notset = "color:black";
var color_switchtimer = "#660066";
var DefaultBGColor = "green";
var ErrorColor = "red";


function SetupFonts() {
//setup fontsize
	colorkeys.style.fontSize = fsKeys;
	osdvolume.style.fontSize = fsCA;
	osdtime.style.fontSize = fsTime;
	osdname.style.fontSize = fsName;
	osdepg.style.fontSize = fsEpg;
	osdca.style.fontSize = fsCA;
	switchtimer.style.fontSize = fsEpg;
	osdepginfo.style.fontSize = fsEpginfo;
	osdepginfonext.style.fontSize = fsEpginfo;
	osdnr.style.fontSize = fsChan;
	osdlang.style.fontSize = fsAudio;

//setup fontcolors/ backgroundcolor
	document.body.style.backgroundColor = "#ccc";
	switchtimer.style.background = DefaultBGColor;
}

function setOSDscale() {
	fsAudio = (16*Yfactor[Set_Res]) + "px";
	fsTime = (16*Yfactor[Set_Res]) + "px";
	fsName = (27*Yfactor[Set_Res]) + "px";
	fsMenu = (27*Yfactor[Set_Res]) + "px";
	fsChan = (43*Yfactor[Set_Res]) + "px"; 
	fsCA = (32*Yfactor[Set_Res]) + "px";
	fsMenuMain = (35*Yfactor[Set_Res]) + "px";
	fsEpg = (19*Yfactor[Set_Res]) + "px";
	fsEpginfo = (21*Yfactor[Set_Res]) + "px";
	fsList = (18*Yfactor[Set_Res]) + "px";
	fsSchedList = (18*Yfactor[Set_Res]) + "px";
	fsSched = (26*Yfactor[Set_Res]) + "px";
	fsRec = (35*Yfactor[Set_Res]) + "px";
	fsReclist = (19*Yfactor[Set_Res]) + "px";
	fsMedia = (27*Yfactor[Set_Res]) + "px";
	fsKeys = (19*Yfactor[Set_Res]) + "px";
}


