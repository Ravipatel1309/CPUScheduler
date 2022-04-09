
//........................................................Section : 1 : all class related to Input and Output Property.........................................
//combining all properties related to input section
class Input {
  constructor() {
    this.pid = [];  //For process id
    this.arrivalTime = [];  //Array for arrival time
    this.burstTime = [];  //for burst time
    this.priority = [];   //for storing priority
    this.timeQuantum = 0; //for timeQuantum
    this.algorithm = "";  //For algorithm type
  }
}

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
  }
}

let process = 3;

//creating an object for Input and Output Class..
let mainInput = new Input();
let mainOutput = new Output();
var table = document.getElementById("inputTable");
var total = 10;
var qu = 0;
var flag = 0;


//........................................................Section : 2 : Handling all event listner .........................................

var chartdiv = document.getElementById('chartdiv');
chartdiv.style.display = "none";

document.querySelector(".minusbtn").onclick = () => {
  process = process - 1;
  flag = 1;
}

document.querySelector(".plusbtn").onclick = () => {
  process = process + 1;
}


//........................................................Section : 3 : Implementation of Run function.........................................
const run = () => {

  //Run button property change
  var runbtn = document.getElementById('runBtn');
  runbtn.disabled = true;
  runbtn.style.background = 'grey';
  runbtn.style.cursor = 'not-allowed';

  //removing previously stored elements 
  mainOutput.o_bursttime.length = 0;
  mainOutput.o_arrivaltime.length = 0;
  mainOutput.o_pid.length = 0;


  //....................................Section : 3 (I) : Implementation of getting Input from the table and storing it into array.........................
  // O(n) time complexity to store the value into input array
  //Storing all the values in arrays
  for (let i = 0; i < total; i++) {

    //Storing the value of arrival time and burst time in at and bt respectively.
    let at = document.getElementById(`arrive_${i + 1}`).value;
    let bt = document.getElementById(`burst_${i + 1}`).value;
    let id = i + 1;
    let prior = document.getElementById(`priority_${i + 1}`).value;

    if (at < 0 && bt < 0)
      alert("Please enter valid Input...");
    else if (bt > 0) {

      mainInput.arrivalTime.push(parseInt(at));
      mainInput.burstTime.push(parseInt(bt));
      mainInput.pid.push(parseInt(id));
      mainInput.priority.push(parseInt(prior));
    }
  }

  //for removing default process data
  if (flag == 1) {
    mainInput.burstTime.splice(-1);
    mainInput.pid.splice(-1);
    mainInput.arrivalTime.splice(-1);
  }

  //changing the display property from "none" to "flex" of chart section.
  chartdiv.style.display = "flex";

  //calling a function for particular algorithm.
  // const fc = new FCFS(mainInput.arrivalTime, mainInput.burstTime, mainInput.pid);

  const fc = new sjf();
 

  //........................................................Section : 3(II) : Code for storing value into output array.........................................
  //creating a dynamic table and displaying it on front-end
  var final_table = document.getElementById('outputTable');

  for (let j = 0; j < mainInput.pid.length; j++) {

    var row = final_table.insertRow(-1);
    var cell2 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var cell6 = row.insertCell(5);

    cell1.innerHTML = mainOutput.o_arrivaltime[j];
    cell2.innerHTML = `P${mainOutput.o_pid[j]}`;
    cell3.innerHTML = mainOutput.o_bursttime[j];
    cell4.innerHTML = mainOutput.completionTime[j];
    cell5.innerHTML = mainOutput.turnAroundTime[j];
    cell6.innerHTML = mainOutput.waitingTime[j];
  }



  //........................................................Section : 3(III) : Code for dislaying Bar chart.........................................
  //creating an array of process id in "Pi" format. 
  var myChartLabelArray = mainOutput.o_pid;
  myChartLabelArray = myChartLabelArray.map(i => 'P' + i);


  //Section for the Bar chart...
  const myBarChart = new Chart(
    document.getElementById('myBarChart'), {
    type: 'bar',
    data: {
      labels: myChartLabelArray,
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
      labels: myChartLabelArray,
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
      labels: myChartLabelArray,
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


}


//function for deleting row
function deleterow() {
  var final_table = document.getElementById('outputTable');

  var rowCount = final_table.rows.length;
  for (var i = rowCount - 1; i > 0; i--) {
    final_table.deleteRow(i);
  }
}


//........................................................Section : 4 : Code for First come first serve algorithm.........................................
//function for FCFS Algorithm...
function FCFS(arrivalTime, burstTime, processID) {

  let objCollection = [];

  ////Time Complexity = O(n^2*logn) where n = number of process
  //Making an object to be sorted later.
  for (var x = 0; x < arrivalTime.length; x++)
    objCollection.push({ A: arrivalTime[x], B: burstTime[x], C: processID[x] });

  //Sorting begins with its corresponding Arrival Time and Burst Time
  //No interchanging of partner happens
  objCollection.sort(function (a, b) {
    return a.A - b.A;
  });


  for (var x = 0; x < objCollection.length; x++) {
    //pushing to array AT and BT for later purposes.
    mainOutput.o_arrivaltime.push(objCollection[x].A);
    mainOutput.o_bursttime.push(objCollection[x].B);
    mainOutput.o_pid.push(objCollection[x].C);

    findWaitingTime(mainInput, mainOutput);
    findTurnAroundTime(mainInput, mainOutput);
    averagetime();
  }


}


//........................................................Section : 5 : code to find waiting time.........................................
function findWaitingTime() {

  var service_time = Array.from({ length: mainInput.arrivalTime.length }, (_, i) => 0);
  service_time[0] = mainOutput.o_arrivaltime[0];
  mainOutput.waitingTime[0] = 0;

  //Time Complexity = O(n) where n = number of process
  // calculating waiting time
  for (var i = 1; i < mainInput.arrivalTime.length; i++) {
    //representing wasted time 
    var wasted = 0;
    // Add burst time of previous processes
    service_time[i] = service_time[i - 1] + mainOutput.o_bursttime[i - 1];

    // Find waiting time for current process =
    // sum - at[i]
    mainOutput.waitingTime[i] = service_time[i] - mainOutput.o_arrivaltime[i];

    // If waiting time for a process is in negative
    // that means it is already in the ready queue
    // before CPU becomes idle so its waiting time is 0
    // wasted time is basically time for process to
    // wait after a process is over
    if (mainOutput.waitingTime[i] < 0) {
      wasted = Math.abs(mainOutput.waitingTime[i]);
      mainOutput.waitingTime[i] = 0;
    }
    // Add wasted time
    service_time[i] = service_time[i] + wasted;
  }
}



//........................................................Section : 6 : Code to find Turn around time.........................................
function findTurnAroundTime() {

  //Time Complexity = O(n) where n = number of process
  // Calculating turnaround time by adding bt[i] + wt[i]
  for (var i = 0; i < mainInput.arrivalTime.length; i++) {
    mainOutput.turnAroundTime[i] = mainOutput.o_bursttime[i] + mainOutput.waitingTime[i];
    mainOutput.completionTime[i] = mainOutput.turnAroundTime[i] + mainOutput.o_arrivaltime[i];
  }
}



//........................................................Section : 7 : Code to find Average time.........................................
var avg_waitingtime = 0;
var avg_tat = 0;
function averagetime() {
  for (let i = 0; i < mainOutput.waitingTime.length; i++) {
    avg_waitingtime = + mainOutput.waitingTime[i];
    avg_tat = + mainOutput.turnAroundTime[i];
  }
  let avgwt = document.getElementById("avgwt");
  avgwt.innerHTML = avg_waitingtime;

  let avgtat = document.getElementById("avgtat");
  avgtat.innerHTML = avg_tat;
}


//........................................................Section : 8 : Code for sjf Algorithm.........................................
// JavaScript program for implementation of SJF


function sjf() {

  //sorting using arrival time
  let objCollection = [];

  ////Time Complexity = O(nlogn) where n = number of process
  //Making an object to be sorted later.
  for (var x = 0; x < arrivalTime.length; x++)
    objCollection.push({ A: arrivalTime[x], B: burstTime[x], C: processID[x] });

  //Sorting begins with its corresponding Arrival Time and Burst Time
  //No interchanging of partner happens
  objCollection.sort(function (a, b) {
    return a.A - b.A;
  });


  //sorting of burst time
  for (let i = 0; i < n; i++) {  //time complexity for this loop is O(n)
    pos = i;
    for (let j = i + 1; j < n; j++) {  //time complexity for this loop is O(n)
      if (burstTime[j] < burstTime[pos]) {
        pos = j;
      }
    }

    // Total time complexity is O(n^2) where n is the number of processes
    //swapping for burst time
    temp = burstTime[i];
    burstTime[i] = burstTime[pos];
    burstTime[pos] = temp;

    //swapping for process id
    temp = p[i];
    p[i] = p[pos];
    p[pos] = temp;

  }

  // calling function for the calculating waiting time, turn around time and their average 
  findWaitingTime();
  findTurnAroundTime();
  averagetime();
}


//........................................................Section : 8 : Code for sPriority Algorithm.........................................


// Javascript program for implementation of priority
function priority(arrivalTime, burstTime, processID, priority) {


  //sorting using arrival time
  let objCollection = [];

  ////Time Complexity = O(nlogn) where n = number of process
  //Making an object to be sorted later.
  for (var x = 0; x < arrivalTime.length; x++)
    objCollection.push({ A: arrivalTime[x], B: burstTime[x], C: processID[x], D: priority[x] });

  //Time Complexity = O(nLogn)
  //Sorting begins with its corresponding Arrival Time and Burst Time
  //No interchanging of partner happens
  objCollection.sort(function (a, b) {
    return a.A - b.A;
  });

  //sorting of priority
  for (let i = 0; i < n; i++) {  //time complexity for this loop is O(n)
    pos = i;
    for (let j = i + 1; j < n; j++) {  //time complexity for this loop is O(n)
      if (priority[j] < priority[pos]) {
        pos = j;
      }
    }

    // Total time complexity is O(n^2) where n is the number of processes
    //swapping for Priority of the process
    temp = priority[i];
    priority[i] = priority[pos];
    priority[pos] = temp;


    //swapping for burst time
    temp = burstTime[i];
    burstTime[i] = burstTime[pos];
    burstTime[pos] = temp;

    //swapping for arrival time
    temp = arrivalTime[i];
    arrivalTime[i] = arrivalTime[pos];
    arrivalTime[pos] = temp;

    //swapping for process id
    temp = p[i];
    p[i] = p[pos];
    p[pos] = temp;


    // Storing the results in the mainOutput array
    mainOutput.o_arrivaltime = objCollection.arrivalTime;
    mainOutput.o_bursttime = objCollection.burstTime;
    mainOutput.o_pid = objCollection.processID;
    mainOutput.o_priority = objCollection.priority;
  }

  // calling function for the calculating waiting time, turn around time and their average 
  findWaitingTime();
  findTurnAroundTime();
  averagetime();

}