var shell = require('shelljs');

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {

    let command = "tail -f /Users/swapnilshrikhande/dev/src/html/index.log" || 'echo "Add command parameter"';

    shell.exec(command, function(code, stdout, stderr) {
        res.write(stdout);
        res.end();
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



