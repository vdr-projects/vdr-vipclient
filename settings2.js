
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
        chanlistepg.innerHTML = "<p class=epg>" + EPG[NowNext][1][currChan] + "</p><p class=list>" + Left(EPG[NowNext][4][currChan],250) + "</p>" ;

}


// END of Channelslist / EPG Guide

