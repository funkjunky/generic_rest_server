var ForEach = function(obj, cb) {
    for(var key in obj)
        cb(obj[key], key, obj);
}

module.exports = ForEach;
