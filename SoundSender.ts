// SoundSender
// SoundSender.valueToString({a:1,b:1,c:[1,2,3,4,[1,2],{a:1}]})
// SoundSender.objectToString({a:1,b:1,c:[1,2,3,4,[1,2],{a:1}]})
class SoundSender
{
	public static setSender( sender: ( string ) => void )
	{
		this.sender = sender;
	}

	public static connect()
	{
		this.sendCommand( null );
	}

	public static play( command: object )
	{
		this.sendCommand( command );
	}

	public static stop()
	{
		this.sendCommand( null );
	}

	public static isCommand( commandStr: string ): boolean
	{
		return commandStr.substring( 0, this.commandPrefix.length ) == this.commandPrefix;
	}

	public static getCommandText( commandStr: string ): string
	{
		return commandStr.indexOf( this.commandPrefix ) == 0 ? commandStr.substring( this.commandPrefix.length ) : commandStr;
	}

	private static sendCommand( command: object | null )
	{
		if ( this.sender != null )
			if ( command != null )
			{
				var commandStr = this.valueToString( command );
				this.sender( this.commandPrefix + commandStr );
			}
			else
				this.sender( this.commandPrefix );
		else
			console.error( 'Sound client is missing sender.' );
	}

	private static valueToString( value: object ): string
	{
		if ( Array.isArray( value ) )
			return this.arrayToString( value );
		else if ( typeof value == 'number' )
			return this.numberToString( value );
		else
			return this.objectToString( value );
	}

	private static arrayToString( array: object[] ): string
	{
		var result = this.beginArrayChar;
		for ( var i = 0; i < array.length; i++ )
		{
			if ( i > 0 )
				result += this.sepChar;
			var value = array[ i ];
			result += this.valueToString( value );
		}
		result += this.endArrayChar;
		return result;
	}

	private static objectToString( object: object ): string
	{
		var result = this.beginObjectChar;
		var keys = Object.keys( object );
		for ( var k = 0; k < keys.length; k++ )
		{
			var key = keys[ k ];
			if ( key != null && key.length > 0 )
			{
				if ( k > 0 )
					result += this.sepChar;

				var keyAsNumber = parseInt( key, 36 );
				result += this.numberToString( keyAsNumber ) + this.sepChar;

				var value = object[ key ];
				result += this.valueToString( value );
			}
		}
		result += this.endObjectChar;
		return result;
	}

	private static numberToString( value: number ): string
	{
		var result = "";
		var str = Math.floor( value ).toString( this.encChars.length );
		for ( var i = str.length - 1; i >= 0; i-- )
			result += this.encChars[ str.charCodeAt( i ) - this.zeroCc ];
		return result;
	}

	private static stringToValue( str: string ): any
	{
		var result = this.substringToValue( str, 0 );
		return result != null ? result[ 0 ] : null;
	}

	private static substringToValue( str: string, i: number ): [ any, number ] | null
	{
		var c = str.charAt( i );
		if ( c == this.beginArrayChar )
		{
			return this.substringToArray( str, i + 1 );
		}
		else if ( c == this.beginObjectChar )
		{
			return this.substringToObject( str, i + 1 );
		}
		else if ( this.encChars.indexOf( c ) >= 0 )
		{
			return this.substringToNumber( str, i );
		}
		else
		{
			return null;
		}
	}

	private static substringToArray( str: string, i: number ): [ any[], number ] | null
	{
		var result = [];
		while ( i < str.length )
		{
			var c = str.charAt( i );
			if ( c == this.sepChar )
			{
				i++;
			}
			else if ( c == this.endArrayChar )
			{
				i++;
				break;
			}
			else
			{
				var value = this.substringToValue( str, i );
				if ( value != null )
				{
					result.push( value[ 0 ] );
					i = value[ 1 ];
				}
				else
				{
					return null;
				}
			}
		}
		return [ result, i ];
	}

	private static substringToObject( str: string, i: number ): [ object, number ] | null
	{
		var result = {};
		while ( i < str.length )
		{
			var c = str.charAt( i );
			if ( c == this.sepChar )
			{
				i++;
			}
			else if ( c == this.endObjectChar )
			{
				i++;
				break;
			}
			else
			{
				var value = this.stringToKeyValue( str, i );
				if ( value != null )
				{
					result[ value[ 0 ][ 0 ] ] = value[ 0 ][ 1 ];
					i = value[ 1 ];
				}
				else
				{
					return null;
				}
			}
		}
		return [ result, i ];
	}

	private static stringToKeyValue( str: string, i: number ): [ [ string, number ], number ] | null
	{
		var key = this.substringToNumber( str, i );
		if ( key != null )
		{
			var keyStr = key[ 0 ].toString( 36 );
			var value = this.substringToValue( str, key[ 1 ] + 1 );
			if ( value != null )
			{
				return [ [ keyStr, value[ 0 ] ], value[ 1 ] ];
			}
			else
			{
				return null;
			}
		}
		else
		{
			return null;
		}
	}



	private static substringToNumber( str: string, i: number ): [ number, number ] | null
	{
		var j = this.findNumberEnd( str, i );
		if ( j > i )
		{
			var sub = str.substring( i, j );
			var value = this.stringToNumber( sub );
			return [ value, j ];
		}
		else
		{
			return null;
		}
	}

	private static findNumberEnd( str: string, i: number ): number
	{
		while ( i < str.length && this.encChars.indexOf( str.charAt( i ) ) >= 0 )
			i++;
		return i;
	}

	private static stringToNumber( str: string ): number | null
	{
		var tmp = "";
		for ( var i = str.length - 1; i >= 0; i-- )
		{
			var c = str.charAt( i );
			var b = this.encChars.indexOf( c );
			if ( b >= 0 && b <= 3 )
			{
				tmp += String.fromCharCode( b + this.zeroCc );
			}
			else
			{
				return null;
			}
		}
		return parseInt( tmp, this.encChars.length );
	}

	private static commandPrefix = 'BZZZT';
	private static sender: ( ( string ) => void ) | null = null;
	private static zeroCc = '0'.charCodeAt( 0 );

	//*
	private static sepChar = '\u200b';
	private static encChars = [ '\u200c', '\u200d', '\u200e', '\u200f' ];
	private static beginArrayChar = '\u202a';
	private static beginObjectChar = '\u202c';
	private static endArrayChar = '\u2066';
	private static endObjectChar = '\u2069';
	//*/

	/*
	private static sepChar = ',';
	private static encChars = [ 'a', 'b', 'c', 'd' ];
	private static beginArrayChar = '[';
	private static beginObjectChar = '{';
	private static endArrayChar = ']';
	private static endObjectChar = '}';
	//*/
}
