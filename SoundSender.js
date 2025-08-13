// SoundSender
// SoundSender.valueToString({a:1,b:1,c:[1,2,3,4,[1,2],{a:1}]})
// SoundSender.objectToString({a:1,b:1,c:[1,2,3,4,[1,2],{a:1}]})
var SoundSender = /** @class */ (function () {
    function SoundSender() {
    }
    SoundSender.notificationConnect = function (notificationId) {
        this.sender = function (command) {
            var notification = Notification.get(notificationId);
            if (notification != null)
                notification.setTitle(command);
            else
                console.error('Sound sender. Target notification not found.');
        };
        this.sendCommand(null);
    };
    SoundSender.htmlElementConnect = function (selector) {
        this.sender = function (command) {
            var element = document.querySelector(selector);
            if (element != null && element instanceof HTMLElement)
                element.innerText = command;
            else
                console.error('Sound sender. Target element not found.');
        };
        this.sendCommand(null);
    };
    SoundSender.playMonoPulses = function (volumePercent, channelIndex) {
        this.validateReal0100(volumePercent);
        this.validateInteger010(channelIndex);
        this.sendCommand({ t: 1, v: volumePercent, c: [channelIndex] });
    };
    SoundSender.playStereoPulses = function (volumePercent, channelIndexA, channelIndexB, phasePercent) {
        this.validateReal0100(volumePercent);
        this.validateInteger010(channelIndexA);
        this.validateInteger010(channelIndexB);
        this.validateReal0100(phasePercent);
        this.sendCommand({ t: 1, v: volumePercent, c: [channelIndexA, channelIndexB], p: phasePercent });
    };
    SoundSender.pauseAll = function () {
    };
    SoundSender.stopAll = function () {
        this.sendCommand({ t: 0 });
    };
    SoundSender.isCommand = function (commandStr) {
        return commandStr.substring(0, this.commandPrefix.length) == this.commandPrefix;
    };
    SoundSender.getCommandText = function (commandStr) {
        return commandStr.indexOf(this.commandPrefix) == 0 ? commandStr.substring(this.commandPrefix.length) : commandStr;
    };
    SoundSender.valueToString = function (value) {
        if (Array.isArray(value))
            return this.arrayToString(value);
        else if (typeof value == 'number')
            return this.numberToString(value);
        else
            return this.objectToString(value);
    };
    SoundSender.stringToValue = function (str) {
        var result = this.substringToValue(str, 0);
        return result != null ? result[0] : null;
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
            console.error('Sound sender. Sender missing.');
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
    SoundSender.objectToString = function (object) {
        var result = this.beginObjectChar;
        var keys = Object.keys(object);
        for (var k = 0; k < keys.length; k++) {
            var key = keys[k];
            if (key != null && key.length > 0) {
                if (k > 0)
                    result += this.sepChar;
                var keyAsNumber = parseInt(key, 36);
                result += this.numberToString(keyAsNumber) + this.sepChar;
                var value = object[key];
                result += this.valueToString(value);
            }
        }
        result += this.endObjectChar;
        return result;
    };
    SoundSender.numberToString = function (value) {
        var result = "";
        var str = Math.floor(value).toString(this.encChars.length);
        for (var i = str.length - 1; i >= 0; i--)
            result += this.encChars[str.charCodeAt(i) - this.zeroCc];
        return result;
    };
    SoundSender.substringToValue = function (str, i) {
        var c = str.charAt(i);
        if (c == this.beginArrayChar) {
            return this.substringToArray(str, i + 1);
        }
        else if (c == this.beginObjectChar) {
            return this.substringToObject(str, i + 1);
        }
        else if (this.encChars.indexOf(c) >= 0) {
            return this.substringToNumber(str, i);
        }
        else {
            return null;
        }
    };
    SoundSender.substringToArray = function (str, i) {
        var result = [];
        while (i < str.length) {
            var c = str.charAt(i);
            if (c == this.sepChar) {
                i++;
            }
            else if (c == this.endArrayChar) {
                i++;
                break;
            }
            else {
                var value = this.substringToValue(str, i);
                if (value != null) {
                    result.push(value[0]);
                    i = value[1];
                }
                else {
                    return null;
                }
            }
        }
        return [result, i];
    };
    SoundSender.substringToObject = function (str, i) {
        var result = {};
        while (i < str.length) {
            var c = str.charAt(i);
            if (c == this.sepChar) {
                i++;
            }
            else if (c == this.endObjectChar) {
                i++;
                break;
            }
            else {
                var value = this.stringToKeyValue(str, i);
                if (value != null) {
                    result[value[0][0]] = value[0][1];
                    i = value[1];
                }
                else {
                    return null;
                }
            }
        }
        return [result, i];
    };
    SoundSender.stringToKeyValue = function (str, i) {
        var key = this.substringToNumber(str, i);
        if (key != null) {
            var keyStr = key[0].toString(36);
            var value = this.substringToValue(str, key[1] + 1);
            if (value != null) {
                return [[keyStr, value[0]], value[1]];
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    };
    SoundSender.substringToNumber = function (str, i) {
        var j = this.findNumberEnd(str, i);
        if (j > i) {
            var sub = str.substring(i, j);
            var value = this.stringToNumber(sub);
            return [value, j];
        }
        else {
            return null;
        }
    };
    SoundSender.findNumberEnd = function (str, i) {
        while (i < str.length && this.encChars.indexOf(str.charAt(i)) >= 0)
            i++;
        return i;
    };
    SoundSender.stringToNumber = function (str) {
        var tmp = "";
        for (var i = str.length - 1; i >= 0; i--) {
            var c = str.charAt(i);
            var b = this.encChars.indexOf(c);
            if (b >= 0 && b <= 3) {
                tmp += String.fromCharCode(b + this.zeroCc);
            }
            else {
                return null;
            }
        }
        return parseInt(tmp, this.encChars.length);
    };
    SoundSender.validateReal0100 = function (value) {
        if (value < 0 || value > 100)
            throw "Percent out of range: ".concat(value, ".");
    };
    SoundSender.validateInteger010 = function (value) {
        if (value < 0 || value > 10 || value != Math.floor(value))
            throw "Channel out of range: ".concat(value, ".");
    };
    SoundSender.sender = null;
    SoundSender.commandPrefix = "\uD83D\uDCA1";
    SoundSender.zeroCc = '0'.charCodeAt(0);
    //*
    SoundSender.sepChar = '\u200b';
    SoundSender.encChars = ['\u200c', '\u200d', '\u200e', '\u200f'];
    SoundSender.beginArrayChar = '\u202a';
    SoundSender.beginObjectChar = '\u202c';
    SoundSender.endArrayChar = '\u2066';
    SoundSender.endObjectChar = '\u2069';
    return SoundSender;
}());
