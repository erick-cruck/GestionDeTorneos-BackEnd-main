'use strict'

var Liga = require('../models/liga.model')
var Team = require('../models/team.model')
var User = require('../models/user.model')
var fs = require('fs');
var path = require('path');
const { exec } = require('child_process');

function createLiga(req, res) {
    var liga = new Liga();
    var params = req.body;
    var userId = req.params.idU

    Liga.findOne({ name: params.name }, (err, ligaFind) => {
        if (err) {
            res.status(500).send({ message: "Error general" })
        } else if (ligaFind) {
            res.send({ message: "Nombre de liga ya en uso" })
        } else {
            liga.name = params.name;
            liga.descripcion = params.descripcion;
            liga.teamCount = 0;
            liga.image = params.image;
            liga.save((err, ligaSaved) => {
                if (err) {
                    res.status(500).send({ message: 'Error general' })
                } else if (ligaSaved) {
                    User.findByIdAndUpdate(userId, { $push: { ligas: ligaSaved._id } }, { new: true }, (err, ligaPush) => {
                        if (err) {
                            return res.status(500).send({ message: 'Error general' })
                        } else if (ligaPush) {
                            return res.send({ message: 'Liga agregada con éxito!', ligaPush })
                        } else {
                            liga.name = params.name;
                            liga.descripcion = params.descripcion;
                            liga.teamCount = 0;
                            liga.image = 'https://www.soyfutbol.com/__export/1618078302464/sites/debate/img/2021/04/10/la_liga_espaxa_tabla_posiciones_clasificacixn_general_fc_barcelona_real_madrid_atletico_madrid_crop1618078261996.jpg_1902800913.jpg';
                            liga.save((err, ligaSaved) => {
                                if (err) {
                                    res.status(500).send({ message: 'Error general' })
                                } else if (ligaSaved) {
                                    User.findByIdAndUpdate(userId, { $push: { ligas: ligaSaved._id } }, { new: true }, (err, ligaPush) => {
                                        if (err) {
                                            return res.status(500).send({ message: 'Error general' })
                                        } else if (ligaPush) {
                                            return res.send({ message: 'Liga agregada con éxito!', ligaPush })
                                        } else {
                                            return res.send({ message: 'No se agregó la liga' })
                                        }
                                    })
                                } else {
                                    res.send({ message: 'No se guado el equipo' });
                                }
                            })
                        }
                    })
                } else {
                    res.send({ message: 'No se guado el equipo' });
                }
            })
        }
    })
}

function updateLiga(req, res) {
    let userId = req.params.idU;
    let ligaId = req.params.idL
    let update = req.body;

    Liga.findOne({ name: update.name }, (err, ligaFinded) => {
                        if (err) {
                            return res.status(500).send({ message: 'Error general' })
                        } else if (ligaFinded) {
                            return res.send({ message: 'Nombre de liga ya en uso' })
                        } else {
                            Liga.findById(ligaId, (err, ligaFind) => {
                                if (err) {
                                    res.status(500).send({ message: 'Error general' })
                                } else if (ligaFind) {
                                    User.findOne({ _id: userId, ligas: ligaId }, (err, userFind) => {
                                        if (err) {
                                            return res.status(500).send({ message: 'Error general' })
                                        } else if (userFind) {
                                            Liga.findByIdAndUpdate(ligaId, update, { new: true }, (err, ligaUpdated) => {
                                                if (err) {
                                                    return res.status(500).send({ message: 'Error general' })
                                                } else if (ligaUpdated) {
                                                    return res.send({ message: 'Liga actualizada: ', ligaUpdated })
                                                } else {
                                                    return res.send({ message: 'Liga no actualizada' })
                                                }
                                            })
                                        } else {
                                            return res.status(404).send({ message: 'Usuario no encontrado' })
                                        }
                                    })
                                } else {
                                    return res.status(404).send({ message: 'No se econtró la liga' })
                                }
                            })
                        }
                    })
}

function deleteLiga(req, res) {
    let userId = req.params.idU;
    let ligaId = req.params.idL;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tienes permiso para realizar esta accion' })
    } else {
        User.findByIdAndUpdate({ _id: userId, ligas: ligaId },
            { $pull: { ligas: ligaId } }, { new: true }, (err, ligaPull) => {
                if (err) {
                    return res.status(500).send({ message: 'Error general' })
                } else if (ligaPull) {
                    Liga.findOneAndRemove(ligaId, (err, ligaRemoved) => {
                        if (err) {
                            return res.status(500).send({ message: 'Error general' })
                        } else if (ligaRemoved) {
                            return res.send({ message: 'Liga eliminada', ligaPull })
                        } else {
                            return res.send({ message: 'No se eliminó la liga' })
                        }
                    })
                } else {
                    return res.status(500).send({ message: 'No se pudo eliminar la liga' })
                }
            }).populate('ligas')
    }
}


function getTeams(req, res) {
    var ligaId = req.params.idL;

    Liga.findById(ligaId).populate({
        path: 'teams',
        populate: {
            path: 'liga',
        }
    }).exec((err, teams) => {
        if (err) {
            res.status(500).send({ message: 'Error al buscar Equipos' })
        } else if (teams) {
            res.status(200).send({ message: 'Equipos de la Liga', teams })
        } else {
            return res.status(404).send({ message: 'No hay registros de equipos' })
        }
    })
}

function getlIGAiD(req, res) {
    var idUser = req.params.idUser
    Liga.findOne({$or: [{_id: idUser}]}).exec((err, LigaGest)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de busqueda'})
        if(!LigaGest) return res.status(404).send({message: 'No se encontra ninguna liga'})
        return res.status(200).send(LigaGest)
    })
}

function getLiga(req, res) {
    var idUser = req.params.idUser
    User.findOne({ $or: [{ _id: idUser }] }).exec((err, userGetId) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion busqueda del usuario' })
        if (!userGetId) return res.status(404).send({ mensaje: 'Error al obtener los datos del usuario' })
        Liga.find({}).exec((err, ligaFind) => {
            if (err) return res.status(500).send({ message: 'Error en la petición de busqueda' })
            if (!ligaFind) return res.status(404).send({ mensaje: 'No se a podido obtener las ligas' })
            return res.status(200).send(ligaFind)
        })

    })
}

function getLigasAdmin(req, res) {
    Liga.find({}).exec((err, users) => {
        if (err) {
            res.status(500).send({ message: 'Error general al buscar usuarios' });
        } else if (users) {
            res.status(200).send(users);
        } else {
            res.send({ message: 'No existe ningun usuario' })
        }
    })
}

function updateLigaAdmin(req, res) {
    var ligaId = req.params.idL
    var params = req.body

    if (req.user.role != "ROLE_ADMIN") {
        return res.status(500).send({ mensaje: 'No eres administrador no puedes editar esta liga' })
    }

    Liga.findByIdAndUpdate(ligaId, params, { new: true }, (err, updateLiga) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!updateLiga) return res.status(404).send({ mensaje: 'No se puede atualizar liga' })

        return res.status(200).send(updateLiga)
    })

}

function deleteLigaAdmin(req, res) {
    var ligaId = req.params.idL

    if (req.user.role != "ROLE_ADMIN") {
        return res.status(500).send({ mensaje: 'No eres administrador no puedes editar esta liga' })
    }

    Liga.findByIdAndDelete(ligaId, (err, ligaDelete) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!ligaDelete) return res.status(200).send({ mensaje: 'No se ha podido eliminar la liga' })

        return res.status(200).send({ mensaje: 'Se elemino de forma correcta la liga con id:' + ligaId })
    })


}

module.exports = {
    createLiga,
    getTeams,
    updateLiga,
    deleteLiga,
    getLiga,
    getLigasAdmin,
    deleteLigaAdmin,
    updateLigaAdmin,
    getlIGAiD
}