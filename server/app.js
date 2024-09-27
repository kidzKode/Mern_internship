// require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

const app = express();
const cors = require('cors');
const router = require('./Routes/router');
const PORT = 6010
require('dotenv').config();


app.use(express.json())
app.use(cors()) //by this frontend client can make request from back side 
app.use(bodyParser.json())
app.use(router)
//naccessary for display in front side
app.use("/uploads",express.static("./uploads"));
//export csv
app.use('/files',express.static('./public/files'));

//mongoose connect
mongoose.connect("mongodb://localhost:27017/InternShip",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(()=>
    {
        console.log('connected to databse')
        app.listen(PORT, ()=>{
            console.log(`server started at port ${PORT}`)
        })
    }
)
.catch((err)=>console.log(err))