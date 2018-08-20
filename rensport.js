(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var Loadable = (function () {
    function Loadable() {
        this._isLoaded = false;
        this._loadFailed = false;
        this._waitingForLoadSuccess = [];
        this._waitingForLoadFail = [];
        this.doLoad();
    }
    Object.defineProperty(Loadable.prototype, "isLoaded", {
        get: function () {
            return this._isLoaded;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Loadable.prototype, "hasLoadFailed", {
        get: function () {
            return this._loadFailed;
        },
        enumerable: true,
        configurable: true
    });
    Loadable.prototype.afterLoad = function (loadSuccessCallback, loadFailCallback) {
        if (this.isLoaded) {
            loadSuccessCallback();
        }
        else if (this.hasLoadFailed) {
            if (loadFailCallback) {
                loadFailCallback();
            }
        }
        else {
            this._waitingForLoadSuccess.push(loadSuccessCallback);
            if (loadFailCallback) {
                this._waitingForLoadFail.push(loadFailCallback);
            }
        }
    };
    Loadable.prototype.loadSuccess = function () {
        this._isLoaded = true;
        for (var _i = 0, _a = this._waitingForLoadSuccess; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback();
        }
        this._waitingForLoadSuccess = [];
    };
    Loadable.prototype.loadFailed = function (error) {
        this._loadFailed = true;
        for (var _i = 0, _a = this._waitingForLoadFail; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback();
        }
        this._waitingForLoadFail = [];
        throw new Error('Loading failed : ' + error);
    };
    return Loadable;
}());
exports.Loadable = Loadable;
},{}],2:[function(require,module,exports){
"use strict";
var FacebookOpeningInfo_1 = require("./facebookplugins/FacebookOpeningInfo");
var FacebookFeed_1 = require("./facebookplugins/FacebookFeed");
var OpeningInfoView_1 = require("./view/OpeningInfoView");
var Ren = (function () {
    function Ren() {
        var _this = this;
        var config = window.RenSportConfig;
        if (config && config.loadHeader) {
            this._loadHeader(config.context);
        }
        this._loadFooter();
        if (config && config.loadOpeningHours) {
            this._openingInfo = new FacebookOpeningInfo_1.FacebookOpeningInfo();
            this._openingInfo.afterLoad(function () {
                OpeningInfoView_1.renderOpeningInfo(_this._openingInfo, document.querySelector('#ren-openingsuren-hook'));
            });
        }
        if (config && config.loadNewsFeed) {
            this._feed = new FacebookFeed_1.FacebookFeed();
            this._feed.afterLoad(function () {
                _this._feed.renderTo(document.querySelector('.ren-homepage-newsfeed'));
            });
        }
    }
    Object.defineProperty(Ren.prototype, "feed", {
        get: function () {
            return this._feed;
        },
        enumerable: true,
        configurable: true
    });
    Ren.prototype._loadHeader = function (context) {
        document.addEventListener("DOMContentLoaded", function () {
            var hook = $("#ren-header");
            hook.load("/components/header.html", function () {
                var contextNavbarElement = document.querySelector('li[data-context-' + context.toLowerCase() + ']');
                if (contextNavbarElement) {
                    contextNavbarElement.className += 'active';
                }
            });
        });
    };
    Ren.prototype._loadFooter = function () {
        document.addEventListener("DOMContentLoaded", function () {
            var hook = $("#ren-footer");
            hook.load("/components/footer.html");
        });
    };
    Object.defineProperty(Ren.prototype, "openingInfo", {
        get: function () {
            return this._openingInfo;
        },
        enumerable: true,
        configurable: true
    });
    Ren.prototype.subscribeToNewsletter = function () {
        var input = document.querySelector('#ren-nieuwsbrief-input-field');
        var hiddenInput = document.querySelector('#vr-hidden-input-field'), hiddenSubmit = document.querySelector('#vr-hidden-submit-btn');
        if (input && input.value && hiddenInput && hiddenSubmit) {
            hiddenInput.value = input.value;
            hiddenSubmit.click();
        }
    };
    return Ren;
}());
exports.Ren = Ren;
},{"./facebookplugins/FacebookFeed":4,"./facebookplugins/FacebookOpeningInfo":5,"./view/OpeningInfoView":12}],3:[function(require,module,exports){
"use strict";
var Ren_1 = require("./Ren");
window.RenSport = new Ren_1.Ren();
},{"./Ren":2}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Loadable_1 = require("../Loadable");
var FacebookProxy_1 = require("./FacebookProxy");
var FacebookPost_1 = require("./FacebookPost");
var JSONUtils_1 = require("../util/JSONUtils");
var ManualFeedbookFeed_1 = require("./ManualFeedbookFeed");
var FacebookFeed = (function (_super) {
    __extends(FacebookFeed, _super);
    function FacebookFeed() {
        _super.call(this);
        this._posts = [];
    }
    Object.defineProperty(FacebookFeed.prototype, "posts", {
        get: function () {
            return this._posts;
        },
        enumerable: true,
        configurable: true
    });
    // Called by super();
    FacebookFeed.prototype.doLoad = function () {
        var _this = this;
        FacebookProxy_1.FacebookProxy.feed(function (res) {
            if (!res.error && res.feed && res.feed.data) {
                _this.addPostsFromResponse(res.feed.data);
            }
            else if (!res.error && JSONUtils_1.parseJSON(res) && JSONUtils_1.parseJSON(res).feed && JSONUtils_1.parseJSON(res).feed.data) {
                _this.addPostsFromResponse(JSONUtils_1.parseJSON(res.feed.data));
            }
            else {
                _this.addPostsFromResponse(ManualFeedbookFeed_1.manualFacebookFeed);
            }
        }, function () {
            _this.addPostsFromResponse(ManualFeedbookFeed_1.manualFacebookFeed);
        });
    };
    FacebookFeed.prototype.addPostsFromResponse = function (res) {
        for (var _i = 0, res_1 = res; _i < res_1.length; _i++) {
            var post = res_1[_i];
            this._posts.push(new FacebookPost_1.FacebookPost(post));
        }
        this.loadSuccess();
    };
    Object.defineProperty(FacebookFeed.prototype, "view", {
        get: function () {
            var view = [];
            for (var i = 0, displayingPosts = 0; displayingPosts < Math.min(this.posts.length, 5); i++) {
                var post = this.posts[i];
                if (post.canDisplay) {
                    view.push(post.view);
                    displayingPosts++;
                }
            }
            return view;
        },
        enumerable: true,
        configurable: true
    });
    FacebookFeed.prototype.renderTo = function (parent) {
        for (var _i = 0, _a = this.view; _i < _a.length; _i++) {
            var postView = _a[_i];
            parent.appendChild(postView);
        }
    };
    return FacebookFeed;
}(Loadable_1.Loadable));
exports.FacebookFeed = FacebookFeed;
},{"../Loadable":1,"../util/JSONUtils":10,"./FacebookPost":6,"./FacebookProxy":7,"./ManualFeedbookFeed":8}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Loadable_1 = require("../Loadable");
var FacebookProxy_1 = require("./FacebookProxy");
var JSONUtils_1 = require("../util/JSONUtils");
var ManualOpeningHours_1 = require("./ManualOpeningHours");
var FacebookOpeningInfo = (function (_super) {
    __extends(FacebookOpeningInfo, _super);
    function FacebookOpeningInfo() {
        _super.apply(this, arguments);
        this.monday = [];
        this.tuesday = [];
        this.wednesday = [];
        this.thursday = [];
        this.friday = [];
        this.saturday = [];
        this.sunday = [];
    }
    Object.defineProperty(FacebookOpeningInfo.prototype, "isCurrentlyOpen", {
        get: function () {
            var now = new Date(), day = jsValueToDay(now.getDay()), infoForDay = this[day];
            for (var i = 0; i < infoForDay.length; i += 2) {
                if (liesNowInInterval(infoForDay[i], infoForDay[i + 1])) {
                    return true;
                }
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });
    // Called by super();
    FacebookOpeningInfo.prototype.doLoad = function () {
        var _this = this;
        FacebookProxy_1.FacebookProxy.openinghours(function (roughdata) {
            if (!roughdata.error) {
                _this.parseData(roughdata);
                _this.loadSuccess();
            }
            else {
                _this.loadFailed(roughdata.error);
            }
        }, function () {
            _this.parseData(ManualOpeningHours_1.STANDARD_OPENING_HOURS);
            _this.loadSuccess();
        });
    };
    FacebookOpeningInfo.prototype.parseData = function (roughdata) {
        if (typeof roughdata === 'string') {
            roughdata = JSONUtils_1.parseJSON(roughdata);
        }
        this.monday = toTimings(Object.keys(roughdata.hours).filter(function (openingTime) {
            return openingTime.indexOf('mon') > -1;
        }).sort(compareOpeningInfo), roughdata);
        this.tuesday = toTimings(Object.keys(roughdata.hours).filter(function (openingTime) {
            return openingTime.indexOf('tue') > -1;
        }).sort(compareOpeningInfo), roughdata);
        this.wednesday = toTimings(Object.keys(roughdata.hours).filter(function (openingTime) {
            return openingTime.indexOf('wed') > -1;
        }).sort(compareOpeningInfo), roughdata);
        this.thursday = toTimings(Object.keys(roughdata.hours).filter(function (openingTime) {
            return openingTime.indexOf('thu') > -1;
        }).sort(compareOpeningInfo), roughdata);
        this.friday = toTimings(Object.keys(roughdata.hours).filter(function (openingTime) {
            return openingTime.indexOf('fri') > -1;
        }).sort(compareOpeningInfo), roughdata);
        this.saturday = toTimings(Object.keys(roughdata.hours).filter(function (openingTime) {
            return openingTime.indexOf('sat') > -1;
        }).sort(compareOpeningInfo), roughdata);
        this.sunday = toTimings(Object.keys(roughdata.hours).filter(function (openingTime) {
            return openingTime.indexOf('sun') > -1;
        }).sort(compareOpeningInfo), roughdata);
    };
    return FacebookOpeningInfo;
}(Loadable_1.Loadable));
exports.FacebookOpeningInfo = FacebookOpeningInfo;
function dayToValue(day) {
    if (day === 'mon') {
        return 0;
    }
    else if (day === 'tue') {
        return 1;
    }
    else if (day === 'wed') {
        return 2;
    }
    else if (day === 'thu') {
        return 3;
    }
    else if (day === 'fri') {
        return 4;
    }
    else if (day === 'sat') {
        return 5;
    }
    else if (day === 'sun') {
        return 6;
    }
}
function jsValueToDay(value) {
    if (value === 0) {
        return 'sunday';
    }
    else if (value === 1) {
        return 'monday';
    }
    else if (value === 2) {
        return 'tuesday';
    }
    else if (value === 3) {
        return 'wednesday';
    }
    else if (value === 4) {
        return 'thursday';
    }
    else if (value === 5) {
        return 'friday';
    }
    else if (value === 6) {
        return 'saturday';
    }
}
function jsDayValue(day) {
    return ((dayToValue(day) + 1) % 7);
}
function compareOpeningInfo(a, b) {
    var infoA = a.split('_'), infoB = b.split('_');
    if (parseInt(infoA[1]) < parseInt(infoB[1])) {
        return -1;
    }
    else if (parseInt(infoA[1]) > parseInt(infoB[1])) {
        return 1;
    }
    else {
        if (infoA[2] === 'open') {
            return -1;
        }
        else
            return 1;
    }
}
function toTimings(openingTime, roughData) {
    var timings = [];
    for (var _i = 0, openingTime_1 = openingTime; _i < openingTime_1.length; _i++) {
        var opening = openingTime_1[_i];
        timings.push(roughData.hours[opening]);
    }
    return timings;
}
function liesNowInInterval(start, end) {
    var now = new Date(), startHoursMinutes = start.split(':'), startDate = new Date(), startHour = parseInt(startHoursMinutes[0]), startMinutes = parseInt(startHoursMinutes[1]), endHoursMinutes = end.split(':'), endDate = new Date(), endHour = parseInt(endHoursMinutes[0]), endMinutes = parseInt(endHoursMinutes[1]);
    startDate.setHours(startHour);
    startDate.setMinutes(startMinutes);
    endDate.setHours(endHour);
    endDate.setMinutes(endMinutes);
    return now >= startDate && now < endDate;
}
},{"../Loadable":1,"../util/JSONUtils":10,"./FacebookProxy":7,"./ManualOpeningHours":9}],6:[function(require,module,exports){
"use strict";
var FacebookProxy_1 = require("./FacebookProxy");
var Linkify_1 = require("../util/Linkify");
var FacebookPost = (function () {
    function FacebookPost(info) {
        this.info = info;
    }
    Object.defineProperty(FacebookPost.prototype, "canDisplay", {
        get: function () {
            return !this.info.is_hidden && this.info.is_published && this.info.from && this.info.from.id === FacebookProxy_1.FB_PAGE_ID && !!this.message;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FacebookPost.prototype, "created", {
        get: function () {
            return new Date(this.info.created_time.split('+')[0]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FacebookPost.prototype, "id", {
        get: function () {
            return this.info.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FacebookPost.prototype, "message", {
        get: function () {
            return this.info.message;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FacebookPost.prototype, "picture", {
        get: function () {
            if (this.info.full_picture) {
                var image = document.createElement('img');
                image.src = this.info.full_picture;
                image.className = 'ren-newsfeed-item-img';
                return image;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    FacebookPost.prototype.renderTo = function (parent) {
        if (this.canDisplay) {
            parent.appendChild(this.view);
        }
    };
    Object.defineProperty(FacebookPost.prototype, "view", {
        get: function () {
            var view = document.createElement('div');
            view.className = 'ren-newsfeed-item-container';
            var dateView = this.createDateView();
            view.appendChild(dateView);
            var contentView = this.createContentView();
            view.appendChild(contentView);
            return view;
        },
        enumerable: true,
        configurable: true
    });
    FacebookPost.prototype.createContentView = function () {
        var contentContainer = document.createElement('div');
        contentContainer.className = 'ren-content-item-container';
        var newsFeedContentContainer = document.createElement('div');
        newsFeedContentContainer.className = 'ren-newsfeed-item-content-container';
        if (this.message) {
            var title = document.createElement('h2');
            title.className = 'ren-newsfeed-item-title';
            var firstSentence = this.message.match(firstSentenceRegex) || this.message.match(firstSentenceBeforeNewlineRegex);
            if (firstSentence) {
                title.innerHTML = firstSentence.map(function (s) {
                    return s.replace(/^\s+|\s+$/g, '');
                })[0];
            }
            newsFeedContentContainer.appendChild(title);
        }
        var picture = this.picture;
        if (picture) {
            newsFeedContentContainer.appendChild(picture);
        }
        if (this.message) {
            var message = document.createElement('p');
            message.className = 'ren-newsfeed-item-text';
            message.innerHTML = this.message && Linkify_1.linkify(this.message);
            newsFeedContentContainer.appendChild(message);
        }
        contentContainer.appendChild(newsFeedContentContainer);
        return contentContainer;
    };
    FacebookPost.prototype.createDateView = function () {
        var dateContainer = document.createElement('div');
        dateContainer.className = 'ren-newsfeed-item-date-container';
        var dateDayLabel = document.createElement('h1');
        dateDayLabel.className = 'ren-newsfeed-item-date-day';
        dateDayLabel.innerText = '' + this.created.getDate();
        dateContainer.appendChild(dateDayLabel);
        var dateMonthYearLabel = document.createElement('h6');
        dateMonthYearLabel.className = 'ren-newsfeed-item-date-month-year';
        dateMonthYearLabel.innerText = months[this.created.getMonth()] + ' ' + this.created.getFullYear();
        dateContainer.appendChild(dateMonthYearLabel);
        return dateContainer;
    };
    return FacebookPost;
}());
exports.FacebookPost = FacebookPost;
var months = [
    'Jan', 'Feb', 'Maa', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
];
var firstSentenceRegex = /^.*?[\.!\?](?:\s|$)/g;
var firstSentenceBeforeNewlineRegex = /^.*?[\n](?:\s|$)/g;
},{"../util/Linkify":11,"./FacebookProxy":7}],7:[function(require,module,exports){
"use strict";
var proxyURL = 'https://rensecurityproxy-samgielis.rhcloud.com/';
exports.FB_PAGE_ID = "215470341909937";
var FacebookProxy = (function () {
    function FacebookProxy() {
    }
    FacebookProxy.feed = function (succ, fail) {
        FacebookProxy.get('feed', succ, fail);
    };
    FacebookProxy.openinghours = function (succ, fail) {
        FacebookProxy.get('openinghours', succ, fail);
    };
    FacebookProxy.get = function (url, succ, fail) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('get', proxyURL + url, true);
            xhr.responseType = 'json';
            xhr.onload = function () {
                var status = xhr.status;
                if (status == 200) {
                    succ(xhr.response);
                }
                else if (fail) {
                    fail();
                }
            };
            xhr.onerror = fail;
            xhr.send();
        }
        catch (e) {
            if (fail) {
                fail();
            }
        }
    };
    return FacebookProxy;
}());
exports.FacebookProxy = FacebookProxy;
},{}],8:[function(require,module,exports){
"use strict";
var FacebookProxy_1 = require("./FacebookProxy");
exports.manualFacebookFeed = [
    manualFacebookPostImport('NU bij Ren Sport. De nieuwe Mizuno Wave Ultima 10 – TCS Amsterdam Marathon editie.', '2018/08/17', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/39453905_788052064651759_7870217907072925696_n.jpg?_nc_cat=0&oh=d1ab8ff26008f21e252b76e9ac48eaac&oe=5C062056'),
    manualFacebookPostImport('Beste klanten, maandag 13, dinsdag 14 en woensdag 15 augustus zijn we gesloten. Donderdag zijn we terug open. Geniet van jullie mooi en sportief weekend.🌞🌞🏃‍♂️🏃‍♀️🎾🏊‍♂️🚴‍♂️🚴‍♀️. 😜', '2018/08/11', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/38926265_780068562116776_8787499153425956864_n.jpg?_nc_cat=0&oh=3187f9fc009fec9145c028a6e2bf6567&oe=5C0DB9D9'),
    manualFacebookPostImport('Knap podium Steffan Vanderlinden. Foto van de bosvrienden.', '2018/08/04', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/38528647_770318696425096_3281332864997654528_n.png?_nc_cat=0&oh=f4c2e87d86668e5de8a3dc6228f239d9&oe=5BFA69B2'),
    manualFacebookPostImport('Dikke proficiat voor onze rode duivels van het Ren Sport team.', '2018/07/07', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36770646_737851716338461_2116977251210756096_n.jpg?_nc_cat=0&oh=7af8445368da3aaf8bf3cee8a34ab006&oe=5BDC71BF'),
    manualFacebookPostImport('Heel warm weer, veel drinken!!!\n' +
        'Wat drinken voor en na een training/ wedstrijd?\n' +
        'NIEUW bij Ren Sport is OVERSTIMS.\n' +
        'Een ideaal voordeelpakket voor de marathonlopers, met extra een band voor u nummer en je energiegels voor onderweg.', '2018/07/04', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36682613_734800719976894_497555906653847552_n.jpg?_nc_cat=0&oh=e87ecac5d3e3fb95712ec25a9ac4fbb8&oe=5BD363AE'),
    manualFacebookPostImport('Messalina Pieroni, mooi artikel en mooi foto’s.', '2018/07/03', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36531094_733435116780121_1939821811734675456_n.jpg?_nc_cat=0&oh=6c7b5314822dc943f8b86f67cf4877e7&oe=5BDE4FA3')
];
function manualFacebookPostImport(message, date, picture) {
    return {
        created_time: date,
        full_picture: picture,
        id: 'id',
        is_hidden: false,
        is_published: true,
        message: message,
        from: {
            name: '',
            id: FacebookProxy_1.FB_PAGE_ID,
            error: ''
        },
        error: ''
    };
}
},{"./FacebookProxy":7}],9:[function(require,module,exports){
"use strict";
exports.STANDARD_OPENING_HOURS = {
    hours: {
        "mon_1": "09:30",
        "mon_2": "12:30",
        "mon_3": "13:30",
        "mon_4": "18:30",
        "wed_1": "09:30",
        "wed_2": "12:30",
        "wed_3": "13:30",
        "wed_4": "18:30",
        "thu_1": "09:30",
        "thu_2": "12:30",
        "thu_3": "13:30",
        "thu_4": "18:30",
        "fri_1": "09:30",
        "fri_2": "12:30",
        "fri_3": "13:30",
        "fri_4": "19:00",
        "sat_1": "09:30",
        "sat_2": "12:30",
        "sat_3": "13:30",
        "sat_4": "18:30"
    }
};
exports.EXCEPTIONAL_OPENING_HOURS = {
    hours: {
        "thu_1": "09:30",
        "thu_2": "12:30",
        "thu_3": "13:30",
        "thu_4": "18:30",
        "fri_1": "09:30",
        "fri_2": "12:30",
        "fri_3": "13:30",
        "fri_4": "19:00",
        "sat_1": "09:30",
        "sat_2": "12:30",
        "sat_3": "13:30",
        "sat_4": "18:30"
    }
};
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
"use strict";
function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;
    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
    return replacedText;
}
exports.linkify = linkify;
},{}],12:[function(require,module,exports){
"use strict";
var days = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];
var daysTranslation = {
    'monday': 'M.',
    'tuesday': 'D.',
    'wednesday': 'W.',
    'thursday': 'D.',
    'friday': 'V.',
    'saturday': 'Z.',
    'sunday': 'Z.'
};
function renderOpeningInfo(openingInfo, root) {
    if (!root) {
        return;
    }
    var type = root.getAttribute('data-viewtype');
    switch (type) {
        case 'modest':
            renderModestOpeningInfoView(openingInfo, root);
    }
    /*let root : HTMLElement = document.createElement('div');
    for (let day of days) {
        let dayview = dayView(day, (<any>openingInfo)[day]);
        root.appendChild(dayview);
    }
    root.appendChild(currentlyOpenView(openingInfo.isCurrentlyOpen));
    return root;*/
}
exports.renderOpeningInfo = renderOpeningInfo;
function renderModestOpeningInfoView(openingInfo, root) {
    root.appendChild(modestWeekView(openingInfo));
    root.appendChild(modestIsOpenIndicator(openingInfo));
}
function modestIsOpenIndicator(openingInfo) {
    var container = document.createElement('div');
    container.className = 'ren-openingsuren-modest-indicator';
    var indicatorText;
    indicatorText = document.createElement('span');
    indicatorText.className = 'ren-openingsuren-modest-indicator-label';
    var contactOptions = [];
    contactOptions.push(modestActNowLink('mailto:info@rensport.be', 'fa-envelope'));
    switch (openingInfo.isCurrentlyOpen) {
        case true:
            container.className += ' ren-openingsuren-open';
            indicatorText.innerText = 'Nu open!';
            contactOptions.push(modestActNowLink('tel:+3213667460', 'fa-phone'));
            break;
        case false:
            container.className += ' ren-openingsuren-closed';
            indicatorText.innerText = 'Gesloten';
            break;
    }
    container.appendChild(indicatorText);
    for (var _i = 0, contactOptions_1 = contactOptions; _i < contactOptions_1.length; _i++) {
        var contactOption = contactOptions_1[_i];
        container.appendChild(contactOption);
    }
    return container;
}
function modestWeekView(openingInfo) {
    var table = document.createElement('table');
    if (openingInfo.isCurrentlyOpen) {
        table.className = 'ren-openingsuren-open';
    }
    else {
        table.className = 'ren-openingsuren-closed';
    }
    for (var _i = 0, days_1 = days; _i < days_1.length; _i++) {
        var day = days_1[_i];
        var dayview = modestDayView(day, openingInfo[day]);
        table.appendChild(dayview);
    }
    return table;
}
function modestDayView(day, hours) {
    var tableRow = document.createElement('tr');
    if (day === days[new Date().getDay() - 1]) {
        tableRow.className = 'ren-openingsuren-currentday';
    }
    var dayview = document.createElement('th'), hourview = document.createElement('td');
    dayview.innerText = daysTranslation[day];
    hourview.innerText = modestHourView(hours);
    tableRow.appendChild(dayview);
    tableRow.appendChild(hourview);
    return tableRow;
}
function modestHourView(hours) {
    var hourview = '';
    for (var i = 0; i < hours.length; i += 2) {
        hourview += hours[i] + ' - ' + hours[i + 1];
        if (i + 1 != hours.length - 1) {
            hourview += ', ';
        }
    }
    return hourview || 'Gesloten';
}
function modestActNowLink(href, iconName) {
    var a = document.createElement('a');
    a.className = 'ren-openingsuren-indicator-cta-link';
    a.href = href;
    var icon = document.createElement('i');
    icon.className = 'fa ' + iconName + ' fa-lg';
    a.appendChild(icon);
    return a;
}
},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTG9hZGFibGUudHMiLCJzcmMvUmVuLnRzIiwic3JjL1Jlbkdsb2JhbC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va1Bvc3QudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rUHJveHkudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL01hbnVhbEZlZWRib29rRmVlZC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvTWFudWFsT3BlbmluZ0hvdXJzLnRzIiwic3JjL3V0aWwvSlNPTlV0aWxzLnRzIiwic3JjL3V0aWwvTGlua2lmeS50cyIsInNyYy92aWV3L09wZW5pbmdJbmZvVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtJQU9JO1FBTFEsY0FBUyxHQUFhLEtBQUssQ0FBQztRQUM1QixnQkFBVyxHQUFhLEtBQUssQ0FBQztRQUM5QiwyQkFBc0IsR0FBbUIsRUFBRSxDQUFDO1FBQzVDLHdCQUFtQixHQUFtQixFQUFFLENBQUM7UUFHN0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxzQkFBVyw4QkFBUTthQUFuQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsbUNBQWE7YUFBeEI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQTtRQUMzQixDQUFDOzs7T0FBQTtJQUVNLDRCQUFTLEdBQWhCLFVBQWtCLG1CQUErQixFQUFFLGdCQUE2QjtRQUM1RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNoQixtQkFBbUIsRUFBRSxDQUFDO1FB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QyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7QUFDTCxDQUFDO0FBRUQsc0JBQXVCLEtBQWM7SUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFF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QUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixRQUFRLElBQUksSUFBSSxDQUFDO1FBQ3JCLENBQUM7SUFDTCxDQUFDO0lBQ0QsTUFBTSxDQUFDLFFBQVEsSUFBSSxVQUFVLENBQUM7QUFDbEMsQ0FBQztBQUVELDBCQUEyQixJQUFhLEVBQUUsUUFBaUI7SUFFdkQsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUMsU0FBUyxHQUFHLHFDQUFxQyxDQUFDO0lBQ3BELENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBRWQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2QyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBRTdDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFcEIsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNiLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJleHBvcnQgYWJzdHJhY3QgY2xhc3MgTG9hZGFibGUge1xyXG5cclxuICAgIHByaXZhdGUgX2lzTG9hZGVkIDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfbG9hZEZhaWxlZCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX3dhaXRpbmdGb3JMb2FkU3VjY2VzcyA6ICgoKSA9PiBhbnkpW10gPSBbXTtcclxuICAgIHByaXZhdGUgX3dhaXRpbmdGb3JMb2FkRmFpbCA6ICgoKSA9PiBhbnkpW10gPSBbXTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHRoaXMuZG9Mb2FkKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXQgaXNMb2FkZWQgKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNMb2FkZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBoYXNMb2FkRmFpbGVkICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvYWRGYWlsZWRcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWZ0ZXJMb2FkIChsb2FkU3VjY2Vzc0NhbGxiYWNrIDogKCkgPT4gYW55LCBsb2FkRmFpbENhbGxiYWNrPyA6ICgpID0+IGFueSkgOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRlZCkge1xyXG4gICAgICAgICAgICBsb2FkU3VjY2Vzc0NhbGxiYWNrKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0xvYWRGYWlsZWQpIHtcclxuICAgICAgICAgICAgaWYgKGxvYWRGYWlsQ2FsbGJhY2spe1xyXG4gICAgICAgICAgICAgICAgbG9hZEZhaWxDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzLnB1c2gobG9hZFN1Y2Nlc3NDYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGlmIChsb2FkRmFpbENhbGxiYWNrKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkRmFpbC5wdXNoKGxvYWRGYWlsQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgbG9hZFN1Y2Nlc3MgKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2VzcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsb2FkRmFpbGVkIChlcnJvciA6IHN0cmluZykgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9sb2FkRmFpbGVkID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiB0aGlzLl93YWl0aW5nRm9yTG9hZEZhaWwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRGYWlsID0gW107XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMb2FkaW5nIGZhaWxlZCA6ICcgKyBlcnJvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGRvTG9hZCAoKSA6IHZvaWQ7XHJcbn0iLCJpbXBvcnQge0ZhY2Vib29rT3BlbmluZ0luZm99IGZyb20gXCIuL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvXCI7XHJcbmltcG9ydCB7RmFjZWJvb2tGZWVkfSBmcm9tIFwiLi9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkXCI7XHJcbmltcG9ydCB7UmVuU3BvcnRDb25maWd9IGZyb20gXCIuL1JlblNwb3J0Q29uZmlnXCI7XHJcbmltcG9ydCB7cmVuZGVyT3BlbmluZ0luZm99IGZyb20gXCIuL3ZpZXcvT3BlbmluZ0luZm9WaWV3XCI7XHJcblxyXG5kZWNsYXJlIHZhciAkOiBhbnk7XHJcblxyXG5leHBvcnQgY2xhc3MgUmVuIHtcclxuXHJcbiAgICBwcml2YXRlIF9vcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm87XHJcbiAgICBwcml2YXRlIF9mZWVkIDogRmFjZWJvb2tGZWVkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICBsZXQgY29uZmlnIDogUmVuU3BvcnRDb25maWcgPSAoPGFueT53aW5kb3cpLlJlblNwb3J0Q29uZmlnO1xyXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmxvYWRIZWFkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZEhlYWRlcihjb25maWcuY29udGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9sb2FkRm9vdGVyKCk7XHJcblxyXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmxvYWRPcGVuaW5nSG91cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5fb3BlbmluZ0luZm8gPSBuZXcgRmFjZWJvb2tPcGVuaW5nSW5mbygpO1xyXG4gICAgICAgICAgICB0aGlzLl9vcGVuaW5nSW5mby5hZnRlckxvYWQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyT3BlbmluZ0luZm8odGhpcy5fb3BlbmluZ0luZm8sIDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVuLW9wZW5pbmdzdXJlbi1ob29rJykpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmxvYWROZXdzRmVlZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9mZWVkID0gbmV3IEZhY2Vib29rRmVlZCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9mZWVkLmFmdGVyTG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mZWVkLnJlbmRlclRvKDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVuLWhvbWVwYWdlLW5ld3NmZWVkJykpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBmZWVkICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmVlZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9sb2FkSGVhZGVyIChjb250ZXh0IDogc3RyaW5nKSA6IHZvaWQge1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGhvb2sgOiBhbnkgPSAkKCBcIiNyZW4taGVhZGVyXCIgKTtcclxuICAgICAgICAgICAgaG9vay5sb2FkKCBcIi9jb21wb25lbnRzL2hlYWRlci5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRleHROYXZiYXJFbGVtZW50IDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlbZGF0YS1jb250ZXh0LScgKyBjb250ZXh0LnRvTG93ZXJDYXNlKCkgKyAnXScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXh0TmF2YmFyRWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TmF2YmFyRWxlbWVudC5jbGFzc05hbWUgKz0gJ2FjdGl2ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbG9hZEZvb3RlciAoKSA6IHZvaWQge1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGhvb2sgOiBhbnkgPSAkKCBcIiNyZW4tZm9vdGVyXCIgKTtcclxuICAgICAgICAgICAgaG9vay5sb2FkKCBcIi9jb21wb25lbnRzL2Zvb3Rlci5odG1sXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgb3BlbmluZ0luZm8gKCkgOiBGYWNlYm9va09wZW5pbmdJbmZvIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3BlbmluZ0luZm87XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN1YnNjcmliZVRvTmV3c2xldHRlciAoKSB7XHJcbiAgICAgICAgbGV0IGlucHV0IDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZW4tbmlldXdzYnJpZWYtaW5wdXQtZmllbGQnKTtcclxuICAgICAgICBsZXQgaGlkZGVuSW5wdXQgOiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3ZyLWhpZGRlbi1pbnB1dC1maWVsZCcpLFxyXG4gICAgICAgICAgICBoaWRkZW5TdWJtaXQgOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdnItaGlkZGVuLXN1Ym1pdC1idG4nKTtcclxuXHJcbiAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0LnZhbHVlICYmIGhpZGRlbklucHV0ICYmIGhpZGRlblN1Ym1pdCkge1xyXG4gICAgICAgICAgICBoaWRkZW5JbnB1dC52YWx1ZSA9IGlucHV0LnZhbHVlO1xyXG4gICAgICAgICAgICBoaWRkZW5TdWJtaXQuY2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge1Jlbn0gZnJvbSBcIi4vUmVuXCI7XHJcblxyXG4oPGFueT53aW5kb3cpLlJlblNwb3J0ID0gbmV3IFJlbigpOyIsImltcG9ydCB7RkJGZWVkUmVzcG9uc2VPYmplY3QsIEZCUG9zdFJlc3BvbnNlfSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0xvYWRhYmxlfSBmcm9tIFwiLi4vTG9hZGFibGVcIjtcclxuaW1wb3J0IHtGYWNlYm9va1Byb3h5fSBmcm9tIFwiLi9GYWNlYm9va1Byb3h5XCI7XHJcbmltcG9ydCB7RmFjZWJvb2tQb3N0fSBmcm9tIFwiLi9GYWNlYm9va1Bvc3RcIjtcclxuaW1wb3J0IHtwYXJzZUpTT059IGZyb20gXCIuLi91dGlsL0pTT05VdGlsc1wiO1xyXG5pbXBvcnQge21hbnVhbEZhY2Vib29rRmVlZH0gZnJvbSBcIi4vTWFudWFsRmVlZGJvb2tGZWVkXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRmFjZWJvb2tGZWVkIGV4dGVuZHMgTG9hZGFibGUge1xyXG5cclxuICAgIHByaXZhdGUgX3Bvc3RzIDogQXJyYXk8RmFjZWJvb2tQb3N0PiA9IFtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcG9zdHMgKCkgOiBBcnJheTxGYWNlYm9va1Bvc3Q+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcG9zdHM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FsbGVkIGJ5IHN1cGVyKCk7XHJcbiAgICBwcm90ZWN0ZWQgZG9Mb2FkICgpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5mZWVkKChyZXMgOiBGQkZlZWRSZXNwb25zZU9iamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJlcy5lcnJvciAmJiByZXMuZmVlZCAmJiByZXMuZmVlZC5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFBvc3RzRnJvbVJlc3BvbnNlKHJlcy5mZWVkLmRhdGEpXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXJlcy5lcnJvciAmJiBwYXJzZUpTT04oPGFueT5yZXMpICYmIHBhcnNlSlNPTig8YW55PnJlcykuZmVlZCAmJiBwYXJzZUpTT04oPGFueT5yZXMpLmZlZWQuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRQb3N0c0Zyb21SZXNwb25zZShwYXJzZUpTT04oPGFueT5yZXMuZmVlZC5kYXRhKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFBvc3RzRnJvbVJlc3BvbnNlKG1hbnVhbEZhY2Vib29rRmVlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkUG9zdHNGcm9tUmVzcG9uc2UobWFudWFsRmFjZWJvb2tGZWVkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkZFBvc3RzRnJvbVJlc3BvbnNlIChyZXMgOiBGQlBvc3RSZXNwb25zZVtdKSA6IHZvaWQge1xyXG4gICAgICAgIGZvciAobGV0IHBvc3Qgb2YgcmVzKXtcclxuICAgICAgICAgICAgdGhpcy5fcG9zdHMucHVzaChuZXcgRmFjZWJvb2tQb3N0KHBvc3QpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sb2FkU3VjY2VzcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdmlldyAoKSA6IEhUTUxFbGVtZW50W10ge1xyXG4gICAgICAgIGxldCB2aWV3IDogSFRNTEVsZW1lbnRbXSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMCwgZGlzcGxheWluZ1Bvc3RzID0gMDsgZGlzcGxheWluZ1Bvc3RzIDwgTWF0aC5taW4odGhpcy5wb3N0cy5sZW5ndGgsIDUpOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHBvc3QgPSB0aGlzLnBvc3RzW2ldO1xyXG4gICAgICAgICAgICBpZiAocG9zdC5jYW5EaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3LnB1c2gocG9zdC52aWV3KTtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlpbmdQb3N0cysrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXJUbyAocGFyZW50IDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBmb3IgKGxldCBwb3N0VmlldyBvZiB0aGlzLnZpZXcpIHtcclxuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHBvc3RWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0ZCSG91cnNSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7RmFjZWJvb2tQcm94eX0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5pbXBvcnQge3BhcnNlSlNPTn0gZnJvbSBcIi4uL3V0aWwvSlNPTlV0aWxzXCI7XHJcbmltcG9ydCB7U1RBTkRBUkRfT1BFTklOR19IT1VSU30gZnJvbSBcIi4vTWFudWFsT3BlbmluZ0hvdXJzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRmFjZWJvb2tPcGVuaW5nSW5mbyBleHRlbmRzIExvYWRhYmxlIHtcclxuXHJcbiAgICBwdWJsaWMgbW9uZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyB0dWVzZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyB3ZWRuZXNkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHRodXJzZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyBmcmlkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHNhdHVyZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyBzdW5kYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNDdXJyZW50bHlPcGVuICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG5vdyA6IERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICBkYXkgPSBqc1ZhbHVlVG9EYXkobm93LmdldERheSgpKSxcclxuICAgICAgICAgICAgaW5mb0ZvckRheSA9ICg8YW55PnRoaXMpW2RheV07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5mb0ZvckRheS5sZW5ndGg7IGkrPTIpIHtcclxuICAgICAgICAgICAgaWYgKGxpZXNOb3dJbkludGVydmFsKGluZm9Gb3JEYXlbaV0sIGluZm9Gb3JEYXlbaSsxXSkpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGxlZCBieSBzdXBlcigpO1xyXG4gICAgcHJvdGVjdGVkIGRvTG9hZCAoKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkub3BlbmluZ2hvdXJzKChyb3VnaGRhdGEgOiBGQkhvdXJzUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyb3VnaGRhdGEuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VEYXRhKHJvdWdoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRTdWNjZXNzKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRGYWlsZWQocm91Z2hkYXRhLmVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wYXJzZURhdGEoPGFueT5TVEFOREFSRF9PUEVOSU5HX0hPVVJTKTtcclxuICAgICAgICAgICAgdGhpcy5sb2FkU3VjY2VzcygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGFyc2VEYXRhIChyb3VnaGRhdGEgOiBGQkhvdXJzUmVzcG9uc2UpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiByb3VnaGRhdGEgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJvdWdoZGF0YSA9IHBhcnNlSlNPTig8YW55PnJvdWdoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubW9uZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ21vbicpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnR1ZXNkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZigndHVlJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMud2VkbmVzZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3dlZCcpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnRodXJzZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3RodScpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLmZyaWRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdmcmknKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5zYXR1cmRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdzYXQnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5zdW5kYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignc3VuJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkYXlUb1ZhbHVlIChkYXkgOiBzdHJpbmcpIDogbnVtYmVye1xyXG4gICAgaWYgKGRheSA9PT0nbW9uJykge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3R1ZScpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSd3ZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuIDI7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0ndGh1Jykge1xyXG4gICAgICAgIHJldHVybiAzO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J2ZyaScpIHtcclxuICAgICAgICByZXR1cm4gNDtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSdzYXQnKSB7XHJcbiAgICAgICAgcmV0dXJuIDU7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nc3VuJykge1xyXG4gICAgICAgIHJldHVybiA2O1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBqc1ZhbHVlVG9EYXkgKHZhbHVlIDogbnVtYmVyKSA6IHN0cmluZ3tcclxuICAgIGlmICh2YWx1ZSA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiAnc3VuZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDEpIHtcclxuICAgICAgICByZXR1cm4gJ21vbmRheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAyKSB7XHJcbiAgICAgICAgcmV0dXJuICd0dWVzZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDMpIHtcclxuICAgICAgICByZXR1cm4gJ3dlZG5lc2RheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSA0KSB7XHJcbiAgICAgICAgcmV0dXJuICd0aHVyc2RheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSA1KSB7XHJcbiAgICAgICAgcmV0dXJuICdmcmlkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gNikge1xyXG4gICAgICAgIHJldHVybiAnc2F0dXJkYXknO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBqc0RheVZhbHVlIChkYXkgOiBzdHJpbmcpIDogbnVtYmVyIHtcclxuICAgIHJldHVybiAoKGRheVRvVmFsdWUoZGF5KSArIDEpICUgNyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbXBhcmVPcGVuaW5nSW5mbyAoYSA6IHN0cmluZywgYiA6IHN0cmluZykge1xyXG4gICAgbGV0IGluZm9BID0gYS5zcGxpdCgnXycpLFxyXG4gICAgICAgIGluZm9CID0gYi5zcGxpdCgnXycpO1xyXG5cclxuICAgIGlmIChwYXJzZUludChpbmZvQVsxXSkgPCBwYXJzZUludChpbmZvQlsxXSkpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9IGVsc2UgaWYgKHBhcnNlSW50KGluZm9BWzFdKSA+IHBhcnNlSW50KGluZm9CWzFdKSl7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChpbmZvQVsyXSA9PT0gJ29wZW4nKXtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH0gZWxzZSByZXR1cm4gMTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdG9UaW1pbmdzIChvcGVuaW5nVGltZSA6IHN0cmluZ1tdLCByb3VnaERhdGEgOiBGQkhvdXJzUmVzcG9uc2UpIDogc3RyaW5nW10ge1xyXG4gICAgbGV0IHRpbWluZ3MgOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IG9wZW5pbmcgb2Ygb3BlbmluZ1RpbWUpIHtcclxuICAgICAgICB0aW1pbmdzLnB1c2gocm91Z2hEYXRhLmhvdXJzW29wZW5pbmddKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aW1pbmdzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsaWVzTm93SW5JbnRlcnZhbCAoc3RhcnQgOiBzdHJpbmcsIGVuZCA6IHN0cmluZykgOiBib29sZWFuIHtcclxuXHJcbiAgICBsZXQgbm93IDogRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgc3RhcnRIb3Vyc01pbnV0ZXMgID0gc3RhcnQuc3BsaXQoJzonKSxcclxuICAgICAgICBzdGFydERhdGUgOiBEYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICBzdGFydEhvdXIgOiBudW1iZXIgPSBwYXJzZUludChzdGFydEhvdXJzTWludXRlc1swXSksXHJcbiAgICAgICAgc3RhcnRNaW51dGVzIDogbnVtYmVyID0gcGFyc2VJbnQoc3RhcnRIb3Vyc01pbnV0ZXNbMV0pLFxyXG4gICAgICAgIGVuZEhvdXJzTWludXRlcyAgPSBlbmQuc3BsaXQoJzonKSxcclxuICAgICAgICBlbmREYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICBlbmRIb3VyIDogbnVtYmVyID0gcGFyc2VJbnQoZW5kSG91cnNNaW51dGVzWzBdKSxcclxuICAgICAgICBlbmRNaW51dGVzIDogbnVtYmVyID0gcGFyc2VJbnQoZW5kSG91cnNNaW51dGVzWzFdKTtcclxuXHJcbiAgICBzdGFydERhdGUuc2V0SG91cnMoc3RhcnRIb3VyKTtcclxuICAgIHN0YXJ0RGF0ZS5zZXRNaW51dGVzKHN0YXJ0TWludXRlcyk7XHJcbiAgICBlbmREYXRlLnNldEhvdXJzKGVuZEhvdXIpO1xyXG4gICAgZW5kRGF0ZS5zZXRNaW51dGVzKGVuZE1pbnV0ZXMpO1xyXG5cclxuICAgIHJldHVybiBub3cgPj0gc3RhcnREYXRlICYmIG5vdyA8IGVuZERhdGU7XHJcbn0iLCJpbXBvcnQge0ZCUG9zdFJlc3BvbnNlfSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0ltYWdlVGFnfSBmcm9tIFwiLi4vbGlicmFyeS9TY3JpcHRUYWdcIjtcclxuaW1wb3J0IHtGQl9QQUdFX0lEfSBmcm9tIFwiLi9GYWNlYm9va1Byb3h5XCI7XHJcbmltcG9ydCB7bGlua2lmeX0gZnJvbSBcIi4uL3V0aWwvTGlua2lmeVwiO1xyXG5leHBvcnQgY2xhc3MgRmFjZWJvb2tQb3N0IHtcclxuXHJcbiAgICBwcml2YXRlIGluZm8gOiBGQlBvc3RSZXNwb25zZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoaW5mbyA6IEZCUG9zdFJlc3BvbnNlKSB7XHJcbiAgICAgICAgdGhpcy5pbmZvID0gaW5mbztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNhbkRpc3BsYXkgKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuaW5mby5pc19oaWRkZW4gJiYgdGhpcy5pbmZvLmlzX3B1Ymxpc2hlZCAmJiB0aGlzLmluZm8uZnJvbSAmJiB0aGlzLmluZm8uZnJvbS5pZCA9PT0gRkJfUEFHRV9JRCAmJiAhIXRoaXMubWVzc2FnZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNyZWF0ZWQgKCkgOiBEYXRlIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5pbmZvLmNyZWF0ZWRfdGltZS5zcGxpdCgnKycpWzBdKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlkICgpIDogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmZvLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbWVzc2FnZSAoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5mby5tZXNzYWdlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IHBpY3R1cmUgKCkgOiBJbWFnZVRhZyB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5mby5mdWxsX3BpY3R1cmUpIHtcclxuICAgICAgICAgICAgbGV0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IHRoaXMuaW5mby5mdWxsX3BpY3R1cmU7XHJcbiAgICAgICAgICAgIGltYWdlLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1pbWcnO1xyXG4gICAgICAgICAgICByZXR1cm4gaW1hZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXJUbyAocGFyZW50IDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5jYW5EaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLnZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHZpZXcgKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB2aWV3LmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1jb250YWluZXInO1xyXG5cclxuICAgICAgICBsZXQgZGF0ZVZpZXcgPSB0aGlzLmNyZWF0ZURhdGVWaWV3KCk7XHJcbiAgICAgICAgdmlldy5hcHBlbmRDaGlsZChkYXRlVmlldyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGNvbnRlbnRWaWV3ID0gdGhpcy5jcmVhdGVDb250ZW50VmlldygpO1xyXG4gICAgICAgIHZpZXcuYXBwZW5kQ2hpbGQoY29udGVudFZpZXcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlQ29udGVudFZpZXcgKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IGNvbnRlbnRDb250YWluZXIgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGNvbnRlbnRDb250YWluZXIuY2xhc3NOYW1lID0gJ3Jlbi1jb250ZW50LWl0ZW0tY29udGFpbmVyJztcclxuXHJcbiAgICAgICAgbGV0IG5ld3NGZWVkQ29udGVudENvbnRhaW5lciA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgbmV3c0ZlZWRDb250ZW50Q29udGFpbmVyLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1jb250ZW50LWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgbGV0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcclxuICAgICAgICAgICAgdGl0bGUuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLXRpdGxlJztcclxuXHJcbiAgICAgICAgICAgIGxldCBmaXJzdFNlbnRlbmNlID0gdGhpcy5tZXNzYWdlLm1hdGNoKGZpcnN0U2VudGVuY2VSZWdleCkgfHwgdGhpcy5tZXNzYWdlLm1hdGNoKGZpcnN0U2VudGVuY2VCZWZvcmVOZXdsaW5lUmVnZXgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZpcnN0U2VudGVuY2UpIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlLmlubmVySFRNTCA9IGZpcnN0U2VudGVuY2UubWFwKGZ1bmN0aW9uKHMpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzLnJlcGxhY2UoL15cXHMrfFxccyskL2csJycpO1xyXG4gICAgICAgICAgICAgICAgfSlbMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3c0ZlZWRDb250ZW50Q29udGFpbmVyLmFwcGVuZENoaWxkKHRpdGxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHBpY3R1cmUgPSB0aGlzLnBpY3R1cmU7XHJcbiAgICAgICAgaWYgKHBpY3R1cmUpIHtcclxuICAgICAgICAgICAgbmV3c0ZlZWRDb250ZW50Q29udGFpbmVyLmFwcGVuZENoaWxkKHBpY3R1cmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubWVzc2FnZSkge1xyXG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgbWVzc2FnZS5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tdGV4dCc7XHJcbiAgICAgICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5tZXNzYWdlICYmIGxpbmtpZnkodGhpcy5tZXNzYWdlKTtcclxuICAgICAgICAgICAgbmV3c0ZlZWRDb250ZW50Q29udGFpbmVyLmFwcGVuZENoaWxkKG1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGNvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQobmV3c0ZlZWRDb250ZW50Q29udGFpbmVyKTtcclxuICAgICAgICByZXR1cm4gY29udGVudENvbnRhaW5lcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNyZWF0ZURhdGVWaWV3ICgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCBkYXRlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgZGF0ZUNvbnRhaW5lci5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tZGF0ZS1jb250YWluZXInO1xyXG5cclxuICAgICAgICBsZXQgZGF0ZURheUxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDEnKTtcclxuICAgICAgICBkYXRlRGF5TGFiZWwuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWRhdGUtZGF5JztcclxuICAgICAgICBkYXRlRGF5TGFiZWwuaW5uZXJUZXh0ID0gJycrdGhpcy5jcmVhdGVkLmdldERhdGUoKTtcclxuICAgICAgICBkYXRlQ29udGFpbmVyLmFwcGVuZENoaWxkKGRhdGVEYXlMYWJlbCk7XHJcblxyXG4gICAgICAgIGxldCBkYXRlTW9udGhZZWFyTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNicpO1xyXG4gICAgICAgIGRhdGVNb250aFllYXJMYWJlbC5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tZGF0ZS1tb250aC15ZWFyJztcclxuICAgICAgICBkYXRlTW9udGhZZWFyTGFiZWwuaW5uZXJUZXh0ID0gbW9udGhzW3RoaXMuY3JlYXRlZC5nZXRNb250aCgpXSArICcgJyArIHRoaXMuY3JlYXRlZC5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgIGRhdGVDb250YWluZXIuYXBwZW5kQ2hpbGQoZGF0ZU1vbnRoWWVhckxhYmVsKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRhdGVDb250YWluZXI7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IG1vbnRocyA6IHN0cmluZ1tdID0gW1xyXG4gICAgJ0phbicsICdGZWInLCAnTWFhJywgJ0FwcicsICdNZWknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09rdCcsICdOb3YnLCAnRGVjJ1xyXG5dO1xyXG5cclxuY29uc3QgZmlyc3RTZW50ZW5jZVJlZ2V4IDogUmVnRXhwID0gL14uKj9bXFwuIVxcP10oPzpcXHN8JCkvZztcclxuY29uc3QgZmlyc3RTZW50ZW5jZUJlZm9yZU5ld2xpbmVSZWdleCA6IFJlZ0V4cCA9IC9eLio/W1xcbl0oPzpcXHN8JCkvZzsiLCJpbXBvcnQge0ZCUmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7TG9hZGFibGV9IGZyb20gXCIuLi9Mb2FkYWJsZVwiO1xyXG5pbXBvcnQge1NjcmlwdFRhZ30gZnJvbSBcIi4uL2xpYnJhcnkvU2NyaXB0VGFnXCI7XHJcblxyXG5jb25zdCBwcm94eVVSTCA9ICdodHRwczovL3JlbnNlY3VyaXR5cHJveHktc2FtZ2llbGlzLnJoY2xvdWQuY29tLyc7XHJcbmV4cG9ydCBjb25zdCBGQl9QQUdFX0lEIDogc3RyaW5nID0gXCIyMTU0NzAzNDE5MDk5MzdcIjtcclxuXHJcbmludGVyZmFjZSBJRmFjZWJvb2tTREsge1xyXG4gICAgaW5pdCA6IGFueTtcclxuICAgIGFwaSAoZ3JhcGhwYXRoIDogc3RyaW5nLCBjYWxsYmFjayA6IChyZXNwb25zZSA6IEZCUmVzcG9uc2UpID0+IGFueSkgOiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRmFjZWJvb2tQcm94eSB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBmZWVkICAoc3VjYyA6IChpbmZvIDogRkJSZXNwb25zZSkgPT4gdm9pZCwgZmFpbD8gOiAoKSA9PiB2b2lkKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkuZ2V0KCdmZWVkJywgc3VjYywgZmFpbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBvcGVuaW5naG91cnMgIChzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5nZXQoJ29wZW5pbmdob3VycycsIHN1Y2MsIGZhaWwpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXQgKHVybCA6IHN0cmluZywgc3VjYyA6IChpbmZvIDogRkJSZXNwb25zZSkgPT4gdm9pZCwgZmFpbD8gOiAoKSA9PiB2b2lkKSA6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgeGhyLm9wZW4oJ2dldCcsIHByb3h5VVJMICsgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcclxuICAgICAgICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXR1cyA9IHhoci5zdGF0dXM7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN1Y2MoeGhyLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihmYWlsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFpbCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB4aHIub25lcnJvciA9IGZhaWw7XHJcbiAgICAgICAgICAgIHhoci5zZW5kKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBpZihmYWlsKSB7XHJcbiAgICAgICAgICAgICAgICBmYWlsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0ZCUG9zdFJlc3BvbnNlfSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0ZCX1BBR0VfSUR9IGZyb20gXCIuL0ZhY2Vib29rUHJveHlcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBtYW51YWxGYWNlYm9va0ZlZWQ6IEZCUG9zdFJlc3BvbnNlW10gPSBbXHJcbiAgICBtYW51YWxGYWNlYm9va1Bvc3RJbXBvcnQoXHJcbiAgICAgICAgJ05VIGJpaiBSZW4gU3BvcnQuIERlIG5pZXV3ZSBNaXp1bm8gV2F2ZSBVbHRpbWEgMTAg4oCTIFRDUyBBbXN0ZXJkYW0gTWFyYXRob24gZWRpdGllLicsXHJcbiAgICAgICAgJzIwMTgvMDgvMTcnLFxyXG4gICAgICAgICdodHRwczovL3Njb250ZW50LWJydTItMS54eC5mYmNkbi5uZXQvdi90MS4wLTkvMzk0NTM5MDVfNzg4MDUyMDY0NjUxNzU5Xzc4NzAyMTc5MDcwNzI5MjU2OTZfbi5qcGc/X25jX2NhdD0wJm9oPWQxYWI4ZmYyNjAwOGYyMWUyNTJiNzZlOWFjNDhlYWFjJm9lPTVDMDYyMDU2J1xyXG4gICAgKSxcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnQmVzdGUga2xhbnRlbiwgbWFhbmRhZyAxMywgZGluc2RhZyAxNCBlbiB3b2Vuc2RhZyAxNSBhdWd1c3R1cyB6aWpuIHdlIGdlc2xvdGVuLiBEb25kZXJkYWcgemlqbiB3ZSB0ZXJ1ZyBvcGVuLiBHZW5pZXQgdmFuIGp1bGxpZSBtb29pIGVuIHNwb3J0aWVmIHdlZWtlbmQu77+977+977+977+977+977+94oCN4pmC77iP77+977+94oCN4pmA77iP77+977+977+977+94oCN4pmC77iP77+977+94oCN4pmC77iP77+977+94oCN4pmA77iPLiDvv73vv70nLFxyXG4gICAgICAgICcyMDE4LzA4LzExJyxcclxuICAgICAgICAnaHR0cHM6Ly9zY29udGVudC1icnUyLTEueHguZmJjZG4ubmV0L3YvdDEuMC05LzM4OTI2MjY1Xzc4MDA2ODU2MjExNjc3Nl84Nzg3NDk5MTUzNDI1OTU2ODY0X24uanBnP19uY19jYXQ9MCZvaD0zMTg3ZjlmYzAwOWZlYzkxNDVjMDI4YTZlMmJmNjU2NyZvZT01QzBEQjlEOSdcclxuICAgICksXHJcbiAgICBtYW51YWxGYWNlYm9va1Bvc3RJbXBvcnQoXHJcbiAgICAgICAgJ0tuYXAgcG9kaXVtIFN0ZWZmYW4gVmFuZGVybGluZGVuLiBGb3RvIHZhbiBkZSBib3N2cmllbmRlbi4nLFxyXG4gICAgICAgICcyMDE4LzA4LzA0JyxcclxuICAgICAgICAnaHR0cHM6Ly9zY29udGVudC1icnUyLTEueHguZmJjZG4ubmV0L3YvdDEuMC05LzM4NTI4NjQ3Xzc3MDMxODY5NjQyNTA5Nl8zMjgxMzMyODY0OTk3NjU0NTI4X24ucG5nP19uY19jYXQ9MCZvaD1mNGMyZTg3ZDg2NjY4ZTVkZThhM2RjNjIyOGYyMzlkOSZvZT01QkZBNjlCMidcclxuICAgICksXHJcbiAgICBtYW51YWxGYWNlYm9va1Bvc3RJbXBvcnQoXHJcbiAgICAgICAgJ0Rpa2tlIHByb2ZpY2lhdCB2b29yIG9uemUgcm9kZSBkdWl2ZWxzIHZhbiBoZXQgUmVuIFNwb3J0IHRlYW0uJyxcclxuICAgICAgICAnMjAxOC8wNy8wNycsXHJcbiAgICAgICAgJ2h0dHBzOi8vc2NvbnRlbnQtYnJ1Mi0xLnh4LmZiY2RuLm5ldC92L3QxLjAtOS8zNjc3MDY0Nl83Mzc4NTE3MTYzMzg0NjFfMjExNjk3NzI1MTIxMDc1NjA5Nl9uLmpwZz9fbmNfY2F0PTAmb2g9N2FmODQ0NTM2OGRhM2FhZjhiZjNjZWU4YTM0YWIwMDYmb2U9NUJEQzcxQkYnXHJcbiAgICApLFxyXG4gICAgbWFudWFsRmFjZWJvb2tQb3N0SW1wb3J0KFxyXG4gICAgICAgICdIZWVsIHdhcm0gd2VlciwgdmVlbCBkcmlua2VuISEhXFxuJyArXHJcbiAgICAgICAgJ1dhdCBkcmlua2VuIHZvb3IgZW4gbmEgZWVuIHRyYWluaW5nLyB3ZWRzdHJpamQ/XFxuJyArXHJcbiAgICAgICAgJ05JRVVXIGJpaiBSZW4gU3BvcnQgaXMgT1ZFUlNUSU1TLlxcbicgK1xyXG4gICAgICAgICdFZW4gaWRlYWFsIHZvb3JkZWVscGFra2V0IHZvb3IgZGUgbWFyYXRob25sb3BlcnMsIG1ldCBleHRyYSBlZW4gYmFuZCB2b29yIHUgbnVtbWVyIGVuIGplIGVuZXJnaWVnZWxzIHZvb3Igb25kZXJ3ZWcuJyxcclxuICAgICAgICAnMjAxOC8wNy8wNCcsXHJcbiAgICAgICAgJ2h0dHBzOi8vc2NvbnRlbnQtYnJ1Mi0xLnh4LmZiY2RuLm5ldC92L3QxLjAtOS8zNjY4MjYxM183MzQ4MDA3MTk5NzY4OTRfNDk3NTU1OTA2NjUzODQ3NTUyX24uanBnP19uY19jYXQ9MCZvaD1lODdlY2FjNWQzZTNmYjk1NzEyZWMyNWE5YWM0ZmJiOCZvZT01QkQzNjNBRSdcclxuICAgICksXHJcbiAgICBtYW51YWxGYWNlYm9va1Bvc3RJbXBvcnQoXHJcbiAgICAgICAgJ01lc3NhbGluYSBQaWVyb25pLCBtb29pIGFydGlrZWwgZW4gbW9vaSBmb3Rv4oCZcy4nLFxyXG4gICAgICAgICcyMDE4LzA3LzAzJyxcclxuICAgICAgICAnaHR0cHM6Ly9zY29udGVudC1icnUyLTEueHguZmJjZG4ubmV0L3YvdDEuMC05LzM2NTMxMDk0XzczMzQzNTExNjc4MDEyMV8xOTM5ODIxODExNzM0Njc1NDU2X24uanBnP19uY19jYXQ9MCZvaD02YzdiNTMxNDgyMmRjOTQzZjhiODZmNjdjZjQ4NzdlNyZvZT01QkRFNEZBMydcclxuICAgIClcclxuXTtcclxuXHJcbmZ1bmN0aW9uIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChtZXNzYWdlOiBzdHJpbmcsIGRhdGU6IHN0cmluZywgcGljdHVyZTogc3RyaW5nKTogRkJQb3N0UmVzcG9uc2Uge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjcmVhdGVkX3RpbWU6IGRhdGUsXHJcbiAgICAgICAgZnVsbF9waWN0dXJlOiBwaWN0dXJlLFxyXG4gICAgICAgIGlkOiAnaWQnLFxyXG4gICAgICAgIGlzX2hpZGRlbjogZmFsc2UsXHJcbiAgICAgICAgaXNfcHVibGlzaGVkOiB0cnVlLFxyXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbiAgICAgICAgZnJvbToge1xyXG4gICAgICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICAgICAgaWQ6IEZCX1BBR0VfSUQsXHJcbiAgICAgICAgICAgIGVycm9yOiAnJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXJyb3I6ICcnXHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgU1RBTkRBUkRfT1BFTklOR19IT1VSUyA9IHtcclxuICAgIGhvdXJzOiB7XHJcbiAgICAgICAgXCJtb25fMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJtb25fMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJtb25fM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJtb25fNFwiOiBcIjE4OjMwXCIsXHJcbiAgICAgICAgXCJ3ZWRfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJ3ZWRfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJ3ZWRfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJ3ZWRfNFwiOiBcIjE4OjMwXCIsXHJcbiAgICAgICAgXCJ0aHVfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJ0aHVfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJ0aHVfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJ0aHVfNFwiOiBcIjE4OjMwXCIsXHJcbiAgICAgICAgXCJmcmlfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJmcmlfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJmcmlfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJmcmlfNFwiOiBcIjE5OjAwXCIsXHJcbiAgICAgICAgXCJzYXRfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJzYXRfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJzYXRfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJzYXRfNFwiOiBcIjE4OjMwXCJcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBFWENFUFRJT05BTF9PUEVOSU5HX0hPVVJTID0ge1xyXG4gICAgaG91cnM6IHtcclxuICAgICAgICBcInRodV8xXCI6IFwiMDk6MzBcIixcclxuICAgICAgICBcInRodV8yXCI6IFwiMTI6MzBcIixcclxuICAgICAgICBcInRodV8zXCI6IFwiMTM6MzBcIixcclxuICAgICAgICBcInRodV80XCI6IFwiMTg6MzBcIixcclxuICAgICAgICBcImZyaV8xXCI6IFwiMDk6MzBcIixcclxuICAgICAgICBcImZyaV8yXCI6IFwiMTI6MzBcIixcclxuICAgICAgICBcImZyaV8zXCI6IFwiMTM6MzBcIixcclxuICAgICAgICBcImZyaV80XCI6IFwiMTk6MDBcIixcclxuICAgICAgICBcInNhdF8xXCI6IFwiMDk6MzBcIixcclxuICAgICAgICBcInNhdF8yXCI6IFwiMTI6MzBcIixcclxuICAgICAgICBcInNhdF8zXCI6IFwiMTM6MzBcIixcclxuICAgICAgICBcInNhdF80XCI6IFwiMTg6MzBcIlxyXG4gICAgfVxyXG59OyIsImV4cG9ydCBmdW5jdGlvbiBwYXJzZUpTT04gKGpzb24gOiBzdHJpbmcpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IHBhcnNlZE9iamVjdCA9IEpTT04ucGFyc2UoanNvbik7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZE9iamVjdDtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkOyAgIFxyXG4gICAgfVxyXG59IiwiZXhwb3J0IGZ1bmN0aW9uIGxpbmtpZnkgKGlucHV0VGV4dCA6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgdmFyIHJlcGxhY2VkVGV4dCA6IHN0cmluZyxcclxuICAgICAgICByZXBsYWNlUGF0dGVybjEgOiBSZWdFeHAsIHJlcGxhY2VQYXR0ZXJuMiA6IFJlZ0V4cCwgcmVwbGFjZVBhdHRlcm4zIDogUmVnRXhwO1xyXG5cclxuICAgIC8vVVJMcyBzdGFydGluZyB3aXRoIGh0dHA6Ly8sIGh0dHBzOi8vLCBvciBmdHA6Ly9cclxuICAgIHJlcGxhY2VQYXR0ZXJuMSA9IC8oXFxiKGh0dHBzP3xmdHApOlxcL1xcL1stQS1aMC05KyZAI1xcLyU/PX5ffCE6LC47XSpbLUEtWjAtOSsmQCNcXC8lPX5ffF0pL2dpbTtcclxuICAgIHJlcGxhY2VkVGV4dCA9IGlucHV0VGV4dC5yZXBsYWNlKHJlcGxhY2VQYXR0ZXJuMSwgJzxhIGhyZWY9XCIkMVwiIHRhcmdldD1cIl9ibGFua1wiPiQxPC9hPicpO1xyXG5cclxuICAgIC8vVVJMcyBzdGFydGluZyB3aXRoIFwid3d3LlwiICh3aXRob3V0IC8vIGJlZm9yZSBpdCwgb3IgaXQnZCByZS1saW5rIHRoZSBvbmVzIGRvbmUgYWJvdmUpLlxyXG4gICAgcmVwbGFjZVBhdHRlcm4yID0gLyhefFteXFwvXSkod3d3XFwuW1xcU10rKFxcYnwkKSkvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gcmVwbGFjZWRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4yLCAnJDE8YSBocmVmPVwiaHR0cDovLyQyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JDI8L2E+Jyk7XHJcblxyXG4gICAgLy9DaGFuZ2UgZW1haWwgYWRkcmVzc2VzIHRvIG1haWx0bzo6IGxpbmtzLlxyXG4gICAgcmVwbGFjZVBhdHRlcm4zID0gLygoW2EtekEtWjAtOVxcLVxcX1xcLl0pK0BbYS16QS1aXFxfXSs/KFxcLlthLXpBLVpdezIsNn0pKykvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gcmVwbGFjZWRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4zLCAnPGEgaHJlZj1cIm1haWx0bzokMVwiPiQxPC9hPicpO1xyXG5cclxuICAgIHJldHVybiByZXBsYWNlZFRleHQ7XHJcbn0iLCJpbXBvcnQge0ZhY2Vib29rT3BlbmluZ0luZm99IGZyb20gXCIuLi9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tPcGVuaW5nSW5mb1wiO1xyXG5cclxuY29uc3QgZGF5cyA6IHN0cmluZ1tdID0gW1xyXG4gICAgJ21vbmRheScsICd0dWVzZGF5JywgJ3dlZG5lc2RheScsICd0aHVyc2RheScsICdmcmlkYXknLCAnc2F0dXJkYXknLCAnc3VuZGF5J1xyXG5dO1xyXG5cclxuY29uc3QgZGF5c1RyYW5zbGF0aW9uIDoge1tkYXkgOiBzdHJpbmddIDogc3RyaW5nfSA9IHtcclxuICAgICdtb25kYXknIDogJ00uJyxcclxuICAgICd0dWVzZGF5JyA6ICdELicsXHJcbiAgICAnd2VkbmVzZGF5JyA6ICdXLicsXHJcbiAgICAndGh1cnNkYXknIDogJ0QuJyxcclxuICAgICdmcmlkYXknIDogJ1YuJyxcclxuICAgICdzYXR1cmRheScgOiAnWi4nLFxyXG4gICAgJ3N1bmRheScgOiAnWi4nXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyT3BlbmluZ0luZm8gKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbywgcm9vdCA6IEhUTUxFbGVtZW50KSA6IHZvaWQge1xyXG4gICAgaWYgKCFyb290KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgdHlwZSA9IHJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLXZpZXd0eXBlJyk7XHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlICdtb2Rlc3QnIDpcclxuICAgICAgICAgICAgcmVuZGVyTW9kZXN0T3BlbmluZ0luZm9WaWV3KG9wZW5pbmdJbmZvLCByb290KTtcclxuICAgIH1cclxuICAgIC8qbGV0IHJvb3QgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZm9yIChsZXQgZGF5IG9mIGRheXMpIHtcclxuICAgICAgICBsZXQgZGF5dmlldyA9IGRheVZpZXcoZGF5LCAoPGFueT5vcGVuaW5nSW5mbylbZGF5XSk7XHJcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIH1cclxuICAgIHJvb3QuYXBwZW5kQ2hpbGQoY3VycmVudGx5T3BlblZpZXcob3BlbmluZ0luZm8uaXNDdXJyZW50bHlPcGVuKSk7XHJcbiAgICByZXR1cm4gcm9vdDsqL1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJNb2Rlc3RPcGVuaW5nSW5mb1ZpZXcgKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbywgcm9vdCA6IEhUTUxFbGVtZW50KSA6IHZvaWQge1xyXG4gICAgcm9vdC5hcHBlbmRDaGlsZChtb2Rlc3RXZWVrVmlldyhvcGVuaW5nSW5mbykpO1xyXG4gICAgcm9vdC5hcHBlbmRDaGlsZChtb2Rlc3RJc09wZW5JbmRpY2F0b3Iob3BlbmluZ0luZm8pKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0SXNPcGVuSW5kaWNhdG9yIChvcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm8pIDogSFRNTEVsZW1lbnQge1xyXG4gICAgbGV0IGNvbnRhaW5lciA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tbW9kZXN0LWluZGljYXRvcic7XHJcblxyXG4gICAgbGV0IGluZGljYXRvclRleHQgOiBIVE1MU3BhbkVsZW1lbnQ7XHJcbiAgICBpbmRpY2F0b3JUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgaW5kaWNhdG9yVGV4dC5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1tb2Rlc3QtaW5kaWNhdG9yLWxhYmVsJztcclxuXHJcbiAgICBsZXQgY29udGFjdE9wdGlvbnMgOiBBcnJheTxIVE1MRWxlbWVudD4gPSBbXTtcclxuICAgIGNvbnRhY3RPcHRpb25zLnB1c2gobW9kZXN0QWN0Tm93TGluaygnbWFpbHRvOmluZm9AcmVuc3BvcnQuYmUnLCAnZmEtZW52ZWxvcGUnKSk7XHJcblxyXG4gICAgc3dpdGNoIChvcGVuaW5nSW5mby5pc0N1cnJlbnRseU9wZW4pIHtcclxuICAgICAgICBjYXNlIHRydWUgOlxyXG4gICAgICAgICAgICBjb250YWluZXIuY2xhc3NOYW1lICs9ICcgcmVuLW9wZW5pbmdzdXJlbi1vcGVuJztcclxuICAgICAgICAgICAgaW5kaWNhdG9yVGV4dC5pbm5lclRleHQgPSAnTnUgb3BlbiEnO1xyXG4gICAgICAgICAgICBjb250YWN0T3B0aW9ucy5wdXNoKG1vZGVzdEFjdE5vd0xpbmsoJ3RlbDorMzIxMzY2NzQ2MCcsICdmYS1waG9uZScpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBmYWxzZSA6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc05hbWUgKz0gJyByZW4tb3BlbmluZ3N1cmVuLWNsb3NlZCc7XHJcbiAgICAgICAgICAgIGluZGljYXRvclRleHQuaW5uZXJUZXh0ID0gJ0dlc2xvdGVuJztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGluZGljYXRvclRleHQpO1xyXG5cclxuICAgIGZvciAobGV0IGNvbnRhY3RPcHRpb24gb2YgY29udGFjdE9wdGlvbnMpIHtcclxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY29udGFjdE9wdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdFdlZWtWaWV3IChvcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm8pIDogSFRNTEVsZW1lbnQge1xyXG4gICAgbGV0IHRhYmxlIDogSFRNTFRhYmxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcblxyXG4gICAgaWYgKG9wZW5pbmdJbmZvLmlzQ3VycmVudGx5T3Blbikge1xyXG4gICAgICAgIHRhYmxlLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLW9wZW4nO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0YWJsZS5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1jbG9zZWQnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmb3IgKGxldCBkYXkgb2YgZGF5cykge1xyXG4gICAgICAgIGxldCBkYXl2aWV3IDogSFRNTFRhYmxlUm93RWxlbWVudCA9IG1vZGVzdERheVZpZXcoZGF5LCAoPGFueT5vcGVuaW5nSW5mbylbZGF5XSk7XHJcbiAgICAgICAgdGFibGUuYXBwZW5kQ2hpbGQoZGF5dmlldyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhYmxlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3REYXlWaWV3IChkYXkgOiBzdHJpbmcsIGhvdXJzIDogc3RyaW5nW10pIDogSFRNTFRhYmxlUm93RWxlbWVudCB7XHJcbiAgICBsZXQgdGFibGVSb3cgOiBIVE1MVGFibGVSb3dFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgIGlmIChkYXkgPT09IGRheXNbbmV3IERhdGUoKS5nZXREYXkoKSAtIDFdKSB7XHJcbiAgICAgICAgdGFibGVSb3cuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tY3VycmVudGRheSc7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRheXZpZXcgOiBIVE1MVGFibGVEYXRhQ2VsbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpLFxyXG4gICAgICAgIGhvdXJ2aWV3IDogSFRNTFRhYmxlRGF0YUNlbGxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICBkYXl2aWV3LmlubmVyVGV4dCA9IGRheXNUcmFuc2xhdGlvbltkYXldO1xyXG4gICAgaG91cnZpZXcuaW5uZXJUZXh0ID0gbW9kZXN0SG91clZpZXcoaG91cnMpO1xyXG5cclxuXHJcbiAgICB0YWJsZVJvdy5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIHRhYmxlUm93LmFwcGVuZENoaWxkKGhvdXJ2aWV3KTtcclxuXHJcbiAgICByZXR1cm4gdGFibGVSb3c7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdEhvdXJWaWV3IChob3VycyA6IHN0cmluZ1tdKSA6IHN0cmluZyB7XHJcbiAgICBsZXQgaG91cnZpZXcgPSAnJztcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG91cnMubGVuZ3RoOyBpKz0yKSB7XHJcbiAgICAgICAgaG91cnZpZXcgKz0gaG91cnNbaV0gKyAnIC0gJyArIGhvdXJzW2krMV07XHJcbiAgICAgICAgaWYgKGkrMSAhPSBob3Vycy5sZW5ndGgtMSkge1xyXG4gICAgICAgICAgICBob3VydmlldyArPSAnLCAnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBob3VydmlldyB8fCAnR2VzbG90ZW4nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3RBY3ROb3dMaW5rIChocmVmIDogc3RyaW5nLCBpY29uTmFtZSA6IHN0cmluZykgOiBIVE1MRWxlbWVudCB7XHJcblxyXG4gICAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICBhLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLWluZGljYXRvci1jdGEtbGluayc7XHJcbiAgICBhLmhyZWYgPSBocmVmO1xyXG5cclxuICAgIGxldCBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpO1xyXG4gICAgaWNvbi5jbGFzc05hbWUgPSAnZmEgJyArIGljb25OYW1lICsgJyBmYS1sZyc7XHJcblxyXG4gICAgYS5hcHBlbmRDaGlsZChpY29uKTtcclxuXHJcbiAgICByZXR1cm4gYTtcclxufSJdfQ==
