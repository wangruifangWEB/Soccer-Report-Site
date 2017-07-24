function encodeURI(part) {
    return encodeURIComponent(part).replace(/%20/g, "+");
}

function getObjectValue(obj) {
    if (obj.prop("tagName") == "SELECT") {
        return obj.val() || "";
    }
    else if (obj.prop("tagName") == "INPUT" && obj.attr("type") == "checkbox") {
        return obj.prop("checked");
    }
}

function getArgStr(args) {
    var argStr = "";
    for (var [key, value] of args) {
        if (argStr.length > 0) {
            argStr += '&';
        }

        argStr += Array.isArray(value) ? `${key}=` + value.join(`&${key}=`) : `${key}=${value}`;
    }

    return argStr;
}
