var winston = require('winston'),
    expressWinston = require('express-winston');
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');

var config = require('./config.js');
var fs = require('fs');

var transports = [];

if (config.LOG_CONSOLE)
{
    var console = new (winston.transports.Console)({
        handleExceptions: true,
        colorize:true,
        json:false,
        level: config.LOG_CONSOLE_MIN_LVL,
        humanReadableUnhandledException: true
    });
    transports.push(console);
}

var logger = new (winston.Logger)({
    transports: transports,
    exitOnError: true // Stop if Error !
});

if (config.LOG_FILES) {
    var now = new Date();
    function formatDate(d) {
        var dd = d.getDate();
        if ( dd < 10 ) dd = '0' + dd;

        var MM = d.getMonth()+1;
        if ( MM < 10 ) MM = '0' + MM;

        return d.getFullYear()+'-'+MM+'-'+dd;
    }

    var path = null;
    if (fs.existsSync(config.LOG_FILES_PATH))
    {
        logger.debug("[Log] The logs path: "+config.LOG_FILES_PATH+" exist.");
        path = config.LOG_FILES_PATH;
    }
    else
    {
        try{
            fs.mkdirSync(config.LOG_FILES_PATH);
            logger.info("[Log] The logs path: "+config.LOG_FILES_PATH+" doesn't exist but is successfully created.");
            path = config.LOG_FILES_PATH;
        }
        catch(e){
            logger.error("[Log] The logs path: "+config.LOG_FILES_PATH+" doesn't exist and impossible to create the repository for LOGS ! Error:"+e.message);
            path = "./";
        }
    }


    var file = new (winston.transports.DailyRotateFile)({
        filename: path,
        json:config.LOG_FILE_JSON,
        datePattern:"/yyyy-MM-dd.log",
        handleExceptions: true,
        humanReadableUnhandledException: true,
        colorize:config.LOG_FILE_COLOR,
        level: config.LOG_FILE_MIN_LVL,
        timestamp: function() {
            var now = new Date();
            return now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
        }
    });
    transports.push(file);
}

logger = new (winston.Logger)({
    transports: transports,
    exitOnError: false // Don't stop if error
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};