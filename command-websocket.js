const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { spawn } = require('node:child_process');
var kill  = require('tree-kill');
const { stat } = require('fs');

const escapeChars = new Set([' ', '\\', '   ', '\n', '"', '"']);

class ProcessStatus {
    constructor(pid,name,status){
      this._name = name;
      this._pid  = pid;
      this._status = status;
    }

    set name(name) {
      this._name = name;
      return this;
    }

    get name() {
      return this._name;
    }

    set pid(pid){
      this._pid = pid;
      return this;
    }

    get pid(){
      return this._pid;
    }

    set status(status){
      this._status = status;
      return this;
    }

    get status(){
      return this._status;
    }
}

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

  let ls = spawn(cmd,args,{shell:true,detached:true});

  ls.stdout.on('data', (data) => {
    callback( ls.pid, data.toString());
  });

  ls.stderr.on('data', (data) => {
    console.error("Error : "+data.toString());
  });
  
  ls.on('close', (code) => {
    console.log("Command executed with exitCode : "+code);
  });
  
  ls.unref()
  return ls;
}


io.on('connection', (socket) => {
    console.log('a user connected');

    const processStatusMap = new Map();
    
    socket.on('command', (cmd) => {
        console.log('Command: ' + cmd);
        //broadcast message to everyone
        //io.emit('chat message', msg);
        runCommand(cmd,(pid, data)=>{
          //replace \n with br
          lines = data.split("\n");
          processStatusMap.set(pid,new ProcessStatus(pid,cmd,'RUNNING'));
          socket.emit("command-response", {'pid': pid,'result' : lines} );
        })
    });

    socket.on('command-kill', (pid) => {
      if( pid ){
        //let killResult = currentCommand.kill('SIGABRT');
        //console.log('Command Aborted: '+killResult);
        kill( pid, (error)=>{ 
           
          
           console.log("pid="+pid );
           console.log("processStatusMap="+JSON.stringify(processStatusMap) );

           let processStatus =   processStatusMap.get(pid) || {"pid":pid,"name":"unknown"};
           
           if( error ){
            console.log(`Error Aborting Command ${processStatus.name} with error ${error} `);
           } else {
            console.log(`Command ${processStatus.name} Aborted Successfully`);
           }
           
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

