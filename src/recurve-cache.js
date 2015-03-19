(function universalModuleDefinition(root, factory) {
    "use strict";

    if(typeof exports === 'object' && typeof module === 'object') {
        // Node module exports
        module.exports = factory();
    }
    else if(typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    }
    else if(typeof exports === 'object') {
        // CommonJS style that does not support module.exports
        exports['Cache'] = factory();
    }
    else {
        // Global
        root['Cache'] = factory();
    }
}(this, function () {
    "use strict";

    function Cache(countLimit, totalCostLimit) {
        if (isUndefined(countLimit)) {
            countLimit = 0;
        }
        if (isUndefined(totalCostLimit)) {
            totalCostLimit = 0;
        }

        this._data = {};
        this._countLimit = countLimit;
        this._totalCostLimit = totalCostLimit;
    }

    Cache.prototype = {
        get: function(key) {
            var value = this._data[key];
            return value ? value.value : null;
        },

        set: function(key, value, cost) {
            if (!key) {
                return;
            }

            if (isUndefined(cost)) {
                cost = 0;
            }

            this._data[key] = {value: value, cost: cost};

            if (this._countLimit || (this._totalCostLimit && cost)) {
                evict(this);
            }
        },

        remove: function(key) {
            if (!key) {
                return;
            }

            var exists = this._data.hasOwnProperty(key);
            delete this._data[key];

            return exists;
        },

        exists: function(key) {
            return !!this._data[key];
        },

        clear: function() {
            this._data = {};
        },

        setCountLimit: function(value) {
            this._countLimit = value;
            evict(this);
        },

        getCountLimit: function() {
            return this._countLimit;
        },

        setTotalCostLimit: function(value) {
            this._totalCostLimit = value;
            evict(this);
        },

        getTotalCostLimit: function() {
            return this._totalCostLimit;
        },

        forEach: function(iterator, context) {
            forEach(this._data, function(value, key) {
                iterator.call(context, value.value, key);
            }, context);
        }
    };

    function currentTotalCost(cache) {
        var totalCost = 0;
        forEach(cache._data, function(value) {
            totalCost += value.cost;
        });

        return totalCost;
    }

    function currentCount(cache) {
        var count = 0;
        forEach(cache._data, function() {
            count++;
        });

        return count;
    }

    function evict(cache) {
        if (!shouldEvict(cache)) {
            return;
        }

        evictMostCostly(cache);
        evict(cache);
    }

    function shouldEvict(cache) {
        return (0 < cache.getCountLimit() && cache.getCountLimit() < currentCount(cache)) ||
            (0 < cache.getTotalCostLimit() && cache.getTotalCostLimit() < currentTotalCost(cache));
    }

    function evictMostCostly(cache) {
        var maxCost = 0;
        var maxKey = null;

        forEach(cache._data, function(value, key) {
            if (!maxKey) {
                maxKey = key;
                maxCost = value.cost;
            }
            else if (maxCost < value.cost) {
                maxKey = key;
                maxCost = value.cost;
            }
            else {
                // do nothing - continue
            }
        });

        if (!maxKey) {
            throw new Error("key must exist");
        }
        cache.remove(maxKey);
    }

    function forEach(obj, iterator, context) {
        if (!obj) {
            return obj;
        }

        if (obj.forEach && obj.forEach === Object.forEach) {
            obj.forEach(iterator, context);
        }
        else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (false === iterator.call(context, obj[key], key, obj)) {
                        break;
                    }
                }
            }
        }

        return obj;
    }

    function isUndefined(value) {
        return value === void 0;
    }

    return Cache;
}));