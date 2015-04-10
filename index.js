var bunyan         = require( "bunyan"           );
var RotatingStream = require( "logrotate-stream" );

var log = bunyan.createLogger(
{
    name: "myLogger",
    streams: [ {
        name:       "console",
        stream:     process.stdout,
        level:      "info"
    },
    {
        name:       "logfile",
        level:      "debug",
        stream: new RotatingStream(
        {
            file:       __dirname + "/file.log",
            size:       "1k",
            keep:       5,
            compress:   true
        } )
    } ]
} );

// Lets log a few entries to trigger rotation
//
log.info( "Writing dummy log lines..." );
for ( var i = 0, iLen = 10000; i < iLen; i++ )
{
    log.debug( { index: i }, "This is line: " + i );
}