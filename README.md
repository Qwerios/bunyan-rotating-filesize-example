This is a small bit of example code to use [logrotate-stream](https://github.com/dstokes/logrotate-stream) with [bunyan](https://github.com/trentm/node-bunyan)

# Installation

    npm install logrotate-stream

# Usage

```javascript
var bunyan         = require( "bunyan"           );
var RotatingStream = require( "logrotate-stream" );

var log = bunyan.createLogger(
{
    name: "myLogger",
    streams: [ {
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

log.debug( { foo: "bar" }, "hello world" );
```

Run  index.js to see this in action