const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const http = require('http');
const axios = require('axios');
const server = http.createServer(app);
const io = require("socket.io")(server);
const config = require('./config.json');
const generator_url = config.generator_url;

app.use(express.static('public'));

// make app receive json
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/run', async (req, res) => {
  
  // get question from the post request body json
  const question = req.body.question;
  const faces = ["data/oracle.jpg", "data/oracle2.jpg", "data/oracle3.jpg"]
  const faces_idx = Math.floor(Math.random() * faces.length);
  const creation_config = {
    "question": question,
    "voice_embedding": "data/rivka_embedding.pkl",
    "face": faces[faces_idx]
  }
  let results = await axios.post(`${generator_url}/run`, creation_config);
  const task_id = results.data.token;
  async function run_generator_update() {
    results = await axios.post(`${generator_url}/fetch`, {token: task_id});
    if (results.data.status.status == 'complete') {
      let completion = results.data.output.completion;
      let sha = results.data.output.sha;
      res.status(200).send({
        completion: completion,
        sha: sha
      });
      return;
    }
    setTimeout(function(){
      run_generator_update();
    }, 5000);
  }    
  run_generator_update();    

});

server.listen(3000, () => {
  console.log('listening on port 3000');
});