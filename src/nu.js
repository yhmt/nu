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
