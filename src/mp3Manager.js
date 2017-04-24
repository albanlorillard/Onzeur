var express = require('express');
var router = express.Router();
var logger = require ('../logger');
var db = require('./dbconnect');

var fs = require('fs');
var mm = require('musicmetadata');

// take a folder dossier mp3 and put all the mp3 in it in the table listmp3

function perserFolder()
{
    fs.readdir('./mp3', function(err, items) {
        var glob =-1;
        for (var i=0; i<items.length; i++) {

            var readableStream = fs.createReadStream('./mp3/'+items[i]);
            var parser = mm(readableStream, function (err, metadata) {
                glob++;
                console.log(items[glob]);
                if (err) throw err;
                try
                {
                        var laPoule= db.query("insert into listmp3 (title, artist,genre,url) values ('"+metadata.title.replace(/'/g,"\\'")+"', '"+metadata.artist[0].replace(/'/g,"\\'")+"','"+metadata.genre[0].replace(/'/g,"\\'")+"','./mp3/"+items[glob]+"');");
                    laPoule.on('error',function(err){
                        console.log(err);
                    });
                }
                catch(errr)
                {
                    logger.error(errr)
                }

                if (err) throw err;

                readableStream.close();
            });
        }
    });
}

var data = {
    get1genreUrl:function(genre,callback) {
        return db.query("select url from listmp3 where genre = '"+genre+"' limit 1;", callback);
    }
  };



module.exports={
	start:function() {
		perserFolder();
	},
	getGenre:function(genre){
		data.get1genreUrl(req.params.genre, function(err, rows)
		{
			if(err){res.json(err);}
			else{res.json(rows);}
		});
		return "./mp3/02_As_you_know.mp3"; //todo
                    	}

};
/*
CREATE TABLE if not exists`musiconzeur`.`listmp3` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NULL,
  `artist` VARCHAR(45) NULL,
  `genre` VARCHAR(45) NULL,
  `url` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))if not exist;
*/
