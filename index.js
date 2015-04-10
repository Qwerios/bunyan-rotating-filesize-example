var fs           = require( "fs"      );
var util         = require( "util"    );
var assert       = require( "assert"  );
var EventEmitter = require( "events"  ).EventEmitter;
var format       = util.format;

// The 'mv' module is required for rotating-filesize stream support.
try {
    /* Use `+ ''` to hide this import from browserify. */
    var mv = require( "mv" + "" );
} catch (e) {
    mv = null;
}

function RotatingFileStream( options )
{
    this.path   = options.path;
    this.stream = fs.createWriteStream( this.path,
    {
        flags:      "a",
        encoding:   "utf8"
    } );

    this.count = parseInt( options.count, 10 ) || 10;
    assert.equal( typeof( this.count ), "number",
        format( "rotating-filesize stream 'count' is not a number: %j (%s) in %j",
            this.count, typeof( this.count ), this ) );

    assert.ok( this.count >= 0,
        format( "rotating-filesize stream 'count' is not >= 0: %j in %j",
            this.count, this ) );

    // Parse `options.filesize`
    // <number><scope> where scope is: filesize in bytes
    // A filesize of 0 or smaller will result in no limit
    //
    this.maxsize = parseInt( options.filesize, 10 ) || 0;

    this.rotQueue = [];
    this.rotating = false;
}

util.inherits( RotatingFileStream, EventEmitter );

RotatingFileStream.prototype.rotate = function rotate()
{
    // XXX What about shutdown?
    var self   = this;
    var _DEBUG = false;

    if ( _DEBUG )
    {
        console.log( "-- [%s, pid=%s] rotating %s",
        new Date(), process.pid, self.path );
    }
    if ( self.rotating )
    {
        throw new TypeError( "cannot start a rotation when already rotating" );
    }
    self.rotating = true;

    self.stream.end(); // XXX can do moves sync after this? test at high rate

    function del()
    {
        var toDel = self.path + "." + String( n - 1 );
        if ( n === 0 )
        {
            toDel = self.path;
        }
        n -= 1;
        if ( _DEBUG ) { console.log( "rm %s", toDel ); }
        fs.unlink( toDel, function( delErr )
        {
            if ( _DEBUG ) { console.error( "rm error!", delErr ); }
            //XXX handle err other than not exists
            moves();
        } );
    }

    function moves()
    {
        if ( self.count === 0 || n < 0 )
        {
            return finish();
        }
        var before = self.path;
        var after  = self.path + "." + String( n );
        if ( n > 0 )
        {
            before += "." + String( n - 1 );
        }
        n -= 1;
        fs.exists( before, function( exists )
        {
            if ( !exists )
            {
                moves();
            }
            else
            {
                if ( _DEBUG )
                {
                    console.log( "[pid %s] mv %s %s",
                    process.pid, before, after );
                }

                mv( before, after, function( mvErr )
                {
                    if ( mvErr )
                    {
                        self.emit( "error", mvErr );
                        finish(); // XXX finish here?
                    }
                    else
                    {
                        moves();
                    }
                } );
            }
        } );
    }

    function finish()
    {
        if ( _DEBUG ) { console.log( "[pid %s] open %s", process.pid, self.path ); }
        self.stream = fs.createWriteStream( self.path,
        {
            flags:    "a",
            encoding: "utf8"
        } );
        var q = self.rotQueue,
            len = q.length;
        for ( var i = 0; i < len; i++ )
        {
            self.stream.write( q[ i ] );
        }
        self.rotQueue = [];
        self.rotating = false;
        self.emit( "drain" );
    }

    var n = this.count;
    del();
};

RotatingFileStream.prototype.write = function write( s )
{
    var self = this;

    console.log( "Bytes written: ", self.stream.bytesWritten );

    // Start rotating if bytesWritten exceeds maxsize
    //
    if ( !self.rotating && ( true || self.stream.bytesWritten > self.maxsize ) )
    {
        console.log( "Rotating file because bytesWritten exceeds max", self.stream.bytesWritten, self.maxsize );
        self.rotate();
    }

    if ( this.rotating )
    {
        this.rotQueue.push( s );
        return false;
    }
    else
    {
        return self.stream.write( s );
    }
};

RotatingFileStream.prototype.end = function end()
{
    this.stream.end();
};

RotatingFileStream.prototype.destroy = function destroy()
{
    this.stream.destroy();
};

RotatingFileStream.prototype.destroySoon = function destroySoon()
{
    this.stream.destroySoon();
};

module.exports = RotatingFileStream;