angular.module('TwineDoodlerApp', []);

var BASE_URL = "games.php"

//setup ajax
angular.module('TwineDoodlerApp').config(function(ajaxProvider) {
	ajaxProvider.setBaseURL("games.php");
	ajaxProvider.setHttpXHeader();
});

angular.module('TwineDoodlerApp').controller('mainCtrl', ['$scope', 'Wikifier', function($scope, Wikifier){
	$scope.tiddlers = [];

	$scope.readTiddler = function(){
		console.log($scope.tiddler);
		Wikifier.wikify(document.getElementById("troll"), $scope.tiddler);
	}
}]);


angular.module('TwineDoodlerApp').controller('selectorCtrl', ['$scope', 'ajax', function($scope, ajax){
	$scope.games = false;
	$scope.loading = false;

	$scope.getGamesList = function(){
		$scope.games = false;
		$scope.loading = true;
		ajax.post('?get=games', {})
			.then(function(response) {
				$scope.loading = false;
				$scope.games = response;
			}, function() {
				$scope.loading = false;
			});
	}

	$scope.getGame = function(){
		$scope.loading = true;
		ajax.post('?get=game', {game: $scope.game})
			.then(function(response) {
				$scope.loading = false;
				$scope.$parent.tiddlers = response;
				$scope.hidden = true;
				console.log(response);
			}, function() {
				$scope.loading = false;
			});
	}

	$scope.getGamesList();
}]);

// ajax service
angular.module('TwineDoodlerApp').provider('ajax', ['$httpProvider',function($httpProvider) {
	var baseUrl = '';
	this.setBaseURL = function(url){
		baseUrl = url;
	};
	this.setHttpXHeader = function(){
		$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
	}
	this.$get = ['$http', '$q', function($http, $q) {
		return {
			post: function(url, data) {
				var deferred = $q.defer();
				$http.post(baseUrl + url, data).success(function(data) {
					//catch ajax errors
					if (!data.errors) {
						deferred.resolve(data);
					} else deferred.reject(false);
				}).error(function() {
					deferred.reject(false);
				});
				return deferred.promise;
			},
			get: function(url, cache, resetTimer) {
				var deferred = $q.defer();
				$http.get(baseUrl + url).success(function(data) {
					//catch ajax errors
					if (!data.errors) {
						deferred.resolve(data);
					} else deferred.reject(false);
				}).error(function() {
					deferred.reject(false);
				});
				return deferred.promise;
			}
		};
	}];
}])

// wikifier service
angular.module('TwineDoodlerApp').factory('Wikifier', [function() {
	var
		_formatterCache, // the Wikifier formatter object cache
		_unicodeOk = /[\u0150\u0170]/g.test("\u0150"); // some versions of Safari do not handle Unicode properly

	var textPrimitives = {
		anyLetter: _unicodeOk ? "[A-Za-z0-9_\\-\u00c0-\u017e]" : "[A-Za-z0-9_\\-\u00c0-\u00ff]",
		url: "(?:file|https?|mailto|ftp|javascript|irc|news|data):[^\\s'\"]+(?:/|\\b)",
	}

	textPrimitives.inlineCSS = [
		"(?:(" + textPrimitives.anyLetter + "+)\\(([^\\)\\|\\n]+)\\):)", // [1,2]=style(value):
		"(?:(" + textPrimitives.anyLetter + "+):([^;\\|\\n]+);)",        // [3,4]=style:value;
		"(?:((?:\\." + textPrimitives.anyLetter + "+)+);)",              // [5]  =.className;
		"(?:((?:#" + textPrimitives.anyLetter + "+)+);)"                 // [6]  =#id;
	].join("|");

	var formatters = [
		{
			name    : "dollarSign",
			match   : "\\${2}",
		},

		{
			name    : "$variable",
			match   : "\\$\\w+(?:(?:\\.[A-Za-z_$]\\w*)|(?:\\[\\d+\\])|(?:\\[\"(?:\\\\.|[^\"\\\\])+\"\\])|(?:\\['(?:\\\\.|[^'\\\\])+'\\])|(?:\\[\\$\\w+\\]))*",
		},

		{
			name           : "table",
			match          : "^\\|(?:[^\\n]*)\\|(?:[fhck]?)$",
			lookahead      : "^\\|([^\\n]*)\\|([fhck]?)$",
			rowTerminator  : "\\|(?:[fhck]?)$\\n?",
			cellPattern    : "(?:\\|([^\\n\\|]*)\\|)|(\\|[fhck]?$\\n?)",
			cellTerminator : "(?:\\x20*)\\|",
			rowTypes       : { "c" : "caption", "h" : "thead", "" : "tbody", "f" : "tfoot" },
		},

		{
			name       : "heading",
			match      : "^!{1,6}",
			terminator : "\\n",
		},

		{
			name         : "list",
			match        : "^(?:(?:\\*+)|(?:#+))",
			lookahead    : "^(?:(\\*+)|(#+))",
			terminator   : "\\n",
			outerElement : "ul",
			itemElement  : "li",
		},

		{
			name       : "quoteByBlock",
			match      : "^<<<\\n",
			terminator : "^<<<\\n",
		},

		{
			name       : "quoteByLine",
			match      : "^>+",
			terminator : "\\n",
			element    : "blockquote",
		},

		{
			name    : "rule",
			match   : "^----+$\\n?|<hr ?/?>\\n?",
		},

		{
			name      : "monospacedByLine",
			match     : "^\\{\\{\\{\\n",
			lookahead : "^\\{\\{\\{\\n((?:^[^\\n]*\\n)+?)(^\\}\\}\\}$\\n?)",
		},

		{
			name    : "prettyLink",
			match   : "\\[\\[[^[]",
		},

		{
			name    : "urlLink",
			match   : textPrimitives.url,
		},

		{
			name    : "image",
			match   : "\\[[<>]?[Ii][Mm][Gg]\\[",
		},

		{
			name            : "macro",
			match           : "<<",
			lookaheadRegExp : /<<(\/?[A-Za-z][^>\s]*|[=-])(?:\s*)((?:(?:\"(?:\\.|[^\"\\])*\")|(?:\'(?:\\.|[^\'\\])*\')|(?:\[(?:[<>]?[Ii][Mm][Gg])?\[[^\r\n]*?\]\]+)|[^>]|(?:>(?!>)))*)>>/gm,
			argsPattern     : "(?:" + [
				'("(?:\\\\.|[^"\\\\])+")',                          // 1=double quoted
				"('(?:\\\\.|[^'\\\\])+')",                          // 2=single quoted
				"(\"\"|'')",                                        // 3=empty quotes
				"(\\[(?:[<>]?[Ii][Mm][Gg])?\\[[^\\r\\n]*?\\]\\]+)", // 4=double square-bracketed
				"([^\"'`\\s]\\S*)"                                  // 5=barewords
			].join("|") + ")",
			working : { name : "", handler : "", arguments : "", index : 0 }, // the working parse object
			context : null, // last execution context object (top-level macros, hierarchically, have a null context)
		},

		{
			name            : "html",
			match           : "<[Hh][Tt][Mm][Ll]>",
			lookaheadRegExp : /<[Hh][Tt][Mm][Ll]>((?:.|\n)*?)<\/[Hh][Tt][Mm][Ll]>/gm,
		},

		{
			name            : "commentByBlock",
			match           : "/(?:%|\\*)",
			lookaheadRegExp : /\/(%|\*)((?:.|\n)*?)\1\//gm,
		},

		{
			name            : "htmlCommentByBlock",
			match           : "<!--",
			lookaheadRegExp : /<!--((?:.|\\n)*?)-->/gm,
		},

		{
			name    : "formatByChar",
			match   : "''|//|__|\\^\\^|~~|==|\\{\\{\\{",
		},

		{
			name        : "customStyle",
			match       : "@@",
			terminator  : "@@",
			blockRegExp : /\s*\n/gm,
		},

		{
			name    : "emdash",
			match   : "--",
		},

		{
			name    : "lineContinuation",
			match   : "\\\\[\\s\\u00a0\\u2028\\u2029]*?(?:\\n|$)", // Unicode space-character escapes required for IE < 11 (maybe < 10?)
		},

		{
			name    : "lineBreak",
			match   : "\\n|<br ?/?>",
		},

		{
			name            : "rawText",
			match           : "\"{3}|<nowiki>",
			lookaheadRegExp : /(?:\"{3}|<nowiki>)((?:.|\n)*?)(?:\"{3}|<\/nowiki>)/gm,
		},

		{
			name    : "htmlCharacterReference",
			match   : "(?:(?:&#?[a-zA-Z0-9]{2,8};|.)(?:&#?(?:x0*(?:3[0-6][0-9a-fA-F]|1D[c-fC-F][0-9a-fA-F]|20[d-fD-F][0-9a-fA-F]|FE2[0-9a-fA-F])|0*(?:76[89]|7[7-9][0-9]|8[0-7][0-9]|761[6-9]|76[2-7][0-9]|84[0-3][0-9]|844[0-7]|6505[6-9]|6506[0-9]|6507[0-1]));)+|&#?[a-zA-Z0-9]{2,8};)",
		},

		{   // This formatter MUST come after any formatter which handles HTML tag-like constructs (e.g. html & rawText).
			name         : "htmlTag",
			match        : "<\\w+(?:\\s+[^\\u0000-\\u001F\\u007F-\\u009F\\s\"'>\\/=]+(?:\\s*=\\s*(?:\"[^\"]*?\"|'[^']*?'|[^\\s\"'=<>`]+))?)*\\s*\\/?>",
			tagPattern   : "<(\\w+)",
			voidElements : [ "area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param", "source", "track", "wbr" ],
			nobrElements : [ "colgroup", "datalist", "dl", "figure", "ol", "optgroup", "select", "table", "tbody", "tfoot", "thead", "tr", "ul" ],
		}
	];

	function insertText(place, text) {
		//return place.appendChild(document.createTextNode(text));
	}

	function compileFormatters() {
		var patterns   = [];
		for (var i = 0, iend = formatters.length; i < iend; ++i) {
			patterns.push("(" + formatters[i].match + ")");
		}
		_formatterCache = {
			"formatters"      : formatters,
			"formatterRegExp" : new RegExp(patterns.join("|"), "gm")
		};
		return _formatterCache;
	};

	var vm = {
		nextMatch: 0,
		source: '',
		output: '',
	};

	vm.outputText = function(place, startPos, endPos) {
		insertText(place, this.source.substring(startPos, endPos));
	};

	vm.subWikify = function (output, terminator, terminatorIgnoreCase) {
		// Temporarily replace the output buffer.
		var oldOutput = this.output;
			this.output = output;

		var	terminatorRegExp = terminator ? new RegExp("(?:" + terminator + ")", (terminatorIgnoreCase ? "gim" : "gm")) : null,
			terminatorMatch,
			formatterMatch;

			console.log(this);

		do {
			// Prepare the RegExp match positions.
			this.formatter.formatterRegExp.lastIndex = this.nextMatch;
			if (terminatorRegExp) {
				terminatorRegExp.lastIndex = this.nextMatch;
			}

			// Get the first matches.
			formatterMatch  = this.formatter.formatterRegExp.exec(this.source);
			terminatorMatch = terminatorRegExp ? terminatorRegExp.exec(this.source) : null;

			// Check for a terminator & formatter match.
			if (terminatorMatch && (!formatterMatch || terminatorMatch.index <= formatterMatch.index)) { // terminator match
				// Output any text before the match.
				if (terminatorMatch.index > this.nextMatch) {
					this.outputText(this.output, this.nextMatch, terminatorMatch.index);
				}

				// Set the match parameters.
				this.matchStart  = terminatorMatch.index;
				this.matchLength = terminatorMatch[0].length;
				this.matchText   = terminatorMatch[0];
				this.nextMatch   = terminatorRegExp.lastIndex;

				// Restore the output pointer and exit.
				this.output = oldOutput;
				return;
			} else if (formatterMatch) { // formatter match
				// Output any text before the match.
				if (formatterMatch.index > this.nextMatch) {
					this.outputText(this.output, this.nextMatch, formatterMatch.index);
				}

				// Set the match parameters.
				this.matchStart  = formatterMatch.index;
				this.matchLength = formatterMatch[0].length;
				this.matchText   = formatterMatch[0];
				this.nextMatch   = this.formatter.formatterRegExp.lastIndex;

				// Figure out which formatter matched.
				var matchingFormatter = -1;
				for (var i = 1; i < formatterMatch.length; ++i) {
					if (formatterMatch[i]) {
						matchingFormatter = i - 1;
						break; // stop once we've found the matching formatter
					}
				}

				// Call the formatter.
				if (matchingFormatter !== -1) {
					console.log(this.formatter.formatters[matchingFormatter].name);
					//this.formatter.formatters[matchingFormatter].handler(this);
					//if (runtime.temp.break != null) { break; } // lazy equality for null
				}
			}
		} while (terminatorMatch || formatterMatch);
		/*
			if (runtime.temp.break == null) { // lazy equality for null
				// Output any text after the last match.
				if (this.nextMatch < this.source.length) {
					this.outputText(this.output, this.nextMatch, this.source.length);
					this.nextMatch = this.source.length;
				}
			} else if (
				   this.output.lastChild
				&& this.output.lastChild.nodeType === Node.ELEMENT_NODE
				&& this.output.lastChild.nodeName.toUpperCase() === "BR"
			) {
				// In case of <<break>>/<<continue>>, remove the last <br>.
				removeElement(this.output.lastChild);
			}
		*/
		// Restore the output buffer.
		this.output = oldOutput;
	}

	vm.wikify = function(place, source) {
		this.source = source;
		this.nextMatch = 0;
		this.formatter = _formatterCache || compileFormatters();
		this.subWikify(this.output);
		this.output = place != null ? place : document.createDocumentFragment(); // lazy equality for null

		console.log(this.output);

		if (place == null && typeof this.output.remove === "function") { // lazy equality for null
			this.output.remove();
		}
	}

	return vm;
}]);


