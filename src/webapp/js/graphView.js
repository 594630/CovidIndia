
Chart.defaults.font.size = 18;
Chart.defaults.font.family = 'Roboto, sans-serif';

//customElements.define('my-graph', Graph);

const minURL = 'https://data.covid19india.org/v4/min/data.min.json';
const timeseriesURL = 'https://data.covid19india.org/v4/min/timeseries.min.json';


let minData = [];
let timeseriesData = [];
let states = {};
let dates = {};
async function fetchData() {
    const response = await fetch(minURL);
    minData = await response.json();
    states = Object.keys(minData);

    const response2 = await fetch(timeseriesURL);
    timeseriesData = await response2.json();
    dates = Object.keys(timeseriesData['TT'].dates);
}
await fetchData();

const form = document.getElementById("form");
form.classList.add("flex-container-vertical");

const chartContainer = document.createElement("div");
chartContainer.classList.add("flex-chart-container");
form.appendChild(chartContainer);

const barCanvas = document.createElement("canvas");
barCanvas.classList.add( "flex-chart");
const ctxBar = barCanvas.getContext('2d');
chartContainer.appendChild(barCanvas);

const pieCanvas = document.createElement("canvas");
pieCanvas.classList.add("flex-chart");
const ctxPie = pieCanvas.getContext('2d');
chartContainer.appendChild(pieCanvas);

const fieldset1 =  document.createElement("fieldset1");
fieldset1.classList.add("flex-container-horizontal-center");
form.appendChild(fieldset1);

const fieldset2 =  document.createElement("fieldset2");
fieldset2.classList.add("flex-container-horizontal-around");
form.appendChild(fieldset2);

const btnCurrentDay = document.createElement('button');
btnCurrentDay.innerText = 'Current Day';
btnCurrentDay.classList.add("button-61");
btnCurrentDay.addEventListener('click', currentDay);
fieldset1.appendChild(btnCurrentDay);

const btnOverTime = document.createElement('button');
btnOverTime.innerText = 'Over Time';
btnOverTime .classList.add("button-61");
btnOverTime .addEventListener('click', overTime);
fieldset1.appendChild(btnOverTime );

const btnTotal = document.createElement('button');
btnTotal.innerText = 'Total';
btnTotal.classList.add("button-61");
btnTotal.addEventListener('click', total);
fieldset2.appendChild(btnTotal);

const btnDelta = document.createElement('button');
btnDelta.classList.add("button-61");
btnDelta.innerText = 'Daily';
btnDelta.addEventListener('click', delta);
fieldset2.appendChild(btnDelta);

const btnDelta7 = document.createElement('button');
btnDelta7.classList.add("button-61");
btnDelta7.innerText = '7 day average';
btnDelta7.addEventListener('click', delta7);
fieldset2.appendChild(btnDelta7);

const daterange = document.createElement('input', {type:"text"});
daterange.classList.add("flex-daterange");
daterange.type = "text";
daterange.name = "daterange";
daterange.innerHTML = ""
fieldset2.appendChild(daterange);


let barChart = new Chart(ctxBar);
let pieChart = new Chart(ctxPie);
function sumMap(m){
    let sum = 0;
    m.forEach(value => {
        sum += value;
    });
    return sum;
}

let dataSetSelected = 0;
let dataKeySelected = 0;

function delta(){
    event?.preventDefault();
    dataKeySelected = 2;
    if(dataSetSelected === 0){
        chartCurrentDelta();
    } else {
        chartTimeRangeTotal(dates);
    }
}
function delta7(){
    event?.preventDefault();
    dataKeySelected = 1;
    if(dataSetSelected === 0){
        chartCurrentDelta7();
    } else {
        chartTimeRangeDelta7(dates);
    }
}
function total(){
    event?.preventDefault();
    dataKeySelected = 0;
    if(dataSetSelected === 0){
        chartCurrentTotal();
    } else {
        chartTimeRangeDelta(dates);
    }
}

function currentDay(){
    event?.preventDefault();
    dataSetSelected = 0;
    if (dataKeySelected === 0){
        chartCurrentTotal();
    } else if(dataKeySelected === 1) {
        chartCurrentDelta7();
    } else {
        chartTimeRangeDelta();
    }
}

function overTime(){
    event?.preventDefault();
    dataSetSelected = 1;
    if (dataKeySelected === 0){
        chartTimeRangeTotal(dates);
    } else if(dataKeySelected === 1) {
        chartTimeRangeDelta7(dates);
    } else {
        chartTimeRangeDelta(dates);
    }
}



function chartCurrentTotal(){
    barTotal();
    pieTotal();
}

function chartCurrentDelta(){
    barDelta();
    pieDelta();
}

function chartCurrentDelta7(){
    barDelta7();
    pieDelta7();
}

$(function rangePicked() {
    event?.preventDefault();
    dataSetSelected = 1;
    $('input[name="daterange"]').daterangepicker({
        "locale": {
            "format": "YYYY/MM/DD",
            "separator": " - ",
            "applyLabel": "Apply",
            "cancelLabel": "Cancel",
            "fromLabel": "From",
            "toLabel": "To",
            "weekLabel": "W",
            "firstDay": 1
        },
        "startDate": "2020/01/01",
        "endDate": "2023/11/29"
    }, function (start, end) {
        chartTimeseries(start, end);
    });
})


function chartTimeseries(start, end){

    const dates = Object.keys(timeseriesData['TT'].dates).filter(date => {
        const currentDate = new Date(date);
        return currentDate >= start && currentDate <= end;
    });

    chartTimeRangeTotal(dates);
}
function chartTimeRangeDelta(dates){
    let dataMap = new Map();

    const confirmedCases = dates.map(date => timeseriesData['TT'].dates[date].delta?.confirmed ?? 0);
    dataMap.set("Confirmed", confirmedCases);

    const recoveredCases = dates.map(date => timeseriesData['TT'].dates[date].delta?.recovered ?? 0);
    dataMap.set("Recovered", recoveredCases);

    const deceasedCases = dates.map(date => timeseriesData['TT'].dates[date].delta?.deceased ?? 0);
    dataMap.set("Deceased", deceasedCases);

    const testedCases = dates.map(date => timeseriesData['TT'].dates[date].delta?.tested ?? 0);
    dataMap.set("Tested", testedCases);

    const vaccinatedCases = dates.map(date => timeseriesData['TT'].dates[date].delta?.vaccinated ?? 0);
    dataMap.set("Vaccinated", vaccinatedCases);

    lineChart(dataMap,dates);
}

function chartTimeRangeDelta7(dates){
    let dataMap = new Map();

    const confirmedCases = dates.map(date => timeseriesData['TT'].dates[date].delta7?.confirmed ?? 0);
    dataMap.set("Confirmed", confirmedCases);

    const recoveredCases = dates.map(date => timeseriesData['TT'].dates[date].delta7?.recovered ?? 0);
    dataMap.set("Recovered", recoveredCases);

    const deceasedCases = dates.map(date => timeseriesData['TT'].dates[date].delta7?.deceased ?? 0);
    dataMap.set("Deceased", deceasedCases);

    const testedCases = dates.map(date => timeseriesData['TT'].dates[date].delta7?.tested ?? 0);
    dataMap.set("Tested", testedCases);

    const vaccinatedCases = dates.map(date => timeseriesData['TT'].dates[date].delta7?.vaccinated ?? 0);
    dataMap.set("Vaccinated", vaccinatedCases);

    lineChart(dataMap,dates);
}

function chartTimeRangeTotal(dates){
    let dataMap = new Map();

    const confirmedCases = dates.map(date => timeseriesData['TT'].dates[date].total?.confirmed ?? 0);
    dataMap.set("Confirmed", confirmedCases);

    const recoveredCases = dates.map(date => timeseriesData['TT'].dates[date].total?.recovered ?? 0);
    dataMap.set("Recovered", recoveredCases);

    const deceasedCases = dates.map(date => timeseriesData['TT'].dates[date].total?.deceased ?? 0);
    dataMap.set("Deceased", deceasedCases);

    const testedCases = dates.map(date => timeseriesData['TT'].dates[date].total?.tested ?? 0);
    dataMap.set("Tested", testedCases);

    const vaccinatedCases = dates.map(date => timeseriesData['TT'].dates[date].total?.vaccinated ?? 0);
    dataMap.set("Vaccinated", vaccinatedCases);

    lineChart(dataMap,dates);
}
function lineChart(dataMap,dates){

    barChart.destroy();
    pieChart.destroy();
    barChart = new Chart(ctxBar, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Confirmed',
                data: Array.from(dataMap.get("Confirmed")),
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2
            }, {
                label: 'Recovered',
                data: Array.from(dataMap.get("Recovered")),
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }, {
                label: 'Deceased',
                data: Array.from(dataMap.get("Deceased")),
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 2
            }, {
                label: 'Tested',
                data: Array.from(dataMap.get("Tested")),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }, {
                label: 'Vaccinated',
                data: Array.from(dataMap.get("Vaccinated")),
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2
            }]
        },
        options: {
            elements: {
                point:{
                    radius: 0
                }
            }
        }
    });
}
function barTotal(){
    let dataMap = new Map();

    const confirmedCases = states.map(state => minData[state].total?.confirmed ?? 0);
    dataMap.set("Confirmed", sumMap(confirmedCases));

    const testedCases = states.map(state => minData[state].total?.tested ?? 0);
    dataMap.set("Tested", sumMap(testedCases));

    const vaccinatedCases1 = states.map(state => minData[state].total?.vaccinated1 ?? 0);
    dataMap.set("Vaccinated 1st dose", sumMap(vaccinatedCases1));

    const vaccinatedCases2 = states.map(state => minData[state].total?.vaccinated2 ?? 0);
    dataMap.set("Vaccinated 2nd dose", sumMap(vaccinatedCases2));

    createBarChart(dataMap);
}

function barDelta7(){
    let dataMap = new Map();

    const confirmedCases = states.map(state => minData[state].delta7?.confirmed ?? 0);
    dataMap.set("Confirmed", sumMap(confirmedCases));

    const testedCases = states.map(state => minData[state].delta7?.tested ?? 0);
    dataMap.set("Tested", sumMap(testedCases));

    const vaccinatedCases1 = states.map(state => minData[state].delta7?.vaccinated1 ?? 0);
    dataMap.set("Vaccinated 1st dose", sumMap(vaccinatedCases1));

    const vaccinatedCases2 = states.map(state => minData[state].delta7?.vaccinated2 ?? 0);
    dataMap.set("Vaccinated 2nd dose", sumMap(vaccinatedCases2));

    createBarChart(dataMap);
}
function barDelta(){
    let dataMap = new Map();

    const confirmedCases = states.map(state => minData[state].delta?.confirmed ?? 0);
    dataMap.set("Confirmed", sumMap(confirmedCases));

    const testedCases = states.map(state => minData[state].delta?.tested ?? 0);
    dataMap.set("Tested", sumMap(testedCases));

    const vaccinatedCases1 = states.map(state => minData[state].delta?.vaccinated1 ?? 0);
    dataMap.set("Vaccinated 1st dose", sumMap(vaccinatedCases1));

    const vaccinatedCases2 = states.map(state => minData[state].delta?.vaccinated2 ?? 0);
    dataMap.set("Vaccinated 2nd dose", sumMap(vaccinatedCases2));

    createBarChart(dataMap);
}
function createBarChart(dataMap) {
    barChart.destroy();
    barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: Array.from(dataMap.keys()),
            datasets: [
                {
                    label: "Cases",
                    data: Array.from(dataMap.values()),
                    backgroundColor: ["LightCoral","DarkMagenta","MediumBlue","Teal"],
                    borderColor: ["LightCoral","DarkMagenta","MediumBlue","Teal"],
                    borderWidth: 1
                }
            ]
        },
        options: {

        }
    });
}

function pieTotal(){
    let dataMap = new Map();

    const deceasedCases = states.map(state => minData[state].total?.deceased ?? 0);
    dataMap.set("Deceased",sumMap(deceasedCases));

    const recoveredCases = states.map(state => minData[state].total?.recovered ?? 0);
    dataMap.set("Recovered",sumMap(recoveredCases));
    createPieChart(dataMap);
}
function pieDelta7(){
    let dataMap = new Map();

    const deceasedCases = states.map(state => minData[state].delta7?.deceased ?? 0);
    dataMap.set("Deceased",sumMap(deceasedCases));

    const recoveredCases = states.map(state => minData[state].delta7?.recovered ?? 0);
    dataMap.set("Recovered",sumMap(recoveredCases));
    createPieChart(dataMap);
}

function pieDelta(){
    let dataMap = new Map();

    const deceasedCases = states.map(state => minData[state].delta?.deceased ?? 0);
    dataMap.set("Deceased",sumMap(deceasedCases));

    const recoveredCases = states.map(state => minData[state].delta?.recovered ?? 0);
    dataMap.set("Recovered",sumMap(recoveredCases));
    createPieChart(dataMap);
}
function createPieChart(dataMap){
    pieChart.destroy();
    pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: Array.from(dataMap.keys()),
            datasets: [
                {
                    label: "Cases",
                    data: Array.from(dataMap.values()),
                    backgroundColor: [ "FireBrick","RebeccaPurple"],
                    borderColor: ["FireBrick","RebeccaPurple"],
                    borderWidth: 1
                }
            ]
        },
        options: {
        }
    });
}

chartCurrentTotal();