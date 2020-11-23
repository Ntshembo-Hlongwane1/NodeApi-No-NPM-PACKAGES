const http = require("http");
const baseServer = require("./baserServer");
const https = require("https");
const fs = require("fs");
const _env = require("./utils/environmentVariables");

const http_Server = http.createServer((request, response) => {
  baseServer(request, response);
});

const serverConfigs = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.perm"),
};
const https_server = https.createServer(serverConfigs, (request, response) => {
  baseServer(request, response);
});

const http_PORT = process.env.port;
const https_PORT = 4000;
http_Server.listen(_env.http_PORT, () => {
  console.log(`HTTP Server started on PORT ${_env.http_PORT}`);
});

https_server.listen(_env.https_PORT, () => {
  console.log(`HTTPS Server started on PORT ${_env.https_PORT}`);
});
