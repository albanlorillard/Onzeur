# ONZEUR
## About
A P2P network. Each peer interact between them mp3 files.
 Each peer create his own mp3 radio stream with file of all peers.
 Each mp3 is intelligently selected thank's to ID3Tag

 ## Prerequise :
 - Need a Mysql DB.
 
## How it work
Configure databse : src/db.json
Configure project : ./config.js
```npm start [port] [choose a pseudo if you want] [IP:PORT of a first pair if you want]```


Example :
- Start a serveur :
```npm start 3000```
- Start a first client :
```npm start 3001 Onzeur1 127.0.0.1:3000```

