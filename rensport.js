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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTG9hZGFibGUudHMiLCJzcmMvUmVuLnRzIiwic3JjL1Jlbkdsb2JhbC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va1Bvc3QudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rUHJveHkudHMiLCJzcmMvdXRpbC9KU09OVXRpbHMudHMiLCJzcmMvdXRpbC9MaW5raWZ5LnRzIiwic3JjL3ZpZXcvT3BlbmluZ0luZm9WaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0lBT0k7UUFMUSxjQUFTLEdBQWEsS0FBSyxDQUFDO1FBQzVCLGdCQUFXLEdBQWEsS0FBSyxDQUFDO1FBQzlCLDJCQUFzQixHQUFtQixFQUFFLENBQUM7UUFDNUMsd0JBQW1CLEdBQW1CLEVBQUUsQ0FBQztRQUc3QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELHNCQUFXLDhCQUFRO2FBQW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVyxtQ0FBYTthQUF4QjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFBO1FBQzNCLENBQUM7OztPQUFBO0lBRU0sNEJBQVMsR0FBaEIsVUFBa0IsbUJBQStCLEVBQUUsZ0JBQTZCO1FBQzVFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLG1CQUFtQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FB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QUFDLENBQUMsR0FBRyxLQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7QUFDTCxDQUFDO0FBRUQsc0JBQXVCLEtBQWM7SUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFL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QUFHLHFDQUFxQyxDQUFDO0lBQ3BELENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBRWQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2QyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBRTdDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFcEIsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNiLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IGFic3RyYWN0IGNsYXNzIExvYWRhYmxlIHtcclxuXHJcbiAgICBwcml2YXRlIF9pc0xvYWRlZCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX2xvYWRGYWlsZWQgOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF93YWl0aW5nRm9yTG9hZFN1Y2Nlc3MgOiAoKCkgPT4gYW55KVtdID0gW107XHJcbiAgICBwcml2YXRlIF93YWl0aW5nRm9yTG9hZEZhaWwgOiAoKCkgPT4gYW55KVtdID0gW107XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICB0aGlzLmRvTG9hZCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IGlzTG9hZGVkICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzTG9hZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaGFzTG9hZEZhaWxlZCAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sb2FkRmFpbGVkXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFmdGVyTG9hZCAobG9hZFN1Y2Nlc3NDYWxsYmFjayA6ICgpID0+IGFueSwgbG9hZEZhaWxDYWxsYmFjaz8gOiAoKSA9PiBhbnkpIDogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkZWQpIHtcclxuICAgICAgICAgICAgbG9hZFN1Y2Nlc3NDYWxsYmFjaygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oYXNMb2FkRmFpbGVkKSB7XHJcbiAgICAgICAgICAgIGlmIChsb2FkRmFpbENhbGxiYWNrKXtcclxuICAgICAgICAgICAgICAgIGxvYWRGYWlsQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2Vzcy5wdXNoKGxvYWRTdWNjZXNzQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICBpZiAobG9hZEZhaWxDYWxsYmFjayl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl93YWl0aW5nRm9yTG9hZEZhaWwucHVzaChsb2FkRmFpbENhbGxiYWNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGxvYWRTdWNjZXNzICgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIGZvciAobGV0IGNhbGxiYWNrIG9mIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2Vzcykge1xyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl93YWl0aW5nRm9yTG9hZFN1Y2Nlc3MgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZEZhaWxlZCAoZXJyb3IgOiBzdHJpbmcpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fbG9hZEZhaWxlZCA9IHRydWU7XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fd2FpdGluZ0ZvckxvYWRGYWlsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkRmFpbCA9IFtdO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTG9hZGluZyBmYWlsZWQgOiAnICsgZXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBkb0xvYWQgKCkgOiB2b2lkO1xyXG59IiwiaW1wb3J0IHtGYWNlYm9va09wZW5pbmdJbmZvfSBmcm9tIFwiLi9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tPcGVuaW5nSW5mb1wiO1xyXG5pbXBvcnQge0ZhY2Vib29rRmVlZH0gZnJvbSBcIi4vZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rRmVlZFwiO1xyXG5pbXBvcnQge1JlblNwb3J0Q29uZmlnfSBmcm9tIFwiLi9SZW5TcG9ydENvbmZpZ1wiO1xyXG5pbXBvcnQge3JlbmRlck9wZW5pbmdJbmZvfSBmcm9tIFwiLi92aWV3L09wZW5pbmdJbmZvVmlld1wiO1xyXG5cclxuZGVjbGFyZSB2YXIgJDogYW55O1xyXG5cclxuZXhwb3J0IGNsYXNzIFJlbiB7XHJcblxyXG4gICAgcHJpdmF0ZSBfb3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvO1xyXG4gICAgcHJpdmF0ZSBfZmVlZCA6IEZhY2Vib29rRmVlZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA6IFJlblNwb3J0Q29uZmlnID0gKDxhbnk+d2luZG93KS5SZW5TcG9ydENvbmZpZztcclxuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5sb2FkSGVhZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYWRIZWFkZXIoY29uZmlnLmNvbnRleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fbG9hZEZvb3RlcigpO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5sb2FkT3BlbmluZ0hvdXJzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29wZW5pbmdJbmZvID0gbmV3IEZhY2Vib29rT3BlbmluZ0luZm8oKTtcclxuICAgICAgICAgICAgdGhpcy5fb3BlbmluZ0luZm8uYWZ0ZXJMb2FkKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlbmRlck9wZW5pbmdJbmZvKHRoaXMuX29wZW5pbmdJbmZvLCA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jlbi1vcGVuaW5nc3VyZW4taG9vaycpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5sb2FkTmV3c0ZlZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fZmVlZCA9IG5ldyBGYWNlYm9va0ZlZWQoKTtcclxuICAgICAgICAgICAgdGhpcy5fZmVlZC5hZnRlckxvYWQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZmVlZC5yZW5kZXJUbyg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlbi1ob21lcGFnZS1uZXdzZmVlZCcpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgZmVlZCAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbG9hZEhlYWRlciAoY29udGV4dCA6IHN0cmluZykgOiB2b2lkIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBob29rIDogYW55ID0gJCggXCIjcmVuLWhlYWRlclwiICk7XHJcbiAgICAgICAgICAgIGhvb2subG9hZCggXCIvY29tcG9uZW50cy9oZWFkZXIuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb250ZXh0TmF2YmFyRWxlbWVudCA6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpW2RhdGEtY29udGV4dC0nICsgY29udGV4dC50b0xvd2VyQ2FzZSgpICsgJ10nKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29udGV4dE5hdmJhckVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dE5hdmJhckVsZW1lbnQuY2xhc3NOYW1lICs9ICdhY3RpdmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2xvYWRGb290ZXIgKCkgOiB2b2lkIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBob29rIDogYW55ID0gJCggXCIjcmVuLWZvb3RlclwiICk7XHJcbiAgICAgICAgICAgIGhvb2subG9hZCggXCIvY29tcG9uZW50cy9mb290ZXIuaHRtbFwiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG9wZW5pbmdJbmZvICgpIDogRmFjZWJvb2tPcGVuaW5nSW5mbyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wZW5pbmdJbmZvO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdWJzY3JpYmVUb05ld3NsZXR0ZXIgKCkge1xyXG4gICAgICAgIGxldCBpbnB1dCA6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVuLW5pZXV3c2JyaWVmLWlucHV0LWZpZWxkJyk7XHJcbiAgICAgICAgbGV0IGhpZGRlbklucHV0IDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2ci1oaWRkZW4taW5wdXQtZmllbGQnKSxcclxuICAgICAgICAgICAgaGlkZGVuU3VibWl0IDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3ZyLWhpZGRlbi1zdWJtaXQtYnRuJyk7XHJcblxyXG4gICAgICAgIGlmIChpbnB1dCAmJiBpbnB1dC52YWx1ZSAmJiBoaWRkZW5JbnB1dCAmJiBoaWRkZW5TdWJtaXQpIHtcclxuICAgICAgICAgICAgaGlkZGVuSW5wdXQudmFsdWUgPSBpbnB1dC52YWx1ZTtcclxuICAgICAgICAgICAgaGlkZGVuU3VibWl0LmNsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtSZW59IGZyb20gXCIuL1JlblwiO1xyXG5cclxuKDxhbnk+d2luZG93KS5SZW5TcG9ydCA9IG5ldyBSZW4oKTsiLCJpbXBvcnQge0ZCRmVlZFJlc3BvbnNlT2JqZWN0fSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0xvYWRhYmxlfSBmcm9tIFwiLi4vTG9hZGFibGVcIjtcclxuaW1wb3J0IHtGYWNlYm9va1Byb3h5fSBmcm9tIFwiLi9GYWNlYm9va1Byb3h5XCI7XHJcbmltcG9ydCB7RmFjZWJvb2tQb3N0fSBmcm9tIFwiLi9GYWNlYm9va1Bvc3RcIjtcclxuaW1wb3J0IHtwYXJzZUpTT059IGZyb20gXCIuLi91dGlsL0pTT05VdGlsc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rRmVlZCBleHRlbmRzIExvYWRhYmxlIHtcclxuXHJcbiAgICBwcml2YXRlIF9wb3N0cyA6IEFycmF5PEZhY2Vib29rUG9zdD4gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHBvc3RzICgpIDogQXJyYXk8RmFjZWJvb2tQb3N0PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc3RzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGxlZCBieSBzdXBlcigpO1xyXG4gICAgcHJvdGVjdGVkIGRvTG9hZCAoKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkuZmVlZCgocmVzIDogRkJGZWVkUmVzcG9uc2VPYmplY3QpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyZXMuZXJyb3IgJiYgcmVzLmZlZWQgJiYgcmVzLmZlZWQuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRQb3N0c0Zyb21SZXNwb25zZShyZXMpXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXJlcy5lcnJvciAmJiBwYXJzZUpTT04oPGFueT5yZXMpICYmIHBhcnNlSlNPTig8YW55PnJlcykuZmVlZCAmJiBwYXJzZUpTT04oPGFueT5yZXMpLmZlZWQuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRQb3N0c0Zyb21SZXNwb25zZShwYXJzZUpTT04oPGFueT5yZXMpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZEZhaWxlZChyZXMuZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGRQb3N0c0Zyb21SZXNwb25zZSAocmVzIDogRkJGZWVkUmVzcG9uc2VPYmplY3QpIDogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgcG9zdCBvZiByZXMuZmVlZC5kYXRhKXtcclxuICAgICAgICAgICAgdGhpcy5fcG9zdHMucHVzaChuZXcgRmFjZWJvb2tQb3N0KHBvc3QpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sb2FkU3VjY2VzcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdmlldyAoKSA6IEhUTUxFbGVtZW50W10ge1xyXG4gICAgICAgIGxldCB2aWV3IDogSFRNTEVsZW1lbnRbXSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMCwgZGlzcGxheWluZ1Bvc3RzID0gMDsgZGlzcGxheWluZ1Bvc3RzIDwgTWF0aC5taW4odGhpcy5wb3N0cy5sZW5ndGgsIDUpOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHBvc3QgPSB0aGlzLnBvc3RzW2ldO1xyXG4gICAgICAgICAgICBpZiAocG9zdC5jYW5EaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICB2aWV3LnB1c2gocG9zdC52aWV3KTtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlpbmdQb3N0cysrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXJUbyAocGFyZW50IDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBmb3IgKGxldCBwb3N0VmlldyBvZiB0aGlzLnZpZXcpIHtcclxuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHBvc3RWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0ZCSG91cnNSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7RmFjZWJvb2tQcm94eX0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5pbXBvcnQge3BhcnNlSlNPTn0gZnJvbSBcIi4uL3V0aWwvSlNPTlV0aWxzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRmFjZWJvb2tPcGVuaW5nSW5mbyBleHRlbmRzIExvYWRhYmxlIHtcclxuXHJcbiAgICBwdWJsaWMgbW9uZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyB0dWVzZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyB3ZWRuZXNkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHRodXJzZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyBmcmlkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHNhdHVyZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyBzdW5kYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNDdXJyZW50bHlPcGVuICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG5vdyA6IERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICBkYXkgPSBqc1ZhbHVlVG9EYXkobm93LmdldERheSgpKSxcclxuICAgICAgICAgICAgaW5mb0ZvckRheSA9ICg8YW55PnRoaXMpW2RheV07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5mb0ZvckRheS5sZW5ndGg7IGkrPTIpIHtcclxuICAgICAgICAgICAgaWYgKGxpZXNOb3dJbkludGVydmFsKGluZm9Gb3JEYXlbaV0sIGluZm9Gb3JEYXlbaSsxXSkpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGxlZCBieSBzdXBlcigpO1xyXG4gICAgcHJvdGVjdGVkIGRvTG9hZCAoKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkub3BlbmluZ2hvdXJzKChyb3VnaGRhdGEgOiBGQkhvdXJzUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyb3VnaGRhdGEuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VEYXRhKHJvdWdoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRTdWNjZXNzKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRGYWlsZWQocm91Z2hkYXRhLmVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGFyc2VEYXRhIChyb3VnaGRhdGEgOiBGQkhvdXJzUmVzcG9uc2UpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiByb3VnaGRhdGEgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJvdWdoZGF0YSA9IHBhcnNlSlNPTig8YW55PnJvdWdoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubW9uZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ21vbicpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnR1ZXNkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZigndHVlJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMud2VkbmVzZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3dlZCcpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnRodXJzZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3RodScpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLmZyaWRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdmcmknKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5zYXR1cmRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdzYXQnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5zdW5kYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignc3VuJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkYXlUb1ZhbHVlIChkYXkgOiBzdHJpbmcpIDogbnVtYmVye1xyXG4gICAgaWYgKGRheSA9PT0nbW9uJykge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3R1ZScpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSd3ZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuIDI7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0ndGh1Jykge1xyXG4gICAgICAgIHJldHVybiAzO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J2ZyaScpIHtcclxuICAgICAgICByZXR1cm4gNDtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSdzYXQnKSB7XHJcbiAgICAgICAgcmV0dXJuIDU7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nc3VuJykge1xyXG4gICAgICAgIHJldHVybiA2O1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBqc1ZhbHVlVG9EYXkgKHZhbHVlIDogbnVtYmVyKSA6IHN0cmluZ3tcclxuICAgIGlmICh2YWx1ZSA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiAnc3VuZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDEpIHtcclxuICAgICAgICByZXR1cm4gJ21vbmRheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAyKSB7XHJcbiAgICAgICAgcmV0dXJuICd0dWVzZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDMpIHtcclxuICAgICAgICByZXR1cm4gJ3dlZG5lc2RheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSA0KSB7XHJcbiAgICAgICAgcmV0dXJuICd0aHVyc2RheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSA1KSB7XHJcbiAgICAgICAgcmV0dXJuICdmcmlkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gNikge1xyXG4gICAgICAgIHJldHVybiAnc2F0dXJkYXknO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBqc0RheVZhbHVlIChkYXkgOiBzdHJpbmcpIDogbnVtYmVyIHtcclxuICAgIHJldHVybiAoKGRheVRvVmFsdWUoZGF5KSArIDEpICUgNyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbXBhcmVPcGVuaW5nSW5mbyAoYSA6IHN0cmluZywgYiA6IHN0cmluZykge1xyXG4gICAgbGV0IGluZm9BID0gYS5zcGxpdCgnXycpLFxyXG4gICAgICAgIGluZm9CID0gYi5zcGxpdCgnXycpO1xyXG5cclxuICAgIGlmIChwYXJzZUludChpbmZvQVsxXSkgPCBwYXJzZUludChpbmZvQlsxXSkpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9IGVsc2UgaWYgKHBhcnNlSW50KGluZm9BWzFdKSA+IHBhcnNlSW50KGluZm9CWzFdKSl7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChpbmZvQVsyXSA9PT0gJ29wZW4nKXtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH0gZWxzZSByZXR1cm4gMTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdG9UaW1pbmdzIChvcGVuaW5nVGltZSA6IHN0cmluZ1tdLCByb3VnaERhdGEgOiBGQkhvdXJzUmVzcG9uc2UpIDogc3RyaW5nW10ge1xyXG4gICAgbGV0IHRpbWluZ3MgOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IG9wZW5pbmcgb2Ygb3BlbmluZ1RpbWUpIHtcclxuICAgICAgICB0aW1pbmdzLnB1c2gocm91Z2hEYXRhLmhvdXJzW29wZW5pbmddKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aW1pbmdzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsaWVzTm93SW5JbnRlcnZhbCAoc3RhcnQgOiBzdHJpbmcsIGVuZCA6IHN0cmluZykgOiBib29sZWFuIHtcclxuXHJcbiAgICBsZXQgbm93IDogRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgc3RhcnRIb3Vyc01pbnV0ZXMgID0gc3RhcnQuc3BsaXQoJzonKSxcclxuICAgICAgICBzdGFydERhdGUgOiBEYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICBzdGFydEhvdXIgOiBudW1iZXIgPSBwYXJzZUludChzdGFydEhvdXJzTWludXRlc1swXSksXHJcbiAgICAgICAgc3RhcnRNaW51dGVzIDogbnVtYmVyID0gcGFyc2VJbnQoc3RhcnRIb3Vyc01pbnV0ZXNbMV0pLFxyXG4gICAgICAgIGVuZEhvdXJzTWludXRlcyAgPSBlbmQuc3BsaXQoJzonKSxcclxuICAgICAgICBlbmREYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICBlbmRIb3VyIDogbnVtYmVyID0gcGFyc2VJbnQoZW5kSG91cnNNaW51dGVzWzBdKSxcclxuICAgICAgICBlbmRNaW51dGVzIDogbnVtYmVyID0gcGFyc2VJbnQoZW5kSG91cnNNaW51dGVzWzFdKTtcclxuXHJcbiAgICBzdGFydERhdGUuc2V0SG91cnMoc3RhcnRIb3VyKTtcclxuICAgIHN0YXJ0RGF0ZS5zZXRNaW51dGVzKHN0YXJ0TWludXRlcyk7XHJcbiAgICBlbmREYXRlLnNldEhvdXJzKGVuZEhvdXIpO1xyXG4gICAgZW5kRGF0ZS5zZXRNaW51dGVzKGVuZE1pbnV0ZXMpO1xyXG5cclxuICAgIHJldHVybiBub3cgPj0gc3RhcnREYXRlICYmIG5vdyA8IGVuZERhdGU7XHJcbn0iLCJpbXBvcnQge0ZCUG9zdFJlc3BvbnNlfSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0ltYWdlVGFnfSBmcm9tIFwiLi4vbGlicmFyeS9TY3JpcHRUYWdcIjtcclxuaW1wb3J0IHtGQl9QQUdFX0lEfSBmcm9tIFwiLi9GYWNlYm9va1Byb3h5XCI7XHJcbmltcG9ydCB7bGlua2lmeX0gZnJvbSBcIi4uL3V0aWwvTGlua2lmeVwiO1xyXG5leHBvcnQgY2xhc3MgRmFjZWJvb2tQb3N0IHtcclxuXHJcbiAgICBwcml2YXRlIGluZm8gOiBGQlBvc3RSZXNwb25zZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoaW5mbyA6IEZCUG9zdFJlc3BvbnNlKSB7XHJcbiAgICAgICAgdGhpcy5pbmZvID0gaW5mbztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNhbkRpc3BsYXkgKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuaW5mby5pc19oaWRkZW4gJiYgdGhpcy5pbmZvLmlzX3B1Ymxpc2hlZCAmJiB0aGlzLmluZm8uZnJvbSAmJiB0aGlzLmluZm8uZnJvbS5pZCA9PT0gRkJfUEFHRV9JRCAmJiAhIXRoaXMubWVzc2FnZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNyZWF0ZWQgKCkgOiBEYXRlIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy5pbmZvLmNyZWF0ZWRfdGltZS5zcGxpdCgnKycpWzBdKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlkICgpIDogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmZvLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbWVzc2FnZSAoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5mby5tZXNzYWdlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IHBpY3R1cmUgKCkgOiBJbWFnZVRhZyB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5mby5mdWxsX3BpY3R1cmUpIHtcclxuICAgICAgICAgICAgbGV0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IHRoaXMuaW5mby5mdWxsX3BpY3R1cmU7XHJcbiAgICAgICAgICAgIGltYWdlLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1pbWcnO1xyXG4gICAgICAgICAgICByZXR1cm4gaW1hZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXJUbyAocGFyZW50IDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5jYW5EaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLnZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHZpZXcgKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB2aWV3LmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1jb250YWluZXInO1xyXG5cclxuICAgICAgICBsZXQgZGF0ZVZpZXcgPSB0aGlzLmNyZWF0ZURhdGVWaWV3KCk7XHJcbiAgICAgICAgdmlldy5hcHBlbmRDaGlsZChkYXRlVmlldyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGNvbnRlbnRWaWV3ID0gdGhpcy5jcmVhdGVDb250ZW50VmlldygpO1xyXG4gICAgICAgIHZpZXcuYXBwZW5kQ2hpbGQoY29udGVudFZpZXcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlQ29udGVudFZpZXcgKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IGNvbnRlbnRDb250YWluZXIgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGNvbnRlbnRDb250YWluZXIuY2xhc3NOYW1lID0gJ3Jlbi1jb250ZW50LWl0ZW0tY29udGFpbmVyJztcclxuXHJcbiAgICAgICAgbGV0IG5ld3NGZWVkQ29udGVudENvbnRhaW5lciA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgbmV3c0ZlZWRDb250ZW50Q29udGFpbmVyLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1jb250ZW50LWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgbGV0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcclxuICAgICAgICAgICAgdGl0bGUuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLXRpdGxlJztcclxuICAgICAgICAgICAgdGl0bGUuaW5uZXJIVE1MID0gdGhpcy5tZXNzYWdlLm1hdGNoKGZpcnN0U2VudGVuY2VSZWdleCkubWFwKGZ1bmN0aW9uKHMpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMucmVwbGFjZSgvXlxccyt8XFxzKyQvZywnJyk7XHJcbiAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQodGl0bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgcGljdHVyZSA9IHRoaXMucGljdHVyZTtcclxuICAgICAgICBpZiAocGljdHVyZSkge1xyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQocGljdHVyZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICBtZXNzYWdlLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS10ZXh0JztcclxuICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLm1lc3NhZ2UgJiYgbGlua2lmeSh0aGlzLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQobWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgY29udGVudENvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdzRmVlZENvbnRlbnRDb250YWluZXIpO1xyXG4gICAgICAgIHJldHVybiBjb250ZW50Q29udGFpbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlRGF0ZVZpZXcgKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IGRhdGVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBkYXRlQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1kYXRlLWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGxldCBkYXRlRGF5TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMScpO1xyXG4gICAgICAgIGRhdGVEYXlMYWJlbC5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tZGF0ZS1kYXknO1xyXG4gICAgICAgIGRhdGVEYXlMYWJlbC5pbm5lclRleHQgPSAnJyt0aGlzLmNyZWF0ZWQuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIGRhdGVDb250YWluZXIuYXBwZW5kQ2hpbGQoZGF0ZURheUxhYmVsKTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGVNb250aFllYXJMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g2Jyk7XHJcbiAgICAgICAgZGF0ZU1vbnRoWWVhckxhYmVsLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1kYXRlLW1vbnRoLXllYXInO1xyXG4gICAgICAgIGRhdGVNb250aFllYXJMYWJlbC5pbm5lclRleHQgPSBtb250aHNbdGhpcy5jcmVhdGVkLmdldE1vbnRoKCldICsgJyAnICsgdGhpcy5jcmVhdGVkLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgZGF0ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChkYXRlTW9udGhZZWFyTGFiZWwpO1xyXG5cclxuICAgICAgICByZXR1cm4gZGF0ZUNvbnRhaW5lcjtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgbW9udGhzIDogc3RyaW5nW10gPSBbXHJcbiAgICAnSmFuJywgJ0ZlYicsICdNYWEnLCAnQXByJywgJ01laScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2t0JywgJ05vdicsICdEZWMnXHJcbl07XHJcblxyXG5jb25zdCBmaXJzdFNlbnRlbmNlUmVnZXggOiBSZWdFeHAgPSAvXi4qP1tcXC4hXFw/XSg/Olxcc3wkKS9nOyIsImltcG9ydCB7RkJSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7U2NyaXB0VGFnfSBmcm9tIFwiLi4vbGlicmFyeS9TY3JpcHRUYWdcIjtcclxuXHJcbmNvbnN0IHByb3h5VVJMID0gJ2h0dHBzOi8vcmVuc2VjdXJpdHlwcm94eS1zYW1naWVsaXMucmhjbG91ZC5jb20vJztcclxuZXhwb3J0IGNvbnN0IEZCX1BBR0VfSUQgOiBzdHJpbmcgPSBcIjIxNTQ3MDM0MTkwOTkzN1wiO1xyXG5cclxuaW50ZXJmYWNlIElGYWNlYm9va1NESyB7XHJcbiAgICBpbml0IDogYW55O1xyXG4gICAgYXBpIChncmFwaHBhdGggOiBzdHJpbmcsIGNhbGxiYWNrIDogKHJlc3BvbnNlIDogRkJSZXNwb25zZSkgPT4gYW55KSA6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1Byb3h5IHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGZlZWQgIChzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5nZXQoJ2ZlZWQnLCBzdWNjLCBmYWlsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIG9wZW5pbmdob3VycyAgKHN1Y2MgOiAoaW5mbyA6IEZCUmVzcG9uc2UpID0+IHZvaWQsIGZhaWw/IDogKCkgPT4gdm9pZCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5LmdldCgnb3BlbmluZ2hvdXJzJywgc3VjYywgZmFpbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc3RhdGljIGdldCAodXJsIDogc3RyaW5nLCBzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgIHhoci5vcGVuKCdnZXQnLCBwcm94eVVSTCArIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcclxuICAgICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzO1xyXG4gICAgICAgICAgICBpZiAoc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgc3VjYyh4aHIucmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoZmFpbCkge1xyXG4gICAgICAgICAgICAgICAgZmFpbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB4aHIuc2VuZCgpO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSlNPTiAoanNvbiA6IHN0cmluZykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBsZXQgcGFyc2VkT2JqZWN0ID0gSlNPTi5wYXJzZShqc29uKTtcclxuICAgICAgICByZXR1cm4gcGFyc2VkT2JqZWN0O1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7ICAgXHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZnVuY3Rpb24gbGlua2lmeSAoaW5wdXRUZXh0IDogc3RyaW5nKSA6IHN0cmluZyB7XHJcbiAgICB2YXIgcmVwbGFjZWRUZXh0IDogc3RyaW5nLFxyXG4gICAgICAgIHJlcGxhY2VQYXR0ZXJuMSA6IFJlZ0V4cCwgcmVwbGFjZVBhdHRlcm4yIDogUmVnRXhwLCByZXBsYWNlUGF0dGVybjMgOiBSZWdFeHA7XHJcblxyXG4gICAgLy9VUkxzIHN0YXJ0aW5nIHdpdGggaHR0cDovLywgaHR0cHM6Ly8sIG9yIGZ0cDovL1xyXG4gICAgcmVwbGFjZVBhdHRlcm4xID0gLyhcXGIoaHR0cHM/fGZ0cCk6XFwvXFwvWy1BLVowLTkrJkAjXFwvJT89fl98ITosLjtdKlstQS1aMC05KyZAI1xcLyU9fl98XSkvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gaW5wdXRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4xLCAnPGEgaHJlZj1cIiQxXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JDE8L2E+Jyk7XHJcblxyXG4gICAgLy9VUkxzIHN0YXJ0aW5nIHdpdGggXCJ3d3cuXCIgKHdpdGhvdXQgLy8gYmVmb3JlIGl0LCBvciBpdCdkIHJlLWxpbmsgdGhlIG9uZXMgZG9uZSBhYm92ZSkuXHJcbiAgICByZXBsYWNlUGF0dGVybjIgPSAvKF58W15cXC9dKSh3d3dcXC5bXFxTXSsoXFxifCQpKS9naW07XHJcbiAgICByZXBsYWNlZFRleHQgPSByZXBsYWNlZFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybjIsICckMTxhIGhyZWY9XCJodHRwOi8vJDJcIiB0YXJnZXQ9XCJfYmxhbmtcIj4kMjwvYT4nKTtcclxuXHJcbiAgICAvL0NoYW5nZSBlbWFpbCBhZGRyZXNzZXMgdG8gbWFpbHRvOjogbGlua3MuXHJcbiAgICByZXBsYWNlUGF0dGVybjMgPSAvKChbYS16QS1aMC05XFwtXFxfXFwuXSkrQFthLXpBLVpcXF9dKz8oXFwuW2EtekEtWl17Miw2fSkrKS9naW07XHJcbiAgICByZXBsYWNlZFRleHQgPSByZXBsYWNlZFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybjMsICc8YSBocmVmPVwibWFpbHRvOiQxXCI+JDE8L2E+Jyk7XHJcblxyXG4gICAgcmV0dXJuIHJlcGxhY2VkVGV4dDtcclxufSIsImltcG9ydCB7RmFjZWJvb2tPcGVuaW5nSW5mb30gZnJvbSBcIi4uL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvXCI7XHJcblxyXG5jb25zdCBkYXlzIDogc3RyaW5nW10gPSBbXHJcbiAgICAnbW9uZGF5JywgJ3R1ZXNkYXknLCAnd2VkbmVzZGF5JywgJ3RodXJzZGF5JywgJ2ZyaWRheScsICdzYXR1cmRheScsICdzdW5kYXknXHJcbl07XHJcblxyXG5jb25zdCBkYXlzVHJhbnNsYXRpb24gOiB7W2RheSA6IHN0cmluZ10gOiBzdHJpbmd9ID0ge1xyXG4gICAgJ21vbmRheScgOiAnTS4nLFxyXG4gICAgJ3R1ZXNkYXknIDogJ0QuJyxcclxuICAgICd3ZWRuZXNkYXknIDogJ1cuJyxcclxuICAgICd0aHVyc2RheScgOiAnRC4nLFxyXG4gICAgJ2ZyaWRheScgOiAnVi4nLFxyXG4gICAgJ3NhdHVyZGF5JyA6ICdaLicsXHJcbiAgICAnc3VuZGF5JyA6ICdaLidcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJPcGVuaW5nSW5mbyAob3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvLCByb290IDogSFRNTEVsZW1lbnQpIDogdm9pZCB7XHJcbiAgICBpZiAoIXJvb3QpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCB0eXBlID0gcm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmlld3R5cGUnKTtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ21vZGVzdCcgOlxyXG4gICAgICAgICAgICByZW5kZXJNb2Rlc3RPcGVuaW5nSW5mb1ZpZXcob3BlbmluZ0luZm8sIHJvb3QpO1xyXG4gICAgfVxyXG4gICAgLypsZXQgcm9vdCA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBmb3IgKGxldCBkYXkgb2YgZGF5cykge1xyXG4gICAgICAgIGxldCBkYXl2aWV3ID0gZGF5VmlldyhkYXksICg8YW55Pm9wZW5pbmdJbmZvKVtkYXldKTtcclxuICAgICAgICByb290LmFwcGVuZENoaWxkKGRheXZpZXcpO1xyXG4gICAgfVxyXG4gICAgcm9vdC5hcHBlbmRDaGlsZChjdXJyZW50bHlPcGVuVmlldyhvcGVuaW5nSW5mby5pc0N1cnJlbnRseU9wZW4pKTtcclxuICAgIHJldHVybiByb290OyovXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlck1vZGVzdE9wZW5pbmdJbmZvVmlldyAob3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvLCByb290IDogSFRNTEVsZW1lbnQpIDogdm9pZCB7XHJcbiAgICByb290LmFwcGVuZENoaWxkKG1vZGVzdFdlZWtWaWV3KG9wZW5pbmdJbmZvKSk7XHJcbiAgICByb290LmFwcGVuZENoaWxkKG1vZGVzdElzT3BlbkluZGljYXRvcihvcGVuaW5nSW5mbykpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3RJc09wZW5JbmRpY2F0b3IgKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbykgOiBIVE1MRWxlbWVudCB7XHJcbiAgICBsZXQgY29udGFpbmVyIDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1tb2Rlc3QtaW5kaWNhdG9yJztcclxuXHJcbiAgICBsZXQgaW5kaWNhdG9yVGV4dCA6IEhUTUxTcGFuRWxlbWVudDtcclxuICAgIGluZGljYXRvclRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICBpbmRpY2F0b3JUZXh0LmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLW1vZGVzdC1pbmRpY2F0b3ItbGFiZWwnO1xyXG5cclxuICAgIGxldCBjb250YWN0T3B0aW9ucyA6IEFycmF5PEhUTUxFbGVtZW50PiA9IFtdO1xyXG4gICAgY29udGFjdE9wdGlvbnMucHVzaChtb2Rlc3RBY3ROb3dMaW5rKCdtYWlsdG86aW5mb0ByZW5zcG9ydC5iZScsICdmYS1lbnZlbG9wZScpKTtcclxuXHJcbiAgICBzd2l0Y2ggKG9wZW5pbmdJbmZvLmlzQ3VycmVudGx5T3Blbikge1xyXG4gICAgICAgIGNhc2UgdHJ1ZSA6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc05hbWUgKz0gJyByZW4tb3BlbmluZ3N1cmVuLW9wZW4nO1xyXG4gICAgICAgICAgICBpbmRpY2F0b3JUZXh0LmlubmVyVGV4dCA9ICdOdSBvcGVuISc7XHJcbiAgICAgICAgICAgIGNvbnRhY3RPcHRpb25zLnB1c2gobW9kZXN0QWN0Tm93TGluaygndGVsOiszMjEzNjY3NDYwJywgJ2ZhLXBob25lJykpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGZhbHNlIDpcclxuICAgICAgICAgICAgY29udGFpbmVyLmNsYXNzTmFtZSArPSAnIHJlbi1vcGVuaW5nc3VyZW4tY2xvc2VkJztcclxuICAgICAgICAgICAgaW5kaWNhdG9yVGV4dC5pbm5lclRleHQgPSAnR2VzbG90ZW4nO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5kaWNhdG9yVGV4dCk7XHJcblxyXG4gICAgZm9yIChsZXQgY29udGFjdE9wdGlvbiBvZiBjb250YWN0T3B0aW9ucykge1xyXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjb250YWN0T3B0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29udGFpbmVyO1xyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0V2Vla1ZpZXcgKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbykgOiBIVE1MRWxlbWVudCB7XHJcbiAgICBsZXQgdGFibGUgOiBIVE1MVGFibGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuXHJcbiAgICBpZiAob3BlbmluZ0luZm8uaXNDdXJyZW50bHlPcGVuKSB7XHJcbiAgICAgICAgdGFibGUuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tb3Blbic7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRhYmxlLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLWNsb3NlZCc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZvciAobGV0IGRheSBvZiBkYXlzKSB7XHJcbiAgICAgICAgbGV0IGRheXZpZXcgOiBIVE1MVGFibGVSb3dFbGVtZW50ID0gbW9kZXN0RGF5VmlldyhkYXksICg8YW55Pm9wZW5pbmdJbmZvKVtkYXldKTtcclxuICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGFibGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdERheVZpZXcgKGRheSA6IHN0cmluZywgaG91cnMgOiBzdHJpbmdbXSkgOiBIVE1MVGFibGVSb3dFbGVtZW50IHtcclxuICAgIGxldCB0YWJsZVJvdyA6IEhUTUxUYWJsZVJvd0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG4gICAgaWYgKGRheSA9PT0gZGF5c1tuZXcgRGF0ZSgpLmdldERheSgpIC0gMV0pIHtcclxuICAgICAgICB0YWJsZVJvdy5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1jdXJyZW50ZGF5JztcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGF5dmlldyA6IEhUTUxUYWJsZURhdGFDZWxsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyksXHJcbiAgICAgICAgaG91cnZpZXcgOiBIVE1MVGFibGVEYXRhQ2VsbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cclxuICAgIGRheXZpZXcuaW5uZXJUZXh0ID0gZGF5c1RyYW5zbGF0aW9uW2RheV07XHJcbiAgICBob3Vydmlldy5pbm5lclRleHQgPSBtb2Rlc3RIb3VyVmlldyhob3Vycyk7XHJcblxyXG5cclxuICAgIHRhYmxlUm93LmFwcGVuZENoaWxkKGRheXZpZXcpO1xyXG4gICAgdGFibGVSb3cuYXBwZW5kQ2hpbGQoaG91cnZpZXcpO1xyXG5cclxuICAgIHJldHVybiB0YWJsZVJvdztcclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0SG91clZpZXcgKGhvdXJzIDogc3RyaW5nW10pIDogc3RyaW5nIHtcclxuICAgIGxldCBob3VydmlldyA9ICcnO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBob3Vycy5sZW5ndGg7IGkrPTIpIHtcclxuICAgICAgICBob3VydmlldyArPSBob3Vyc1tpXSArICcgLSAnICsgaG91cnNbaSsxXTtcclxuICAgICAgICBpZiAoaSsxICE9IGhvdXJzLmxlbmd0aC0xKSB7XHJcbiAgICAgICAgICAgIGhvdXJ2aWV3ICs9ICcsICc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGhvdXJ2aWV3IHx8ICdHZXNsb3Rlbic7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdEFjdE5vd0xpbmsgKGhyZWYgOiBzdHJpbmcsIGljb25OYW1lIDogc3RyaW5nKSA6IEhUTUxFbGVtZW50IHtcclxuXHJcbiAgICBsZXQgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgIGEuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4taW5kaWNhdG9yLWN0YS1saW5rJztcclxuICAgIGEuaHJlZiA9IGhyZWY7XHJcblxyXG4gICAgbGV0IGljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpJyk7XHJcbiAgICBpY29uLmNsYXNzTmFtZSA9ICdmYSAnICsgaWNvbk5hbWUgKyAnIGZhLWxnJztcclxuXHJcbiAgICBhLmFwcGVuZENoaWxkKGljb24pO1xyXG5cclxuICAgIHJldHVybiBhO1xyXG59Il19
