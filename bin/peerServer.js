var app = require('../app');

var ExpressPeerServer = require('peer').ExpressPeerServer;
var peerExpress = require('express');
var peerApp = peerExpress();
var peerServer = require('http').createServer(peerApp);

var options = {debug: true, allow_discovery:true};
var peerPort = 9000;
var q = ExpressPeerServer(peerServer, options);

/*app.get('*', function (req, res) {
    res.sendFile(__dirname + req.url);
});*/

var allPeers = [];

// ADD PEER
function addPeer(id)
{
    allPeers.push({id: id});
}

// Remove a Peer
function removePeer(id)
{
    for (var i=0; i<allPeers.length; i++)
    {
        if (allPeers[i].id == id) {
            allPeers.splice(i, 1); // remove i-ème elt
        }
    }
}

module.exports = {

    // **************** PEER SERVER ********************** //
    start: function() {
        peerServer.listen(peerPort);
        peerServer.on('error', onPeerError);
        peerServer.on('listening', onPeerListening);
        peerApp.use('/peerjs', q);

        /* Event error listener for Peer Server*/
        function onPeerError(error) {
            if (error.syscall !== 'listen') {
                throw error;
            }

            var bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    console.error("[Peer Server]" + bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error("[Peer Server]" + bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }

        /**
         * Event listener for Peer Listening server "listening" event.
         */

        function onPeerListening() {
            var addr = peerServer.address();
            var bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr.port;
            console.log('[Peer Server] Listening on ' + bind);
        }

        /*PeerServer Event when connection*/
        q.on('connection', function (id) {
            addPeer(id);
            console.log("[Peer Server] " + id + " just join us !");
        });

        /* PeerServer Event when disconnection*/
        q.on('disconnect', function (id) {
            removePeer(id);
            console.log("[Peer Server] " + id + " quit us !");
        });
    },

    getAllPeers: function(callback)
    {
        console.log(allPeers);
        return allPeers;
    }
};
