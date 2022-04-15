//combining all properties related to Output section
class Output {
	constructor() {
		this.o_pid = [];
		this.o_arrivaltime = [];
		this.o_bursttime = [];
		this.o_priority = [];
		this.completionTime = [];
		this.turnAroundTime = [];
		this.waitingTime = [];
		this.avgWait = 0;
		this.avgtat = 0;
		this.utilization = 0;
		this.quantum = 0;
		this.algorithm = '';
	}
}

//   var finalOutputobj = new finalOutput();
var mainOutput = new Output();

var processTotal;
var Selectedalgorithm;
var tq;


$(document).ready(function () {

	$('#explanation-equation').hide();



	$(".priority").collapse({ toggle: false });


	//default algorithm is First Come First Served
	var algorithm = "FCFS";

	//used to keep track of how long the CPU has been running as opposed to idle
	var runningTime = 0;

	//the time it takes to switch between processes
	var contexSwitch = 0;

	//array used to store the processes
	var processArray = [];

	//the time quantum used in Round Robin
	var timeQuantum = 2;

	//the amount of processes, this is used to load in values into processArray
	var processCount = 3;

	//used to keep track of the position
	var position = 0;

	//things are put into here to display
	var bar = new progressBar();

	//set up program initially
	run();

	setTimeout(function () { run() }, 200);



	//used for debugging
	// function printArray(){
	// 	ole.log("Printing array");
	// 	for (var i =0; i< processArray.length; i++) {
	// 		console.log(processArray[i].processName);
	// 		console.log(processArray[i].burstTime);
	// 		console.log(processArray[i].arrivalTime);
	// 	};cons
	// }


	//used for SJF and SRJF, finds the index of the next available smallest job
	function findSmallestBurstIndex() {
		var smallestIndex = 0;
		var smallestBurst = 0;

		//finds an initial burst time
		for (var i = 0; i < processArray.length; i++) {
			if (processArray[i].done == false && processArray[i].arrivalTime <= position) {
				smallestIndex = i;
				smallestBurst = processArray[i].burstTime;
				break;
			}
		}

		//looks through the array to find a smaller burst time
		for (var i = smallestIndex; i < processArray.length; i++) {
			if (processArray[i].burstTime < smallestBurst && processArray[i].done == false && processArray[i].arrivalTime <= position) {
				smallestIndex = i;
				smallestBurst = processArray[i].burstTime;
			}

		}


		return smallestIndex;
	}

	function findSmallestPriorityIndex() {
		var smallestIndex = 0;
		var smallestPriority = 0;

		//finds an initial burst time
		for (var i = 0; i < processArray.length; i++) {
			if (processArray[i].done == false && processArray[i].arrivalTime <= position) {
				smallestIndex = i;
				smallestPriority = processArray[i].priority;
				break;
			}
		}

		//looks through the array to find a smaller burst time
		for (var i = smallestIndex; i < processArray.length; i++) {
			if (processArray[i].priority < smallestPriority && processArray[i].done == false && processArray[i].arrivalTime <= position) {
				smallestIndex = i;
				smallestPriority = processArray[i].priority;
			}

		}


		return smallestIndex;
	}



	//checks if all the processes have completed
	function isDone() {
		var done = true;
		for (var i = 0; i < processArray.length; i++) {
			if (processArray[i].done == false) {
				done = false;
				//console.log("not done   i:"+i);
			}
		}

		return done;
	}


	//inserts idle time if no process is ready to go yet
	function fillGaps() {
		for (var i = 0; i < processArray.length; i++) {
			if (processArray[i].done == false) {
				if (processArray[i].arrivalTime > position) {
					bar.addItem("idle", processArray[i].arrivalTime - position);

				}
				break;
			}
		}
	}

	//used to display the gant chart
	function progressBar() {
		this.indexes = [];
		this.names = [];
		this.sum = 0;

		this.addItem = function (name, progressLength) {
			var previousName = this.names[this.names.length - 1];

			//if the process being added is the same as the current one, combine them
			if (this.names.length > 0 && previousName == name) {
				this.indexes[this.indexes.length - 1] += progressLength;
				this.sum += progressLength;
				position += progressLength;
			}
			else {
				if (previousName != "idle" && previousName != "context switch" && name != "idle" && position != 0 && contexSwitch > 0
					|| name == "idle" && progressLength <= contexSwitch && position != 0) {
					this.indexes[this.indexes.length] = contexSwitch;
					this.names[this.names.length] = "context switch";
					this.sum += contexSwitch;
					position += contexSwitch;
					position = parseFloat(position.toPrecision(12));
				}
				if ((name == "idle" && progressLength <= contexSwitch && position != 0) == false) {
					this.indexes[this.indexes.length] = progressLength;
					this.names[this.names.length] = name;
					this.sum += progressLength;
					position += progressLength;
				}
			}
			position = parseFloat(position.toPrecision(12));
			this.sum = parseFloat(this.sum.toPrecision(12));

		}



		this.displayBar = function () {


			var pos = 0;

			for (var i = 0; i < this.indexes.length; i++) {
				// console.log("name:"+this.names[i]+"  index:"+this.indexes[i]);
				var length = (this.indexes[i] / this.sum) * 100;
				addToBar(this.names[i], length, pos, this.indexes[i], i);
				pos += this.indexes[i];
				pos = parseFloat(pos.toPrecision(12));
			}

			createRuler(this.sum);

			// console.log("sum:"+this.sum+"   "+runningTime);

			var utilization = 100 - (((this.sum - runningTime) / this.sum) * 100);
			utilization = Math.round(utilization * 100) / 100;

			sortNames();

			var waitTimes = [];

			waitTimes[0] = processArray[0].finishTime - processArray[0].arrivalTime - processArray[0].initialBurst;
			waitTimes[0] = parseFloat(waitTimes[0].toPrecision(12));
			var fullExplanation = '';

			fullExplanation += '<p class="lead"> CPU utilization: $ ' + utilization + '\\%   $' +
				'<br><br>Average Wait Time: <span style="font-size:24px">$ \\frac{' + waitTimes[0];

			var waitSum = waitTimes[0];

			for (var i = 1; i < processArray.length; i++) {
				waitTimes[i] = processArray[i].finishTime - processArray[i].arrivalTime - processArray[i].initialBurst;
				waitTimes[i] = parseFloat(waitTimes[i].toPrecision(12));

				fullExplanation += '+' + waitTimes[i];
				waitSum += waitTimes[i];
			}

			var averageWait = waitSum / processArray.length;
			averageWait = Math.round(averageWait * 10000) / 10000;

			fullExplanation += '}{' + processArray.length + '} $</span> $ = ' + averageWait + ' $';

			//set the equation text
			$("#explanation-equation").html(fullExplanation);

			mainOutput.waitingTime = waitTimes;
			mainOutput.avgWait = averageWait;
			mainOutput.utilization = utilization;

			// for(let i=0; i<processArray.length;i++){
			// 	mainOutput.o_pid.push(processArray[i].processName);
			// 	mainOutput.o_arrivaltime.push(processArray[i].arrivalTime);
			// 	mainOutput.o_bursttime.push(processArray[i].burstTime);
			// 	mainOutput.completionTime.push(processArray[i].finishTime);
			// 	mainOutput.turnAroundTime.push(processArray[i].finishTime-processArray[i].arrivalTime)
			// }
			// console.log(waitTimes);
			// console.log(processArray[0].finishTime)
			// console.log(processArray[1].finishTime)
			// console.log(processArray[2].finishTime)

			// console.log(processArray[0].finishTime-processArray[0].arrivalTime)
			// console.log(processArray[1].finishTime-processArray[1].arrivalTime)
			// console.log(processArray[2].finishTime-processArray[2].arrivalTime)

			// console.log(mainOutput)
			//updates equation
			Preview.Update();
		}
	}

	function process(processName, burstTime, arrivalTime, pIndex, newPriority) {
		this.processName = processName;
		this.burstTime = burstTime;
		this.initialBurst = burstTime;
		this.arrivalTime = arrivalTime;
		this.done = false;
		this.hasStarted = false;
		this.finishTime;
		this.priority = newPriority;

		this.pIndex = pIndex;

		this.finished = function () {
			this.done = true;
			this.finishTime = position;

			// 	console.log(this.processName+" finished at position:"+position);
			// console.log("wait time:"+ (this.finishTime-this.arrivalTime- this.initialBurst));

			// mainOutput.o_pid.push(processName);
			// mainOutput.o_arrivaltime.push(arrivalTime);
			// mainOutput.o_bursttime.push(burstTime);
			// mainOutput.completionTime.push(position);
			// mainOutput.waitingTime.push((this.finishTime-this.arrivalTime- this.initialBurst));
			// mainOutput.turnAroundTime.push((this.finishTime-this.arrivalTime));
			// console.log(mainOutput);
		}
	}


	//sorts the processArray in terms of arrival times
	function sortArriveTimes() {

		function compareArrivals(process1, process2) {

			if (process1.arrivalTime > process2.arrivalTime) {
				return 1;
			}

			else if (process1.arrivalTime < process2.arrivalTime) {
				return -1;
			}

			else {
				return 0;
			}

		}

		processArray.sort(compareArrivals);
	}

	//sorts the processArray in terms of process names. i.e. P1,P2,P3, etc
	function sortNames() {

		function compareNames(process1, process2) {

			if (process1.pIndex > process2.pIndex) {
				return 1;
			}

			else if (process1.pIndex < process2.pIndex) {
				return -1;
			}

			else {
				return 0;
			}

		}

		processArray.sort(compareNames);
	}

	//loads the values into processArray from the table
	function loadValues() {
		processArray = [];

		runningTime = 0;

		var index = 0;
		for (var i = 0; i < processCount; i++) {

			var burstTime = Number($("#burst_" + (i + 1)).val()) + 0.0;
			runningTime += burstTime;
			var arrivalTime = Number($("#arrive_" + (i + 1)).val()) + 0.0;
			var processName = "P" + (i + 1);
			var priority = Number($("#priority_" + (i + 1)).val()) + 0.0;

			if (burstTime < 0) {
				alert("Please enter a valid Input...");
				location.reload();
			}
			else if (arrivalTime < 0) {
				alert("Please enter a valid Input...");
				location.reload();
			}
			else if (burstTime > 0 && isNaN(arrivalTime) == false) {
				processArray[index] = new process(processName, burstTime, arrivalTime, i, priority);
				index++;
			}


		}
	}

	function addToBar(processName, percent, start, duration, index) {
		//find the end time of the process
		var end = start + duration;
		end = parseFloat(end.toPrecision(12));

		if ($("#bar_" + index).length == 0) {
			$(".progress").append(" <div class='progress-bar' data-toggle='tooltip' title=' ' data-placement='right' id='bar_" + index + "' role='progressbar' >" + processName + "</div>");
		}
		else {
			$("#bar_" + index).removeClass("progress-bar-idle");
			$("#bar_" + index).removeClass("progress-bar-context");
			$("#bar_" + index).removeClass("progress-bar-first");
			$("#bar_" + index).removeClass("progress-bar-second");
			$("#bar_" + index).removeClass("progress-bar-third");
			$("#bar_" + index).removeClass("progress-bar-fourth");
			$("#bar_" + index).removeClass("progress-bar-fifth");
			$("#bar_" + index).removeClass("progress-bar-sixth");
			$("#bar_" + index).removeClass("progress-bar-seventh");
			$("#bar_" + index).removeClass("progress-bar-eighth");
			$("#bar_" + index).removeClass("progress-bar-ninth");
			$("#bar_" + index).removeClass("progress-bar-tenth");
		}



		if (processName == "P1") {
			$("#bar_" + index).addClass("progress-bar-first");

		}
		else if (processName == "P2") {
			$("#bar_" + index).addClass("progress-bar-second");
		}

		else if (processName == "P3") {
			$("#bar_" + index).addClass("progress-bar-third");
		}

		else if (processName == "P4") {
			$("#bar_" + index).addClass("progress-bar-fourth");
		}

		else if (processName == "P5") {
			$("#bar_" + index).addClass("progress-bar-fifth");
		}

		else if (processName == "P6") {
			$("#bar_" + index).addClass("progress-bar-sixth");
		}

		else if (processName == "P7") {
			$("#bar_" + index).addClass("progress-bar-seventh");
		}

		else if (processName == "P8") {
			$("#bar_" + index).addClass("progress-bar-eighth");
		}

		else if (processName == "P9") {
			$("#bar_" + index).addClass("progress-bar-ninth");
		}

		else if (processName == "P10") {
			$("#bar_" + index).addClass("progress-bar-tenth");
		}

		else if (processName == "context switch") {
			$("#bar_" + index).addClass("progress-bar-context");
		}
		else if (processName == "idle") {
			$("#bar_" + index).addClass("progress-bar-idle");
		}


		var newName = processName;

		var tooltip;

		var toolTipTitle = processName;

		if (processName == "idle") {
			toolTipTitle = "Idle CPU";
			newName = "";
		}

		else if (processName == "context switch") {
			toolTipTitle = "Context Switch";
			newName = "";
		}

		//sets the tooltip
		$("#bar_" + index).attr('title', toolTipTitle + "\nStart: " + start + "\nDuration: " + duration + "\nEnd: " + end);

		//sets the processName, should be blank for context switch or idle
		$("#bar_" + index).text(newName);

		//sets the width of the progress bar item
		$("#bar_" + index).css('width', percent + "%");
	}

	//First Come First Served function
	function FCFS() {
		sortArriveTimes();


		for (var i = 0; i < processArray.length; i++) {
			fillGaps();

			bar.addItem(processArray[i].processName, processArray[i].burstTime);

			processArray[i].finished();
		}




	}
	function SJF() {
		sortArriveTimes();

		while (isDone() == false) {

			fillGaps();

			var i = findSmallestBurstIndex();

			bar.addItem(processArray[i].processName, processArray[i].burstTime);

			processArray[i].finished();

		}

	}

	//Shortes Remaining Job First algorithm
	function SRJF() {


		function findNextJump(proccessIndex) {
			var interruptFound = false;

			for (var i = 0; i < processArray.length; i++) {
				if (processArray[i].done == false
					&& processArray[i].arrivalTime < position + processArray[proccessIndex].burstTime
					&& processArray[i].arrivalTime > processArray[proccessIndex].arrivalTime
					&& processArray[i].burstTime < processArray[proccessIndex].burstTime
					&& i != proccessIndex
					&& processArray[i].hasStarted == false) {
					// console.log("interupted by:"+processArray[i].processName);
					processArray[proccessIndex].burstTime -= processArray[i].arrivalTime - position;
					bar.addItem(processArray[proccessIndex].processName, processArray[i].arrivalTime - position);
					processArray[proccessIndex].hasStarted = true;
					interruptFound = true;
					break;
				}


			}

			if (interruptFound == false) {
				bar.addItem(processArray[proccessIndex].processName, processArray[proccessIndex].burstTime);
				processArray[proccessIndex].finished();
			}

		}

		sortArriveTimes();
		while (isDone() == false) {


			fillGaps();

			var i = findSmallestBurstIndex();

			// console.log("starting:"+processArray[i].processName);

			findNextJump(i);





		}

	}

	function priority() {

		function findNextJump(proccessIndex) {
			var interruptFound = false;

			for (var i = 0; i < processArray.length; i++) {
				if (processArray[i].done == false
					&& processArray[i].arrivalTime < position + processArray[proccessIndex].burstTime
					&& processArray[i].arrivalTime > processArray[proccessIndex].arrivalTime
					&& processArray[i].priority < processArray[proccessIndex].priority
					&& i != proccessIndex
					&& processArray[i].hasStarted == false) {
					// console.log("interupted by:"+processArray[i].processName);
					processArray[proccessIndex].burstTime -= processArray[i].arrivalTime - position;
					bar.addItem(processArray[proccessIndex].processName, processArray[i].arrivalTime - position);
					processArray[proccessIndex].hasStarted = true;
					interruptFound = true;
					break;
				}


			}

			if (interruptFound == false) {
				bar.addItem(processArray[proccessIndex].processName, processArray[proccessIndex].burstTime);
				processArray[proccessIndex].finished();
			}

		}

		sortArriveTimes();
		while (isDone() == false) {


			fillGaps();

			var i = findSmallestPriorityIndex();

			// console.log("starting:"+processArray[i].processName);

			findNextJump(i);





		}

	}

	function roundRobin() {


		function findNextJump(index) {



			while (true) {

				if (processArray[index].burstTime <= timeQuantum
					&& processArray[index].done == false
					&& processArray[index].arrivalTime <= position) {
					bar.addItem(processArray[index].processName, processArray[index].burstTime);
					processArray[index].finished();

					// console.log("finished:"+processArray[index].processName + "  postion:"+position);
					index = (index + 1) % processArray.length
					return index;
					break;
				}

				if (processArray[index].done == false
					&& processArray[index].arrivalTime <= position
					&& processArray[index].burstTime > timeQuantum) {
					// console.log("switched to:"+processArray[index].processName);
					processArray[index].burstTime -= timeQuantum;
					bar.addItem(processArray[index].processName, timeQuantum);




				}

				index = (index + 1) % processArray.length




			}




		}

		var i = 0;

		sortArriveTimes();
		while (isDone() == false) {

			fillGaps();

			// console.log("starting:"+processArray[i].processName);

			i = findNextJump(i);

		}
	}


	function run() {
		loadValues();

		

		Selectedalgorithm = algorithm;

		if (processArray.length > 0) {

			sortArriveTimes();
			position = 0;


			bar = new progressBar();

			if (algorithm == "FCFS") {
				$("#algorithm_explanation").text("First Come First Served will execute proccesses in the order in which they arrived");
				FCFS();
				processTotal = processArray;
			}

			else if (algorithm == "SJF") {
				$("#algorithm_explanation").text("Shortest Job First will execute proccesses from smallest to biggest");
				SJF();
				processTotal = processArray;
			}

			else if (algorithm == "SRJF") {
				SRJF();
				$("#algorithm_explanation").text("Shortest Remaining Job First will execute proccesses from smallest to biggest. If a new proccess arrives that is smaller than the currently running proccess, it will interrupt it.");
				processTotal = processArray;
			}

			else if (algorithm == "Round Robin") {
				$("#algorithm_explanation").text("Round Robin will execute each proccess for the duration of the time quantum. It will then move on to the next proccess. ");
				roundRobin();
				processTotal = processArray;
				tq = timeQuantum;
			}



			if (algorithm == "Priority") {
				$(".priority").collapse("show");
				$("#algorithm_explanation").text("Priority Scheduling will execute each process according to the assigned priority. In this case a lower priority number is better.");
				priority();
				processTotal = processArray;
			}

			bar.displayBar();
		}


	}


	//creates the tick marks under the gant chart
	function createRuler(itemAmount) {

		var multi = 1;
		var word = " " + itemAmount;

		if (itemAmount > 5000) {
			// console.log("length:"+word.length)
			var power = Math.pow(10, word.length - 2);
			itemAmount = itemAmount / power;
			multi = power;
		}


		else if (itemAmount > 2500) {
			itemAmount = itemAmount / 100;
			multi = 100;
		}

		else if (itemAmount > 1000) {
			itemAmount = itemAmount / 50;
			multi = 50;
		}

		else if (itemAmount > 500) {
			itemAmount = itemAmount / 25;
			multi = 25;
		}


		else if (itemAmount > 100) {
			itemAmount = itemAmount / 10;
			multi = 10;
		}

		else if (itemAmount > 50) {
			itemAmount = itemAmount / 5;
			multi = 5;
		}


		for (var j = 0; j < itemAmount; j++) {
			var ruler = $("#rule2").empty();
			var len = Number(itemAmount) || 0;


			// add text

			var item = $(document.createElement("li"));
			$(item).addClass("zero");
			ruler.append(item.text(0));

			for (var i = 0; i < len; i++) {
				var item = $(document.createElement("li"));
				ruler.append(item.text(((i + 1) * multi)));
			}


		}


		var width = $(".progress").width();

		var spacing = (width / itemAmount) + "px";
		$(".ruler").css("padding-right", spacing).find("li").css("padding-left", spacing);
		$(".zero").css("padding-left", 0);
		$(".zero").css("padding-right", "0.5px");

	}

	function storeValue() {



	};


	/*
	****************************************************************
						All the click event listeners
	****************************************************************
	*/

	$('#add_row').click(function () {
		processCount++;
		$("#row_" + processCount).collapse("show");

		$('#remove_row').prop("disabled", false);
		if (processCount == 10) {
			$('#add_row').prop("disabled", true);
		}

		run();
		$('#proccess_num').val(processCount);
	});

	//removing a row
	$('#remove_row').click(function () {

		$("#row_" + processCount).collapse("hide");
		processCount--;

		$('#add_row').prop("disabled", false);
		if (processCount == 1) {
			$('#remove_row').prop("disabled", true);
		}
		run();
		$('#proccess_num').val(processCount);
	});


	$('#subtract_context').click(function () {

		if (contexSwitch >= 0.1) {
			contexSwitch -= 0.1;
			contexSwitch = parseFloat(contexSwitch.toPrecision(12));
		}


		run();
		$('#enter_context').val(contexSwitch);
	});


	$('#add_context').click(function () {


		contexSwitch += 0.1;
		contexSwitch = parseFloat(contexSwitch.toPrecision(12));
		run();
		$('#enter_context').val(contexSwitch);

	});

	$('#subtract_quantum').click(function () {

		if (timeQuantum > 0.5) {
			timeQuantum -= 0.5;
			timeQuantum = parseFloat(timeQuantum.toPrecision(12));
		}

		run();
		$('#enter_quantum').val(timeQuantum);
	});


	$('#add_quantum').click(function () {

		timeQuantum += 0.5;
		timeQuantum = parseFloat(timeQuantum.toPrecision(12));

		run();
		$('#enter_quantum').val(timeQuantum);

	});


	// when you enter a quantum time, used for Round Robin
	$('#enter_quantum').on('input propertychange paste', function () {

		if (isNaN($(this).val()) == false && $(this).val() != 0) {
			timeQuantum = Number($(this).val());
		}

		run();
	});

	//when you set a context switch time
	$('#enter_context').on('input propertychange paste', function () {

		if (isNaN($(this).val()) == false) {
			contexSwitch = Number($(this).val());
		}
		run();
	});

	//when you input a value into the table
	$('td input').on('input propertychange paste', function () {
		run();

	});



	//when you click on the algorithm dropdown
	$(".algorithm_dropdown li a").click(function () {
		$("#algorithm_button").html($(this).attr("calcStyle") + ' <span class="caret">');
		algorithm = $(this).attr("calcStyle");

		if (algorithm == "Round Robin") {
			$("#solver_group").removeClass("hidden");
		}
		else {
			$("#solver_group").addClass("hidden");
		}

		if (algorithm != "Priority") {
			$(".priority").collapse("hide");
		}

		run();

	})



	$(window).resize(function () {
		createRuler(bar.sum);
	});

	// console.log(mainOutput.o_pid.splice(0,Math.ceil(mainOutput.o_pid.length/2)));

});


var chartdiv = document.getElementById('chartdiv');
chartdiv.style.display = "none";

$(".runButton").click(function () {

	//Run button property change
	var runbtn = document.getElementById('runBtn');
	runbtn.disabled = true;
	runbtn.style.background = 'grey';
	runbtn.style.cursor = 'not-allowed';


	let tat = 0;
	let totalProcess = processTotal.length;
	// mainOutput.algorithm = processTotal.algorithm;
	// console.log(Selectedalgorithm);
	
	mainOutput.quantum = tq;

	for (let i = 0; i < totalProcess; i++) {
		mainOutput.o_pid[i] = processTotal[i].processName;
		mainOutput.o_arrivaltime[i] = processTotal[i].arrivalTime;
		mainOutput.o_bursttime[i] = processTotal[i].burstTime;
		mainOutput.completionTime[i] = processTotal[i].finishTime;
		mainOutput.o_priority[i] = processTotal[i].priority;
		mainOutput.turnAroundTime[i] = (processTotal[i].finishTime - processTotal[i].arrivalTime);
		tat = tat + mainOutput.turnAroundTime[i];
	}

	mainOutput.avgtat = parseFloat((tat / totalProcess).toFixed(2));

	//changing the display property from "none" to "flex" of chart section.
	chartdiv.style.display = "flex";

	//creating a dynamic table and displaying it on front-end
	var final_table = document.getElementById('outputTable');

	for (let j = 0; j < totalProcess; j++) {

		var row = final_table.insertRow(-1);
		var cell2 = row.insertCell(0);
		var cell1 = row.insertCell(1);
		var cell3 = row.insertCell(2);
		var cell4 = row.insertCell(3);
		var cell5 = row.insertCell(4);
		var cell6 = row.insertCell(5);

		cell1.innerHTML = mainOutput.o_arrivaltime[j];
		cell2.innerHTML = mainOutput.o_pid[j];
		cell3.innerHTML = mainOutput.o_bursttime[j];
		cell4.innerHTML = mainOutput.completionTime[j];
		cell5.innerHTML = mainOutput.turnAroundTime[j];
		cell6.innerHTML = mainOutput.waitingTime[j];
	}


	//Section for the Bar chart...
	const myBarChart = new Chart(
		document.getElementById('myBarChart'), {
		type: 'bar',
		data: {
			labels: mainOutput.o_pid,
			datasets: [{
				label: 'burst time',
				data: mainOutput.o_bursttime,
				backgroundColor: [
					'#58508d',
				],
				borderColor: [
					'rgba(176,162,247,1)',
				],
				borderWidth: 1
			},
			{
				label: 'Waiting Time',
				data: mainOutput.waitingTime,
				backgroundColor: [
					'#ff6361',
				],
				borderColor: [
					'rgba(176,162,247,1)',
				],
				borderWidth: 1
			},
			{
				label: 'turn around time',
				data: mainOutput.turnAroundTime,
				backgroundColor: [
					'#ffa600',
				],
				borderColor: [
					'rgba(176,162,247,1)',
				],
				borderWidth: 1
			}
			]
		},
		options: {
			scales: {
				y: {
					beginAtZero: true
				}
			}
		},
	}
	);

	//........................................................Section : 3(IV) : Code for displaying pie chart.........................................
	// section for the pie chart for Waiting time...
	const myChart = new Chart(
		document.getElementById('myChart'), {
		type: 'pie',
		data: {
			labels: mainOutput.o_pid,
			datasets: [{
				label: 'Waiting Time',
				data: mainOutput.waitingTime,
				backgroundColor: [
					'#003f5c',
					'#58508d',
					'#ff6361',
					'#ffa600',
					'#77C2FE',
					'#bc5090',
					'#0b9a8d',
					'#E65F8E',
					'#323B81',
					'#9c2162',

				],
				borderColor: [
					'rgba(176,162,247,1)',
					'rgba(55,227,128,1)',
					'rgba(255, 26, 104, 1)',
					'rgba(0,207,255,1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)',
					'rgba(0, 0, 0, 1)',
				],
				borderWidth: 1
			}]
		},
		options: {
			plugins: {
				datalabels: {
					color: 'white',
				}
			}
		},
		plugins: [ChartDataLabels],
	}
	);


	// section for the pie chart for Turn around time...
	const mytatChart = new Chart(
		document.getElementById('mytatChart'), {
		type: 'pie',
		data: {
			labels: mainOutput.o_pid,
			datasets: [{
				label: 'Turn around Time',
				data: mainOutput.turnAroundTime,
				backgroundColor: [
					'#003f5c',
					'#58508d',
					'#ff6361',
					'#ffa600',
					'#77C2FE',
					'#bc5090',
					'#0b9a8d',
					'#E65F8E',
					'#323B81',
					'#9c2162',
				],
				borderColor: [
					'rgba(176,162,247,1)',
					'rgba(55,227,128,1)',
					'rgba(255, 26, 104, 1)',
					'rgba(0,207,255,1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)',
					'rgba(0, 0, 0, 1)',
				],
				borderWidth: 1
			}]
		},
		options: {
			plugins: {
				datalabels: {
					color: 'white',
				}
			}
		},
		plugins: [ChartDataLabels],
	}
	);


	let cpuUtilization = document.getElementById("utilization");
	cpuUtilization.innerHTML = `${mainOutput.utilization}%`;

	let avgwt = document.getElementById("avgwt");
	avgwt.innerHTML = mainOutput.avgWait;

	let avgtat = document.getElementById("avgtat");
	avgtat.innerHTML = mainOutput.avgtat;


});



var explain = document.getElementById('ex');
explain.style.display = "none";

$("#explanation").click(function (){

	explain.style.display = "block";

	var inputdata = document.getElementById('input');
	var steps = document.getElementById('steps');

	inputdata.innerHTML += '  <span>Process Id :  '+ mainOutput.o_pid
	+'</span></br><span>Arrival Time : '+ mainOutput.o_arrivaltime +'</span></br><span>Burst Time :  '+ mainOutput.o_bursttime +'</sp>';

	steps.innerHTML += '<span><span class="step">Step 1 </span> : Sort all Process using Arrival Time </span></br><span>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Arrival Time : '+ mainOutput.o_arrivaltime.sort(function(a,b){return a-b}) +'</span>';

	if(Selectedalgorithm == 'FCFS'){
		steps.innerHTML += '</br></br><span><span class="step">Step 2 </span> : Arrival Time Sorting is done. Now Processes will be scheduled as per thier arrival time.</span></br></br><span><span class="step">Step 3 </span> : Now We will calculate Turn around Time. We know that, </br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp TurnAround Time = Completion Time - Arrival Time</span></br><span></br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp So,</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspTurnaround Time : '+ mainOutput.turnAroundTime +'</span></br></br> <span><span class="step">Step 4 </span> : Now We will calculate Waiting Time. We know that, </br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Waiting Time = Turn around Time - Burst Time</span></br><span></br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp So,</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Waiting Time : '+ mainOutput.waitingTime +'</span>';
	}

	else if(Selectedalgorithm == 'SJF'){
		steps.innerHTML += '</br></br><span><span class="step">Step 2 </span>: Arrival Time Sorting is done. Now We will sort the processes according to thier burst time to select Shortest Job first</span></br><span>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Burst Time : '+ mainOutput.o_bursttime.sort(function(a,b){return a-b}) + '</span>' +  '</br></br><span> <span class="step">Step 3 </span>: Burst time sorting is done. Now processes will be scheduled as per thier burst time. Now We will calculate Turn around Time. We know that, </br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp TurnAround Time = Completion Time - Arrival Time</span></br><span></br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp So,</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspTurnaround Time : '+ mainOutput.turnAroundTime +'</span></br></br> <span><span class="step">Step 4 </span> : Now We will calculate Waiting Time. We know that, </br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Waiting Time = Turn around Time - Burst Time</span></br><span></br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp So,</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Waiting Time : '+ mainOutput.waitingTime +'</span>';
	}

	else if(Selectedalgorithm == 'Priority'){
		steps.innerHTML += '</br></br><span><span class="step">Step 2 </span> : Arrival Time Sorting is done. Now We will sort the processes according to thier Priority to select highest priority process first.</span></br><span>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Priority : '+ mainOutput.o_priority.sort(function(a,b){return a-b}) + '</span>' +  '</br></br><span><span class="step">Step 3 </span> :  Sorting is done for priority. Now processes will be scheduled as per thier priority. Now We will calculate Turn around Time. We know that, </br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp TurnAround Time = Completion Time - Arrival Time</span></br><span></br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp So,</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspTurnaround Time : '+ mainOutput.turnAroundTime +'</span></br></br> <span><span class="step">Step 4 </span> : Now We will calculate Waiting Time. We know that, </br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Waiting Time = Turn around Time - Burst Time</span></br><span></br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp So,</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Waiting Time : '+ mainOutput.waitingTime +'</span>';
	}

	else if(Selectedalgorithm == 'Round Robin'){
		steps.innerHTML += '</br></br><span><span class="step">Step 2 </span> : Arrival Time Sorting is done. Now We will select the process one by one and allocate cpu to the process for selected time which is equals to Time Quantum.</br> Here Time Quantum is :  '+ mainOutput.quantum + '</br></br><span class="step">Step 3 </span>: Processes will get cpu like this :</br> &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp P1 -> '+mainOutput.quantum + '  || P2 -> '+mainOutput.quantum +'  || P3 -> '+mainOutput.quantum +' and so on....'+'</br></br><span><span class="step">Step 4 </span> : Now We will calculate Turn around Time. We know that, </br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp TurnAround Time = Completion Time - Arrival Time</span></br><span></br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp So,</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspTurnaround Time : '+ mainOutput.turnAroundTime +'</span></br></br> <span><span class="step">Step 5 </span> : Now We will calculate Waiting Time. We know that, </br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Waiting Time = Turn around Time - Burst Time</span></br><span></br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp So,</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Waiting Time : '+ mainOutput.waitingTime +'</span>';
	}

	else if(Selectedalgorithm == 'SRJF'){
		steps.innerHTML += '</br></br><span><span class="step">Step 2 </span> : Arrival Time Sorting is done. Now We will sort the processes according to thier burst time to select Shortest Job first</span></br><span>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Burst Time : '+ mainOutput.o_bursttime.sort(function(a,b){return a-b}) + '</span>' +  '</br></br><span><span class="step">Step 3 </span> : Here We are checking the burst time after each unit of time. If we find any process which has less burst time than current process then we allocate the cpu to that process.</br></br><span class="step">Step 4 </span> : Now We will calculate Turn around Time. We know that, </br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp TurnAround Time = Completion Time - Arrival Time</span></br><span></br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp So,</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspTurnaround Time : '+ mainOutput.turnAroundTime +'</span></br></br> <span><span class="step">Step 5 </span> : Now We will calculate Waiting Time. We know that, </br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Waiting Time = Turn around Time - Burst Time</span></br><span></br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp So,</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Waiting Time : '+ mainOutput.waitingTime +'</span>';
	}


});
