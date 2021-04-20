const httpProxy = require('http-proxy');
const amf = require("amf-client-js");
const models = amf.model.domain;
amf.AMF.init();

function createHTTPProxy(proxy, app) {
    const api = new models.WebApi()
        //TODO: change
        .withName(proxy.apiName)
        .withVersion(proxy.apiVersion)
        .withDescription(proxy.apiDescription);

    const model = new amf.model.document.Document();
    model.withEncodes(api);

    proxy.api = api;
    proxy.model = model;

    const apiProxy = httpProxy.createProxyServer({});

    handleNewProxyRoutes(proxy, apiProxy);
    apiProxy.on("proxyRes", handleProxyResponse(api));

    apiProxy.on('error', function (err, req, res) {
        console.log(err)
        res.send(500)
    });

    function handleNewProxyRoutes(proxy, apiProxy) {
        app.get(`/proxies/${proxy.id}/proxy/**`, function (req, res) {
            req.url = req.url.replace(`/proxies/${proxy.id}/proxy`, "");
            return apiProxy.web(req, res, {
                target: proxy.apiURL,
                changeOrigin: true
            });
        });
        app.x(`/proxies/${proxy.id}/proxy/**`, function (req, res) {
            req.url = req.url.replace(`/proxies/${proxy.id}/proxy`, "");
            return apiProxy.web(req, res, {
                target: proxy.apiURL,
                changeOrigin: true
            });
        });
    }

    function handleProxyResponse(api) {
        return (proxyRes, req, res) => {
            console.log("proxypass", req.url, "response: " + proxyRes.statusCode);
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
                    api.withEndPoint(url)
                        .withOperation(method.toLowerCase())
                        .withResponse(statusCode);
                }
            }
        }
    }
}


module.exports = {
    createHTTPProxy
}
