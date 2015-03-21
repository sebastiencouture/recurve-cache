/*!
recurve-cache.js - v0.1.0
Created by Sebastien Couture on 2015-03-21.

git://github.com/sebastiencouture/recurve-cache.git

The MIT License (MIT)

Copyright (c) 2015 Sebastien Couture

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
*/

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

    /**
     * Count and cost based cache.
     *
     * Items are cached up to a total count and cost limit. Once either limits are reached then items
     * are removed. Most costly items are removed first, as a tie breaker or if there are no costs
     * then items are removed by least recently added.
     *
     * @param countLimit number of items to cache before starting to remove. Defaults to no limit
     * @param totalCostLimit total cost of all items before starting to remove. Defaults to no limit
     * @constructor
     */
    function Cache(countLimit, totalCostLimit) {
        if (isUndefined(countLimit) || null === countLimit) {
            countLimit = 0;
        }
        if (isUndefined(totalCostLimit) || null === totalCostLimit) {
            totalCostLimit = 0;
        }

        this._data = {};
        this._countLimit = countLimit;
        this._totalCostLimit = totalCostLimit;
    }

    Cache.prototype = {
        /**
         * Retrieve an item from the cache by key
         *
         * @param key key for the item to retrieve
         * @returns {*} cached item, null if there is no item in the cache
         */
        get: function(key) {
            var value = this._data[key];
            return value ? value.value : null;
        },

        /**
         * Set an item with an optional cost
         *
         * @param key key for the item, if the key is already being used then the item will be replaced
         * @param value value to cache
         * @param cost weight of the item. Most costly items will be evicted first. Defaults to no cost
         */
        set: function(key, value, cost) {
            if (!key) {
                return;
            }

            if (isUndefined(cost)) {
                cost = 0;
            }

            // delete so we don't preserve the previous order for this key
            if (this._data[key]) {
                delete this._data[key];
            }
            this._data[key] = {value: value, cost: cost};

            if (this._countLimit || (this._totalCostLimit && cost)) {
                evict(this);
            }
        },

        /**
         * Remove an item
         *
         * @param key
         * @returns {boolean} true if an item was removed, false otherwise
         */
        remove: function(key) {
            if (!key) {
                return false;
            }

            var exists = this._data.hasOwnProperty(key);
            delete this._data[key];

            return exists;
        },

        /**
         * Checks if an item exists
         *
         * @param key key of the item
         * @returns {boolean} true if an item exists for the key, false otherwise
         */
        exists: function(key) {
            return !!this._data[key];
        },

        /**
         * Clear out all items
         */
        clear: function() {
            this._data = {};
        },

        /**
         * Set the count limit
         *
         * @param value total number of items allowed
         */
        setCountLimit: function(value) {
            this._countLimit = value;
            evict(this);
        },

        /**
         * @returns {*} number of items allowed
         */
        getCountLimit: function() {
            return this._countLimit;
        },

        /**
         * Set the total cost limit
         *
         * @param value total cost of items allowed
         */
        setTotalCostLimit: function(value) {
            this._totalCostLimit = value;
            evict(this);
        },

        /**
         * @returns {*} total cost of items allowed
         */
        getTotalCostLimit: function() {
            return this._totalCostLimit;
        },

        /**
         * Iterate through all items in order they are added. Equivalent to Object.forEach
         *
         * @param iterator callback for each key/value pair
         * @param context callback context. Optional
         */
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
                if (!obj.hasOwnProperty(key)) {
                    continue;
                }

                if (false === iterator.call(context, obj[key], key, obj)) {
                    break;
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