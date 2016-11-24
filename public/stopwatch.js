 	var stopwatch;
    var runningstate = 0; // 1 means the timecounter is running 0 means counter stopped
    var stoptime = 0;
    var lapcounter = 0;
    var currenttime;
    var lapdate = '';
    var lapdetails;

    function timecounter(starttime)
    {
    	currentdate = new Date();
    	stopwatch = document.getElementById('stopwatch');

    	var timediff = currentdate.getTime() - starttime;
    	if(runningstate == 0)
    	{
    		timediff = timediff + stoptime
    	}
    	if(runningstate == 1)
    	{
    		stopwatch.value = formattedtime(timediff);
    		refresh = setTimeout('timecounter(' + starttime + ');',10);
    	}
    	else
    	{
    		window.clearTimeout(refresh);
    		stoptime = timediff;
    	}
    }

    function startandstop()
    {
    	var startdate = new Date();
    	var starttime = startdate.getTime();
    	if(runningstate==0)
    	{
    		startandstop.value = 'Stop';
    		runningstate = 1;
    		timecounter(starttime);
    	}
    	else
    	{
    		startandstop.value = 'Start';
    		runningstate = 0;
    		lapdate = '';
    	}
    }
    function resetstopwatch()
    {
    	lapdetails.value = '';
    	lapcounter = 0;
    	stoptime = 0;
    	lapdate = '';
    	window.clearTimeout(refresh);
    	if(runningstate == 1)
    	{
    		var resetdate = new Date();
    		var resettime = resetdate.getTime();
    		timecounter(resettime);
    	}
    	else
    	{
    		stopwatch.value = "0:0:0";
    	}
    }
    function formattedtime(unformattedtime)
    { 
    	var decisec = Math.floor(unformattedtime/100) + '';
    	var second = Math.floor(unformattedtime/1000);
    	var minute = Math.floor(unformattedtime/60000);
    	decisec = decisec.charAt(decisec.length - 1);
    	second = second - 60 * minute + '';
    	return minute + ':' + second + ':' + decisec;
    }