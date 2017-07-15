function encodeURI(part) {
    return encodeURIComponent(part).replace(/%20/g, "+");
}
