require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const shortid = require("shortid");
const urlParser = require("url"); // 👈 Import necesario para extraer hostname

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Almacenamiento de URLs acortadas (objeto en memoria)
const urlDatabase = {};

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// ✅ Endpoint para acortar URLs
app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  // Validamos el formato de la URL (debe comenzar con http:// o https://)
  if (!/^https?:\/\/.+\..+/.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }

  // Extraemos el hostname para usar en dns.lookup
  const hostname = urlParser.parse(originalUrl).hostname;

  // Validamos si el dominio existe con dns.lookup
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const shortUrl = shortid.generate();

    // Guardamos el mapeo en memoria
    urlDatabase[shortUrl] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl,
    });
  });
});

// ✅ Endpoint para redireccionar a la URL original
app.get("/api/shorturl/:shortUrl", function (req, res) {
  const { shortUrl } = req.params;

  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  }

  res.json({ error: "No short URL found for the given input" });
});

// Iniciar servidor
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
