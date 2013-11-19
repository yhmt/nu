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
