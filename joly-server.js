var shell = require('shelljs');

const express = require('express')
const app = express()
const port = 3000
const {createSpawnRunner} = require('jolt.sh');

const { exec } = require('child_process');
const controller = new AbortController();
const { signal } = controller;

const abortEventListener = (event) => {
    
    console.log(signal.aborted); // true
    console.log(signal.reason); // Hello World
    return false;
  };
  
signal.addEventListener("kill", abortEventListener);


app.get('/', (req, res) => {
    (async() => {
        
    
        let i = 0;
    
        // monitor output from http server instance
        // and log it to current shell
        //try {

            const $ = createSpawnRunner({ detached: true, signal });

            for await (const {type, text} of $`bash ./scripts/deploy.sh`) {
                // type = 'stdout' | 'stderr'
                // text <=> console output text
                if(type === 'stdout') {
                    //console.log(`${i}:${type}:\n${text}\n`);
                    res.write(`${i}:${type}:\n${text}\n`);
    
                    if( i === 50){
                        controller.kill();
                    }    
                }
                ++i;
            }
            
        /*} catch (error) {
            console.log("Command Aborted",JSON.stringify(error));
        }*/


        res.end();
    })();

});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})