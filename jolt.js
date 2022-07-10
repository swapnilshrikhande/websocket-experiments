const {createSpawnRunner} = require('jolt.sh');


// let's run some async code...
(async() => {
    const $ = createSpawnRunner();

    let i = 0;

    // monitor output from http server instance
    // and log it to current shell
    for await (const {type, text} of $`bash ./scripts/deploy.sh`) {
        // type = 'stdout' | 'stderr'
        // text <=> console output text
        if(type === 'stdout') {
            console.log(`${i}:${type}:\n${text}\n`);
        }
        ++i;
    }
})();