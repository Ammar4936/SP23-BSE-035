const express = require("express");
let app  = express();

app.set("view engine","ejs");
app.use(express.static("public"));


app.get("/CV",(req,res)=>{
    res.render("CV");
})

app.get("/",(req,res)=>{
    res.render("home");
})

app.listen(5004,() => {
    console.log("Server started at location: 5004")
})