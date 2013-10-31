// Nu 0.0.2 Copyright (c) 2013 Yuya Hashimoto
// See https://github.com/yhmt/nu
;(function (global, document, undefined) {

// document.getElementsByClassName
if (!document.getElementsByClassName) {
    document.getElementsByClassName = function (selector) {
        return document.querySelectorAll("." + selector);
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
    Array.isArray = function (any) {
        return Object.prototype.toString.call(any) === "[object Array]";
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
    } catch (err) {
        setTimeout(IEDOMContentLoaded, 64);
    }
}

var Nu,
    NS        = "Nu",
    loaded    = false,
    loadQueue = [],
    div       = document.createElement("div"),
    readyRe   = /complete|loaded|interactive/,
    support   = {
        touchEvent          : "ontouchstart"        in global,
        addEventListener    : "addEventListener"    in global,
        removeEventListener : "removeEventListener" in global,
        orientationchange   : "onorientationchange" in global,
        pageShow            : "onpageshow"          in global,
        createEvent         : "createEvent"         in document,
        classList           : !!div.classList
    },
    userAgent = (function () {
        var ua           = navigator.userAgent.toLowerCase(),
            ios          = ua.match(/(?:iphone\sos|ip[oa]d.*os)\s([\d_]+)/),
            android      = ua.match(/(android)\s+([\d.]+)/),
            isIOS        = !!ios,
            isAndroid    = !!android,
            checkBrowser = (function () {
                var match = /(webkit)[ \/]([\w.]+)/.exec(ua)              ||
                            /(firefox)[ \/]([\w.]+)/.exec(ua)             ||
                            /(msie) ([\w.]+)/.exec(ua)                    ||
                            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || [];

                return {
                    name    : match[1],
                    version : parseFloat(match[2])
                };
            })(),
            platformName = (function () {
                if (support.touchEvent && (isIOS || isAndroid)) {
                    return isIOS ? "ios" : "android";
                }
                else {
                    return "desktop";
                }
            })(),
            platformVersion = (function () {
                return platformName !== "desktop" ?
                    parseFloat((ios || android).pop().split(/\D/).join(".")) :
                    null;
            })();

        return {
            platform : platformName,
            browser  : checkBrowser.name,
            version  : {
                os      : platformVersion,
                browser : checkBrowser.version
            },
            oldIE      : checkBrowser.name === "msie" && checkBrowser.version < 9,
            oldAndroid : isAndroid && platformVersion < 4
        };
    })(),
    events    = {
        touchstart        : support.touchEvent        ? "touchstart"        : "mousedown",
        touchmove         : support.touchEvent        ? "touchmove"         : "mousemove",
        touchend          : support.touchEvent        ? "touchend"          : "mouseup",
        orientationchange : support.orientationchange ? "orientationchange" : "resize",
        pageshow          : support.pageShow          ? "pageshow"          : this.domcontentloaded,
        domcontentloaded  : !userAgent.oldIE          ? "DOMContentLoaded"  : IEDOMContentLoaded()
    }
;

function isNodeList(node) {
    var type = Object.prototype.toString.call(node);

    return type === "[object NodeList]" || type === "[object HTMLCollection]";
}

function forEach(ary, callback) {
    var i = 0, l = ary.length;

    for (; l; i++, l--) {
        callback.call(ary[i], ary[i]);
    }
}

function IErenameTypes(types) {
    var ret = [];

    forEach(types, function (type) {
        ret.push("on" + type);
    });

    return ret;
}

Nu = (function() {
    function Nu(nodes, selector) {
        var i = 0,
            l = this.length = nodes.length;

        this.selector = selector;

        for (; l; i++, l--) {
            this[i] = nodes[i];
        }

        return this;
    }

    Nu.prototype = {
        constructor: Nu,
        ready: function (callback) {
            var loadEvent = events.domcontentloaded + " " + events.pageshow;

            if (readyRe.test(document.readyState)) {
                callback(this);
                loaded = true;
            }
            else {
                this.on(loadEvent, function () {
                    if (!loaded) {
                        callback(this);
                    }
                    loaded = true;
                });
            }

            return this;
        },
        each: function (fn) {
            var i = 0, l = this.length;

            for (; l; i++, l--) {
                fn.call(this[i], i);
            }

            return this;
        },
        match: function (fn) {
            var l = this.length;

            while (l--) {
                if (fn.call(this[l], l)) {
                    return this[l];
                }
            }

            return null;
        },
        index: function (element) {
            var ret = -1;

            this.match(function (idx) {
                if (this === element) {
                    ret = idx;
                    return true;
                }

                return false;
            });

            return ret;
        },
        on: function (types, fn, capture) {
            var listener, i, l;

            if (support.addEventListener) {
                types    = types.split(" ");
                capture  = capture || false;
                listener = "addEventListener";
            }
            else {
                types    = IErenameTypes(types.split(" "));
                capture  = undefined;
                listener = "attachEvent";
            }

            i = 0;
            l = types.length;

            for (; l; i++, l--) {
                this.each(function () {
                    this[listener](types[i], fn, capture);
                });
            }

            return this;
        },
        off: function (types, fn, capture) {
            var listener, i, l;

            if (support.removeEventListener) {
                types    = types.split(" ");
                capture  = capture || false;
                listener = "removeEventListener";
            }
            else {
                types    = IErenameTypes(types.split(" "));
                capture  = undefined;
                listener = "detachEvent";
            }

            i = 0;
            l = types.length;

            for (; l; i++, l--) {
                this.each(function () {
                    this[listener](types[i], fn, capture);
                });
            }

            return this;
        },
        trigger: function (type, bubbles, cancelable) {
            var event;

            bubbles    = bubbles    || true;
            cancelable = cancelable || false;

            if (support.createEvent) {
                event = document.createEvent("Event");
                event.initEvent(type, bubbles, cancelable);

                this.each(function () {
                    this.dispatchEvent(event);
                });
            }
            else {
                // event = document.createEventObject();

                this.each(function () {
                    // this.fireEvent("on" + type, event);
                    this.fireEvent("on" + type);
                });
            }
        },
        hasClass: function (klass) {
            if (support.classList) {
                return this.match(function () {
                    return this.classList.contains(klass);
                });
            }
            else {
                klass = " " + klass;
                return this.match(function () {
                    return (" " + this.className).indexOf(klass) > -1;
                });
            }
        },
        addClass: function (klass) {
            if (support.classList) {
                this.each(function () {
                    this.classList.add(klass);
                });
            }
            else {
                this.each(function () {
                    if (initialize(this).hasClass(klass)) {
                        return;
                    }
                    this.className += (this.className ? " " : "") + klass;
                });
            }
        },
        removeClass: function (klass) {
            if (support.classList) {
                this.each(function () {
                    this.classList.remove(klass);
                });
            }
            else {
                this.each(function () {
                    this.className = this.className
                        .replace(new RegExp("(\\s|^)" + klass + "(\\s|$)"), " ")
                        .replace(/^s+|\s+$/g, "")
                    ;
                });
            }
        }
    };

    function initialize(selector, context) {
        var regexp = /^(.+[\#\.\s\[\*>:,]|[\[:])/,
            nodes  = null, fn;

        if (typeof selector === "string") {
            context = context || document;
            nodes   = regexp.test(selector) ?
                          context.querySelectorAll(selector) :
                      selector[0] === "#"   ?
                          [context.getElementById(selector.substring(1, selector.length))] :
                      selector[0] === "."   ?
                          context.getElementsByClassName(selector.substring(1, selector.length)) :
                          context.getElementsByTagName(selector)
                      ;
        }
        else if (selector) {
            if (selector.nodeType === 1          ||
                selector          === window     ||
                selector          === document   ||
                selector          === document.body) {

                nodes = [selector];
            }
            else if (isNodeList(selector) ||
                    (Array.isArray(selector) && selector.length && selector[0].nodeType)) {

                nodes = selector;
            }
            else if (typeof selector === "function") {
                fn = selector;

                if (loaded) {
                    fn();
                }
                else {
                    loadQueue.push(fn);
                }
            }
            else if (selector instanceof Nu) {
                return Nu;
            }
        }

        return new Nu(nodes || [], selector);
    }

    return initialize;
})();

global[NS] = global[NS] || Nu;
})(this, this.document);
