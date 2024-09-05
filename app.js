const express = require('express');
const cors=require("cors");
const app=express();
require("dotenv").config();
const PORT = process.env.PORT || 8081;
const host='0.0.0.0';
const path = require("path");
const axios=require("axios");
require("./db/conn");
const bodyparser =require("body-parser");

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

const routes = require("./routes/weatherRoutes");
app.use('/api', routes)


app.use((err,req,res,next)=>{
    err.statuCode = err.statusCode(500);
    err.message=err.message("Internal Server Error");
    res.status(err.statuCode).json({
        message:err.message,
    });
});

app.listen(PORT,host,()=>
{
    console.log(`listening to port at ${PORT}`)
    
})

require("./controller/cronjob");