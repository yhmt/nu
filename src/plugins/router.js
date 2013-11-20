;(function (global, document, nu) {
    var escapeRe     = /[\-\[\]{}()+?.,\\\^$|#\s]/g,
        namedParamRe = /:([\w\d]+)/g,
        splatParamRe = /\*([\w\d]+)/g;

    function Router() {
        this.routes = [];
    }

    Router.prototype = {
        register: function (route, callback) {
            if (!nu.isRegExp(route)) {
                route = this._comileRoute(route);
            }

            this.routes.push([route, callback]);
        },
        dispatch: function (path) {
            var routes = this.routes,
                i      = 0,
                len    = routes.length,
                route, callback, matched;

            for (; len; ++i, --len) {
                route    = this.routes[i][0];
                callback = this.routes[i][1];
                matched  = route.exec(path);

                if (matched) {
                    callback.apply(this, matched.slice(1));
                }
            }
        },
        _compileRoute: function (route) {
            route = route.replace(escapeRe,     "\\$&"]])
                         .replace(namedParamRe, "([^\/]+)")
                         .replace(splatParamRe, "(.*?)")
                    ;

            return new RegExp("^" + route + "$");
        }
    };

    nu.fn.router = Router;

})(this, this.document, this.Nu);
