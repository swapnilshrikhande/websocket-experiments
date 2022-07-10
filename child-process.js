const { spawn } = require('node:child_process');
const ls = spawn('ls', ['-R', '/'],{
    detached : true
});

let i=0;

ls.stdout.on('data', (data) => {
    i++;
    if(i==10){
        console.log(`${i} stdout: ${data}`);
        ls.kill();
    }
});

ls.stderr.on('data', (data) => {
  //console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

