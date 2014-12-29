(function(chrome) {

    'use strict';

	var sendMessage = chrome.runtime.sendMessage;

	// helpers
	function isArray(value) {
        return Object.prototype.toString.apply(value) === '[object Array]';
    };

    function isClass(element, name) {
    	return element.classList.contains(name);
    }

    function isParent(child, parent){ 
	    while (child) {
	        if(child === parent) {
	        	return true;
	        } 
	        child = child.parentNode;
	    }
	    return false;
	}

	function getSelectedText() {
        var selection = window.getSelection(),
        	range;


    	if (selection.rangeCount) {
        	range = selection.getRangeAt(0);
            return {
            	text: selection.toString().trim(),
            	rect: range.getBoundingClientRect()
            };
        }
        return null;
    }
    
	function loadCss(url) {
	    var xhr = new XMLHttpRequest(),
            style = document.createElement('style');

	    xhr.open('get', url);

	    xhr.onload = function () {
	        if (this.status === 200) {
	            style.innerHTML = xhr.response;
	        }
	    };
	    xhr.send();
	    return style;
	};

	function initPopup(options) {
	    options = options || {
	        compact: false
	    };

	    var host = document.createElement('div'),
    		root = host.createShadowRoot(),
    	 	popup = document.createElement('div'),
    	 	title = document.createElement('h1'),
    		word = document.createElement('span'),
    		trans = document.createElement('span'),
    		parts = document.createElement('div'),
    		viewBtn = document.createElement('a'),
            source = document.createElement('a'),
    		loading = document.createElement('div');

		host.id = 'lexi-shadow-host';
		root.appendChild(loadCss(chrome.runtime.getURL('css/popup.css')));
    	root.appendChild(popup);
    	root.appendChild(loading);

    	popup.className = 'popup dark';
        title.className = 'title';
    	loading.className = 'loader';
    	word.className = 'word';
    	trans.className = 'transcription';
    	parts.className = 'parts';
    	source.className = 'source';
    	source.setAttribute('target', '_blank');

    	viewBtn.className = 'view-button';
    	viewBtn.href = '#';
    	viewBtn.innerHTML = chrome.i18n.getMessage('content_view_button_less');

    	title.appendChild(word);
    	title.appendChild(trans);
    	popup.appendChild(viewBtn);
    	popup.appendChild(title);
    	popup.appendChild(parts);
    	popup.appendChild(source);

	    popup.style.display = 'none';

    	document.body.appendChild(host);

    	function compact(value) {
	        if (value) {
	            viewBtn.innerHTML = chrome.i18n.getMessage('content_view_button_more');
	            popup.classList.add('compact');
	        } else {
	            viewBtn.innerHTML = chrome.i18n.getMessage('content_view_button_less');
	            popup.classList.remove('compact');
	        }
            options.onCompact && options.onCompact(value);
	    }

	    viewBtn.onclick = function () {
	        compact(!isClass(popup, 'compact'));
    		return false;
    	};

	    compact(options.compact);

    	return {
    		show: function (value, rect, isCompact) {

				function createPart(part) {
    				var group = document.createElement('div'),
    					title = document.createElement('h2'),
    					translations = document.createElement('ul'),
    					li, translation;

    				group.className = 'part';
    				translations.className = 'translations';

					title.className = 'part-title';
    				title.innerHTML = part.name.toLowerCase();

    				group.appendChild(title);
    				group.appendChild(translations);

    				for(var i = 0; i < Math.min(part.translations.length, 4); i++)
					{
						translation = part.translations[i];
						li = document.createElement('li');
						li.className = 'translation';
						li.innerHTML = translation.words.map(function(groups) {
						    var result = '';
						    if (isArray(groups)) {
						        result = groups.map(function (word) {
									if (isArray(word)) {
									    return '<span class="word">' + word.map(function(part) {
											if (typeof part === 'string') {
												return '<i class="comment">' + part + '</i>';
											}
											return part.word; 
										}).join(' ') + '</span>';
									} else {
									    return word; 
									}
								}).join('');
                            }
						    return result && '<span class="word-group">' + result + '</span>';
						}).join('');
						translations.appendChild(li);
					}

					return group;
    			};

		        compact(isCompact);

				word.innerHTML = value.word;
				trans.innerHTML = value.trans || '';
				parts.innerHTML = '';

				if (!value || !value.word) {
				    popup.classList.add('nothing');
				    parts.innerHTML = chrome.i18n.getMessage('content_nodefinition');
				} else {
				    popup.classList.remove('nothing');
				}

				source.innerHTML = chrome.i18n.getMessage('content_link', value.source.name);
		        source.setAttribute('href', value.source.url);

				for(var i = 0; i < value.parts.length; i++)
				{
					parts.appendChild(createPart(value.parts[i]));
				}

		        popup.style.display = 'inline';

                var bounds = popup.getBoundingClientRect(),
					margin = 10,
					x = window.scrollX + rect.left + rect.width / 2 - bounds.width / 2,
                    y = window.scrollY + rect.top - bounds.height - margin;

				if (y < window.scrollY) {
				    popup.classList.add('popup-bottom');
				    y = window.scrollY + rect.bottom + margin;
				} else {
				    popup.classList.add('popup-top');
				}

				popup.style.top = y + 'px';
				popup.style.left = x + 'px';

				popup.style.display = '';
				popup.classList.add('show');

		        this.loading(false);
		    }, 
    		hide: function() {
    		    popup.classList.remove('show', 'popup-top', 'popup-bottom');
    		},
    		loading: function (value, rect) {
    		    
    		    if (rect && value) {
    		        loading.style.display = 'inline';
    		        var bounds = loading.getBoundingClientRect(),
                        x = window.scrollX + rect.left + rect.width / 2 - bounds.width / 2,
		                y = window.scrollY + rect.top - bounds.height;

		            loading.style.top = y + 'px';
		            loading.style.left = x + 'px';
    		    }
    		    loading.style.display = '';
    		    loading.classList.toggle('show', value);
		    },
    		widget: function() {
    			return host;
    		}
    	};
    };

	var popup;

    function translate() {
        var selected = getSelectedText();

        if (selected && selected.text) {
            popup.loading(true, selected.rect);
            sendMessage({
                translate: selected.text,
                settings: true
            }, function (result) {
                popup.show(result.translate, selected.rect, result.settings.compact);
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function() {

	    sendMessage('settings', function (settings) {
	        popup = initPopup({
	            compact: settings.compact,
	            onCompact: function (compact) {
	                sendMessage({
	                    compact: compact
	                });
	            }
	        });
	    });

		/*document.body.addEventListener('dblclick', function(e) {
		    if (!e.ctrlKey || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || isParent(e.target, popup.widget())) {
				return;
			}
		    translate();
		});*/

		document.body.addEventListener('mouseup', function (e) {
		    if (!e.ctrlKey || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || isParent(e.target, popup.widget())) {
		        return;
		    }
		    translate();
		});
	});
    
    document.addEventListener('click', function(e) {
		if (isParent(e.target, popup.widget())) {
			return;
		}
		popup.hide();
    });

    
}(window.chrome))