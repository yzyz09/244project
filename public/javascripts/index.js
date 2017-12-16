$(document).ready(function () {
  var timeData = [],
  temperatureData = [],
  humidityData = [];
  var data = {
    labels: timeData,
    datasets: [
      {
        fill: false,
        label: 'Number of People',
        yAxisID: 'Number of People',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        data: temperatureData
      },
      // {
      //   fill: false,
      //   label: 'Number of People',
      //   yAxisID: 'Number of People',
      //   borderColor: "rgba(24, 120, 240, 1)",
      //   pointBoarderColor: "rgba(24, 120, 240, 1)",
      //   backgroundColor: "rgba(24, 120, 240, 0.4)",
      //   pointHoverBackgroundColor: "rgba(24, 120, 240, 1)",
      //   pointHoverBorderColor: "rgba(24, 120, 240, 1)",
      //   data: numData
      // }
    ]
  }

  var basicOption = {
    title: {
      display: true,
      text: 'Number of people per minute',
      fontSize: 36
    },
    scales: {
      yAxes: [{
        id: 'Number of People',
        type: 'linear',
        scaleLabel: {
          display: true
        },
        position: 'left',
      }, {
        id: 'Number of People',
        type: 'linear',
        scaleLabel: {
          display: true
        },
        position: 'right'
      }]
    }
  }

  //Get the context of the canvas element we want to select
  var ctx = document.getElementById("myChart").getContext("2d");
  var optionsNoAnimation = { animation: false }
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: basicOption
  });

  console.log(location.host);
  var ws = new WebSocket('wss://' + location.host);
  ws.onopen = function () {
    console.log('Successfully connect WebSocket');
  }
  ws.onmessage = function (message) {
    console.log('receive message' + message.data);

    try {
      var obj = JSON.parse(message.data);
      if(obj=='success'){
        console.log('send message success');
      }

      if (!obj.time || !obj.number) {
        return;
      }
      timeData.push(obj.time);
      temperatureData.push(obj.temperature);
      // only keep no more than 50 points in the line chart
      const maxLen = 50;
      var len = timeData.length;
      if (len > maxLen) {
        timeData.shift();
        temperatureData.shift();
      }

      if (obj.humidity) {
        humidityData.push(obj.humidity);
      }
      if (humidityData.length > maxLen) {
        humidityData.shift();
      }

      myLineChart.update();
    } catch (err) {
      console.error(err);
    }
  }
});
