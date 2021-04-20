var bodyParser = require('body-parser');
const amf = require("amf-client-js");
const express = require("express");
const httpProxy = require('http-proxy');
const proxyStore = require('./proxyStore')
// Proxy Server

const app = express();
const port = 5000;
const renderer = new amf.Raml10Renderer();

/*

app.use(bodyParser.urlencoded({
  extended: true
}));

*/
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

app.post('/proxies', handleCreateProxy);
app.get('/proxies/:id', handleGetProxy);
app.get('/proxies/:id/model', handleGetProxyModel);
app.get('/', handleMain);

app.get('/uno/dos', handleMain);


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

  app.get(`/proxies/${proxyId}/proxy/**`, function (req, res) {
    req.url = req.url.replace(`/proxies/${proxyId}/proxy`, "");
    console.log("redirect", req.url, "olis", target)
    return apiProxy.web(req, res, {
      target,
      changeOrigin: true
    });
  });




  apiProxy.on('proxyReq', function (proxyReq, req) {
    // keep a ref
    req._proxyReq = proxyReq;
  });

  apiProxy.on('error', function (err, req, res) {
    console.log(err)
    res.send(500)
  });

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

createProxy({
  target: 'http://all-around.herokuapp.com/all',
  proxyId: 1
})

async function handleGetProxyModel(req, res) {
  const amfModel = await renderer.generateString(proxyStore.get(req.param("id")).model);
  res.render("model", { amfModel })
}
