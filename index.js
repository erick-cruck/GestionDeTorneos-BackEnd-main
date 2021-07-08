'use strict'

var mongoose = require('mongoose');
var app = require('./app')
var inicioUsuario = require('./controllers/user.controller');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
    .then(()=>{
        console.log('conectado a la bd');
        inicioUsuario.createInit();
        app.listen(port, ()=>{
            console.log('servidor de express corriendo')
        })
    })
    .catch((err)=>{console.log('Error al tratar de conectarse')})