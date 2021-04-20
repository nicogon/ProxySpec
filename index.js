var bodyParser = require('body-parser');
const amf = require("amf-client-js");
const express = require("express");
const {createHTTPProxy} = require('./proxyHandlers')
const proxyStore = require('./proxyStore')

//
amf.AMF.init();

// Server setup
const app = express();
const port = 5000;
const renderer = new amf.Raml10Renderer();

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
app.get('/uno/dos', handleMain);




// Main handlers

function handleMain(req, res) {
  res.send(200, "main");
}

function handleCreateProxyGet(req, res) {
  res.render("proxyCreate", {});
}

function handleCreateProxyPost(req, res) {
  //TODO validate req.body
  const proxy = proxyStore.create(req.body);
  createHTTPProxy(proxy, app);
  console.log("proxy created", proxy)
  res.redirect(`/proxies/${proxy.id}`);
}

function handleGetProxy(req, res) {
  res.send(200, JSON.stringify(proxyStore.get(req.param("id"))))
}

async function handleGetProxyModel(req, res) {
  const amfModel = await renderer.generateString(proxyStore.get(req.param("id")).model);
  res.render("model", {
    amfModel
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
