
var ServerAdres = "http://192.168.3.15:3000/"
var showClock = 0;
var SwitchGuide = 0;
var VideoHDMIOut = HDMI[4];
var VideoScartOut = Scart[1];
var TimeShift = 0; // 0 = no, 1 = yes timeshift

//  720x576
// 1280x720
// 1920x1080

var Xfactor = 720 / 720;
var Yfactor = 576 / 576;

months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December');
days = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

