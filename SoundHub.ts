'use strict';

class SoundHub
{
    public static createGui( name, guiPath, activatorPath )
    {
        try
        {
            if ( this.debug && this.guiChecks == 0 )
                console.info( `Sound GUI initialization: "${ name }" container: "${ guiPath }" activator: "${ activatorPath }."` );

            this.guiPath = guiPath;
            this.activatorPath = activatorPath;
            this.findAndHandleCommand( this.insertGui.bind( this ) );

            this.guiChecks++;
            if ( this.gui == null && this.guiChecks < this.maxGuiChecks )
                setTimeout( this.createGui.bind( this, name, activatorPath, guiPath ), this.guiCheckMs );
            else if ( this.debug )
                console.info( 'Sound GUI not connected.' );
        }
        catch ( e )
        {
            console.error( 'Sound GUI error: ' + e );
        }
    };

    private static insertGui()
    {
        if ( this.debug )
            console.debug( 'Sound bulb found' );

        var container = window.document.querySelector( this.guiPath );
        if ( container != null )
        {
            this.createLilGui( container, name );
            this.createCssRules();
            if ( this.debug )
                console.info( 'Sound GUI ready.' );
        }
        else
            console.error( 'Sound container not found.' );
    }

    private static createLilGui( container, name )
    {
        this.gui = new lil.GUI( { container: container, injectStyles: false } );

        var titleGui = this.gui.title( "Settings: " + name );

        var channelsGui = this.gui.add( this.settings, 'channels', { '0,1': '0', '2,3': '2', '4,5': '4' } ).name( 'Output audio channels' );

        this.settings.connectAudioGui = this.gui.add( this.settings, 'connectAudio' ).name( 'Connect to audio device' );

        this.settings.testAudioGui1 = this.gui.add( this.settings, 'testAudio1' ).name( 'Test audio device at 25%' ).disable();
        this.settings.testAudioGui2 = this.gui.add( this.settings, 'testAudio2' ).name( 'Test audio device at 50%' ).disable();
        this.settings.testAudioGui3 = this.gui.add( this.settings, 'testAudio3' ).name( 'Test audio device at 100%' ).disable();

        this.settings.startReceiverGui = this.gui.add( this.settings, 'startReceiver' ).name( 'Start receiver' ).disable();

        var closeGui = this.gui.add( this.settings, 'close' ).name( 'Close' );

    }

    private static createCssRules()
    {
        var css = window.document.styleSheets[ 0 ];
        for ( var cssRule of this.guiCss )
            css.insertRule( cssRule );
    }

    private static listenForCommands()
    {
        var play = ( command ) =>
        {
            if ( command == "abcd" )
                this.sound.playSound( 0, 1, 0.5, 1 );
        }
        this.findAndHandleCommand( play );
        setTimeout( this.listenForCommands.bind( this ), 1000 );
    }

    private static findAndHandleCommand( handler: ( string ) => void )
    {
        var activators = window.document.querySelectorAll( this.activatorPath );
        if ( activators != null && activators.length > 0 )
        {
            if ( this.debug )
                console.debug( 'Sound activators found: ' + activators.length );

            for ( var a = 0; a < activators.length; a++ )
            {
                if ( activators.item( a ) instanceof HTMLElement )
                {
                    if ( this.debug )
                        console.debug( 'Sound HTMLElement' );

                    var h = activators.item( a ) as HTMLElement;
                    if ( SoundSender.isCommand( h.textContent ) )
                        handler( SoundSender.getCommandText( h.textContent ) );
                }
            }
        }
    }

    private static debug = false;
    private static guiChecks = 0;
    private static guiCheckMs = 1000;
    private static maxGuiChecks = 500;
    private static gui;
    private static sound;
    private static guiPath;
    private static activatorPath;

    private static settings =
        {
            supported: false,
            channels: 0,
            connectAudio: function ()
            {
                SoundHub.sound = new WebTones.Theremin( null );
                this.sound = SoundHub.sound;
                this.connectAudioGui.disable();
                this.testAudioGui1.enable();
                this.testAudioGui2.enable();
                this.testAudioGui3.enable();
                this.startReceiverGui.enable();
                SoundHub.listenForCommands();
            },
            testAudio1: function ()
            {
                this.sound.playSound( 0, 0.25, 0.5, 0.5 );
                this.sound.playSound( 1, 0.25, 0.5, 0.5 );
            },
            testAudio2: function ()
            {
                this.sound.playSound( 0, 0.5, 0.5, 0.5 );
                this.sound.playSound( 1, 0.5, 0.5, 0.5 );
            },
            testAudio3: function ()
            {
                this.sound.playSound( 0, 1.0, 0.5, 0.5 );
                this.sound.playSound( 1, 1.0, 0.5, 0.5 );
            },
            startReceiver: function ()
            {
                this.testAudioGui1.disable();
                this.testAudioGui2.disable();
                this.testAudioGui3.disable();
                this.startReceiverGui.disable();
            },
            close: function ()
            {
                this.gui.hide();
                this.gui = null;
            },
            started: false,
            closeAudioGui: null,
            connectAudioGui: null,
            testAudioGui1: null,
            testAudioGui2: null,
            testAudioGui3: null,
            startReceiverGui: null,
        };

    private static guiCss: string[] = [
        '.lil-gui{ position: absolute; left:2em; top:2em; width:15em; z-index:10000 }',
        '.lil-gui{ border:1px solid darkred; padding:0.2em; background-color:#111111; overflow:hidden; }',
        '.lil-gui{ color:white; }',
        '.lil-gui.closed{ width:5em }',
        '.lil-gui button{ width:100%; padding:0.1em; background-color:black; color: lightgray; }'
    ];
}