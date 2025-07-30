// SoundClient

class SoundClient2
{
	public static setSender( sender: ( string ) => void )
	{
		this.sender = sender;
	}

	public static play()
	{
		this.sendArray( [ 1 ] );
	}

	public static stop()
	{
		this.sendArray( [ 0 ] );
	}

	public static treeToArray( tree: object[] ): number[]
	{
		var result = [];
		for ( var i of tree )
		{
			if ( i instanceof Array )
				result.push( this.treeToArray( i ) );
			else
				result.push( i );
		}
		return result;
	}

	public static sendArray( array: number[] )
	{
		var command = this.arrayToString( array );
		this.sendCommand( command );
	}

	public static sendCommand( command: string )
	{
		if ( this.sender != null )
			this.sender( command );
		else
			console.error( 'Sound client is missing sender.' );
	}

	public static arrayToString( numbers: number[] ): string
	{
		var result = "";
		for ( var i = 0; i < numbers.length; i++ )
		{
			var n = numbers[ i ];
			for ( var j = 0; j < 8; j++ )
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

	public static stringToArray( str: string ): number[] | null
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

	public static sender: ( ( string ) => void ) | null = null;
	public static sepChar = '\u00ad';
	public static encChars = [ '\u200b', '\u200c', '\u200d', '\ufeff' ];
}
