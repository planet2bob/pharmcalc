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
            format: '{value} mL/hr',
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
    }, { // Secondary yAxis
        title: {
            text: 'Volume Infused',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        labels: {
            format: '{value} mL',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        opposite: true
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
        type: 'column',
        yAxis: 1,
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

function redraw() {

    const hasInvalidField = document.querySelector('.invalid-field') !== null;
    if (hasInvalidField) {
        return;
    }

    // read as floats (error handling ? later)
    var initialRate = parseFloat(document.getElementById("inputInitialRate").value);
    var maxRate = parseFloat(document.getElementById("inputMaxRate").value);
    var stepSize = parseFloat(document.getElementById("inputStepSize").value);
    var stepTime = parseFloat(document.getElementById("inputStepTime").value) / 60; // min->hr
    var targetTotal = parseFloat(document.getElementById("inputTargetTotal").value);

    // alert("Button clicked!" + initialRate + maxRate + stepSize + stepTime + targetTotal);
    var times = [0];
    var rates = [initialRate];
    var volus = [0];
    var vt = 0;
    
    const maxloops = 5000;
    var loops = 0;

    // Step through until we hit the target
    while (vt < targetTotal && loops < maxloops) { 
        vt += rates.at(-1) * stepTime;
        times.push(times[times.length - 1] + stepTime);
        rates.push(Math.min(maxRate, rates[rates.length - 1] + stepSize));
        volus.push(vt);
        loops += 1
    }

    if (loops >= maxloops) {
        alert("Maximum infusion increases reached (5000), recheck numbers");
        return;
    }

    // Walk back to find exact time
    revealFields();
    var finalTime = times.at(-1) - ((vt - targetTotal) / rates.at(-1));
    var outputDayElem = document.getElementById("dayout");
    var outputHourElem = document.getElementById("hourout");
    var outputMinElem = document.getElementById("minout");
    outputHourElem.textContent = Math.floor(finalTime % 24);
    outputMinElem.textContent = Math.floor((finalTime - Math.floor(finalTime)) * 60);
    outputDayElem.textContent = Math.floor(finalTime / 24);
    hideEmptyFields();

    // Update graph
    console.log(stepTime);

    times = times.map(time => time * 1000 * 60 * 60);
    volumeData = times.map((time, index) => [time, volus[index]]);
    rateData = times.map((time, index) => [time, rates[index]]);

    infusionChart.series[0].setData(volumeData);
    infusionChart.series[1].setData(rateData);

    infusionChart.xAxis[0].update({
        tickInterval: stepTime * 1000 * 60 * 60
    })

    infusionChart.redraw();

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