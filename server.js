var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var handlebars = require("express-handlebars");

var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
var PORT = 3000;
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

app.engine(
  "handlebars",
  handlebars({
    defaultLayout: "main"
  })
);

app.set("view engine", "handlebars");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Routes

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/scrape", function(req, res) {
  axios.get("http://www.nytimes.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("article h2").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";