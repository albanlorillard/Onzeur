var P2Pconfig = require('../config');

var io = require( 'socket.io-client' );

var logger = require ('../logger');
var peerFunctions = require ('./peerFunctions');
var peerManager = require('./peerManager'); // ConnectionHandle.


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
        logger.silly("["+data.subject+"] Reçu de "+ data.from.pseudo + " ( "+data.from.addr+" ) " );
        logger.silly("["+data.subject+"] ("+data.currentTTL+"/"+data.maxTTL+") :  from "+data.from.pseudo+" ---> to: "+data.to.pseudo+ " me:"+myId.pseudo);



        // TEST QUERY
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
                genre: "Rock" //todo
            },
            maxTTL:P2Pconfig.maxTTL,
            currentTTL:1,
            road:[]
        };
        logger.silly("[Query] ("+query.currentTTL+"/"+query.maxTTL+") : "+query.from.pseudo+ ' ('+query.from.addr+')');
        socketCl.emit("Ping", query);

        //TEST QUERY


        if (data.to.addr == myId.addr)
        {
            logger.silly("["+data.subject+"] Ce pong m'est destiné !");

            if (data.subject == "pong")
            {
                if (peerFunctions.getPeers().length < P2Pconfig.maxConnectionsPerPeer)
                {
                    if (!peerFunctions.peerAlreadyConnected(data.from.addr))
                        new peerClient(data.from.addr,myId);
                    else
                        logger.silly("["+data.subject+"] Déjà connecté à "+ data.from.pseudo + ' ('+data.from.addr+')');
                }
                else
                    logger.silly("["+data.subject+"] Too Many Connection : "+ P2Pconfig.maxConnectionsPerPeer);
            }
            else if (data.subject == "queryHit")
            {
               // TODO QUERYHIT
                logger.silly("["+data.subject+"] Reçu");

            }
            else
            {
                logger.silly("["+data.subject+"] sujet inconnu");
            }

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