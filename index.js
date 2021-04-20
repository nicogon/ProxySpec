var bodyParser = require('body-parser');
const express = require("express");
const proxyStore = require('./proxyStore')
// Proxy Server

const app = express();
const port = 5000;


app.use(bodyParser.urlencoded({
  extended: true
}));

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

app.post('/proxies', handleCreateProxy);
app.get('/proxies/:id', handleGetProxy);
app.get('/', handleMain);

function handleMain(req, res) {
  res.send(200, "main");
}

function handleCreateProxy(req, res) {
  const {
    target,
    name,
    description
  } = req.body;

  proxyStore.create({
    target,
    name,
    description
  });

  res.redirect('/');
}


function handleGetProxy(req, res) {
  res.send(200, JSON.stringify(proxyStore.get(req.param("id"))))
}
