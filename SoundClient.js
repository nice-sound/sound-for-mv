// SoundClient
var SoundClient2 = /** @class */ (function () {
    function SoundClient2() {
    }
    SoundClient2.setSender = function (sender) {
        this.sender = sender;
    };
    SoundClient2.play = function () {
        this.sendArray([1]);
    };
    SoundClient2.stop = function () {
        this.sendArray([0]);
    };
    SoundClient2.sendArray = function (array) {
        var command = this.arrayToString(array);
        this.sendCommand(command);
    };
    SoundClient2.sendCommand = function (command) {
        if (this.sender != null)
            this.sender(command);
        else
            console.error('Sound client is missing sender.');
    };
    SoundClient2.arrayToString = function (numbers) {
        var result = "";
        for (var i = 0; i < numbers.length; i++) {
            var n = numbers[i];
            for (var j = 0; j < 8; j++) {
                var b = n & 3;
                var c = this.encChars[b];
                result += c;
                n = n >>> 2;
            }
            result += this.sepChar;
        }
        return result;
    };
    SoundClient2.stringToArray = function (str) {
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
    SoundClient2.sender = null;
    SoundClient2.sepChar = '\u00ad';
    SoundClient2.encChars = ['\u200b', '\u200c', '\u200d', '\ufeff'];
    return SoundClient2;
}());
