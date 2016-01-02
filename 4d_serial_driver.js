var SerialPort = require("serialport");
var fourd_display = new SerialPort.SerialPort('/dev/ttyAMA0', {baudrate: 57600});
const http = require('http');

var trainDirection = 'STOP';
var trainSpeed = 0;

fourd_display.on("open", function () {
    initialise_display();
  }
);

fourd_display.on('data', function(datain) {

  switch(datain[1]){
    case 3: //Switch

      switch(datain[4]){
        case 0:
          trainDirection = 'FORWARD';
          console.log('Forward');
          break;
        case 1:
          trainDirection = 'STOP';
          console.log('Stop');
          break;
        case 2:
          trainDirection = 'BACKWARDS';
          console.log('Backwards');
          break;
      }
      break;

    case 4: //Slider
      console.log('Speed set to ' + datain[4]);
      trainSpeed = datain[4];
      set_speed(datain[4]);
      break;
  }

  sendCommand();
});

function sendCommand(){

  var commandMessage = {};

  commandMessage.direction = trainDirection;
  commandMessage.speed = trainSpeed;

  var options = {
    hostname: '192.168.1.30', //LOCOSERVER.LOCAL
    port: 1337,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': JSON.stringify(commandMessage).length
  }};

  var httpRequest = http.request(options, function(response) {
    console.log('STATUS: ' + response.statusCode);
  });

  httpRequest.write(JSON.stringify(commandMessage));
  httpRequest.end();
}

function set_speed(speed){

  var dataout = new Buffer(6);

  dataout[0] = 0x01;
  dataout[1] = 0x08;
  dataout[2] = 0x00;
  dataout[3] = 0x00;
  dataout[4] = speed;

  var xor_result = 1 ^ 8 ^ 0 ^ 0 ^ speed;
  dataout[5] = xor_result;

  fourd_display.write(dataout);
}

function initialise_display(){

  //Set Switch to Stop
  var rotarySwitch = new Buffer(6);

  rotarySwitch[0] = 0x01;
  rotarySwitch[1] = 0x03;
  rotarySwitch[2] = 0x00;
  rotarySwitch[3] = 0x00;
  rotarySwitch[4] = 0x01;
  rotarySwitch[5] = 1 ^ 3 ^ 0 ^ 0 ^ 1;
  fourd_display.write(rotarySwitch);

  //Set Slider to 0
  var slider = new Buffer(6);

  slider[0] = 0x01;
  slider[1] = 0x04;
  slider[2] = 0x00;
  slider[3] = 0x00;
  slider[4] = 0x00;
  slider[5] = 1 ^ 4 ^ 0 ^ 0 ^ 0;
  fourd_display.write(slider);

  //Set Gauge to 0
  var gauge = new Buffer(6);

  gauge[0] = 0x01;
  gauge[1] = 0x08;
  gauge[2] = 0x00;
  gauge[3] = 0x00;
  gauge[4] = 0x00;
  gauge[5] = 1 ^ 8 ^ 0 ^ 0 ^ 0;
  fourd_display.write(gauge);
}