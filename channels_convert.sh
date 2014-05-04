#! /bin/bash
#
# Script by rekordc@gmail.com
# 0.33 04/05/2014
#

svdrpsend.pl lstc > channels.list

while IFS=: read Name Frequency Parameters Source SRate VPID APID TPID CA SID NID TID RID
do 

  if [ "$Name" != "" ]; then
   channr=${Name:4}
   channr=( $channr)
   if (($channr <= 999)); 
    then groupnr=0
    else groupnr=${channr:0:1}
   fi
   len="${#channr}"
   let "len += 5"
   name=${Name:len}
    ####
    ####    if you want to select Source and not run full channels.conf on VIP
    ##    if [ "$Source" == "T" ] || [ "$Source" == "S19.2E" ] || [ "$Source" == "S23.5E" ]  || [ "$Source" == "S13.0E" ] || [ "$Source" == "S28.2E" ]; then
    ##    if [ "$Source" == "S19.2E" ] || [ "$Source" == "S23.5E" ]; then
    ##    if [ "$Source" == "S19.2E" ]; then
    ####
    
     if (($channr <= 9999)) && (( $channr > 0)); then	
	    OIFS=$IFS;
	    IFS=";";
	    nameArray=($name);
	    IFS=$OIFS;

	echo -e "channelsnames[$channr]=\"$nameArray\";\n\
channels[$channr]=\"$Source-$NID-$TID-$SID\";"
	if [ "$groupnr" == "$oldnr" ]; 
	 then max_grp[$groupnr]=$channr
	 else min_grp[$groupnr]=$channr
	fi
	oldnr=$groupnr
     fi

    ####
##    fi    
    ####
  fi
done < channels.list

for i in "${max_grp[@]}"
do
  if (($i <= 999)); 
    then grp=0
    else grp=${i:0:1}
   fi
    echo "minChan[$grp] = ${min_grp[grp]};"
    echo "maxChan[$grp] = $i;"
    echo "baseChn[$grp] = $((grp*1000));"

done

echo "
defChan[0] = 604;  protChn[0] = 0;
defChan[1] = 1010; protChn[1] = 0;
defChan[2] = 2000; protChn[2] = 0;
defChan[3] = 3000; protChn[3] = 0;
defChan[4] = 4001; protChn[4] = 0;
defChan[6] = 6001; protChn[6] = 1;
defChan[8] = 8001; protChn[8] = 0;
defChan[9] = 9051; protChn[9] = 0;"


    
