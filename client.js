// SoundClient

function SoundClient()
{	
}

SoundClient.setSender = function( sender )
{
	this.sender = sender;
}

SoundClient.play = function( command )
{
	this.sendArray( [ 1 ] );
}

SoundClient.stop = function()
{
	this.sendArray( [ 0 ] );
}

SoundClient.sendArray = function( array )
{
	var command = this.arrayToString( array );
	this.sendCommand( command );
}

SoundClient.sendCommand = function( command )
{
	if( this.sender != null )
		this.sender( command );
	else
		console.error( 'Sound client is missing sender.' );
}

SoundClient.arrayToString = function( numbers )
{
	var result = "";
	for( var i = 0; i < numbers.length; i++ )
	{
		var n = numbers[ i ];
		for( var j = 0; j < 8; j++ )
		{
			var b = n & 3;
			var c = this.encChars[ b ];
			result += c;
			n = n >>> 2;
		}
		result += this.sepChar;
	}
	return result;
}

SoundClient.stringToArray = function( str )
{
	var result = [];
	var n = 0;
	var j = 0;
	for( var i = 0; i < str.length; i++ )
	{
		var c = str.charAt( i );
		if( c != this.sepChar )
		{					
			var b = this.encChars.indexOf( c );
			if( b >= 0 && b <= 3 )
			{						
				n = n | ( b << ( j * 2 ) );
				j++;
			}
			else return null;
		}			
		if( c == this.sepChar || i == str.length - 1 )
		{
			if( j > 0 )
				result.push( n );
			n = 0;
			j = 0;
		}			
	}
	return result;
}
	
SoundClient.sender = null;
SoundClient.sepChar = '\u00ad';
SoundClient.encChars = [ '\u200b', '\u200c', '\u200d', '\ufeff' ];