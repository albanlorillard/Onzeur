module.exports = {
    // P2P CONFIG
    maxTTL:3,
    maxConnectionsPerPeer:5,

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
