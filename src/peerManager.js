// => http://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender-socket-io
/*
{
 ping: discover hosts on network
 pong: reply to ping
 query: search for a file
 query hit: reply to query
 push: download request for firewalled servants
 }
*/


var logger = require('../logger');
var peerClient = require('./peerClient.js'); // ConnectionHandle.
var peerServer = require('./peerServer.js');
//var peerFunctions = require('./peerFunctions');
//var P2Pconfig = require('../config');
var myId = {};

module.exports = {
    myId: myId,
    start: function(server, ip, port) {
        //////// PSEUDO CODE /////////
        /// 1) Démarrer mon serveur
        /// 1bis) Si j'ai passé une IP en paramètre se connecter au serveur en question en tant que client



        //// Define an user pseudo
        if (process.argv[3] == undefined)
            pseudo = "guest_" + new Date().getTime();
        else
            pseudo = process.argv[3];

        //// Define my identity.
        myId = {
            "pseudo": pseudo,
            "server":server,
            "addr": ip.address+":"+port,
            "ip":ip.address,
            "port":port
        };

        logger.silly("[PeerManager] Hello : " + pseudo +"\n");

        // ************ SERVER ********************//
        var serverP2P= new peerServer(server, myId);


        //************* CLIENT ******************** //
        to = process.argv[4];
        if (to != undefined) {
            //First connection
            var client = new peerClient(to, myId); // Create a new peer connection with arg if specify.
            //peers.push(client);
        }


        // Le but est de gérer la création d'un réseau P2P entre plusieurs serveur de ce projet.
        // De gérer les connexions entre pairs
        // De découvrir de nouvelles pairs
        // De gérer la déconnexion à un pair
        // De gérer les requêtes entre pair
    },
    getPseudo: function()
    {
        return myId.pseudo;
    }
};
