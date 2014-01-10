;(function (global, document, nu) {
    var cookie = {
        raw : false
    };

    function encode(str) {
        return cookie.raw ? str : encodeURIComponent(str);
    }

    function decode(str) {
        return cookie.raw ? str : decodeURIComponent(str);
    }

    cookie.get = function (key, callback) {
        var cookies = document.cookie ? document.cookie.split("; ") : [],
            parts, name, value, ret;

        nu.each(cookies, function (str) {
            parts = str.split("=");
            name  = decode(parts[0]);
            value = parts[1];

            if (key && key === name) {
                ret = decode(value);
            }
        });

        return ret;
    };

    cookie.set = function (key, value, options) {
        options = options || {};
        var days, time;

        if (nu.isNumber(options.expires)) {
            days = options.expires;
            time = options.expires = new Date();

            time.setTime(+time + days * 864e+5);
        }

        return (document.cookie = [
            encode(key) + "=" + value,
            options.expires ? "; expires=" + options.expires.toUTCString() : "",
            options.path    ? "; path="    + options.path                  : "",
            options.domain  ? "; domain="  + options.domain                : "",
            options.secure  ? "; secure"                                   : ""
        ].join(""));
    };

    cookie.remove = function (key, options) {
        options = nu.extend(options || {}, { expires: -1 });
        cookie.set(key, "", options);

        return !cookie.get(key);
    };

    nu.cookie = cookie;
})(this, this.document, this.Nu);
