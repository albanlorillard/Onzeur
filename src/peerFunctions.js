var logger = require('../logger');
var peers = [];

function showPeer()
{
    logger.silly("peer[n]:addr/id/myRole");
    for(var p=0; p<peers.length; p++)
    {
        logger.silly("peer["+p+"]:"+peers[p].addr+"/"+peers[p].id+"/"+peers[p].myRole);
    }
}

module.exports={
    setPeer:function(addr, socketId, myRole, socket, pseudo)
    {
        peers.push({addr:addr, id:socketId, myRole:myRole, socket:socket, pseudo:pseudo});
        showPeer();
    },
    getPeer:function(socketId)
    {
        for(var p=0; p<peers.length; p++)
        {
            if(socketId == peers[p].id)
            {
                return peers[p].socket;
            }
        }
    },
    addPseudoPeer:function(id, pseudo)
    {
        /*for(var p=0; p<peers.length; p++)
        {
            if(socketId == peers[p].id)
            {
                return peers[p].socket;
            }
        }*/
    },
    getPeers: function()
    {
        return peers;
    },
    unsetPeer:function(socketId)
    {
        var pTemp=[];
        for(var p=0; p<peers.length ; p++)
        {
            if(peers[p].id != socketId)
            {
                pTemp.push(peers[p]);
            }
        }
        peers = pTemp;
        showPeer();
    },
    unsetPeerURI:function(socketURI)
    {
        var pTemp=[];
        for(var p=0; p<peers.length ; p++)
        {
            if("http://"+peers[p].addr != socketURI)
            {
                pTemp.push(peers[p]);
            }
        }
        peers = pTemp;
        showPeer();
    },
    peerAlreadyConnected: function (addr) {
        var alreadyMyFriend = false;
        for(var p=0; p<peers.length; p++)
        {
            if(peers[p].addr == addr)
            {
                alreadyMyFriend = true;
                break;
            }
        }
        return alreadyMyFriend;
    },

    ping: function(myId, data, server, io, socket)
    {
            //For avoid network loop, we verify if this token has not already used this node.
            var pingLoop = false;
            for (var i=0; i<data.road.length ; i++)
            {
                if (data.road[i] == myId.addr)
                {
                    logger.silly("Loop detected");
                    pingLoop = true;
                    break;
                }
            }

            // If it's the first time in this node, ok, no loop, we continue !
            if (pingLoop==false)
            {
                //If it's not the end of the TTL
                if(data.currentTTL < data.maxTTL)
                {
                    var ping = data;
                    ping.currentTTL++;  // We increment the TimeToLive
                    ping.road.push({addr: myId.addr, socketId: socket.id, pseudo: myId.pseudo}); // We subscribe this node in the road used by the token

                    //Log
                    logger.silly("[Ping] TTL:"+ping.currentTTL + "/"+ping.maxTTL+". From:"+ping.from+" to:"+ping.to+"" );
                    if (data.road)
                    {
                        for (var r=0; r< ping.road.length ; r++)
                        {
                            logger.silly("Road "+r+" :"+data.road[r].pseudo);
                        }
                    }
                    //endLog



                    // PING AGAIN
                    for (var p=0; p<peers.length;p++)
                    {
                        for (var r=0; r< data.road.length ; r++)
                        {
                            if (data.road[r].socketId != peers[p].id)
                            {
                                logger.silly("[PING "+ping.currentTTL+"/"+ping.maxTTL+"] : "+data.message.pseudo);
                                logger.silly("[PING] Envoie à "+peers[p].addr +"...")
                                socket.broadcast.to(peers[p].id).emit('Ping', ping);
                                //peers[p].socket.emit('Ping', ping);
                            }
                        }
                    }
                }

                //In all case, create pong from me !
                var pong = {from:myId.addr, to:data.from, subject:"pong", message:myId.addr, maxTTL:data.maxTTL, currentTTL:data.currentTTL, road:data.road};
                logger.silly("[PONG "+pong.currentTTL+"/"+pong.maxTTL+"] : "+pong.message.pseudo);
                //todo:verifier si 5/5 paires
                socket.emit('Pong', pong); // send pong to my client
            }
    },

    pong:function (myId, data, io, socket)
    {
        if (data.road[data.road.length-1].id == socket.id)
        {
            data.road.pop(); // Pop the last road addr.
            data.currentTTL--;
            var ping = {from:myId.addr, to:data.from, subject:"pong", message:myId.addr, maxTTL:data.maxTTL, currentTTL:data.currentTTL, road:data.road};
            logger.silly('[Peer] envoie pong');
            socket.send('Pong', data); // send pong to my client
        }
        else
        {
            logger.silly('[Peer] Il semblerait que ce pong ne me soit pas adressé');
        }
    }



};