(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
                contextNavbarElement.className += 'active';
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
},{"./facebookplugins/FacebookFeed":4,"./facebookplugins/FacebookOpeningInfo":5,"./view/OpeningInfoView":10}],3:[function(require,module,exports){
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
                _this.addPostsFromResponse(res);
            }
            else if (!res.error && JSONUtils_1.parseJSON(res) && JSONUtils_1.parseJSON(res).feed && JSONUtils_1.parseJSON(res).feed.data) {
                _this.addPostsFromResponse(JSONUtils_1.parseJSON(res));
            }
            else {
                _this.loadFailed(res.error);
            }
        });
    };
    FacebookFeed.prototype.addPostsFromResponse = function (res) {
        for (var _i = 0, _a = res.feed.data; _i < _a.length; _i++) {
            var post = _a[_i];
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
},{"../Loadable":1,"../util/JSONUtils":8,"./FacebookPost":6,"./FacebookProxy":7}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Loadable_1 = require("../Loadable");
var FacebookProxy_1 = require("./FacebookProxy");
var FacebookOpeningInfo = (function (_super) {
    __extends(FacebookOpeningInfo, _super);
    function FacebookOpeningInfo() {
        _super.call(this);
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
        });
    };
    FacebookOpeningInfo.prototype.parseData = function (roughdata) {
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
},{"../Loadable":1,"./FacebookProxy":7}],6:[function(require,module,exports){
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
            return new Date(this.info.created_time);
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
            title.innerHTML = this.message.match(firstSentenceRegex).map(function (s) {
                return s.replace(/^\s+|\s+$/g, '');
            })[0];
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
},{"../util/Linkify":9,"./FacebookProxy":7}],7:[function(require,module,exports){
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
        xhr.send();
    };
    return FacebookProxy;
}());
exports.FacebookProxy = FacebookProxy;
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTG9hZGFibGUudHMiLCJzcmMvUmVuLnRzIiwic3JjL1Jlbkdsb2JhbC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va1Bvc3QudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rUHJveHkudHMiLCJzcmMvdXRpbC9KU09OVXRpbHMudHMiLCJzcmMvdXRpbC9MaW5raWZ5LnRzIiwic3JjL3ZpZXcvT3BlbmluZ0luZm9WaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0lBT0k7UUFMUSxjQUFTLEdBQWEsS0FBSyxDQUFDO1FBQzVCLGdCQUFXLEdBQWEsS0FBSyxDQUFDO1FBQzlCLDJCQUFzQixHQUFtQixFQUFFLENBQUM7UUFDNUMsd0JBQW1CLEdBQW1CLEVBQUUsQ0FBQztRQUc3QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELHNCQUFXLDhCQUFRO2FBQW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVyxtQ0FBYTthQUF4QjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFBO1FBQzNCLENBQUM7OztPQUFBO0lBRU0sNEJBQVMsR0FBaEIsVUFBa0IsbUJBQStCLEVBQUUsZ0JBQTZCO1FBQzVFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLG1CQUFtQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FB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b24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydCBhYnN0cmFjdCBjbGFzcyBMb2FkYWJsZSB7XHJcblxyXG4gICAgcHJpdmF0ZSBfaXNMb2FkZWQgOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF9sb2FkRmFpbGVkIDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfd2FpdGluZ0ZvckxvYWRTdWNjZXNzIDogKCgpID0+IGFueSlbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfd2FpdGluZ0ZvckxvYWRGYWlsIDogKCgpID0+IGFueSlbXSA9IFtdO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgdGhpcy5kb0xvYWQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldCBpc0xvYWRlZCAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc0xvYWRlZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGhhc0xvYWRGYWlsZWQgKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbG9hZEZhaWxlZFxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZnRlckxvYWQgKGxvYWRTdWNjZXNzQ2FsbGJhY2sgOiAoKSA9PiBhbnksIGxvYWRGYWlsQ2FsbGJhY2s/IDogKCkgPT4gYW55KSA6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGxvYWRTdWNjZXNzQ2FsbGJhY2soKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzTG9hZEZhaWxlZCkge1xyXG4gICAgICAgICAgICBpZiAobG9hZEZhaWxDYWxsYmFjayl7XHJcbiAgICAgICAgICAgICAgICBsb2FkRmFpbENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl93YWl0aW5nRm9yTG9hZFN1Y2Nlc3MucHVzaChsb2FkU3VjY2Vzc0NhbGxiYWNrKTtcclxuICAgICAgICAgICAgaWYgKGxvYWRGYWlsQ2FsbGJhY2spe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRGYWlsLnB1c2gobG9hZEZhaWxDYWxsYmFjayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBsb2FkU3VjY2VzcyAoKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2lzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiB0aGlzLl93YWl0aW5nRm9yTG9hZFN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGxvYWRGYWlsZWQgKGVycm9yIDogc3RyaW5nKSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2xvYWRGYWlsZWQgPSB0cnVlO1xyXG4gICAgICAgIGZvciAobGV0IGNhbGxiYWNrIG9mIHRoaXMuX3dhaXRpbmdGb3JMb2FkRmFpbCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl93YWl0aW5nRm9yTG9hZEZhaWwgPSBbXTtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xvYWRpbmcgZmFpbGVkIDogJyArIGVycm9yKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZG9Mb2FkICgpIDogdm9pZDtcclxufSIsImltcG9ydCB7RmFjZWJvb2tPcGVuaW5nSW5mb30gZnJvbSBcIi4vZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rT3BlbmluZ0luZm9cIjtcclxuaW1wb3J0IHtGYWNlYm9va0ZlZWR9IGZyb20gXCIuL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va0ZlZWRcIjtcclxuaW1wb3J0IHtSZW5TcG9ydENvbmZpZ30gZnJvbSBcIi4vUmVuU3BvcnRDb25maWdcIjtcclxuaW1wb3J0IHtyZW5kZXJPcGVuaW5nSW5mb30gZnJvbSBcIi4vdmlldy9PcGVuaW5nSW5mb1ZpZXdcIjtcclxuXHJcbmRlY2xhcmUgdmFyICQ6IGFueTtcclxuXHJcbmV4cG9ydCBjbGFzcyBSZW4ge1xyXG5cclxuICAgIHByaXZhdGUgX29wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbztcclxuICAgIHByaXZhdGUgX2ZlZWQgOiBGYWNlYm9va0ZlZWQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIGxldCBjb25maWcgOiBSZW5TcG9ydENvbmZpZyA9ICg8YW55PndpbmRvdykuUmVuU3BvcnRDb25maWc7XHJcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcubG9hZEhlYWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkSGVhZGVyKGNvbmZpZy5jb250ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2xvYWRGb290ZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcubG9hZE9wZW5pbmdIb3Vycykge1xyXG4gICAgICAgICAgICB0aGlzLl9vcGVuaW5nSW5mbyA9IG5ldyBGYWNlYm9va09wZW5pbmdJbmZvKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX29wZW5pbmdJbmZvLmFmdGVyTG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZW5kZXJPcGVuaW5nSW5mbyh0aGlzLl9vcGVuaW5nSW5mbywgPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZW4tb3BlbmluZ3N1cmVuLWhvb2snKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcubG9hZE5ld3NGZWVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZlZWQgPSBuZXcgRmFjZWJvb2tGZWVkKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZlZWQuYWZ0ZXJMb2FkKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZlZWQucmVuZGVyVG8oPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW4taG9tZXBhZ2UtbmV3c2ZlZWQnKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBmZWVkICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmVlZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9sb2FkSGVhZGVyIChjb250ZXh0IDogc3RyaW5nKSA6IHZvaWQge1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGhvb2sgOiBhbnkgPSAkKCBcIiNyZW4taGVhZGVyXCIgKTtcclxuICAgICAgICAgICAgaG9vay5sb2FkKCBcIi9jb21wb25lbnRzL2hlYWRlci5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRleHROYXZiYXJFbGVtZW50IDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlbZGF0YS1jb250ZXh0LScgKyBjb250ZXh0LnRvTG93ZXJDYXNlKCkgKyAnXScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHROYXZiYXJFbGVtZW50LmNsYXNzTmFtZSArPSAnYWN0aXZlJztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2xvYWRGb290ZXIgKCkgOiB2b2lkIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBob29rIDogYW55ID0gJCggXCIjcmVuLWZvb3RlclwiICk7XHJcbiAgICAgICAgICAgIGhvb2subG9hZCggXCIvY29tcG9uZW50cy9mb290ZXIuaHRtbFwiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG9wZW5pbmdJbmZvICgpIDogRmFjZWJvb2tPcGVuaW5nSW5mbyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wZW5pbmdJbmZvO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdWJzY3JpYmVUb05ld3NsZXR0ZXIgKCkge1xyXG4gICAgICAgIGxldCBpbnB1dCA6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVuLW5pZXV3c2JyaWVmLWlucHV0LWZpZWxkJyk7XHJcbiAgICAgICAgbGV0IGhpZGRlbklucHV0IDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2ci1oaWRkZW4taW5wdXQtZmllbGQnKSxcclxuICAgICAgICAgICAgaGlkZGVuU3VibWl0IDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3ZyLWhpZGRlbi1zdWJtaXQtYnRuJyk7XHJcblxyXG4gICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dC52YWx1ZSAmJiBoaWRkZW5JbnB1dCAmJiBoaWRkZW5TdWJtaXQpIHtcclxuICAgICAgICAgICAgaGlkZGVuSW5wdXQudmFsdWUgPSBpbnB1dC52YWx1ZTtcclxuICAgICAgICAgICAgaGlkZGVuU3VibWl0LmNsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtSZW59IGZyb20gXCIuL1JlblwiO1xyXG5cclxuKDxhbnk+d2luZG93KS5SZW5TcG9ydCA9IG5ldyBSZW4oKTsiLCJpbXBvcnQge0ZCRmVlZFJlc3BvbnNlT2JqZWN0fSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0xvYWRhYmxlfSBmcm9tIFwiLi4vTG9hZGFibGVcIjtcclxuaW1wb3J0IHtGYWNlYm9va1Byb3h5fSBmcm9tIFwiLi9GYWNlYm9va1Byb3h5XCI7XHJcbmltcG9ydCB7RmFjZWJvb2tQb3N0fSBmcm9tIFwiLi9GYWNlYm9va1Bvc3RcIjtcclxuaW1wb3J0IHtwYXJzZUpTT059IGZyb20gXCIuLi91dGlsL0pTT05VdGlsc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rRmVlZCBleHRlbmRzIExvYWRhYmxlIHtcclxuXHJcbiAgICBwcml2YXRlIF9wb3N0cyA6IEFycmF5PEZhY2Vib29rUG9zdD4gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHBvc3RzICgpIDogQXJyYXk8RmFjZWJvb2tQb3N0PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc3RzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGxlZCBieSBzdXBlcigpO1xyXG4gICAgcHJvdGVjdGVkIGRvTG9hZCAoKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkuZmVlZCgocmVzIDogRkJGZWVkUmVzcG9uc2VPYmplY3QpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyZXMuZXJyb3IgJiYgcmVzLmZlZWQgJiYgcmVzLmZlZWQuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRQb3N0c0Zyb21SZXNwb25zZShyZXMpXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXJlcy5lcnJvciAmJiBwYXJzZUpTT04oPGFueT5yZXMpICYmIHBhcnNlSlNPTig8YW55PnJlcykuZmVlZCAmJiBwYXJzZUpTT04oPGFueT5yZXMpLmZlZWQuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRQb3N0c0Zyb21SZXNwb25zZShwYXJzZUpTT04oPGFueT5yZXMpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZEZhaWxlZChyZXMuZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGRQb3N0c0Zyb21SZXNwb25zZSAocmVzIDogRkJGZWVkUmVzcG9uc2VPYmplY3QpIDogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgcG9zdCBvZiByZXMuZmVlZC5kYXRhKXtcclxuICAgICAgICAgICAgdGhpcy5fcG9zdHMucHVzaChuZXcgRmFjZWJvb2tQb3N0KHBvc3QpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sb2FkU3VjY2VzcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdmlldyAoKSA6IEhUTUxFbGVtZW50W10ge1xyXG4gICAgICAgIGxldCB2aWV3IDogSFRNTEVsZW1lbnRbXSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMCwgZGlzcGxheWluZ1Bvc3RzID0gMDsgZGlzcGxheWluZ1Bvc3RzIDwgTWF0aC5taW4odGhpcy5wb3N0cy5sZW5ndGgsIDUpOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHBvc3QgPSB0aGlzLnBvc3RzW2ldO1xyXG4gICAgICAgICAgICBpZiAocG9zdC5jYW5EaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3LnB1c2gocG9zdC52aWV3KTtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlpbmdQb3N0cysrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXJUbyAocGFyZW50IDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBmb3IgKGxldCBwb3N0VmlldyBvZiB0aGlzLnZpZXcpIHtcclxuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHBvc3RWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0ZCSG91cnNSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7RmFjZWJvb2tQcm94eX0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rT3BlbmluZ0luZm8gZXh0ZW5kcyBMb2FkYWJsZSB7XHJcblxyXG4gICAgcHVibGljIG1vbmRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgdHVlc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgd2VkbmVzZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyB0aHVyc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgZnJpZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyBzYXR1cmRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgc3VuZGF5IDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlzQ3VycmVudGx5T3BlbiAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBub3cgOiBEYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgZGF5ID0ganNWYWx1ZVRvRGF5KG5vdy5nZXREYXkoKSksXHJcbiAgICAgICAgICAgIGluZm9Gb3JEYXkgPSAoPGFueT50aGlzKVtkYXldO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZm9Gb3JEYXkubGVuZ3RoOyBpKz0yKSB7XHJcbiAgICAgICAgICAgIGlmIChsaWVzTm93SW5JbnRlcnZhbChpbmZvRm9yRGF5W2ldLCBpbmZvRm9yRGF5W2krMV0pKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxsZWQgYnkgc3VwZXIoKTtcclxuICAgIHByb3RlY3RlZCBkb0xvYWQgKCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5Lm9wZW5pbmdob3Vycygocm91Z2hkYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcm91Z2hkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlRGF0YShyb3VnaGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkU3VjY2VzcygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkRmFpbGVkKHJvdWdoZGF0YS5lcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHBhcnNlRGF0YSAocm91Z2hkYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSB7XHJcbiAgICAgICAgdGhpcy5tb25kYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignbW9uJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMudHVlc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd0dWUnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy53ZWRuZXNkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignd2VkJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMudGh1cnNkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZigndGh1JykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuZnJpZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ2ZyaScpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnNhdHVyZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3NhdCcpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnN1bmRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdzdW4nKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRheVRvVmFsdWUgKGRheSA6IHN0cmluZykgOiBudW1iZXJ7XHJcbiAgICBpZiAoZGF5ID09PSdtb24nKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0ndHVlJykge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3dlZCcpIHtcclxuICAgICAgICByZXR1cm4gMjtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSd0aHUnKSB7XHJcbiAgICAgICAgcmV0dXJuIDM7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nZnJpJykge1xyXG4gICAgICAgIHJldHVybiA0O1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3NhdCcpIHtcclxuICAgICAgICByZXR1cm4gNTtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSdzdW4nKSB7XHJcbiAgICAgICAgcmV0dXJuIDY7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpzVmFsdWVUb0RheSAodmFsdWUgOiBudW1iZXIpIDogc3RyaW5ne1xyXG4gICAgaWYgKHZhbHVlID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuICdzdW5kYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMSkge1xyXG4gICAgICAgIHJldHVybiAnbW9uZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDIpIHtcclxuICAgICAgICByZXR1cm4gJ3R1ZXNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMykge1xyXG4gICAgICAgIHJldHVybiAnd2VkbmVzZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDQpIHtcclxuICAgICAgICByZXR1cm4gJ3RodXJzZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDUpIHtcclxuICAgICAgICByZXR1cm4gJ2ZyaWRheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSA2KSB7XHJcbiAgICAgICAgcmV0dXJuICdzYXR1cmRheSc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpzRGF5VmFsdWUgKGRheSA6IHN0cmluZykgOiBudW1iZXIge1xyXG4gICAgcmV0dXJuICgoZGF5VG9WYWx1ZShkYXkpICsgMSkgJSA3KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29tcGFyZU9wZW5pbmdJbmZvIChhIDogc3RyaW5nLCBiIDogc3RyaW5nKSB7XHJcbiAgICBsZXQgaW5mb0EgPSBhLnNwbGl0KCdfJyksXHJcbiAgICAgICAgaW5mb0IgPSBiLnNwbGl0KCdfJyk7XHJcblxyXG4gICAgaWYgKHBhcnNlSW50KGluZm9BWzFdKSA8IHBhcnNlSW50KGluZm9CWzFdKSkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoaW5mb0FbMV0pID4gcGFyc2VJbnQoaW5mb0JbMV0pKXtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGluZm9BWzJdID09PSAnb3Blbicpe1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfSBlbHNlIHJldHVybiAxO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB0b1RpbWluZ3MgKG9wZW5pbmdUaW1lIDogc3RyaW5nW10sIHJvdWdoRGF0YSA6IEZCSG91cnNSZXNwb25zZSkgOiBzdHJpbmdbXSB7XHJcbiAgICBsZXQgdGltaW5ncyA6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgb3BlbmluZyBvZiBvcGVuaW5nVGltZSkge1xyXG4gICAgICAgIHRpbWluZ3MucHVzaChyb3VnaERhdGEuaG91cnNbb3BlbmluZ10pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRpbWluZ3M7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxpZXNOb3dJbkludGVydmFsIChzdGFydCA6IHN0cmluZywgZW5kIDogc3RyaW5nKSA6IGJvb2xlYW4ge1xyXG5cclxuICAgIGxldCBub3cgOiBEYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICBzdGFydEhvdXJzTWludXRlcyAgPSBzdGFydC5zcGxpdCgnOicpLFxyXG4gICAgICAgIHN0YXJ0RGF0ZSA6IERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIHN0YXJ0SG91ciA6IG51bWJlciA9IHBhcnNlSW50KHN0YXJ0SG91cnNNaW51dGVzWzBdKSxcclxuICAgICAgICBzdGFydE1pbnV0ZXMgOiBudW1iZXIgPSBwYXJzZUludChzdGFydEhvdXJzTWludXRlc1sxXSksXHJcbiAgICAgICAgZW5kSG91cnNNaW51dGVzICA9IGVuZC5zcGxpdCgnOicpLFxyXG4gICAgICAgIGVuZERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIGVuZEhvdXIgOiBudW1iZXIgPSBwYXJzZUludChlbmRIb3Vyc01pbnV0ZXNbMF0pLFxyXG4gICAgICAgIGVuZE1pbnV0ZXMgOiBudW1iZXIgPSBwYXJzZUludChlbmRIb3Vyc01pbnV0ZXNbMV0pO1xyXG5cclxuICAgIHN0YXJ0RGF0ZS5zZXRIb3VycyhzdGFydEhvdXIpO1xyXG4gICAgc3RhcnREYXRlLnNldE1pbnV0ZXMoc3RhcnRNaW51dGVzKTtcclxuICAgIGVuZERhdGUuc2V0SG91cnMoZW5kSG91cik7XHJcbiAgICBlbmREYXRlLnNldE1pbnV0ZXMoZW5kTWludXRlcyk7XHJcblxyXG4gICAgcmV0dXJuIG5vdyA+PSBzdGFydERhdGUgJiYgbm93IDwgZW5kRGF0ZTtcclxufSIsImltcG9ydCB7RkJQb3N0UmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7SW1hZ2VUYWd9IGZyb20gXCIuLi9saWJyYXJ5L1NjcmlwdFRhZ1wiO1xyXG5pbXBvcnQge0ZCX1BBR0VfSUR9IGZyb20gXCIuL0ZhY2Vib29rUHJveHlcIjtcclxuaW1wb3J0IHtsaW5raWZ5fSBmcm9tIFwiLi4vdXRpbC9MaW5raWZ5XCI7XHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1Bvc3Qge1xyXG5cclxuICAgIHByaXZhdGUgaW5mbyA6IEZCUG9zdFJlc3BvbnNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yIChpbmZvIDogRkJQb3N0UmVzcG9uc2UpIHtcclxuICAgICAgICB0aGlzLmluZm8gPSBpbmZvO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgY2FuRGlzcGxheSAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5pbmZvLmlzX2hpZGRlbiAmJiB0aGlzLmluZm8uaXNfcHVibGlzaGVkICYmIHRoaXMuaW5mby5mcm9tICYmIHRoaXMuaW5mby5mcm9tLmlkID09PSBGQl9QQUdFX0lEICYmICEhdGhpcy5tZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgY3JlYXRlZCAoKSA6IERhdGUge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmluZm8uY3JlYXRlZF90aW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlkICgpIDogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmZvLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbWVzc2FnZSAoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5mby5tZXNzYWdlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IHBpY3R1cmUgKCkgOiBJbWFnZVRhZyB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5mby5mdWxsX3BpY3R1cmUpIHtcclxuICAgICAgICAgICAgbGV0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IHRoaXMuaW5mby5mdWxsX3BpY3R1cmU7XHJcbiAgICAgICAgICAgIGltYWdlLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1pbWcnO1xyXG4gICAgICAgICAgICByZXR1cm4gaW1hZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXJUbyAocGFyZW50IDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5jYW5EaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLnZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHZpZXcgKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB2aWV3LmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1jb250YWluZXInO1xyXG5cclxuICAgICAgICBsZXQgZGF0ZVZpZXcgPSB0aGlzLmNyZWF0ZURhdGVWaWV3KCk7XHJcbiAgICAgICAgdmlldy5hcHBlbmRDaGlsZChkYXRlVmlldyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGNvbnRlbnRWaWV3ID0gdGhpcy5jcmVhdGVDb250ZW50VmlldygpO1xyXG4gICAgICAgIHZpZXcuYXBwZW5kQ2hpbGQoY29udGVudFZpZXcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlQ29udGVudFZpZXcgKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IGNvbnRlbnRDb250YWluZXIgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGNvbnRlbnRDb250YWluZXIuY2xhc3NOYW1lID0gJ3Jlbi1jb250ZW50LWl0ZW0tY29udGFpbmVyJztcclxuXHJcbiAgICAgICAgbGV0IG5ld3NGZWVkQ29udGVudENvbnRhaW5lciA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgbmV3c0ZlZWRDb250ZW50Q29udGFpbmVyLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1jb250ZW50LWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgbGV0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcclxuICAgICAgICAgICAgdGl0bGUuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLXRpdGxlJztcclxuICAgICAgICAgICAgdGl0bGUuaW5uZXJIVE1MID0gdGhpcy5tZXNzYWdlLm1hdGNoKGZpcnN0U2VudGVuY2VSZWdleCkubWFwKGZ1bmN0aW9uKHMpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMucmVwbGFjZSgvXlxccyt8XFxzKyQvZywnJyk7XHJcbiAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQodGl0bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgcGljdHVyZSA9IHRoaXMucGljdHVyZTtcclxuICAgICAgICBpZiAocGljdHVyZSkge1xyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQocGljdHVyZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICBtZXNzYWdlLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS10ZXh0JztcclxuICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLm1lc3NhZ2UgJiYgbGlua2lmeSh0aGlzLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQobWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgY29udGVudENvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdzRmVlZENvbnRlbnRDb250YWluZXIpO1xyXG4gICAgICAgIHJldHVybiBjb250ZW50Q29udGFpbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlRGF0ZVZpZXcgKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IGRhdGVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBkYXRlQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1kYXRlLWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGxldCBkYXRlRGF5TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMScpO1xyXG4gICAgICAgIGRhdGVEYXlMYWJlbC5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tZGF0ZS1kYXknO1xyXG4gICAgICAgIGRhdGVEYXlMYWJlbC5pbm5lclRleHQgPSAnJyt0aGlzLmNyZWF0ZWQuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIGRhdGVDb250YWluZXIuYXBwZW5kQ2hpbGQoZGF0ZURheUxhYmVsKTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGVNb250aFllYXJMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g2Jyk7XHJcbiAgICAgICAgZGF0ZU1vbnRoWWVhckxhYmVsLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1kYXRlLW1vbnRoLXllYXInO1xyXG4gICAgICAgIGRhdGVNb250aFllYXJMYWJlbC5pbm5lclRleHQgPSBtb250aHNbdGhpcy5jcmVhdGVkLmdldE1vbnRoKCldICsgJyAnICsgdGhpcy5jcmVhdGVkLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgZGF0ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChkYXRlTW9udGhZZWFyTGFiZWwpO1xyXG5cclxuICAgICAgICByZXR1cm4gZGF0ZUNvbnRhaW5lcjtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgbW9udGhzIDogc3RyaW5nW10gPSBbXHJcbiAgICAnSmFuJywgJ0ZlYicsICdNYWEnLCAnQXByJywgJ01laScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2t0JywgJ05vdicsICdEZWMnXHJcbl07XHJcblxyXG5jb25zdCBmaXJzdFNlbnRlbmNlUmVnZXggOiBSZWdFeHAgPSAvXi4qP1tcXC4hXFw/XSg/Olxcc3wkKS9nOyIsImltcG9ydCB7RkJSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7U2NyaXB0VGFnfSBmcm9tIFwiLi4vbGlicmFyeS9TY3JpcHRUYWdcIjtcclxuXHJcbmNvbnN0IHByb3h5VVJMID0gJ2h0dHBzOi8vcmVuc2VjdXJpdHlwcm94eS1zYW1naWVsaXMucmhjbG91ZC5jb20vJztcclxuZXhwb3J0IGNvbnN0IEZCX1BBR0VfSUQgOiBzdHJpbmcgPSBcIjIxNTQ3MDM0MTkwOTkzN1wiO1xyXG5cclxuaW50ZXJmYWNlIElGYWNlYm9va1NESyB7XHJcbiAgICBpbml0IDogYW55O1xyXG4gICAgYXBpIChncmFwaHBhdGggOiBzdHJpbmcsIGNhbGxiYWNrIDogKHJlc3BvbnNlIDogRkJSZXNwb25zZSkgPT4gYW55KSA6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1Byb3h5IHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGZlZWQgIChzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5nZXQoJ2ZlZWQnLCBzdWNjLCBmYWlsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIG9wZW5pbmdob3VycyAgKHN1Y2MgOiAoaW5mbyA6IEZCUmVzcG9uc2UpID0+IHZvaWQsIGZhaWw/IDogKCkgPT4gdm9pZCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5LmdldCgnb3BlbmluZ2hvdXJzJywgc3VjYywgZmFpbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc3RhdGljIGdldCAodXJsIDogc3RyaW5nLCBzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgIHhoci5vcGVuKCdnZXQnLCBwcm94eVVSTCArIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcclxuICAgICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzO1xyXG4gICAgICAgICAgICBpZiAoc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgc3VjYyh4aHIucmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoZmFpbCkge1xyXG4gICAgICAgICAgICAgICAgZmFpbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB4aHIuc2VuZCgpO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSlNPTiAoanNvbiA6IHN0cmluZykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBsZXQgcGFyc2VkT2JqZWN0ID0gSlNPTi5wYXJzZShqc29uKTtcclxuICAgICAgICByZXR1cm4gcGFyc2VkT2JqZWN0O1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7ICAgXHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZnVuY3Rpb24gbGlua2lmeSAoaW5wdXRUZXh0IDogc3RyaW5nKSA6IHN0cmluZyB7XHJcbiAgICB2YXIgcmVwbGFjZWRUZXh0IDogc3RyaW5nLFxyXG4gICAgICAgIHJlcGxhY2VQYXR0ZXJuMSA6IFJlZ0V4cCwgcmVwbGFjZVBhdHRlcm4yIDogUmVnRXhwLCByZXBsYWNlUGF0dGVybjMgOiBSZWdFeHA7XHJcblxyXG4gICAgLy9VUkxzIHN0YXJ0aW5nIHdpdGggaHR0cDovLywgaHR0cHM6Ly8sIG9yIGZ0cDovL1xyXG4gICAgcmVwbGFjZVBhdHRlcm4xID0gLyhcXGIoaHR0cHM/fGZ0cCk6XFwvXFwvWy1BLVowLTkrJkAjXFwvJT89fl98ITosLjtdKlstQS1aMC05KyZAI1xcLyU9fl98XSkvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gaW5wdXRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4xLCAnPGEgaHJlZj1cIiQxXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JDE8L2E+Jyk7XHJcblxyXG4gICAgLy9VUkxzIHN0YXJ0aW5nIHdpdGggXCJ3d3cuXCIgKHdpdGhvdXQgLy8gYmVmb3JlIGl0LCBvciBpdCdkIHJlLWxpbmsgdGhlIG9uZXMgZG9uZSBhYm92ZSkuXHJcbiAgICByZXBsYWNlUGF0dGVybjIgPSAvKF58W15cXC9dKSh3d3dcXC5bXFxTXSsoXFxifCQpKS9naW07XHJcbiAgICByZXBsYWNlZFRleHQgPSByZXBsYWNlZFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybjIsICckMTxhIGhyZWY9XCJodHRwOi8vJDJcIiB0YXJnZXQ9XCJfYmxhbmtcIj4kMjwvYT4nKTtcclxuXHJcbiAgICAvL0NoYW5nZSBlbWFpbCBhZGRyZXNzZXMgdG8gbWFpbHRvOjogbGlua3MuXHJcbiAgICByZXBsYWNlUGF0dGVybjMgPSAvKChbYS16QS1aMC05XFwtXFxfXFwuXSkrQFthLXpBLVpcXF9dKz8oXFwuW2EtekEtWl17Miw2fSkrKS9naW07XHJcbiAgICByZXBsYWNlZFRleHQgPSByZXBsYWNlZFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybjMsICc8YSBocmVmPVwibWFpbHRvOiQxXCI+JDE8L2E+Jyk7XHJcblxyXG4gICAgcmV0dXJuIHJlcGxhY2VkVGV4dDtcclxufSIsImltcG9ydCB7RmFjZWJvb2tPcGVuaW5nSW5mb30gZnJvbSBcIi4uL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvXCI7XHJcblxyXG5jb25zdCBkYXlzIDogc3RyaW5nW10gPSBbXHJcbiAgICAnbW9uZGF5JywgJ3R1ZXNkYXknLCAnd2VkbmVzZGF5JywgJ3RodXJzZGF5JywgJ2ZyaWRheScsICdzYXR1cmRheScsICdzdW5kYXknXHJcbl07XHJcblxyXG5jb25zdCBkYXlzVHJhbnNsYXRpb24gOiB7W2RheSA6IHN0cmluZ10gOiBzdHJpbmd9ID0ge1xyXG4gICAgJ21vbmRheScgOiAnTS4nLFxyXG4gICAgJ3R1ZXNkYXknIDogJ0QuJyxcclxuICAgICd3ZWRuZXNkYXknIDogJ1cuJyxcclxuICAgICd0aHVyc2RheScgOiAnRC4nLFxyXG4gICAgJ2ZyaWRheScgOiAnVi4nLFxyXG4gICAgJ3NhdHVyZGF5JyA6ICdaLicsXHJcbiAgICAnc3VuZGF5JyA6ICdaLidcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJPcGVuaW5nSW5mbyAob3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvLCByb290IDogSFRNTEVsZW1lbnQpIDogdm9pZCB7XHJcbiAgICBsZXQgdHlwZSA9IHJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLXZpZXd0eXBlJyk7XHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlICdtb2Rlc3QnIDpcclxuICAgICAgICAgICAgcmVuZGVyTW9kZXN0T3BlbmluZ0luZm9WaWV3KG9wZW5pbmdJbmZvLCByb290KTtcclxuICAgIH1cclxuICAgIC8qbGV0IHJvb3QgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZm9yIChsZXQgZGF5IG9mIGRheXMpIHtcclxuICAgICAgICBsZXQgZGF5dmlldyA9IGRheVZpZXcoZGF5LCAoPGFueT5vcGVuaW5nSW5mbylbZGF5XSk7XHJcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIH1cclxuICAgIHJvb3QuYXBwZW5kQ2hpbGQoY3VycmVudGx5T3BlblZpZXcob3BlbmluZ0luZm8uaXNDdXJyZW50bHlPcGVuKSk7XHJcbiAgICByZXR1cm4gcm9vdDsqL1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJNb2Rlc3RPcGVuaW5nSW5mb1ZpZXcgKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbywgcm9vdCA6IEhUTUxFbGVtZW50KSA6IHZvaWQge1xyXG4gICAgcm9vdC5hcHBlbmRDaGlsZChtb2Rlc3RXZWVrVmlldyhvcGVuaW5nSW5mbykpO1xyXG4gICAgcm9vdC5hcHBlbmRDaGlsZChtb2Rlc3RJc09wZW5JbmRpY2F0b3Iob3BlbmluZ0luZm8pKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0SXNPcGVuSW5kaWNhdG9yIChvcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm8pIDogSFRNTEVsZW1lbnQge1xyXG4gICAgbGV0IGNvbnRhaW5lciA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tbW9kZXN0LWluZGljYXRvcic7XHJcblxyXG4gICAgbGV0IGluZGljYXRvclRleHQgOiBIVE1MU3BhbkVsZW1lbnQ7XHJcbiAgICBpbmRpY2F0b3JUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgaW5kaWNhdG9yVGV4dC5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1tb2Rlc3QtaW5kaWNhdG9yLWxhYmVsJztcclxuXHJcbiAgICBsZXQgY29udGFjdE9wdGlvbnMgOiBBcnJheTxIVE1MRWxlbWVudD4gPSBbXTtcclxuICAgIGNvbnRhY3RPcHRpb25zLnB1c2gobW9kZXN0QWN0Tm93TGluaygnbWFpbHRvOmluZm9AcmVuc3BvcnQuYmUnLCAnZmEtZW52ZWxvcGUnKSk7XHJcblxyXG4gICAgc3dpdGNoIChvcGVuaW5nSW5mby5pc0N1cnJlbnRseU9wZW4pIHtcclxuICAgICAgICBjYXNlIHRydWUgOlxyXG4gICAgICAgICAgICBjb250YWluZXIuY2xhc3NOYW1lICs9ICcgcmVuLW9wZW5pbmdzdXJlbi1vcGVuJztcclxuICAgICAgICAgICAgaW5kaWNhdG9yVGV4dC5pbm5lclRleHQgPSAnTnUgb3BlbiEnO1xyXG4gICAgICAgICAgICBjb250YWN0T3B0aW9ucy5wdXNoKG1vZGVzdEFjdE5vd0xpbmsoJ3RlbDorMzIxMzY2NzQ2MCcsICdmYS1waG9uZScpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBmYWxzZSA6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc05hbWUgKz0gJyByZW4tb3BlbmluZ3N1cmVuLWNsb3NlZCc7XHJcbiAgICAgICAgICAgIGluZGljYXRvclRleHQuaW5uZXJUZXh0ID0gJ0dlc2xvdGVuJztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGluZGljYXRvclRleHQpO1xyXG5cclxuICAgIGZvciAobGV0IGNvbnRhY3RPcHRpb24gb2YgY29udGFjdE9wdGlvbnMpIHtcclxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY29udGFjdE9wdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdFdlZWtWaWV3IChvcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm8pIDogSFRNTEVsZW1lbnQge1xyXG4gICAgbGV0IHRhYmxlIDogSFRNTFRhYmxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcblxyXG4gICAgaWYgKG9wZW5pbmdJbmZvLmlzQ3VycmVudGx5T3Blbikge1xyXG4gICAgICAgIHRhYmxlLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLW9wZW4nO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0YWJsZS5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1jbG9zZWQnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmb3IgKGxldCBkYXkgb2YgZGF5cykge1xyXG4gICAgICAgIGxldCBkYXl2aWV3IDogSFRNTFRhYmxlUm93RWxlbWVudCA9IG1vZGVzdERheVZpZXcoZGF5LCAoPGFueT5vcGVuaW5nSW5mbylbZGF5XSk7XHJcbiAgICAgICAgdGFibGUuYXBwZW5kQ2hpbGQoZGF5dmlldyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhYmxlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3REYXlWaWV3IChkYXkgOiBzdHJpbmcsIGhvdXJzIDogc3RyaW5nW10pIDogSFRNTFRhYmxlUm93RWxlbWVudCB7XHJcbiAgICBsZXQgdGFibGVSb3cgOiBIVE1MVGFibGVSb3dFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgIGlmIChkYXkgPT09IGRheXNbbmV3IERhdGUoKS5nZXREYXkoKSAtIDFdKSB7XHJcbiAgICAgICAgdGFibGVSb3cuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tY3VycmVudGRheSc7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRheXZpZXcgOiBIVE1MVGFibGVEYXRhQ2VsbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpLFxyXG4gICAgICAgIGhvdXJ2aWV3IDogSFRNTFRhYmxlRGF0YUNlbGxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICBkYXl2aWV3LmlubmVyVGV4dCA9IGRheXNUcmFuc2xhdGlvbltkYXldO1xyXG4gICAgaG91cnZpZXcuaW5uZXJUZXh0ID0gbW9kZXN0SG91clZpZXcoaG91cnMpO1xyXG5cclxuXHJcbiAgICB0YWJsZVJvdy5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIHRhYmxlUm93LmFwcGVuZENoaWxkKGhvdXJ2aWV3KTtcclxuXHJcbiAgICByZXR1cm4gdGFibGVSb3c7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdEhvdXJWaWV3IChob3VycyA6IHN0cmluZ1tdKSA6IHN0cmluZyB7XHJcbiAgICBsZXQgaG91cnZpZXcgPSAnJztcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG91cnMubGVuZ3RoOyBpKz0yKSB7XHJcbiAgICAgICAgaG91cnZpZXcgKz0gaG91cnNbaV0gKyAnIC0gJyArIGhvdXJzW2krMV07XHJcbiAgICAgICAgaWYgKGkrMSAhPSBob3Vycy5sZW5ndGgtMSkge1xyXG4gICAgICAgICAgICBob3VydmlldyArPSAnLCAnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBob3VydmlldyB8fCAnR2VzbG90ZW4nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3RBY3ROb3dMaW5rIChocmVmIDogc3RyaW5nLCBpY29uTmFtZSA6IHN0cmluZykgOiBIVE1MRWxlbWVudCB7XHJcblxyXG4gICAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICBhLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLWluZGljYXRvci1jdGEtbGluayc7XHJcbiAgICBhLmhyZWYgPSBocmVmO1xyXG5cclxuICAgIGxldCBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpO1xyXG4gICAgaWNvbi5jbGFzc05hbWUgPSAnZmEgJyArIGljb25OYW1lICsgJyBmYS1sZyc7XHJcblxyXG4gICAgYS5hcHBlbmRDaGlsZChpY29uKTtcclxuXHJcbiAgICByZXR1cm4gYTtcclxufSJdfQ==
