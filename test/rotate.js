var bunyan = require( "bunyan" );
var RotatingFile = require( "../index.js" );

var log = bunyan.createLogger(
{
    name: "myLogger",
    streams: [ {
        name:       "console",
        stream:     process.stdout,
        level:      "debug"
    },
    {
        name:       "logfile",
        level:      "debug",
        stream: new RotatingFile(
        {
            path:      __dirname + "/file.log",
            filesize:  10000,
            count:     5
        } )
    } ]
} );

// Lets log a few entries to trigger rotation
//
for ( var i = 0, iLen = 1000; i < iLen; i++ )
{
    log.debug( { index: i }, "This is line: " + i );
}