// 
// Default settings
// 

//  720x576
// 1280x720
// 1920x1080

var Xfactor = 1280 / 720;
var Yfactor = 720 / 576;


var showClock = 0;   // 0 = no, 1 = yes
var SwitchGuide = 0; // 0 = no, 1 = yes
var TimeShift = 0;   // 0 = no, 1 = yes timeshift
var ShowSubs = 1;    // 0 = no, 1 = yes (default)
var KillStream = 1;  // 1 = Close stream on Standby

months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December');
days = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

var NN = new Array();
NN[0] = "Now";
NN[1] = "Next";
NN[2] = "Schedule";
NN[3] = "TIMER";
NN[4] = "-----";

var ShowProtectedChannels = 1; // Default don't show protected channels.
var StartVolume = 30; // Volume on (re)start of the portal.
var VolumeStep = 5; // Steps the volume buttons make
var currChan = 10; // default channel

var ChanGroup = 0; // default TV group
var minChan = new Array(); var maxChan = new Array(); var defChan = new Array(); var baseChn = new Array(); var protChn = new Array(); var ServerAdres = new Array(); // Define settings for Channels.

// Server for Recordings
var server_ip = "http://192.168.3.15";
var recServ = server_ip + ":8000";
var RestFulAPI = server_ip + ":8002";
var MPDAddress = server_ip + ":8888";

// Radio channels.js Settings
minChan[9] = 9001;
maxChan[9] = 9099; // set not too far from max rd channel to speed up zapping
defChan[9] = 9051;
baseChn[9] = 9000;
protChn[9] = 0;
ServerAdres[9] = server_ip + ":3000/";

// Protected channels.js Settings
minChan[6] = 6001;
maxChan[6] = 6040; // set not too far from max prt channel to speed up zapping
defChan[6] = 6001;
baseChn[6] = 6000;
protChn[6] = 1;
ServerAdres[6] = server_ip + ":3000/";

// TV channels.js Settings
minChan[0] = 1;
maxChan[0] = 999; // set not too far from max TV channel to speed up zapping
defChan[0] = currChan;
baseChn[0] = 0;
protChn[0] = 0;
ServerAdres[0] = server_ip + ":3000/";

//HD list
minChan[1] = 1001;
maxChan[1] = 1999; // set not too far from max HD channel to speed up zapping
defChan[1] = 1001;
baseChn[1] = 1000;
protChn[1] = 0;
ServerAdres[1] = server_ip + ":3000/";

// MultiCast
minChan[5] = 5001;
maxChan[5] = 5010; // set not too far from max multicast channel to speed up zapping
defChan[5] = 5001;
baseChn[5] = 5000;
protChn[5] = 0;
ServerAdres[5] = "MultiCast";
// MultiCast, channels[x] layout DVB(Satposition, C or T)-NID-TID-SID-multicast address

var channeldigits = 2; // 0 - Max 9, 1 max 99, 2 max 999 or 3 max 9999 channels directly selectable by numbers (Don't set it to > 2 it crashes the player)

//
// No need to change anything from here on.
//

var isFullscreen = 1;
var Volume = StartVolume;
var AudioOut = 3;

var epgchan = currChan;
var prevChan = currChan;

var channels = new Array();
var channelsnames = new Array();
var channelsepglang = new Array();

var currMed = 0;
var listMed = 0;
var DelisOK = 0;

var menu = 0;
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
var KEY_REC = "U+00bd";

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
var timerChan = 10;
var TimerActions = "";
var switchtimerID = 0;
var SwitchTimer = 1; // No other options yet
var initialDelayID = 0;

var switchicon = "\uE003";
var CAicon = "\uE00F";
var RECicon = "\uE003";

var fsAudio = (16*Yfactor) + "px";
var fsTime = (16*Yfactor) + "px";
var fsName = (27*Yfactor) + "px";
var fsMenu = (27*Yfactor) + "px";
var fsChan = (43*Yfactor) + "px"; 
var fsCA = (32*Yfactor) + "px";
var fsMenuMain = (35*Yfactor) + "px";
var fsEpg = (19*Yfactor) + "px";
var fsEpginfo = (21*Yfactor) + "px";
var fsList = (18*Yfactor) + "px";
var fsSchedList = (18*Yfactor) + "px";
var fsSched = (26*Yfactor) + "px";
var fsRec = (27*Yfactor) + "px";
var fsReclist = (19*Yfactor) + "px";
var fsMedia = (27*Yfactor) + "px";
var fsKeys = (19*Yfactor) + "px";

var AudioInfo = new Array();
var xx = 0;

var isRecording = 0; // set by recording subroutine
var audiotype = 0; // used for selecting "cfg.media.audio.typepriority","normal,hearing_impaired,visually_impaired"
var subsmode = 0;  // "cfg.media.subtitling.modepriority","Teletext,DVB"
var substype = 0;  // "cfg.media.subtitling.typepriority","normal,hearing_impaired"

var recTitl = new Array();
var recLink = new Array();
var recDesc = new Array();
var recDura = new Array();
var recStrt = new Array();
var recList = new Array();
var recMark = new Array();
var rec_New = new Array();

var posMark = 0;
var recMap = 0;

var timersID = new Array();
var timersFlag = new Array();
var timersStrt = new Array();
var timersStop = new Array();
var timersDays = new Array();
var timersName = new Array();
var timersFile = new Array();
var maxTimers = 0;
var timerOK = 0;

var getRecOK = 0;
var position = 0;

var timer = new Array();
var timers = new Array();
var getbookingID = 0;
var timerID = 0;
var nrMedia = 0;
var MPDListener = 0;
