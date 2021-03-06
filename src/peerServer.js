var path = require('path');

var logger = require('../logger');
var P2Pconfig = require('../config');
var peerFunctions = require ('./peerFunctions');
var dl  = require('delivery');
var fs  = require('fs');

function peerServer(httpServer, myId) {
    this.server = httpServer;
    /*** CREATION D'UN P2P SERVER ***/
    var io = require('socket.io').listen(this.server);        // this is the socket.io server
    this.io = io;

    io.maxConnectionsPerPeer = P2Pconfig.maxConnectionsPerPeer;

    io.sockets.on("connection", function (socket) {
        //record his sessionsID if possible.
        if (peerFunctions.getPeers().length >= io.maxConnectionsPerPeer)
        {
            logger.silly('[PeerServer] Désolé client, too many connections ! Max Connection:' + io.maxConnectionsPerPeer);
            socket.emit('disconnect', 'I\'m sorry, too many connections');
            socket.disconnect();
        }
        else
        {

        }

        socket.on("init", function(data)
        {
            logger.silly('[PeerServer] Un nouveau client se connecte ! ');
            peerFunctions.setPeer(data, socket, "server");
            socket.emit("init", {addr: myId.addr, ip:myId.ip, port:myId.port, pseudo:myId.pseudo});;
        });

        socket.on("Ping", function(data)
        {
            logger.silly("[PING] Reçu de "+ data.from.pseudo + " ( "+data.from.addr+" ) " );
            peerFunctions.pingServer(myId,data,socket);
        });

        socket.on("Pong", function(data)
        {
            logger.silly("[PONG] Reçu FROM "+ data.from.pseudo);
            peerFunctions.pongServer(myId,data,socket);

            //var query = {from:myId.addr, to:"", subject:"Query", message:{id: "1", genre:"rock"}, road:[]};
            //io.emit('Query', {});

        });

        socket.on("disconnect", function () {
            peerFunctions.unsetPeer(socket.id);
            logger.silly("[PeerServer] A client disconnects ");
        });


        // RECEIVE A MP3
            var delivery = dl.listen(socket);
            delivery.on('receive.success',function(file){
            logger.log('receive a mp3');
                fs.writeFile("/mp3/friendMp3/"+file.name, file.buffer, function(err){
                    if(err){
                        logger.log('File could not be saved: ' + err);
                    }else{
                        logger.log('File ' + file.name + " saved");
                    };
                });
            });

    });
}

peerServer.prototype.getIO = function() {
    return this.io;
};

peerServer.prototype.queryByGenre = function(genre){
    this.io.sockets.on("connection", function (socket) {
        var query = {
            from:{
                addr:myId.addr,
                pseudo:myId.pseudo,
                ip:myId.ip,
                port: myId.port
            },
            to:"",
            subject:"query",
            message: {
                genre: genre
            },
            maxTTL:P2Pconfig.maxTTL,
            currentTTL:1,
            road:[]
        };
        logger.silly("[Query] ("+query.currentTTL+"/"+query.maxTTL+") : "+query.from.pseudo+ ' ('+query.from.addr+')');
        socket.emit("Ping", query);
    });
};

module.exports = peerServer;