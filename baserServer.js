const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const routerHandlers = require("./routerHandler");
const Utils = require("./utils/utils");

const baseServer = (request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const utils = new Utils();
  const pathname = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");
  const queryStrings = parsedUrl.query;
  const requestMethod = request.method;
  const requestHeaders = request.headers;

  const stringDecoder = new StringDecoder("utf-8");
  let buffer = "";

  request.on("data", (chunk) => {
    buffer += stringDecoder.write(chunk);
  });

  request.on("end", () => {
    buffer += stringDecoder.end();

    const requestedRoute = routes[pathname]
      ? routes[pathname]
      : routerHandlers.pageNotFound;

    const data = {
      pathname: pathname,
      queryStrings: queryStrings,
      requestMethod: requestMethod,
      requestHeaders: requestHeaders,
      payload: buffer ? utils.BodyParser(buffer) : buffer,
    };

    requestedRoute(data, (statusCode, payload) => {
      const status = typeof statusCode === "number" ? statusCode : 404;
      const payloaD = typeof payload === "object" ? payload : {};

      response.setHeader("Content-Type", "application/json");
      response.writeHead(status);
      response.end(JSON.stringify(payloaD));
    });
  });
};

const routes = {
  ping: routerHandlers.ping,
  hello: routerHandlers.hello,
  user: routerHandlers.user,
};

module.exports = baseServer;
