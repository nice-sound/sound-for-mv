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
        var str = Math.floor(value).toString(this.encChars.length);
        for (var i = str.length - 1; i >= 0; i--)
            result += this.encChars[str.charCodeAt(i) - this.zeroCc];
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
    SoundSender.stringToValue = function (str) {
        var result = {};
        for (var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            if (c == this.beginObjectChar) {
            }
            else if (c == this.beginArrayChar) {
            }
            else if (c == this.endObjectChar || c == this.endArrayChar || c == this.sepChar) {
            }
            else {
                i = this.stringToKeyValue(str, i, result);
            }
        }
        return result;
    };
    SoundSender.stringToKeyValue = function (str, i, out) {
        var j = this.findNumberEnd(str, i);
        var keyAsNumber = this.substringToNumber(str, i, j);
        var key = keyAsNumber.toString(36);
        j++;
        var j2 = this.findNumberEnd(str, j);
        var value = this.substringToNumber(str, j, j2);
        out[key] = value;
        return j2;
    };
    SoundSender.findNumberEnd = function (str, i) {
        while (i < str.length && this.encChars.indexOf(str.charAt(i)) > -1)
            i++;
        return i;
    };
    SoundSender.substringToNumber = function (str, i, j) {
        var sub = str.substring(i, j);
        return this.stringToNumber(sub);
    };
    SoundSender.stringToNumber = function (str) {
        var tmp = "";
        for (var i = str.length - 1; i >= 0; i--) {
            var c = str.charAt(i);
            var b = this.encChars.indexOf(c);
            if (b >= 0 && b <= 3)
                tmp += String.fromCharCode(b + this.zeroCc);
            else
                return null;
        }
        return parseInt(tmp, this.encChars.length);
    };
    SoundSender.commandPrefix = 'BZZZT';
    SoundSender.sender = null;
    //private static sepChar = '\u00ad';
    SoundSender.sepChar = ',';
    //private static encChars = [ '\u200b', '\u200c', '\u200d', '\ufeff' ];
    SoundSender.encChars = ['a', 'b', 'c', 'd'];
    SoundSender.beginObjectChar = '{';
    SoundSender.endObjectChar = '}';
    SoundSender.beginArrayChar = '[';
    SoundSender.endArrayChar = ']';
    SoundSender.zeroCc = '0'.charCodeAt(0);
    return SoundSender;
}());
