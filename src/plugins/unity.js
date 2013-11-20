;(function (global, document, nu) {
    function UnityWebMediator() {
        var platform = nu.userAgent.platform,
            ios      = platform === ios,
            android  = platform === android,
            mac      = platform === mac,
            message, stack, keys, key, i, len;

        this.messageQueue = []; 

        this.callback     = function (path, args) {
            message = path;

            if (args) {
                stack = [];

                Nu.each(args, function (key) {
                    stack.push(key + "=" + encodeURIComponent(args[key]));
                });

                message += "?" + stack.join("&");
            }

            if (ios || mac) {
                this.messageQueue.push(message);
            }
            else if (android) {
                UnityInterface.pushMessage(message);
            }
            else {
                console.log(message);
            }
        };

        this.pollMessage  = function () {
            return this.messageQueue.shift();
        };
    }

    global.unityWebMediatorInstance = nu.fn.unity = UnityWebMediator;

})(this, this.document, this.Nu);
