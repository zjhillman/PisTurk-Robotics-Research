/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

const DEBUG = true;
var allotedTime = 15 * 60000; // 15 minutes
var experimentStartTime;
var warned = false;
var expired = false;


var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to
// they are not used in the stroop code but may be useful to you

// All pages to be loaded
var pages = [
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	"instructions/instruct-ready.html",
	"audiovisual.html",
	"demographics.html",
	"videogroup1.html",
	"scale.html",
	"postquestionnaire.html"
];

// In javascript, defining a function as `async` makes it return  a `Promise`
// that will "resolve" when the function completes. Below, `init` is assigned to be the
// *returned value* of immediately executing an anonymous async function.
// This is done by wrapping the async function in parentheses, and following the
// parentheses-wrapped function with `()`.
// Therefore, the code within the arrow function (the code within the curly brackets) immediately
// begins to execute when `init is defined. In the example, the `init` function only
// calls `psiTurk.preloadPages()` -- which, as of psiTurk 3, itself returns a Promise.
//
// The anonymous function is defined using javascript "arrow function" syntax.
const init = (async () => {
    await psiTurk.preloadPages(pages);
})()

var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	"instructions/instruct-ready.html"
];


/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
*
********************/

/*********************
*  Audio Visual Test *
*********************/
var audio_visual = function() {
	psiTurk.showPage("audiovisual.html");
	const audioAnswer = 'forward';
	const videoAnswer = 'amazing';

	// show enabled or disabled if the box is checked or not
	var test = function() {
		$(".av-test").each(() => {
			if (this.is(":checked")) {
				var labels = document.getElementsByTagName("label");
			} else {
				$("label[for='"+this.attr(id)+"']").empty();
				$("label[for='"+this.attr(id)+"']").append("Disabled");
			}

		})
	}

	// test to enable next button
	var gradeAudioVisualTest = function() {
		if ( ($('#test-audio-answer').val().toLowerCase() == audioAnswer)
			&& ($('#test-video-answer').val().toLowerCase() == videoAnswer) ){
				$('#next').removeAttr('disabled');
				$('#error').attr('style', 'display: hide;');
				document.getElementById('error').innerHTML = "";
				return true;
			}
		else {
			$('#error').removeAttr('style');

			if ( !audioAnswer.includes($('#test-audio-answer').val().toLowerCase()) )
				document.getElementById('error').innerHTML = "Please listen to the spoken word carefully";
			else if ( !videoAnswer.includes($('#test-video-answer').val().toLowerCase()) )
				document.getElementById('error').innerHTML = "Please make sure the word you typed matches the word in the video";
			else
				document.getElementById('error').innerHTML = "";
			return false;
		}
	}

	var enableNextButton = () => {
		$('#next').removeAttr('disabled');
	}

	var disableNextButton = () => {
		$('#next').attr('disabled', '');
	}

	// $("#audio-test").click( function() {
	// 	if (document.getElementById("audio-test").checked) {
	// 		document.getElementById("audio-box-text").innerHTML = "Enabled";
	// 	}
	// 	else
	// 		document.getElementById("audio-box-text").innerHTML = "Disabled";
// 
	// 	grade();
	// })
// 
	// $("#video-test").click( function() {
	// 	if (document.getElementById("video-test").checked) {
	// 		document.getElementById("video-box-text").innerHTML = "Enabled";
	// 	}
	// 	else
	// 		document.getElementById("video-box-text").innerHTML = "Disabled";
// 
	// 	grade();
	// })

	$('#test-audio').on('ended', function () {
		setTimeout( function () {
			var audio = document.getElementById('test-audio');
			if (audio != null) {
				audio.currentTime = 0;
				$('#test-audio').trigger('play');
			}
		}, 3000);
	});

	$('#test-audio-answer').on('input', () => {
		if (gradeAudioVisualTest())
			enableNextButton();
		else
			disableNextButton();
	});

	$('#test-video-answer').on('input', () => {
		if (gradeAudioVisualTest())
			enableNextButton();
		else
			disableNextButton();
	});

	$("#next").click( function() {
		currentview = new demographics();
	});
}

/*********************
* Demo Questionnaire *
*********************/
var demographics = function() {
	psiTurk.showPage("demographics.html");
	psiTurk.recordTrialData({"phase":"demographics", 'status':'begin'});
	var gTest = false, aTest = false, pTest = false, xp1Test = false, xp2Test = false;
	var numberOfTests = 0;
	const curve = 5;

	var gradeDemographicsTest = function () {
		if (++numberOfTests < curve) 
			return false;

		var error = document.getElementById('error');
		var gender = document.getElementById("gender").value;
		var other = document.getElementById("otherGender").value;
		var age = document.getElementById("age").value;
		var prolificID = document.getElementById("prolific-id").value;
		var robot = $('input[name="robotXP"]:checked').val();
		var prolific = $('input[name="prolificXP"]:checked').val();
		
		// test if input is proper
		gTest = gradeGender(gender, other);
		aTest = gradeAge(age);
		pTest = gradeID(prolificID);
		xp1Test = gradeRobot(robot);
		xp2Test = gradeProlific(prolific);

		if (gTest && aTest && pTest && xp1Test && xp2Test) {
			error.innerHTML = "";
			error.hidden = true;
			return true;
		}
		else if (!xp1Test || !xp2Test) {
			if (!aTest && age != "") {
				error.innerHTML = "You must enter a valid age";
				error.hidden = false;
				return false;
			}
			else {
				error.innerHTML = "";
				error.hidden = true;
				return false;
			}
		}
		else if (!gTest){
			error.innerHTML = "Please select your gender, if you chose 'other' you must type your response";
			error.hidden = false;
			return false;
		}
		else if (!aTest){
			error.innerHTML = "You must enter a valid age";
			error.hidden = false;
			return false;
		}
		else if (!pTest){
			error.innerHTML = "Please enter an appropriate prolific id";
			error.hidden = false;
			return false;
		}
	}

	var recordDemoResponses = function() {
		psiTurk.recordTrialData({"phase":"demographics", 'status':'submit'});

		var gender = document.getElementById("gender").value;
		var other = document.getElementById("otherGender").value;
		var age = document.getElementById("age").value;
		var prolificID = document.getElementById("prolific-id").value;
		var robot = $('input[name="robotXP"]:checked').val();
		var prolific = $('input[name="prolificXP"]:checked').val();

		if (DEBUG) {
			console.log("gender: " + gender);
			console.log("other: " + other);
			console.log("age: " + age);
			console.log("ID: " + prolificID);
			console.log("robot experience: " + robot);
			console.log("prolific experience: " + prolific);
		}

		psiTurk.recordTrialData({"phase":"demographics", 'gender':gender});
		psiTurk.recordTrialData({"phase":"demographics", 'other':other});
		psiTurk.recordTrialData({"phase":"demographics", 'age':age});
		psiTurk.recordTrialData({"phase":"demographics", 'prolific':prolificID});
		psiTurk.recordTrialData({"phase":"demographics", 'robot':robot});
		psiTurk.recordTrialData({"phase":"demographics", 'prolific':prolific});
		return;
	}

	var gradeGender = function (gender, other) {
		if (gender == "")
			return false;
		else if (gender == "male" || gender == "female" || gender == "prefer not to say")
			return true;
		else if (gender == "other" && other !="")
			return true;
		else
			return false;
	}

	var gradeAge = function (age) {
		if (17 < age && age < 101)
			return true;
		else 
			return false
	}

	var gradeID = (id) => {
		if (id == "")
			return false;
		else if (id != null)
			return true;
		else
			return false;
	}

	var gradeRobot = function (rating) {
		if (rating != undefined)
			return true;
		else
			return false;
	}

	var gradeProlific = function (rating) {
		if (rating != undefined)
			return true;
		else
			return false;
	}

	var enableNextButton = () => {
		$('#next').removeAttr('disabled');
	}

	var disableNextButton = () => {
		$('#next').attr('disabled', '');
	}

	$('#gender').change( () => {
		if (gradeDemographicsTest())
			enableNextButton();
		else
			disableNextButton();
	});

	$('#otherGender').on('input', () => {
		if (gradeDemographicsTest())
			enableNextButton();
		else
			disableNextButton();
	});

	$('#age').on('input', () => {
		if (gradeDemographicsTest())
			enableNextButton();
		else
			disableNextButton();
	});

	$('#prolific-id').on('input', () => {
		if (gradeDemographicsTest())
			enableNextButton();
		else
			disableNextButton();
	});

	$('input[name="robotXP"]').change(function () {
		if (gradeDemographicsTest())
			enableNextButton();
		else
			disableNextButton();
	});

	$('input[name="prolificXP"]').change(function () {
		if (gradeDemographicsTest())
			enableNextButton();
		else
			disableNextButton();
	});

	$("#next").click( function() {
		recordDemoResponses();
		currentview = new VideoGroup1(0);
	});
}

/*********************
* Video Group 1 *
*********************/
var VideoGroup1 = function () {
	experimentStartTime = Date.now();

	// Load the stage.html snippet into the body of the page
	psiTurk.showPage('videogroup1.html');
	psiTurk.recordTrialData({"phase":"video-group-1", 'status':'begin'});
	experimentStartTime = Date.now();
	d3.select("#query").html('<p id="prompt">You can watch the video as many times as you want.</p>');
	document.getElementById('time-elapsed').innerHTML = timeToString(Date.now() - experimentStartTime);
	document.getElementById('timer-text').innerHTML = '/' + timeToString(allotedTime);
	
	var timerInterval = setInterval(function () {
		let elaspedTime = Date.now() - experimentStartTime;
		printTime(elaspedTime);
		checkTimer(elaspedTime);
	}, 1000);

	var printTime = function (time) {
		document.getElementById("time-elapsed").innerHTML = timeToString(time);
	}

	var checkTimer = function (time) {
		// 300000 == 5 minutes, so if the user is within 5 minutes of the time limit
		if (time >= allotedTime - 300000 && warned == false) {
			warned = true;
			alert("5 minutes remaining");
		}

		// 1800000 == 30 minutes
		if (time >= allotedTime && expired == false) {
			expired = true;
			alert("Time Expired!\nYou failed to complete the experiment within the time limit");
		}
	}

	function timeToString (time) {
		var diffInHours = time / 3600000;
		var hh = Math.floor(diffInHours);

		var diffInMins = (diffInHours - hh) * 60;
		var mm = Math.floor(diffInMins);

		var diffInSecs = (diffInMins - mm) * 60;
		var ss = Math.floor(diffInSecs);

		var formattedMM = mm.toString().padStart(2, "0");
		var formattedSS = ss.toString().padStart(2, "0");


		return `${formattedMM}:${formattedSS}`
	}

	var recordExperimentData = () => {

	}

	function next () {
		clearInterval(timerInterval);
		recordExperimentData();
		currentview = new ScaleQuestionnaire(0);
	};

	var timeupdate = (id) => {
		var video = document.getElementById(id);
		if (video == null)
			return;

		if ((video.duration - video.currentTime < 10) && document.getElementById('next').hasAttribute('disabled')) {
			$('#next').removeAttr('disabled');
			if (DEBUG) console.log('button enabled by '+id+' at '+video.currentTime + ' seconds');
		}
	}

	document.getElementById('test1').addEventListener('timeupdate', function () {
		timeupdate('test1');
	});

	$('#play-button').click( () => {
		var video = document.getElementById('test1');
		if (!video.paused && !video.ended) { 
			$('#test1').trigger('pause');
			document.getElementById('play-button').innerHTML = "Play"
		}
		else {
			$('#test1').trigger('play');
			document.getElementById('play-button').innerHTML = "Pause"
		}
	});

	$('#restart-button').click( () => {
		var video = document.getElementById('test1');
		video.currentTime = 0;
	});

	$('#next').click( () => {
		next();
	});
}

/****************
* Video Group 2 *
****************/
var VideoGroup2 = function () {

	// Load the stage.html snippet into the body of the page
	psiTurk.showPage('videogroup1.html');
	psiTurk.recordTrialData({"phase":"video-group-1", 'status':'begin'});
	d3.select("#query").html('<p id="prompt">You can watch the video as many times as you want.</p>');
	document.getElementById('time-elapsed').innerHTML = timeToString(Date.now() - experimentStartTime);
	document.getElementById('timer-text').innerHTML = '/' + timeToString(allotedTime);
	
	var timerInterval = setInterval(function () {
		let elaspedTime = Date.now() - experimentStartTime;
		printTime(elaspedTime);
		checkTimer(elaspedTime);
	}, 1000);

	var printTime = function (time) {
		document.getElementById("time-elapsed").innerHTML = timeToString(time);
	}

	var checkTimer = function (time) {
		// 300000 == 5 minutes, so if the user is within 5 minutes of the time limit
		if (time >= allotedTime - 300000 && warned == false) {
			warned = true;
			alert("5 minutes remaining");
		}

		// 1800000 == 30 minutes
		if (time >= allotedTime && expired == false) {
			expired = true;
			alert("Time Expired!\nYou failed to complete the experiment within the time limit");
		}
	}

	function timeToString(time) {
		var diffInHours = time / 3600000;
		var hh = Math.floor(diffInHours);

		var diffInMins = (diffInHours - hh) * 60;
		var mm = Math.floor(diffInMins);

		var diffInSecs = (diffInMins - mm) * 60;
		var ss = Math.floor(diffInSecs);

		var formattedMM = mm.toString().padStart(2, "0");
		var formattedSS = ss.toString().padStart(2, "0");


		return `${formattedMM}:${formattedSS}`
	}

	var recordExperimentData = () => {

	}

	function next () {
		clearInterval((timerInterval));
		recordExperimentData();
		currentview = new ScaleQuestionnaire(1);
	};

	var timeupdate = (id) => {
		var video = document.getElementById(id);
		if (video == null)
			return;

		if ((video.duration - video.currentTime < 10) && document.getElementById('next').hasAttribute('disabled')) {
			$('#next').removeAttr('disabled');
			if (DEBUG) console.log('button enabled by '+id+' at '+video.currentTime + 'seconds');
		}
	}

	document.getElementById('test1').addEventListener('timeupdate', function () {
		timeupdate('test1');
	});

	$('#play-button').click( () => {
		var video = document.getElementById('test1');
		if (!video.paused && !video.ended) { 
			$('#test1').trigger('pause');
			document.getElementById('play-button').innerHTML = "Play"
		}
		else {
			$('#test1').trigger('play');
			document.getElementById('play-button').innerHTML = "Pause"
		}
	});

	$('#restart-button').click( () => {
		var video = document.getElementById('test1');
		video.currentTime = 0;
	});

	$('#next').click( () => {
		next();
	});
}

/**********************
* HRI Test            *
**********************/
var HriTest = function() {
	var vidon; // time video is presented
	var startTime = Date.now();
	var warned = false;
	var expired = false;
	var watchTime = [];
	videoList = ['#test1', '#test2'];
	videoId = videoList.shift();
	
	setInterval(function () {
		let elaspedTime = Date.now() - startTime;
		printTime(elaspedTime);
		checkTimer(elaspedTime);
	}, 1000);

	var printTime = function (time) {
		document.getElementById("time-elasped").innerHTML = timeToString(time);
	}

	var checkTimer = function (time) {
		// 1500000 == 25 minutes
		if (time >= 1500000 && warned == false) {
			warned = true;
			alert("5 minutes remaining");
		}

		// 1800000 == 30 minutes
		if (time >= 1800000 && expired == false) {
			expired = true;
			alert("Time Expired!\nYou failed to complete the experiment within the time limit");
		}
	}

	function timeToString(time) {
		var diffInHours = time / 3600000;
		var hh = Math.floor(diffInHours);

		var diffInMins = (diffInHours - hh) * 60;
		var mm = Math.floor(diffInMins);

		var diffInSecs = (diffInMins - mm) * 60;
		var ss = Math.floor(diffInSecs);

		var formattedMM = mm.toString().padStart(2, "0");
		var formattedSS = ss.toString().padStart(2, "0");


		return `${formattedMM}:${formattedSS}`
	}

	function start () {
		// show first video & hide the rest
		$(videoId).show();
		$(videoId).trigger('play');
		for (var i = 0; i < videoList.length; ++i) {
			$(videoList[i]).hide();
		}

		vidon = new Date().getTime();
	};

	function next () {
		if (videoList.length == 0) {
			$(videoId).trigger('pause');
			watchTime.push( new Date().getTime() - vidon);
			console.log(watchTime);
			finish();
			return;
		}

		// hide last video
		$(videoId).hide();
		$(videoId).trigger('pause');

		// show next video
		videoId = videoList.shift();
		$(videoId).show();
		$(videoId).trigger('play');

		// disable button until next video is played
		document.getElementById('next').setAttribute('disabled', '');

		// reset video time
		watchTime.push( new Date().getTime() - vidon );
		vidon = new Date().getTime();
	}

	function timeupdate(id) {
		var video = document.getElementById(id);
		if (video == null)
			return;
		
		/* Enabled the next button IF
		 * the current video called the update, the video has 10 or less seconds remaining, and if the button is disabled
		 */
		if ((video.duration - video.currentTime < 10) && (id == videoId.substring(1)) && document.getElementById('next').hasAttribute('disabled')) {
			$('#next').removeAttr('disabled');
			console.log('button enabled by '+id+' at '+video.currentTime + 'seconds');
		}
	}

	function recordExperimentData() {
		psiTurk.recordTrialData({'phase':'HriExperiment', 'status':'submit'});

		for (var i = 0; i < watchTime.length; ++i) {
			var currentVideo = `Video${1}WatchTime`;
			psiTurk.recordTrialData({'phase':'HriExperiment', currentVideo:watchTime[i]});
		}
		
		// depreciated form within HriExperiment()
		// $('select').each( function(i, val) {
		// 	psiTurk.recordUnstructuredData(this.id, this.value);
		// })
	}

	function finish () {
		recordExperimentData();
		currentview = new ScaleQuestionnaire();
	};

	// Load the stage.html snippet into the body of the page
	psiTurk.showPage('videogroup1.html');
	psiTurk.recordTrialData({"phase":"hri-experiment", 'status':'begin'});
	d3.select("#query").html('<p id="prompt">You can watch the video as many times as you want.</p>');

	// start
	start();
	$("#next").click(function () {
	    next();
	});
	document.getElementById('test1').addEventListener('timeupdate', function () {
		timeupdate('test1');
	});
	document.getElementById('test2').addEventListener('timeupdate', function () {
		timeupdate('test2');
	});
}

/**********************
* Scale Questionnaire *
**********************/
var ScaleQuestionnaire = function (lastVideoWatched) {
	psiTurk.showPage('scale.html')
	psiTurk.recordTrialData({"phase":"scale", 'status':'begin'});
	var numberOfTests = 0;
	const numberOfInputs = 12;
	const inputsPerPage = 4;
	document.getElementById('time-elapsed').innerHTML = timeToString(Date.now() - experimentStartTime);
	document.getElementById('timer-text').innerHTML = '/' + timeToString(allotedTime);
	var scalePage = 1;
	var droppedTests = 4
	
	var timerInterval = setInterval(function () {
		let elaspedTime = Date.now() - experimentStartTime;
		printTime(elaspedTime);
		checkTimer(elaspedTime);
	}, 1000);

	var printTime = function (time) {
		document.getElementById("time-elapsed").innerHTML = timeToString(time);
	}

	var checkTimer = function (time) {
		// 300000 == 5 minutes, so if the user is within 5 minutes of the time limit
		if (time >= allotedTime - 300000 && warned == false) {
			warned = true;
			alert("5 minutes remaining");
		}

		// 1800000 == 30 minutes
		if (time >= allotedTime && expired == false) {
			expired = true;
			alert("Time Expired!\nYou failed to complete the experiment within the time limit");
		}
	}

	function timeToString(time) {
		var diffInHours = time / 3600000;
		var hh = Math.floor(diffInHours);

		var diffInMins = (diffInHours - hh) * 60;
		var mm = Math.floor(diffInMins);

		var diffInSecs = (diffInMins - mm) * 60;
		var ss = Math.floor(diffInSecs);

		var formattedMM = mm.toString().padStart(2, "0");
		var formattedSS = ss.toString().padStart(2, "0");


		return `${formattedMM}:${formattedSS}`
	}

	var start = () => {
		$('.form1').show();
		$('.form2').hide();
		$('.form3').hide();
		$('#prev').hide();
	}

	var prev = () => {
		switch (scalePage) {
			case 1:
				break;
			case 2:
				scalePage--;
				$('.form1').show();
				$('.form2').hide();
				$('.form3').hide();
				$('#prev').hide();
				break;
			case 3:
				scalePage--;
				$('.form1').hide();
				$('.form2').show();
				$('.form3').hide();
				break;
			default:
				break;
		}
	}

	var next = () => {
		switch (scalePage) {
			case 1:
				scalePage++;
				$('.form1').hide();
				$('.form2').show();
				$('.form3').hide();
				$('#prev').show();
				break;
			case 2:
				scalePage++;
				$('.form1').hide();
				$('.form2').hide();
				$('.form3').show();
				break;
			case 3:
				finish()
				break;
			default:
				break;
		}
	}

	var finish = function () {
		clearInterval(timerInterval);
		recordExperimentData();

		if (lastVideoWatched == false)
			currentview = new VideoGroup2();
		else
			currentview = new Questionnaire();
		return;
	}

	var gradeScale = () => {
		if (++numberOfTests < scalePage * droppedTests)
			return false;

		var error = document.getElementById('error');
		if (!areRadiosChecked()) {
			disableNextButton();
			error.innerHTML = "Please check that you made a selection for every question";
			error.setAttribute('style', 'display: inline-block;');
			return false;
		} else {
			error.hidden = true;
			enableNextButton();
			return true;
		}

	}

	var enableNextButton = () => {
		$('#next').removeAttr('disabled');
	}

	var disableNextButton = () => {
		$('#next').attr('disabled', '');
	}

	// returns true if all radio groups are selected
	var areRadiosChecked = () => {
		var numOfCheckedInputs = $('input:radio:checked').length;
		
		if (scalePage * inputsPerPage <= numOfCheckedInputs)
			return true;
		else
			return false;
	}

	var recordExperimentData = function () {
		psiTurk.recordTrialData({"phase":"scale", 'status':'submit'});

		$("input:checked").each( function () {
			var name = $(this).attr('name');
			var data = $(this).val();
			if (DEBUG) console.log(name+":"+data)
			psiTurk.recordTrialData({"phase":"scale-questionnaire", name:data});
		});
	}

	start();

	$('input[name="scale-reliable"]').change ( () => {
		gradeScale();
	});

	$('input[name="scale-confident"]').change ( () => {
		gradeScale();
	});

	$('input[name="scale-responsive"]').change ( () => {
		gradeScale();
	});

	$('input[name="scale-sociable"]').change ( () => {
		gradeScale();
	});

	$('input[name="scale-compassion"]').change ( () => {
		gradeScale();
	});

	$('input[name="scale-awkward"]').change ( () => {
		gradeScale();
	});

	$('input[name="scale-scary"]').change ( () => {
		gradeScale();
	});

	$('input[name="scale-strange"]').change ( () => {
		gradeScale();
	});

	$('input[name="scale-dangerous"]').change ( () => {
		gradeScale();
	});

	$('input[name="scale-logical"]').change ( () => {
		gradeScale();
	});

	$('input[name="scale-artificial"]').change ( () => {
		gradeScale();
	});

	$('input[name="scale-similar"]').change ( () => {
		gradeScale();
	});

	$("#prev").click(function () {
	    prev();
	});

	$("#next").click(function () {
	    next();
	});
}

/*********************
* Post Questionnaire *
*********************/
var Questionnaire = function() {
	// Load the questionnaire snippet 
	psiTurk.showPage('postquestionnaire.html');
	psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	record_responses = function() {
		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('input:checked').each( function () {
			var name = $(this).attr("name");
			var data = $(this).val();
			if (DEBUG) console.log(name+":"+data)
			psiTurk.recordTrialData({"phase":"postquestionnaire", name:data});
		})

		$('select').each( function() {
			var name = $(this).attr("name");
			var data = $(this).val();
			if (DEBUG) console.log(name+":"+data)
			psiTurk.recordTrialData({"phase":"postquestionnaire", name:data});		
		});

	};

	prompt_resubmit = function () {
		document.body.innerHTML = error_message;
		$("#resubmit").click(resubmit);
	};

	resubmit = function () {
		document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
		reprompt = setTimeout(prompt_resubmit, 10000);
		
		psiTurk.saveData({
			success: function() {
			    clearInterval(reprompt); 
                psiTurk.computeBonus('compute_bonus', function(){
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 


			}, 
			error: prompt_resubmit
		});
	};


	var gradeQuestionnaire = () => {
		if ($('input:radio:checked').length != 1) {
			document.getElementById('error').innerHTML = "Please make sure all questions are answered.";
			return false;
		} else
			return true;
	} 

	var enableNextButton = () => {
		$('#next').removeAttr('disabled');
	}

	var disableNextButton = () => {
		$('#next').attr('disabled', '');
	}

	$('input[name="selectRobot').change( () => {
		if (gradeQuestionnaire())
			enableNextButton();
		else
			disableNextButton();
	});

	$('select[name="difficulty"]').change( () => {
		if (gradeQuestionnaire())
			enableNextButton();
		else
			disableNextButton();
	})
	
	$("#next").click(function () {
		record_responses();
		psiTurk.saveData({
			success: function(){
				psiTurk.computeBonus('compute_bonus', function() { 
					psiTurk.completeHIT(); // when finished saving compute bonus, the quit
				}); 
			}, 
			error: prompt_resubmit});
	});
    
	
};

// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
 // In this example `task.js file, an anonymous async function is bound to `window.on('load')`.
 // The async function `await`s `init` before continuing with calling `psiturk.doInstructions()`.
 // This means that in `init`, you can `await` other Promise-returning code to resolve,
 // if you want it to resolve before your experiment calls `psiturk.doInstructions()`.

 // The reason that `await psiTurk.preloadPages()` is not put directly into the
 // function bound to `window.on('load')` is that this would mean that the pages
 // would not begin to preload until the window had finished loading -- an unnecessary delay.
$(window).on('load', async () => {
    await init;
    psiTurk.doInstructions(
    	instructionPages, // a list of pages you want to display in sequence
    	function() { currentview = new audio_visual(); } // what you want to do when you are done with instructions
    );
});
