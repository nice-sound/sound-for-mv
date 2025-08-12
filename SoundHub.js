'use strict';
var SoundHub = /** @class */ (function () {
    function SoundHub() {
    }
    SoundHub.createGui = function (name, guiPath, activatorPath) {
        try {
            if (this.debug && this.guiChecks == 0)
                console.info("Sound GUI initialization: \"".concat(name, "\" container: \"").concat(guiPath, "\" activator: \"").concat(activatorPath, ".\""));
            this.guiPath = guiPath;
            this.activatorPath = activatorPath;
            this.findAndHandleCommand(this.insertGui.bind(this));
            this.guiChecks++;
            if (this.gui == null && this.guiChecks < this.maxGuiChecks)
                setTimeout(this.createGui.bind(this, name, activatorPath, guiPath), this.guiCheckMs);
            else if (this.debug)
                console.info('Sound GUI not connected.');
        }
        catch (e) {
            console.error('Sound GUI error: ' + e);
        }
    };
    ;
    SoundHub.insertGui = function () {
        if (this.debug)
            console.debug('Sound bulb found');
        var container = window.document.querySelector(this.guiPath);
        if (container != null) {
            this.createLilGui(container, name);
            this.createCssRules();
            if (this.debug)
                console.info('Sound GUI ready.');
        }
        else
            console.error('Sound container not found.');
    };
    SoundHub.createLilGui = function (container, name) {
        this.gui = new lil.GUI({ container: container, injectStyles: false });
        var titleGui = this.gui.title("Settings: " + name);
        var channelsGui = this.gui
            .add(this.settings, 'channels', { '0,1': '0', '2,3': '2', '4,5': '4' })
            .name('Output audio channels');
        this.settings.connectAudioGui = this.gui
            .add(this.settings, 'connectAudio')
            .name('Connect to audio device');
        this.settings.testAudioGui1 = this.gui
            .add(this.settings, 'testAudio1')
            .name('Test audio device at 25%')
            .disable();
        this.settings.testAudioGui2 = this.gui
            .add(this.settings, 'testAudio2')
            .name('Test audio device at 50%')
            .disable();
        this.settings.testAudioGui3 = this.gui
            .add(this.settings, 'testAudio3')
            .name('Test audio device at 100%')
            .disable();
        this.settings.startReceiverGui = this.gui
            .add(this.settings, 'startReceiver')
            .name('Start receiver')
            .disable();
        var closeGui = this.gui
            .add(this.settings, 'close')
            .name('Close');
    };
    SoundHub.createCssRules = function () {
        var css = window.document.styleSheets[0];
        for (var _i = 0, _a = this.guiCss; _i < _a.length; _i++) {
            var cssRule = _a[_i];
            css.insertRule(cssRule);
        }
    };
    SoundHub.createAudio = function () {
        SoundHub.sound = new WebTones.Theremin(null);
    };
    SoundHub.listenForCommands = function () {
        this.findAndHandleCommand(this.playSoundCommnad.bind(this));
        setTimeout(this.listenForCommands.bind(this), 1000);
    };
    SoundHub.findAndHandleCommand = function (handler) {
        var activators = window.document.querySelectorAll(this.activatorPath);
        if (activators != null && activators.length > 0) {
            if (this.debug)
                console.debug('Sound activators found: ' + activators.length);
            for (var a = 0; a < activators.length; a++) {
                if (activators.item(a) instanceof HTMLElement) {
                    if (this.debug)
                        console.debug('Sound HTMLElement');
                    var h = activators.item(a);
                    if (SoundSender.isCommand(h.textContent))
                        handler(SoundSender.getCommandText(h.textContent));
                }
            }
        }
    };
    SoundHub.playSoundCommnad = function (command) {
        var value = SoundSender.stringToValue(command);
        if (value != null) {
            if (value.t == 0) {
                this.sound.stop();
            }
            else if (value.t == 1) {
                SoundSender.validateReal0100(value.v);
                for (var _i = 0, _a = value.c; _i < _a.length; _i++) {
                    var channelIndex = _a[_i];
                    SoundSender.validateInteger010(channelIndex);
                    this.sound.playSound(channelIndex, value.v / 100, 0.5, 1);
                }
            }
        }
    };
    SoundHub.settings = {
        supported: false,
        channels: 0,
        connectAudio: function () {
            SoundHub.createAudio();
            this.sound = SoundHub.sound;
            this.connectAudioGui.disable();
            this.testAudioGui1.enable();
            this.testAudioGui2.enable();
            this.testAudioGui3.enable();
            this.startReceiverGui.enable();
            SoundHub.listenForCommands();
        },
        testAudio1: function () {
            this.sound.playSound(0, 0.25, 0.5, 0.5);
            this.sound.playSound(1, 0.25, 0.5, 0.5);
        },
        testAudio2: function () {
            this.sound.playSound(0, 0.5, 0.5, 0.5);
            this.sound.playSound(1, 0.5, 0.5, 0.5);
        },
        testAudio3: function () {
            this.sound.playSound(0, 1.0, 0.5, 0.5);
            this.sound.playSound(1, 1.0, 0.5, 0.5);
        },
        startReceiver: function () {
            this.testAudioGui1.disable();
            this.testAudioGui2.disable();
            this.testAudioGui3.disable();
            this.startReceiverGui.disable();
        },
        close: function () {
            this.gui.hide();
            this.gui = null;
        },
        started: false,
        closeAudioGui: null,
        connectAudioGui: null, testAudioGui1: null,
        testAudioGui2: null,
        testAudioGui3: null,
        startReceiverGui: null,
    };
    SoundHub.guiCss = [
        '.lil-gui{ position: absolute; left:2em; top:2em; width:15em; z-index:10000 }',
        '.lil-gui{ border:1px solid darkred; padding:0.2em; background-color:#111111; overflow:hidden; }',
        '.lil-gui{ color:white; }',
        '.lil-gui.closed{ width:5em }',
        '.lil-gui button{ width:100%; padding:0.1em; background-color:darkgray; color:lightgray; }',
        '.lil-gui button.disabled{ color:black; color:darkgray; }'
    ];
    SoundHub.debug = false;
    SoundHub.guiChecks = 0;
    SoundHub.guiCheckMs = 1000;
    SoundHub.maxGuiChecks = 500;
    return SoundHub;
}());
