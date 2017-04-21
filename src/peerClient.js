var P2Pconfig = require('../config');

var io = require( 'socket.io-client' );
var ss = require('socket.io-stream');
var fs = require('fs');

var logger = require ('../logger');
var peerFunctions = require ('./peerFunctions');
var peerManager = require('./peerManager'); // ConnectionHandle.
var peerServer = require('./peerServer');
var dl  = require('delivery');


function peerClient(ipDest, myId) {
    this.ip = ipDest;
    this.fromIp =  myId.addr;

    /* CREATION A P2P CLIENT */
        // On Connect
    var socketCl = io.connect("http://"+ipDest, {reconnect:true});

    this.socket = socketCl;

    socketCl.on('connect', function () {
        logger.silly("[PeerClient] Connection to "+ ipDest + " ... OK !");

        // Envoie de l'init.
        socketCl.emit("init", {addr: myId.addr, ip:myId.ip, port:myId.port, pseudo:myId.pseudo});

            //Searching new peers....
            var ping = {
                from:{
                    addr:myId.addr,
                    pseudo:myId.pseudo,
                    ip:myId.ip,
                    port: myId.port
                },
                to:"",
                subject:"ping",
                message: {

                },
                maxTTL:P2Pconfig.maxTTL,
                currentTTL:1,
                road:[]
            };
            logger.silly("[Ping] ("+ping.currentTTL+"/"+ping.maxTTL+") : "+ping.from.pseudo+ ' ('+ping.from.addr+')');
            socketCl.emit("Ping", ping);
    });


    socketCl.on("init", function(data)
    {
        peerFunctions.setPeer(data, socketCl, "client");
    });

    socketCl.on('disconnect', function (data) {
        peerFunctions.unsetPeerURI(socketCl.io.uri);
        logger.silly("[PeerClient] A server disconnects ");
    });

    socketCl.on('Ping', function(data)
    {
        logger.silly("[PING] Reçu de "+ data.from.pseudo + " ( "+data.from.addr+" ) " );
        peerFunctions.pingServer(myId,data,socketCl);
    });

    socketCl.on('Pong', function(data)
    {
        logger.silly("[PONG] Reçu de "+ data.from.pseudo + " ( "+data.from.addr+" ) " );
        logger.silly("[Pong] ("+data.currentTTL+"/"+data.maxTTL+") :  from "+data.from.pseudo+" ---> to: "+data.to.pseudo+ " me:"+myId.pseudo);

        if (data.to.addr == myId.addr)
        {
            logger.silly("[Pong] Ce pong m'est destiné !");
            if (peerFunctions.getPeers().length < P2Pconfig.maxConnectionsPerPeer)
            {
                if (!peerFunctions.peerAlreadyConnected(data.from.addr))
                    new peerClient(data.from.addr,myId);
                else
                    logger.silly("[PONG] Déjà connecté à "+ data.from.pseudo + ' ('+data.from.addr+')');
            }
            else
                logger.silly("[PONG] Too Many Connection : "+ P2Pconfig.maxConnectionsPerPeer);
        }
        else
        {
            data.road.pop();

            var nextNode;
            if (data.road.length <=0 )
            {
                if (!peerFunctions.findSocketById(data.road[data.road.length-1].socket))
                    nextNode = peerFunctions.findSocketByAddr(data.to.addr);
            }
            else
                nextNode = peerFunctions.findSocketById(data.road[data.road.length-1].socket);

            data.currentTTL--;

            try
            {
                nextNode.emit('Pong', data);
            }
            catch (err)
            {
                console.error(err);
            }
        }
    });

    socketCl.on('Query', function(data) {
        logger.silly("On me demande à la barre ! Genre:" /*+ data.message.genre*/);
        var socket = io.connect('http://' + data.from);

        socket.on("connect", function()
        {
            logger.silly("eee");
            delivery = dl.listen( socket );
            delivery.connect();

            delivery.on('delivery.connect',function(delivery){
                logger.silly("send");
                delivery.send({
                    name: '02_As_you_know.mp3',
                    path : './mp3/02_As_you_know.mp3'
                });

                delivery.on('send.success',function(file){
                    console.log('File sent successfully!');
                });
            });
        });


    });
}
// class methods
peerClient.prototype.getSocket = function() {
    return this.socket;
};

peerClient.prototype.getIp = function() {
    return this.fromIp;
};

// export the class
module.exports = peerClient;