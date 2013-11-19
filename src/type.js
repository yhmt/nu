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
