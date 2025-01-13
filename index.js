const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const port = process.env.PORT || 3301

// Router configuration

const adminRouter = require('./Routers/adminRouter')
const userRouter = require('./Routers/userRouter')

// Database configuration

require('./config/db')

// middleware
app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended : true }))
app.use(express.static('uploads'))


// origin setup
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});


app.use('/api', adminRouter)   
app.use('/api', userRouter)   

app.post('/' , (req , res)=> {
    res.send("Hello")
})

app.listen(port , ()=>{
    console.log(`Server is Runnig at PORT : ${port}`);
})