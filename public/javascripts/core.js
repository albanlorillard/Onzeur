/**
 * Core.js
 */

// Peer Serveur Config !
var peer = new Peer({host: 'localhost', port: 9000, path:'/peerjs', debug:3 });

// We create a new peer for us.
/*var peer1 = new Peer({key: 'umofbqsiwo9cz0k9', debug:3});
var peer2 = new Peer({key: 'umofbqsiwo9cz0k9', debug:3});*/

peer.on('open', function(id) {
    document.getElementById("peerID").innerHTML = id;


    peer.listAllPeers(function(list) {
        var content = "<ul>";
        for (var cnt = 0; cnt < list.length; cnt++) {
            content += "<li>" + list[cnt] + "</li>";
        }
        content += "</ul>";
        document.getElementById("peers").innerHTML = content;
    });
});

// LOG Writter
function writeLog(IDSender, IDReceipter, msg)
{
    var log = document.getElementById("log").innerHTML;
    log = "<tr><td>date</td>"+IDSender+"<td></td>"+IDReceipter+"<td></td><td>"+msg+"</td></tr>" + log;
}