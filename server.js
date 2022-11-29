const express = require("express");
const session = require("express-session");
// const mongoose = require("mongoose");
const bodyParser = require("body-parser"); //pour acceder au valeur de requete
const cors = require("cors"); //
const path = require("path");
const routes = require("./routes/AllRoutes.routes");

//---------------------Configs------------------------
const app = express();
app.use(cors()); // pour éviter de bloqué le bacjend sur le frontend qui autorise que certain nom de dommaine
app.options("*", cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(session({ secret: "mySecret", resave: true, saveUninitialized: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

//---------------------Server-------------------------

// app.listen(config.port, () => {
//   console.log (`le serveur est démaré sur http://localhost:${config.port}/acceuil`) 
// });
// //connection à mongoDB:
// mongoose.connect(config.DB_URI)
// const db = mongoose.connection
// db.on('error', (error)=>{
//   console.log(err);
// });
// db.on('open', () =>{
//   console.log('la database est bien connecté');
// });

// routes et urls
app.use("/", routes);

module.exports = {
  app
};
