(function() {

    'use strict';

    var $ = function(selector, context) {
		if (!context) {
			context = window.document;
		}
		if (context.length) {
			context = context[0];
		}
		if (context.querySelectorAll) {
			return context.querySelectorAll(selector);
		}
    };

    var isIterable = function(array) {
        if (!array || !array.length) {
            return false;
        }
        if ($.isArray(array) || $.isString(array)) {
            return true;
        }
        if (array.nodeType === 1) {
            return true;
        }
        if (array.hasOwnProperty && array.hasOwnProperty('0')) {
            return true;
        }
    };

    // checks whether a variable is a function
    $.isFunction = function(value) {
        return Object.prototype.toString.apply(value) === '[object Function]';
    };

    // checks whether a variable is an array
    $.isArray = function(value) {
        return Object.prototype.toString.apply(value) === '[object Array]';
    };

    // checks whether a variable is a string
    $.isString = function(value) {
        return Object.prototype.toString.apply(value) === '[object String]';
    };

    // extends the specified object by following argument objects
    $.extend = function (target/* [,object1] [,objectN] */) {
        target = (typeof target === 'object' && target) || {};
        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];
            if (obj && typeof obj === 'object') {
                for (var name in obj) {
                    if (obj.hasOwnProperty(name)) {
                        if (typeof obj[name] === 'object') {
                            target[name] = (typeof obj[name] === 'object' && target[name]) || {};
                            $.extend(target[name], obj[name]);
                        } else {
                            target[name] = obj[name];
                        }
                    }
                }
            }
        }
        return target;
    };

    $.each = function (source, callback, context) {
        if (isIterable(source)) {
            Array.prototype.forEach.call(source, callback, context);
        } else {
            for (var name in source) {
                if (source.hasOwnProperty(name)) {
                    callback.call(context, name, source[name]);
                }
            }
        }
    };

    $.map = function (source, callback, context) {
        if (isIterable(source)) {
            return Array.prototype.map.call(source, callback, context);
        } else {
            var map = [];
            for (var name in source) {
                if (source.hasOwnProperty(name)) {
                    var item = callback.call(context, name, source[name]);
                    if (item !== undefined) {
                        map.push(item);
                    }
                }
            }
            return map;
        }
    };

	$.ajax = function(options) {
		options = $.extend({}, {
			type: 'get',
			url: '',
			async: true,
			success: null,
			error: null,
			complete: null,
			responseType: null
		}, options);
		
		if (options.url) {

			var req = new XMLHttpRequest(),
				deferred = Q.defer();

			req.responseType = options.responseType;

			var success = function() {
				if ($.isFunction(options.success)) {
					options.success.call(req, req.response);
				}
				if ($.isFunction(options.complete)) {
					options.complete.apply(req, arguments);
				}
				deferred.resolve(req.response);
			}

			var error = function() {
				if ($.isFunction(options.error)) {
					options.error.call(req, req.response);
				}
				deferred.reject(req.status);
			}

			req.addEventListener("load", success, false);
			req.addEventListener("error", error, false);

			req.open(options.type, options.url, options.async);
			req.send();

			return deferred.promise;
		}
	};

	window.$ = $;

}());