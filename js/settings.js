(function(lexi, chrome) {

    'use strict';

    var storage = chrome.storage.sync,
        defaults = {
            compact: false
        },
        current;

    function getStorage(callback) {
        storage.get(function(settings) {
            callback(settings);
        });
    };

    function setStorage(settings, rewrite, callback) {
        storage.get(function (current) {
            $.each(settings, function (name, value) {
                if (current[name] === undefined || rewrite) {
                    current[name] = value;
                }
            });
            storage.set(current, function() {
                callback && callback();
            });
        });
    };

    function settings(items, callback) {
        if ($.isFunction(items)) {
           return items($.extend({}, current));
        } else if (items) {
            $.extend(current, items);
            return setStorage(current, true, callback);
        }
        return Q($.extend({}, current));
    }

    chrome.storage.onChanged.addListener(function (changes) {
        $.each(changes, function(name, value) {
            if ($.isFunction(lexi.settings.changed)) {
                lexi.settings.changed(name, value.oldValue, value.newValue);
            }
        });
    });

    setStorage(defaults, false, function () {
        getStorage(function (settings) {
            current = settings;
        });
    });

    lexi.settings = {
        get: settings,
        set: settings,
        changed: null
    };

}(window.lexi, window.chrome));