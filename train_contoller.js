const http = require('http');
const hostname = 'locoserver.local';
const port = 1337;

var rpio = require('rpio');

const enable_pin = 18;
const in1_pin = 27;
const in2_pin = 22;

var trainSpeed = 0;
var trainDirection = 'STOP';

var trainAPIServer = http.createServer(handleAPICommand).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function handleAPICommand(request,response){

  switch(request.method){
    case 'GET':

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write('<HTML>');
        response.write('<HEAD></HEAD>');
        response.write('<BODY>');
        response.write('<H1>Train Status:</H1>');
        response.write('<H2>Direction: ' + trainDirection + '</H2>');
        response.write('<H2>Speed: ' + trainSpeed + '</H2>');
        response.write('</BODY></HTML>');
        response.end();
        break;

    case 'POST':
   
        request.on('data', function(chunk) {

            var commandMessage = JSON.parse(chunk);
            trainSpeed = commandMessage.speed;
            trainDirection = commandMessage.direction;

            console.log('New Speed: ' + trainSpeed);
            console.log('New Direction: ' + trainDirection);
        });
    
        request.on('end', function() {
          
          response.writeHead(201);
          response.end();
          updateGPIO();
        });
        break;  }
}

function updateGPIO(){

        switch(trainDirection){
        case 'STOP':
                trainSpeed = 0;
                break;
        case 'FORWARD':
                rpio.write(in1_pin, rpio.HIGH);
                rpio.write(in2_pin, rpio.LOW);
                break;
        case 'BACKWARDS':
                rpio.write(in1_pin, rpio.LOW);
                rpio.write(in2_pin, rpio.HIGH);
                break;
        }

        if (trainSpeed == 0){
          rpio.pwmSetData(enable_pin, trainSpeed);
        } else {
          rpio.pwmSetData(enable_pin, trainSpeed + 50); //Offset - Motor Inertia...
        }
}

rpio.setLayout('gpio'); //Have to Update GPIO Library so no ERROR...
rpio.setFunction(enable_pin,rpio.PWM);
rpio.setOutput(in1_pin);
rpio.setOutput(in2_pin);

rpio.pwmSetClockDivider(256);
rpio.pwmSetRange(enable_pin, 150);

updateGPIO();
