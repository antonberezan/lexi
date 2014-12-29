(function() {

	'use strict';

	// interface
/*	var result = {
		word: 'transcription',
		trans: '[trænˈskrɪpʃ(ə)n]', // null if each part has a certain transcription
		play: null, //function that returns a sound file
		parts: [ // parts of speech
			{
				name: 'noun',
				trans: '[trænˈskrɪpʃ(ə)n]',
				translations: [
					{
						words: [ 
							{ comment: '(comment)' },
							'транскрипция' 
						],
						examples: [ "example1" ]
					}
				]
			}
		]
	};*/

	var dictionaries = {};

	window.lexi = function(name, ctor) {
		if (arguments.length === 2) {
			dictionaries[name] = {
				ctor: ctor
			};
		} else if (arguments.length === 1) {
			var dictionary = dictionaries[name];
			if (!dictionary) {
				return null;
			}
			if (!dictionary.instance) {
				dictionary.instance = dictionary.ctor();
			}
			return dictionary.instance;
		} else if (!arguments.length) {
			// todo
		}
	};

}());