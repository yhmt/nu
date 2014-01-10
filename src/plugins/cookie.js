;(function (global, document, nu) {
    function Cookie(config) {
        this.config = nu.extend(config || {}, { raw : false });
    }

    Cookie.prototype = {
        get: function (key) {
            var self    = this,
                cookies = document.cookie ? document.cookie.split("; ") : [],
                parts, name, value, ret;

            nu.each(cookies, function (str) {
                parts = str.split("=");
                name  = self._decode(parts[0]);
                value = parts[1];

                if (key && key === name) {
                    ret = self._decode(value);
                }
            });

            return ret;
        },
        set: function (key, value, options) {
            options = options || {};
            var self = this,
                days, time;

            if (nu.isNumber(options.expires)) {
                days = options.expires;
                time = options.expires = new Date();

                time.setTime(+time + days * 864e+5);
            }

            return (document.cookie = [
                self._encode(key) + "=" + value,
                options.expires ? "; expires=" + options.expires.toUTCString() : "",
                options.path    ? "; path="    + options.path                  : "",
                options.domain  ? "; domain="  + options.domain                : "",
                options.secure  ? "; secure"                                   : ""
            ].join(""));
        },
        remove: function (key, options) {
            options = nu.extend(options || {}, { expires: -1 });
            this.set(key, "", options);

            return !this.get(key);
        },
        _encode: function (str) {
            return this.config.raw ? str : encodeURIComponent(str);
        },
        _decode: function (str) {
            return this.config.raw ? str : decodeURIComponent(str);
        }
    };

    nu.cookie = Cookie;
})(this, this.document, this.Nu);
