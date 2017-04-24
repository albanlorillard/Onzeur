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
var serverP2P = null;

module.exports = {
    myId: myId,
    start: function(server, ip, port) {
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

        logger.silly("[PeerManager] Bonjour " + pseudo +" ( "+myId.addr+" ) \n");

        // ************ SERVER ********************//
        serverP2P = new peerServer(server, myId);


        //************* CLIENT ******************** //
        to = process.argv[4];
        if (to != undefined) {
            //First connection
            var client = new peerClient(to, myId, false); // Create a new peer connection with arg if specify.
            //peers.push(client);
        }
       // var lo = new peerClient(myId.addr, myId, true); // Loop local

    },
    queryByGenre: function(genre)
    {
        serverP2P.queryByGenre(genre);

        //RETURN LOCAL URL MP3
    }
};
