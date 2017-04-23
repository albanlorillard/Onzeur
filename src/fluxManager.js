var config = {
    name: 'Onzeur Radio Station',
    genre: 'all',
    url: 'https://github.com/albanlorillard/Onzeur',
    notice: 'La radio de la petite Jaja de Polytech'
};

var net = require("net");
var http = require('http');

var fs = require('fs');

var file = require('../lib/file');
var shoutcast = require('../lib/shoutcast');

var stations = [];


module.exports = {
    start: function() {
        console.log("Démarrage de Flux Manager");
        var first = shoutcast.Station(config);
        stations.push(first);

        var dir = "./mp3/";

        // Ici on ajoute les mp3 dans une liste quand ceux ci sont finit
        console.log('dir: ' + dir);
        var stats = fs.statSync(dir);
        if (stats.isDirectory()) {
            file.walkSync(dir, function(p, dirs, files) {
                var len = files.length;
                //console.log(len);
                for (var i = 0; i < len; i++) {
                    var f = files[i];

                    if (f.indexOf('.mp3') >= 0) {
                        first.addTrack({file: p+'/'+f});
                        //first.next;
                    }
                }
            });
        }

        http.createServer(
            function (req, res) {
                first.connect(req, res, function() {
                    console.log("Stream ended?");
                });
            }).listen(7000);

            //first.next;
            first.start();
            //first.next;
            //first.start();


        setInterval(function() {
            var total = 0;
            var played = 0;
            var connected = 0;
            var connections = 0;

            var len = stations.length;
            for (var idx = 0; idx < len; idx++) {
                total += stations[idx].stats.bytesWritten;
                played += stations[idx].stats.numPlayed;
                connected += stations[idx].stats.connected;
                connections += stations[idx].stats.connections;
            }

            console.log('Total Bytes Written: ' + total);
            console.log('Total Tracks Played: ' + played);
            console.log('Total Connected: ' + connected);
            console.log('Total Connections: ' + connections);
        }, 20000);

        console.log('Server running at http://0.0.0.0:7000/');

        // Le but est de créer un flux mp3. Envoyer un mp3 de durée illimité qui se compose de son .mp3 qu'on lui envoie.
        // Il faut alors créer un objet qui a une playlist, et qui change de musique a la fin d'une musique.
        // https://pedromtavares.wordpress.com/2012/12/28/streaming-audio-on-the-web-with-nodejs/
        // https://gist.github.com/dtrce/1204243
        // https://gist.github.com/dtrce/1204243/47b9adf3c398dbcf092378c1f036c579aed76426

        // 1) Lancer le flux mp3 avec une musique initiale
        // 2) Fonction pour ajouter une musique à la playlist
        // 3) Fonction pour supprimer une musique de la playlist (facultatif au début)

    }
};