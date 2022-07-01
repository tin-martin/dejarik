const express = require('express')
const app = express()
const path = require('path')


app.use(express.static(__dirname+'/public'));
app.use('/build/',express.static(path.join(__dirname,'node_modules/three/build'))   );
app.use('/jsm/',express.static(path.join(__dirname,'node_modules/three/examples/jsm')));
app.use('/images/',express.static(path.join(__dirname,'images')));
app.listen(3000, ()=>
   console.log("HI")
);