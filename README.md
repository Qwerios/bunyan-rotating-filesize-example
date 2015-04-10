bunyan-rotating-filesize is a stream for [bunyan](https://github.com/trentm/node-bunyan)
that can be used to rotate a log file when it reaches a certain size

# Installation

    npm install bunyan-rotating-filesize

# Usage

```javascript
var bunyan       = require( "bunyan" );
var RotatingFile = require( "bunyan-rotating-filesize" );

var log = bunyan.createLogger(
{
    name: "myLogger",
    streams: [ {
        name:   "mylogfile",
        level:  "debug",
        stream: new RotatingFile(
        {
            path:      __dirname + "/file.log",
            filesize:  10000,
            count:     5
        } )
    } ]
} );

log.debug( { foo: "bar" }, "hello world" );
```

The filesize option is declared in bytes. The filecount determines how many files are to be kept.