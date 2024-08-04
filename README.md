# velbusLib
This is a library to read and write frames on a Velbus IP server. 

## Global project
simple project to exchange between web server and client browser and IP Velbus server
This would be a dynamic program able to show frame in real time in the browser (using socket.io)

![alt text](https://i.imgur.com/yYkusfG.png)

## How it works
I've tried to create a MVC application, using EJS, Socket.io and Velbuslib
- Velbuslib is able to connect to a TCP Velbus server
- index.js create a socket.io server and relays message from Velbuslib to socket.io
- others pages (EJS) are not used for now
