// 
// Default settings
// 

var Version = "0.26.2";

server_ip_array = new Array("http://192.168.1.15","http://192.168.3.15","http://192.168.178.56","http://192.168.3.100","http://192.168.178.19","http://192.168.1.21","http://192.168.2.100","http://192.168.178.52");

var server_ip = server_ip_array[0]; // default server
var StartVolume = 15; // Volume on (re)start of the portal.
var currChan = 10; // default channel

OSDLang = new Array ("English", "Nederlands", "Deutsch");
langfile = new Array ("lang_eng.js", "lang_dut.js","lang_ger.js");
lang_prio = new Array("dut,eng,und","ger,deu,eng","eng,und","fre,fra,eng");

var subs_prio = "dut,eng"; //Subtitle prio

var get_timer = 1; // gettimersserver 1 = smarttvweb, 0 = restfulapi
var get_recordings = 1; // getrecordings 0 = restfulapi(only showing no play), 1 = smarttvweb, 2 = streamdev
var get_marks = 1;// getmarks 1 = smarttvweb, 0 = restfulapi

var subgroup_old = 1 ;// 0 = use old routine for sub group in recordings listing.

var SortByDate = 1; //Sort recordings by date

var ShowSubDir = 1 ; // 0 = no, 1 = yes (default) // show seperate maps for subdirs in menu recordings
var showClock = 0;   // 0 = no, 1 = yes
var SwitchGuide = 0; // 0 = no, 1 = yes
var PipSwitchGuide = 0; // 0 = no, 1 = yes // use second/pip player for getting epg update in guide view // !!Unstable!! box might restart
var TimeShift = 0;   // 0 = no, 1 = yes timeshift
var KillStream = 1;  // 1 = Close stream on Standby
var ShowProtectedChannels = 1; // 0 = yes show, 1 = don't show protected channels (default)
var ProtectTimeOut = 60 * (60 * 1000); //time out in minutes (0 = no timeout)
var ShowSource = 1; // show source in OSD
var pipPlayer = 0; // 0 = no, 1 = yes Pip
var mediaRecorder = 1; // 0 = no, 1 = yes local recording.
var PauseOnServer = 0; // 0 = no pause on server, 1 = pause live TV on server
var ShowMPD = 0; // 0 = don't use MPD, 1 = make use of MPD (http://www.musicpd.org/)

var fullupdate = 1; // If guideview is too slow, set it to 0 (for 1910/1960), faster boxes can use 1
// to force the use on boxes other then 19x3 use 2!!


var ShowOsdTime = 5000; //Time to show OSD, in seconds * 1000
var ShowSetTimer = 3000; //Time to show set timer popup, in seconds * 1000

var serverEPGdays = 3 * (60 * 60 * 24); // the higher the longer you wait while getting the epg info

var VolumeStep = 5; // Steps the volume buttons make

// Server for Recordings
var recServ = ":" + "8000";
var RestFulAPI = ":" + "8002";
var MPDAddress = ":" + "8888";
var StreamPort = ":" + "3000" + "/";
//var StreamPort = ":" + "8000" + "/live/";

var channeldigits = 2; // 0 - Max 9, 1 max 99, 2 max 999 or 3 max 9999 channels directly selectable by numbers

var Fav_group = 10; // Favorite Group 10

var EPGMode = 1; // 1 = FILTER_MODE_PF_AND_SCHEDULE 0 = FILTER_MODE_PF_ONLY

var RecCmds = new Array(-1,1,-1,-1,-1,-1,-1,-1,-1,-1);
var RecCmdsIcon = new Array("","\uE005","","","","","","","","");

var preRecTime = 300 ;// for local recordings time before recording in seconds
var afterRecTime = 600 ; // for local recordings time after recording in seconds

var color_bg = "#fc5";
var color_main_head = "color:white";
var color_main_font = "color:black";
var color_epg_head = "color:white";
var color_epg_title = "color:white";
var color_epg_avinfo = "color:black";
var color_epg_info = "color:yellow";
var color_sched_head = "color:white";
var color_sched_font = "color:black";
var color_chan_epg = "color:black";
var color_osdtimer = "color:black";
var color_timerinfo = "color:white";
var color_media_osd = "color:white";
var color_progress1 = "<font color=red>";
var color_progress2 = "<font color=white>";
var color_notset = "color:grey";
var color_switchtimer = "#660066";
var DefaultBGColor = "green";
var ErrorColor = "red";


//
// No need to change anything from here on.
//

var experimental;// Use some experimental code
var lang_nr;
var testing2;
var ShowSubs; //Flash stored

VideoOutputModes = new Array(4,5,7); // Modes for the portal.
VideoOutputModes_txt = new Array("NO_VIDEO_MODE","480I60","576I50","480P60","576P50","720P50","720P60","1080I50","1080I60","1080P23976","1080P24",
				"1080P25","1080P29970","1080P30","1080P50","1080P59940","1080P60")

// NO_VIDEO_MODE = 0
// VIDEO_MODE_480I60 = 1
// VIDEO_MODE_576I50 = 2
// VIDEO_MODE_480P60 = 3
// VIDEO_MODE_576P50 = 4 <--
// VIDEO_MODE_720P50 = 5 <--
// VIDEO_MODE_720P60 = 6
// VIDEO_MODE_1080I50 = 7 <--
// VIDEO_MODE_1080I60 = 8
// VIDEO_MODE_1080P23976 = 9
// VIDEO_MODE_1080P24 = 10
// VIDEO_MODE_1080P25 = 11
// VIDEO_MODE_1080P29970 = 12
// VIDEO_MODE_1080P30 = 13
// VIDEO_MODE_1080P50 = 14
// VIDEO_MODE_1080P59940 = 15
// VIDEO_MODE_1080P60 = 16

var videoConfig;
var Set_Res;
var Xfactor = new Array();
var Yfactor = new Array();

// keep scale compliant with Videooutputmodes!!
//  720x576
Xfactor[0] = 720 / 720; Yfactor[0] = 576 / 576;
// 1280x720
Xfactor[1] = 1280 / 720; Yfactor[1] = 720 / 576;
// 1920x1080
Xfactor[2] = 1920 / 720; Yfactor[2] = 1080 / 576;


var audio = 0;
var audio_dyn = 0;
var subs_dyn = 0;


var lang_prio_dyn = new Array(); //Used for dynamic audio track selection
var subs_prio_dyn = new Array(); //Used for dynamic subs track selection


var ChanGroup = Number(String((currChan / 1000)).substring(0,1)); // default group
var minChan = new Array();var minchan = new Array(); var maxChan = new Array(); var defChan = new Array(); var baseChn = new Array(); var protChn = new Array(); var ServerAdres = new Array(); // Define settings for Channels.


var NN = new Array();
var Lang = new Array();
var CLang = new Array();

var isFullscreen = 1;
var Volume = StartVolume;
var AudioOut = 3; // AUDIO_CONNECTION_TYPE_ANALOG = 0; AUDIO_CONNECTION_TYPE_SPDIF = 1; AUDIO_CONNECTION_TYPE_HDMI = 2;AUDIO_CONNECTION_TYPE_DECODER = 3;AUDIO_CONNECTION_TYPE_BUFFER = 4;AUDIO_CONNECTION_TYPE_I2S = 5;

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
var MainMenu = 0;
var mediaPlayer = null;
var Change = 0;
var ChangeOK = 0;
var Extok = 0;
var count = 0;

//keys
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
var KEY_REC2 = "MediaRecord";
var KEY_OK = "Accept";
//Extra keys
// Comhem Remote
var KEY_FAV = "U+e0003";
var KEY_FILM = "U+e0033";
var KEY_HELP2 = "U+f0001";
// old kpn (vip1710/1760)
var KEY_OPNAMES = "U+0046";
var KEY_HELP = "Info";
var KEY_DIENSTEN = "Portal";
var KEY_A = "U+0041";	// |>
var KEY_B = "U+0042";	// hh
var KEY_C = "U+0043";	// @
var KEY_D = "U+0044";	// >@
// Comx keyboard
var KEY_DVR = "DVR";
var KEY_WWW = "Web";
var KEY_STOP = "U+001B";
var KEY_EPG = "List";
var KEY_MPT = "MediaPreviousTrack";
var KEY_MNT = "MediaNextTrack";
// Comx remote



var eitCache = null;
var events = null;
var eitService = null;
var EPGShortnext;
var EPGShortnow;
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
//		8 = ParentalRating
//		9 = ContentNibbles
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
EPG[0][8] = new Array();
EPG[0][9] = new Array();
EPG[1][1] = new Array();
EPG[1][2] = new Array();
EPG[1][3] = new Array();
EPG[1][4] = new Array();
EPG[1][5] = new Array();
EPG[1][6] = new Array();
EPG[1][7] = new Array();
EPG[1][8] = new Array();
EPG[1][9] = new Array();
EPG[2][1] = new Array();
EPG[2][2] = new Array();
EPG[2][3] = new Array();
EPG[2][4] = new Array();
EPG[2][5] = new Array();
EPG[2][6] = new Array();
EPG[2][7] = new Array();
EPG[2][8] = new Array();
EPG[2][9] = new Array();

var content;
var connib = 0x00000000;
var osdtimeout = 0;
var osdVolumetimeout = 0;
var epgactive = 0;
var preChan = 0;
var preGrp = 0;
var timerChan = 10;
var TimerActions;
var initialDelayID = 0;
var CAdelayID = 0;
var ProtectID = 0;
var SleepTimer = 0;
var SleepTimerID = -1;
var initialDelayPlayID = -1;

var instanttimer = new Array();
var inst_timer = 0;

var switchicon = "\uE003";
var CAicon = "\uE00F";
var RECicon = "\uE003";
var Radioicon = "\uE003";

var fsAudio; var fsTime; var fsName; var fsMenu; var fsChan; var fsCA; var fsMenuMain; var fsEpg;
var fsEpginfo; var fsList; var fsSchedList; var fsSched; var fsRec; var fsReclist; var fsMedia; var fsKeys;

var AvInfo = new Array();
var xx = 0;

var subsmode = 0;  // "cfg.media.subtitling.modepriority","Teletext,DVB"

var rec_lst = new Array(); // Full recording list, used for sorting
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
var recGroup= new Array(); // group index
var recProt = new Array(); // protect recording based on channelgroup
var recSubGroup = new Array(); // used for subgroups
var subgroup= 0 ; // Used for subdirs in recording view
var subsubgroup = 0;// Used for subdirs in recording view
var MaxInGroup=14; // Used for subdirs in recording view
var Group_Header = new Array(); // Header for submenu.

var posMark = 0;
var recMap = 0;

var timersID = new Array();
var timersFlag = new Array();
var timersStrt = new Array();
var timersStop = new Array();
var timersDays = new Array();
var timersDay  = new Array();
var timersName = new Array();
var timersFile = new Array();
var timersEvnt = new Array();
var timersChan = new Array();
var maxTimers = 0;
var timerOK = 0;

var searchtimersID = new Array();
var searchtimersSearch = new Array();
var searchtimersFlag = new Array();
var SearchTimer = new Array();

var getRecOK = 0;
var position = 0;

var timer = new Array();
var timers = new Array();
var searchtimers = new Array();
var getbookingID = 0;
var timerID = 0;
var nrMedia = 0;
var MPDListener = 0;

//vdr status
var free_space = 0;
var perc_space = 0;

var isPause = 0; //used by pause routine.

var Fav_base = Fav_group * 1000;
var Fav_max_channel;
baseChn[Fav_group] = Fav_base;
defChan[Fav_group] = Fav_base + 1;
minChan[Fav_group] = Fav_base + 1;
//
var Chan_Ver = "Not set";
var Fav_key1; 
var set_yellow_key = 0;
var URL;
var initialDelayPlay = 0; 
var PlayDelayID;
var PIPDelayID;
var ErrorAgain = 0;
var smartTVplugin; // Turn on or off the use of smartTVplugin
var Restfulapiplugin; // Turn on or off the use of Restfulapiplugin
var localRecording = 0;
var box_ip; // Used for testing plugins
var test_ip; // Used for testing plugins


