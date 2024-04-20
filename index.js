import express from "express";
import bodyParser from "body-parser";
import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs";
import path from "node:path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3000;
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));

// openBlog
app.use((req, res, next) => {
  let requestAddress = `${req.originalUrl}`;
  let title = requestAddress.slice(9, -4);
  if (requestAddress.slice(-3) == "txt") {
    requestAddress = path.join(__dirname, requestAddress);

    readFile(requestAddress, (err, data) => {
      if (err) throw err;
      res.render("blogContent.ejs", { data, title });
    });
  } else {
    next();
  }
});

// postpage
app.get("/post", (req, res) => {
  res.render("post.ejs");
});
// modifyPage
app.get("/modify", (req, res) => {
  res.render("modify.ejs");
});
// deletePageSubmit
app.post("/deleteSubmit", (req, res) => {
  console.log(req.body["title"]);
  var filePath = path.join(__dirname, "article/" + req.body["title"] + ".txt");
  console.log(filePath);
  try {
    fs.unlinkSync(filePath);
    console.log("successfully deleted /tmp/hello");
    res.redirect("/");
  } catch (err) {
    // handle the error
    res.status(500).send({ message: "no such file" });
  }
});
// modifyPageSubmit
app.post("/modifySubmit", (req, res) => {
  let filePath = path.join(__dirname, "/article/" + req.body["title"] + ".txt");

  readFile(filePath, "utf-8", (err, data) => {
    if (err) throw err;
    console.log(data);
    res.render("updateBlog.ejs", { data, title: req.body["title"] });
  });
});
// homepage
app.get("/", (req, res) => {
  let fileNameList = [];
  let i = 0;
  async function getFileList() {
    await new Promise((resolve, reject) => {
      fs.readdir(__dirname + "/article", (err, files) => {
        if (err) {
          reject(err);
          console.log(err);
        } else {
          files.forEach((file) => {
            fileNameList[i] = file;

            i++;
          });
          resolve();
        }
      });
    });
  }
  getFileList().then(() => {
    console.log(fileNameList);
    res.render("home.ejs", { fileNameList });
  });
});

// postFunction
app.post("/submit", (req, res) => {
  var title = req.body["title"];
  var content = req.body["content"];
  const promise = writeFile(`article/${title}.txt`, content);
  res.redirect("/");
});

// serverStart
app.listen(port, () => {
  console.log(`server is running on port ${port}.`);
});
