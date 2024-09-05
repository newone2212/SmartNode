const mongoose = require('mongoose');

//set up database connection
mongoose.connect("mongodb+srv://paru123:jaigopal123_@cluster0.trzg2kg.mongodb.net/SmartNodedb").then((db)=>{
    console.log("connection is succesful");
}).catch((err)=>{
    console.log("no connection",err);
})

