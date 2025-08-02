// SoundSender
// SoundSender.valueToString({a:1,b:1,c:[1,2,3,4,[1,2],{a:1}]})
// SoundSender.objectToString({a:1,b:1,c:[1,2,3,4,[1,2],{a:1}]})
var SoundSender = /** @class */ (function () {
    function SoundSender() {
    }
    SoundSender.setSender = function (sender) {
        this.sender = sender;
    };
    SoundSender.connect = function () {
        this.sendCommand(null);
    };
    SoundSender.play = function (command) {
        this.sendCommand(command);
    };
    SoundSender.stop = function () {
        this.sendCommand(null);
    };
    SoundSender.isCommand = function (commandStr) {
        return commandStr.substring(0, this.commandPrefix.length) == this.commandPrefix;
    };
    SoundSender.getCommandText = function (commandStr) {
        return commandStr.indexOf(this.commandPrefix) == 0 ? commandStr.substring(this.commandPrefix.length) : commandStr;
    };
    SoundSender.sendCommand = function (command) {
        if (this.sender != null)
            if (command != null) {
                var commandStr = this.valueToString(command);
                this.sender(this.commandPrefix + commandStr);
            }
            else
                this.sender(this.commandPrefix);
        else
            console.error('Sound client is missing sender.');
    };
    SoundSender.valueToString = function (value) {
        if (Array.isArray(value))
            return this.arrayToString(value);
        else if (typeof value == 'number')
            return this.numberToString(value);
        else
            return this.objectToString(value);
    };
    SoundSender.arrayToString = function (array) {
        var result = this.beginArrayChar;
        for (var i = 0; i < array.length; i++) {
            if (i > 0)
                result += this.sepChar;
            var value = array[i];
            result += this.valueToString(value);
        }
        result += this.endArrayChar;
        return result;
    };
    SoundSender.numberToString = function (value) {
        var result = "";
        var tmp = Math.floor(value).toString(4);
        for (var i = 0; i < tmp.length; i++)
            result += this.encChars[tmp.charCodeAt(i) - this.zeroCc];
        return result;
    };
    SoundSender.objectToString = function (object) {
        var result = this.beginObjectChar;
        var keys = Object.keys(object);
        for (var k = 0; k < keys.length; k++) {
            if (k > 0)
                result += this.sepChar;
            var key = keys[k];
            var keyAsNumber = parseInt(key, 36);
            result += this.numberToString(keyAsNumber) + this.sepChar;
            var value = object[key];
            result += this.valueToString(value);
        }
        result += this.endObjectChar;
        return result;
    };
    SoundSender.stringToArray = function (str) {
        var result = [];
        var n = 0;
        var j = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            if (c != this.sepChar) {
                var b = this.encChars.indexOf(c);
                if (b >= 0 && b <= 3) {
                    n = n | (b << (j * 2));
                    j++;
                }
                else
                    return null;
            }
            if (c == this.sepChar || i == str.length - 1) {
                if (j > 0)
                    result.push(n);
                n = 0;
                j = 0;
            }
        }
        return result;
    };
    SoundSender.commandPrefix = 'BZZZT';
    SoundSender.sender = null;
    SoundSender.sepChar = '\u00ad';
    //private static sepChar = ',';
    SoundSender.encChars = ['\u200b', '\u200c', '\u200d', '\ufeff'];
    //private static encChars = [ 'a', 'b', 'c', 'd' ];
    SoundSender.beginObjectChar = '{';
    SoundSender.endObjectChar = '}';
    SoundSender.beginArrayChar = '[';
    SoundSender.endArrayChar = ']';
    SoundSender.zeroCc = "0".charCodeAt(0);
    return SoundSender;
}());
