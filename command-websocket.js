const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { spawn } = require('node:child_process');
var kill  = require('tree-kill');


const escapeChars = new Set([' ', '\\', '   ', '\n', '"', '"']);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const shellEscape = (string) => {

  let newString = '';
  
  for (const c of ('' + string)) {
    if (escapeChars.has(c)) {
      newString += '\\' + c;
    } else {
      newString += c;
    }
  }

  return newString;
}

const extractArguments = (cmd) => {
  let args = cmd.split(" ").slice(1);
  const escaped = args.map((arg) => shellEscape(arg));
  return escaped;
}


let runCommand = function(cmd,callback){
  let i=0;

  let args = extractArguments(cmd);

  let ls = spawn(cmd,args,{shell:true});

  ls.stdout.on('data', (data) => {
      callback(data.toString());
  });
  
  ls.on('close', (code) => {
    console.log("Command executed with exitCode : "+code);
  });
  
  ls.unref()
  return ls;
}


io.on('connection', (socket) => {
    console.log('a user connected');
    let currentCommand;
    
    socket.on('command', (cmd) => {
        console.log('Command: ' + cmd);
        //broadcast message to everyone
        //io.emit('chat message', msg);
        currentCommand = runCommand(cmd,(data)=>{
          //replace \n with br
          lines = data.split("\n");
          socket.emit("command-response", {'result' : lines} );
        })
    });

    socket.on('command-kill', (cmd) => {
      if( currentCommand && currentCommand.pid){
        //let killResult = currentCommand.kill('SIGABRT');
        //console.log('Command Aborted: '+killResult);
        kill(currentCommand.pid,(error)=>{
           console.log('Command Aborted = '+error);
        });
      }  
    });
    
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});



server.listen(3000, () => {
  console.log('listening on *:3000');
});

