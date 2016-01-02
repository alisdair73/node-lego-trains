# node-lego-trains
Use a 4d Touch Screen to drive a retro lego railway locomotive.

The controller for the locomotive is a 4d systems touch screen attached to a RPi 2 running Node JS. Node reads the 4d
commands from the Serial Port and sends these to the Locomotive as JSON Commands.

The Locomotive uses a RPi Zero and a L293D H Bridge to control the motor. The RPi Zero uses Node to create a Web Server
which accepts the JSON commands sent from the RPi 2 attached to the touch screen controller, and switches the motor via
the RPi Zero GPIO. Speed is controlled using the PWM function of the RPi Zero.

Thanks to Jonathan Perkin for the GPIO library (https://github.com/jperkin/node-rpio) and Chris Williams for the 
Serial Library (https://github.com/voodootikigod/node-serialport).

Enjoy :)
