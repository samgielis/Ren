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
var JSONUtils_1 = require("../util/JSONUtils");
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
},{"../Loadable":1,"../util/JSONUtils":8,"./FacebookProxy":7}],6:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTG9hZGFibGUudHMiLCJzcmMvUmVuLnRzIiwic3JjL1Jlbkdsb2JhbC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va1Bvc3QudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rUHJveHkudHMiLCJzcmMvdXRpbC9KU09OVXRpbHMudHMiLCJzcmMvdXRpbC9MaW5raWZ5LnRzIiwic3JjL3ZpZXcvT3BlbmluZ0luZm9WaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0lBT0k7UUFMUSxjQUFTLEdBQWEsS0FBSyxDQUFDO1FBQzVCLGdCQUFXLEdBQWEsS0FBSyxDQUFDO1FBQzlCLDJCQUFzQixHQUFtQixFQUFFLENBQUM7UUFDNUMsd0JBQW1CLEdBQW1CLEVBQUUsQ0FBQztRQUc3QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELHNCQUFXLDhCQUFRO2FBQW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVyxtQ0FBYTthQUF4QjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFBO1FBQzNCLENBQUM7OztPQUFBO0lBRU0sNEJBQVMsR0FBaEIsVUFBa0IsbUJBQStCLEVBQUUsZ0JBQTZCO1FBQzVFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLG1CQUFtQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FB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Q0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztBQUNMLENBQUM7QUFFRCxzQkFBdUIsS0FBYztJQUNqQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFD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ZCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxHQUFHLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFFN0MsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVwQixNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2IsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgYWJzdHJhY3QgY2xhc3MgTG9hZGFibGUge1xyXG5cclxuICAgIHByaXZhdGUgX2lzTG9hZGVkIDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfbG9hZEZhaWxlZCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX3dhaXRpbmdGb3JMb2FkU3VjY2VzcyA6ICgoKSA9PiBhbnkpW10gPSBbXTtcclxuICAgIHByaXZhdGUgX3dhaXRpbmdGb3JMb2FkRmFpbCA6ICgoKSA9PiBhbnkpW10gPSBbXTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHRoaXMuZG9Mb2FkKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXQgaXNMb2FkZWQgKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNMb2FkZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBoYXNMb2FkRmFpbGVkICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvYWRGYWlsZWRcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWZ0ZXJMb2FkIChsb2FkU3VjY2Vzc0NhbGxiYWNrIDogKCkgPT4gYW55LCBsb2FkRmFpbENhbGxiYWNrPyA6ICgpID0+IGFueSkgOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRlZCkge1xyXG4gICAgICAgICAgICBsb2FkU3VjY2Vzc0NhbGxiYWNrKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0xvYWRGYWlsZWQpIHtcclxuICAgICAgICAgICAgaWYgKGxvYWRGYWlsQ2FsbGJhY2spe1xyXG4gICAgICAgICAgICAgICAgbG9hZEZhaWxDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzLnB1c2gobG9hZFN1Y2Nlc3NDYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGlmIChsb2FkRmFpbENhbGxiYWNrKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkRmFpbC5wdXNoKGxvYWRGYWlsQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgbG9hZFN1Y2Nlc3MgKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2VzcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsb2FkRmFpbGVkIChlcnJvciA6IHN0cmluZykgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9sb2FkRmFpbGVkID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiB0aGlzLl93YWl0aW5nRm9yTG9hZEZhaWwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRGYWlsID0gW107XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMb2FkaW5nIGZhaWxlZCA6ICcgKyBlcnJvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGRvTG9hZCAoKSA6IHZvaWQ7XHJcbn0iLCJpbXBvcnQge0ZhY2Vib29rT3BlbmluZ0luZm99IGZyb20gXCIuL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvXCI7XHJcbmltcG9ydCB7RmFjZWJvb2tGZWVkfSBmcm9tIFwiLi9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkXCI7XHJcbmltcG9ydCB7UmVuU3BvcnRDb25maWd9IGZyb20gXCIuL1JlblNwb3J0Q29uZmlnXCI7XHJcbmltcG9ydCB7cmVuZGVyT3BlbmluZ0luZm99IGZyb20gXCIuL3ZpZXcvT3BlbmluZ0luZm9WaWV3XCI7XHJcblxyXG5kZWNsYXJlIHZhciAkOiBhbnk7XHJcblxyXG5leHBvcnQgY2xhc3MgUmVuIHtcclxuXHJcbiAgICBwcml2YXRlIF9vcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm87XHJcbiAgICBwcml2YXRlIF9mZWVkIDogRmFjZWJvb2tGZWVkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICBsZXQgY29uZmlnIDogUmVuU3BvcnRDb25maWcgPSAoPGFueT53aW5kb3cpLlJlblNwb3J0Q29uZmlnO1xyXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmxvYWRIZWFkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZEhlYWRlcihjb25maWcuY29udGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9sb2FkRm9vdGVyKCk7XHJcblxyXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmxvYWRPcGVuaW5nSG91cnMpIHtcclxuICAgICAgICAgICAgdGhpcy5fb3BlbmluZ0luZm8gPSBuZXcgRmFjZWJvb2tPcGVuaW5nSW5mbygpO1xyXG4gICAgICAgICAgICB0aGlzLl9vcGVuaW5nSW5mby5hZnRlckxvYWQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyT3BlbmluZ0luZm8odGhpcy5fb3BlbmluZ0luZm8sIDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVuLW9wZW5pbmdzdXJlbi1ob29rJykpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmxvYWROZXdzRmVlZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9mZWVkID0gbmV3IEZhY2Vib29rRmVlZCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9mZWVkLmFmdGVyTG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mZWVkLnJlbmRlclRvKDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVuLWhvbWVwYWdlLW5ld3NmZWVkJykpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgZmVlZCAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbG9hZEhlYWRlciAoY29udGV4dCA6IHN0cmluZykgOiB2b2lkIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBob29rIDogYW55ID0gJCggXCIjcmVuLWhlYWRlclwiICk7XHJcbiAgICAgICAgICAgIGhvb2subG9hZCggXCIvY29tcG9uZW50cy9oZWFkZXIuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb250ZXh0TmF2YmFyRWxlbWVudCA6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpW2RhdGEtY29udGV4dC0nICsgY29udGV4dC50b0xvd2VyQ2FzZSgpICsgJ10nKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0TmF2YmFyRWxlbWVudC5jbGFzc05hbWUgKz0gJ2FjdGl2ZSc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9sb2FkRm9vdGVyICgpIDogdm9pZCB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaG9vayA6IGFueSA9ICQoIFwiI3Jlbi1mb290ZXJcIiApO1xyXG4gICAgICAgICAgICBob29rLmxvYWQoIFwiL2NvbXBvbmVudHMvZm9vdGVyLmh0bWxcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBvcGVuaW5nSW5mbyAoKSA6IEZhY2Vib29rT3BlbmluZ0luZm8ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcGVuaW5nSW5mbztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3Vic2NyaWJlVG9OZXdzbGV0dGVyICgpIHtcclxuICAgICAgICBsZXQgaW5wdXQgOiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jlbi1uaWV1d3NicmllZi1pbnB1dC1maWVsZCcpO1xyXG4gICAgICAgIGxldCBoaWRkZW5JbnB1dCA6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdnItaGlkZGVuLWlucHV0LWZpZWxkJyksXHJcbiAgICAgICAgICAgIGhpZGRlblN1Ym1pdCA6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2ci1oaWRkZW4tc3VibWl0LWJ0bicpO1xyXG5cclxuICAgICAgICBpZiAoaW5wdXQgJiYgaW5wdXQudmFsdWUgJiYgaGlkZGVuSW5wdXQgJiYgaGlkZGVuU3VibWl0KSB7XHJcbiAgICAgICAgICAgIGhpZGRlbklucHV0LnZhbHVlID0gaW5wdXQudmFsdWU7XHJcbiAgICAgICAgICAgIGhpZGRlblN1Ym1pdC5jbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7UmVufSBmcm9tIFwiLi9SZW5cIjtcclxuXHJcbig8YW55PndpbmRvdykuUmVuU3BvcnQgPSBuZXcgUmVuKCk7IiwiaW1wb3J0IHtGQkZlZWRSZXNwb25zZU9iamVjdH0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7RmFjZWJvb2tQcm94eX0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5pbXBvcnQge0ZhY2Vib29rUG9zdH0gZnJvbSBcIi4vRmFjZWJvb2tQb3N0XCI7XHJcbmltcG9ydCB7cGFyc2VKU09OfSBmcm9tIFwiLi4vdXRpbC9KU09OVXRpbHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va0ZlZWQgZXh0ZW5kcyBMb2FkYWJsZSB7XHJcblxyXG4gICAgcHJpdmF0ZSBfcG9zdHMgOiBBcnJheTxGYWNlYm9va1Bvc3Q+ID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBwb3N0cyAoKSA6IEFycmF5PEZhY2Vib29rUG9zdD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wb3N0cztcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxsZWQgYnkgc3VwZXIoKTtcclxuICAgIHByb3RlY3RlZCBkb0xvYWQgKCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5LmZlZWQoKHJlcyA6IEZCRmVlZFJlc3BvbnNlT2JqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzLmVycm9yICYmIHJlcy5mZWVkICYmIHJlcy5mZWVkLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkUG9zdHNGcm9tUmVzcG9uc2UocmVzKVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFyZXMuZXJyb3IgJiYgcGFyc2VKU09OKDxhbnk+cmVzKSAmJiBwYXJzZUpTT04oPGFueT5yZXMpLmZlZWQgJiYgcGFyc2VKU09OKDxhbnk+cmVzKS5mZWVkLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkUG9zdHNGcm9tUmVzcG9uc2UocGFyc2VKU09OKDxhbnk+cmVzKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRGYWlsZWQocmVzLmVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkUG9zdHNGcm9tUmVzcG9uc2UgKHJlcyA6IEZCRmVlZFJlc3BvbnNlT2JqZWN0KSA6IHZvaWQge1xyXG4gICAgICAgIGZvciAobGV0IHBvc3Qgb2YgcmVzLmZlZWQuZGF0YSl7XHJcbiAgICAgICAgICAgIHRoaXMuX3Bvc3RzLnB1c2gobmV3IEZhY2Vib29rUG9zdChwb3N0KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubG9hZFN1Y2Nlc3MoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHZpZXcgKCkgOiBIVE1MRWxlbWVudFtdIHtcclxuICAgICAgICBsZXQgdmlldyA6IEhUTUxFbGVtZW50W10gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGRpc3BsYXlpbmdQb3N0cyA9IDA7IGRpc3BsYXlpbmdQb3N0cyA8IE1hdGgubWluKHRoaXMucG9zdHMubGVuZ3RoLCA1KTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwb3N0ID0gdGhpcy5wb3N0c1tpXTtcclxuICAgICAgICAgICAgaWYgKHBvc3QuY2FuRGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgdmlldy5wdXNoKHBvc3Qudmlldyk7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5aW5nUG9zdHMrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyVG8gKHBhcmVudCA6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgcG9zdFZpZXcgb2YgdGhpcy52aWV3KSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChwb3N0Vmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtGQkhvdXJzUmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7TG9hZGFibGV9IGZyb20gXCIuLi9Mb2FkYWJsZVwiO1xyXG5pbXBvcnQge0ZhY2Vib29rUHJveHl9IGZyb20gXCIuL0ZhY2Vib29rUHJveHlcIjtcclxuaW1wb3J0IHtwYXJzZUpTT059IGZyb20gXCIuLi91dGlsL0pTT05VdGlsc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rT3BlbmluZ0luZm8gZXh0ZW5kcyBMb2FkYWJsZSB7XHJcblxyXG4gICAgcHVibGljIG1vbmRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgdHVlc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgd2VkbmVzZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyB0aHVyc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgZnJpZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyBzYXR1cmRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgc3VuZGF5IDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlzQ3VycmVudGx5T3BlbiAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBub3cgOiBEYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgZGF5ID0ganNWYWx1ZVRvRGF5KG5vdy5nZXREYXkoKSksXHJcbiAgICAgICAgICAgIGluZm9Gb3JEYXkgPSAoPGFueT50aGlzKVtkYXldO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZm9Gb3JEYXkubGVuZ3RoOyBpKz0yKSB7XHJcbiAgICAgICAgICAgIGlmIChsaWVzTm93SW5JbnRlcnZhbChpbmZvRm9yRGF5W2ldLCBpbmZvRm9yRGF5W2krMV0pKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxsZWQgYnkgc3VwZXIoKTtcclxuICAgIHByb3RlY3RlZCBkb0xvYWQgKCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5Lm9wZW5pbmdob3Vycygocm91Z2hkYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcm91Z2hkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlRGF0YShyb3VnaGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkU3VjY2VzcygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkRmFpbGVkKHJvdWdoZGF0YS5lcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHBhcnNlRGF0YSAocm91Z2hkYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygcm91Z2hkYXRhID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByb3VnaGRhdGEgPSBwYXJzZUpTT04oPGFueT5yb3VnaGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1vbmRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdtb24nKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy50dWVzZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3R1ZScpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLndlZG5lc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd3ZWQnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy50aHVyc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd0aHUnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5mcmlkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignZnJpJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuc2F0dXJkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignc2F0JykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuc3VuZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3N1bicpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGF5VG9WYWx1ZSAoZGF5IDogc3RyaW5nKSA6IG51bWJlcntcclxuICAgIGlmIChkYXkgPT09J21vbicpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSd0dWUnKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nd2VkJykge1xyXG4gICAgICAgIHJldHVybiAyO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3RodScpIHtcclxuICAgICAgICByZXR1cm4gMztcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSdmcmknKSB7XHJcbiAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nc2F0Jykge1xyXG4gICAgICAgIHJldHVybiA1O1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3N1bicpIHtcclxuICAgICAgICByZXR1cm4gNjtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ganNWYWx1ZVRvRGF5ICh2YWx1ZSA6IG51bWJlcikgOiBzdHJpbmd7XHJcbiAgICBpZiAodmFsdWUgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gJ3N1bmRheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuICdtb25kYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMikge1xyXG4gICAgICAgIHJldHVybiAndHVlc2RheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAzKSB7XHJcbiAgICAgICAgcmV0dXJuICd3ZWRuZXNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gNCkge1xyXG4gICAgICAgIHJldHVybiAndGh1cnNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gNSkge1xyXG4gICAgICAgIHJldHVybiAnZnJpZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDYpIHtcclxuICAgICAgICByZXR1cm4gJ3NhdHVyZGF5JztcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ganNEYXlWYWx1ZSAoZGF5IDogc3RyaW5nKSA6IG51bWJlciB7XHJcbiAgICByZXR1cm4gKChkYXlUb1ZhbHVlKGRheSkgKyAxKSAlIDcpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb21wYXJlT3BlbmluZ0luZm8gKGEgOiBzdHJpbmcsIGIgOiBzdHJpbmcpIHtcclxuICAgIGxldCBpbmZvQSA9IGEuc3BsaXQoJ18nKSxcclxuICAgICAgICBpbmZvQiA9IGIuc3BsaXQoJ18nKTtcclxuXHJcbiAgICBpZiAocGFyc2VJbnQoaW5mb0FbMV0pIDwgcGFyc2VJbnQoaW5mb0JbMV0pKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSBlbHNlIGlmIChwYXJzZUludChpbmZvQVsxXSkgPiBwYXJzZUludChpbmZvQlsxXSkpe1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoaW5mb0FbMl0gPT09ICdvcGVuJyl7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9IGVsc2UgcmV0dXJuIDE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvVGltaW5ncyAob3BlbmluZ1RpbWUgOiBzdHJpbmdbXSwgcm91Z2hEYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSA6IHN0cmluZ1tdIHtcclxuICAgIGxldCB0aW1pbmdzIDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBvcGVuaW5nIG9mIG9wZW5pbmdUaW1lKSB7XHJcbiAgICAgICAgdGltaW5ncy5wdXNoKHJvdWdoRGF0YS5ob3Vyc1tvcGVuaW5nXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGltaW5ncztcclxufVxyXG5cclxuZnVuY3Rpb24gbGllc05vd0luSW50ZXJ2YWwgKHN0YXJ0IDogc3RyaW5nLCBlbmQgOiBzdHJpbmcpIDogYm9vbGVhbiB7XHJcblxyXG4gICAgbGV0IG5vdyA6IERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIHN0YXJ0SG91cnNNaW51dGVzICA9IHN0YXJ0LnNwbGl0KCc6JyksXHJcbiAgICAgICAgc3RhcnREYXRlIDogRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgc3RhcnRIb3VyIDogbnVtYmVyID0gcGFyc2VJbnQoc3RhcnRIb3Vyc01pbnV0ZXNbMF0pLFxyXG4gICAgICAgIHN0YXJ0TWludXRlcyA6IG51bWJlciA9IHBhcnNlSW50KHN0YXJ0SG91cnNNaW51dGVzWzFdKSxcclxuICAgICAgICBlbmRIb3Vyc01pbnV0ZXMgID0gZW5kLnNwbGl0KCc6JyksXHJcbiAgICAgICAgZW5kRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgZW5kSG91ciA6IG51bWJlciA9IHBhcnNlSW50KGVuZEhvdXJzTWludXRlc1swXSksXHJcbiAgICAgICAgZW5kTWludXRlcyA6IG51bWJlciA9IHBhcnNlSW50KGVuZEhvdXJzTWludXRlc1sxXSk7XHJcblxyXG4gICAgc3RhcnREYXRlLnNldEhvdXJzKHN0YXJ0SG91cik7XHJcbiAgICBzdGFydERhdGUuc2V0TWludXRlcyhzdGFydE1pbnV0ZXMpO1xyXG4gICAgZW5kRGF0ZS5zZXRIb3VycyhlbmRIb3VyKTtcclxuICAgIGVuZERhdGUuc2V0TWludXRlcyhlbmRNaW51dGVzKTtcclxuXHJcbiAgICByZXR1cm4gbm93ID49IHN0YXJ0RGF0ZSAmJiBub3cgPCBlbmREYXRlO1xyXG59IiwiaW1wb3J0IHtGQlBvc3RSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtJbWFnZVRhZ30gZnJvbSBcIi4uL2xpYnJhcnkvU2NyaXB0VGFnXCI7XHJcbmltcG9ydCB7RkJfUEFHRV9JRH0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5pbXBvcnQge2xpbmtpZnl9IGZyb20gXCIuLi91dGlsL0xpbmtpZnlcIjtcclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rUG9zdCB7XHJcblxyXG4gICAgcHJpdmF0ZSBpbmZvIDogRkJQb3N0UmVzcG9uc2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKGluZm8gOiBGQlBvc3RSZXNwb25zZSkge1xyXG4gICAgICAgIHRoaXMuaW5mbyA9IGluZm87XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjYW5EaXNwbGF5ICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmluZm8uaXNfaGlkZGVuICYmIHRoaXMuaW5mby5pc19wdWJsaXNoZWQgJiYgdGhpcy5pbmZvLmZyb20gJiYgdGhpcy5pbmZvLmZyb20uaWQgPT09IEZCX1BBR0VfSUQgJiYgISF0aGlzLm1lc3NhZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjcmVhdGVkICgpIDogRGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuaW5mby5jcmVhdGVkX3RpbWUuc3BsaXQoJysnKVswXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBpZCAoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5mby5pZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG1lc3NhZ2UgKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZm8ubWVzc2FnZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldCBwaWN0dXJlICgpIDogSW1hZ2VUYWcge1xyXG4gICAgICAgIGlmICh0aGlzLmluZm8uZnVsbF9waWN0dXJlKSB7XHJcbiAgICAgICAgICAgIGxldCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLmluZm8uZnVsbF9waWN0dXJlO1xyXG4gICAgICAgICAgICBpbWFnZS5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0taW1nJztcclxuICAgICAgICAgICAgcmV0dXJuIGltYWdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyVG8gKHBhcmVudCA6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FuRGlzcGxheSkge1xyXG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy52aWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB2aWV3ICgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCB2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgdmlldy5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tY29udGFpbmVyJztcclxuXHJcbiAgICAgICAgbGV0IGRhdGVWaWV3ID0gdGhpcy5jcmVhdGVEYXRlVmlldygpO1xyXG4gICAgICAgIHZpZXcuYXBwZW5kQ2hpbGQoZGF0ZVZpZXcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBjb250ZW50VmlldyA9IHRoaXMuY3JlYXRlQ29udGVudFZpZXcoKTtcclxuICAgICAgICB2aWV3LmFwcGVuZENoaWxkKGNvbnRlbnRWaWV3KTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNyZWF0ZUNvbnRlbnRWaWV3ICgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCBjb250ZW50Q29udGFpbmVyIDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBjb250ZW50Q29udGFpbmVyLmNsYXNzTmFtZSA9ICdyZW4tY29udGVudC1pdGVtLWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGxldCBuZXdzRmVlZENvbnRlbnRDb250YWluZXIgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIG5ld3NGZWVkQ29udGVudENvbnRhaW5lci5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tY29udGVudC1jb250YWluZXInO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGxldCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XHJcbiAgICAgICAgICAgIHRpdGxlLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS10aXRsZSc7XHJcbiAgICAgICAgICAgIHRpdGxlLmlubmVySFRNTCA9IHRoaXMubWVzc2FnZS5tYXRjaChmaXJzdFNlbnRlbmNlUmVnZXgpLm1hcChmdW5jdGlvbihzKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzLnJlcGxhY2UoL15cXHMrfFxccyskL2csJycpO1xyXG4gICAgICAgICAgICB9KVswXTtcclxuICAgICAgICAgICAgbmV3c0ZlZWRDb250ZW50Q29udGFpbmVyLmFwcGVuZENoaWxkKHRpdGxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHBpY3R1cmUgPSB0aGlzLnBpY3R1cmU7XHJcbiAgICAgICAgaWYgKHBpY3R1cmUpIHtcclxuICAgICAgICAgICAgbmV3c0ZlZWRDb250ZW50Q29udGFpbmVyLmFwcGVuZENoaWxkKHBpY3R1cmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubWVzc2FnZSkge1xyXG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgbWVzc2FnZS5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tdGV4dCc7XHJcbiAgICAgICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5tZXNzYWdlICYmIGxpbmtpZnkodGhpcy5tZXNzYWdlKTtcclxuICAgICAgICAgICAgbmV3c0ZlZWRDb250ZW50Q29udGFpbmVyLmFwcGVuZENoaWxkKG1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGNvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQobmV3c0ZlZWRDb250ZW50Q29udGFpbmVyKTtcclxuICAgICAgICByZXR1cm4gY29udGVudENvbnRhaW5lcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNyZWF0ZURhdGVWaWV3ICgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCBkYXRlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgZGF0ZUNvbnRhaW5lci5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tZGF0ZS1jb250YWluZXInO1xyXG5cclxuICAgICAgICBsZXQgZGF0ZURheUxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDEnKTtcclxuICAgICAgICBkYXRlRGF5TGFiZWwuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWRhdGUtZGF5JztcclxuICAgICAgICBkYXRlRGF5TGFiZWwuaW5uZXJUZXh0ID0gJycrdGhpcy5jcmVhdGVkLmdldERhdGUoKTtcclxuICAgICAgICBkYXRlQ29udGFpbmVyLmFwcGVuZENoaWxkKGRhdGVEYXlMYWJlbCk7XHJcblxyXG4gICAgICAgIGxldCBkYXRlTW9udGhZZWFyTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNicpO1xyXG4gICAgICAgIGRhdGVNb250aFllYXJMYWJlbC5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tZGF0ZS1tb250aC15ZWFyJztcclxuICAgICAgICBkYXRlTW9udGhZZWFyTGFiZWwuaW5uZXJUZXh0ID0gbW9udGhzW3RoaXMuY3JlYXRlZC5nZXRNb250aCgpXSArICcgJyArIHRoaXMuY3JlYXRlZC5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgIGRhdGVDb250YWluZXIuYXBwZW5kQ2hpbGQoZGF0ZU1vbnRoWWVhckxhYmVsKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRhdGVDb250YWluZXI7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IG1vbnRocyA6IHN0cmluZ1tdID0gW1xyXG4gICAgJ0phbicsICdGZWInLCAnTWFhJywgJ0FwcicsICdNZWknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09rdCcsICdOb3YnLCAnRGVjJ1xyXG5dO1xyXG5cclxuY29uc3QgZmlyc3RTZW50ZW5jZVJlZ2V4IDogUmVnRXhwID0gL14uKj9bXFwuIVxcP10oPzpcXHN8JCkvZzsiLCJpbXBvcnQge0ZCUmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7TG9hZGFibGV9IGZyb20gXCIuLi9Mb2FkYWJsZVwiO1xyXG5pbXBvcnQge1NjcmlwdFRhZ30gZnJvbSBcIi4uL2xpYnJhcnkvU2NyaXB0VGFnXCI7XHJcblxyXG5jb25zdCBwcm94eVVSTCA9ICdodHRwczovL3JlbnNlY3VyaXR5cHJveHktc2FtZ2llbGlzLnJoY2xvdWQuY29tLyc7XHJcbmV4cG9ydCBjb25zdCBGQl9QQUdFX0lEIDogc3RyaW5nID0gXCIyMTU0NzAzNDE5MDk5MzdcIjtcclxuXHJcbmludGVyZmFjZSBJRmFjZWJvb2tTREsge1xyXG4gICAgaW5pdCA6IGFueTtcclxuICAgIGFwaSAoZ3JhcGhwYXRoIDogc3RyaW5nLCBjYWxsYmFjayA6IChyZXNwb25zZSA6IEZCUmVzcG9uc2UpID0+IGFueSkgOiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRmFjZWJvb2tQcm94eSB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBmZWVkICAoc3VjYyA6IChpbmZvIDogRkJSZXNwb25zZSkgPT4gdm9pZCwgZmFpbD8gOiAoKSA9PiB2b2lkKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkuZ2V0KCdmZWVkJywgc3VjYywgZmFpbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBvcGVuaW5naG91cnMgIChzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5nZXQoJ29wZW5pbmdob3VycycsIHN1Y2MsIGZhaWwpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXQgKHVybCA6IHN0cmluZywgc3VjYyA6IChpbmZvIDogRkJSZXNwb25zZSkgPT4gdm9pZCwgZmFpbD8gOiAoKSA9PiB2b2lkKSA6IHZvaWQge1xyXG4gICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICB4aHIub3BlbignZ2V0JywgcHJveHlVUkwgKyB1cmwsIHRydWUpO1xyXG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XHJcbiAgICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cztcclxuICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICAgICAgICAgIHN1Y2MoeGhyLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGZhaWwpIHtcclxuICAgICAgICAgICAgICAgIGZhaWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgeGhyLnNlbmQoKTtcclxuICAgIH1cclxufSIsImV4cG9ydCBmdW5jdGlvbiBwYXJzZUpTT04gKGpzb24gOiBzdHJpbmcpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IHBhcnNlZE9iamVjdCA9IEpTT04ucGFyc2UoanNvbik7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZE9iamVjdDtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkOyAgIFxyXG4gICAgfVxyXG59IiwiZXhwb3J0IGZ1bmN0aW9uIGxpbmtpZnkgKGlucHV0VGV4dCA6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgdmFyIHJlcGxhY2VkVGV4dCA6IHN0cmluZyxcclxuICAgICAgICByZXBsYWNlUGF0dGVybjEgOiBSZWdFeHAsIHJlcGxhY2VQYXR0ZXJuMiA6IFJlZ0V4cCwgcmVwbGFjZVBhdHRlcm4zIDogUmVnRXhwO1xyXG5cclxuICAgIC8vVVJMcyBzdGFydGluZyB3aXRoIGh0dHA6Ly8sIGh0dHBzOi8vLCBvciBmdHA6Ly9cclxuICAgIHJlcGxhY2VQYXR0ZXJuMSA9IC8oXFxiKGh0dHBzP3xmdHApOlxcL1xcL1stQS1aMC05KyZAI1xcLyU/PX5ffCE6LC47XSpbLUEtWjAtOSsmQCNcXC8lPX5ffF0pL2dpbTtcclxuICAgIHJlcGxhY2VkVGV4dCA9IGlucHV0VGV4dC5yZXBsYWNlKHJlcGxhY2VQYXR0ZXJuMSwgJzxhIGhyZWY9XCIkMVwiIHRhcmdldD1cIl9ibGFua1wiPiQxPC9hPicpO1xyXG5cclxuICAgIC8vVVJMcyBzdGFydGluZyB3aXRoIFwid3d3LlwiICh3aXRob3V0IC8vIGJlZm9yZSBpdCwgb3IgaXQnZCByZS1saW5rIHRoZSBvbmVzIGRvbmUgYWJvdmUpLlxyXG4gICAgcmVwbGFjZVBhdHRlcm4yID0gLyhefFteXFwvXSkod3d3XFwuW1xcU10rKFxcYnwkKSkvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gcmVwbGFjZWRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4yLCAnJDE8YSBocmVmPVwiaHR0cDovLyQyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JDI8L2E+Jyk7XHJcblxyXG4gICAgLy9DaGFuZ2UgZW1haWwgYWRkcmVzc2VzIHRvIG1haWx0bzo6IGxpbmtzLlxyXG4gICAgcmVwbGFjZVBhdHRlcm4zID0gLygoW2EtekEtWjAtOVxcLVxcX1xcLl0pK0BbYS16QS1aXFxfXSs/KFxcLlthLXpBLVpdezIsNn0pKykvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gcmVwbGFjZWRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4zLCAnPGEgaHJlZj1cIm1haWx0bzokMVwiPiQxPC9hPicpO1xyXG5cclxuICAgIHJldHVybiByZXBsYWNlZFRleHQ7XHJcbn0iLCJpbXBvcnQge0ZhY2Vib29rT3BlbmluZ0luZm99IGZyb20gXCIuLi9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tPcGVuaW5nSW5mb1wiO1xyXG5cclxuY29uc3QgZGF5cyA6IHN0cmluZ1tdID0gW1xyXG4gICAgJ21vbmRheScsICd0dWVzZGF5JywgJ3dlZG5lc2RheScsICd0aHVyc2RheScsICdmcmlkYXknLCAnc2F0dXJkYXknLCAnc3VuZGF5J1xyXG5dO1xyXG5cclxuY29uc3QgZGF5c1RyYW5zbGF0aW9uIDoge1tkYXkgOiBzdHJpbmddIDogc3RyaW5nfSA9IHtcclxuICAgICdtb25kYXknIDogJ00uJyxcclxuICAgICd0dWVzZGF5JyA6ICdELicsXHJcbiAgICAnd2VkbmVzZGF5JyA6ICdXLicsXHJcbiAgICAndGh1cnNkYXknIDogJ0QuJyxcclxuICAgICdmcmlkYXknIDogJ1YuJyxcclxuICAgICdzYXR1cmRheScgOiAnWi4nLFxyXG4gICAgJ3N1bmRheScgOiAnWi4nXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyT3BlbmluZ0luZm8gKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbywgcm9vdCA6IEhUTUxFbGVtZW50KSA6IHZvaWQge1xyXG4gICAgaWYgKCFyb290KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgdHlwZSA9IHJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLXZpZXd0eXBlJyk7XHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlICdtb2Rlc3QnIDpcclxuICAgICAgICAgICAgcmVuZGVyTW9kZXN0T3BlbmluZ0luZm9WaWV3KG9wZW5pbmdJbmZvLCByb290KTtcclxuICAgIH1cclxuICAgIC8qbGV0IHJvb3QgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZm9yIChsZXQgZGF5IG9mIGRheXMpIHtcclxuICAgICAgICBsZXQgZGF5dmlldyA9IGRheVZpZXcoZGF5LCAoPGFueT5vcGVuaW5nSW5mbylbZGF5XSk7XHJcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIH1cclxuICAgIHJvb3QuYXBwZW5kQ2hpbGQoY3VycmVudGx5T3BlblZpZXcob3BlbmluZ0luZm8uaXNDdXJyZW50bHlPcGVuKSk7XHJcbiAgICByZXR1cm4gcm9vdDsqL1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJNb2Rlc3RPcGVuaW5nSW5mb1ZpZXcgKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbywgcm9vdCA6IEhUTUxFbGVtZW50KSA6IHZvaWQge1xyXG4gICAgcm9vdC5hcHBlbmRDaGlsZChtb2Rlc3RXZWVrVmlldyhvcGVuaW5nSW5mbykpO1xyXG4gICAgcm9vdC5hcHBlbmRDaGlsZChtb2Rlc3RJc09wZW5JbmRpY2F0b3Iob3BlbmluZ0luZm8pKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0SXNPcGVuSW5kaWNhdG9yIChvcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm8pIDogSFRNTEVsZW1lbnQge1xyXG4gICAgbGV0IGNvbnRhaW5lciA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tbW9kZXN0LWluZGljYXRvcic7XHJcblxyXG4gICAgbGV0IGluZGljYXRvclRleHQgOiBIVE1MU3BhbkVsZW1lbnQ7XHJcbiAgICBpbmRpY2F0b3JUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgaW5kaWNhdG9yVGV4dC5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1tb2Rlc3QtaW5kaWNhdG9yLWxhYmVsJztcclxuXHJcbiAgICBsZXQgY29udGFjdE9wdGlvbnMgOiBBcnJheTxIVE1MRWxlbWVudD4gPSBbXTtcclxuICAgIGNvbnRhY3RPcHRpb25zLnB1c2gobW9kZXN0QWN0Tm93TGluaygnbWFpbHRvOmluZm9AcmVuc3BvcnQuYmUnLCAnZmEtZW52ZWxvcGUnKSk7XHJcblxyXG4gICAgc3dpdGNoIChvcGVuaW5nSW5mby5pc0N1cnJlbnRseU9wZW4pIHtcclxuICAgICAgICBjYXNlIHRydWUgOlxyXG4gICAgICAgICAgICBjb250YWluZXIuY2xhc3NOYW1lICs9ICcgcmVuLW9wZW5pbmdzdXJlbi1vcGVuJztcclxuICAgICAgICAgICAgaW5kaWNhdG9yVGV4dC5pbm5lclRleHQgPSAnTnUgb3BlbiEnO1xyXG4gICAgICAgICAgICBjb250YWN0T3B0aW9ucy5wdXNoKG1vZGVzdEFjdE5vd0xpbmsoJ3RlbDorMzIxMzY2NzQ2MCcsICdmYS1waG9uZScpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBmYWxzZSA6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc05hbWUgKz0gJyByZW4tb3BlbmluZ3N1cmVuLWNsb3NlZCc7XHJcbiAgICAgICAgICAgIGluZGljYXRvclRleHQuaW5uZXJUZXh0ID0gJ0dlc2xvdGVuJztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGluZGljYXRvclRleHQpO1xyXG5cclxuICAgIGZvciAobGV0IGNvbnRhY3RPcHRpb24gb2YgY29udGFjdE9wdGlvbnMpIHtcclxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY29udGFjdE9wdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdFdlZWtWaWV3IChvcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm8pIDogSFRNTEVsZW1lbnQge1xyXG4gICAgbGV0IHRhYmxlIDogSFRNTFRhYmxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcblxyXG4gICAgaWYgKG9wZW5pbmdJbmZvLmlzQ3VycmVudGx5T3Blbikge1xyXG4gICAgICAgIHRhYmxlLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLW9wZW4nO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0YWJsZS5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1jbG9zZWQnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmb3IgKGxldCBkYXkgb2YgZGF5cykge1xyXG4gICAgICAgIGxldCBkYXl2aWV3IDogSFRNTFRhYmxlUm93RWxlbWVudCA9IG1vZGVzdERheVZpZXcoZGF5LCAoPGFueT5vcGVuaW5nSW5mbylbZGF5XSk7XHJcbiAgICAgICAgdGFibGUuYXBwZW5kQ2hpbGQoZGF5dmlldyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhYmxlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3REYXlWaWV3IChkYXkgOiBzdHJpbmcsIGhvdXJzIDogc3RyaW5nW10pIDogSFRNTFRhYmxlUm93RWxlbWVudCB7XHJcbiAgICBsZXQgdGFibGVSb3cgOiBIVE1MVGFibGVSb3dFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgIGlmIChkYXkgPT09IGRheXNbbmV3IERhdGUoKS5nZXREYXkoKSAtIDFdKSB7XHJcbiAgICAgICAgdGFibGVSb3cuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tY3VycmVudGRheSc7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRheXZpZXcgOiBIVE1MVGFibGVEYXRhQ2VsbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpLFxyXG4gICAgICAgIGhvdXJ2aWV3IDogSFRNTFRhYmxlRGF0YUNlbGxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICBkYXl2aWV3LmlubmVyVGV4dCA9IGRheXNUcmFuc2xhdGlvbltkYXldO1xyXG4gICAgaG91cnZpZXcuaW5uZXJUZXh0ID0gbW9kZXN0SG91clZpZXcoaG91cnMpO1xyXG5cclxuXHJcbiAgICB0YWJsZVJvdy5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIHRhYmxlUm93LmFwcGVuZENoaWxkKGhvdXJ2aWV3KTtcclxuXHJcbiAgICByZXR1cm4gdGFibGVSb3c7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdEhvdXJWaWV3IChob3VycyA6IHN0cmluZ1tdKSA6IHN0cmluZyB7XHJcbiAgICBsZXQgaG91cnZpZXcgPSAnJztcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG91cnMubGVuZ3RoOyBpKz0yKSB7XHJcbiAgICAgICAgaG91cnZpZXcgKz0gaG91cnNbaV0gKyAnIC0gJyArIGhvdXJzW2krMV07XHJcbiAgICAgICAgaWYgKGkrMSAhPSBob3Vycy5sZW5ndGgtMSkge1xyXG4gICAgICAgICAgICBob3VydmlldyArPSAnLCAnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBob3VydmlldyB8fCAnR2VzbG90ZW4nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3RBY3ROb3dMaW5rIChocmVmIDogc3RyaW5nLCBpY29uTmFtZSA6IHN0cmluZykgOiBIVE1MRWxlbWVudCB7XHJcblxyXG4gICAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICBhLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLWluZGljYXRvci1jdGEtbGluayc7XHJcbiAgICBhLmhyZWYgPSBocmVmO1xyXG5cclxuICAgIGxldCBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpO1xyXG4gICAgaWNvbi5jbGFzc05hbWUgPSAnZmEgJyArIGljb25OYW1lICsgJyBmYS1sZyc7XHJcblxyXG4gICAgYS5hcHBlbmRDaGlsZChpY29uKTtcclxuXHJcbiAgICByZXR1cm4gYTtcclxufSJdfQ==
