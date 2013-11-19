;(function (global, document, Nu) {
    var touch        = {},
        events       = [
            "swipe"     , "swipeleft" , "swiperight" , "swipeup" , "swipedown" , 
            "doubletap" , "tap"       , "singletap"  , "longtap"
        ],
        hasTouch     = Nu.support.touchEvent,
        touchstart   = Nu.events.touchstart,
        touchmove    = Nu.events.touchmove,
        touchend     = Nu.events.touchend,
        touchcancel  = Nu.events.touchcancel,
        longTapDelay = 750,
        touchTimeout, tapTimeout, swipeTimeout, longTapTimeout;

    function resetTouch() {
        touch = {};
    }

    function swipeDirection(x1, x2, y1, y2) {
        return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ?
                (x1 - x2 > 0 ? "left" : "right") :
                (y1 - y2 > 0 ? "up"   : "down")
        ;
    }

    function longTap() {
        longTapTimeout = null;

        if (touch.el) {
            touch.el.trigger("longtap");
            resetTouch();
        }
    }

    function cancelLongTap() {
        if (longTapTimeout) {
            clearTimeout(longTapTimeout);
        }

        longTapTimeout = null;
    }

    function cancelAll() {
        Nu.each([touchTimeout, tapTimeout, swipeTimeout, longTapTimeout], function (iterator) {
            if (iterator) {
                clearTimeout(iterator);
            }
        });

        touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null;
        resetTouch();
    }

    function touchHandler() {
        var deltaX = 0,
            deltaY = 0,
            firstTouch, now, delta, target, tapEvent;

        Nu(document)
            .on(touchstart, function (event) {
                firstTouch = hasTouch ? event.touches[0] : event;
                now        = Date.now();
                delta      = now - (touch.last || now);
                target     = "tagName" in firstTouch.target ?
                                 firstTouch.target : firstTouch.target.parentNode;
                touch.el   = Nu(target);

                if (touchTimeout) {
                    clearTimeout(touchTimeout);
                }

                touch.x1 = firstTouch.pageX;
                touch.y1 = firstTouch.pageY;

                if (delta > 0 && delta <= 250) {
                    touch.isDoubleTap = true;
                }

                touch.last     = now;
                longTapTimeout = setTimeout(longTap, longTapDelay);
            })
            .on(touchmove, function (event) {
                firstTouch = hasTouch ? event.touches[0] : event;
                cancelLongTap();

                touch.x2 = firstTouch.pageX;
                touch.y2 = firstTouch.pageY;
                
                deltaX   += Math.abs(touch.x1 - touch.x2);
                deltaX   += Math.abs(touch.y1 - touch.y2);
            })
            .on(touchend, function (event) {
                cancelLongTap();

                if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                    (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)) {

                    swipeTimeout = setTimeout(function () {
                        touch.el.trigger("swipe");
                        touch.el.trigger("swipe" + swipeDirection(touch.x1, touch.x2,
                                                                  touch.y1, touch.y2));

                        resetTouch();
                    }, 0);
                }
                else if ("last" in touch) {
                    if (deltaX < 30 && deltaY < 30) {
                        tapTimeout = setTimeout(function () {
                            tapEvent             = Nu.createEvent("tap");
                            tapEvent.cancelTouch = cancelAll;

                            touch.el.trigger(tapEvent);

                            if (touch.isDoubleTap) {
                                touch.el.trigger("doubletap");
                                resetTouch();
                            }
                            else {
                                touchTimeout = setTimeout(function () {
                                    touchTimeout = null;
                                    touch.el.trigger("singletap");
                                    resetTouch();
                                }, 250);
                            }
                        }, 0);
                    }
                    else {
                        resetTouch();
                    }

                    deltaX = deltaY = 0;
                }
            })
            .on(touchcancel, cancelAll)
        ;

        Nu(window).on("scroll", cancelAll);
    }

    Nu(function () {
        touchHandler();

        Nu.each(events, function(event) {
            Nu.fn[event] = function (callback) {
                return this.on(event, callback);
            };
        });
    });
})(this, this.document, this.Nu);
