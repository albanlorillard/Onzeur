var dl  = require('delivery');
var fs = require('fs');
var logger = require ('../logger');
var io = require( 'socket.io-client' );

function peerTransfert(ipDest, myId, music) {
    this.ipDest = ipDest;
    this.myId = myId;

    var socket = io.connect('http://' + ipDest);

    socket.on("connect", function()
    {
        logger.silly("Sockets connected");
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

}

module.exports = peerTransfert;