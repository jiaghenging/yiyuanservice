const express = require('express');
const app = express();
const cors= require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.json({limit: '5000mb'}));
app.use(bodyParser.urlencoded({ extended: false ,limit: '10mb'}));
app.use(express.static('./upload'))
const router= require('./router.js')

app.use(cors());

app.use(router);
app.listen(8090,function(){
    console.log('server is running at http://127.0.0.1:8090')
})