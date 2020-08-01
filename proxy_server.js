const express = require('express');
const app = express();
const got = require('got');
const fs = require('fs');

const CONFIG_FILE = 'db-config.json';

function readDbConfig() {
  const data = JSON.parse(fs.readFileSync(CONFIG_FILE));
  console.log(data);
  return data;
}

function writeDbConfig(key, val) {
  const data = JSON.parse(fs.readFileSync(CONFIG_FILE));
  data[key] = val;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data));
  console.log(data);
  return data;
}

// allow every browser to get response from this server
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// set necessary configurations for the database
app.get('/setdbconfig', async (req, res) => {
  const CONF = readDbConfig();
  writeDbConfig('url', req.query.url);
  writeDbConfig('secret', req.query.secret);
  res.write(readDbConfig());
  res.end();
});

// get token 
app.get('/requesttoken', async (req, res) => {
  const CONF = readDbConfig();
  const { body } = await got(CONF.url + '/requesttoken?secret=' + CONF.secret);
  res.write(body);
  res.end();
});

// get echo
app.get('/echo', async (req, res) => {
  const { body } = await got(BASE + '/echo', {
    headers: {
      'Authorization': 'Bearer flt8i8l4q1lt6isqam4i1lhgq66jthur',
    }
  });
  console.log('body: ', body);
  res.write(body);
  res.end();
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log('proxy server on 9000'));