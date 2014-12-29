(function($, lexi, chrome) {

    'use strict';
    
    var provider = lexi('yandex');

    var messages = {
        translate: function(value) {
            return provider.get(value).catch(function (error) {
                console.log(error);
            });
        },
        settings: function() {
            return lexi.settings.get();
        }
    }

    function onMessage(message, sender, callback) {
        switch (message) {
            case 'settings':
                lexi.settings.get(callback);
                return true;
        }

        if (message.compact !== undefined) {
            return lexi.settings.set({ compact: message.compact });
        }

        var promises = $.map(message, function(name, value) {
            return messages[name](value);
        });

        Q.all(promises).done(function (result) {
            var response = {};
            $.each(Object.keys(message), function (value, index) {
                response[value] = result[index];
            });
            callback(response);
        });
        return true;
    };

    chrome.runtime.onMessage.addListener( onMessage );
    
}(window.$, window.lexi, window.chrome));

