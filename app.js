const express = require("express");
const session = require('express-session');
const path = require("path");
require("dotenv").config()
const students = require("./api/student");
const subjects = require("./api/subject");
const enrollment = require("./api/enrollment");
const port = process.env.PORT;
const app = express();
//DB
global.mysql = require("mysql");
global.db_config = {
	host:process.env.DB_HOST,
	user:process.env.DB_USER,
	password:process.env.DB_PASSWORD,
	database:process.env.DB_NAME,
	multipleStatements:true
}
global.db = mysql.createPool(db_config);

// Set session timeout to 30 minutes (30 minutes * 60 seconds * 1000 milliseconds)
const sessionTimeout = 30 * 60 * 1000;

// Set up session middleware
app.use(session({
    secret: 'hatdog', // Change this to a secure random key
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: sessionTimeout }
}));

global.message="";


app.set("view engine","ejs"); ///embedded javascript
app.use(express.static("/views"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({"extended":true}));
app.use(express.json());

app.use("/studentslist",students);
app.use("/subjectslist",subjects);
app.use("/enrollmentslist",enrollment);

//create default route
app.get("/",function(req,res) {
    if(req.session.user){
        res.redirect("/studentslist");
    }
    else{
        res.render("login.ejs",{message:message});
        message=""
    }
});


//login
app.get("/login",function(req,res) {
    res.redirect("/");
});
app.post("/login",function(req,res) {
	const email = req.body.email;
    const pword = req.body.pword;
	
    var sql = "SELECT * FROM `user` WHERE email = ? AND password = ?";
    db.query(sql, [email, pword], function(err,results,fields) {
        if (err) {
            res.status(500).json(err); // Error handling
        } else {
            if (results.length > 0) {
                req.session.user = email;
                message = "Logged in successfully"
                res.redirect("/");
            } else {
                res.render("login.ejs",{message:"Invalid email or password"});
            }
        }
    });
}); 

//logout
app.get("/logout",function(req,res) {
    if(req.session.user){
        message = "Successfully logged out";
        req.session.user = ""
        res.redirect("/")
    }
    res.redirect("/")
});


app.listen(port,()=>{
	console.log(`listening at port ${port}`);
})