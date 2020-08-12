const express = require('express');
const app = express();
const got = require('got');
const fs = require('fs');
const bodyParser = require('body-parser');
const CONFIG_FILE = 'db-config.json';

// allow every browser to get response from this server, this MUST BE AT THE TOP
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());


function readDbConfig() {
  const data = JSON.parse(fs.readFileSync(CONFIG_FILE));
  return data;
}

function writeDbConfig(key, val) {
  const data = JSON.parse(fs.readFileSync(CONFIG_FILE));
  data[key] = val;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data));
  return data;
}


// set necessary configurations for the database
app.get('/getdbconfig', async (req, res) => {
  res.write(JSON.stringify(readDbConfig()));
  res.end();
});

// set necessary configurations for the database
app.get('/setdbconfig', async (req, res) => {
  const conf = readDbConfig();
  writeDbConfig('url', req.query.url);
  writeDbConfig('secret', req.query.secret);
  res.write(JSON.stringify(readDbConfig()));
  res.end();
});

// get token 
app.get('/requesttoken', async (req, res) => {
  const conf = readDbConfig();
  const { body } = await got(conf.url + '/requesttoken?secret=' + conf.secret);
  res.write(body);
  res.end();
});

// get echo
app.get('/echo', async (req, res) => {
  const conf = readDbConfig();
  const { body } = await got(conf.url + '/echo', {
    headers: {
      'Authorization': 'Bearer ' + conf.token,
    }
  });
  res.write(body);
  res.end();
});

app.post('/gsql', async (req, res) => {
  const conf = readDbConfig();
  const url = conf.url.slice(0, -4) + '14240/gsqlserver/interpreted_query?a=10'
  const { body } = await got.post(url, {
    body: req.body.q,
    username: conf.username,
    password: conf.password
  });

  res.write(body);
  res.end();
});

app.get('/sampledata', async (req, res) => {
  const conf = readDbConfig();
  const nodeCnt = req.query.nodeCnt;
  const edgeCnt = req.query.edgeCnt;

  const nodeTypes = ['BusRide', 'TrainRide', 'Flight', 'FundsTransfer', 'PhoneCall', 'Person', 'HotelStay', 'Phone', 'BankAccount', 'CaseReport', 'Address'];
  let nodes = [];
  for (const t of nodeTypes) {
    const url = conf.url + `/graph/connectivity/vertices/${t}?_api_=v2&limit=${nodeCnt}`;
    const { body } = await got(url, {
      headers: {
        'Authorization': 'Bearer ' + conf.token,
      }
    });
    let res2 = JSON.parse(body);
    nodes = nodes.concat(res2.results);
  }

  let edges = [];
  for (const node of nodes) {
    const url = conf.url + `/graph/connectivity/edges?source_vertex_id=${node.v_id}&source_vertex_type=${node.v_type}&_api_=v2&limit=${edgeCnt}`;
    const { body } = await got(url, {
      headers: {
        'Authorization': 'Bearer ' + conf.token,
      }
    });
    let res2 = JSON.parse(body);
    edges = edges.concat(res2.results);
  }

  res.write(JSON.stringify({ nodes: nodes, edges: edges }));
  res.end();
});

app.get('/endpoints', async (req, res) => {
  const conf = readDbConfig();
  const { body } = await got(conf.url + '/endpoints ', {
    headers: {
      'Authorization': 'Bearer ' + conf.token,
    }
  });
  res.write(body);
  res.end();
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log('proxy server on 9000'));