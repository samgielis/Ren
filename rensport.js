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
},{"./facebookplugins/FacebookFeed":4,"./facebookplugins/FacebookOpeningInfo":5,"./view/OpeningInfoView":11}],3:[function(require,module,exports){
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
},{"../Loadable":1,"../util/JSONUtils":9,"./FacebookPost":6,"./FacebookProxy":7,"./ManualFeedbookFeed":8}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Loadable_1 = require("../Loadable");
var FacebookProxy_1 = require("./FacebookProxy");
var JSONUtils_1 = require("../util/JSONUtils");
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
            _this.parseData({
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
            });
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
},{"../Loadable":1,"../util/JSONUtils":9,"./FacebookProxy":7}],6:[function(require,module,exports){
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
},{"../util/Linkify":10,"./FacebookProxy":7}],7:[function(require,module,exports){
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
    manualFacebookPostImport('Dikke proficiat voor onze rode duivels van het Ren Sport team.', '2018/07/07', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36770646_737851716338461_2116977251210756096_n.jpg?_nc_cat=0&oh=7af8445368da3aaf8bf3cee8a34ab006&oe=5BDC71BF'),
    manualFacebookPostImport('Heel warm weer, veel drinken!!!\n' +
        'Wat drinken voor en na een training/ wedstrijd?\n' +
        'NIEUW bij Ren Sport is OVERSTIMS.\n' +
        'Een ideaal voordeelpakket voor de marathonlopers, met extra een band voor u nummer en je energiegels voor onderweg.', '2018/07/04', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36682613_734800719976894_497555906653847552_n.jpg?_nc_cat=0&oh=e87ecac5d3e3fb95712ec25a9ac4fbb8&oe=5BD363AE'),
    manualFacebookPostImport('Messalina Pieroni, mooi artikel en mooi foto’s.', '2018/07/03', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36531094_733435116780121_1939821811734675456_n.jpg?_nc_cat=0&oh=6c7b5314822dc943f8b86f67cf4877e7&oe=5BDE4FA3'),
    manualFacebookPostImport('Koopjes!!!!!! \n' +
        'Wil je goed sportgerief, bij Ren Sport moet je zijn.', '2018/07/01', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36520563_731171860339780_8226576463223062528_o.jpg?_nc_cat=0&oh=22fdde6b44c6e953588ca729f300d1da&oe=5BEBBB84')
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTG9hZGFibGUudHMiLCJzcmMvUmVuLnRzIiwic3JjL1Jlbkdsb2JhbC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va1Bvc3QudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rUHJveHkudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL01hbnVhbEZlZWRib29rRmVlZC50cyIsInNyYy91dGlsL0pTT05VdGlscy50cyIsInNyYy91dGlsL0xpbmtpZnkudHMiLCJzcmMvdmlldy9PcGVuaW5nSW5mb1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7SUFPSTtRQUxRLGNBQVMsR0FBYSxLQUFLLENBQUM7UUFDNUIsZ0JBQVcsR0FBYSxLQUFLLENBQUM7UUFDOUIsMkJBQXNCLEdBQW1CLEVBQUUsQ0FBQztRQUM1Qyx3QkFBbUIsR0FBbUIsRUFBRSxDQUFDO1FBRzdDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQsc0JBQVcsOEJBQVE7YUFBbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDOzs7T0FBQTtJQUVELHNCQUFXLG1DQUFhO2FBQXhCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUE7UUFDM0IsQ0FBQzs7O09BQUE7SUFFTSw0QkFBUyxHQUFoQixVQUFrQixtQkFBK0IsRUFBRSxnQkFBNkI7UUFDNUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDaEIsbUJBQW1CLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUks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QUFTLEdBQUcsS0FBSyxHQUFHLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFFN0MsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVwQixNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2IsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImV4cG9ydCBhYnN0cmFjdCBjbGFzcyBMb2FkYWJsZSB7XHJcblxyXG4gICAgcHJpdmF0ZSBfaXNMb2FkZWQgOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF9sb2FkRmFpbGVkIDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfd2FpdGluZ0ZvckxvYWRTdWNjZXNzIDogKCgpID0+IGFueSlbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfd2FpdGluZ0ZvckxvYWRGYWlsIDogKCgpID0+IGFueSlbXSA9IFtdO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgdGhpcy5kb0xvYWQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldCBpc0xvYWRlZCAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc0xvYWRlZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGhhc0xvYWRGYWlsZWQgKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbG9hZEZhaWxlZFxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZnRlckxvYWQgKGxvYWRTdWNjZXNzQ2FsbGJhY2sgOiAoKSA9PiBhbnksIGxvYWRGYWlsQ2FsbGJhY2s/IDogKCkgPT4gYW55KSA6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGxvYWRTdWNjZXNzQ2FsbGJhY2soKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzTG9hZEZhaWxlZCkge1xyXG4gICAgICAgICAgICBpZiAobG9hZEZhaWxDYWxsYmFjayl7XHJcbiAgICAgICAgICAgICAgICBsb2FkRmFpbENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl93YWl0aW5nRm9yTG9hZFN1Y2Nlc3MucHVzaChsb2FkU3VjY2Vzc0NhbGxiYWNrKTtcclxuICAgICAgICAgICAgaWYgKGxvYWRGYWlsQ2FsbGJhY2spe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRGYWlsLnB1c2gobG9hZEZhaWxDYWxsYmFjayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBsb2FkU3VjY2VzcyAoKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2lzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiB0aGlzLl93YWl0aW5nRm9yTG9hZFN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGxvYWRGYWlsZWQgKGVycm9yIDogc3RyaW5nKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2xvYWRGYWlsZWQgPSB0cnVlO1xyXG4gICAgICAgIGZvciAobGV0IGNhbGxiYWNrIG9mIHRoaXMuX3dhaXRpbmdGb3JMb2FkRmFpbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl93YWl0aW5nRm9yTG9hZEZhaWwgPSBbXTtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xvYWRpbmcgZmFpbGVkIDogJyArIGVycm9yKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZG9Mb2FkICgpIDogdm9pZDtcclxufSIsImltcG9ydCB7RmFjZWJvb2tPcGVuaW5nSW5mb30gZnJvbSBcIi4vZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rT3BlbmluZ0luZm9cIjtcclxuaW1wb3J0IHtGYWNlYm9va0ZlZWR9IGZyb20gXCIuL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va0ZlZWRcIjtcclxuaW1wb3J0IHtSZW5TcG9ydENvbmZpZ30gZnJvbSBcIi4vUmVuU3BvcnRDb25maWdcIjtcclxuaW1wb3J0IHtyZW5kZXJPcGVuaW5nSW5mb30gZnJvbSBcIi4vdmlldy9PcGVuaW5nSW5mb1ZpZXdcIjtcclxuXHJcbmRlY2xhcmUgdmFyICQ6IGFueTtcclxuXHJcbmV4cG9ydCBjbGFzcyBSZW4ge1xyXG5cclxuICAgIHByaXZhdGUgX29wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbztcclxuICAgIHByaXZhdGUgX2ZlZWQgOiBGYWNlYm9va0ZlZWQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIGxldCBjb25maWcgOiBSZW5TcG9ydENvbmZpZyA9ICg8YW55PndpbmRvdykuUmVuU3BvcnRDb25maWc7XHJcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcubG9hZEhlYWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkSGVhZGVyKGNvbmZpZy5jb250ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2xvYWRGb290ZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcubG9hZE9wZW5pbmdIb3Vycykge1xyXG4gICAgICAgICAgICB0aGlzLl9vcGVuaW5nSW5mbyA9IG5ldyBGYWNlYm9va09wZW5pbmdJbmZvKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX29wZW5pbmdJbmZvLmFmdGVyTG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZW5kZXJPcGVuaW5nSW5mbyh0aGlzLl9vcGVuaW5nSW5mbywgPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZW4tb3BlbmluZ3N1cmVuLWhvb2snKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcubG9hZE5ld3NGZWVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZlZWQgPSBuZXcgRmFjZWJvb2tGZWVkKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZlZWQuYWZ0ZXJMb2FkKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZlZWQucmVuZGVyVG8oPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW4taG9tZXBhZ2UtbmV3c2ZlZWQnKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGZlZWQgKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9mZWVkO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2xvYWRIZWFkZXIgKGNvbnRleHQgOiBzdHJpbmcpIDogdm9pZCB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaG9vayA6IGFueSA9ICQoIFwiI3Jlbi1oZWFkZXJcIiApO1xyXG4gICAgICAgICAgICBob29rLmxvYWQoIFwiL2NvbXBvbmVudHMvaGVhZGVyLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29udGV4dE5hdmJhckVsZW1lbnQgOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaVtkYXRhLWNvbnRleHQtJyArIGNvbnRleHQudG9Mb3dlckNhc2UoKSArICddJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRleHROYXZiYXJFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHROYXZiYXJFbGVtZW50LmNsYXNzTmFtZSArPSAnYWN0aXZlJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9sb2FkRm9vdGVyICgpIDogdm9pZCB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaG9vayA6IGFueSA9ICQoIFwiI3Jlbi1mb290ZXJcIiApO1xyXG4gICAgICAgICAgICBob29rLmxvYWQoIFwiL2NvbXBvbmVudHMvZm9vdGVyLmh0bWxcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBvcGVuaW5nSW5mbyAoKSA6IEZhY2Vib29rT3BlbmluZ0luZm8ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcGVuaW5nSW5mbztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3Vic2NyaWJlVG9OZXdzbGV0dGVyICgpIHtcclxuICAgICAgICBsZXQgaW5wdXQgOiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jlbi1uaWV1d3NicmllZi1pbnB1dC1maWVsZCcpO1xyXG4gICAgICAgIGxldCBoaWRkZW5JbnB1dCA6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdnItaGlkZGVuLWlucHV0LWZpZWxkJyksXHJcbiAgICAgICAgICAgIGhpZGRlblN1Ym1pdCA6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2ci1oaWRkZW4tc3VibWl0LWJ0bicpO1xyXG5cclxuICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQudmFsdWUgJiYgaGlkZGVuSW5wdXQgJiYgaGlkZGVuU3VibWl0KSB7XHJcbiAgICAgICAgICAgIGhpZGRlbklucHV0LnZhbHVlID0gaW5wdXQudmFsdWU7XHJcbiAgICAgICAgICAgIGhpZGRlblN1Ym1pdC5jbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7UmVufSBmcm9tIFwiLi9SZW5cIjtcclxuXHJcbig8YW55PndpbmRvdykuUmVuU3BvcnQgPSBuZXcgUmVuKCk7IiwiaW1wb3J0IHtGQkZlZWRSZXNwb25zZU9iamVjdCwgRkJQb3N0UmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7TG9hZGFibGV9IGZyb20gXCIuLi9Mb2FkYWJsZVwiO1xyXG5pbXBvcnQge0ZhY2Vib29rUHJveHl9IGZyb20gXCIuL0ZhY2Vib29rUHJveHlcIjtcclxuaW1wb3J0IHtGYWNlYm9va1Bvc3R9IGZyb20gXCIuL0ZhY2Vib29rUG9zdFwiO1xyXG5pbXBvcnQge3BhcnNlSlNPTn0gZnJvbSBcIi4uL3V0aWwvSlNPTlV0aWxzXCI7XHJcbmltcG9ydCB7bWFudWFsRmFjZWJvb2tGZWVkfSBmcm9tIFwiLi9NYW51YWxGZWVkYm9va0ZlZWRcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va0ZlZWQgZXh0ZW5kcyBMb2FkYWJsZSB7XHJcblxyXG4gICAgcHJpdmF0ZSBfcG9zdHMgOiBBcnJheTxGYWNlYm9va1Bvc3Q+ID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBwb3N0cyAoKSA6IEFycmF5PEZhY2Vib29rUG9zdD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wb3N0cztcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxsZWQgYnkgc3VwZXIoKTtcclxuICAgIHByb3RlY3RlZCBkb0xvYWQgKCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5LmZlZWQoKHJlcyA6IEZCRmVlZFJlc3BvbnNlT2JqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzLmVycm9yICYmIHJlcy5mZWVkICYmIHJlcy5mZWVkLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkUG9zdHNGcm9tUmVzcG9uc2UocmVzLmZlZWQuZGF0YSlcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghcmVzLmVycm9yICYmIHBhcnNlSlNPTig8YW55PnJlcykgJiYgcGFyc2VKU09OKDxhbnk+cmVzKS5mZWVkICYmIHBhcnNlSlNPTig8YW55PnJlcykuZmVlZC5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFBvc3RzRnJvbVJlc3BvbnNlKHBhcnNlSlNPTig8YW55PnJlcy5mZWVkLmRhdGEpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkUG9zdHNGcm9tUmVzcG9uc2UobWFudWFsRmFjZWJvb2tGZWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hZGRQb3N0c0Zyb21SZXNwb25zZShtYW51YWxGYWNlYm9va0ZlZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkUG9zdHNGcm9tUmVzcG9uc2UgKHJlcyA6IEZCUG9zdFJlc3BvbnNlW10pIDogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgcG9zdCBvZiByZXMpe1xyXG4gICAgICAgICAgICB0aGlzLl9wb3N0cy5wdXNoKG5ldyBGYWNlYm9va1Bvc3QocG9zdCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxvYWRTdWNjZXNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB2aWV3ICgpIDogSFRNTEVsZW1lbnRbXSB7XHJcbiAgICAgICAgbGV0IHZpZXcgOiBIVE1MRWxlbWVudFtdID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBkaXNwbGF5aW5nUG9zdHMgPSAwOyBkaXNwbGF5aW5nUG9zdHMgPCBNYXRoLm1pbih0aGlzLnBvc3RzLmxlbmd0aCwgNSk7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcG9zdCA9IHRoaXMucG9zdHNbaV07XHJcbiAgICAgICAgICAgIGlmIChwb3N0LmNhbkRpc3BsYXkpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcucHVzaChwb3N0LnZpZXcpO1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheWluZ1Bvc3RzKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlclRvIChwYXJlbnQgOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGZvciAobGV0IHBvc3RWaWV3IG9mIHRoaXMudmlldykge1xyXG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQocG9zdFZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7RkJIb3Vyc1Jlc3BvbnNlfSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0xvYWRhYmxlfSBmcm9tIFwiLi4vTG9hZGFibGVcIjtcclxuaW1wb3J0IHtGYWNlYm9va1Byb3h5fSBmcm9tIFwiLi9GYWNlYm9va1Byb3h5XCI7XHJcbmltcG9ydCB7cGFyc2VKU09OfSBmcm9tIFwiLi4vdXRpbC9KU09OVXRpbHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va09wZW5pbmdJbmZvIGV4dGVuZHMgTG9hZGFibGUge1xyXG5cclxuICAgIHB1YmxpYyBtb25kYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHR1ZXNkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHdlZG5lc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgdGh1cnNkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIGZyaWRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgc2F0dXJkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHN1bmRheSA6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgcHVibGljIGdldCBpc0N1cnJlbnRseU9wZW4gKCkgOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgbm93IDogRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgIGRheSA9IGpzVmFsdWVUb0RheShub3cuZ2V0RGF5KCkpLFxyXG4gICAgICAgICAgICBpbmZvRm9yRGF5ID0gKDxhbnk+dGhpcylbZGF5XTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmZvRm9yRGF5Lmxlbmd0aDsgaSs9Mikge1xyXG4gICAgICAgICAgICBpZiAobGllc05vd0luSW50ZXJ2YWwoaW5mb0ZvckRheVtpXSwgaW5mb0ZvckRheVtpKzFdKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FsbGVkIGJ5IHN1cGVyKCk7XHJcbiAgICBwcm90ZWN0ZWQgZG9Mb2FkICgpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5vcGVuaW5naG91cnMoKHJvdWdoZGF0YSA6IEZCSG91cnNSZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJvdWdoZGF0YS5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZURhdGEocm91Z2hkYXRhKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZFN1Y2Nlc3MoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZEZhaWxlZChyb3VnaGRhdGEuZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnNlRGF0YSg8YW55PntcclxuICAgICAgICAgICAgICAgIGhvdXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJtb25fMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtb25fMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtb25fM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtb25fNFwiOiBcIjE4OjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWRfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWRfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWRfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ3ZWRfNFwiOiBcIjE4OjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ0aHVfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ0aHVfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ0aHVfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ0aHVfNFwiOiBcIjE4OjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJmcmlfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJmcmlfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJmcmlfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJmcmlfNFwiOiBcIjE5OjAwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzYXRfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzYXRfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzYXRfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzYXRfNFwiOiBcIjE4OjMwXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZFN1Y2Nlc3MoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHBhcnNlRGF0YSAocm91Z2hkYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygcm91Z2hkYXRhID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByb3VnaGRhdGEgPSBwYXJzZUpTT04oPGFueT5yb3VnaGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1vbmRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdtb24nKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy50dWVzZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3R1ZScpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLndlZG5lc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd3ZWQnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy50aHVyc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd0aHUnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5mcmlkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignZnJpJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuc2F0dXJkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignc2F0JykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuc3VuZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3N1bicpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGF5VG9WYWx1ZSAoZGF5IDogc3RyaW5nKSA6IG51bWJlcntcclxuICAgIGlmIChkYXkgPT09J21vbicpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSd0dWUnKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nd2VkJykge1xyXG4gICAgICAgIHJldHVybiAyO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3RodScpIHtcclxuICAgICAgICByZXR1cm4gMztcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSdmcmknKSB7XHJcbiAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nc2F0Jykge1xyXG4gICAgICAgIHJldHVybiA1O1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3N1bicpIHtcclxuICAgICAgICByZXR1cm4gNjtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ganNWYWx1ZVRvRGF5ICh2YWx1ZSA6IG51bWJlcikgOiBzdHJpbmd7XHJcbiAgICBpZiAodmFsdWUgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gJ3N1bmRheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuICdtb25kYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMikge1xyXG4gICAgICAgIHJldHVybiAndHVlc2RheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAzKSB7XHJcbiAgICAgICAgcmV0dXJuICd3ZWRuZXNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gNCkge1xyXG4gICAgICAgIHJldHVybiAndGh1cnNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gNSkge1xyXG4gICAgICAgIHJldHVybiAnZnJpZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDYpIHtcclxuICAgICAgICByZXR1cm4gJ3NhdHVyZGF5JztcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ganNEYXlWYWx1ZSAoZGF5IDogc3RyaW5nKSA6IG51bWJlciB7XHJcbiAgICByZXR1cm4gKChkYXlUb1ZhbHVlKGRheSkgKyAxKSAlIDcpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb21wYXJlT3BlbmluZ0luZm8gKGEgOiBzdHJpbmcsIGIgOiBzdHJpbmcpIHtcclxuICAgIGxldCBpbmZvQSA9IGEuc3BsaXQoJ18nKSxcclxuICAgICAgICBpbmZvQiA9IGIuc3BsaXQoJ18nKTtcclxuXHJcbiAgICBpZiAocGFyc2VJbnQoaW5mb0FbMV0pIDwgcGFyc2VJbnQoaW5mb0JbMV0pKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSBlbHNlIGlmIChwYXJzZUludChpbmZvQVsxXSkgPiBwYXJzZUludChpbmZvQlsxXSkpe1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoaW5mb0FbMl0gPT09ICdvcGVuJyl7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9IGVsc2UgcmV0dXJuIDE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvVGltaW5ncyAob3BlbmluZ1RpbWUgOiBzdHJpbmdbXSwgcm91Z2hEYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSA6IHN0cmluZ1tdIHtcclxuICAgIGxldCB0aW1pbmdzIDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBvcGVuaW5nIG9mIG9wZW5pbmdUaW1lKSB7XHJcbiAgICAgICAgdGltaW5ncy5wdXNoKHJvdWdoRGF0YS5ob3Vyc1tvcGVuaW5nXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGltaW5ncztcclxufVxyXG5cclxuZnVuY3Rpb24gbGllc05vd0luSW50ZXJ2YWwgKHN0YXJ0IDogc3RyaW5nLCBlbmQgOiBzdHJpbmcpIDogYm9vbGVhbiB7XHJcblxyXG4gICAgbGV0IG5vdyA6IERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIHN0YXJ0SG91cnNNaW51dGVzICA9IHN0YXJ0LnNwbGl0KCc6JyksXHJcbiAgICAgICAgc3RhcnREYXRlIDogRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgc3RhcnRIb3VyIDogbnVtYmVyID0gcGFyc2VJbnQoc3RhcnRIb3Vyc01pbnV0ZXNbMF0pLFxyXG4gICAgICAgIHN0YXJ0TWludXRlcyA6IG51bWJlciA9IHBhcnNlSW50KHN0YXJ0SG91cnNNaW51dGVzWzFdKSxcclxuICAgICAgICBlbmRIb3Vyc01pbnV0ZXMgID0gZW5kLnNwbGl0KCc6JyksXHJcbiAgICAgICAgZW5kRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgZW5kSG91ciA6IG51bWJlciA9IHBhcnNlSW50KGVuZEhvdXJzTWludXRlc1swXSksXHJcbiAgICAgICAgZW5kTWludXRlcyA6IG51bWJlciA9IHBhcnNlSW50KGVuZEhvdXJzTWludXRlc1sxXSk7XHJcblxyXG4gICAgc3RhcnREYXRlLnNldEhvdXJzKHN0YXJ0SG91cik7XHJcbiAgICBzdGFydERhdGUuc2V0TWludXRlcyhzdGFydE1pbnV0ZXMpO1xyXG4gICAgZW5kRGF0ZS5zZXRIb3VycyhlbmRIb3VyKTtcclxuICAgIGVuZERhdGUuc2V0TWludXRlcyhlbmRNaW51dGVzKTtcclxuXHJcbiAgICByZXR1cm4gbm93ID49IHN0YXJ0RGF0ZSAmJiBub3cgPCBlbmREYXRlO1xyXG59IiwiaW1wb3J0IHtGQlBvc3RSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtJbWFnZVRhZ30gZnJvbSBcIi4uL2xpYnJhcnkvU2NyaXB0VGFnXCI7XHJcbmltcG9ydCB7RkJfUEFHRV9JRH0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5pbXBvcnQge2xpbmtpZnl9IGZyb20gXCIuLi91dGlsL0xpbmtpZnlcIjtcclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rUG9zdCB7XHJcblxyXG4gICAgcHJpdmF0ZSBpbmZvIDogRkJQb3N0UmVzcG9uc2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKGluZm8gOiBGQlBvc3RSZXNwb25zZSkge1xyXG4gICAgICAgIHRoaXMuaW5mbyA9IGluZm87XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjYW5EaXNwbGF5ICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmluZm8uaXNfaGlkZGVuICYmIHRoaXMuaW5mby5pc19wdWJsaXNoZWQgJiYgdGhpcy5pbmZvLmZyb20gJiYgdGhpcy5pbmZvLmZyb20uaWQgPT09IEZCX1BBR0VfSUQgJiYgISF0aGlzLm1lc3NhZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjcmVhdGVkICgpIDogRGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuaW5mby5jcmVhdGVkX3RpbWUuc3BsaXQoJysnKVswXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBpZCAoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5mby5pZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG1lc3NhZ2UgKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZm8ubWVzc2FnZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldCBwaWN0dXJlICgpIDogSW1hZ2VUYWcge1xyXG4gICAgICAgIGlmICh0aGlzLmluZm8uZnVsbF9waWN0dXJlKSB7XHJcbiAgICAgICAgICAgIGxldCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLmluZm8uZnVsbF9waWN0dXJlO1xyXG4gICAgICAgICAgICBpbWFnZS5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0taW1nJztcclxuICAgICAgICAgICAgcmV0dXJuIGltYWdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyVG8gKHBhcmVudCA6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FuRGlzcGxheSkge1xyXG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy52aWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB2aWV3ICgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCB2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgdmlldy5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tY29udGFpbmVyJztcclxuXHJcbiAgICAgICAgbGV0IGRhdGVWaWV3ID0gdGhpcy5jcmVhdGVEYXRlVmlldygpO1xyXG4gICAgICAgIHZpZXcuYXBwZW5kQ2hpbGQoZGF0ZVZpZXcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBjb250ZW50VmlldyA9IHRoaXMuY3JlYXRlQ29udGVudFZpZXcoKTtcclxuICAgICAgICB2aWV3LmFwcGVuZENoaWxkKGNvbnRlbnRWaWV3KTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNyZWF0ZUNvbnRlbnRWaWV3ICgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCBjb250ZW50Q29udGFpbmVyIDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBjb250ZW50Q29udGFpbmVyLmNsYXNzTmFtZSA9ICdyZW4tY29udGVudC1pdGVtLWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGxldCBuZXdzRmVlZENvbnRlbnRDb250YWluZXIgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIG5ld3NGZWVkQ29udGVudENvbnRhaW5lci5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tY29udGVudC1jb250YWluZXInO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGxldCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XHJcbiAgICAgICAgICAgIHRpdGxlLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS10aXRsZSc7XHJcblxyXG4gICAgICAgICAgICBsZXQgZmlyc3RTZW50ZW5jZSA9IHRoaXMubWVzc2FnZS5tYXRjaChmaXJzdFNlbnRlbmNlUmVnZXgpIHx8IHRoaXMubWVzc2FnZS5tYXRjaChmaXJzdFNlbnRlbmNlQmVmb3JlTmV3bGluZVJlZ2V4KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmaXJzdFNlbnRlbmNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZS5pbm5lckhUTUwgPSBmaXJzdFNlbnRlbmNlLm1hcChmdW5jdGlvbihzKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCcnKTtcclxuICAgICAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5ld3NGZWVkQ29udGVudENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aXRsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwaWN0dXJlID0gdGhpcy5waWN0dXJlO1xyXG4gICAgICAgIGlmIChwaWN0dXJlKSB7XHJcbiAgICAgICAgICAgIG5ld3NGZWVkQ29udGVudENvbnRhaW5lci5hcHBlbmRDaGlsZChwaWN0dXJlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgIG1lc3NhZ2UuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLXRleHQnO1xyXG4gICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9IHRoaXMubWVzc2FnZSAmJiBsaW5raWZ5KHRoaXMubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIG5ld3NGZWVkQ29udGVudENvbnRhaW5lci5hcHBlbmRDaGlsZChtZXNzYWdlKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBjb250ZW50Q29udGFpbmVyLmFwcGVuZENoaWxkKG5ld3NGZWVkQ29udGVudENvbnRhaW5lcik7XHJcbiAgICAgICAgcmV0dXJuIGNvbnRlbnRDb250YWluZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVEYXRlVmlldyAoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBsZXQgZGF0ZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGRhdGVDb250YWluZXIuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWRhdGUtY29udGFpbmVyJztcclxuXHJcbiAgICAgICAgbGV0IGRhdGVEYXlMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gxJyk7XHJcbiAgICAgICAgZGF0ZURheUxhYmVsLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1kYXRlLWRheSc7XHJcbiAgICAgICAgZGF0ZURheUxhYmVsLmlubmVyVGV4dCA9ICcnK3RoaXMuY3JlYXRlZC5nZXREYXRlKCk7XHJcbiAgICAgICAgZGF0ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChkYXRlRGF5TGFiZWwpO1xyXG5cclxuICAgICAgICBsZXQgZGF0ZU1vbnRoWWVhckxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDYnKTtcclxuICAgICAgICBkYXRlTW9udGhZZWFyTGFiZWwuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWRhdGUtbW9udGgteWVhcic7XHJcbiAgICAgICAgZGF0ZU1vbnRoWWVhckxhYmVsLmlubmVyVGV4dCA9IG1vbnRoc1t0aGlzLmNyZWF0ZWQuZ2V0TW9udGgoKV0gKyAnICcgKyB0aGlzLmNyZWF0ZWQuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICBkYXRlQ29udGFpbmVyLmFwcGVuZENoaWxkKGRhdGVNb250aFllYXJMYWJlbCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkYXRlQ29udGFpbmVyO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBtb250aHMgOiBzdHJpbmdbXSA9IFtcclxuICAgICdKYW4nLCAnRmViJywgJ01hYScsICdBcHInLCAnTWVpJywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPa3QnLCAnTm92JywgJ0RlYydcclxuXTtcclxuXHJcbmNvbnN0IGZpcnN0U2VudGVuY2VSZWdleCA6IFJlZ0V4cCA9IC9eLio/W1xcLiFcXD9dKD86XFxzfCQpL2c7XHJcbmNvbnN0IGZpcnN0U2VudGVuY2VCZWZvcmVOZXdsaW5lUmVnZXggOiBSZWdFeHAgPSAvXi4qP1tcXG5dKD86XFxzfCQpL2c7IiwiaW1wb3J0IHtGQlJlc3BvbnNlfSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0xvYWRhYmxlfSBmcm9tIFwiLi4vTG9hZGFibGVcIjtcclxuaW1wb3J0IHtTY3JpcHRUYWd9IGZyb20gXCIuLi9saWJyYXJ5L1NjcmlwdFRhZ1wiO1xyXG5cclxuY29uc3QgcHJveHlVUkwgPSAnaHR0cHM6Ly9yZW5zZWN1cml0eXByb3h5LXNhbWdpZWxpcy5yaGNsb3VkLmNvbS8nO1xyXG5leHBvcnQgY29uc3QgRkJfUEFHRV9JRCA6IHN0cmluZyA9IFwiMjE1NDcwMzQxOTA5OTM3XCI7XHJcblxyXG5pbnRlcmZhY2UgSUZhY2Vib29rU0RLIHtcclxuICAgIGluaXQgOiBhbnk7XHJcbiAgICBhcGkgKGdyYXBocGF0aCA6IHN0cmluZywgY2FsbGJhY2sgOiAocmVzcG9uc2UgOiBGQlJlc3BvbnNlKSA9PiBhbnkpIDogdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rUHJveHkge1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZmVlZCAgKHN1Y2MgOiAoaW5mbyA6IEZCUmVzcG9uc2UpID0+IHZvaWQsIGZhaWw/IDogKCkgPT4gdm9pZCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5LmdldCgnZmVlZCcsIHN1Y2MsIGZhaWwpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgb3BlbmluZ2hvdXJzICAoc3VjYyA6IChpbmZvIDogRkJSZXNwb25zZSkgPT4gdm9pZCwgZmFpbD8gOiAoKSA9PiB2b2lkKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkuZ2V0KCdvcGVuaW5naG91cnMnLCBzdWNjLCBmYWlsKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0ICh1cmwgOiBzdHJpbmcsIHN1Y2MgOiAoaW5mbyA6IEZCUmVzcG9uc2UpID0+IHZvaWQsIGZhaWw/IDogKCkgPT4gdm9pZCkgOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIHhoci5vcGVuKCdnZXQnLCBwcm94eVVSTCArIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XHJcbiAgICAgICAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBzdWNjKHhoci5yZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoZmFpbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZhaWwoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSBmYWlsO1xyXG4gICAgICAgICAgICB4aHIuc2VuZCgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYoZmFpbCkge1xyXG4gICAgICAgICAgICAgICAgZmFpbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtGQlBvc3RSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtGQl9QQUdFX0lEfSBmcm9tIFwiLi9GYWNlYm9va1Byb3h5XCI7XHJcblxyXG5leHBvcnQgY29uc3QgbWFudWFsRmFjZWJvb2tGZWVkOiBGQlBvc3RSZXNwb25zZVtdID0gW1xyXG4gICAgbWFudWFsRmFjZWJvb2tQb3N0SW1wb3J0KFxyXG4gICAgICAgICdEaWtrZSBwcm9maWNpYXQgdm9vciBvbnplIHJvZGUgZHVpdmVscyB2YW4gaGV0IFJlbiBTcG9ydCB0ZWFtLicsXHJcbiAgICAgICAgJzIwMTgvMDcvMDcnLFxyXG4gICAgICAgICdodHRwczovL3Njb250ZW50LWJydTItMS54eC5mYmNkbi5uZXQvdi90MS4wLTkvMzY3NzA2NDZfNzM3ODUxNzE2MzM4NDYxXzIxMTY5NzcyNTEyMTA3NTYwOTZfbi5qcGc/X25jX2NhdD0wJm9oPTdhZjg0NDUzNjhkYTNhYWY4YmYzY2VlOGEzNGFiMDA2Jm9lPTVCREM3MUJGJ1xyXG4gICAgKSxcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnSGVlbCB3YXJtIHdlZXIsIHZlZWwgZHJpbmtlbiEhIVxcbicgK1xyXG4gICAgICAgICdXYXQgZHJpbmtlbiB2b29yIGVuIG5hIGVlbiB0cmFpbmluZy8gd2Vkc3RyaWpkP1xcbicgK1xyXG4gICAgICAgICdOSUVVVyBiaWogUmVuIFNwb3J0IGlzIE9WRVJTVElNUy5cXG4nICtcclxuICAgICAgICAnRWVuIGlkZWFhbCB2b29yZGVlbHBha2tldCB2b29yIGRlIG1hcmF0aG9ubG9wZXJzLCBtZXQgZXh0cmEgZWVuIGJhbmQgdm9vciB1IG51bW1lciBlbiBqZSBlbmVyZ2llZ2VscyB2b29yIG9uZGVyd2VnLicsXHJcbiAgICAgICAgJzIwMTgvMDcvMDQnLFxyXG4gICAgICAgICdodHRwczovL3Njb250ZW50LWJydTItMS54eC5mYmNkbi5uZXQvdi90MS4wLTkvMzY2ODI2MTNfNzM0ODAwNzE5OTc2ODk0XzQ5NzU1NTkwNjY1Mzg0NzU1Ml9uLmpwZz9fbmNfY2F0PTAmb2g9ZTg3ZWNhYzVkM2UzZmI5NTcxMmVjMjVhOWFjNGZiYjgmb2U9NUJEMzYzQUUnXHJcbiAgICApLFxyXG4gICAgbWFudWFsRmFjZWJvb2tQb3N0SW1wb3J0KFxyXG4gICAgICAgICdNZXNzYWxpbmEgUGllcm9uaSwgbW9vaSBhcnRpa2VsIGVuIG1vb2kgZm90b+KAmXMuJyxcclxuICAgICAgICAnMjAxOC8wNy8wMycsXHJcbiAgICAgICAgJ2h0dHBzOi8vc2NvbnRlbnQtYnJ1Mi0xLnh4LmZiY2RuLm5ldC92L3QxLjAtOS8zNjUzMTA5NF83MzM0MzUxMTY3ODAxMjFfMTkzOTgyMTgxMTczNDY3NTQ1Nl9uLmpwZz9fbmNfY2F0PTAmb2g9NmM3YjUzMTQ4MjJkYzk0M2Y4Yjg2ZjY3Y2Y0ODc3ZTcmb2U9NUJERTRGQTMnXHJcbiAgICApLFxyXG4gICAgbWFudWFsRmFjZWJvb2tQb3N0SW1wb3J0KFxyXG4gICAgICAgICdLb29wamVzISEhISEhIFxcbicgK1xyXG4gICAgICAgICdXaWwgamUgZ29lZCBzcG9ydGdlcmllZiwgYmlqIFJlbiBTcG9ydCBtb2V0IGplIHppam4uJyxcclxuICAgICAgICAnMjAxOC8wNy8wMScsXHJcbiAgICAgICAgJ2h0dHBzOi8vc2NvbnRlbnQtYnJ1Mi0xLnh4LmZiY2RuLm5ldC92L3QxLjAtOS8zNjUyMDU2M183MzExNzE4NjAzMzk3ODBfODIyNjU3NjQ2MzIyMzA2MjUyOF9vLmpwZz9fbmNfY2F0PTAmb2g9MjJmZGRlNmI0NGM2ZTk1MzU4OGNhNzI5ZjMwMGQxZGEmb2U9NUJFQkJCODQnXHJcbiAgICApXHJcbl07XHJcblxyXG5mdW5jdGlvbiBtYW51YWxGYWNlYm9va1Bvc3RJbXBvcnQobWVzc2FnZTogc3RyaW5nLCBkYXRlOiBzdHJpbmcsIHBpY3R1cmU6IHN0cmluZyk6IEZCUG9zdFJlc3BvbnNlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY3JlYXRlZF90aW1lOiBkYXRlLFxyXG4gICAgICAgIGZ1bGxfcGljdHVyZTogcGljdHVyZSxcclxuICAgICAgICBpZDogJ2lkJyxcclxuICAgICAgICBpc19oaWRkZW46IGZhbHNlLFxyXG4gICAgICAgIGlzX3B1Ymxpc2hlZDogdHJ1ZSxcclxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxyXG4gICAgICAgIGZyb206IHtcclxuICAgICAgICAgICAgbmFtZTogJycsXHJcbiAgICAgICAgICAgIGlkOiBGQl9QQUdFX0lELFxyXG4gICAgICAgICAgICBlcnJvcjogJydcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yOiAnJ1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSlNPTiAoanNvbiA6IHN0cmluZykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBsZXQgcGFyc2VkT2JqZWN0ID0gSlNPTi5wYXJzZShqc29uKTtcclxuICAgICAgICByZXR1cm4gcGFyc2VkT2JqZWN0O1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7ICAgXHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZnVuY3Rpb24gbGlua2lmeSAoaW5wdXRUZXh0IDogc3RyaW5nKSA6IHN0cmluZyB7XHJcbiAgICB2YXIgcmVwbGFjZWRUZXh0IDogc3RyaW5nLFxyXG4gICAgICAgIHJlcGxhY2VQYXR0ZXJuMSA6IFJlZ0V4cCwgcmVwbGFjZVBhdHRlcm4yIDogUmVnRXhwLCByZXBsYWNlUGF0dGVybjMgOiBSZWdFeHA7XHJcblxyXG4gICAgLy9VUkxzIHN0YXJ0aW5nIHdpdGggaHR0cDovLywgaHR0cHM6Ly8sIG9yIGZ0cDovL1xyXG4gICAgcmVwbGFjZVBhdHRlcm4xID0gLyhcXGIoaHR0cHM/fGZ0cCk6XFwvXFwvWy1BLVowLTkrJkAjXFwvJT89fl98ITosLjtdKlstQS1aMC05KyZAI1xcLyU9fl98XSkvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gaW5wdXRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4xLCAnPGEgaHJlZj1cIiQxXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JDE8L2E+Jyk7XHJcblxyXG4gICAgLy9VUkxzIHN0YXJ0aW5nIHdpdGggXCJ3d3cuXCIgKHdpdGhvdXQgLy8gYmVmb3JlIGl0LCBvciBpdCdkIHJlLWxpbmsgdGhlIG9uZXMgZG9uZSBhYm92ZSkuXHJcbiAgICByZXBsYWNlUGF0dGVybjIgPSAvKF58W15cXC9dKSh3d3dcXC5bXFxTXSsoXFxifCQpKS9naW07XHJcbiAgICByZXBsYWNlZFRleHQgPSByZXBsYWNlZFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybjIsICckMTxhIGhyZWY9XCJodHRwOi8vJDJcIiB0YXJnZXQ9XCJfYmxhbmtcIj4kMjwvYT4nKTtcclxuXHJcbiAgICAvL0NoYW5nZSBlbWFpbCBhZGRyZXNzZXMgdG8gbWFpbHRvOjogbGlua3MuXHJcbiAgICByZXBsYWNlUGF0dGVybjMgPSAvKChbYS16QS1aMC05XFwtXFxfXFwuXSkrQFthLXpBLVpcXF9dKz8oXFwuW2EtekEtWl17Miw2fSkrKS9naW07XHJcbiAgICByZXBsYWNlZFRleHQgPSByZXBsYWNlZFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybjMsICc8YSBocmVmPVwibWFpbHRvOiQxXCI+JDE8L2E+Jyk7XHJcblxyXG4gICAgcmV0dXJuIHJlcGxhY2VkVGV4dDtcclxufSIsImltcG9ydCB7RmFjZWJvb2tPcGVuaW5nSW5mb30gZnJvbSBcIi4uL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvXCI7XHJcblxyXG5jb25zdCBkYXlzIDogc3RyaW5nW10gPSBbXHJcbiAgICAnbW9uZGF5JywgJ3R1ZXNkYXknLCAnd2VkbmVzZGF5JywgJ3RodXJzZGF5JywgJ2ZyaWRheScsICdzYXR1cmRheScsICdzdW5kYXknXHJcbl07XHJcblxyXG5jb25zdCBkYXlzVHJhbnNsYXRpb24gOiB7W2RheSA6IHN0cmluZ10gOiBzdHJpbmd9ID0ge1xyXG4gICAgJ21vbmRheScgOiAnTS4nLFxyXG4gICAgJ3R1ZXNkYXknIDogJ0QuJyxcclxuICAgICd3ZWRuZXNkYXknIDogJ1cuJyxcclxuICAgICd0aHVyc2RheScgOiAnRC4nLFxyXG4gICAgJ2ZyaWRheScgOiAnVi4nLFxyXG4gICAgJ3NhdHVyZGF5JyA6ICdaLicsXHJcbiAgICAnc3VuZGF5JyA6ICdaLidcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJPcGVuaW5nSW5mbyAob3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvLCByb290IDogSFRNTEVsZW1lbnQpIDogdm9pZCB7XHJcbiAgICBpZiAoIXJvb3QpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCB0eXBlID0gcm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmlld3R5cGUnKTtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ21vZGVzdCcgOlxyXG4gICAgICAgICAgICByZW5kZXJNb2Rlc3RPcGVuaW5nSW5mb1ZpZXcob3BlbmluZ0luZm8sIHJvb3QpO1xyXG4gICAgfVxyXG4gICAgLypsZXQgcm9vdCA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBmb3IgKGxldCBkYXkgb2YgZGF5cykge1xyXG4gICAgICAgIGxldCBkYXl2aWV3ID0gZGF5VmlldyhkYXksICg8YW55Pm9wZW5pbmdJbmZvKVtkYXldKTtcclxuICAgICAgICByb290LmFwcGVuZENoaWxkKGRheXZpZXcpO1xyXG4gICAgfVxyXG4gICAgcm9vdC5hcHBlbmRDaGlsZChjdXJyZW50bHlPcGVuVmlldyhvcGVuaW5nSW5mby5pc0N1cnJlbnRseU9wZW4pKTtcclxuICAgIHJldHVybiByb290OyovXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck1vZGVzdE9wZW5pbmdJbmZvVmlldyAob3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvLCByb290IDogSFRNTEVsZW1lbnQpIDogdm9pZCB7XHJcbiAgICByb290LmFwcGVuZENoaWxkKG1vZGVzdFdlZWtWaWV3KG9wZW5pbmdJbmZvKSk7XHJcbiAgICByb290LmFwcGVuZENoaWxkKG1vZGVzdElzT3BlbkluZGljYXRvcihvcGVuaW5nSW5mbykpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3RJc09wZW5JbmRpY2F0b3IgKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbykgOiBIVE1MRWxlbWVudCB7XHJcbiAgICBsZXQgY29udGFpbmVyIDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1tb2Rlc3QtaW5kaWNhdG9yJztcclxuXHJcbiAgICBsZXQgaW5kaWNhdG9yVGV4dCA6IEhUTUxTcGFuRWxlbWVudDtcclxuICAgIGluZGljYXRvclRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICBpbmRpY2F0b3JUZXh0LmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLW1vZGVzdC1pbmRpY2F0b3ItbGFiZWwnO1xyXG5cclxuICAgIGxldCBjb250YWN0T3B0aW9ucyA6IEFycmF5PEhUTUxFbGVtZW50PiA9IFtdO1xyXG4gICAgY29udGFjdE9wdGlvbnMucHVzaChtb2Rlc3RBY3ROb3dMaW5rKCdtYWlsdG86aW5mb0ByZW5zcG9ydC5iZScsICdmYS1lbnZlbG9wZScpKTtcclxuXHJcbiAgICBzd2l0Y2ggKG9wZW5pbmdJbmZvLmlzQ3VycmVudGx5T3Blbikge1xyXG4gICAgICAgIGNhc2UgdHJ1ZSA6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc05hbWUgKz0gJyByZW4tb3BlbmluZ3N1cmVuLW9wZW4nO1xyXG4gICAgICAgICAgICBpbmRpY2F0b3JUZXh0LmlubmVyVGV4dCA9ICdOdSBvcGVuISc7XHJcbiAgICAgICAgICAgIGNvbnRhY3RPcHRpb25zLnB1c2gobW9kZXN0QWN0Tm93TGluaygndGVsOiszMjEzNjY3NDYwJywgJ2ZhLXBob25lJykpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGZhbHNlIDpcclxuICAgICAgICAgICAgY29udGFpbmVyLmNsYXNzTmFtZSArPSAnIHJlbi1vcGVuaW5nc3VyZW4tY2xvc2VkJztcclxuICAgICAgICAgICAgaW5kaWNhdG9yVGV4dC5pbm5lclRleHQgPSAnR2VzbG90ZW4nO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5kaWNhdG9yVGV4dCk7XHJcblxyXG4gICAgZm9yIChsZXQgY29udGFjdE9wdGlvbiBvZiBjb250YWN0T3B0aW9ucykge1xyXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjb250YWN0T3B0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29udGFpbmVyO1xyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0V2Vla1ZpZXcgKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbykgOiBIVE1MRWxlbWVudCB7XHJcbiAgICBsZXQgdGFibGUgOiBIVE1MVGFibGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuXHJcbiAgICBpZiAob3BlbmluZ0luZm8uaXNDdXJyZW50bHlPcGVuKSB7XHJcbiAgICAgICAgdGFibGUuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tb3Blbic7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRhYmxlLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLWNsb3NlZCc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZvciAobGV0IGRheSBvZiBkYXlzKSB7XHJcbiAgICAgICAgbGV0IGRheXZpZXcgOiBIVE1MVGFibGVSb3dFbGVtZW50ID0gbW9kZXN0RGF5VmlldyhkYXksICg8YW55Pm9wZW5pbmdJbmZvKVtkYXldKTtcclxuICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGFibGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdERheVZpZXcgKGRheSA6IHN0cmluZywgaG91cnMgOiBzdHJpbmdbXSkgOiBIVE1MVGFibGVSb3dFbGVtZW50IHtcclxuICAgIGxldCB0YWJsZVJvdyA6IEhUTUxUYWJsZVJvd0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG4gICAgaWYgKGRheSA9PT0gZGF5c1tuZXcgRGF0ZSgpLmdldERheSgpIC0gMV0pIHtcclxuICAgICAgICB0YWJsZVJvdy5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1jdXJyZW50ZGF5JztcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGF5dmlldyA6IEhUTUxUYWJsZURhdGFDZWxsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyksXHJcbiAgICAgICAgaG91cnZpZXcgOiBIVE1MVGFibGVEYXRhQ2VsbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cclxuICAgIGRheXZpZXcuaW5uZXJUZXh0ID0gZGF5c1RyYW5zbGF0aW9uW2RheV07XHJcbiAgICBob3Vydmlldy5pbm5lclRleHQgPSBtb2Rlc3RIb3VyVmlldyhob3Vycyk7XHJcblxyXG5cclxuICAgIHRhYmxlUm93LmFwcGVuZENoaWxkKGRheXZpZXcpO1xyXG4gICAgdGFibGVSb3cuYXBwZW5kQ2hpbGQoaG91cnZpZXcpO1xyXG5cclxuICAgIHJldHVybiB0YWJsZVJvdztcclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0SG91clZpZXcgKGhvdXJzIDogc3RyaW5nW10pIDogc3RyaW5nIHtcclxuICAgIGxldCBob3VydmlldyA9ICcnO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3Vycy5sZW5ndGg7IGkrPTIpIHtcclxuICAgICAgICBob3VydmlldyArPSBob3Vyc1tpXSArICcgLSAnICsgaG91cnNbaSsxXTtcclxuICAgICAgICBpZiAoaSsxICE9IGhvdXJzLmxlbmd0aC0xKSB7XHJcbiAgICAgICAgICAgIGhvdXJ2aWV3ICs9ICcsICc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGhvdXJ2aWV3IHx8ICdHZXNsb3Rlbic7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdEFjdE5vd0xpbmsgKGhyZWYgOiBzdHJpbmcsIGljb25OYW1lIDogc3RyaW5nKSA6IEhUTUxFbGVtZW50IHtcclxuXHJcbiAgICBsZXQgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgIGEuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4taW5kaWNhdG9yLWN0YS1saW5rJztcclxuICAgIGEuaHJlZiA9IGhyZWY7XHJcblxyXG4gICAgbGV0IGljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpJyk7XHJcbiAgICBpY29uLmNsYXNzTmFtZSA9ICdmYSAnICsgaWNvbk5hbWUgKyAnIGZhLWxnJztcclxuXHJcbiAgICBhLmFwcGVuZENoaWxkKGljb24pO1xyXG5cclxuICAgIHJldHVybiBhO1xyXG59Il19
