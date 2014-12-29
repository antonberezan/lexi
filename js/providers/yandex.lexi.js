lexi('yandex', function () {

	'use strict';
	
	var url = 'http://slovari.yandex.ru/~p/{query}/en/';

	function getUrl(query) {
		return url.replace('{query}', encodeURIComponent(query));
	};

	function getText(element) {
	    if (element) {
			if (element.innerText) {
				return innerText;
			} else if (element.length) {
				return element[0].innerText;
			}
		}
	    return '';
	}

    function parse(content) {
		var doc = new DOMParser().parseFromString(content, 'text/html');
		var result = {
			word: '',
			trans: null, // null if each part has a certain transcription
			play: null, //function that returns a sound file
			parts: [ // parts of speech
				/*{
					name: 'noun',
					trans: '[trænˈskrɪpʃ(ə)n]',
					translations: [
						{
							words: [ "word1", "word2" ],
							examples: [ "example1" ]
						}
					]
				}*/
			],
            source: {
                name: 'Yandex.Slovari',
                url: 'http://slovari.yandex.ru/'
            }
		};

		result.word = getText($('.b-translation__title .b-translation__text', doc));
		result.trans = getText($('.b-translation__title .b-translation__tr', doc));

		result.source.url += encodeURIComponent(result.word);

		var parts = $('.b-translation__group', doc);


		$.each(parts, function(element) {
			var part = {
				name: getText($('.b-translation__group-title', element)),
				translations : []
			};

			if (!part.name) {
				return;
			}

			var trans = $('.b-translation__tr', element),
				entries = Array.prototype.slice.call($('.b-translation__entries .b-translation__entry', element), 0, 10);

			if (trans.length) {
				part.trans = getText(trans);
			}

			$.each(entries, function(entry) {
				var translation = {
					words: [],
					examples: []
				};

				var words = $('.b-translation__text, .b-translation__comment, .b-translation__abbr', $('.b-translation__translation-words', entry));
				var group = [],
					word = [],
					wordPart;

				translation.words.push(group);

				$.each(words, function(wordEl) {
					var text =  wordEl.innerText.trim(),
					 	groups = text.split(';');

					if (!text) {
						return;
					}

					if (wordEl.classList.contains('b-translation__comment') || wordEl.classList.contains('b-translation__abbr')) {
					    if (text.trim().indexOf(',') === 0) {
					        word = [];
					        wordPart = null;
					        return;
					    }
					    if (typeof wordPart === 'string') {
							word[word.length - 1] += text;
						} else {
							if (!wordPart) {
								group.push(word);
							}
							wordPart = text; // important for parser logic
							word.push(wordPart);
						}
					} else {
						$.each(groups, function(groupText, index) {
						    groupText = groupText.trim();
							var words = groupText.split(',')
								.map(function(w) {
									return w.trim();
								})
								.filter(function(w) {
									return w.length > 0;
								});
							
							if (groupText.indexOf(',') === 0) {
								word = [];
								wordPart = null;
							}
							$.each(words, function(wordText, wordIndex) {
								if (wordPart && wordPart.word) {
									wordPart.word += wordText;
								} else {
									if (!wordPart) {
										group.push(word);
									}
									wordPart = { word: wordText };
									word.push(wordPart);
								}
								if (wordIndex + 1 < words.length) {
									word = [];
									wordPart = null;
								}
							});
							if (index + 1 < groups.length) {
								group = [];
								word = [];
								wordPart = null;
								translation.words.push(group);
							}
							if (groupText.lastIndexOf(',') === groupText.length - 1) {
								word = [];
								wordPart = null;
							}
						});
					}
				});

				part.translations.push(translation);
			});

			result.parts.push(part);
		});

		return result;
	};

	function load(word) {
		return $.ajax({
	        type:'get',
	        url: getUrl(word)
	    }).then(function(response) {
	    	return parse(response);
	    });
	};

	return {
		get: function(word) {
			return load(word);
		}
	};
});