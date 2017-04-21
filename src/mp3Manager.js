/**
 * Created by alban on 20/03/17.
 //console.log("Démarrage de mp3 Manager");

        // Le but est de récupérer tout les mp3 d'un dossier.
        // De stocker les mp3 soit dans une variable, soit dans une base de donnée SQL, soit dans une base de donnée NoSQL
        // Et d'utiliser les ID3Tag et lastFM pour récupérer les informations sur la musique
        // https://blog.kaiserapps.com/node_js_id3_tag_libraries_which_is_the_best/

        // 1) Récupérer tout les mp3 d'un répertoire
        // 2) Pour chaque musique => Analyser ses id3tag & lastfm tag
        // 3) Ajouter les musiques dans une variable ou une bdd si non ajouté grace aux info obtenu en 2
	        // 4) Créer des requêtes (grâce à des routes) pour obtenir une musique en fonction d'une musique précédente.
 */
/*
var express = require('express');
var router = express.Router();
var request = require('request');
*/

/*
var db = require('./dbconnect');


var fs = require('fs');
var mm = require('musicmetadata');

// take a folder dossier mp3 and put all the mp3 in it in the table listmp3

var perserFolder = fs.readdir('./dossiermp3', function(err, items) {
      var glob =-1;
      for (var i=0; i<items.length; i++) {
     
        var readableStream = fs.createReadStream('./dossiermp3/'+items[i]);
        var parser = mm(readableStream, function (err, metadata) {
          glob++;
          console.log(items[glob]);
          if (err) throw err;
          var laPoule= db.query("insert into listmp3 (title, artist,genre,url) values ('"+metadata.title.replace(/'/g,"\\'")+"', '"+metadata.artist[0].replace(/'/g,"\\'")+"','"+metadata.genre[0].replace(/'/g,"\\'")+"','./dossiermp3/test.mp3');");
          laPoule.on('error',function(err){
            console.log(err);
          });
          if (err) throw err;

          readableStream.close();
          
          });

        
    }
  });

var data = {
    get1genreUrl:function(genre,callback) {
        return db.query("select url from listmp3 where genre = '"+genre+"' limit 1;", callback);
    },
  };

router.get('/genre', function(req, res, next) {
    data.get1genreUrl(req.params.genre, function(err, rows)
    {
        if(err){res.json(err);}
        else{res.json(rows);}
    });
});
/*
if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " path/to/directory");
    process.exit(-1);
}*/
/*
console.log("cool stuf is happening");
var path = process.argv[2];
 
fs.readdir(path, function(err, items) {
    console.log(items);
 
    for (var i=0; i<items.length; i++) {
        console.log(items[i]);
    }
});*/


