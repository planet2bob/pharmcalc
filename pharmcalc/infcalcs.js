var infusionChart = Highcharts.chart('container', {
    chart: {
        zooming: {
            type: 'xy'
        }
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
              // Format the labels to show only the time (HH:MM)
              return Highcharts.dateFormat('%k:%M', this.value);
              // %H, %M vs. $k, $l to drop leading zeros
            }
        }
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            format: '{value} mL',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: 'Amount Infused',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        }
    }, { // Secondary yAxis
        title: {
            text: 'Infusion Rate',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        labels: {
            format: '{value} mL/hr',
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

    // Step through until we hit the target
    while (vt < targetTotal) { 
        vt += rates.at(-1) * stepTime;
        times.push(times[times.length - 1] + stepTime);
        rates.push(Math.min(maxRate, rates[rates.length - 1] + stepSize));
        volus.push(vt);
    }

    // Walk back to find exact time
    var finalTime = times.at(-1) - ((vt - targetTotal) / rates.at(-1));
    var outputHourElem = document.getElementById("outputHour");
    var outputMinElem = document.getElementById("outputMinute");
    outputHourElem.placeholder = Math.floor(finalTime);
    outputMinElem.placeholder = Math.floor((finalTime - Math.floor(finalTime)) * 60);

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

    console.log(volumeData);
    console.log(rateData);

}

function validateInput(inputFieldId) {
    const inputField = document.getElementById(inputFieldId);
    const inputValue = inputField.value;

    // Check if the input is a valid float
    const isValidFloat = !isNaN(parseFloat(inputValue)) && isFinite(inputValue);

    if (isValidFloat) {
      // Remove the invalid class if the input is a valid float
      inputField.classList.remove('invalid-field');
    } else {
      // Add the invalid class to color the field light red if the input is not a valid float
      inputField.classList.add('invalid-field');
    }

    redraw();
    return isValidFloat;
}

// Run and add the five listeners
validateInput('inputInitialRate')
document.getElementById('inputInitialRate').addEventListener('input', function() {
    validateInput('inputInitialRate');
});
validateInput('inputMaxRate')
document.getElementById('inputMaxRate').addEventListener('input', function() {
    validateInput('inputMaxRate');
});
validateInput('inputStepSize')
document.getElementById('inputStepSize').addEventListener('input', function() {
    validateInput('inputStepSize');
});
validateInput('inputStepTime')
document.getElementById('inputStepTime').addEventListener('input', function() {
    validateInput('inputStepTime');
});
validateInput('inputTargetTotal')
document.getElementById('inputTargetTotal').addEventListener('input', function() {
    validateInput('inputTargetTotal');
});
