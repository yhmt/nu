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
