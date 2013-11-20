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
