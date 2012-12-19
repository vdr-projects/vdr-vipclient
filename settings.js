// static settings
// or
// init var settings

var channels = new Array();
var channelsnames = new Array();
var channelsepglang = new Array();

var recording = new Array();

var isFullscreen = 1; // start TV(1) or guide(0)
var StartVolume = 50;
var Volume = StartVolume;
var AudioOut = 3;
// AUDIO_CONNECTION_TYPE_ANALOG = 0
// AUDIO_CONNECTION_TYPE_SPDIF = 1
// AUDIO_CONNECTION_TYPE_HDMI = 2
// AUDIO_CONNECTION_TYPE_DECODER = 3
// AUDIO_CONNECTION_TYPE_BUFFER = 4
// AUDIO_CONNECTION_TYPE_I2S = 5

var Scart = new Array();
var HDMI = new Array();
var Scart = "NO_SCART_MODE,SCART_MODE_CVBS,SCART_MODE_YC,SCART_MODE_RGB_CVBS";
var HDMI = "OFF,VIDEO_MODE_576P50,VIDEO_MODE_576I50,VIDEO_MODE_720P50,VIDEO_MODE_1080I50";
//
// HDMI modes for 19x0 series, 19x3 or 1003 can do also 1080p modes
//


var currChan = 10; // default channel
var epgchan = currChan;
var prevChan = currChan;

var currMed = 0;
var listMed = 0;

var isMediaMenu = 0;
var isVisible = 0;
var isSetupMenu = 0;
var isSchedule = 0;
var mediaPlayer = null;
var Change = 0;
var ChangeOK = 0;
var Extok = 0;
var count = 0;
var KEY_0 = "U+0030";
var KEY_1 = "U+0031";
var KEY_2 = "U+0032";
var KEY_3 = "U+0033";
var KEY_4 = "U+0034";
var KEY_5 = "U+0035";
var KEY_6 = "U+0036";
var KEY_7 = "U+0037";
var KEY_8 = "U+0038";
var KEY_9 = "U+0039";

var eitCache = null;
var events = null;
var eitService = null;
var EPGShortnext = "";
var EPGShortnow = "";
var audio = 0;
var listChan = 0;
var NowNext = 0;
var EpgInfo = new Array();
var EpgExtInfo = new Array();
var files = new Array();
var NN = new Array();
NN[0] = "Now";
NN[1] = "Next";
NN[2] = "Schedule";
NN[3] = "TIMER";
NN[4] = "-----";


//
//NowNext,	1 = programma naam	event.name			,currchan
//0  1		2 = start		event.time
//2 = schedule	3 = lengte		event.duration (/60 = minuten)
//		4 = shortinfo
//		5 = extinfo
//		6 = eventid
//		7 = EPGNow / EPGNext

var EPG = new Array();
EPG[0] = new Array();
EPG[1] = new Array();
EPG[2] = new Array();
EPG[0][1] = new Array();
EPG[0][2] = new Array();
EPG[0][3] = new Array();
EPG[0][4] = new Array();
EPG[0][5] = new Array();
EPG[0][6] = new Array();
EPG[0][7] = new Array();
EPG[1][1] = new Array();
EPG[1][2] = new Array();
EPG[1][3] = new Array();
EPG[1][4] = new Array();
EPG[1][5] = new Array();
EPG[1][6] = new Array();
EPG[1][7] = new Array();
EPG[2][1] = new Array();
EPG[2][2] = new Array();
EPG[2][3] = new Array();
EPG[2][4] = new Array();
EPG[2][5] = new Array();
EPG[2][6] = new Array();
EPG[2][7] = new Array();

var osdtimeout = 0;
var osdVolumetimeout = 0;
var epgactive = 0;
var preChan = 0;
var cds = 1;
var timerChan = 10;
var TimerActions = "";
var switchtimerID = 0;
var SwitchTimer = 1; // No other options yet
var initialDelayID = 0;

