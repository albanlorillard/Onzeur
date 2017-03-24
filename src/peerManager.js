// => http://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender-socket-io

var io_client = require( 'socket.io-client' );
var peers = [];
var myId = {};


module.exports = {
    start: function(server, ip, port) {
        console.log("[PeerManager] Starting Peer Manager");

        // Define an user pseudo
        if (process.argv[3] == undefined)
            pseudo = "guest_" + new Date().getTime();
        else
            pseudo = process.argv[3];

        console.log("[PeerManager] Welcome " + pseudo);

        myId = {
            "pseudo": pseudo,
            "server":server,
            "ip": ip,
            "port": port
        };

        /*** CREATION OF A P2P SERVER ***/

        var io = require('socket.io').listen(server);        // this is the socket.io server
        io.sockets.on("connection", function (socket) {
            console.log('[PeerManager] A Client has Connected to this Server');

            /*
            socket.on('connect', function () {
                socket.emit('message', "TOTO2");
            });*/
            socket.on("New Connection", function (data) {
                console.log("[PeerManager]Server New Connection with : "+ data.pseudo);
                peers.push(data);
                //socket.emit('New Connection', myId.pseudo); //Forward Message to Second Server
                io.emit('AskConnection', data); // Ask connection broadcast
                console.log("[PeerManager] Search other peers to connect...");
            });

            socket.on('message', function (data) {
                console.log("[PeerManager] Message : "+ data);
            });

            socket.on("disconnect", function (data) {
                socket.broadcast.emit("New Disconnection",'UD,' + socket.id ); //Send to Everyone but NOT me
                console.log("disconnecting " );
            });
        });

        /* CREATION A P2P CLIENT */
        if (process.argv[4] != undefined)
        {
            var socket2 = io_client.connect(process.argv[4]);
            socket2.on('connect', function () {
                console.log("[PeerManager] Connection to "+ process.argv[4] + " ... OK !");
                socket2.emit('New Connection', myId);

            });
            socket2.on('New Connection', function (data) {
                console.log("[PeerManager]Client New connection with "+ data);

            });
            socket2.on('message', function (data) {
                console.log("[PeerManager] Message reçu : "+ data);
            });
        }

        // Le but est de gérer la création d'un réseau P2P entre plusieurs serveur de ce projet.
        // De gérer les connexions entre pairs
        // De découvrir de nouvelles pairs
        // De gérer la déconnexion à un pair
        // De gérer les requêtes entre pair
    },
    getPseudo: function()
    {
        return pseudo;
    }



};
