'use strict';

var gui = null;

var sound = null;

var settings =
{
    supported: false,
    channels: 0,
    connectAudio: function()
    {
        sound = new WebTones.Theremin( null );
        this.connectAudioGui.disable();
        this.testAudioGui1.enable();
        this.testAudioGui2.enable();
        this.testAudioGui3.enable();
        this.startReceiverGui.enable();
    },
    testAudio1: function()
    {
        sound.playSound( 0, 0.25, 0.5, 0.5 );
        sound.playSound( 1, 0.25, 0.5, 0.5 );
    },
    testAudio2: function()
    {
        sound.playSound( 0, 0.5, 0.5, 0.5 );
        sound.playSound( 1, 0.5, 0.5, 0.5 );
    },
    testAudio3: function()
    {
        sound.playSound( 0, 1.0, 0.5, 0.5 );
        sound.playSound( 1, 1.0, 0.5, 0.5 );
    },
    startReceiver: function()
    {
        this.testAudioGui1.disable();
        this.testAudioGui2.disable();
        this.testAudioGui3.disable();
        this.startReceiverGui.disable();
    },
    close: function()
    {
        gui.hide();
        gui = null;
    },
    started: false,
    closeAudioGui: null,
    testAudioGui1: null,
    testAudioGui2: null,
    testAudioGui3: null,
    startReceiverGui: null,
};

var guiCss = [
'.lil-gui{ position: absolute; left:2em; top:2em; width:15em; z-index:10000 }',
'.lil-gui{ border:1px solid darkred; padding:0.2em; background-color:#111111; overflow:hidden; }',
'.lil-gui{ color:white; }',
'.lil-gui button{ width:100% }'
];

var createLilGui = function( container, name )
{
    gui = new lil.GUI( { container:container, injectStyles:false } );
    gui.title( "Settings: " + name );
    gui.add( settings, 'channels', { '0,1':'0', '2,3':'2', '4,5':'4' } ).name( 'Output audio channels' );
    settings.connectAudioGui = gui.add( settings, 'connectAudio' ).name( 'Connect to audio device' );
    settings.testAudioGui1 = gui.add( settings, 'testAudio1' ).name( 'Test audio device at 25%' ).disable();
    settings.testAudioGui2 = gui.add( settings, 'testAudio2' ).name( 'Test audio device at 50%' ).disable();
    settings.testAudioGui3 = gui.add( settings, 'testAudio3' ).name( 'Test audio device at 100%' ).disable();
    settings.startReceiverGui = gui.add( settings, 'startReceiver' ).name( 'Start receiver' ).disable();
    gui.add( settings, 'close' ).name( 'Close' );
}

var createCssRules = function()
{
    var css = window.document.styleSheets[ 0 ];
    for( var cssRule of guiCss )
        css.insertRule( cssRule );
}

var createGui = function( name, activatorPath, containerPath )
{
    try
    {
        console.debug( `Sound GUI initialization: "${name}" activator: "${activatorPath}" container: "${containerPath}"` );
        var activator = window.document.querySelector( activatorPath );
        var container = window.document.querySelector( containerPath );
        if( activator != null && activator.textContent == 'ES' && container != null )
        {
            createLilGui( container, name );
            createCssRules();
            console.debug( 'Sound GUI ready.' );
        }
        else
            setTimeout( createGui.bind( this, name, activatorPath, containerPath ), 2000 );
    }
    catch( e )
    {
        console.debug( 'Sound GUI error: ' + e );
    }
};