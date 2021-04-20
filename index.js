var bodyParser = require('body-parser');
const amf = require("amf-client-js");
const express = require("express");
const {
  createHTTPProxy
} = require('./proxyHandlers')
const proxyStore = require('./proxyStore')

//
amf.AMF.init();

// Server setup
const app = express();
const port = 5000;
const ramlRenderer = new amf.Raml10Renderer();
const oasRenderer = new amf.Oas20Renderer();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
app.set("view engine", "ejs");
app.get("/proxies/create", handleCreateProxyGet);
app.post('/proxies/create', handleCreateProxyPost);
app.get('/proxies/:id', handleGetProxy);
app.get('/proxies/:id/model', handleGetProxyModel);

app.get('/', handleMain);

// Main handlers

function handleMain(req, res) {
  console.log(proxyStore.getAll())
  res.render("proxyIndex", {
    proxies: proxyStore.getAll()
  });
}

function handleCreateProxyGet(req, res) {
  res.render("proxyCreate", {});
}

function handleCreateProxyPost(req, res) {
  //TODO validate req.body
  const proxy = proxyStore.create(req.body);
  createHTTPProxy(proxy, app);
  res.redirect(`/`);
}

function handleGetProxy(req, res) {
  res.send(200, JSON.stringify(proxyStore.get(req.param("id"))))
}

async function handleGetProxyModel(req, res) {
  const model = proxyStore.get(req.param("id")).model;
  const amfModelRaml = await ramlRenderer.generateString(model);
  const amfModelOas = await oasRenderer.generateString(model);

  res.render("model", {
    amfModelRaml,
    amfModelOas
  })
}




// For dummy project
const cocoProxy = proxyStore.create({
  apiName: "all around",
  apiDescription: "la api del coco",
  apiURL: 'http://all-around.herokuapp.com/all',
  apiVersion: "v1"
});
createHTTPProxy(cocoProxy, app);
