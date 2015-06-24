var profile = (function () {
    var copyOnly = function (filename, mid) {
            var list = {
                "circuits-js/circuits.profile": true,
                "circuits-js/package.json": true
            };
            return list.hasOwnProperty(mid);
        };
 
    return {
        resourceTags: {
            copyOnly: function (filename, mid) {
                return copyOnly(filename, mid);
            }
        }
    };
}());