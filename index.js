require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const shortid = require("shortid");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Store shortened URLs in an array (could use a database in a real project)
const urlDatabase = {};

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// API endpoint to generate short URL
app.post("/api/shorturl", function (req, res) {
  const { url } = req.body;

  // Validate the URL using dns.lookup
  dns.lookup(url, (err, address, family) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    // Generate short URL using shortid
    const shortUrl = shortid.generate();

    // Save the mapping (you would use a database in a real app)
    urlDatabase[shortUrl] = url;

    res.json({
      original_url: url,
      short_url: shortUrl,
    });
  });
});

// API endpoint to redirect to the original URL
app.get("/api/shorturl/:shortUrl", function (req, res) {
  const { shortUrl } = req.params;

  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  }

  res.json({ error: "No short URL found for the given input" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
