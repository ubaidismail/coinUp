const express = require("express");
const dbConnect = require("./Database/index");
const {PORT} = require('./config/index');
const router = require('./routes/index');
const errorHanlder = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const app =  express();

app.use(cookieParser());
app.use(express.json()); // middleware --- it allowes app to communicate in data in json format
app.use(router);

dbConnect();
app.use('/storage', express.static('storage')); //this for viewing saved images in browser 
app.use(errorHanlder);
app.listen(PORT , () => {
    console.log(`Backend is running on PORT:${PORT}`);
})