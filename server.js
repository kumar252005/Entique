if(process.env.NODE_ENV!== 'production')
require('dotenv').config()

const express=require('express')
const app=express();
const bcrypt= require('bcrypt')
const users=[]
const passport=require('passport')
const session=require('express-session')
const flash=require('express-flash')
const methodOverride=require('method-override')

const initializePassport=require('./passport-config');
initializePassport(passport,
    email => {return users.find(user=> user.email === email),
    id =>{return users.find(user=>user.id === id)}
    })
app.set('view-engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
  })
app.get('views/login',checkNotAuthenticated,(req,res)=>{
    res.render('login.ejs')
})
app.post('views/login',checkNotAuthenticated ,passport.authenticate('local',{
  successRedirect:'/',
  failureRedirect:'views/login',
  failureFlash: true   
}))
app.get('views/register',checkNotAuthenticated,(req,res)=>{
    res.render('register.ejs')
})
app.post('views/register',checkNotAuthenticated, async(req,res)=>{
 try{
  const hashedPassword=await bcrypt.hash.req.hash(req.body.password,10)
  users.push({
      id:Date.now().toString(),
      name:req.body.name,
      email:req.body.email,
      password:hashedPassword
  })
  res.redirect('views/login')
}
 catch{
  res.redirect('views/register')
 }
console.log(users)
})

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('views/login')
}
function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
       return res.redirect('/')
    }
    next()
}
app.delete('views/login',(req,res)=>{
    req.logOut()
    res.redirect('views/login')
})
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
