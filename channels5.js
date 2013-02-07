//
// MultiCast Channels.
//

// MultiCast
minChan[5] = 5001;
defChan[5] = 5008;
baseChn[5] = 5000;
protChn[5] = 1;
ServerAdres[5] = "MultiCast";
// MultiCast, channels[x] layout DVB(Satposition, C or T)-NID-TID-SID-multicast address


channelsnames[5001] = "NED1 (S)";
channels[5001] = "S19.2E-53-1105-4011-239.255.0.1:11111";
channelsnames[5002] = "NED2 (S)";
channels[5002] = "S19.2E-53-1105-4012-239.255.0.2:11111";
channelsnames[5003] = "NED3 (S)";
channels[5003] = "S19.2E-53-1105-4013-239.255.0.3:11111";
channelsnames[5004] = "RTL4 (S)";
channels[5004] = "S19.2E-53-1097-2004-239.255.0.4:11111";
channelsnames[5005] = "RTL5 (S)";
channels[5005] = "S19.2E-53-1097-2005-239.255.0.5:11111";
channelsnames[5006] = "SBS6 (S)";
channels[5006] = "S19.2E-53-1105-4002-239.255.0.6:11111";
channelsnames[5007] = "RTL7 (S)";
channels[5007] = "S19.2E-53-1097-2006-239.255.0.7:11111";
channelsnames[5008] = "Veronica/DisneyXD (S)";
channels[5008] = "S19.2E-53-1097-2031-239.255.0.8:11111";

maxChan[5] = 5008; // set to max multicast channel else you see 'undefined' in guide view

//
// Full URL TEST
//

minChan[2] = 2001;
defChan[2] = 2001;
baseChn[2] = 2000;
protChn[2] = 0;
ServerAdres[2] = "FullURL";
// MultiCast, channels[x] layout DVB(Satposition, C or T)-NID-TID-SID-multicast address


channelsnames[2001] = "YouTube 1080p";
channels[2001] = "http://r5---sn-h0j7sn76.c.youtube.com/videoplayback?itag=37&ip=92.73.12.87&key=yt1&upn=bTPjGgbx5_4&cp=U0hVRVFLVl9GTUNONV9JRVpGOmozTmpPZFEtVk5E&source=youtube&sparams=cp%2Cid%2Cip%2Cipbits%2Citag%2Cratebypass%2Csource%2Cupn%2Cexpire&ipbits=8&ratebypass=yes&mv=m&mt=1360086794&ms=au&id=2707c2440b646042&fexp=927101%2C916807%2C900222%2C916625%2C902538%2C920704%2C912806%2C902000%2C922403%2C922405%2C929901%2C913605%2C925710%2C929114%2C920201%2C913302%2C919009%2C911116%2C910221%2C901451%2C919114&newshard=yes&expire=1360108513&sver=3&signature=2580F86F2429B02B80F1D2F6941A2B12B0D11177.A18842DF82FA7DBC1494B7C4CF9C1949C59FB335&title=Revolution%20-%20Trailer";
channelsnames[2002] = "YouTube 720p";
channels[2002] = "http://192.168.3.15:8000/media/videos/Doro and Lemmy Kilmister Love Me Forever Live 2003 HD.mp4";

maxChan[2] = 2002; // set to max multicast channel else you see 'undefined' in guide view


