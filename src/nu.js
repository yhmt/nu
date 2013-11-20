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
