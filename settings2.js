
var fsList; var fsSchedList; var fsSched;

var color_bg = "#fc5";
var color_main_head = "color:white";
var color_sched_head = "color:white";
var color_sched_font = "color:black";
var color_timerinfo = "color:white";

var color_progress1 = "<font color=red>";
var color_progress2 = "<font color=white>";


function setOSDscale() {
	fsList = (18*Yfactor[Set_Res]) + "px"; //1080 = 34, 720 = 23, 576 = 18
	fsSchedList = (18*Yfactor[Set_Res]) + "px"; //1080 = 34, 720 = 23, 576 = 18
	fsSched = (26*Yfactor[Set_Res]) + "px"; //1080 = 49, 720 = 33, 576 = 26
}


