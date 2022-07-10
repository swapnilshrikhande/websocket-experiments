const express = require('express')
const app = express()
const port = 3000
const { spawn } = require('node:child_process');
 
app.get('/', (req, res) => {
    
    let i=0;

    const ls = spawn('bash', ['./scripts/deploy.sh'],{
      //detached : true,
      shell : true
    });

    ls.stdout.on('data', (data) => {
        i++;
        if( i == 50 ){
            ls.kill();
        }
        res.write(`${i} stdout: ${data}`);
    });

    ls.on('close', (code) => {
      console.log("Command executed with exitCode : "+code);
      res.end();
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

