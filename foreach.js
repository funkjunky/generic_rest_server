var ForEach = function(obj, cb) {
    for(var key in obj)
        cb(obj, key)
}

module.exports = ForEach;
