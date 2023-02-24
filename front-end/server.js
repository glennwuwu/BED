const express = require("express");
const serveStatic = require("serve-static");

const { hostname, port } = require("./config/config");

const app = express();

app.use((req, res, next) => {
  console.log(req.url);
  console.log(req.method);
  console.log(req.path);
  console.log(req.query.id);

  if (req.method !== "GET") {
    res.type(".html");
    const msg = "<html><body>This server only serves web pages with GET!</body></html>";
    res.end(msg);
  } else {
    next();
  }
});

app.use(serveStatic(`${__dirname}/public`));

app.listen(port, hostname, () => {
  console.log(`Server hosted at http://${hostname}:${port}`);
});
