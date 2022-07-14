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

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  
  socket.on('submit_oracle', async (data) => {
    const creation_config = {
      "question": data.question,
      "voice_embedding": "data/rivka_embedding.pkl"
    }
    let results = await axios.post(`${generator_url}/run`, creation_config);
    const task_id = results.data.token;
    async function run_generator_update() {
      results = await axios.post(`${generator_url}/fetch`, {token: task_id});
      console.log(results)
      console.log(generator_url)
      if (results.data.status.status == 'complete') {
        let completion = results.data.output.completion;
        let sha = results.data.output.sha;
        socket.emit('result', {
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
});

server.listen(3000, () => {
  console.log('listening on port 3000');
});