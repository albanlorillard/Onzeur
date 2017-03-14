var express = require('express');
var router = express.Router();
var peerData = require('../bin/peerServer.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/allPeers', function(req, res, next) {
  peerData.getAllPeers(function(err, rows)
      {
        if(err){res.json(err)}
        else{res.json(rows)}
      }
  )

});



module.exports = router;
