const amf = require("amf-client-js");
const models = amf.model.domain;
var FormData = require("form-data");
var bodyParser = require('body-parser'); 

const httpProxy = require("http-proxy");
const express = require("express");
const fs = require('fs');
const fetch = require("node-fetch");
const createAsset = require("./apid");

var streamer = require('string-to-stream')

amf.AMF.init();

const stringDataType = "http://www.w3.org/2001/XMLSchema#string";

const api = new models.WebApi()
  .withName("Wachiturro api")
  .withVersion("versionPiola");

const model = new amf.model.document.Document();

model.withEncodes(api);

const renderer = new amf.Raml10Renderer();

// Fake server
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.type("text/plain");
  res.send("some text");
});

app.get("/uno", (req, res) => {
  res.send(200, "asd");
});

app.get("/tres", (req, res) => {
  res.send(500, "fff");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Proxy Server

const app2 = express();
const port2 = 5000;
var apiProxy = httpProxy.createProxyServer();

app2.use(bodyParser.urlencoded({ extended: true }));


app2.listen(port2, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app2.get("/proxy/*", function (req, res) {
  req.url = req.url.replace("/proxy", "");
  apiProxy.web(req, res, { target: "http://0.0.0.0:3000" });
});

app2.get("/model", (req, res) => {
  renderer
    .generateString(model)
    .then((model) => res.render("model", { model }));
});


app2.post('/exchange', (req,res)=>{
const formData = new FormData();
formData.append("name", "nico");
formData.append('description','pepe');
formData.append('properties.mainFile','pepe.raml');
formData.append('properties.apiVersion', 'v1')
const elFile = streamer(req.body.spec);
elFile.path  = "raml.raml";

formData.append("files.raml.raml", elFile );

//console.log(fs.createReadStream('raml.raml'))

const authorization =
  "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJ1cm46YW55cG9pbnQ6bmFtZXM6aWRlbnRpdHk6Y2xhaW06YXV0aG9yaXphdGlvbkNvbnRleHQiOiJ1c2VyIiwidXJuOmFueXBvaW50Om5hbWVzOmlkZW50aXR5OmNsYWltOnVzZXJJZCI6ImEzYTkwYjMxLTA3MjQtNGU5ZC04ZDFmLTU5NTk0NjljZDhjNiIsInVybjphbnlwb2ludDpuYW1lczppZGVudGl0eTpjbGFpbTptYXN0ZXJPcmdJZCI6ImVjYTY2OGZlLWU4OTAtNGFkZC05NGVlLWUxYzE4ODQxYTRjNSIsIm5iZiI6MTYxODg5MjM1OSwiaWF0IjoxNjE4ODkyMzU5LCJ1cm46YW55cG9pbnQ6bmFtZXM6aWRlbnRpdHk6Y2xhaW06ZXhwQXRUaW1lT2ZNaW50aW5nIjoxNjE4OTAzMTU5LCJhdWQiOiJkZXZ4LmFueXBvaW50Lm11bGVzb2Z0LmNvbSIsImlzcyI6Imh0dHBzOi8vZGV2eC5hbnlwb2ludC5tdWxlc29mdC5jb20vYWNjb3VudHMvYXBpL3YyL29hdXRoMi90b2tlbiIsInN1YiI6ImEzYTkwYjMxLTA3MjQtNGU5ZC04ZDFmLTU5NTk0NjljZDhjNiIsImp0aSI6IjU2MTgyYTQzLWVjMDktNDBiNi1iZDQ3LWZhOTA0Mzg2ZDRjYiJ9.CnDcRe2j8drIjVWGAgCOVvg89w_tbbGzWVfwPg3_Go65LrE8GZpSYnWAOc4UuMOjfw9vq1rXD2jNVYCczeCeQXbUnWCqrErbq5rg_gOwtAlTSbjQ8WMQBuhiORinyGuYo6zyQdlmRH0fmOIEBZadjBSk8Anzs77xHtWR9AHTw-BYq6_qguzNgR8Y_5RJA5lUiWZAHefgovXwIlmNQSAIXGZZ8DlqLeXrFaBZw1ux_cSKZROJ_1HgGpfsoDzQBkI6PBkYXcYonXUHUWw94IOKHd90Nu5Pe_AuorsAT2NH5YDSKQeYMWQaAkvFTq939GszkrnlDEIS6TuOGC1ZiAE5gam7QqqnYihv2vjbuW8prGv4jrs7BxlxyZrVJjll6SDcFsfZ1wrcdqW99C1mooe2CyHWNwULVmmBpeHi6cWptoki0RDvmooO-3YFFlHe6Q-NXHIOen53Xflx3NuG85ywZm3cA344QGzVPfd6nJrfxDXG53iXX8RIsE5uRCd8ncH4mcdbW9Xm7H-w4bO8g52CivhoPdu1HjxO1ThVcq7K4M0b_r-N4TxcceXzU-hRT818yyX7Xqbh5mVe5-GPuiFVcmxc1IQPGnZrCtVvCdfCG4Cc4N2006C2U3P1dMTMIuIYvfWNeb17LqWLRvRQeK7iNK2aH4CDfex7979rOgjs02Q";
fetch(
  "https://devx.anypoint.mulesoft.com/exchange/api/v2/organizations/eca668fe-e890-4add-94ee-e1c18841a4c5/assets/eca668fe-e890-4add-94ee-e1c18841a4c5/goloso/"+req.body.version,
  {
    method: "POST",
    body: formData,
    headers: { authorization, "x-sync-publication": true },
  }
)
  .then((response) => response.text().then(text=>res.send(200,text)))
  .catch((error) => console.log('err'));


})

app2.post('/apid', (req,res)=>{
  const assetProps = { 
    name: "nico",
    description: 'pepe',
    groupId: 'group',
    assetId: 'pepe',
    version: '1.0.0',
    classifier: 'raml',
    main: 'pepe.raml',
    apiVersion: 'v1'
  };
  const content = req.body.spec || '';
  const isFirstVersion = req.body.isFirstVersion || true;

  return createAsset({ assetProps, isFirstVersion, content }).then(
    () => res.send(200)
  ).catch(
    () => res.send(400)
  );
})

app2.set("view engine", "ejs");

apiProxy.on("proxyRes", function (proxyRes, req, res) {
  console.log("proxypass");
  console.log(req.url);
  console.log(proxyRes.statusCode);

  const { statusCode, status } = proxyRes;
  const { url, method } = req;

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
