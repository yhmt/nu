// document.getElementsByClassName
if (!document.getElementsByClassName) {
    document.getElementsByClassName = function (selector) {
        return document.querySelectorAll("." + selector);
    };
}

// Date.now
// http://d.hatena.ne.jp/uupaa/20091223/1261528727
if (!Date.now) {
    Date.now = function () {
        return +new Date();
    };
}

// Object.keys
// http://uupaa.hatenablog.com/entry/2012/02/04/145400
if (!Object.keys) {
    Object.keys = function (source) {
        var ret = [], i = 0, key;

        for (key in source) {
            if (source.hasOwnProperty(key)) {
                ret[i++] = key;
            }
        }

        return ret;
    };
}

// Array.isArray
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    };
}

// Function.prototype.bind
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
    Function.prototype.bind = function (obj) {
        if (typeof this !== "function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
        var slice  = [].slice,
            args   = slice.call(arguments, 1),
            method = this,
            func   = function () {},
            bound  = function () {
                return method.apply(
                        this instanceof func ?
                            this : obj || window,
                        args.concat(slice.call(arguments))
                );
            }
        ;

        func.prototype  = this.prototype;
        bound.prototype = new func();

        return bound;
    };
}

// String.prototype.trim
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
// if (!String.prototype.trim) {
//     String.prototype.trim = function () {
//         return this.replace(/^\s+|\s+$/g, "");
//     };
// }

// DOMContentLoaded for IE
function IEDOMContentLoaded() {
    try {
        (new Image()).doScroll();
        // return "DOMContentLoaded";
        return document.fireEvent("DOMContentLoaded", document.createEventObject());
    }
    catch (err) {
        setTimeout(IEDOMContentLoaded, 64);
    }
}
