const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const http = require('http');
const axios = require('axios');
const server = http.createServer(app);
const io = require("socket.io")(server);
const dotenv = require('dotenv')

dotenv.config()
const EDEN_API_KEY = process.env.EDEN_API_KEY;
const EDEN_API_SECRET = process.env.EDEN_API_SECRET;

const GATEWAY_URL = "https://gateway-test.abraham.ai";
//const MINIO_URL = "https://minio.aws.abraham.fun";
//const MINIO_BUCKET = "creations-stg";


app.use(express.static('public'));

// make app receive json
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/run', async (req, res) => {

  const question = req.body.question;
  const faces = ["data/oracle.jpg", "data/oracle2.jpg", "data/oracle3.jpg"]
  const faces_idx = Math.floor(Math.random() * faces.length);
  
  const config = {
    "question": question,
    "voice_embedding": "data/rivka_embedding.pkl",
    "face": faces[faces_idx]
  }

  console.log("run", config);

  let authData = {
    "apiKey": EDEN_API_KEY, 
    "apiSecret": EDEN_API_SECRET
  };
  
  let response = await axios.post(GATEWAY_URL+'/sign_in', authData)
  let authToken = response.data.authToken;
  
  const request = {
    "token": authToken,
    "application": "oracle", 
    "generator_name": "oracle", 
    "config": config,
    "metadata": {"question": question} 
  }

  console.log("REQUEST: ", question);

  response = await axios.post(GATEWAY_URL+'/request', request);
  let prediction_id = response.data;
  
  console.log(`job submitted, task id ${prediction_id}`);

  res.status(200).send({prediction_id: prediction_id});
});


app.post('/fetch', async (req, res) => {
  const prediction_id = req.body.prediction_id;

  let response = await axios.post(GATEWAY_URL+'/fetch', {
    "taskIds": [prediction_id]
  });
  
  let {status, output} = response.data[0];
  console.log(status, output)
  
  if (status == 'failed') {
    console.log("failed");
    return res.status(500).send({
      error: "there was an error"
    });
  } 
  else {
    //let outputUrl = `${MINIO_URL}/${MINIO_BUCKET}/${output}`;
    console.log(`finished! result at ${output}`);
    return res.status(200).send({
      completion: "",
      sha: output,
      status: status
    });
  }

});

server.listen(PORT, () => {
  console.log(`Oracle is listening on port ${PORT}`);
});
