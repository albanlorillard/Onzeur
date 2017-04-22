var logger = require('../logger');
var P2Pconfig = require('../config');
var peerClient = require('./peerClient.js');
var peers = [];
var mp3Manager = require('./mp3Manager');
var peerTransfert = require('./peerTransfert');

function showPeer()
{
    logger.silly("---- Listage de mes connections ! ---- ");
    for(var p=0; p<peers.length; p++)
    {
        logger.silly("Pair n°"+p+" : "+peers[p].id.pseudo+" ("+peers[p].id.addr+"). Mon rôle: "+peers[p].myRole+ ". socketId:"+peers[p].socket.id);
    }
}

function findSocketByAddr(addr)
{
    for(var p=0; p<peers.length ; p++)
    {
        if(peers[p].id.addr == addr)
        {
            return peers[p].socket;
        }
    }
}

function findSocketById(socketId)
{
    for(var p=0; p<peers.length ; p++)
    {
        if(peers[p].socket.id == socketId)
        {
            return peers[p].socket;
        }
    }
}

function peerAlreadyConnected(addr) {
        var alreadyMyFriend = false;
        for(var p=0; p<peers.length; p++)
        {
            if(peers[p].id.addr == addr)
            {
                alreadyMyFriend = true;
                break;
            }
        }
        return alreadyMyFriend;
}

module.exports={
    findSocketById:function(socketId){
        return findSocketById(socketId);
    },
    findSocketByAddr:function(addr){
        return findSocketByAddr(addr);
    },
    peerAlreadyConnected:function(addr){
        return peerAlreadyConnected(addr);
    },

    setPeer:function(peerId, socket, myRole)
    {
        peers.push({id:peerId, socket:socket, myRole:myRole});
        showPeer();
    },
    getPeer:function(socketId)
    {
        for(var p=0; p<peers.length; p++)
        {
            if(socketId == peers[p].socket.id)
            {
                return peers[p].socket;
            }
        }
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
            if(peers[p].socket.id != socketId)
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
            if("http://"+peers[p].id.addr != socketURI)
            {
                pTemp.push(peers[p]);
            }
        }
        peers = pTemp;
        showPeer();
    },


    //////////***************** PING *************************///////////////////
    pingServer: function(myId, data, socket)
    {
            //For avoid network loop, we verify if this token has not already used this node.
            var pingLoop = false;
            for (var i=0; i<data.road.length ; i++)
            {
                if (data.road[i].addr == myId.addr || data.from.addr == myId.addr)
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
                    ping.road.push({
                        addr: myId.addr,
                        socket: socket.id,
                        myRole:"server",
                        pseudo: myId.pseudo
                    }); // We subscribe this node in the road used by the token

                    //Log
                    logger.silly("["+ping.subject+"] ("+ping.currentTTL+"/"+ping.maxTTL+") : "+ping.from.pseudo+ ' ('+ping.from.addr+')');

                    if (data.road)
                    {
                        logger.silly("---- Liste des routes du "+ping.subject+" de "+ping.from.pseudo+" ("+ping.from.addr+") : ---- ");
                        for (var r=0; r< ping.road.length ; r++)
                        {
                            logger.silly(r+" :"+data.road[r].pseudo+' ('+data.road[r].addr+'). C\'est un '+data.road[r].myRole);
                        }
                    }
                    //endLog



                    // PING/Query AGAIN
                    for (var p=0; p<peers.length;p++) //For each Peers that i'm connected with
                    {
                        for (var r=0; r< data.road.length ; r++) //For each Road of the token
                        {
                            if (data.road[r].addr != peers[p].id.addr)
                            {
                                    logger.silly("["+ping.subject+"] Envoie via le "+peers[p].myRole+" à "+peers[p].id.pseudo+" ("+peers[p].id.addr +")...");
                                    peers[p].socket.emit("Ping", ping);
                            }
                        }
                    }
                    //end "Ping Again"

                } // endIf "< TTLMax"

                //In all case, create pong from me to dest !
                if (data.subject == "ping")
                {
                    var pong = {
                        from:{
                            addr:myId.addr,
                            pseudo:myId.pseudo,
                            ip:myId.ip,
                            port: myId.port
                        },
                        to:data.from,
                        subject:"pong",
                        message:"",
                        maxTTL:data.maxTTL,
                        currentTTL:data.currentTTL,
                        road:data.road
                    };

                    if (peers.length >= P2Pconfig.maxConnectionsPerPeer)
                        pong.message = "busy";
                    else
                        pong.message = "available";

                    logger.silly("["+pong.subject+"] ("+pong.currentTTL+"/"+pong.maxTTL+") : from "+pong.from.pseudo+" ---> to: "+pong.to.pseudo);
                    socket.emit('Pong', pong); // send pong to my client

                    //todo:verifier si 5/5 paires
                }
                else if (data.subject == "query")
                {
                    data.message.genre = "Rock";//todo
                    logger.silly("[QUERYHIT] "+data.from.addr+ " demande de la musique: "+data.message.genre);
                    var music = mp3Manager.getGenre(data.message.genre);
                    var socketFile = new peerTransfert(data.from.addr, myId, music);
                }

            }
    },


    //////////***************** PONG *************************///////////
    pongServer:function (myId, data, socket)
    {
        logger.silly("[Pong] ("+data.currentTTL+"/"+data.maxTTL+") :  from "+data.from.pseudo+" ---> to: "+data.to.pseudo+ " me:"+myId.pseudo);

        if (data.to.addr == myId.addr)
        {
            logger.silly("[Pong] Ce pong m'est destiné !");
            if (peers.length < P2Pconfig.maxConnectionsPerPeer)
            {
                if (!peerAlreadyConnected(data.from.addr))
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
                if (!findSocketById(data.road[data.road.length-1].socket))
                    nextNode = findSocketByAddr(data.to.addr);
            }
            else
                nextNode = findSocketById(data.road[data.road.length-1].socket);

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
    }

};