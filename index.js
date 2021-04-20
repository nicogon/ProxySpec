var bodyParser = require('body-parser');
const express = require("express");
const httpProxy = require('http-proxy');
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


  const proxyId = proxyStore.create({
    target,
    name,
    description
  });

  model = createProxy({
    target,
    name,
    description,
    proxyId
  });


  res.redirect('/');
}


function handleGetProxy(req, res) {
  res.send(200, JSON.stringify(proxyStore.get(req.param("id"))))
}


function createProxy({
  target,
  name,
  description,
  proxyId
}) {

  const apiProxy = httpProxy.createProxyServer({});

  app.get(`/proxies/${proxyId}/proxy/*`, function (req, res) {
    //req.url = req.url.replace(`/proxies/${proxyId}/proxy`, "");
    console.log("redirect",req.url, "olis", target)
    return apiProxy.web(req, res, {
      target
    });
  });

  apiProxy.on("error", (e)=>console.log(e))

  apiProxy.on("proxyRes", function (proxyRes, req, res) {
    console.log("proxypass", req.url, proxyRes.statusCode);
    const {
      statusCode,
      status
    } = proxyRes;
    const {
      url,
      method
    } = req;
  });
}

createProxy({target:'http://all-around.herokuapp.com/all', proxyId:1})
