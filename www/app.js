const {app} = require("../server")
const config = require("../configs/mongoConfig")
const mongoose = require("mongoose")


//connection à mongoDB:
mongoose.connect(config.DB_URI)

const db = mongoose.connection

db.on('error', (err)=>{
console.log(err);
});

db.on('open', () =>{
console.log('la database est bien connecté');
});


app.listen(config.port, () => {
        console.log (`le serveur est démaré sur http://localhost:${config.port}/acceuil`)
});
