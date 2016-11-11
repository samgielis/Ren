(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var tf_idf_search_index_1 = require("./search-index/tf-idf-search-index");
var prefix_index_strategy_1 = require("./index-strategy/prefix-index-strategy");
var lower_case_sanitizer_1 = require("./sanitizer/lower-case-sanitizer");
var simple_tokenizer_1 = require("./tokenizer/simple-tokenizer");
/**
 * Simple client-side searching within a set of documents.
 *
 * <p>Documents can be searched by any number of fields. Indexing and search strategies are highly customizable.
 */
var Search = (function () {
    /**
     * Constructor.
     * @param uidFieldName Field containing values that uniquely identify search documents; this field's values are used
     *                     to ensure that a search result set does not contain duplicate objects.
     */
    function Search(uidFieldName) {
        this.uidFieldName_ = uidFieldName;
        // Set default/recommended strategies
        this.indexStrategy_ = new prefix_index_strategy_1.PrefixIndexStrategy();
        this.searchIndex_ = new tf_idf_search_index_1.TfIdfSearchIndex(uidFieldName);
        this.sanitizer_ = new lower_case_sanitizer_1.LowerCaseSanitizer();
        this.tokenizer_ = new simple_tokenizer_1.SimpleTokenizer();
        this.documents_ = [];
        this.searchableFields = [];
    }
    Object.defineProperty(Search.prototype, "indexStrategy", {
        get: function () {
            return this.indexStrategy_;
        },
        /**
         * Override the default index strategy.
         * @param value Custom index strategy
         * @throws Error if documents have already been indexed by this search instance
         */
        set: function (value) {
            if (this.initialized_) {
                throw Error('IIndexStrategy cannot be set after initialization');
            }
            this.indexStrategy_ = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Search.prototype, "sanitizer", {
        get: function () {
            return this.sanitizer_;
        },
        /**
         * Override the default text sanitizing strategy.
         * @param value Custom text sanitizing strategy
         * @throws Error if documents have already been indexed by this search instance
         */
        set: function (value) {
            if (this.initialized_) {
                throw Error('ISanitizer cannot be set after initialization');
            }
            this.sanitizer_ = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Search.prototype, "searchIndex", {
        get: function () {
            return this.searchIndex_;
        },
        /**
         * Override the default search index strategy.
         * @param value Custom search index strategy
         * @throws Error if documents have already been indexed
         */
        set: function (value) {
            if (this.initialized_) {
                throw Error('ISearchIndex cannot be set after initialization');
            }
            this.searchIndex_ = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Search.prototype, "tokenizer", {
        get: function () {
            return this.tokenizer_;
        },
        /**
         * Override the default text tokenizing strategy.
         * @param value Custom text tokenizing strategy
         * @throws Error if documents have already been indexed by this search instance
         */
        set: function (value) {
            if (this.initialized_) {
                throw Error('ITokenizer cannot be set after initialization');
            }
            this.tokenizer_ = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add a searchable document to the index. Document will automatically be indexed for search.
     * @param document
     */
    Search.prototype.addDocument = function (document) {
        this.addDocuments([document]);
    };
    /**
     * Adds searchable documents to the index. Documents will automatically be indexed for search.
     * @param document
     */
    Search.prototype.addDocuments = function (documents) {
        this.documents_ = this.documents_.concat(documents);
        this.indexDocuments_(documents, this.searchableFields);
    };
    /**
     * Add a new searchable field to the index. Existing documents will automatically be indexed using this new field.
     *
     * @param field Searchable field or field path. Pass a string to index a top-level field and an array of strings for nested fields.
     */
    Search.prototype.addIndex = function (field) {
        this.searchableFields.push(field);
        this.indexDocuments_(this.documents_, [field]);
    };
    /**
     * Search all documents for ones matching the specified query text.
     * @param query
     * @returns {Array<Object>}
     */
    Search.prototype.search = function (query) {
        var tokens = this.tokenizer_.tokenize(this.sanitizer_.sanitize(query));
        return this.searchIndex_.search(tokens, this.documents_);
    };
    /**
     * @param documents
     * @param searchableFields Array containing property names and paths (lists of property names) to nested values
     * @private
     */
    Search.prototype.indexDocuments_ = function (documents, searchableFields) {
        this.initialized_ = true;
        for (var di = 0, numDocuments = documents.length; di < numDocuments; di++) {
            var document = documents[di];
            var uid = document[this.uidFieldName_];
            for (var sfi = 0, numSearchableFields = searchableFields.length; sfi < numSearchableFields; sfi++) {
                var fieldValue;
                var searchableField = searchableFields[sfi];
                if (searchableField instanceof Array) {
                    fieldValue = Search.getNestedFieldValue(document, searchableField);
                }
                else {
                    fieldValue = document[searchableField];
                }
                if (fieldValue != null &&
                    typeof fieldValue !== 'string' &&
                    fieldValue.toString) {
                    fieldValue = fieldValue.toString();
                }
                if (typeof fieldValue === 'string') {
                    var fieldTokens = this.tokenizer_.tokenize(this.sanitizer_.sanitize(fieldValue));
                    for (var fti = 0, numFieldValues = fieldTokens.length; fti < numFieldValues; fti++) {
                        var fieldToken = fieldTokens[fti];
                        var expandedTokens = this.indexStrategy_.expandToken(fieldToken);
                        for (var eti = 0, nummExpandedTokens = expandedTokens.length; eti < nummExpandedTokens; eti++) {
                            var expandedToken = expandedTokens[eti];
                            this.searchIndex_.indexDocument(expandedToken, uid, document);
                        }
                    }
                }
            }
        }
    };
    /**
     * Find and return a nested object value.
     *
     * @param object to crawl
     * @param path Property path
     * @returns {any}
     */
    Search.getNestedFieldValue = function (object, path) {
        path = path || [];
        object = object || {};
        var value = object;
        // walk down the property path
        for (var i = 0; i < path.length; i++) {
            value = value[path[i]];
            if (value == null) {
                return null;
            }
        }
        return value;
    };
    return Search;
}());
exports.Search = Search;
},{"./index-strategy/prefix-index-strategy":2,"./sanitizer/lower-case-sanitizer":3,"./search-index/tf-idf-search-index":4,"./tokenizer/simple-tokenizer":5}],2:[function(require,module,exports){
"use strict";
/**
 * Indexes for prefix searches (e.g. the term "cat" is indexed as "c", "ca", and "cat" allowing prefix search lookups).
 */
var PrefixIndexStrategy = (function () {
    function PrefixIndexStrategy() {
    }
    /**
     * @inheritDocs
     */
    PrefixIndexStrategy.prototype.expandToken = function (token) {
        var expandedTokens = [];
        for (var i = 0, length = token.length; i < length; ++i) {
            expandedTokens.push(token.substring(0, i + 1));
        }
        return expandedTokens;
    };
    return PrefixIndexStrategy;
}());
exports.PrefixIndexStrategy = PrefixIndexStrategy;
},{}],3:[function(require,module,exports){
"use strict";
/**
 * Sanitizes text by converting to a locale-friendly lower-case version and triming leading and trailing whitespace.
 */
var LowerCaseSanitizer = (function () {
    function LowerCaseSanitizer() {
    }
    /**
     * @inheritDocs
     */
    LowerCaseSanitizer.prototype.sanitize = function (text) {
        return text ? text.toLocaleLowerCase().trim() : '';
    };
    return LowerCaseSanitizer;
}());
exports.LowerCaseSanitizer = LowerCaseSanitizer;
},{}],4:[function(require,module,exports){
"use strict";
/**
 * Search index capable of returning results matching a set of tokens and ranked according to TF-IDF.
 */
var TfIdfSearchIndex = (function () {
    function TfIdfSearchIndex(uidFieldName) {
        this.uidFieldName_ = uidFieldName;
        this.tokenToIdfCache_ = {};
        this.tokenMap_ = {};
    }
    /**
     * @inheritDocs
     */
    TfIdfSearchIndex.prototype.indexDocument = function (token, uid, document) {
        this.tokenToIdfCache_ = {}; // New index invalidates previous IDF caches
        if (typeof this.tokenMap_[token] !== 'object') {
            this.tokenMap_[token] = {
                $numDocumentOccurrences: 0,
                $totalNumOccurrences: 1,
                $uidMap: {},
            };
        }
        else {
            this.tokenMap_[token].$totalNumOccurrences++;
        }
        if (!this.tokenMap_[token].$uidMap[uid]) {
            this.tokenMap_[token].$numDocumentOccurrences++;
            this.tokenMap_[token].$uidMap[uid] = {
                $document: document,
                $numTokenOccurrences: 1
            };
        }
        else {
            this.tokenMap_[token].$uidMap[uid].$numTokenOccurrences++;
        }
    };
    /**
     * @inheritDocs
     */
    TfIdfSearchIndex.prototype.search = function (tokens, corpus) {
        var uidToDocumentMap = {};
        for (var i = 0, numTokens = tokens.length; i < numTokens; i++) {
            var token = tokens[i];
            var tokenMetadata = this.tokenMap_[token];
            // Short circuit if no matches were found for any given token.
            if (!tokenMetadata) {
                return [];
            }
            if (i === 0) {
                for (var uid in tokenMetadata.$uidMap) {
                    uidToDocumentMap[uid] = tokenMetadata.$uidMap[uid].$document;
                }
            }
            else {
                for (var uid in uidToDocumentMap) {
                    if (!tokenMetadata.$uidMap[uid]) {
                        delete uidToDocumentMap[uid];
                    }
                }
            }
        }
        var documents = [];
        for (var uid in uidToDocumentMap) {
            documents.push(uidToDocumentMap[uid]);
        }
        // Return documents sorted by TF-IDF
        return documents.sort(function (documentA, documentB) {
            return this.calculateTfIdf_(tokens, documentB, corpus) -
                this.calculateTfIdf_(tokens, documentA, corpus);
        }.bind(this));
    };
    /**
     * Calculate the inverse document frequency of a search token. This calculation diminishes the weight of tokens that
     * occur very frequently in the set of searchable documents and increases the weight of terms that occur rarely.
     */
    TfIdfSearchIndex.prototype.calculateIdf_ = function (token, documents) {
        if (!this.tokenToIdfCache_[token]) {
            var numDocumentsWithToken = this.tokenMap_[token] && this.tokenMap_[token].$numDocumentOccurrences || 0;
            this.tokenToIdfCache_[token] = 1 + Math.log(documents.length / (1 + numDocumentsWithToken));
        }
        return this.tokenToIdfCache_[token];
    };
    /**
     * Calculate the term frequency–inverse document frequency (TF-IDF) ranking for a set of search tokens and a
     * document. The TF-IDF is a numeric statistic intended to reflect how important a word (or words) are to a document
     * in a corpus. The TF-IDF value increases proportionally to the number of times a word appears in the document but
     * is offset by the frequency of the word in the corpus. This helps to adjust for the fact that some words appear
     * more frequently in general (e.g. a, and, the).
     */
    TfIdfSearchIndex.prototype.calculateTfIdf_ = function (tokens, document, documents) {
        var score = 0;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
            var token = tokens[i];
            var inverseDocumentFrequency = this.calculateIdf_(token, documents);
            if (inverseDocumentFrequency === Infinity) {
                inverseDocumentFrequency = 0;
            }
            var uid = document && document[this.uidFieldName_];
            var termFrequency = this.tokenMap_[token] &&
                this.tokenMap_[token].$uidMap[uid] &&
                this.tokenMap_[token].$uidMap[uid].$numTokenOccurrences || 0;
            score += termFrequency * inverseDocumentFrequency;
        }
        return score;
    };
    return TfIdfSearchIndex;
}());
exports.TfIdfSearchIndex = TfIdfSearchIndex;
;
;
;
;
},{}],5:[function(require,module,exports){
"use strict";
/**
 * Simple tokenizer that splits strings on whitespace characters and returns an array of all non-empty substrings.
 */
var SimpleTokenizer = (function () {
    function SimpleTokenizer() {
    }
    /**
     * @inheritDocs
     */
    SimpleTokenizer.prototype.tokenize = function (text) {
        return text.split(/[^a-zA-Z0-9\-']+/)
            .filter(function (text) {
            return !!text; // Filter empty tokens
        });
    };
    return SimpleTokenizer;
}());
exports.SimpleTokenizer = SimpleTokenizer;
},{}],6:[function(require,module,exports){
"use strict";
var LogoSearchFactory_1 = require("./LogoSearchFactory");
var JSONUtils_1 = require("../util/JSONUtils");
var Search_1 = require("./JsSearch/Search");
var LogoSearch = (function () {
    function LogoSearch(element) {
        this._dataSet = [];
        this._element = element;
        this._dataURI = element.getAttribute('logosearch-data');
        this._search = new Search_1.Search('name');
        this._search.addIndex('name');
        this.load();
    }
    LogoSearch.prototype.attachInput = function (input) {
        var _this = this;
        this._input = input;
        this._input.addEventListener('input', function () {
            console.log('input changed to', _this._input.value);
            console.log('result : ', _this._search.search(_this._input.value));
            var queryResult = _this._search.search(_this._input.value);
            if (queryResult.length === 0) {
                for (var _i = 0, _a = _this._dataSet; _i < _a.length; _i++) {
                    var dataPoint = _a[_i];
                    dataPoint.dom.className = 'logosearch-datapoint col-sm-2';
                }
            }
            else {
                for (var _b = 0, _c = _this._dataSet; _b < _c.length; _b++) {
                    var dataPoint = _c[_b];
                    if (queryResult.indexOf(dataPoint) < 0) {
                        dataPoint.dom.className = 'logosearch-datapoint logosearch-datapoint-hidden col-sm-2';
                    }
                    else {
                        dataPoint.dom.className = 'logosearch-datapoint col-sm-2';
                    }
                }
            }
        });
    };
    LogoSearch.prototype.load = function () {
        var _this = this;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", this._dataURI, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var dataSet = JSONUtils_1.parseJSON(xhr.responseText);
                if (dataSet.entries) {
                    _this.loadDataSet(dataSet);
                }
            }
        };
        xhr.send(null);
    };
    LogoSearch.prototype.loadDataSet = function (dataSet) {
        for (var _i = 0, _a = dataSet.entries; _i < _a.length; _i++) {
            var dataPoint = _a[_i];
            dataPoint.dom = LogoSearchFactory_1.LogoSearchFactory.buildDataPointview(dataPoint);
            this._dataSet.push(dataPoint);
        }
        this._dataSet.sort(function (dataPoint1, dataPoint2) {
            if (dataPoint1.name.toLowerCase() < dataPoint2.name.toLowerCase()) {
                return -1;
            }
            if (dataPoint1.name.toLowerCase() > dataPoint2.name.toLowerCase()) {
                return 1;
            }
            return 0;
        });
        this._search.addDocuments(this._dataSet);
        var searchBar = LogoSearchFactory_1.LogoSearchFactory.buildSearchBar();
        this.attachInput(searchBar.querySelector('input'));
        this._element.appendChild(searchBar);
        for (var _b = 0, _c = this._dataSet; _b < _c.length; _b++) {
            var dataPoint = _c[_b];
            this._element.appendChild(dataPoint.dom);
        }
    };
    LogoSearch.autoDetect = function () {
        var detectedElements = document.querySelectorAll('.logosearch');
        for (var i = 0; i < detectedElements.length; i++) {
            if (detectedElements.item(i).getAttribute('logosearch-data')) {
                new LogoSearch((detectedElements.item(i)));
            }
        }
    };
    return LogoSearch;
}());
exports.LogoSearch = LogoSearch;
(function () { LogoSearch.autoDetect(); })();
},{"../util/JSONUtils":8,"./JsSearch/Search":1,"./LogoSearchFactory":7}],7:[function(require,module,exports){
"use strict";
var LogoSearchFactory = (function () {
    function LogoSearchFactory() {
    }
    LogoSearchFactory.buildDataPointview = function (dataPoint) {
        var root = div('logosearch-datapoint col-sm-2');
        var logoContainer = div('logosearch-logo-container');
        var logoImg = img('logosearch-logo', dataPoint.img);
        var nameLabel = p('logosearch-name', dataPoint.name);
        logoContainer.appendChild(logoImg);
        root.appendChild(logoContainer);
        root.appendChild(nameLabel);
        return root;
    };
    LogoSearchFactory.buildSearchBar = function () {
        var form = div('logosearch-searchbar form-group');
        var inputContainer = div('logosearch-input-container col-sm-12');
        var inputGroup = div('input-group');
        var searchIcon = span('logosearch-searchicon input-group-addon fa fa-search');
        var inputEL = input('logosearch-input form-control', 'text');
        inputGroup.appendChild(searchIcon);
        inputGroup.appendChild(inputEL);
        inputContainer.appendChild(inputGroup);
        form.appendChild(inputContainer);
        return form;
    };
    return LogoSearchFactory;
}());
exports.LogoSearchFactory = LogoSearchFactory;
function div(className) {
    var div = document.createElement('div');
    div.className = className;
    return div;
}
function span(className, innerText) {
    var span = document.createElement('span');
    span.className = className;
    if (innerText) {
        span.innerText = innerText;
    }
    return span;
}
function input(className, type) {
    var input = document.createElement('input');
    input.className = className;
    input.type = type;
    return input;
}
function img(className, src) {
    var img = document.createElement('img');
    img.className = className;
    img.src = src;
    return img;
}
function p(className, innerText) {
    var p = document.createElement('p');
    p.className = className;
    p.innerText = innerText;
    return p;
}
},{}],8:[function(require,module,exports){
"use strict";
function parseJSON(json) {
    try {
        var parsedObject = JSON.parse(json);
        return parsedObject;
    }
    catch (e) {
        return undefined;
    }
}
exports.parseJSON = parseJSON;
},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbG9nb3NlYXJjaC9Kc1NlYXJjaC9TZWFyY2gudHMiLCJzcmMvbG9nb3NlYXJjaC9Kc1NlYXJjaC9pbmRleC1zdHJhdGVneS9wcmVmaXgtaW5kZXgtc3RyYXRlZ3kudHMiLCJzcmMvbG9nb3NlYXJjaC9Kc1NlYXJjaC9zYW5pdGl6ZXIvbG93ZXItY2FzZS1zYW5pdGl6ZXIudHMiLCJzcmMvbG9nb3NlYXJjaC9Kc1NlYXJjaC9zZWFyY2gtaW5kZXgvdGYtaWRmLXNlYXJjaC1pbmRleC50cyIsInNyYy9sb2dvc2VhcmNoL0pzU2VhcmNoL3Rva2VuaXplci9zaW1wbGUtdG9rZW5pemVyLnRzIiwic3JjL2xvZ29zZWFyY2gvTG9nb1NlYXJjaC50cyIsInNyYy9sb2dvc2VhcmNoL0xvZ29TZWFyY2hGYWN0b3J5LnRzIiwic3JjL3V0aWwvSlNPTlV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0lBLG9DQUErQixvQ0FBb0MsQ0FBQyxDQUFBO0FBQ3BFLHNDQUFrQyx3Q0FBd0MsQ0FBQyxDQUFBO0FBQzNFLHFDQUFpQyxrQ0FBa0MsQ0FBQyxDQUFBO0FBQ3BFLGlDQUE4Qiw4QkFBOEIsQ0FBQyxDQUFBO0FBQzdEOzs7O0dBSUc7QUFDSDtJQWdCSTs7OztPQUlHO0lBQ0gsZ0JBQVksWUFBbUI7UUFDM0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7UUFFbEMscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSwyQ0FBbUIsRUFBRSxDQUFDO1FBQ2hELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxzQ0FBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUkseUNBQWtCLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksa0NBQWUsRUFBRSxDQUFDO1FBRXhDLElBQUksQ0FB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QyxHQUFHLENBQUMsQ0FBQztJQUMzRCxDQUFDLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUN4QixDQUFDLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUN4QixNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2IsQ0FBQzs7O0FDMUVELG1CQUEyQixJQUFhO0lBQ3BDLElBQUksQ0FBQztRQUNELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUN4QixDQUFFO0lBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNULE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztBQUNMLENBQUM7QUFQZSxpQkFBUyxZQU94QixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7SUluZGV4U3RyYXRlZ3l9IGZyb20gXCIuL2luZGV4LXN0cmF0ZWd5L2luZGV4LXN0cmF0ZWd5XCI7XG5pbXBvcnQge0lTYW5pdGl6ZXJ9IGZyb20gXCIuL3Nhbml0aXplci9zYW5pdGl6ZXJcIjtcbmltcG9ydCB7SVNlYXJjaEluZGV4fSBmcm9tIFwiLi9zZWFyY2gtaW5kZXgvc2VhcmNoLWluZGV4XCI7XG5pbXBvcnQge0lUb2tlbml6ZXJ9IGZyb20gXCIuL3Rva2VuaXplci90b2tlbml6ZXJcIjtcbmltcG9ydCB7VGZJZGZTZWFyY2hJbmRleH0gZnJvbSBcIi4vc2VhcmNoLWluZGV4L3RmLWlkZi1zZWFyY2gtaW5kZXhcIjtcbmltcG9ydCB7UHJlZml4SW5kZXhTdHJhdGVneX0gZnJvbSBcIi4vaW5kZXgtc3RyYXRlZ3kvcHJlZml4LWluZGV4LXN0cmF0ZWd5XCI7XG5pbXBvcnQge0xvd2VyQ2FzZVNhbml0aXplcn0gZnJvbSBcIi4vc2FuaXRpemVyL2xvd2VyLWNhc2Utc2FuaXRpemVyXCI7XG5pbXBvcnQge1NpbXBsZVRva2VuaXplcn0gZnJvbSBcIi4vdG9rZW5pemVyL3NpbXBsZS10b2tlbml6ZXJcIjtcbi8qKlxuICogU2ltcGxlIGNsaWVudC1zaWRlIHNlYXJjaGluZyB3aXRoaW4gYSBzZXQgb2YgZG9jdW1lbnRzLlxuICpcbiAqIDxwPkRvY3VtZW50cyBjYW4gYmUgc2VhcmNoZWQgYnkgYW55IG51bWJlciBvZiBmaWVsZHMuIEluZGV4aW5nIGFuZCBzZWFyY2ggc3RyYXRlZ2llcyBhcmUgaGlnaGx5IGN1c3RvbWl6YWJsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFNlYXJjaCB7XG5cbiAgICBwcml2YXRlIGRvY3VtZW50c186QXJyYXk8T2JqZWN0PjtcbiAgICBwcml2YXRlIGluZGV4U3RyYXRlZ3lfOklJbmRleFN0cmF0ZWd5O1xuICAgIHByaXZhdGUgaW5pdGlhbGl6ZWRfOmJvb2xlYW47XG4gICAgcHJpdmF0ZSBzYW5pdGl6ZXJfOklTYW5pdGl6ZXI7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBjb250YWluaW5nIGVpdGhlciBhIHByb3BlcnR5IG5hbWUgb3IgYSBwYXRoIChsaXN0IG9mIHByb3BlcnR5IG5hbWVzKSB0byBhIG5lc3RlZCB2YWx1ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc2VhcmNoYWJsZUZpZWxkczpBcnJheTxzdHJpbmd8QXJyYXk8c3RyaW5nPj47XG5cbiAgICBwcml2YXRlIHNlYXJjaEluZGV4XzpJU2VhcmNoSW5kZXg7XG4gICAgcHJpdmF0ZSB0b2tlbml6ZXJfOklUb2tlbml6ZXI7XG4gICAgcHJpdmF0ZSB1aWRGaWVsZE5hbWVfOnN0cmluZztcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yLlxuICAgICAqIEBwYXJhbSB1aWRGaWVsZE5hbWUgRmllbGQgY29udGFpbmluZyB2YWx1ZXMgdGhhdCB1bmlxdWVseSBpZGVudGlmeSBzZWFyY2ggZG9jdW1lbnRzOyB0aGlzIGZpZWxkJ3MgdmFsdWVzIGFyZSB1c2VkXG4gICAgICogICAgICAgICAgICAgICAgICAgICB0byBlbnN1cmUgdGhhdCBhIHNlYXJjaCByZXN1bHQgc2V0IGRvZXMgbm90IGNvbnRhaW4gZHVwbGljYXRlIG9iamVjdHMuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodWlkRmllbGROYW1lOnN0cmluZykge1xuICAgICAgICB0aGlzLnVpZEZpZWxkTmFtZV8gPSB1aWRGaWVsZE5hbWU7XG5cbiAgICAgICAgLy8gU2V0IGRlZmF1bHQvcmVjb21tZW5kZWQgc3RyYXRlZ2llc1xuICAgICAgICB0aGlzLmluZGV4U3RyYXRlZ3lfID0gbmV3IFByZWZpeEluZGV4U3RyYXRlZ3koKTtcbiAgICAgICAgdGhpcy5zZWFyY2hJbmRleF8gPSBuZXcgVGZJZGZTZWFyY2hJbmRleCh1aWRGaWVsZE5hbWUpO1xuICAgICAgICB0aGlzLnNhbml0aXplcl8gPSBuZXcgTG93ZXJDYXNlU2FuaXRpemVyKCk7XG4gICAgICAgIHRoaXMudG9rZW5pemVyXyA9IG5ldyBTaW1wbGVUb2tlbml6ZXIoKTtcblxuICAgICAgICB0aGlzLmRvY3VtZW50c18gPSBbXTtcbiAgICAgICAgdGhpcy5zZWFyY2hhYmxlRmllbGRzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdGhlIGRlZmF1bHQgaW5kZXggc3RyYXRlZ3kuXG4gICAgICogQHBhcmFtIHZhbHVlIEN1c3RvbSBpbmRleCBzdHJhdGVneVxuICAgICAqIEB0aHJvd3MgRXJyb3IgaWYgZG9jdW1lbnRzIGhhdmUgYWxyZWFkeSBiZWVuIGluZGV4ZWQgYnkgdGhpcyBzZWFyY2ggaW5zdGFuY2VcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IGluZGV4U3RyYXRlZ3kodmFsdWU6SUluZGV4U3RyYXRlZ3kpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWRfKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignSUluZGV4U3RyYXRlZ3kgY2Fubm90IGJlIHNldCBhZnRlciBpbml0aWFsaXphdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbmRleFN0cmF0ZWd5XyA9IHZhbHVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaW5kZXhTdHJhdGVneSgpOklJbmRleFN0cmF0ZWd5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXhTdHJhdGVneV87XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdGhlIGRlZmF1bHQgdGV4dCBzYW5pdGl6aW5nIHN0cmF0ZWd5LlxuICAgICAqIEBwYXJhbSB2YWx1ZSBDdXN0b20gdGV4dCBzYW5pdGl6aW5nIHN0cmF0ZWd5XG4gICAgICogQHRocm93cyBFcnJvciBpZiBkb2N1bWVudHMgaGF2ZSBhbHJlYWR5IGJlZW4gaW5kZXhlZCBieSB0aGlzIHNlYXJjaCBpbnN0YW5jZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXQgc2FuaXRpemVyKHZhbHVlOklTYW5pdGl6ZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWRfKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignSVNhbml0aXplciBjYW5ub3QgYmUgc2V0IGFmdGVyIGluaXRpYWxpemF0aW9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNhbml0aXplcl8gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHNhbml0aXplcigpOklTYW5pdGl6ZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZXJfO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoZSBkZWZhdWx0IHNlYXJjaCBpbmRleCBzdHJhdGVneS5cbiAgICAgKiBAcGFyYW0gdmFsdWUgQ3VzdG9tIHNlYXJjaCBpbmRleCBzdHJhdGVneVxuICAgICAqIEB0aHJvd3MgRXJyb3IgaWYgZG9jdW1lbnRzIGhhdmUgYWxyZWFkeSBiZWVuIGluZGV4ZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHNlYXJjaEluZGV4KHZhbHVlOklTZWFyY2hJbmRleCkge1xuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZF8pIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdJU2VhcmNoSW5kZXggY2Fubm90IGJlIHNldCBhZnRlciBpbml0aWFsaXphdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZWFyY2hJbmRleF8gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHNlYXJjaEluZGV4KCk6SVNlYXJjaEluZGV4IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoSW5kZXhfO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoZSBkZWZhdWx0IHRleHQgdG9rZW5pemluZyBzdHJhdGVneS5cbiAgICAgKiBAcGFyYW0gdmFsdWUgQ3VzdG9tIHRleHQgdG9rZW5pemluZyBzdHJhdGVneVxuICAgICAqIEB0aHJvd3MgRXJyb3IgaWYgZG9jdW1lbnRzIGhhdmUgYWxyZWFkeSBiZWVuIGluZGV4ZWQgYnkgdGhpcyBzZWFyY2ggaW5zdGFuY2VcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0IHRva2VuaXplcih2YWx1ZTpJVG9rZW5pemVyKSB7XG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkXykge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ0lUb2tlbml6ZXIgY2Fubm90IGJlIHNldCBhZnRlciBpbml0aWFsaXphdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50b2tlbml6ZXJfID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB0b2tlbml6ZXIoKTpJVG9rZW5pemVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9rZW5pemVyXztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBzZWFyY2hhYmxlIGRvY3VtZW50IHRvIHRoZSBpbmRleC4gRG9jdW1lbnQgd2lsbCBhdXRvbWF0aWNhbGx5IGJlIGluZGV4ZWQgZm9yIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0gZG9jdW1lbnRcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkRG9jdW1lbnQoZG9jdW1lbnQ6T2JqZWN0KTp2b2lkIHtcbiAgICAgICAgdGhpcy5hZGREb2N1bWVudHMoW2RvY3VtZW50XSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBzZWFyY2hhYmxlIGRvY3VtZW50cyB0byB0aGUgaW5kZXguIERvY3VtZW50cyB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgaW5kZXhlZCBmb3Igc2VhcmNoLlxuICAgICAqIEBwYXJhbSBkb2N1bWVudFxuICAgICAqL1xuICAgIHB1YmxpYyBhZGREb2N1bWVudHMoZG9jdW1lbnRzOkFycmF5PE9iamVjdD4pOnZvaWQge1xuICAgICAgICB0aGlzLmRvY3VtZW50c18gPSB0aGlzLmRvY3VtZW50c18uY29uY2F0KGRvY3VtZW50cyk7XG4gICAgICAgIHRoaXMuaW5kZXhEb2N1bWVudHNfKGRvY3VtZW50cywgdGhpcy5zZWFyY2hhYmxlRmllbGRzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBuZXcgc2VhcmNoYWJsZSBmaWVsZCB0byB0aGUgaW5kZXguIEV4aXN0aW5nIGRvY3VtZW50cyB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgaW5kZXhlZCB1c2luZyB0aGlzIG5ldyBmaWVsZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWVsZCBTZWFyY2hhYmxlIGZpZWxkIG9yIGZpZWxkIHBhdGguIFBhc3MgYSBzdHJpbmcgdG8gaW5kZXggYSB0b3AtbGV2ZWwgZmllbGQgYW5kIGFuIGFycmF5IG9mIHN0cmluZ3MgZm9yIG5lc3RlZCBmaWVsZHMuXG4gICAgICovXG4gICAgcHVibGljIGFkZEluZGV4KGZpZWxkOnN0cmluZ3xBcnJheTxzdHJpbmc+KSB7XG4gICAgICAgIHRoaXMuc2VhcmNoYWJsZUZpZWxkcy5wdXNoKGZpZWxkKTtcbiAgICAgICAgdGhpcy5pbmRleERvY3VtZW50c18odGhpcy5kb2N1bWVudHNfLCBbZmllbGRdKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWFyY2ggYWxsIGRvY3VtZW50cyBmb3Igb25lcyBtYXRjaGluZyB0aGUgc3BlY2lmaWVkIHF1ZXJ5IHRleHQuXG4gICAgICogQHBhcmFtIHF1ZXJ5XG4gICAgICogQHJldHVybnMge0FycmF5PE9iamVjdD59XG4gICAgICovXG4gICAgcHVibGljIHNlYXJjaChxdWVyeTpzdHJpbmcpOkFycmF5PE9iamVjdD4ge1xuICAgICAgICB2YXIgdG9rZW5zOkFycmF5PHN0cmluZz4gPSB0aGlzLnRva2VuaXplcl8udG9rZW5pemUodGhpcy5zYW5pdGl6ZXJfLnNhbml0aXplKHF1ZXJ5KSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoSW5kZXhfLnNlYXJjaCh0b2tlbnMsIHRoaXMuZG9jdW1lbnRzXyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIGRvY3VtZW50c1xuICAgICAqIEBwYXJhbSBzZWFyY2hhYmxlRmllbGRzIEFycmF5IGNvbnRhaW5pbmcgcHJvcGVydHkgbmFtZXMgYW5kIHBhdGhzIChsaXN0cyBvZiBwcm9wZXJ0eSBuYW1lcykgdG8gbmVzdGVkIHZhbHVlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbmRleERvY3VtZW50c18oZG9jdW1lbnRzOkFycmF5PE9iamVjdD4sIHNlYXJjaGFibGVGaWVsZHM6QXJyYXk8c3RyaW5nfEFycmF5PHN0cmluZz4+KTp2b2lkIHtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZF8gPSB0cnVlO1xuXG4gICAgICAgIGZvciAodmFyIGRpID0gMCwgbnVtRG9jdW1lbnRzID0gZG9jdW1lbnRzLmxlbmd0aDsgZGkgPCBudW1Eb2N1bWVudHM7IGRpKyspIHtcbiAgICAgICAgICAgIHZhciBkb2N1bWVudDpPYmplY3QgPSBkb2N1bWVudHNbZGldO1xuICAgICAgICAgICAgdmFyIHVpZDpzdHJpbmcgPSAoPGFueT5kb2N1bWVudClbdGhpcy51aWRGaWVsZE5hbWVfXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgc2ZpID0gMCwgbnVtU2VhcmNoYWJsZUZpZWxkcyA9IHNlYXJjaGFibGVGaWVsZHMubGVuZ3RoOyBzZmkgPCBudW1TZWFyY2hhYmxlRmllbGRzOyBzZmkrKykge1xuICAgICAgICAgICAgICAgIHZhciBmaWVsZFZhbHVlOmFueTtcbiAgICAgICAgICAgICAgICB2YXIgc2VhcmNoYWJsZUZpZWxkOnN0cmluZ3xBcnJheTxzdHJpbmc+ID0gc2VhcmNoYWJsZUZpZWxkc1tzZmldO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNlYXJjaGFibGVGaWVsZCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBTZWFyY2guZ2V0TmVzdGVkRmllbGRWYWx1ZShkb2N1bWVudCwgc2VhcmNoYWJsZUZpZWxkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gZG9jdW1lbnRbc2VhcmNoYWJsZUZpZWxkXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgIT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZmllbGRWYWx1ZSAhPT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZS50b1N0cmluZ1xuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gZmllbGRWYWx1ZS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZmllbGRWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpZWxkVG9rZW5zOkFycmF5PHN0cmluZz4gPSB0aGlzLnRva2VuaXplcl8udG9rZW5pemUodGhpcy5zYW5pdGl6ZXJfLnNhbml0aXplKGZpZWxkVmFsdWUpKTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBmdGkgPSAwLCBudW1GaWVsZFZhbHVlcyA9IGZpZWxkVG9rZW5zLmxlbmd0aDsgZnRpIDwgbnVtRmllbGRWYWx1ZXM7IGZ0aSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmllbGRUb2tlbjpzdHJpbmcgPSBmaWVsZFRva2Vuc1tmdGldO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGV4cGFuZGVkVG9rZW5zOkFycmF5PHN0cmluZz4gPSB0aGlzLmluZGV4U3RyYXRlZ3lfLmV4cGFuZFRva2VuKGZpZWxkVG9rZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBldGkgPSAwLCBudW1tRXhwYW5kZWRUb2tlbnMgPSBleHBhbmRlZFRva2Vucy5sZW5ndGg7IGV0aSA8IG51bW1FeHBhbmRlZFRva2VuczsgZXRpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXhwYW5kZWRUb2tlbiA9IGV4cGFuZGVkVG9rZW5zW2V0aV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaEluZGV4Xy5pbmRleERvY3VtZW50KGV4cGFuZGVkVG9rZW4sIHVpZCwgZG9jdW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZCBhbmQgcmV0dXJuIGEgbmVzdGVkIG9iamVjdCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvYmplY3QgdG8gY3Jhd2xcbiAgICAgKiBAcGFyYW0gcGF0aCBQcm9wZXJ0eSBwYXRoXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZXROZXN0ZWRGaWVsZFZhbHVlKG9iamVjdDpPYmplY3QsIHBhdGg6QXJyYXk8c3RyaW5nPikge1xuICAgICAgICBwYXRoID0gcGF0aCB8fCBbXTtcbiAgICAgICAgb2JqZWN0ID0gb2JqZWN0IHx8IHt9O1xuXG4gICAgICAgIHZhciB2YWx1ZSA9IG9iamVjdDtcblxuICAgICAgICAvLyB3YWxrIGRvd24gdGhlIHByb3BlcnR5IHBhdGhcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlW3BhdGhbaV1dO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn1cblxuIiwiaW1wb3J0IHtJSW5kZXhTdHJhdGVneX0gZnJvbSBcIi4vaW5kZXgtc3RyYXRlZ3lcIjtcbi8qKlxuICogSW5kZXhlcyBmb3IgcHJlZml4IHNlYXJjaGVzIChlLmcuIHRoZSB0ZXJtIFwiY2F0XCIgaXMgaW5kZXhlZCBhcyBcImNcIiwgXCJjYVwiLCBhbmQgXCJjYXRcIiBhbGxvd2luZyBwcmVmaXggc2VhcmNoIGxvb2t1cHMpLlxuICovXG5leHBvcnQgY2xhc3MgUHJlZml4SW5kZXhTdHJhdGVneSBpbXBsZW1lbnRzIElJbmRleFN0cmF0ZWd5IHtcblxuICAgIC8qKlxuICAgICAqIEBpbmhlcml0RG9jc1xuICAgICAqL1xuICAgIHB1YmxpYyBleHBhbmRUb2tlbih0b2tlbjpzdHJpbmcpOkFycmF5PHN0cmluZz4ge1xuICAgICAgICB2YXIgZXhwYW5kZWRUb2tlbnM6QXJyYXk8c3RyaW5nPiA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSB0b2tlbi5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgZXhwYW5kZWRUb2tlbnMucHVzaCh0b2tlbi5zdWJzdHJpbmcoMCwgaSArIDEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBleHBhbmRlZFRva2VucztcbiAgICB9XG59IiwiaW1wb3J0IHtJU2FuaXRpemVyfSBmcm9tIFwiLi9zYW5pdGl6ZXJcIjtcbi8qKlxuICogU2FuaXRpemVzIHRleHQgYnkgY29udmVydGluZyB0byBhIGxvY2FsZS1mcmllbmRseSBsb3dlci1jYXNlIHZlcnNpb24gYW5kIHRyaW1pbmcgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS5cbiAqL1xuZXhwb3J0IGNsYXNzIExvd2VyQ2FzZVNhbml0aXplciBpbXBsZW1lbnRzIElTYW5pdGl6ZXIge1xuXG4gICAgLyoqXG4gICAgICogQGluaGVyaXREb2NzXG4gICAgICovXG4gICAgcHVibGljIHNhbml0aXplKHRleHQ6c3RyaW5nKTpzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGV4dCA/IHRleHQudG9Mb2NhbGVMb3dlckNhc2UoKS50cmltKCkgOiAnJztcbiAgICB9XG59IiwiaW1wb3J0IHtJU2VhcmNoSW5kZXh9IGZyb20gXCIuL3NlYXJjaC1pbmRleFwiO1xuLyoqXG4gKiBTZWFyY2ggaW5kZXggY2FwYWJsZSBvZiByZXR1cm5pbmcgcmVzdWx0cyBtYXRjaGluZyBhIHNldCBvZiB0b2tlbnMgYW5kIHJhbmtlZCBhY2NvcmRpbmcgdG8gVEYtSURGLlxuICovXG5leHBvcnQgY2xhc3MgVGZJZGZTZWFyY2hJbmRleCBpbXBsZW1lbnRzIElTZWFyY2hJbmRleCB7XG5cbiAgICBwcml2YXRlIHRva2VuVG9JZGZDYWNoZV86e1t0b2tlbjpzdHJpbmddOm51bWJlcn07XG4gICAgcHJpdmF0ZSB0b2tlbk1hcF86SVRmSWRmVG9rZW5NYXA7XG4gICAgcHJpdmF0ZSB1aWRGaWVsZE5hbWVfOnN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHVpZEZpZWxkTmFtZTpzdHJpbmcpIHtcbiAgICAgICAgdGhpcy51aWRGaWVsZE5hbWVfID0gdWlkRmllbGROYW1lO1xuICAgICAgICB0aGlzLnRva2VuVG9JZGZDYWNoZV8gPSB7fTtcbiAgICAgICAgdGhpcy50b2tlbk1hcF8gPSB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAaW5oZXJpdERvY3NcbiAgICAgKi9cbiAgICBwdWJsaWMgaW5kZXhEb2N1bWVudCh0b2tlbjpzdHJpbmcsIHVpZDpzdHJpbmcsIGRvY3VtZW50Ok9iamVjdCk6dm9pZCB7XG4gICAgICAgIHRoaXMudG9rZW5Ub0lkZkNhY2hlXyA9IHt9OyAvLyBOZXcgaW5kZXggaW52YWxpZGF0ZXMgcHJldmlvdXMgSURGIGNhY2hlc1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy50b2tlbk1hcF9bdG9rZW5dICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhpcy50b2tlbk1hcF9bdG9rZW5dID0ge1xuICAgICAgICAgICAgICAgICRudW1Eb2N1bWVudE9jY3VycmVuY2VzOiAwLFxuICAgICAgICAgICAgICAgICR0b3RhbE51bU9jY3VycmVuY2VzOiAxLFxuICAgICAgICAgICAgICAgICR1aWRNYXA6IHt9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudG9rZW5NYXBfW3Rva2VuXS4kdG90YWxOdW1PY2N1cnJlbmNlcysrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnRva2VuTWFwX1t0b2tlbl0uJHVpZE1hcFt1aWRdKSB7XG4gICAgICAgICAgICB0aGlzLnRva2VuTWFwX1t0b2tlbl0uJG51bURvY3VtZW50T2NjdXJyZW5jZXMrKztcblxuICAgICAgICAgICAgdGhpcy50b2tlbk1hcF9bdG9rZW5dLiR1aWRNYXBbdWlkXSA9IHtcbiAgICAgICAgICAgICAgICAkZG9jdW1lbnQ6IGRvY3VtZW50LFxuICAgICAgICAgICAgICAgICRudW1Ub2tlbk9jY3VycmVuY2VzOiAxXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50b2tlbk1hcF9bdG9rZW5dLiR1aWRNYXBbdWlkXS4kbnVtVG9rZW5PY2N1cnJlbmNlcysrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGluaGVyaXREb2NzXG4gICAgICovXG4gICAgcHVibGljIHNlYXJjaCh0b2tlbnM6QXJyYXk8c3RyaW5nPiwgY29ycHVzOkFycmF5PE9iamVjdD4pOkFycmF5PE9iamVjdD4ge1xuICAgICAgICB2YXIgdWlkVG9Eb2N1bWVudE1hcDp7W3VpZDpzdHJpbmddOk9iamVjdH0gPSB7fTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aDsgaSA8IG51bVRva2VuczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdG9rZW46c3RyaW5nID0gdG9rZW5zW2ldO1xuICAgICAgICAgICAgdmFyIHRva2VuTWV0YWRhdGE6SVRmSWRmVG9rZW5NZXRhZGF0YSA9IHRoaXMudG9rZW5NYXBfW3Rva2VuXTtcblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCBpZiBubyBtYXRjaGVzIHdlcmUgZm91bmQgZm9yIGFueSBnaXZlbiB0b2tlbi5cbiAgICAgICAgICAgIGlmICghdG9rZW5NZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB1aWQgaW4gdG9rZW5NZXRhZGF0YS4kdWlkTWFwKSB7XG4gICAgICAgICAgICAgICAgICAgIHVpZFRvRG9jdW1lbnRNYXBbdWlkXSA9IHRva2VuTWV0YWRhdGEuJHVpZE1hcFt1aWRdLiRkb2N1bWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHVpZCBpbiB1aWRUb0RvY3VtZW50TWFwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdG9rZW5NZXRhZGF0YS4kdWlkTWFwW3VpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB1aWRUb0RvY3VtZW50TWFwW3VpZF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZG9jdW1lbnRzOkFycmF5PE9iamVjdD4gPSBbXTtcblxuICAgICAgICBmb3IgKHZhciB1aWQgaW4gdWlkVG9Eb2N1bWVudE1hcCkge1xuICAgICAgICAgICAgZG9jdW1lbnRzLnB1c2godWlkVG9Eb2N1bWVudE1hcFt1aWRdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJldHVybiBkb2N1bWVudHMgc29ydGVkIGJ5IFRGLUlERlxuICAgICAgICByZXR1cm4gZG9jdW1lbnRzLnNvcnQoZnVuY3Rpb24gKGRvY3VtZW50QSA6IE9iamVjdCwgZG9jdW1lbnRCIDogT2JqZWN0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWxjdWxhdGVUZklkZl8odG9rZW5zLCBkb2N1bWVudEIsIGNvcnB1cykgLVxuICAgICAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlVGZJZGZfKHRva2VucywgZG9jdW1lbnRBLCBjb3JwdXMpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGUgaW52ZXJzZSBkb2N1bWVudCBmcmVxdWVuY3kgb2YgYSBzZWFyY2ggdG9rZW4uIFRoaXMgY2FsY3VsYXRpb24gZGltaW5pc2hlcyB0aGUgd2VpZ2h0IG9mIHRva2VucyB0aGF0XG4gICAgICogb2NjdXIgdmVyeSBmcmVxdWVudGx5IGluIHRoZSBzZXQgb2Ygc2VhcmNoYWJsZSBkb2N1bWVudHMgYW5kIGluY3JlYXNlcyB0aGUgd2VpZ2h0IG9mIHRlcm1zIHRoYXQgb2NjdXIgcmFyZWx5LlxuICAgICAqL1xuICAgIHByaXZhdGUgY2FsY3VsYXRlSWRmXyh0b2tlbjpzdHJpbmcsIGRvY3VtZW50czpBcnJheTxPYmplY3Q+KTpudW1iZXIge1xuICAgICAgICBpZiAoIXRoaXMudG9rZW5Ub0lkZkNhY2hlX1t0b2tlbl0pIHtcbiAgICAgICAgICAgIHZhciBudW1Eb2N1bWVudHNXaXRoVG9rZW46bnVtYmVyID0gdGhpcy50b2tlbk1hcF9bdG9rZW5dICYmIHRoaXMudG9rZW5NYXBfW3Rva2VuXS4kbnVtRG9jdW1lbnRPY2N1cnJlbmNlcyB8fCAwO1xuXG4gICAgICAgICAgICB0aGlzLnRva2VuVG9JZGZDYWNoZV9bdG9rZW5dID0gMSArIE1hdGgubG9nKGRvY3VtZW50cy5sZW5ndGggLyAoMSArIG51bURvY3VtZW50c1dpdGhUb2tlbikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudG9rZW5Ub0lkZkNhY2hlX1t0b2tlbl07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSB0ZXJtIGZyZXF1ZW5jeeKAk2ludmVyc2UgZG9jdW1lbnQgZnJlcXVlbmN5IChURi1JREYpIHJhbmtpbmcgZm9yIGEgc2V0IG9mIHNlYXJjaCB0b2tlbnMgYW5kIGFcbiAgICAgKiBkb2N1bWVudC4gVGhlIFRGLUlERiBpcyBhIG51bWVyaWMgc3RhdGlzdGljIGludGVuZGVkIHRvIHJlZmxlY3QgaG93IGltcG9ydGFudCBhIHdvcmQgKG9yIHdvcmRzKSBhcmUgdG8gYSBkb2N1bWVudFxuICAgICAqIGluIGEgY29ycHVzLiBUaGUgVEYtSURGIHZhbHVlIGluY3JlYXNlcyBwcm9wb3J0aW9uYWxseSB0byB0aGUgbnVtYmVyIG9mIHRpbWVzIGEgd29yZCBhcHBlYXJzIGluIHRoZSBkb2N1bWVudCBidXRcbiAgICAgKiBpcyBvZmZzZXQgYnkgdGhlIGZyZXF1ZW5jeSBvZiB0aGUgd29yZCBpbiB0aGUgY29ycHVzLiBUaGlzIGhlbHBzIHRvIGFkanVzdCBmb3IgdGhlIGZhY3QgdGhhdCBzb21lIHdvcmRzIGFwcGVhclxuICAgICAqIG1vcmUgZnJlcXVlbnRseSBpbiBnZW5lcmFsIChlLmcuIGEsIGFuZCwgdGhlKS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNhbGN1bGF0ZVRmSWRmXyh0b2tlbnM6QXJyYXk8c3RyaW5nPiwgZG9jdW1lbnQ6T2JqZWN0LCBkb2N1bWVudHM6QXJyYXk8T2JqZWN0Pik6bnVtYmVyIHtcbiAgICAgICAgdmFyIHNjb3JlOm51bWJlciA9IDA7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGg7IGkgPCBudW1Ub2tlbnM7ICsraSkge1xuICAgICAgICAgICAgdmFyIHRva2VuOnN0cmluZyA9IHRva2Vuc1tpXTtcblxuICAgICAgICAgICAgdmFyIGludmVyc2VEb2N1bWVudEZyZXF1ZW5jeTpudW1iZXIgPSB0aGlzLmNhbGN1bGF0ZUlkZl8odG9rZW4sIGRvY3VtZW50cyk7XG5cbiAgICAgICAgICAgIGlmIChpbnZlcnNlRG9jdW1lbnRGcmVxdWVuY3kgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgICAgICAgaW52ZXJzZURvY3VtZW50RnJlcXVlbmN5ID0gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHVpZDphbnkgPSBkb2N1bWVudCAmJiBkb2N1bWVudFt0aGlzLnVpZEZpZWxkTmFtZV9dO1xuICAgICAgICAgICAgdmFyIHRlcm1GcmVxdWVuY3k6bnVtYmVyID1cbiAgICAgICAgICAgICAgICB0aGlzLnRva2VuTWFwX1t0b2tlbl0gJiZcbiAgICAgICAgICAgICAgICB0aGlzLnRva2VuTWFwX1t0b2tlbl0uJHVpZE1hcFt1aWRdICYmXG4gICAgICAgICAgICAgICAgdGhpcy50b2tlbk1hcF9bdG9rZW5dLiR1aWRNYXBbdWlkXS4kbnVtVG9rZW5PY2N1cnJlbmNlcyB8fCAwO1xuXG4gICAgICAgICAgICBzY29yZSArPSB0ZXJtRnJlcXVlbmN5ICogaW52ZXJzZURvY3VtZW50RnJlcXVlbmN5O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNjb3JlO1xuICAgIH1cbn1cbjtcblxuaW50ZXJmYWNlIElUZklkZlRva2VuTWFwIHtcbiAgICBbdG9rZW46c3RyaW5nXTpJVGZJZGZUb2tlbk1ldGFkYXRhO1xufVxuO1xuXG5pbnRlcmZhY2UgSVRmSWRmVG9rZW5NZXRhZGF0YSB7XG4gICAgJG51bURvY3VtZW50T2NjdXJyZW5jZXM6bnVtYmVyO1xuICAgICR0b3RhbE51bU9jY3VycmVuY2VzOm51bWJlcjtcbiAgICAkdWlkTWFwOklUZklkZlVpZE1hcDtcbn1cbjtcblxuaW50ZXJmYWNlIElUZklkZlVpZE1hcCB7XG4gICAgW3VpZDpzdHJpbmddOklUZklkZlVpZE1ldGFkYXRhO1xufVxuO1xuXG5pbnRlcmZhY2UgSVRmSWRmVWlkTWV0YWRhdGEge1xuICAgICRkb2N1bWVudDpPYmplY3Q7XG4gICAgJG51bVRva2VuT2NjdXJyZW5jZXM6bnVtYmVyO1xufVxuIiwiaW1wb3J0IHtJVG9rZW5pemVyfSBmcm9tIFwiLi90b2tlbml6ZXJcIjtcbi8qKlxuICogU2ltcGxlIHRva2VuaXplciB0aGF0IHNwbGl0cyBzdHJpbmdzIG9uIHdoaXRlc3BhY2UgY2hhcmFjdGVycyBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBhbGwgbm9uLWVtcHR5IHN1YnN0cmluZ3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBTaW1wbGVUb2tlbml6ZXIgaW1wbGVtZW50cyBJVG9rZW5pemVyIHtcblxuICAgIC8qKlxuICAgICAqIEBpbmhlcml0RG9jc1xuICAgICAqL1xuICAgIHB1YmxpYyB0b2tlbml6ZSh0ZXh0OnN0cmluZyk6QXJyYXk8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiB0ZXh0LnNwbGl0KC9bXmEtekEtWjAtOVxcLSddKy8pXG4gICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uICh0ZXh0OnN0cmluZyk6Ym9vbGVhbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhdGV4dDsgLy8gRmlsdGVyIGVtcHR5IHRva2Vuc1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufSIsImltcG9ydCB7TG9nb1NlYXJjaERhdGFTZXQsIExvZ29TZWFyY2hEYXRhUG9pbnR9IGZyb20gXCIuL0xvZ29TZWFyY2hEYXRhU2V0XCI7XHJcbmltcG9ydCB7TG9nb1NlYXJjaEZhY3Rvcnl9IGZyb20gXCIuL0xvZ29TZWFyY2hGYWN0b3J5XCI7XHJcbmltcG9ydCB7cGFyc2VKU09OfSBmcm9tIFwiLi4vdXRpbC9KU09OVXRpbHNcIjtcclxuaW1wb3J0IHtTZWFyY2h9IGZyb20gXCIuL0pzU2VhcmNoL1NlYXJjaFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIExvZ29TZWFyY2gge1xyXG5cclxuICAgIHByaXZhdGUgX2RhdGFTZXQgOiBMb2dvU2VhcmNoRGF0YVBvaW50W10gPSBbXTtcclxuICAgIHByaXZhdGUgX2RhdGFVUkkgOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9lbGVtZW50IDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIF9pbnB1dCA6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIF9zZWFyY2ggOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKGVsZW1lbnQgOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgIHRoaXMuX2RhdGFVUkkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnbG9nb3NlYXJjaC1kYXRhJyk7XHJcblxyXG4gICAgICAgIHRoaXMuX3NlYXJjaCA9IG5ldyBTZWFyY2goJ25hbWUnKTtcclxuICAgICAgICB0aGlzLl9zZWFyY2guYWRkSW5kZXgoJ25hbWUnKTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2FkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhdHRhY2hJbnB1dCAoaW5wdXQgOiBIVE1MSW5wdXRFbGVtZW50KSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XHJcbiAgICAgICAgdGhpcy5faW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnB1dCBjaGFuZ2VkIHRvJywgdGhpcy5faW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygncmVzdWx0IDogJywgdGhpcy5fc2VhcmNoLnNlYXJjaCh0aGlzLl9pbnB1dC52YWx1ZSkpO1xyXG4gICAgICAgICAgICBsZXQgcXVlcnlSZXN1bHQgOiBBcnJheTxMb2dvU2VhcmNoRGF0YVBvaW50PiA9ICg8QXJyYXk8TG9nb1NlYXJjaERhdGFQb2ludD4+dGhpcy5fc2VhcmNoLnNlYXJjaCh0aGlzLl9pbnB1dC52YWx1ZSkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHF1ZXJ5UmVzdWx0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZGF0YVBvaW50IG9mIHRoaXMuX2RhdGFTZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhUG9pbnQuZG9tLmNsYXNzTmFtZSA9ICdsb2dvc2VhcmNoLWRhdGFwb2ludCBjb2wtc20tMic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBkYXRhUG9pbnQgb2YgdGhpcy5fZGF0YVNldCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocXVlcnlSZXN1bHQuaW5kZXhPZihkYXRhUG9pbnQpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhUG9pbnQuZG9tLmNsYXNzTmFtZSA9ICdsb2dvc2VhcmNoLWRhdGFwb2ludCBsb2dvc2VhcmNoLWRhdGFwb2ludC1oaWRkZW4gY29sLXNtLTInO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFQb2ludC5kb20uY2xhc3NOYW1lID0gJ2xvZ29zZWFyY2gtZGF0YXBvaW50IGNvbC1zbS0yJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbG9hZCAoKSA6IHZvaWQge1xyXG4gICAgICAgIHZhciB4aHIgOiBYTUxIdHRwUmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgIHhoci5vcGVuKFwiR0VUXCIsIHRoaXMuX2RhdGFVUkksIHRydWUpO1xyXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YVNldCA6IExvZ29TZWFyY2hEYXRhU2V0ID0gcGFyc2VKU09OKHhoci5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFTZXQuZW50cmllcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZERhdGFTZXQoZGF0YVNldClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgeGhyLnNlbmQobnVsbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgbG9hZERhdGFTZXQgKGRhdGFTZXQgOiBMb2dvU2VhcmNoRGF0YVNldCkge1xyXG4gICAgICAgIGZvciAobGV0IGRhdGFQb2ludCBvZiBkYXRhU2V0LmVudHJpZXMpIHtcclxuICAgICAgICAgICAgZGF0YVBvaW50LmRvbSA9IExvZ29TZWFyY2hGYWN0b3J5LmJ1aWxkRGF0YVBvaW50dmlldyhkYXRhUG9pbnQpO1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhU2V0LnB1c2goZGF0YVBvaW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2RhdGFTZXQuc29ydCgoZGF0YVBvaW50MSA6IExvZ29TZWFyY2hEYXRhUG9pbnQsIGRhdGFQb2ludDIgOiBMb2dvU2VhcmNoRGF0YVBvaW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhUG9pbnQxLm5hbWUudG9Mb3dlckNhc2UoKSA8IGRhdGFQb2ludDIubmFtZS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGFQb2ludDEubmFtZS50b0xvd2VyQ2FzZSgpID4gZGF0YVBvaW50Mi5uYW1lLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9zZWFyY2guYWRkRG9jdW1lbnRzKHRoaXMuX2RhdGFTZXQpO1xyXG5cclxuICAgICAgICBsZXQgc2VhcmNoQmFyID0gTG9nb1NlYXJjaEZhY3RvcnkuYnVpbGRTZWFyY2hCYXIoKTtcclxuICAgICAgICB0aGlzLmF0dGFjaElucHV0KDxIVE1MSW5wdXRFbGVtZW50PnNlYXJjaEJhci5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpKTtcclxuICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZENoaWxkKHNlYXJjaEJhcik7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGRhdGFQb2ludCBvZiB0aGlzLl9kYXRhU2V0KXtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmRDaGlsZChkYXRhUG9pbnQuZG9tKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBhdXRvRGV0ZWN0ICgpIHtcclxuICAgICAgICBsZXQgZGV0ZWN0ZWRFbGVtZW50cyA6IE5vZGVMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmxvZ29zZWFyY2gnKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXRlY3RlZEVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICgoPEhUTUxFbGVtZW50PmRldGVjdGVkRWxlbWVudHMuaXRlbShpKSkuZ2V0QXR0cmlidXRlKCdsb2dvc2VhcmNoLWRhdGEnKSkge1xyXG4gICAgICAgICAgICAgICAgbmV3IExvZ29TZWFyY2goKDxIVE1MRWxlbWVudD5kZXRlY3RlZEVsZW1lbnRzLml0ZW0oaSkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuKCgpID0+IHtMb2dvU2VhcmNoLmF1dG9EZXRlY3QoKX0pKCk7IiwiaW1wb3J0IHtMb2dvU2VhcmNoRGF0YVBvaW50fSBmcm9tIFwiLi9Mb2dvU2VhcmNoRGF0YVNldFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIExvZ29TZWFyY2hGYWN0b3J5IHtcclxuXHJcbiAgICBzdGF0aWMgYnVpbGREYXRhUG9pbnR2aWV3IChkYXRhUG9pbnQgOiBMb2dvU2VhcmNoRGF0YVBvaW50KSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBsZXQgcm9vdCA6IEhUTUxFbGVtZW50ID0gZGl2KCdsb2dvc2VhcmNoLWRhdGFwb2ludCBjb2wtc20tMicpO1xyXG5cclxuICAgICAgICBsZXQgbG9nb0NvbnRhaW5lciA6IEhUTUxFbGVtZW50ID0gZGl2KCdsb2dvc2VhcmNoLWxvZ28tY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgIGxldCBsb2dvSW1nIDogSFRNTEltYWdlRWxlbWVudCA9IGltZygnbG9nb3NlYXJjaC1sb2dvJywgZGF0YVBvaW50LmltZyk7XHJcblxyXG4gICAgICAgIGxldCBuYW1lTGFiZWwgOiBIVE1MRWxlbWVudCA9IHAoJ2xvZ29zZWFyY2gtbmFtZScsIGRhdGFQb2ludC5uYW1lKTtcclxuXHJcbiAgICAgICAgbG9nb0NvbnRhaW5lci5hcHBlbmRDaGlsZChsb2dvSW1nKTtcclxuICAgICAgICByb290LmFwcGVuZENoaWxkKGxvZ29Db250YWluZXIpO1xyXG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQobmFtZUxhYmVsKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJvb3Q7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGJ1aWxkU2VhcmNoQmFyICgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCBmb3JtIDogSFRNTEVsZW1lbnQgPSBkaXYoJ2xvZ29zZWFyY2gtc2VhcmNoYmFyIGZvcm0tZ3JvdXAnKTtcclxuXHJcbiAgICAgICAgbGV0IGlucHV0Q29udGFpbmVyIDogSFRNTEVsZW1lbnQgPSBkaXYoJ2xvZ29zZWFyY2gtaW5wdXQtY29udGFpbmVyIGNvbC1zbS0xMicpO1xyXG5cclxuICAgICAgICBsZXQgaW5wdXRHcm91cCA6IEhUTUxFbGVtZW50ID0gZGl2KCdpbnB1dC1ncm91cCcpO1xyXG5cclxuICAgICAgICBsZXQgc2VhcmNoSWNvbiA6IEhUTUxTcGFuRWxlbWVudCAgPSBzcGFuKCdsb2dvc2VhcmNoLXNlYXJjaGljb24gaW5wdXQtZ3JvdXAtYWRkb24gZmEgZmEtc2VhcmNoJyk7XHJcblxyXG4gICAgICAgIGxldCBpbnB1dEVMIDogSFRNTElucHV0RWxlbWVudCA9IGlucHV0KCdsb2dvc2VhcmNoLWlucHV0IGZvcm0tY29udHJvbCcsICd0ZXh0Jyk7XHJcblxyXG4gICAgICAgIGlucHV0R3JvdXAuYXBwZW5kQ2hpbGQoc2VhcmNoSWNvbik7XHJcbiAgICAgICAgaW5wdXRHcm91cC5hcHBlbmRDaGlsZChpbnB1dEVMKTtcclxuICAgICAgICBpbnB1dENvbnRhaW5lci5hcHBlbmRDaGlsZChpbnB1dEdyb3VwKTtcclxuICAgICAgICBmb3JtLmFwcGVuZENoaWxkKGlucHV0Q29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm07XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uICBkaXYgKGNsYXNzTmFtZSA6IHN0cmluZykgOiBIVE1MRWxlbWVudCB7XHJcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgcmV0dXJuIGRpdjtcclxufVxyXG5cclxuZnVuY3Rpb24gIHNwYW4gKGNsYXNzTmFtZSA6IHN0cmluZywgaW5uZXJUZXh0PyA6IHN0cmluZykgOiBIVE1MU3BhbkVsZW1lbnQge1xyXG4gICAgbGV0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICBzcGFuLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcclxuICAgIGlmIChpbm5lclRleHQpIHtcclxuICAgICAgICBzcGFuLmlubmVyVGV4dCA9IGlubmVyVGV4dDtcclxuICAgIH1cclxuICAgIHJldHVybiBzcGFuO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbnB1dCAoY2xhc3NOYW1lIDogc3RyaW5nLCB0eXBlIDogc3RyaW5nKSA6IEhUTUxJbnB1dEVsZW1lbnQge1xyXG4gICAgbGV0IGlucHV0IDogSFRNTElucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICBpbnB1dC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XHJcbiAgICBpbnB1dC50eXBlID0gdHlwZTtcclxuICAgIHJldHVybiBpbnB1dDtcclxufVxyXG5cclxuZnVuY3Rpb24gaW1nIChjbGFzc05hbWUgOiBzdHJpbmcsIHNyYyA6IHN0cmluZykgOiBIVE1MSW1hZ2VFbGVtZW50e1xyXG4gICAgbGV0IGltZyA6IEhUTUxJbWFnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgIGltZy5jbGFzc05hbWUgPSBjbGFzc05hbWU7XHJcbiAgICBpbWcuc3JjID0gc3JjO1xyXG4gICAgcmV0dXJuIGltZztcclxufVxyXG5cclxuZnVuY3Rpb24gcCAoY2xhc3NOYW1lIDogc3RyaW5nLCBpbm5lclRleHQgOiBzdHJpbmcpIDogSFRNTFBhcmFncmFwaEVsZW1lbnQge1xyXG4gICAgbGV0IHAgOiBIVE1MUGFyYWdyYXBoRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgIHAuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgcC5pbm5lclRleHQgPSBpbm5lclRleHQ7XHJcbiAgICByZXR1cm4gcDtcclxufSIsImV4cG9ydCBmdW5jdGlvbiBwYXJzZUpTT04gKGpzb24gOiBzdHJpbmcpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IHBhcnNlZE9iamVjdCA9IEpTT04ucGFyc2UoanNvbik7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZE9iamVjdDtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkOyAgIFxyXG4gICAgfVxyXG59Il19
