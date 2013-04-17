// 
// Default settings
// 

//  720x576
// var Xfactor = 720 / 720; var Yfactor = 576 / 576;
// 1280x720
// var Xfactor = 1280 / 720; var Yfactor = 720 / 576;
// 1920x1080
var Xfactor = 1920 / 720; var Yfactor = 1080 / 576;


var server_ip = "http://192.168.3.15";
var StartVolume = 15; // Volume on (re)start of the portal.
var currChan = 10; // default channel

//
//
//
//
//

var showClock = 0;   // 0 = no, 1 = yes
var SwitchGuide = 0; // 0 = no, 1 = yes
var TimeShift = 0;   // 0 = no, 1 = yes timeshift
var ShowSubs = 1;    // 0 = no, 1 = yes (default)
var KillStream = 1;  // 1 = Close stream on Standby
var ShowProtectedChannels = 1; // 0 = yes show, 1 = don't show protected channels (default)
var ShowSource = 1; // show source in OSD
var serverEPGdays = 3 * (60 * 60 * 24); // the higher the longer you wait while getting the epg info

months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December');
days = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

var NN = new Array();
NN[0] = "Now";
NN[1] = "Next";
NN[2] = "Schedule";
NN[3] = "TIMER";
NN[4] = "-----";

var VolumeStep = 5; // Steps the volume buttons make

var ChanGroup = Number(String((currChan / 1000)).substring(0,1)); // default group
var minChan = new Array(); var maxChan = new Array(); var defChan = new Array(); var baseChn = new Array(); var protChn = new Array(); var ServerAdres = new Array(); // Define settings for Channels.

// Server for Recordings
var recServ = server_ip + ":8000";
var RestFulAPI = server_ip + ":8002";
var MPDAddress = server_ip + ":8888";

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
var recPath = "/recordings.xml";

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
var SwitchTimer = 1; // 1 - switchonly, 2 - record local, 3 - record on server (only 1 & 2 are working)
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

var pipPlayer = "";
var mediaRecorder = "";
var isRecording = 0; // set by recording subroutine
var audiotype = 0; // used for selecting "cfg.media.audio.typepriority","normal,hearing_impaired,visually_impaired"
var subsmode = 0;  // "cfg.media.subtitling.modepriority","Teletext,DVB"
var substype = 0;  // "cfg.media.subtitling.typepriority","normal,hearing_impaired"

var recTitl = new Array(); // title of recording
var recLink = new Array(); // link to get recording
var recDesc = new Array(); // description of the recording
var recDura = new Array(); // duration of the recording
var recStrt = new Array(); // date of recording
var recList = new Array(); // used to verify if the right recording is going to be deleted
var recMark = new Array(); // marks made in the recording, eg by Noad, Markad
var rec_New = new Array(); // Flag if recording is new (unseen)
var recGUID = new Array(); // GUID of recording
var recChan = new Array(); // Channel ID
var recDummy= new Array(); //

var posMark = 0;
var recMap = 0;

var timersID = new Array();
var timersFlag = new Array();
var timersStrt = new Array();
var timersStop = new Array();
var timersDays = new Array();
var timersName = new Array();
var timersFile = new Array();
var timersEvnt = new Array();
var timersChan = new Array();
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

//vdr status from VDR on SmartTV
var free_space = 0;
var used_space = 0;
var perc_space = 0;

