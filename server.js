const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const moment = require('moment');
const path = require('path');
const iotHubClient = require('./IoTHub/iot-hub.js')
const app = express();
// var Client = require('azure-iothub').Client;
// var Message = require('azure-iot-common').Message;

// var sconnectionString = 'HostName=244Project.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=gEhGIDr+et3xM841/0Kc77iCZctRbVxdeWUGNv9MdOw=';
// var targetDevice = 'Sparkfun-esp8266-thing-dev';

// var serviceClient = Client.fromConnectionString(sconnectionString);

// function printResultFor(op) {
//   return function printResult(err, res) {
//     if (err) console.log(op + ' error: ' + err.toString());
//     if (res) console.log(op + ' status: ' + res.constructor.name);
//   };
// }

// function receiveFeedback(err, receiver){
//   receiver.on('message', function (msg) {
//     console.log('Feedback message:')
//     console.log(msg.getData().toString('utf-8'));
//   });
// }

app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res/*, next*/) {
  res.redirect('/');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        console.log('sending data ' + data);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};


var iotHubReader = new iotHubClient(process.env['Azure.IoT.IoTHub.ConnectionString'], process.env['Azure.IoT.IoTHub.ConsumerGroup']);
iotHubReader.startReadMessage(function (obj, date) {
  try {
    // if(eval(obj).tvoc>100){
    //   serviceClient.open(function (err) {
    //     if (err) {
    //       console.error('Could not connect: ' + err.message);
    //     } else {
    //       console.log('Service client connected');
    //       serviceClient.getFeedbackReceiver(receiveFeedback);
    //       var message = new Message('threshold');
    //       message.ack = 'full';
    //       message.messageId = "My Message ID";
    //       console.log('Sending message: ' + message.getData());
    //       serviceClient.send(targetDevice, message, printResultFor('send'));
    //       wss.broadcast('success');
    //     }
    //   });
    // }

    console.log(date);
    date = date || Date.now()
    wss.broadcast(JSON.stringify(Object.assign(obj, { time: moment.utc(date).format('YYYY:MM:DD[T]hh:mm:ss') })));
  } catch (err) {
    console.log(obj);
    console.error(err);
  }
});

var port = normalizePort(process.env.PORT || '3000');
server.listen(port, function listening() {
  console.log('Listening on %d', server.address().port);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
