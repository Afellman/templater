const inquirer = require("inquirer");
const fs = require("fs");
const http = require("http");


function makeFolders(path, db) {
  fs.mkdirSync(path);
  fs.mkdirSync(path + "/public");
  fs.mkdirSync(path + "/routes");
  fs.mkdirSync(path + "/public/assets");
  fs.mkdirSync(path + "/public/assets/js");
  fs.mkdirSync(path + "/public/assets/css");
  fs.mkdirSync(path + "/public/assets/images");
  fs.mkdirSync(path + "/views");
  fs.mkdirSync(path + "/views/pages");
  fs.mkdirSync(path + "/views/partials");

  if (db) {
    fs.mkdirSync(path + "/models");
    fs.mkdirSync(path + "/controller");
  }
}

const libraryDownloads = {
  jQuery: (path) => {
    console.log(path)
    console.log(fs.existsSync(path + "/public/assets/js"))
    console.log(fs.existsSync(path + "/public"))
    console.log(fs.existsSync(path))
    const file = fs.createWriteStream(path + "/public/assets/js/jquery.min.js");
    http.get("http://code.jquery.com/jquery-3.4.1.min.js", function (response) {
      response.pipe(file);
    });
    return { path: "/js/jquery.min.js", css: false }
  },
  bootstrap: (path) => {
    const file = fs.createWriteStream(path + "/public/assets/css/bootstrap.min.css");
    const file1 = fs.createWriteStream(path + "/public/assets/js/popper.min.js");
    const file2 = fs.createWriteStream(path + "/public/assets/js/bootstrap.min.js");

    http.get("http://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css", (response) => {
      response.pipe(file);
    });
    http.get("http://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js", (response) => {
      response.pipe(file1);
    });
    http.get("http://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js", (response) => {
      response.pipe(file2);
    });
    return [
      { path: "/css/bootstrap.min.css", css: true },
      { path: "/js/popper.min.js", css: false },
      { path: "/js/bootstrap.min.js", css: false },
    ]
  },
  socketio: () => {
    const request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", (response) => {
      response.pipe(file);
    });
    return "/js/jquery.min.js"
  },
  moment: () => {
    const request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", (response) => {
      response.pipe(file);
    });
    return "/js/jquery.min.js"
  },
}

function generateHome(path, title) {
  fs.writeFile(path + "/views/pages/home.ejs",
    `<% - include('partials/nav') %>
    <div class="container-fluid">
    <div class="jumbotron">
      <h1>Welcome to my site</h1>
    </div>
    </div>
    <div class="container">
      <div class="row">
        <div class="col">

        </div>
      </div>
    </div>


    `, () => { });
}

function makeNav(path, pages) {
  const links = pages.map((page) => {
    return `<li class="nav-item">
    <a class="nav-link" href="/${page.title.toLowerCase()}">${page.title}</a>
  </li>`
  });

  const nav = `<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">Navbar</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item active">
          <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
        </li>
        ${links.join("")}
      </ul>
    </div>
  </nav>`;

  fs.writeFileSync(path + "/views/partials/nav.ejs", nav, () => { });
}

function generateAbout(path) {
  fs.writeFile(path + "/about.ejs", "Hello World Home", () => { });
}

function generateProducts() {
  console.log("Products")
}

function generateContact() {
  console.log("Contact")
}

function generateBlog() {
  console.log("Blog")
}

function makeLinks(libraries) {
  const obj = { css: [], scripts: [] };
  libraries.forEach(library => {
    if (Array.isArray(library)) {
      library.forEach(subLibrary => {
        if (subLibrary.css) {
          obj.css.push("<link rel='stylesheet' href='/assets" + subLibrary.path + "'/>");
        } else {
          obj.scripts.push("<script src='/assets" + subLibrary.path + "'/>")
        }
      })
    } else {
      if (library.css) {
        obj.css.push("<link rel='stylesheet' href='/assets" + library.path + "'/>");
      } else {
        obj.scripts.push("<script src='/assets/" + library.path + "'/>")
      }
    }
  })
  return obj;
}

function makeHead(path, links, name) {
  const head = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${name}</title>
    ${links.join("\n")}
  </head>
  <body>`
  fs.writeFileSync(path + "/views/partials/head.ejs", head);
}

function makeScripts(links, path) {
  const scripts = `${links.join("\n")}</body></html>`
  fs.writeFileSync(path + "/views/partials/scripts.ejs", scripts);
}

function generateServer(path, db) {

  const server = `
const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");

const PORT = process.env.PORT || 3000;

const app = express();

// Require our routes
const routes = require("./routes");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(routes);

${db
      ? `
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
  mongoose.connect(MONGODB_URI);`
      : ""
    }


app.listen(PORT, function () {
  console.log("Listening on port: " + PORT);
});
`

  fs.writeFile(path + "/server.js", server, () => { });
}

function makeRoutes(path, pages) {
  const routes = pages.map(page => {
    const pageName = page.title.toLowerCase();
    let route = pageName == "home" ? "/" : "/" + pageName;
    return ` 
    router.get(${route}, function(req, res) {
      res.render(${page.title.toLowerCase()});
    });
    `
  });

  const htmlRoutes = `
  const router = require("express").Router();
  
  ${routes.join("\n")}
  
  module.exports = router;
  `

  fs.writeFile(path + "/routes/view/index.js")
}

inquirer.prompt([
  {
    message: "Project Name?",
    type: "Input",
    name: "projectName"
  },
  {
    type: "checkbox",
    name: "pages",
    message: "Select pages to include",
    choices: [
      { name: "Home", value: { title: "Home", func: generateHome } },
      { name: "About", value: { title: "About", func: generateAbout } },
      { name: "Contact", value: { title: "Contact", func: generateContact } },
      { name: "Blog", value: { title: "Blog", func: generateBlog } },
      { name: "Products", value: { title: "Products", func: generateProducts } }
    ]
  },
  {
    type: "checkbox",
    name: "libraries",
    message: "What frontend libraries do you need?",
    choices: [
      { name: "jQuery", value: libraryDownloads.jQuery },
      { name: "bootstrap", value: libraryDownloads.bootstrap },
      { name: "socket.io", value: libraryDownloads.socketio },
      { name: "moment", value: libraryDownloads.moment },
    ]
  },
  {
    type: "confirm",
    name: "db",
    message: "Database?",
  },
]).then((res) => {
  const folderPath = __dirname + "/" + res.projectName;
  const db = res.db;
  makeFolders(folderPath, db);
  const libraries = res.libraries.map((func) => func(folderPath));
  const links = makeLinks(libraries);
  makeHead(folderPath, links.css, res.projectName);
  makeScripts(links.scripts, folderPath);
  makeNav(folderPath, res.pages);
  res.pages.forEach((page) => page.func(folderPath, page.title));
  generateServer(folderPath, db);
  makeRoutes(folderPath, pages);
});
