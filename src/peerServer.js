var ss = require('socket.io-stream');
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

            /*
            var delivery = dl.listen(socket);
            delivery.on('receive.success',function(file){

                fs.writeFile(file.name, file.buffer, function(err){
                    if(err){
                        console.log('File could not be saved: ' + err);
                    }else{
                        console.log('File ' + file.name + " saved");
                    };
                });
            })*/

    });
}

peerServer.prototype.getIO = function() {
    return this.io;
};

peerServer.prototype.queryByGenre = function(genre){
    // generate a unique ID
    var id = new Date().getTime();

    var query = {from:myId.addr, to:"", subject:"Query", message:{id: id, genre:genre}, road:[]};
    io.emit('Query', query);
};

module.exports = peerServer;