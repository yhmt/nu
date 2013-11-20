// Nu 0.0.3 Copyright (C) 2013 @yuya, MIT License.
// See https://github.com/yhmt/nu
;(function (global, document, undefined) {

// document.getElementsByClassName
if (!document.getElementsByClassName) {
    document.getElementsByClassName = function (selector) {
        return document.querySelectorAll("." + selector);
    };
}

// Date.now
// http://d.hatena.ne.jp/uupaa/20091223/1261528727
if (!Date.now) {
    Date.now = function (source) {
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

var Nu, rootNu,
    class2type = {},
    loadQueue  = [],
    isLoaded   = false,
    domTester  = document.createElement("div"),
    support = {
        touchEvent          : "ontouchstart"        in global,
        addEventListener    : "addEventListener"    in global,
        removeEventListener : "removeEventListener" in global,
        orientationchange   : "onorientationchange" in global,
        pageShow            : "onpageshow"          in global,
        createEvent         : "createEvent"         in document,
        classList           : !!domTester.classList
    },
    userAgent  = (function () {
        var ua           = navigator.userAgent.toLowerCase(),
            ios          = ua.match(/(?:iphone\sos|ip[oa]d.*os)\s([\d_]+)/),
            android      = ua.match(/(android)\s+([\d.]+)/),
            isIOS        = !!ios,
            isAndroid    = !!android,
            isWindows    = /windows/.test(ua),
            isMacintosh  = /macintosh/.test(ua),
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
            deviceName   = isIOS || isAndroid ? "mobile" : "desktop",
            platformName = (function () {
                return  isIOS       ?
                            "ios"     :
                        isAndroid   ?
                            "android" :
                        isMacintosh ?
                            "mac"     :
                        isWindows   ?
                            "windows" :
                            "unknown"
                ;
            })(),
            platformVersion = (function () {
                return support.touchEvent && platformName !== "desktop" ?
                    parseFloat((ios || android).pop().split(/\D/).join(".")) :
                    null;
            })();

        return {
            platform : platformName,
            device   : deviceName,
            browser  : checkBrowser.name,
            version  : {
                os      : platformVersion,
                browser : checkBrowser.version
            },
            oldIE      : checkBrowser.name === "msie" && checkBrowser.version < 9,
            oldAndroid : isAndroid && platformVersion < 4
        };
    })(),
    events = {
        touchstart        : support.touchEvent        ? "touchstart"        : "mousedown",
        touchmove         : support.touchEvent        ? "touchmove"         : "mousemove",
        touchend          : support.touchEvent        ? "touchend"          : "mouseup",
        touchcancel       : support.touchEvent        ? "touchcancel"       : "mouseleave",
        orientationchange : support.orientationchange ? "orientationchange" : "resize",
        pageshow          : support.pageShow          ? "pageshow"          : this.domcontentloaded,
        domcontentloaded  : !userAgent.oldIE          ? "DOMContentLoaded"  : IEDOMContentLoaded()
    },
    addListener    = support.addEventListener    ? "addEventListener"    : "attachEvent",
    removeListener = support.removeEventListener ? "removeEventListener" : "detachEvent",
    AryProto       = Array.prototype,
    ObjProto       = Object.prototype,
    FuncProto      = Function.prototype,
    push           = AryProto.push,
    slice          = AryProto.slice,
    concat         = AryProto.concat,
    toString       = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty,
    readyRe        = /complete|loaded|interactive/,
    qsaRe          = /^(.+[\#\.\s\[\*>:,]|[\[:])/
;

function isWindow(obj) {
    return obj != null && obj === obj.window;
}

function isDocument(obj) {
    return obj != null && toString.call(obj) === "[object HTMLDocument]";
}

function isElement(obj) {
    return !!(obj && obj.nodeType === 1);
}

function isArray(obj) {
    return Array.isArray(obj);
}

function isObject(obj) {
    return obj === Object(obj);
}

function isPlainObject(obj) {
    return obj != null && isObject(obj) && !isWindow(obj) && obj.__proto__ === Object.prototype;
}

function isFunction(obj) {
    return toString.call(obj) === "[object Function]";
}

function isString(obj) {
    return toString.call(obj) === "[object String]";
}

function isNumber(obj) {
    return toString.call(obj) === "[object Number]";
}

function isNaN(obj) {
    return isNumber(obj) && obj !== +obj;
}

function isBoolean(obj) {
    return obj === true || obj === false || toString.call(obj) === "[object Boolean]";
}

function isNull(obj) {
    return obj === null;
}

function isUndefined(obj) {
    return obj === void 0;
}

function isDate(obj) {
    return toString.call(obj) === "[object Date]";
}

function isRegExp(obj) {
    return toString.call(obj) === "[object RegExp]";
}

function isNodeList(obj) {
    var type = toString.call(obj);

    return type === "[object NodeList]" || type === "[object HTMLCollection]";
}

function toArray(obj) {
    return slice.call(obj);
}

function each(collection, iterator) {
    var i = 0,
        len, ary, key;

    if (isArray(collection)) {
        len = collection.length;

        for (; len; ++i, --len) {
            iterator(collection[i], i);
        }
    }
    else {
        ary = Object.keys(collection);
        len = ary.length;

        for (; len; ++i, --len) {
            key = ary[i];
            iterator(key, collection[key]);
        }
    }
}

function match(obj, fn) {
    var i   = 0,
        res = {},
        len, ary, key;

    if (isArray(obj)) {
        len = obj.length;

        for (; len; ++i, --len) {
            if (fn(obj[i]), i) {
                return obj[i];
            }
        }
    }
    else if (isPlainObject(obj)) {
        ary = Object.keys(obj);
        len = ary.length;

        for (; len; ++i, --len) {
            key = ary[i];

            if (fn(key, obj[key], i)) {
                res[key] = obj[key];

                return res;
            }
        }
    }

    return null;
}

// We need IE
function IErenameTypes(types) {
    var ret = [];

    each(types, function (type) {
        ret.push("on" + type);
    });

    return ret;
}

function returnTrue() {
    return true;
}

function returnFalse() {
    return false;
}

function fixEvent(event) {
    var prevent;

    if (!("defaultPrevented" in event)) {
        prevent = event.preventDefault;

        event.defaultPrevented = false;
        event.preventDefault   = function () {
            this.defaultPrevented = true;
            prevent.call(this);
        };
    }

    return event;
}

function createEvent(type) {
    var event;

    if (support.createEvent) {
        event = document.createEvent("Event");

        event.initEvent(type, true, true, null, null, null, null, null, null, null, null, null, null, null, null);
    }
    else {
         event = document.createEventObject();
    }

    event.isDefaultPrevented = function () {
        return this.defaultPrevented;
    };

    return fixEvent(event);
    // return event;
}

function has(obj, key) {
    return hasOwnProperty.call(obj, key);
}

function pick(obj) {
    var copy = {},
        keys = concat.apply(AryProto, slice.call(arguments, 1));

    each(keys, function (key) {
        each(key, function (k) {
            copy[k] = obj[k];
        });
    });

    return copy;
}

Nu = function (selector, context) {
    var nodes = null, fn;

    if (typeof selector === "string") {
        context = context || document;
        nodes   = qsaRe.test(selector) ?
                      context.querySelectorAll(selector) :
                  selector[0] === "#"  ?
                      [context.getElementById(selector.substring(1, selector.length))] :
                  selector[0] === "."  ?
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
                (isArray(selector) && selector.length && selector[0].nodeType)) {

            nodes = selector;
        }
        else if (isFunction(selector)) {
            fn = selector;

            return rootNu.ready(fn);
        }
        else if (selector instanceof Nu) {
            return Nu;
        }
    }

    return new Nu.fn.init(nodes || [], selector);
};

Nu.fn = Nu.prototype = {
    constructor: Nu,
    init: function (nodes, selector) {
        var i   = 0,
            len = this.length = nodes.length;

        this.selector = selector;

        this._data      = {};
        this._delegates = {};

        for (; len; ++i, --len) {
            this[i] = nodes[i];
        }

        return this;
    },
    ready: function (fn) {
        var loadEvents = events.domcontentloaded + " " + events.pageshow;

        if (readyRe.test(document.readyState)) {
            fn();
        }
        else {
            this.on(loadEvents, function () {
                fn();
            });
        }

        return this;
    },
    each: function (iterator) {
        var i   = 0,
            len = this.length;

        for (; len; ++i, --len) {
            iterator.call(this[i], i);
        }

        return this;
    },
    match: function (iterator) {
        var l = this.length;

        while (l--) {
            if (iterator.call(this[l], l)) {
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
    get: function (num) {
        return num == null ?
                toArray(this) :
                (num < 0 ? this[this.length + num] : this[num]);
    },
    on: function (types, selector, fn, /* INTERNAL */one) {
        var i = 0, _this = this,
            method;

        if (isString(types)) {
            types = support.addEventListener ?
                        types.split(" ") :
                        IErenameTypes(types.split(" "));
        }

        function _bind(type, callback) {
            callback = callback || selector;

            _this.each(function () {
                this[addListener](type, callback);
            });
        }

        function _delegate(type) {
            var delegate, listener,
                eventTarget, args, matched, origFn;

            delegate = _this._delegates[type];
            listener = {
                selector : selector,
                callback : fn
            };

            if (!delegate) {
                delegate = _this._delegates[type] = {
                    listeners : [],
                    handler   : function (event) {
                        eventTarget = event.target;
                        args        = arguments;

                        match(delegate.listeners, function (listener) {
                            matched = Nu(listener.selector).match(function () {
                                return this.contains(eventTarget);
                            });

                            if (matched) {
                                if (isFunction(listener.callback)) {
                                    listener.callback.apply(matched, args);
                                }
                                else if (listener.callback.handleEvent) {
                                    listener.callback.handleEvent.apply(matched, args);
                                }
                            }

                            return matched;
                        });
                    }
                };

                _bind(type, delegate.handler);
            }

            delegate.listeners.push(listener);
        }

        method = isString(selector) ? _delegate : _bind;

        each(types, function (type) {
            method(type);
        });

        return this;
    },
    one: function (types, selector, fn) {
        return this.on(types, selector, fn, 1);
    },
    off: function (types, selector, fn) {
        var i = 0, _this = this,
            method;

        if (isString(types)) {
            types = support.removeEventListener ?
                        types.split(" ") :
                        IErenameTypes(types.split(" "));
        }

        function _unbind(type, callback) {
            callback = callback || selector;

            _this.each(function () {
                this[removeListener](type, callback);
            });
        }

        function _undelegate(type) {
            var delegate, listeners, listener,
                eventTarget, args, matched, origFn;

            delegate = _this._delegates[type];
            listeners = delegate.listeners;

            if (!listeners || !listeners.length) {
                return;
            }
            else if (isUndefined(fn)) {
                each(listeners, function (listener, idx) {
                    if (listener.selector === selector) {
                        listeners.splice(idx, 1);
                    }
                });
            }
            else {
                match(listeners, function (listener, idx) {
                    if (listener.selector === selector &&
                        listener.callback === fn) {

                        listener.splice(idx, 1);
                        return true;
                    }

                    return false;
                });
            }

            if (!listeners.length) {
                _unbind(type, delegate.handler);
                delete _this._delegates[type];
            }
        }

        method = isString(selector) ? _undelegate : _unbind;

        each(types, function (type) {
            method(type);
        });

        return this;
    },
    trigger: function (/* type[, data...] */) {
        var args = toArray(arguments),
            type, event;

        if (isString(args[0])) {
            type  = args.shift();
            event = createEvent(type);
        }
        else {
            event = args.shift();
        }

        if (args.length) {
            event._data = args;
        }

        if (support.createEvent) {
            this.each(function () {
                this.dispatchEvent(event);
            });
        }
        else {
            // this.each(function () {
            //     event.fireEvent(type, event);
            // });
        }

        return this;
    },
    hasClass: support.classList ?
        function (klass) {
            return this.match(function () {
                return this.classList.contains(klass);
            });

        } :
        function (klass) {
            klass = " " + klass;

            return this.match(function () {
                return (" " + this.className).indexOf(klass) > -1;
            });
        }
    ,
    addClass: support.classList ?
        function (klass) {
            return this.each(function () {
                this.classList.add(klass);
            });
        } :
        function (klass) {
            return this.each(function () {
                if (Nu(this).hasClass(klass)) {
                    return;
                }

                this.className += (this.className ? " " : "") + klass;
            });
        }
    ,
    removeClass: support.classList ?
        function (klass) {
            return this.each(function () {
                this.classList.remove(klass);
            });
        } :
        function (klass) {
            return this.each(function () {
                this.className = this.className
                    .replace(new RegExp("(\\s|^)" + klass + "(\\s|$)"), " ")
                    .replace(/^s+|\s+$/g, "")
                ;
            });
        }
    ,
    toggleClass: function (klass) {
        var target;

        this.each(function () {
            target = Nu(this);

            if (target.hasClass(klass)) {
                target.removeClass(klass);
            }
            else {
                target.addClass(klass);
            }
        });

        return this;
    },
    find: function (query) {
        var res;

        this.each(function () {
            res = toArray(concat(Nu(query, this)));
        });

        return Nu(res);
    },
    append: function (obj) {
        var userClone = this.length > 1,
            _this;

        return this.each(isString(obj) ?
                function () {
                    this.insertAdjacentHTML("beforeend", obj);
                } :
                function () {
                    _this = this;

                    if (isElement(obj)) {
                        this.appendChild(userClone ? obj.cloneNode(true) : obj);
                    }
                    else if (obj instanceof Nu) {
                        obj.each(function () {
                            _this.appendChild(this);
                        });
                    }
                }
            )
        ;
    },
    prepend: function (obj) {
        var useClone = this.length > 1,
            _this;

        return this.each(isString(obj) ?
                function () {
                    this.insertAdjacentHTML("afterbegin", obj);
                } :
                function () {
                    _this = this;

                    if (isElement(obj)) {
                        this.insertBefore(useClone ? obj.cloneNode(true) : obj, this.firstChild);
                    }
                    else if (obj instanceof Nu) {
                        obj.each(function () {
                            _this.insertBefore(this, _this.firstChild);
                        });
                    }
                }
            )
        ;
    },
    closest: function (selector) {
        var res    = [],
            target = toArray(Nu(selector)),
            element;

        this.each(function () {
            element = this;

            while (element) {
                if (target.indexOf(element) > -1) {
                    if (res.indexOf(element) === -1) {
                        res.push(element);
                    }

                    break;
                }

                element = element.parentNode;
            }
        });

        return Nu(res);
    },
    attr: function (name, value) {
        if (isPlainObject(name)) {
            each(name, function (key, value) {
                return this.each(function () {
                    this.setAttribute(key, value);
                });
            });
        }
        else if (name && value) {
            return this.each(function () {
                this.setAttribute(name, value);
            });
        }
        else if (name) {
            this[0].getAttribute(name);
        }

        return this;
    },
    val: function (value) {
        if (value) {
            return this.each(function () {
                this.value = value;
            });
        }
        else {
            return this[0].value;
        }

        return this;
    },
    remove: function () {
        return this.each(function () {
            this.parentNode.removeChild(this);
        });
    },
    empty: function () {
        return this.each(function () {
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }
        });
    },
    html: function (value) {
        if (value == null) {
            return this[0].innerHTML;
        }

        if (isElement(value)) {
            this.empty().append(value);
        }
        else {
            this.each(function () {
                this.empty();
                this.insertAdjacentHTML("afterbegin", value);
            });
        }

        return this;
    },
    show: function (value) {
        return this.each(function () {
            this.style.display = "block";
        });
    },
    hide: function (value) {
        return this.each(function () {
            this.style.display = "none";
        });
    },
    toggle: function () {
        return this.each(function () {
            if (/dipslay:\s?none/.test(this.style)) {
                this.style.display = "block";
            }
            else {
                this.style.display = "none";
            }
        });
    }
};

Nu.fn.init.prototype = Nu.fn;

Nu.extend = Nu.fn.extend = function () {
    var args   = toArray(arguments),
        target = args[0] || {},
        i      = 1,
        len    = args.length,
        deep   = false,
        src, copyIsAry, copy, name, options, clone;

    if (isBoolean(target)) {
        deep   = target;
        target = args[1] || {};
        ++i;
    }

    if (!isObject(target) && !isFunction(target)) {
        target = {};
    }

    if (len === i) {
        target = this;
        --i;
    }

    for (; len; ++i, --len) {
        options = args[i];

        if (options != null) {
            each(options, function (key, idx) {
                src  = target[key];
                copy = options[key];

                if (target !== copy) {
                    copyIsAry = isArray(copy);

                    if (deep && copy && (isPlainObject(copy) || copyIsAry)) {
                        if (copyIsAry) {
                            copyIsAry = false;
                            clone     = src && isArray(src)       ? src : [];
                        }
                        else {
                            clone     = src && isPlainObject(src) ? src : {};
                        }

                        target[key] = Nu.extend(deep, clone, copy);
                    }
                    else if (!isUndefined(copy)) {
                        target[key] = copy;
                    }
                }
            });
        }
    }

    return target;
};

rootNu = Nu(document);

Nu.isWindow      = isWindow;
Nu.isDocument    = isDocument;
Nu.isElement     = isElement;
Nu.isArray       = isArray;
Nu.isObject      = isObject;
Nu.isPlainObject = isPlainObject;
Nu.isFunction    = isFunction;
Nu.isString      = isString;
Nu.isNumber      = isNumber;
Nu.isNaN         = isNaN;
Nu.isBoolean     = isBoolean;
Nu.isNull        = isNull;
Nu.isUndefined   = isUndefined;
Nu.isDate        = isDate;
Nu.isRegExp      = isRegExp;
Nu.isNodeList    = isNodeList;
Nu.toArray       = toArray;

Nu.support       = support;
Nu.userAgent     = userAgent;
Nu.events        = events;

Nu.each          = each;
Nu.match         = match;
Nu.createEvent   = createEvent;

global.Nu = global.nu = Nu;

})(this, this.document);
