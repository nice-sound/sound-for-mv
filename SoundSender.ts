// SoundSender
// SoundSender.valueToString({a:1,b:1,c:[1,2,3,4,[1,2],{a:1}]})
// SoundSender.objectToString({a:1,b:1,c:[1,2,3,4,[1,2],{a:1}]})
class SoundSender
{
	public static notificationConnect( notificationId: string )
	{
		this.sender = function ( command )
		{
			var notification = Notification.get( notificationId );
			if ( notification != null )
				notification.setTitle( command );
			else
				console.error( 'Sound sender. Target notification not found.' );
		};
		this.sendCommand( null );
	}

	public static htmlElementConnect( selector: string )
	{
		this.sender = function ( command )
		{
			var element = document.querySelector( selector );
			if ( element != null && element instanceof HTMLElement )
				element.innerText = command;
			else
				console.error( 'Sound sender. Target element not found.' );
		};
		this.sendCommand( null );
	}

	public static playMonoPulses( volumePercent: number, channelIndex: number )
	{
		this.validateReal0100( volumePercent );
		this.validateInteger010( channelIndex );
		this.sendCommand( { t: 1, v: volumePercent, c: [ channelIndex ] } );
	}

	public static playStereoPulses( volumePercent: number, channelIndexA: number, channelIndexB: number, phasePercent: number )
	{
		this.validateReal0100( volumePercent );
		this.validateInteger010( channelIndexA );
		this.validateInteger010( channelIndexB );
		this.validateReal0100( phasePercent );
		this.sendCommand( { t: 1, v: volumePercent, c: [ channelIndexA, channelIndexB ], p: phasePercent } );
	}

	public static stop()
	{
		this.sendCommand( null );
	}

	public static getCommandText( commandStr: string ): string | null
	{
		if ( commandStr.substring( 0, this.commandPrefix.length ) == this.commandPrefix )
			return commandStr.indexOf( this.commandPrefix ) == 0 ? commandStr.substring( this.commandPrefix.length ) : commandStr;
		else
			return null;
	}


	public static valueToString( value: any ): string
	{
		if ( Array.isArray( value ) )
			return this.arrayToString( value );
		else if ( typeof value == 'number' )
			return this.numberToString( value );
		else
			return this.objectToString( value );
	}

	public static stringToValue( str: string ): any
	{
		var result = this.substringToValue( str, 0 );
		return result != null ? result[ 0 ] : null;
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
			console.error( 'Sound sender. Sender missing.' );
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

	public static validateReal0100( value: number )
	{
		if ( value < 0 || value > 100 )
			throw `Percent out of range: ${ value }.`;
	}

	public static validateInteger010( value: number )
	{
		if ( value < 0 || value > 10 || value != Math.floor( value ) )
			throw `Channel out of range: ${ value }.`;
	}

	private static sender: ( ( string ) => void ) | null = null;
	private static commandPrefix = '\u{1f4a1}';
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
