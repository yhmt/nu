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
