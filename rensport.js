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
        if (!input || !hiddenInput || !input.value || !hiddenSubmit) {
            return;
        }
        this._trackSubscription(input.value);
        hiddenInput.value = input.value;
        hiddenSubmit.click();
    };
    Ren.prototype._trackSubscription = function (email) {
        if (!ga) {
            return;
        }
        try {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Newsletter',
                eventAction: 'submit',
                eventLabel: email
            });
        }
        catch (e) {
            console.warn('REN: Er ging iets verkeerd bij het tracken van de Newsletter subscription.');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTG9hZGFibGUudHMiLCJzcmMvUmVuLnRzIiwic3JjL1Jlbkdsb2JhbC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va1Bvc3QudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rUHJveHkudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL01hbnVhbEZlZWRib29rRmVlZC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvTWFudWFsT3BlbmluZ0hvdXJzLnRzIiwic3JjL3V0aWwvSlNPTlV0aWxzLnRzIiwic3JjL3V0aWwvTGlua2lmeS50cyIsInNyYy92aWV3L09wZW5pbmdJbmZvVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtJQU9JO1FBTFEsY0FBUyxHQUFhLEtBQUssQ0FBQztRQUM1QixnQkFBVyxHQUFhLEtBQUssQ0FBQztRQUM5QiwyQkFBc0IsR0FBbUIsRUFBRSxDQUFDO1FBQzVDLHdCQUFtQixHQUFtQixFQUFFLENBQUM7UUFHN0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxzQkFBVyw4QkFBUTthQUFuQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsbUNBQWE7YUFBeEI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQTtRQUMzQixDQUFDOzs7T0FBQTtJQUVNLDRCQUFTLEdBQWhCLFVBQWtCLG1CQUErQixFQUFFLGdCQUE2QjtRQUM1RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNoQixtQkFBbUIsRUFBRSxDQUFDO1FB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LENBQUMsQ0FBQztJQUNiLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7QUFDTCxDQUFDO0FBRUQsc0JBQXVCLEtBQWM7SUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3RCLENBQUM7QUFDTCxDQUFDO0FBRUQsb0JBQXFCLEdBQVk7SUFDN0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFD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Q0FBQztJQUN2QyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBRTdDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFcEIsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNiLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJleHBvcnQgYWJzdHJhY3QgY2xhc3MgTG9hZGFibGUge1xyXG5cclxuICAgIHByaXZhdGUgX2lzTG9hZGVkIDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfbG9hZEZhaWxlZCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX3dhaXRpbmdGb3JMb2FkU3VjY2VzcyA6ICgoKSA9PiBhbnkpW10gPSBbXTtcclxuICAgIHByaXZhdGUgX3dhaXRpbmdGb3JMb2FkRmFpbCA6ICgoKSA9PiBhbnkpW10gPSBbXTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHRoaXMuZG9Mb2FkKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXQgaXNMb2FkZWQgKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNMb2FkZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBoYXNMb2FkRmFpbGVkICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvYWRGYWlsZWRcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWZ0ZXJMb2FkIChsb2FkU3VjY2Vzc0NhbGxiYWNrIDogKCkgPT4gYW55LCBsb2FkRmFpbENhbGxiYWNrPyA6ICgpID0+IGFueSkgOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRlZCkge1xyXG4gICAgICAgICAgICBsb2FkU3VjY2Vzc0NhbGxiYWNrKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0xvYWRGYWlsZWQpIHtcclxuICAgICAgICAgICAgaWYgKGxvYWRGYWlsQ2FsbGJhY2spe1xyXG4gICAgICAgICAgICAgICAgbG9hZEZhaWxDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzLnB1c2gobG9hZFN1Y2Nlc3NDYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGlmIChsb2FkRmFpbENhbGxiYWNrKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkRmFpbC5wdXNoKGxvYWRGYWlsQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgbG9hZFN1Y2Nlc3MgKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2VzcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsb2FkRmFpbGVkIChlcnJvciA6IHN0cmluZykgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9sb2FkRmFpbGVkID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiB0aGlzLl93YWl0aW5nRm9yTG9hZEZhaWwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRGYWlsID0gW107XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMb2FkaW5nIGZhaWxlZCA6ICcgKyBlcnJvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGRvTG9hZCAoKSA6IHZvaWQ7XHJcbn0iLCJpbXBvcnQge0ZhY2Vib29rT3BlbmluZ0luZm99IGZyb20gXCIuL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvXCI7XHJcbmltcG9ydCB7RmFjZWJvb2tGZWVkfSBmcm9tIFwiLi9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkXCI7XHJcbmltcG9ydCB7UmVuU3BvcnRDb25maWd9IGZyb20gXCIuL1JlblNwb3J0Q29uZmlnXCI7XHJcbmltcG9ydCB7cmVuZGVyT3BlbmluZ0luZm99IGZyb20gXCIuL3ZpZXcvT3BlbmluZ0luZm9WaWV3XCI7XHJcblxyXG5kZWNsYXJlIHZhciAkOiBhbnk7XHJcbmRlY2xhcmUgdmFyIGdhOiBhbnk7XHJcblxyXG5leHBvcnQgY2xhc3MgUmVuIHtcclxuXHJcbiAgICBwcml2YXRlIF9vcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm87XHJcbiAgICBwcml2YXRlIF9mZWVkIDogRmFjZWJvb2tGZWVkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICBsZXQgY29uZmlnIDogUmVuU3BvcnRDb25maWcgPSAoPGFueT53aW5kb3cpLlJlblNwb3J0Q29uZmlnO1xyXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmxvYWRIZWFkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZEhlYWRlcihjb25maWcuY29udGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9sb2FkRm9vdGVyKCk7XHJcblxyXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmxvYWRPcGVuaW5nSG91cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5fb3BlbmluZ0luZm8gPSBuZXcgRmFjZWJvb2tPcGVuaW5nSW5mbygpO1xyXG4gICAgICAgICAgICB0aGlzLl9vcGVuaW5nSW5mby5hZnRlckxvYWQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyT3BlbmluZ0luZm8odGhpcy5fb3BlbmluZ0luZm8sIDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVuLW9wZW5pbmdzdXJlbi1ob29rJykpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmxvYWROZXdzRmVlZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9mZWVkID0gbmV3IEZhY2Vib29rRmVlZCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9mZWVkLmFmdGVyTG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mZWVkLnJlbmRlclRvKDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVuLWhvbWVwYWdlLW5ld3NmZWVkJykpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBmZWVkICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmVlZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9sb2FkSGVhZGVyIChjb250ZXh0IDogc3RyaW5nKSA6IHZvaWQge1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGhvb2sgOiBhbnkgPSAkKCBcIiNyZW4taGVhZGVyXCIgKTtcclxuICAgICAgICAgICAgaG9vay5sb2FkKCBcIi9jb21wb25lbnRzL2hlYWRlci5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRleHROYXZiYXJFbGVtZW50IDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlbZGF0YS1jb250ZXh0LScgKyBjb250ZXh0LnRvTG93ZXJDYXNlKCkgKyAnXScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXh0TmF2YmFyRWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0TmF2YmFyRWxlbWVudC5jbGFzc05hbWUgKz0gJ2FjdGl2ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbG9hZEZvb3RlciAoKSA6IHZvaWQge1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGhvb2sgOiBhbnkgPSAkKCBcIiNyZW4tZm9vdGVyXCIgKTtcclxuICAgICAgICAgICAgaG9vay5sb2FkKCBcIi9jb21wb25lbnRzL2Zvb3Rlci5odG1sXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgb3BlbmluZ0luZm8gKCkgOiBGYWNlYm9va09wZW5pbmdJbmZvIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3BlbmluZ0luZm87XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN1YnNjcmliZVRvTmV3c2xldHRlciAoKSB7XHJcbiAgICAgICAgbGV0IGlucHV0IDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZW4tbmlldXdzYnJpZWYtaW5wdXQtZmllbGQnKTtcclxuICAgICAgICBsZXQgaGlkZGVuSW5wdXQgOiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3ZyLWhpZGRlbi1pbnB1dC1maWVsZCcpLFxyXG4gICAgICAgICAgICBoaWRkZW5TdWJtaXQgOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdnItaGlkZGVuLXN1Ym1pdC1idG4nKTtcclxuXHJcbiAgICAgICAgaWYgKCFpbnB1dCB8fCAhaGlkZGVuSW5wdXQgfHwgIWlucHV0LnZhbHVlIHx8ICFoaWRkZW5TdWJtaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fdHJhY2tTdWJzY3JpcHRpb24oaW5wdXQudmFsdWUpO1xyXG5cclxuICAgICAgICBoaWRkZW5JbnB1dC52YWx1ZSA9IGlucHV0LnZhbHVlO1xyXG4gICAgICAgIGhpZGRlblN1Ym1pdC5jbGljaygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3RyYWNrU3Vic2NyaXB0aW9uKGVtYWlsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIWdhKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBnYSgnc2VuZCcsIHtcclxuICAgICAgICAgICAgICAgIGhpdFR5cGU6ICdldmVudCcsXHJcbiAgICAgICAgICAgICAgICBldmVudENhdGVnb3J5OiAnTmV3c2xldHRlcicsXHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbjogJ3N1Ym1pdCcsXHJcbiAgICAgICAgICAgICAgICBldmVudExhYmVsOiBlbWFpbFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignUkVOOiBFciBnaW5nIGlldHMgdmVya2VlcmQgYmlqIGhldCB0cmFja2VuIHZhbiBkZSBOZXdzbGV0dGVyIHN1YnNjcmlwdGlvbi4nKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7UmVufSBmcm9tIFwiLi9SZW5cIjtcclxuXHJcbig8YW55PndpbmRvdykuUmVuU3BvcnQgPSBuZXcgUmVuKCk7IiwiaW1wb3J0IHtGQkZlZWRSZXNwb25zZU9iamVjdCwgRkJQb3N0UmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7TG9hZGFibGV9IGZyb20gXCIuLi9Mb2FkYWJsZVwiO1xyXG5pbXBvcnQge0ZhY2Vib29rUHJveHl9IGZyb20gXCIuL0ZhY2Vib29rUHJveHlcIjtcclxuaW1wb3J0IHtGYWNlYm9va1Bvc3R9IGZyb20gXCIuL0ZhY2Vib29rUG9zdFwiO1xyXG5pbXBvcnQge3BhcnNlSlNPTn0gZnJvbSBcIi4uL3V0aWwvSlNPTlV0aWxzXCI7XHJcbmltcG9ydCB7bWFudWFsRmFjZWJvb2tGZWVkfSBmcm9tIFwiLi9NYW51YWxGZWVkYm9va0ZlZWRcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va0ZlZWQgZXh0ZW5kcyBMb2FkYWJsZSB7XHJcblxyXG4gICAgcHJpdmF0ZSBfcG9zdHMgOiBBcnJheTxGYWNlYm9va1Bvc3Q+ID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBwb3N0cyAoKSA6IEFycmF5PEZhY2Vib29rUG9zdD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wb3N0cztcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxsZWQgYnkgc3VwZXIoKTtcclxuICAgIHByb3RlY3RlZCBkb0xvYWQgKCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5LmZlZWQoKHJlcyA6IEZCRmVlZFJlc3BvbnNlT2JqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzLmVycm9yICYmIHJlcy5mZWVkICYmIHJlcy5mZWVkLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkUG9zdHNGcm9tUmVzcG9uc2UocmVzLmZlZWQuZGF0YSlcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghcmVzLmVycm9yICYmIHBhcnNlSlNPTig8YW55PnJlcykgJiYgcGFyc2VKU09OKDxhbnk+cmVzKS5mZWVkICYmIHBhcnNlSlNPTig8YW55PnJlcykuZmVlZC5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFBvc3RzRnJvbVJlc3BvbnNlKHBhcnNlSlNPTig8YW55PnJlcy5mZWVkLmRhdGEpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkUG9zdHNGcm9tUmVzcG9uc2UobWFudWFsRmFjZWJvb2tGZWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hZGRQb3N0c0Zyb21SZXNwb25zZShtYW51YWxGYWNlYm9va0ZlZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkUG9zdHNGcm9tUmVzcG9uc2UgKHJlcyA6IEZCUG9zdFJlc3BvbnNlW10pIDogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgcG9zdCBvZiByZXMpe1xyXG4gICAgICAgICAgICB0aGlzLl9wb3N0cy5wdXNoKG5ldyBGYWNlYm9va1Bvc3QocG9zdCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxvYWRTdWNjZXNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB2aWV3ICgpIDogSFRNTEVsZW1lbnRbXSB7XHJcbiAgICAgICAgbGV0IHZpZXcgOiBIVE1MRWxlbWVudFtdID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBkaXNwbGF5aW5nUG9zdHMgPSAwOyBkaXNwbGF5aW5nUG9zdHMgPCBNYXRoLm1pbih0aGlzLnBvc3RzLmxlbmd0aCwgNSk7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcG9zdCA9IHRoaXMucG9zdHNbaV07XHJcbiAgICAgICAgICAgIGlmIChwb3N0LmNhbkRpc3BsYXkpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcucHVzaChwb3N0LnZpZXcpO1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheWluZ1Bvc3RzKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlclRvIChwYXJlbnQgOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGZvciAobGV0IHBvc3RWaWV3IG9mIHRoaXMudmlldykge1xyXG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQocG9zdFZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7RkJIb3Vyc1Jlc3BvbnNlfSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0xvYWRhYmxlfSBmcm9tIFwiLi4vTG9hZGFibGVcIjtcclxuaW1wb3J0IHtGYWNlYm9va1Byb3h5fSBmcm9tIFwiLi9GYWNlYm9va1Byb3h5XCI7XHJcbmltcG9ydCB7cGFyc2VKU09OfSBmcm9tIFwiLi4vdXRpbC9KU09OVXRpbHNcIjtcclxuaW1wb3J0IHtTVEFOREFSRF9PUEVOSU5HX0hPVVJTfSBmcm9tIFwiLi9NYW51YWxPcGVuaW5nSG91cnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va09wZW5pbmdJbmZvIGV4dGVuZHMgTG9hZGFibGUge1xyXG5cclxuICAgIHB1YmxpYyBtb25kYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHR1ZXNkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHdlZG5lc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgdGh1cnNkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIGZyaWRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgc2F0dXJkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHN1bmRheSA6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgcHVibGljIGdldCBpc0N1cnJlbnRseU9wZW4gKCkgOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgbm93IDogRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgIGRheSA9IGpzVmFsdWVUb0RheShub3cuZ2V0RGF5KCkpLFxyXG4gICAgICAgICAgICBpbmZvRm9yRGF5ID0gKDxhbnk+dGhpcylbZGF5XTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmZvRm9yRGF5Lmxlbmd0aDsgaSs9Mikge1xyXG4gICAgICAgICAgICBpZiAobGllc05vd0luSW50ZXJ2YWwoaW5mb0ZvckRheVtpXSwgaW5mb0ZvckRheVtpKzFdKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FsbGVkIGJ5IHN1cGVyKCk7XHJcbiAgICBwcm90ZWN0ZWQgZG9Mb2FkICgpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5vcGVuaW5naG91cnMoKHJvdWdoZGF0YSA6IEZCSG91cnNSZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJvdWdoZGF0YS5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZURhdGEocm91Z2hkYXRhKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZFN1Y2Nlc3MoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZEZhaWxlZChyb3VnaGRhdGEuZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnNlRGF0YSg8YW55PlNUQU5EQVJEX09QRU5JTkdfSE9VUlMpO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRTdWNjZXNzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwYXJzZURhdGEgKHJvdWdoZGF0YSA6IEZCSG91cnNSZXNwb25zZSkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHJvdWdoZGF0YSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcm91Z2hkYXRhID0gcGFyc2VKU09OKDxhbnk+cm91Z2hkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tb25kYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignbW9uJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMudHVlc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd0dWUnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy53ZWRuZXNkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignd2VkJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMudGh1cnNkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZigndGh1JykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuZnJpZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ2ZyaScpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnNhdHVyZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3NhdCcpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnN1bmRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdzdW4nKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRheVRvVmFsdWUgKGRheSA6IHN0cmluZykgOiBudW1iZXJ7XHJcbiAgICBpZiAoZGF5ID09PSdtb24nKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0ndHVlJykge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3dlZCcpIHtcclxuICAgICAgICByZXR1cm4gMjtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSd0aHUnKSB7XHJcbiAgICAgICAgcmV0dXJuIDM7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nZnJpJykge1xyXG4gICAgICAgIHJldHVybiA0O1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3NhdCcpIHtcclxuICAgICAgICByZXR1cm4gNTtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSdzdW4nKSB7XHJcbiAgICAgICAgcmV0dXJuIDY7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpzVmFsdWVUb0RheSAodmFsdWUgOiBudW1iZXIpIDogc3RyaW5ne1xyXG4gICAgaWYgKHZhbHVlID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuICdzdW5kYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMSkge1xyXG4gICAgICAgIHJldHVybiAnbW9uZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDIpIHtcclxuICAgICAgICByZXR1cm4gJ3R1ZXNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMykge1xyXG4gICAgICAgIHJldHVybiAnd2VkbmVzZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDQpIHtcclxuICAgICAgICByZXR1cm4gJ3RodXJzZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDUpIHtcclxuICAgICAgICByZXR1cm4gJ2ZyaWRheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSA2KSB7XHJcbiAgICAgICAgcmV0dXJuICdzYXR1cmRheSc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpzRGF5VmFsdWUgKGRheSA6IHN0cmluZykgOiBudW1iZXIge1xyXG4gICAgcmV0dXJuICgoZGF5VG9WYWx1ZShkYXkpICsgMSkgJSA3KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29tcGFyZU9wZW5pbmdJbmZvIChhIDogc3RyaW5nLCBiIDogc3RyaW5nKSB7XHJcbiAgICBsZXQgaW5mb0EgPSBhLnNwbGl0KCdfJyksXHJcbiAgICAgICAgaW5mb0IgPSBiLnNwbGl0KCdfJyk7XHJcblxyXG4gICAgaWYgKHBhcnNlSW50KGluZm9BWzFdKSA8IHBhcnNlSW50KGluZm9CWzFdKSkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoaW5mb0FbMV0pID4gcGFyc2VJbnQoaW5mb0JbMV0pKXtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGluZm9BWzJdID09PSAnb3Blbicpe1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfSBlbHNlIHJldHVybiAxO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB0b1RpbWluZ3MgKG9wZW5pbmdUaW1lIDogc3RyaW5nW10sIHJvdWdoRGF0YSA6IEZCSG91cnNSZXNwb25zZSkgOiBzdHJpbmdbXSB7XHJcbiAgICBsZXQgdGltaW5ncyA6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgb3BlbmluZyBvZiBvcGVuaW5nVGltZSkge1xyXG4gICAgICAgIHRpbWluZ3MucHVzaChyb3VnaERhdGEuaG91cnNbb3BlbmluZ10pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRpbWluZ3M7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxpZXNOb3dJbkludGVydmFsIChzdGFydCA6IHN0cmluZywgZW5kIDogc3RyaW5nKSA6IGJvb2xlYW4ge1xyXG5cclxuICAgIGxldCBub3cgOiBEYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICBzdGFydEhvdXJzTWludXRlcyAgPSBzdGFydC5zcGxpdCgnOicpLFxyXG4gICAgICAgIHN0YXJ0RGF0ZSA6IERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIHN0YXJ0SG91ciA6IG51bWJlciA9IHBhcnNlSW50KHN0YXJ0SG91cnNNaW51dGVzWzBdKSxcclxuICAgICAgICBzdGFydE1pbnV0ZXMgOiBudW1iZXIgPSBwYXJzZUludChzdGFydEhvdXJzTWludXRlc1sxXSksXHJcbiAgICAgICAgZW5kSG91cnNNaW51dGVzICA9IGVuZC5zcGxpdCgnOicpLFxyXG4gICAgICAgIGVuZERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIGVuZEhvdXIgOiBudW1iZXIgPSBwYXJzZUludChlbmRIb3Vyc01pbnV0ZXNbMF0pLFxyXG4gICAgICAgIGVuZE1pbnV0ZXMgOiBudW1iZXIgPSBwYXJzZUludChlbmRIb3Vyc01pbnV0ZXNbMV0pO1xyXG5cclxuICAgIHN0YXJ0RGF0ZS5zZXRIb3VycyhzdGFydEhvdXIpO1xyXG4gICAgc3RhcnREYXRlLnNldE1pbnV0ZXMoc3RhcnRNaW51dGVzKTtcclxuICAgIGVuZERhdGUuc2V0SG91cnMoZW5kSG91cik7XHJcbiAgICBlbmREYXRlLnNldE1pbnV0ZXMoZW5kTWludXRlcyk7XHJcblxyXG4gICAgcmV0dXJuIG5vdyA+PSBzdGFydERhdGUgJiYgbm93IDwgZW5kRGF0ZTtcclxufSIsImltcG9ydCB7RkJQb3N0UmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7SW1hZ2VUYWd9IGZyb20gXCIuLi9saWJyYXJ5L1NjcmlwdFRhZ1wiO1xyXG5pbXBvcnQge0ZCX1BBR0VfSUR9IGZyb20gXCIuL0ZhY2Vib29rUHJveHlcIjtcclxuaW1wb3J0IHtsaW5raWZ5fSBmcm9tIFwiLi4vdXRpbC9MaW5raWZ5XCI7XHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1Bvc3Qge1xyXG5cclxuICAgIHByaXZhdGUgaW5mbyA6IEZCUG9zdFJlc3BvbnNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yIChpbmZvIDogRkJQb3N0UmVzcG9uc2UpIHtcclxuICAgICAgICB0aGlzLmluZm8gPSBpbmZvO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgY2FuRGlzcGxheSAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5pbmZvLmlzX2hpZGRlbiAmJiB0aGlzLmluZm8uaXNfcHVibGlzaGVkICYmIHRoaXMuaW5mby5mcm9tICYmIHRoaXMuaW5mby5mcm9tLmlkID09PSBGQl9QQUdFX0lEICYmICEhdGhpcy5tZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgY3JlYXRlZCAoKSA6IERhdGUge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmluZm8uY3JlYXRlZF90aW1lLnNwbGl0KCcrJylbMF0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaWQgKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZm8uaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBtZXNzYWdlICgpIDogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmZvLm1lc3NhZ2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXQgcGljdHVyZSAoKSA6IEltYWdlVGFnIHtcclxuICAgICAgICBpZiAodGhpcy5pbmZvLmZ1bGxfcGljdHVyZSkge1xyXG4gICAgICAgICAgICBsZXQgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gdGhpcy5pbmZvLmZ1bGxfcGljdHVyZTtcclxuICAgICAgICAgICAgaW1hZ2UuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWltZyc7XHJcbiAgICAgICAgICAgIHJldHVybiBpbWFnZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlclRvIChwYXJlbnQgOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNhbkRpc3BsYXkpIHtcclxuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMudmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdmlldyAoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBsZXQgdmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHZpZXcuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGxldCBkYXRlVmlldyA9IHRoaXMuY3JlYXRlRGF0ZVZpZXcoKTtcclxuICAgICAgICB2aWV3LmFwcGVuZENoaWxkKGRhdGVWaWV3KTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgY29udGVudFZpZXcgPSB0aGlzLmNyZWF0ZUNvbnRlbnRWaWV3KCk7XHJcbiAgICAgICAgdmlldy5hcHBlbmRDaGlsZChjb250ZW50Vmlldyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVDb250ZW50VmlldyAoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBsZXQgY29udGVudENvbnRhaW5lciA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgY29udGVudENvbnRhaW5lci5jbGFzc05hbWUgPSAncmVuLWNvbnRlbnQtaXRlbS1jb250YWluZXInO1xyXG5cclxuICAgICAgICBsZXQgbmV3c0ZlZWRDb250ZW50Q29udGFpbmVyIDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWNvbnRlbnQtY29udGFpbmVyJztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubWVzc2FnZSkge1xyXG4gICAgICAgICAgICBsZXQgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xyXG4gICAgICAgICAgICB0aXRsZS5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tdGl0bGUnO1xyXG5cclxuICAgICAgICAgICAgbGV0IGZpcnN0U2VudGVuY2UgPSB0aGlzLm1lc3NhZ2UubWF0Y2goZmlyc3RTZW50ZW5jZVJlZ2V4KSB8fCB0aGlzLm1lc3NhZ2UubWF0Y2goZmlyc3RTZW50ZW5jZUJlZm9yZU5ld2xpbmVSZWdleCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZmlyc3RTZW50ZW5jZSkge1xyXG4gICAgICAgICAgICAgICAgdGl0bGUuaW5uZXJIVE1MID0gZmlyc3RTZW50ZW5jZS5tYXAoZnVuY3Rpb24ocyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHMucmVwbGFjZSgvXlxccyt8XFxzKyQvZywnJyk7XHJcbiAgICAgICAgICAgICAgICB9KVswXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQodGl0bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgcGljdHVyZSA9IHRoaXMucGljdHVyZTtcclxuICAgICAgICBpZiAocGljdHVyZSkge1xyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQocGljdHVyZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICBtZXNzYWdlLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS10ZXh0JztcclxuICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLm1lc3NhZ2UgJiYgbGlua2lmeSh0aGlzLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQobWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgY29udGVudENvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdzRmVlZENvbnRlbnRDb250YWluZXIpO1xyXG4gICAgICAgIHJldHVybiBjb250ZW50Q29udGFpbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlRGF0ZVZpZXcgKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IGRhdGVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBkYXRlQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1kYXRlLWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGxldCBkYXRlRGF5TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMScpO1xyXG4gICAgICAgIGRhdGVEYXlMYWJlbC5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tZGF0ZS1kYXknO1xyXG4gICAgICAgIGRhdGVEYXlMYWJlbC5pbm5lclRleHQgPSAnJyt0aGlzLmNyZWF0ZWQuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIGRhdGVDb250YWluZXIuYXBwZW5kQ2hpbGQoZGF0ZURheUxhYmVsKTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGVNb250aFllYXJMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g2Jyk7XHJcbiAgICAgICAgZGF0ZU1vbnRoWWVhckxhYmVsLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1kYXRlLW1vbnRoLXllYXInO1xyXG4gICAgICAgIGRhdGVNb250aFllYXJMYWJlbC5pbm5lclRleHQgPSBtb250aHNbdGhpcy5jcmVhdGVkLmdldE1vbnRoKCldICsgJyAnICsgdGhpcy5jcmVhdGVkLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgZGF0ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChkYXRlTW9udGhZZWFyTGFiZWwpO1xyXG5cclxuICAgICAgICByZXR1cm4gZGF0ZUNvbnRhaW5lcjtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgbW9udGhzIDogc3RyaW5nW10gPSBbXHJcbiAgICAnSmFuJywgJ0ZlYicsICdNYWEnLCAnQXByJywgJ01laScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2t0JywgJ05vdicsICdEZWMnXHJcbl07XHJcblxyXG5jb25zdCBmaXJzdFNlbnRlbmNlUmVnZXggOiBSZWdFeHAgPSAvXi4qP1tcXC4hXFw/XSg/Olxcc3wkKS9nO1xyXG5jb25zdCBmaXJzdFNlbnRlbmNlQmVmb3JlTmV3bGluZVJlZ2V4IDogUmVnRXhwID0gL14uKj9bXFxuXSg/Olxcc3wkKS9nOyIsImltcG9ydCB7RkJSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7U2NyaXB0VGFnfSBmcm9tIFwiLi4vbGlicmFyeS9TY3JpcHRUYWdcIjtcclxuXHJcbmNvbnN0IHByb3h5VVJMID0gJ2h0dHBzOi8vcmVuc2VjdXJpdHlwcm94eS1zYW1naWVsaXMucmhjbG91ZC5jb20vJztcclxuZXhwb3J0IGNvbnN0IEZCX1BBR0VfSUQgOiBzdHJpbmcgPSBcIjIxNTQ3MDM0MTkwOTkzN1wiO1xyXG5cclxuaW50ZXJmYWNlIElGYWNlYm9va1NESyB7XHJcbiAgICBpbml0IDogYW55O1xyXG4gICAgYXBpIChncmFwaHBhdGggOiBzdHJpbmcsIGNhbGxiYWNrIDogKHJlc3BvbnNlIDogRkJSZXNwb25zZSkgPT4gYW55KSA6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1Byb3h5IHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGZlZWQgIChzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5nZXQoJ2ZlZWQnLCBzdWNjLCBmYWlsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIG9wZW5pbmdob3VycyAgKHN1Y2MgOiAoaW5mbyA6IEZCUmVzcG9uc2UpID0+IHZvaWQsIGZhaWw/IDogKCkgPT4gdm9pZCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5LmdldCgnb3BlbmluZ2hvdXJzJywgc3VjYywgZmFpbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc3RhdGljIGdldCAodXJsIDogc3RyaW5nLCBzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICB4aHIub3BlbignZ2V0JywgcHJveHlVUkwgKyB1cmwsIHRydWUpO1xyXG4gICAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xyXG4gICAgICAgICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cztcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VjYyh4aHIucmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKGZhaWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBmYWlsKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHhoci5vbmVycm9yID0gZmFpbDtcclxuICAgICAgICAgICAgeGhyLnNlbmQoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGlmKGZhaWwpIHtcclxuICAgICAgICAgICAgICAgIGZhaWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7RkJQb3N0UmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7RkJfUEFHRV9JRH0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IG1hbnVhbEZhY2Vib29rRmVlZDogRkJQb3N0UmVzcG9uc2VbXSA9IFtcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnTlUgYmlqIFJlbiBTcG9ydC4gRGUgbmlldXdlIE1penVubyBXYXZlIFVsdGltYSAxMCDigJMgVENTIEFtc3RlcmRhbSBNYXJhdGhvbiBlZGl0aWUuJyxcclxuICAgICAgICAnMjAxOC8wOC8xNycsXHJcbiAgICAgICAgJ2h0dHBzOi8vc2NvbnRlbnQtYnJ1Mi0xLnh4LmZiY2RuLm5ldC92L3QxLjAtOS8zOTQ1MzkwNV83ODgwNTIwNjQ2NTE3NTlfNzg3MDIxNzkwNzA3MjkyNTY5Nl9uLmpwZz9fbmNfY2F0PTAmb2g9ZDFhYjhmZjI2MDA4ZjIxZTI1MmI3NmU5YWM0OGVhYWMmb2U9NUMwNjIwNTYnXHJcbiAgICApLFxyXG4gICAgbWFudWFsRmFjZWJvb2tQb3N0SW1wb3J0KFxyXG4gICAgICAgICdCZXN0ZSBrbGFudGVuLCBtYWFuZGFnIDEzLCBkaW5zZGFnIDE0IGVuIHdvZW5zZGFnIDE1IGF1Z3VzdHVzIHppam4gd2UgZ2VzbG90ZW4uIERvbmRlcmRhZyB6aWpuIHdlIHRlcnVnIG9wZW4uIEdlbmlldCB2YW4ganVsbGllIG1vb2kgZW4gc3BvcnRpZWYgd2Vla2VuZC7vv73vv73vv73vv73vv73vv73igI3imYLvuI/vv73vv73igI3imYDvuI/vv73vv73vv73vv73igI3imYLvuI/vv73vv73igI3imYLvuI/vv73vv73igI3imYDvuI8uIO+/ve+/vScsXHJcbiAgICAgICAgJzIwMTgvMDgvMTEnLFxyXG4gICAgICAgICdodHRwczovL3Njb250ZW50LWJydTItMS54eC5mYmNkbi5uZXQvdi90MS4wLTkvMzg5MjYyNjVfNzgwMDY4NTYyMTE2Nzc2Xzg3ODc0OTkxNTM0MjU5NTY4NjRfbi5qcGc/X25jX2NhdD0wJm9oPTMxODdmOWZjMDA5ZmVjOTE0NWMwMjhhNmUyYmY2NTY3Jm9lPTVDMERCOUQ5J1xyXG4gICAgKSxcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnS25hcCBwb2RpdW0gU3RlZmZhbiBWYW5kZXJsaW5kZW4uIEZvdG8gdmFuIGRlIGJvc3ZyaWVuZGVuLicsXHJcbiAgICAgICAgJzIwMTgvMDgvMDQnLFxyXG4gICAgICAgICdodHRwczovL3Njb250ZW50LWJydTItMS54eC5mYmNkbi5uZXQvdi90MS4wLTkvMzg1Mjg2NDdfNzcwMzE4Njk2NDI1MDk2XzMyODEzMzI4NjQ5OTc2NTQ1Mjhfbi5wbmc/X25jX2NhdD0wJm9oPWY0YzJlODdkODY2NjhlNWRlOGEzZGM2MjI4ZjIzOWQ5Jm9lPTVCRkE2OUIyJ1xyXG4gICAgKSxcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnRGlra2UgcHJvZmljaWF0IHZvb3Igb256ZSByb2RlIGR1aXZlbHMgdmFuIGhldCBSZW4gU3BvcnQgdGVhbS4nLFxyXG4gICAgICAgICcyMDE4LzA3LzA3JyxcclxuICAgICAgICAnaHR0cHM6Ly9zY29udGVudC1icnUyLTEueHguZmJjZG4ubmV0L3YvdDEuMC05LzM2NzcwNjQ2XzczNzg1MTcxNjMzODQ2MV8yMTE2OTc3MjUxMjEwNzU2MDk2X24uanBnP19uY19jYXQ9MCZvaD03YWY4NDQ1MzY4ZGEzYWFmOGJmM2NlZThhMzRhYjAwNiZvZT01QkRDNzFCRidcclxuICAgICksXHJcbiAgICBtYW51YWxGYWNlYm9va1Bvc3RJbXBvcnQoXHJcbiAgICAgICAgJ0hlZWwgd2FybSB3ZWVyLCB2ZWVsIGRyaW5rZW4hISFcXG4nICtcclxuICAgICAgICAnV2F0IGRyaW5rZW4gdm9vciBlbiBuYSBlZW4gdHJhaW5pbmcvIHdlZHN0cmlqZD9cXG4nICtcclxuICAgICAgICAnTklFVVcgYmlqIFJlbiBTcG9ydCBpcyBPVkVSU1RJTVMuXFxuJyArXHJcbiAgICAgICAgJ0VlbiBpZGVhYWwgdm9vcmRlZWxwYWtrZXQgdm9vciBkZSBtYXJhdGhvbmxvcGVycywgbWV0IGV4dHJhIGVlbiBiYW5kIHZvb3IgdSBudW1tZXIgZW4gamUgZW5lcmdpZWdlbHMgdm9vciBvbmRlcndlZy4nLFxyXG4gICAgICAgICcyMDE4LzA3LzA0JyxcclxuICAgICAgICAnaHR0cHM6Ly9zY29udGVudC1icnUyLTEueHguZmJjZG4ubmV0L3YvdDEuMC05LzM2NjgyNjEzXzczNDgwMDcxOTk3Njg5NF80OTc1NTU5MDY2NTM4NDc1NTJfbi5qcGc/X25jX2NhdD0wJm9oPWU4N2VjYWM1ZDNlM2ZiOTU3MTJlYzI1YTlhYzRmYmI4Jm9lPTVCRDM2M0FFJ1xyXG4gICAgKSxcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnTWVzc2FsaW5hIFBpZXJvbmksIG1vb2kgYXJ0aWtlbCBlbiBtb29pIGZvdG/igJlzLicsXHJcbiAgICAgICAgJzIwMTgvMDcvMDMnLFxyXG4gICAgICAgICdodHRwczovL3Njb250ZW50LWJydTItMS54eC5mYmNkbi5uZXQvdi90MS4wLTkvMzY1MzEwOTRfNzMzNDM1MTE2NzgwMTIxXzE5Mzk4MjE4MTE3MzQ2NzU0NTZfbi5qcGc/X25jX2NhdD0wJm9oPTZjN2I1MzE0ODIyZGM5NDNmOGI4NmY2N2NmNDg3N2U3Jm9lPTVCREU0RkEzJ1xyXG4gICAgKVxyXG5dO1xyXG5cclxuZnVuY3Rpb24gbWFudWFsRmFjZWJvb2tQb3N0SW1wb3J0KG1lc3NhZ2U6IHN0cmluZywgZGF0ZTogc3RyaW5nLCBwaWN0dXJlOiBzdHJpbmcpOiBGQlBvc3RSZXNwb25zZSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNyZWF0ZWRfdGltZTogZGF0ZSxcclxuICAgICAgICBmdWxsX3BpY3R1cmU6IHBpY3R1cmUsXHJcbiAgICAgICAgaWQ6ICdpZCcsXHJcbiAgICAgICAgaXNfaGlkZGVuOiBmYWxzZSxcclxuICAgICAgICBpc19wdWJsaXNoZWQ6IHRydWUsXHJcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcclxuICAgICAgICBmcm9tOiB7XHJcbiAgICAgICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgICAgICBpZDogRkJfUEFHRV9JRCxcclxuICAgICAgICAgICAgZXJyb3I6ICcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvcjogJydcclxuICAgIH1cclxufSIsImV4cG9ydCBjb25zdCBTVEFOREFSRF9PUEVOSU5HX0hPVVJTID0ge1xyXG4gICAgaG91cnM6IHtcclxuICAgICAgICBcIm1vbl8xXCI6IFwiMDk6MzBcIixcclxuICAgICAgICBcIm1vbl8yXCI6IFwiMTI6MzBcIixcclxuICAgICAgICBcIm1vbl8zXCI6IFwiMTM6MzBcIixcclxuICAgICAgICBcIm1vbl80XCI6IFwiMTg6MzBcIixcclxuICAgICAgICBcIndlZF8xXCI6IFwiMDk6MzBcIixcclxuICAgICAgICBcIndlZF8yXCI6IFwiMTI6MzBcIixcclxuICAgICAgICBcIndlZF8zXCI6IFwiMTM6MzBcIixcclxuICAgICAgICBcIndlZF80XCI6IFwiMTg6MzBcIixcclxuICAgICAgICBcInRodV8xXCI6IFwiMDk6MzBcIixcclxuICAgICAgICBcInRodV8yXCI6IFwiMTI6MzBcIixcclxuICAgICAgICBcInRodV8zXCI6IFwiMTM6MzBcIixcclxuICAgICAgICBcInRodV80XCI6IFwiMTg6MzBcIixcclxuICAgICAgICBcImZyaV8xXCI6IFwiMDk6MzBcIixcclxuICAgICAgICBcImZyaV8yXCI6IFwiMTI6MzBcIixcclxuICAgICAgICBcImZyaV8zXCI6IFwiMTM6MzBcIixcclxuICAgICAgICBcImZyaV80XCI6IFwiMTk6MDBcIixcclxuICAgICAgICBcInNhdF8xXCI6IFwiMDk6MzBcIixcclxuICAgICAgICBcInNhdF8yXCI6IFwiMTI6MzBcIixcclxuICAgICAgICBcInNhdF8zXCI6IFwiMTM6MzBcIixcclxuICAgICAgICBcInNhdF80XCI6IFwiMTg6MzBcIlxyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IEVYQ0VQVElPTkFMX09QRU5JTkdfSE9VUlMgPSB7XHJcbiAgICBob3Vyczoge1xyXG4gICAgICAgIFwidGh1XzFcIjogXCIwOTozMFwiLFxyXG4gICAgICAgIFwidGh1XzJcIjogXCIxMjozMFwiLFxyXG4gICAgICAgIFwidGh1XzNcIjogXCIxMzozMFwiLFxyXG4gICAgICAgIFwidGh1XzRcIjogXCIxODozMFwiLFxyXG4gICAgICAgIFwiZnJpXzFcIjogXCIwOTozMFwiLFxyXG4gICAgICAgIFwiZnJpXzJcIjogXCIxMjozMFwiLFxyXG4gICAgICAgIFwiZnJpXzNcIjogXCIxMzozMFwiLFxyXG4gICAgICAgIFwiZnJpXzRcIjogXCIxOTowMFwiLFxyXG4gICAgICAgIFwic2F0XzFcIjogXCIwOTozMFwiLFxyXG4gICAgICAgIFwic2F0XzJcIjogXCIxMjozMFwiLFxyXG4gICAgICAgIFwic2F0XzNcIjogXCIxMzozMFwiLFxyXG4gICAgICAgIFwic2F0XzRcIjogXCIxODozMFwiXHJcbiAgICB9XHJcbn07IiwiZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSlNPTiAoanNvbiA6IHN0cmluZykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBsZXQgcGFyc2VkT2JqZWN0ID0gSlNPTi5wYXJzZShqc29uKTtcclxuICAgICAgICByZXR1cm4gcGFyc2VkT2JqZWN0O1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7ICAgXHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZnVuY3Rpb24gbGlua2lmeSAoaW5wdXRUZXh0IDogc3RyaW5nKSA6IHN0cmluZyB7XHJcbiAgICB2YXIgcmVwbGFjZWRUZXh0IDogc3RyaW5nLFxyXG4gICAgICAgIHJlcGxhY2VQYXR0ZXJuMSA6IFJlZ0V4cCwgcmVwbGFjZVBhdHRlcm4yIDogUmVnRXhwLCByZXBsYWNlUGF0dGVybjMgOiBSZWdFeHA7XHJcblxyXG4gICAgLy9VUkxzIHN0YXJ0aW5nIHdpdGggaHR0cDovLywgaHR0cHM6Ly8sIG9yIGZ0cDovL1xyXG4gICAgcmVwbGFjZVBhdHRlcm4xID0gLyhcXGIoaHR0cHM/fGZ0cCk6XFwvXFwvWy1BLVowLTkrJkAjXFwvJT89fl98ITosLjtdKlstQS1aMC05KyZAI1xcLyU9fl98XSkvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gaW5wdXRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4xLCAnPGEgaHJlZj1cIiQxXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JDE8L2E+Jyk7XHJcblxyXG4gICAgLy9VUkxzIHN0YXJ0aW5nIHdpdGggXCJ3d3cuXCIgKHdpdGhvdXQgLy8gYmVmb3JlIGl0LCBvciBpdCdkIHJlLWxpbmsgdGhlIG9uZXMgZG9uZSBhYm92ZSkuXHJcbiAgICByZXBsYWNlUGF0dGVybjIgPSAvKF58W15cXC9dKSh3d3dcXC5bXFxTXSsoXFxifCQpKS9naW07XHJcbiAgICByZXBsYWNlZFRleHQgPSByZXBsYWNlZFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybjIsICckMTxhIGhyZWY9XCJodHRwOi8vJDJcIiB0YXJnZXQ9XCJfYmxhbmtcIj4kMjwvYT4nKTtcclxuXHJcbiAgICAvL0NoYW5nZSBlbWFpbCBhZGRyZXNzZXMgdG8gbWFpbHRvOjogbGlua3MuXHJcbiAgICByZXBsYWNlUGF0dGVybjMgPSAvKChbYS16QS1aMC05XFwtXFxfXFwuXSkrQFthLXpBLVpcXF9dKz8oXFwuW2EtekEtWl17Miw2fSkrKS9naW07XHJcbiAgICByZXBsYWNlZFRleHQgPSByZXBsYWNlZFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybjMsICc8YSBocmVmPVwibWFpbHRvOiQxXCI+JDE8L2E+Jyk7XHJcblxyXG4gICAgcmV0dXJuIHJlcGxhY2VkVGV4dDtcclxufSIsImltcG9ydCB7RmFjZWJvb2tPcGVuaW5nSW5mb30gZnJvbSBcIi4uL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvXCI7XHJcblxyXG5jb25zdCBkYXlzIDogc3RyaW5nW10gPSBbXHJcbiAgICAnbW9uZGF5JywgJ3R1ZXNkYXknLCAnd2VkbmVzZGF5JywgJ3RodXJzZGF5JywgJ2ZyaWRheScsICdzYXR1cmRheScsICdzdW5kYXknXHJcbl07XHJcblxyXG5jb25zdCBkYXlzVHJhbnNsYXRpb24gOiB7W2RheSA6IHN0cmluZ10gOiBzdHJpbmd9ID0ge1xyXG4gICAgJ21vbmRheScgOiAnTS4nLFxyXG4gICAgJ3R1ZXNkYXknIDogJ0QuJyxcclxuICAgICd3ZWRuZXNkYXknIDogJ1cuJyxcclxuICAgICd0aHVyc2RheScgOiAnRC4nLFxyXG4gICAgJ2ZyaWRheScgOiAnVi4nLFxyXG4gICAgJ3NhdHVyZGF5JyA6ICdaLicsXHJcbiAgICAnc3VuZGF5JyA6ICdaLidcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJPcGVuaW5nSW5mbyAob3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvLCByb290IDogSFRNTEVsZW1lbnQpIDogdm9pZCB7XHJcbiAgICBpZiAoIXJvb3QpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCB0eXBlID0gcm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmlld3R5cGUnKTtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ21vZGVzdCcgOlxyXG4gICAgICAgICAgICByZW5kZXJNb2Rlc3RPcGVuaW5nSW5mb1ZpZXcob3BlbmluZ0luZm8sIHJvb3QpO1xyXG4gICAgfVxyXG4gICAgLypsZXQgcm9vdCA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBmb3IgKGxldCBkYXkgb2YgZGF5cykge1xyXG4gICAgICAgIGxldCBkYXl2aWV3ID0gZGF5VmlldyhkYXksICg8YW55Pm9wZW5pbmdJbmZvKVtkYXldKTtcclxuICAgICAgICByb290LmFwcGVuZENoaWxkKGRheXZpZXcpO1xyXG4gICAgfVxyXG4gICAgcm9vdC5hcHBlbmRDaGlsZChjdXJyZW50bHlPcGVuVmlldyhvcGVuaW5nSW5mby5pc0N1cnJlbnRseU9wZW4pKTtcclxuICAgIHJldHVybiByb290OyovXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck1vZGVzdE9wZW5pbmdJbmZvVmlldyAob3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvLCByb290IDogSFRNTEVsZW1lbnQpIDogdm9pZCB7XHJcbiAgICByb290LmFwcGVuZENoaWxkKG1vZGVzdFdlZWtWaWV3KG9wZW5pbmdJbmZvKSk7XHJcbiAgICByb290LmFwcGVuZENoaWxkKG1vZGVzdElzT3BlbkluZGljYXRvcihvcGVuaW5nSW5mbykpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3RJc09wZW5JbmRpY2F0b3IgKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbykgOiBIVE1MRWxlbWVudCB7XHJcbiAgICBsZXQgY29udGFpbmVyIDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1tb2Rlc3QtaW5kaWNhdG9yJztcclxuXHJcbiAgICBsZXQgaW5kaWNhdG9yVGV4dCA6IEhUTUxTcGFuRWxlbWVudDtcclxuICAgIGluZGljYXRvclRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICBpbmRpY2F0b3JUZXh0LmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLW1vZGVzdC1pbmRpY2F0b3ItbGFiZWwnO1xyXG5cclxuICAgIGxldCBjb250YWN0T3B0aW9ucyA6IEFycmF5PEhUTUxFbGVtZW50PiA9IFtdO1xyXG4gICAgY29udGFjdE9wdGlvbnMucHVzaChtb2Rlc3RBY3ROb3dMaW5rKCdtYWlsdG86aW5mb0ByZW5zcG9ydC5iZScsICdmYS1lbnZlbG9wZScpKTtcclxuXHJcbiAgICBzd2l0Y2ggKG9wZW5pbmdJbmZvLmlzQ3VycmVudGx5T3Blbikge1xyXG4gICAgICAgIGNhc2UgdHJ1ZSA6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc05hbWUgKz0gJyByZW4tb3BlbmluZ3N1cmVuLW9wZW4nO1xyXG4gICAgICAgICAgICBpbmRpY2F0b3JUZXh0LmlubmVyVGV4dCA9ICdOdSBvcGVuISc7XHJcbiAgICAgICAgICAgIGNvbnRhY3RPcHRpb25zLnB1c2gobW9kZXN0QWN0Tm93TGluaygndGVsOiszMjEzNjY3NDYwJywgJ2ZhLXBob25lJykpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGZhbHNlIDpcclxuICAgICAgICAgICAgY29udGFpbmVyLmNsYXNzTmFtZSArPSAnIHJlbi1vcGVuaW5nc3VyZW4tY2xvc2VkJztcclxuICAgICAgICAgICAgaW5kaWNhdG9yVGV4dC5pbm5lclRleHQgPSAnR2VzbG90ZW4nO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5kaWNhdG9yVGV4dCk7XHJcblxyXG4gICAgZm9yIChsZXQgY29udGFjdE9wdGlvbiBvZiBjb250YWN0T3B0aW9ucykge1xyXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjb250YWN0T3B0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29udGFpbmVyO1xyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0V2Vla1ZpZXcgKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbykgOiBIVE1MRWxlbWVudCB7XHJcbiAgICBsZXQgdGFibGUgOiBIVE1MVGFibGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuXHJcbiAgICBpZiAob3BlbmluZ0luZm8uaXNDdXJyZW50bHlPcGVuKSB7XHJcbiAgICAgICAgdGFibGUuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tb3Blbic7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRhYmxlLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLWNsb3NlZCc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZvciAobGV0IGRheSBvZiBkYXlzKSB7XHJcbiAgICAgICAgbGV0IGRheXZpZXcgOiBIVE1MVGFibGVSb3dFbGVtZW50ID0gbW9kZXN0RGF5VmlldyhkYXksICg8YW55Pm9wZW5pbmdJbmZvKVtkYXldKTtcclxuICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGFibGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdERheVZpZXcgKGRheSA6IHN0cmluZywgaG91cnMgOiBzdHJpbmdbXSkgOiBIVE1MVGFibGVSb3dFbGVtZW50IHtcclxuICAgIGxldCB0YWJsZVJvdyA6IEhUTUxUYWJsZVJvd0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG4gICAgaWYgKGRheSA9PT0gZGF5c1tuZXcgRGF0ZSgpLmdldERheSgpIC0gMV0pIHtcclxuICAgICAgICB0YWJsZVJvdy5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1jdXJyZW50ZGF5JztcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGF5dmlldyA6IEhUTUxUYWJsZURhdGFDZWxsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyksXHJcbiAgICAgICAgaG91cnZpZXcgOiBIVE1MVGFibGVEYXRhQ2VsbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cclxuICAgIGRheXZpZXcuaW5uZXJUZXh0ID0gZGF5c1RyYW5zbGF0aW9uW2RheV07XHJcbiAgICBob3Vydmlldy5pbm5lclRleHQgPSBtb2Rlc3RIb3VyVmlldyhob3Vycyk7XHJcblxyXG5cclxuICAgIHRhYmxlUm93LmFwcGVuZENoaWxkKGRheXZpZXcpO1xyXG4gICAgdGFibGVSb3cuYXBwZW5kQ2hpbGQoaG91cnZpZXcpO1xyXG5cclxuICAgIHJldHVybiB0YWJsZVJvdztcclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0SG91clZpZXcgKGhvdXJzIDogc3RyaW5nW10pIDogc3RyaW5nIHtcclxuICAgIGxldCBob3VydmlldyA9ICcnO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3Vycy5sZW5ndGg7IGkrPTIpIHtcclxuICAgICAgICBob3VydmlldyArPSBob3Vyc1tpXSArICcgLSAnICsgaG91cnNbaSsxXTtcclxuICAgICAgICBpZiAoaSsxICE9IGhvdXJzLmxlbmd0aC0xKSB7XHJcbiAgICAgICAgICAgIGhvdXJ2aWV3ICs9ICcsICc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGhvdXJ2aWV3IHx8ICdHZXNsb3Rlbic7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdEFjdE5vd0xpbmsgKGhyZWYgOiBzdHJpbmcsIGljb25OYW1lIDogc3RyaW5nKSA6IEhUTUxFbGVtZW50IHtcclxuXHJcbiAgICBsZXQgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgIGEuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4taW5kaWNhdG9yLWN0YS1saW5rJztcclxuICAgIGEuaHJlZiA9IGhyZWY7XHJcblxyXG4gICAgbGV0IGljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpJyk7XHJcbiAgICBpY29uLmNsYXNzTmFtZSA9ICdmYSAnICsgaWNvbk5hbWUgKyAnIGZhLWxnJztcclxuXHJcbiAgICBhLmFwcGVuZENoaWxkKGljb24pO1xyXG5cclxuICAgIHJldHVybiBhO1xyXG59Il19
