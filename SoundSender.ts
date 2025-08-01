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

	public static isCommand( command: string ): boolean
	{
		return command.substring( 0, this.commandPrefix.length ) == this.commandPrefix;
	}

	public static getCommandText( command: string ): string
	{
		return command.indexOf( this.commandPrefix ) == 0 ? command.substring( this.commandPrefix.length ) : command;
	}

	private static sendCommand( command: object | null )
	{
		if ( this.sender != null )
			if ( command != null )
				this.sender( this.commandPrefix + command );
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

	private static numberToString( value: number ): string
	{
		var result = "";
		var tmp = Math.floor( value ).toString( 4 );
		for ( var i = 0; i < tmp.length; i++ )
			result += this.encChars[ tmp.charCodeAt( i ) - this.zeroCc ];
		return result;
	}

	private static objectToString( object: object ): string
	{
		var result = this.beginObjectChar;
		var keys = Object.keys( object );
		for ( var k = 0; k < keys.length; k++ )
		{
			if ( k > 0 )
				result += this.sepChar;

			var key = keys[ k ];
			var keyAsNumber = parseInt( key, 36 );
			result += this.numberToString( keyAsNumber ) + this.sepChar;

			var value = object[ key ];
			result += this.valueToString( value );
		}
		result += this.endObjectChar;
		return result;
	}

	private static stringToArray( str: string ): number[] | null
	{
		var result: number[] = [];
		var n = 0;
		var j = 0;
		for ( var i = 0; i < str.length; i++ )
		{
			var c = str.charAt( i );
			if ( c != this.sepChar )
			{
				var b = this.encChars.indexOf( c );
				if ( b >= 0 && b <= 3 )
				{
					n = n | ( b << ( j * 2 ) );
					j++;
				}
				else
					return null;
			}
			if ( c == this.sepChar || i == str.length - 1 )
			{
				if ( j > 0 )
					result.push( n );
				n = 0;
				j = 0;
			}
		}
		return result;
	}

	private static commandPrefix = 'BZZZT';
	private static sender: ( ( string ) => void ) | null = null;
	//private static sepChar = '\u00ad';
	private static sepChar = ',';
	//private static encChars = [ '\u200b', '\u200c', '\u200d', '\ufeff' ];
	private static encChars = [ 'a', 'b', 'c', 'd' ];
	private static beginObjectChar = '{';
	private static endObjectChar = '}';
	private static beginArrayChar = '[';
	private static endArrayChar = ']';
	private static zeroCc = "0".charCodeAt( 0 );
}
