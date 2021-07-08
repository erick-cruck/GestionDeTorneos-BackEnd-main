'use strict'

var mongoose = require('mongoose');
var app = require('./app')
var port= process.env.PORT|| 3000;
var inicioUsuario = require('./controllers/user.controller');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb+srv://admin:admin@cluster0.foqzx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useNewUrlParser: true, useFindAndModify: true})
    .then(()=>{
        console.log('conectado a la bd');
        inicioUsuario.createInit();
        app.listen(port, ()=>{
            console.log('servidor de express corriendo')
        })
    })
    .catch((err)=>{console.log('Error al tratar de conectarse')})