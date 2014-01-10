;(function (global, document, nu) {
    var URL_SCHEME = "webviewbridge://",
        platform   = nu.userAgent.platform,
        isAndroid  = platform === android,
        body       = document.body,
        iframeBase = document.createElement("iframe"),
        iframe;

    function callCustomURLScheme() {
        iframe     = iframeBase.cloneNode(false);
        iframe.src = URL_SCHEME;

        body.appendChild(iframe);
        body.removeChild(iframe);

        iframe = null;
    }

    function WebViewMediator() {
        var message, stack;

        this.queue   = [];
        this.command = function (path, args) {
            message = isAndroid ? URL_SCHEME + path : path;

            if (args) {
                stack = [];

                nu.each(args, function (key) {
                    stack.push(key + "=" + encodeURIComponent(args[key]));
                });

                message += "?" + stack.join("&");
            }

            this.queue.push(message);
            callCustomURLScheme();
        };

        this.callMessage = function () {
            return this.queue.shift();
        };

        global.WebViewMediatorInstance = this;
    }

    nu.unity = new WebViewMediator();
})(this, this.document, this.Nu);
