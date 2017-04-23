module.exports = {
    // P2P CONFIG
    maxTTL:3,                   //Max Length of the Gnutella TTL
    maxConnectionsPerPeer:5,    //Max connection per Gnutella Peers
    receiveMp3Directory: "./mp3/friendMp3/", //Download repertory of mp3 musics (please create directory before)
    // Mp3 Manager
    db:{"host": "127.0.0.1",    //Configuration of MySQL
    "user": "root",
    "password": "mixage53",
    "database": "musiconzeur"},

    // Flux Manager
    shoutcastConfig:{               // Configuration of Radio Information
        name: 'Onzeur Radio Station',
        genre: 'all',
        url: 'https://github.com/albanlorillard/Onzeur',
        notice: 'La radio de la petite Jaja de Polytech'
    },
    shoutcastPort:7000,             // Flux of the radio



    // LOGS
    LOG_CONSOLE: true,              // If True : Enable logs in the local console

    LOG_FILES: true,                // If True : Store logs in a daily file.
    LOG_FILES_PATH: "./logs",       // Path where are store the daily log files (if LOG_FILES: true). PLEASE DON'T PUT SLASH / AT THE END !
    LOG_FILE_JSON: false,           // If True, Store logs in a json format
    LOG_FILE_COLOR : false,          // If True, the log are colored. (If you open the file with a text editor, some strange character appear, but it's readable with current unix command)

    /* Write the smallest levels that you want to see in the log. The superior levels will be also shown.
     * By descending priority : error, warn, info, verbose, debug, silly */
    LOG_CONSOLE_MIN_LVL:"silly",    // Smallest level show in the local console
    LOG_FILE_MIN_LVL:"silly"        // Smallest level store in the daily files
};
