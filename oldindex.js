const amf = require("amf-client-js");
const models = amf.model.domain;
var FormData = require("form-data");
var bodyParser = require('body-parser'); 

const httpProxy = require("http-proxy");
const express = require("express");
const fs = require('fs');
const fetch = require("node-fetch");

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
  "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJ1cm46YW55cG9pbnQ6bmFtZXM6aWRlbnRpdHk6Y2xhaW06YXV0aG9yaXphdGlvbkNvbnRleHQiOiJ1c2VyIiwidXJuOmFueXBvaW50Om5hbWVzOmlkZW50aXR5OmNsYWltOnVzZXJJZCI6ImEzYTkwYjMxLTA3MjQtNGU5ZC04ZDFmLTU5NTk0NjljZDhjNiIsInVybjphbnlwb2ludDpuYW1lczppZGVudGl0eTpjbGFpbTptYXN0ZXJPcmdJZCI6ImVjYTY2OGZlLWU4OTAtNGFkZC05NGVlLWUxYzE4ODQxYTRjNSIsIm5iZiI6MTYxODkyMzIyNywiaWF0IjoxNjE4OTIzMjI3LCJ1cm46YW55cG9pbnQ6bmFtZXM6aWRlbnRpdHk6Y2xhaW06ZXhwQXRUaW1lT2ZNaW50aW5nIjoxNjE4OTM0MDI3LCJhdWQiOiJkZXZ4LmFueXBvaW50Lm11bGVzb2Z0LmNvbSIsImlzcyI6Imh0dHBzOi8vZGV2eC5hbnlwb2ludC5tdWxlc29mdC5jb20vYWNjb3VudHMvYXBpL3YyL29hdXRoMi90b2tlbiIsInN1YiI6ImEzYTkwYjMxLTA3MjQtNGU5ZC04ZDFmLTU5NTk0NjljZDhjNiIsImp0aSI6IjUxOTQzM2JhLTc0ZGUtNDdjNS05MzczLTY1NTYwYjUyMmUxYyJ9.uU1BOukdhNAUr1Eo_qWLHc0OVRUMbdEhbHf6n-GFgueojeFRTQ_lqH6YsBxTh39vBMKGW1VI4oURQ6_07GMuZlCM--OWjre2LMSKKySRes0meMVzyGGWptpPkvtmoHaVv7zpgPU-n0UBxzHhzeUpIS0qExSH2vXZQ7Jspkyoyan5BJB5_rLIa5g8wal-Dnj73TR6edgseClvQI0NrMB7P8p_9vmXB1GqJSim3lWS8ic0igugdvBj9bNdcMEUmA2BrF88E4xHhZPj6tqjgn9TQOp-Y5iOpf82YOrmDhxwCTecwgsJyNsiXXqrlnqknj6sHE35gBaLJ5aQOkwKTSUaN7EO47mN8zRFsrQSVef_1DuODoYfhX3oewlCJC142za_PtT_KL5S0Ej138V5h6T5ePCtS5AulxH970GFY9Xr79K5ZqNIWcw1IedBP0Kgs53d6AxAJzKBF8Acj7btTFGv1lZq4XW0QJ97VbYqFNM6IJCHM_iVlD1puAXqaR5NuJRItST9iGbUczwBs02YRXeIP3gEC6IZMoQwpk2eGx80YDss8pn7lyDNJZ5MVhr9I-GLnVkIhKjBm-5yrphuW3jJHaXJ-wobyvkjmqkq7w2u1Jzn_Hvx-OBltpVoBaZTjYhOG1Cs6yZodEWv-2yV37R5V7cn0QLOxAJfRRD26BoPzkA";
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
