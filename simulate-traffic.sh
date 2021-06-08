echo "GET /employees to the proxy"
curl -i -s https://api-spec-proxy.herokuapp.com/proxies/2/proxy/employees | head -n 1|cut -d$' ' -f2
sleep 1
echo "GET non existing endpoint to the proxy"
curl -i -s https://api-spec-proxy.herokuapp.com/proxies/2/proxy/nonExistingEndpoint | head -n 1|cut -d$' ' -f2
sleep 1
echo "POST /create to the proxy"
curl -i -s --header "Content-Type: application/json"  --data '{"name":"test","salary":"123","age":"23"}' -X POST https://api-spec-proxy.herokuapp.com/proxies/2/proxy/create | head -n 1|cut -d$' ' -f2




#Use this api http://dummy.restapiexample.com/api/v1
