var bodyParser = require('body-parser');
const amf = require("amf-client-js");
const express = require("express");
const httpProxy = require('http-proxy');
const models = amf.model.domain;
amf.AMF.init();
const proxyStore = require('./proxyStore')
// Proxy Server

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




function handleMain(req, res) {
  res.send(200, "main");
}

function handleCreateProxyGet(req, res) {
  res.render("proxyCreate", {});
}

function handleCreateProxyPost(req, res) {
  //TODO validate req.body
  const proxy = proxyStore.create(req.body);
  createHTTPProxy(proxy);
  console.log("proxy created", proxy)

  res.redirect(`/proxies/${proxy.id}`);
}


function handleGetProxy(req, res) {
  res.send(200, JSON.stringify(proxyStore.get(req.param("id"))))
}


function createHTTPProxy(proxy) {

  const api = new models.WebApi()
    .withName("Wachiturro api")
    .withVersion("versionPiola");

  const model = new amf.model.document.Document();
  model.withEncodes(api);

  proxyStore.set(proxy.id, {
    ...proxy,
    api,
    model
  })

  const apiProxy = httpProxy.createProxyServer({});

  app.get(`/proxies/${proxy.id}/proxy/**`, function (req, res) {
    req.url = req.url.replace(`/proxies/${proxy.id}/proxy`, "");
    console.log("redirect", req.url, "olis", proxy.apiURL)
    return apiProxy.web(req, res, {
      target: proxy.apiURL,
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

    // ignore status code 4xx and 5xx
    if (statusCode < 400) {
      const endpoint = api.endPoints.find(
        (endpoint) => endpoint.path.value() == url
      );
      // don't reinsert endpoint
      if (!endpoint) {
        api
          .withEndPoint(url)
          .withOperation(method.toLowerCase())
          .withResponse(statusCode);
      }
    }
  });
}

const cocoProxy = proxyStore.create({
  apiName: "all around",
  apiDescription: "la api del coco",
  apiURL: 'http://all-around.herokuapp.com/all',
  apiVersion: "v1"
});
createHTTPProxy(cocoProxy);

async function handleGetProxyModel(req, res) {
  const amfModel = await renderer.generateString(proxyStore.get(req.param("id")).model);
  res.render("model", {
    amfModel
  })
}
