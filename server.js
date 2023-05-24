/**
 * Created by Ashik on 24/05/2023
 */

require('dotenv').config();
const  express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const ejs = require('ejs')
const bcrypt = require('bcrypt');
const mysql = require('mysql')
const MemoryStore = require('memorystore')(session);


const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

conn.connect((err)=>{
    if(err) console.log(err);
    else console.log('Connected to database...');    
})

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
        checkPeriod: 86400000 
    })
}))

// verify user
const isAuthenticated = async (req, res, next)=>{
    if(req.session.loggedIn){        
        next();
    }        
    else    
        res.redirect('/login')
}

// unauthorized user?
const isNotAuthenticated = async (req, res, next)=>{
    if(!req.session.loggedIn)
        next();
    else    
        res.redirect('/');
}

// Routes
app.get('/', isAuthenticated, (req, res)=>{
    res.render('home');
})


app.get('/profile', isAuthenticated, (req, res)=>{
    res.render('profile');
})


app.get('/login', isNotAuthenticated,(req, res)=>{
    res.render('login')
})

app.post('/login', (req, res)=>{
    const loginEmail = req.body.email;
    const loginPassword = req.body.password;

    let sql = 'SELECT * FROM users WHERE Email=?';
    conn.query(sql, [loginEmail], async (err, found)=>{        

        // Found someone
        if(found[0]){            
            try{                
                if(await bcrypt.compare(loginPassword, found[0].Password)){
                    req.session.loggedIn = true;
                    req.session.name = found[0].Name;
                    req.session.email = found[0].Email;
                    res.redirect('/')
                    console.log('Logged in...');
                }
                else{
                    console.log('Incorrect password...');
                    res.redirect('/login');
                }
            } catch(e){
                console.log(e);
                res.redirect('/login');
            }
        }
        else{
            console.log('User not found...'); //no user found
            res.redirect('/login');
        }
    })
})


app.get('/register', isNotAuthenticated, (req, res)=>{
    res.render('register');
})

app.post('/register', async (req, res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user  = {
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        }

        let sql = "SELECT Email FROM users WHERE Email=?";
        conn.query(sql, [user.email], (err, result)=>{
            if(!err){
                if(result[0]){
                    console.log('User exists...');
                    res.redirect('/register');
                }
                else{
                    // registering user        
                    sql = 'INSERT INTO users(Name, Email, Password) VALUES (?,?,?)';
                    conn.query(sql, [user.name, user.email, user.password], (err, data)=>{
                        if(!err){
                            req.session.loggedIn = true;
                            req.session.name = user.name;
                            req.session.email = user.email; 
                            console.log('User registered...');
                        }
                    })                       
                    res.redirect('/');
                }
            }
        })                    
    } catch(e){
        console.log(e);
        res.redirect('/register');
    }
})


app.get('/logout', isAuthenticated, (req, res)=>{
    req.session.destroy();
    console.log('Logged out...');
    res.redirect('/login');
})


app.listen(3000, (err)=>{
    console.log('Magic happens on port 3000');
});
