const bigLookup = [
    ["01", 0    , "Iron 4"],
    ["02", 100  , "Iron 3"],
    ["03", 200  , "Iron 2"],
    ["04", 300  , "Iron 1"],
    ["11", 400  , "Bronze 4"],
    ["12", 500  , "Bronze 3"],
    ["13", 600  , "Bronze 2"],
    ["14", 700  , "Bronze 1"],
    ["21", 800  , "Silver 4"],
    ["22", 900  , "Silver 3"],
    ["23", 1000 , "Silver 2"],
    ["24", 1100 , "Silver 1"],
    ["31", 1200 , "Gold 4"],
    ["32", 1300 , "Gold 3"],
    ["33", 1400 , "Gold 2"],
    ["34", 1500 , "Gold 1"],
    ["41", 1600 , "Plat 4"],
    ["42", 1700 , "Plat 3"],
    ["43", 1800 , "Plat 2"],
    ["44", 1900 , "Plat 1"],
    ["51", 2000 , "Emerald 4"],
    ["52", 2100 , "Emerald 3"],
    ["53", 2200 , "Emerald 2"],
    ["54", 2300 , "Emerald 1"],
    ["61", 2400 , "Diamond 4"],
    ["62", 2500 , "Diamond 3"],
    ["63", 2600 , "Diamond 2"],
    ["64", 2700 , "Diamond 1"],
    ["70", 2800 , "Master"],
    ["80", 3000 , "Grandmaster"],
    ["90", 3500 , "Challenger"]
];

var infusionChart = Highcharts.chart('container', {
    chart: {
        zooming: {
            type: 'xy'
        },
        backgroundColor: '#FCFCFF', // Set the background color here
    },
    title: {
        text: 'Infusion Progress',
        align: 'center',
        style: {
            fontSize: '1.3rem', // Match Bootstrap's h5 size
            fontWeight: 'bold',  // Optional: Adjust weight if needed
            fontFamily: 'inherit' // Optional: Match page font
        }
    },
    plotOptions: {
        series: {
          marker: {
           enabled: true,
              radius:6
          }
        }
      },
    xAxis: [{
        type: 'datetime',
        tickInterval: 30 * 60 * 1000,
        dateTimeLabelFormats: {
            minute: '%H:%M',  // Format for the x-axis labels to display hours and minutes (e.g., 00:00, 00:15, 00:30)
            color: Highcharts.getOptions().colors[4]
        },
        title: {
            text: 'Time from Start',
            style: {
                color: Highcharts.getOptions().colors[4]
            }
        },
        labels: {
            formatter: function () {
                const milliseconds = this.value; 
                const daysPastEpoch = Math.floor(milliseconds / (1000 * 60 * 60 * 24)) + 1; // Convert to days
                if (daysPastEpoch > 1)
                    return `Day ` + daysPastEpoch + ', ' + Highcharts.dateFormat('%k:%M', this.value);
                return Highcharts.dateFormat('%k:%M', this.value);
                // %H, %M vs. $k, $l to drop leading zeros
            }
        }
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            formatter: function() {
                // Custom labels for specific values
                const closestSubarray = bigLookup.reduce((closest, current) => {
                    const currentDifference = Math.abs(current[1] - this.value);
                    const closestDifference = Math.abs(closest[1] - this.value);
                  
                    // If the current difference is smaller, return the current subarray
                    return currentDifference < closestDifference ? current : closest;
                });

                return closestSubarray[2]
            },
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: 'Infusion Rate',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        }
    }],
    tooltip: {
        shared: true,
        headerFormat: ''
    },
    legend: {
        align: 'left',
        verticalAlign: 'top',
        reversed: true,
        backgroundColor:
            Highcharts.defaultOptions.legend.backgroundColor || // theme
            'rgba(255,255,255,0.25)'
    },
    series: [{
        name: 'Volume Infused',
        type: 'spline',
        animationLimit: 250,
        data: [
            [0, 0],
            [1800000, 7.5],
            [3600000, 22.75],
            [5400000, 45.75],
            [7200000, 76.5],
            [9000000, 115],
            [10800000, 161.25],
            [12600000, 215.25],
            [14400000, 277],
            [16200000, 340]
        ],
        tooltip: {
            valueSuffix: ' mL'
        }

    }, {
        name: 'Infusion Rate',
        type: 'spline',
        animationLimit: 250,
        data: [
            [0, 15],
            [1800000, 30.5],
            [3600000, 46],
            [5400000, 61.5],
            [7200000, 77],
            [9000000, 92.5],
            [10800000, 108],
            [12600000, 123.5],
            [14400000, 126],
            [16200000, 126]
        ],
        tooltip: {
            valueSuffix: ' mL/hr'
        }
    }]
});

// NEW CODE

// global variables (i know)
var times = [];
var mmr = [];
var tlp = []; // short for true lp
var clp = []; // short for current lp
var wins = [];
var weeks = 0;

function simWeek() {

    weeks += 1;

    var initialRank = document.getElementById("initialRank").value + document.getElementById("initialDivision").value;
    var trueRank = document.getElementById("trueRank").value + document.getElementById("trueDivision").value;
    var targetRank = document.getElementById("targetRank").value + document.getElementById("targetDivision").value;

    var initialRank = bigLookup.find(subarray => subarray[0] === initialRank)[1];
    var trueLP = bigLookup.find(subarray => subarray[0] === trueRank)[1];
    var targetLP = bigLookup.find(subarray => subarray[0] === targetRank)[1];

    var currentTime = times.length > 0 ? times.at(-1) : 0;
    var currentLP = clp.length > 0 ? clp.at(-1) : initialRank;
    var currentMMR = mmr.length > 0 ? mmr.at(-1) : initialRank;
    
    var timeRemaining = document.getElementById("hourInput").value * 60; // in minutes

    while (timeRemaining > 0) {
        var gameTime = 15 + 45 * Math.random() + 5;
        timeRemaining -= gameTime;
        var win = Math.random() < winrate(trueLP, currentMMR);
        currentMMR += calculateMMRChange(currentMMR, currentMMR, win);
        currentLP += calculateLPChange(currentLP, currentMMR, win);
        currentTime = times.length > 0 ? times.at(-1) : 0;

        times.push(currentTime + gameTime * 1000 * 60);
        clp.push(currentLP);
        mmr.push(currentMMR);
        wins.push(win);

        console.log("win: " + win
            + " lp change = " + calculateLPChange(currentLP, currentMMR, win)
            + " mmr change = " + calculateMMRChange(currentMMR, currentMMR, win)
        );
    }

    volumeData = times.map((time, index) => [time, clp[index]]);
    rateData = times.map((time, index) => [time, mmr[index]]);

    infusionChart.series[0].setData(volumeData);
    infusionChart.series[1].setData(rateData);

    updateCounters();

}

function updateCounters(){
    revealFields();

    var finalTime = times.at(-1) / (1000 * 60 * 60);
    var outputDayElem = document.getElementById("dayout");
    var outputHourElem = document.getElementById("hourout");
    var outputMinElem = document.getElementById("minout");
    outputHourElem.textContent = Math.floor(finalTime % 24);
    outputMinElem.textContent = Math.floor((finalTime - Math.floor(finalTime)) * 60);
    outputDayElem.textContent = Math.floor(finalTime / 24);

    document.getElementById("gamesout").textContent = times.length - 1;
    document.getElementById("weeksout").textContent = weeks;
    document.getElementById("mmrout").textContent = bigLookup.reduce((closest, current) => {
        const currentDifference = Math.abs(current[1] - mmr.at(-1));
        const closestDifference = Math.abs(closest[1] - mmr.at(-1));
      
        // If the current difference is smaller, return the current subarray
        return currentDifference < closestDifference ? current : closest;
    })[2];

    document.getElementById("lpout").textContent = bigLookup.reduce((closest, current) => {
        const currentDifference = Math.abs(current[1] - clp.at(-1));
        const closestDifference = Math.abs(closest[1] - clp.at(-1));
      
        // If the current difference is smaller, return the current subarray
        return currentDifference < closestDifference ? current : closest;
    })[2];

    document.getElementById("wrout").textContent = Math.floor(wins.filter(value => value === true).length / wins.length * 100);


    hideEmptyFields();
}

function winrate(trueLP, currentLP) {
    // if you control the game, use the mmr formula
    if (Math.random() < percentGamesInControl(Math.abs(trueLP - currentLP)))
        return 1 / (1 + Math.pow(10, (currentLP - trueLP) / 400));
    // sometimes its just a coinflip cause of team
    return .50;
}

function percentGamesInControl(mmrDiff) {
    console.log("control:" + mmrDiff / 3000);
    return Math.max(.20, Math.min(.80, mmrDiff / 1000))
}

function calculateMMRChange(player1, player2, player1Won) {
    const kFactor = 100; // Adjust this value to control the rate of MMR change
  
    // Calculate the probability of player1 winning
    const probability = winrate(player1, player2);

    wonInt = player1Won ? 1 : 0;
    // Calculate the MMR change based on the outcome
    const mmrChange = Math.round(kFactor * (wonInt - probability));
    return mmrChange;
}

function calculateLPChange(currentLP, currentMMR, win) {
    var gap = currentMMR - currentLP;
    if (win) 
        return 25 + gap * .05;
    else 
        return -25 + gap * .05;
}

document.getElementById('simWeek').addEventListener('click', function() {
    simWeek();
});

// Hide hour/day box on empty hour/day
function hideEmptyFields() {
    const dayOutText = document.getElementById('dayout').innerText;
    const hourOutText = document.getElementById('hourout').innerText;
    const hiddenValues = ["?", "0", "", " "];

    var dayVisibility = hiddenValues.includes(dayOutText) ? 'hidden' : 'visible'
    var elements = document.querySelectorAll('.daybox');
    elements.forEach(element => {
        element.style.visibility = dayVisibility; 
    });

    var hourVisibility = hiddenValues.includes(hourOutText) ? 'hidden' : 'visible'
    elements = document.querySelectorAll('.hourbox');
    elements.forEach(element => {
        element.style.visibility = hourVisibility; 
    });

    console.log(dayOutText + dayVisibility + hourOutText + hourVisibility);
}

function revealFields() {
    var elements = document.querySelectorAll('.daybox');
    elements.forEach(element => {
        element.style.visibility = 'visible'; 
    });
    elements = document.querySelectorAll('.hourbox');
    elements.forEach(element => {
        element.style.visibility = 'visible'; 
    });
}

function validateInput(inputFieldId) {
    const inputField = document.getElementById(inputFieldId);
    const inputValue = inputField.value;
    const isValidFloat = !isNaN(parseFloat(inputValue)) && isFinite(inputValue);

    if (isValidFloat) {
      inputField.classList.remove('invalid-field');
    } else {
      inputField.classList.add('invalid-field');
    }
    return isValidFloat;
}

// Run and add the five listeners
validateInput('inputInitialRate')
document.getElementById('inputInitialRate').addEventListener('input', function() {
    validateInput('inputInitialRate');
    redraw();
});
validateInput('inputMaxRate')
document.getElementById('inputMaxRate').addEventListener('input', function() {
    validateInput('inputMaxRate');
    redraw();
});
validateInput('inputStepSize')
document.getElementById('inputStepSize').addEventListener('input', function() {
    validateInput('inputStepSize');
    redraw();
});
validateInput('inputStepTime')
document.getElementById('inputStepTime').addEventListener('input', function() {
    validateInput('inputStepTime');
    redraw();
});
validateInput('inputTargetTotal')
document.getElementById('inputTargetTotal').addEventListener('input', function() {
    validateInput('inputTargetTotal');
    redraw();
});

// Redraw
redraw();
hideEmptyFields();