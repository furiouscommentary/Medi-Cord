if (process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}


//Importing libraries that we installed using npm
const express = require("express")
const app = express()
const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const dotenv = require('dotenv').config()
const methodOverride = require("method-override")
const bodyParser=require("body-parser");
const _ = require("lodash");
const multer=require("multer");
const storage =multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,"Images")
    },
    filename: (req,file,cb)=>{
        console.log(file)
        cb(null, Date.now() + Path2D.extname(file.originalname))
    }
})

const upload = multer({storage: storage})
initializePassport(
    passport, 
    email => users.find(user => user.email ===email),
    id => users.find(user => user.id === id)
    )

//adding the list
var items=[];
let workItems=[];
let posts=[];

const users =[]

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,//WE want resave the sesion variable if nothing is changed
    saveUninitialized:false

}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))
app.use(bodyParser.urlencoded({extended: true}));


//configuring the login post functionallity
app.post("/login",checkNotAuthenticated,passport.authenticate("local",{
    successRedirect: "/user",
    failureRedirect: "/login",
    failureFlash: true
}))
app.post("/report",upload.single("image"),checkNotAuthenticated,passport.authenticate("local",{
    successRedirect: "/report",
    failureRedirect: "/user",
    failureFlash: true
}),(req,res)=>{
    res.send("File Uploaded");
})

//Configuring the register post functionality
app.post("/register",checkNotAuthenticated,async(req,res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const hashedAadhar =await bcrypt.hash(req.body.aadhar,10)
        users.push({
          id: Date.now().toString(),
          firstname:req.body.firstname,
          lastname:req.body.lastname,
          fathername: req.body.fathername,
          aadhar: hashedAadhar,
          dob:req.body.dob,
          age: req.body.age,
          email: req.body.email,
          phone:req.body.phone,
          martialstatus: req.body.martialstatus,
          gender: req.body.gender,
          password: hashedPassword

        })
        console.log(users)//Display newly registered users
        res.redirect("/login")
    } catch(e){
        console.log(e);
        res.redirect("/register")
    }
})
//configure the user post functionallity
app.post("/user",function (req,res){
    var item = req.body.newItem;
    items.push(item); 
    
    res.redirect("/user");
 })
 

//USING STATIC FILE
app.use(express.static('public'));


//SET VIEWS
app.set('views', './views');
app.set('view engine', 'ejs');


//NAVIGATION ROUTES
app.get('/',(req, res) =>{
    res.render("index.ejs")
})
app.get('/login',checkNotAuthenticated,(req, res) =>{
    res.render("login.ejs")
})
app.get('/register',checkNotAuthenticated,(req, res) =>{
    res.render("register.ejs")
})
app.get('/user',checkAuthenticated,(req, res) =>{
    res.render("user.ejs",{
        name: req.user.firstname +" " +req.user.lastname,
        email: req.user.email,
        fathername: req.user.fathername,
        age: req.user.age,
        phone: req.user.phone,
        martialstatus: req.user.martialstatus,
        dob: req.user.dob,
        newListItems: items
    });

    //rendering of static pages
})
app.get('/report',(req, res) =>{
    res.render("report.ejs")
})

app.get('/vision',(req, res) =>{
    res.render("vision.ejs")
})
app.get('/home',(req, res) =>{
    res.render("home.ejs")
})
app.get('/about',(req, res) =>{
    res.render("about.ejs")
})
/* //post functioning 
app.post("/posts/:postName",function(req,res){
    const post ={
      title: req.body.postTitle,
      content: req.body.postBody
    };
  posts.push(post);
  res.redirect("/posts/:postName")
  });

app.get("/posts/:postName", function(req,res){
  
    const requestedTitle=_.lowerCase(req.params.postName);
    // for(var i=0;i<posts.length;i++){
    // let match1=posts[i].title; 
    // if(requestedTitle===match1){
    //   console.log("match found");
    // } 
    // }
    posts.forEach(function(post){
      const storedTitle=_.lowerCase(post.title);
      if(requestedTitle===storedTitle){
          console.log("match found");
          res.render("post",{bodyTitle:post.title,
            bodyContent:post.content});
        } 
        else{
          console.log("No match found")
        }
    })
  }); */
  




//route end

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})


function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/user")
    }
    next()
}


//PORT SETUP

if (process.env.NODE_ENV !== "production"){
    module.exports = app;
} else {
    app.listen(3000,()=> console.log("server has started on port 3000"))
}