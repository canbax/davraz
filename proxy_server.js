const express = require('express');
const app = express();
const got = require('got');
const bodyParser = require('body-parser');
let DB_CONFIG = {
  url: 'https://covid19.i.tgcloud.io:9000',
  token: 'o5lu7b7i3gmoi10fuucopsruidrf978o',
  tokenExpire: 1612176462,
  secret: '48vmuf6sijcsrol1avv3vstavlknk1o7',
  username: 'tigergraph',
  password: '123456',
  graphName: 'MyGraph'
};

// allow every browser to get response from this server, this MUST BE AT THE TOP
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(bodyParser.json());


// set necessary configurations for the database
app.get('/getdbconfig', async (req, res) => {
  res.write(JSON.stringify(DB_CONFIG));
  res.end();
});

// set necessary configurations for the database
app.post('/setdbconfig', async (req, res) => {
  const url = req.body.url;
  const token = req.body.token;
  const tokenExpire = req.body.tokenExpire;
  const secret = req.body.secret;
  const username = req.body.username;
  const password = req.body.password;
  const graphName = req.body.graphName;

  if (url) {
    DB_CONFIG.url = url;
  }
  if (token) {
    DB_CONFIG.token = token;
  }
  if (tokenExpire) {
    DB_CONFIG.tokenExpire = tokenExpire;
  }
  if (secret) {
    DB_CONFIG.secret = secret;
  }
  if (username) {
    DB_CONFIG.username = username;
  }
  if (password) {
    DB_CONFIG.password = password;
  }
  if (graphName) {
    DB_CONFIG.graphName = graphName;
  }

  res.write(`{"success": true}`);
  res.end();
});

// get token 
app.get('/requesttoken', async (req, res) => {
  const { body } = await got(DB_CONFIG.url + '/requesttoken?secret=' + DB_CONFIG.secret);
  res.write(body);
  res.end();
});

// get echo
app.get('/echo', async (req, res) => {
  const { body } = await got(DB_CONFIG.url + '/echo', {
    headers: {
      'Authorization': 'Bearer ' + DB_CONFIG.token,
    }
  });
  res.write(body);
  res.end();
});

app.post('/gsql', async (req, res) => {
  const url = DB_CONFIG.url.slice(0, -4) + '14240/gsqlserver/interpreted_query?a=10'
  const { body } = await got.post(url, {
    body: req.body.q,
    username: DB_CONFIG.username,
    password: DB_CONFIG.password
  });

  res.write(body);
  res.end();
});

app.get('/samplenodes', async (req, res) => {
  const cnt = req.query.cnt;
  const type = req.query.type;

  let nodes = [];
  const url = DB_CONFIG.url + `/graph/${DB_CONFIG.graphName}/vertices/${type}?_api_=v2&limit=${cnt}`;
  const { body } = await got(url, {
    headers: {
      'Authorization': 'Bearer ' + DB_CONFIG.token,
    }
  });
  let res2 = JSON.parse(body);
  nodes = nodes.concat(res2.results);

  res.write(JSON.stringify({ nodes: nodes, edges: [] }));
  res.end();
});

app.get('/edges4nodes', async (req, res) => {
  const cnt = req.query.cnt;
  const id = req.query.id;
  const src_type = req.query.src_type;

  let edges = [];
  const url = DB_CONFIG.url + `/graph/${DB_CONFIG.graphName}/edges?source_vertex_id=${id}&source_vertex_type=${src_type}&_api_=v2&limit=${cnt}`;
  const { body } = await got(url, {
    headers: {
      'Authorization': 'Bearer ' + DB_CONFIG.token,
    }
  });
  let res2 = JSON.parse(body);
  edges = edges.concat(res2.results);

  res.write(JSON.stringify({ nodes: [], edges: edges }));
  res.end();
});

app.get('/nodes4edges', async (req, res) => {
  const cnt = req.query.cnt;
  const type = req.query.type;
  const id = req.query.id;

  let nodes = [];
  const url = DB_CONFIG.url + `/graph/${DB_CONFIG.graphName}/vertices?vertex_type=${type}&vertex_id=${id}&_api_=v2&limit=${cnt}`;
  const { body } = await got(url, {
    headers: {
      'Authorization': 'Bearer ' + DB_CONFIG.token,
    }
  });
  let res2 = JSON.parse(body);
  nodes = nodes.concat(res2.results);

  res.write(JSON.stringify({ nodes: nodes, edges: [] }));
  res.end();
});

app.post('/query', async (req, res) => {
  const q = req.body.query;
  const params = req.body.params;

  let s = '';
  for (let i = 0; i < params.length; i++) {
    s += Object.keys(params[i])[0] + '=' + Object.values(params[i])[0] + '&';
  }
  s = s.slice(0, -1);
  let nodes = [];
  const url = DB_CONFIG.url + `/query/${DB_CONFIG.graphName}/${q}?${s}`;
  const { body } = await got(url, {
    headers: {
      'Authorization': 'Bearer ' + DB_CONFIG.token,
    }
  });
  let res2 = JSON.parse(body);
  nodes = nodes.concat(res2.results);

  res.write(JSON.stringify({ nodes: nodes, edges: [] }));
  res.end();
});

app.get('/endpoints', async (req, res) => {
  const { body } = await got(DB_CONFIG.url + '/endpoints ', {
    headers: {
      'Authorization': 'Bearer ' + DB_CONFIG.token,
    }
  });
  res.write(body);
  res.end();
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log('proxy server on 9000'));