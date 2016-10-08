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
var OpeningInfoView_1 = require("./view/OpeningInfoView");
var FacebookFeed_1 = require("./facebookplugins/FacebookFeed");
var Ren = (function () {
    function Ren() {
        var _this = this;
        this._openingInfo = new FacebookOpeningInfo_1.FacebookOpeningInfo();
        this._openingInfo.afterLoad(function () {
            var view = OpeningInfoView_1.openingInfoView(_this._openingInfo);
            document.querySelector('#ren-openingsuren').appendChild(view);
        });
        this._feed = new FacebookFeed_1.FacebookFeed();
        this._feed.afterLoad(function () {
            _this._feed.renderTo(document.body);
        });
    }
    Object.defineProperty(Ren.prototype, "feed", {
        get: function () {
            return this._feed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ren.prototype, "openingInfo", {
        get: function () {
            return this._openingInfo;
        },
        enumerable: true,
        configurable: true
    });
    return Ren;
}());
exports.Ren = Ren;
},{"./facebookplugins/FacebookFeed":4,"./facebookplugins/FacebookOpeningInfo":5,"./view/OpeningInfoView":9}],3:[function(require,module,exports){
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
                for (var _i = 0, _a = res.feed.data; _i < _a.length; _i++) {
                    var post = _a[_i];
                    _this._posts.push(new FacebookPost_1.FacebookPost(post));
                }
                _this.loadSuccess();
            }
            else {
                _this.loadFailed(res.error);
            }
        });
    };
    Object.defineProperty(FacebookFeed.prototype, "view", {
        get: function () {
            var view = document.createElement('div');
            view.className = 'ren-fbfeed';
            view.style.marginLeft = '1em';
            view.style.fontFamily = 'Lato, sans-serif'; // 'SSPIKA, verdana, tahoma';
            for (var _i = 0, _a = this.posts; _i < _a.length; _i++) {
                var post = _a[_i];
                post.renderTo(view);
            }
            return view;
        },
        enumerable: true,
        configurable: true
    });
    FacebookFeed.prototype.renderTo = function (parent) {
        parent.appendChild(this.view);
    };
    return FacebookFeed;
}(Loadable_1.Loadable));
exports.FacebookFeed = FacebookFeed;
},{"../Loadable":1,"./FacebookPost":6,"./FacebookProxy":7}],5:[function(require,module,exports){
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
            return !this.info.is_hidden && this.info.is_published && this.info.from && this.info.from.id === FacebookProxy_1.FB_PAGE_ID;
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
                image.style.width = '100%';
                image.style.height = 'auto';
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
            view.className = 'ren-fbpost';
            view.style.width = '500px';
            var header = document.createElement('div');
            header.className = 'ren-fbpost-header';
            header.innerText = this.created.toLocaleDateString();
            var message = document.createElement('p');
            message.className = 'ren-fbpost-text';
            message.innerHTML = this.message && Linkify_1.linkify(this.message);
            var picture = this.picture;
            if (header) {
                view.appendChild(header);
            }
            if (message) {
                view.appendChild(message);
            }
            if (picture) {
                view.appendChild(picture);
            }
            return view;
        },
        enumerable: true,
        configurable: true
    });
    return FacebookPost;
}());
exports.FacebookPost = FacebookPost;
},{"../util/Linkify":8,"./FacebookProxy":7}],7:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
"use strict";
var days = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];
var daysTranslation = {
    'monday': 'Maandag',
    'tuesday': 'Dinsdag',
    'wednesday': 'Woensdag',
    'thursday': 'Donderdag',
    'friday': 'Vrijdag',
    'saturday': 'Zaterdag',
    'sunday': 'Zondag'
};
function openingInfoView(openingInfo) {
    var root = document.createElement('div');
    for (var _i = 0, days_1 = days; _i < days_1.length; _i++) {
        var day = days_1[_i];
        var dayview = dayView(day, openingInfo[day]);
        root.appendChild(dayview);
    }
    root.appendChild(currentlyOpenView(openingInfo.isCurrentlyOpen));
    return root;
}
exports.openingInfoView = openingInfoView;
function dayView(day, hours) {
    var dayview = document.createElement('div'), hourview = hourView(hours);
    dayview.innerHTML = daysTranslation[day] + ' : ' + hourview;
    return dayview;
}
function hourView(hours) {
    var hourview = '';
    for (var i = 0; i < hours.length; i += 2) {
        hourview += hours[i] + ' - ' + hours[i + 1];
        if (i + 1 != hours.length - 1) {
            hourview += ', ';
        }
    }
    return hourview || 'Gesloten';
}
function currentlyOpenView(currentlyOpen) {
    var view = document.createElement('p');
    if (currentlyOpen) {
        view.innerHTML = 'Nu Open!';
    }
    else {
        view.innerHTML = 'Momenteel gesloten';
    }
    return view;
}
},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTG9hZGFibGUudHMiLCJzcmMvUmVuLnRzIiwic3JjL1Jlbkdsb2JhbC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va1Bvc3QudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rUHJveHkudHMiLCJzcmMvdXRpbC9MaW5raWZ5LnRzIiwic3JjL3ZpZXcvT3BlbmluZ0luZm9WaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0lBT0k7UUFMUSxjQUFTLEdBQWEsS0FBSyxDQUFDO1FBQzVCLGdCQUFXLEdBQWEsS0FBSyxDQUFDO1FBQzlCLDJCQUFzQixHQUFtQixFQUFFLENBQUM7UUFDNUMsd0JBQW1CLEdBQW1CLEVBQUUsQ0FBQztRQUc3QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELHNCQUFXLDhCQUFRO2FBQW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVyxtQ0FBYTthQUF4QjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFBO1FBQzNCLENBQUM7OztPQUFBO0lBRU0sNEJBQVMsR0FBaEIsVUFBa0IsbUJBQStCLEVBQUUsZ0JBQTZCO1FBQzVFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLG1CQUFtQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBLENBQUM7Z0JBQ2xCLGdCQUFnQixFQUFFLENBQUM7WUFDdkIsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN0RCxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFUyw4QkFBVyxHQUFyQjtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLEdBQUcsQ0FBQyxDQUFpQixVQUEyQixFQUEzQixLQUFBLElBQUksQ0FBQyxzQkFBc0IsRUFBM0IsY0FBMkIsRUFBM0IsSUFBMkIsQ0FBQztZQUE1QyxJQUFJLFFBQVEsU0FBQTtZQUNiLFFBQVEsRUFBRSxDQUFDO1NBQ2Q7UUFDRCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFTSw2QkFBVSxHQUFqQixVQUFtQixLQUFjO1FBQzdCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLEdBQUcsQ0FBQyxDQUFpQixVQUF3QixFQUF4QixLQUFBLElBQUksQ0FBQyxtQkFBbUIsRUFBeEIsY0FBd0IsRUFBeEIsSUFBd0IsQ0FBQztZQUF6QyxJQUFJLFFBQVEsU0FBQTtZQUNiLFFBQVEsRUFBRSxDQUFDO1NBQ2Q7UUFDRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO1FBQzlCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUdMLGVBQUM7QUFBRCxDQXBEQSxBQW9EQyxJQUFBO0FBcERxQixnQkFBUSxXQW9EN0IsQ0FBQTs7O0FDcERELG9DQUFrQyx1Q0FBdUMsQ0FBQyxDQUFBO0FBQzFFLGdDQUE4Qix3QkFBd0IsQ0FBQyxDQUFBO0FBQ3ZELDZCQUEyQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTVEO0lBS0k7UUFMSixpQkF3QkM7UUFsQk8sSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLHlDQUFtQixFQUFFLENBQUM7UUFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7WUFDeEIsSUFBSSxJQUFJLEdBQUcsaUNBQWUsQ0FBQyxLQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSwyQkFBWSxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDakIsS0FBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELHNCQUFXLHFCQUFJO2FBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQUVELHNCQUFXLDRCQUFXO2FBQXRCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDN0IsQ0FBQzs7O09BQUE7SUFDTCxVQUFDO0FBQUQsQ0F4QkEsQUF3QkMsSUFBQTtBQXhCWSxXQUFHLE1Bd0JmLENBQUE7OztBQzVCRCxvQkFBa0IsT0FBTyxDQUFDLENBQUE7QUFFcEIsTUFBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLFNBQUcsRUFBRSxDQUFDOzs7Ozs7OztBQ0RuQyx5QkFBdUIsYUFBYSxDQUFDLENBQUE7QUFDckMsOEJBQTRCLGlCQUFpQixDQUFDLENBQUE7QUFDOUMsNkJBQTJCLGdCQUFnQixDQUFDLENBQUE7QUFFNUM7SUFBa0MsZ0NBQVE7SUFJdEM7UUFDSSxpQkFBTyxDQUFDO1FBSEosV0FBTSxHQUF5QixFQUFFLENBQUM7SUFJMUMsQ0FBQztJQUVELHNCQUFXLCtCQUFLO2FBQWhCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFFRCxxQkFBcUI7SUFDWCw2QkFBTSxHQUFoQjtRQUFBLGlCQVdDO1FBVkcsNkJBQWEsQ0FBQyxJQUFJLENBQUMsVUFBQyxHQUEwQjtZQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLEdBQUcsQ0FBQyxDQUFhLFVBQWEsRUFBYixLQUFBLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFiLGNBQWEsRUFBYixJQUFhLENBQUM7b0JBQTFCLElBQUksSUFBSSxTQUFBO29CQUNULEtBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksMkJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUM1QztnQkFDRCxLQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEtBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxzQkFBVyw4QkFBSTthQUFmO1lBQ0ksSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyw2QkFBNkI7WUFFekUsR0FBRyxDQUFDLENBQWEsVUFBVSxFQUFWLEtBQUEsSUFBSSxDQUFDLEtBQUssRUFBVixjQUFVLEVBQVYsSUFBVSxDQUFDO2dCQUF2QixJQUFJLElBQUksU0FBQTtnQkFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZCO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDOzs7T0FBQTtJQUVNLCtCQUFRLEdBQWYsVUFBaUIsTUFBb0I7UUFDakMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNMLG1CQUFDO0FBQUQsQ0F6Q0EsQUF5Q0MsQ0F6Q2lDLG1CQUFRLEdBeUN6QztBQXpDWSxvQkFBWSxlQXlDeEIsQ0FBQTs7Ozs7Ozs7QUM3Q0QseUJBQXVCLGFBQWEsQ0FBQyxDQUFBO0FBQ3JDLDhCQUE0QixpQkFBaUIsQ0FBQyxDQUFBO0FBRTlDO0lBQXlDLHVDQUFRO0lBVTdDO1FBQ0ksaUJBQU8sQ0FBQztRQVRMLFdBQU0sR0FBYyxFQUFFLENBQUM7UUFDdkIsWUFBTyxHQUFjLEVBQUUsQ0FBQztRQUN4QixjQUFTLEdBQWMsRUFBRSxDQUFDO1FBQzFCLGFBQVEsR0FBYyxFQUFFLENBQUM7UUFDekIsV0FBTSxHQUFjLEVBQUUsQ0FBQztRQUN2QixhQUFRLEdBQWMsRUFBRSxDQUFDO1FBQ3pCLFdBQU0sR0FBYyxFQUFFLENBQUM7SUFJOUIsQ0FBQztJQUVELHNCQUFXLGdEQUFlO2FBQTFCO1lBQ0ksSUFBSSxHQUFHLEdBQVUsSUFBSSxJQUFJLEVBQUUsRUFDdkIsR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFDaEMsVUFBVSxHQUFTLElBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVsQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFFLENBQUMsRUFBRSxDQUFDO2dCQUMxQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQztvQkFDbkQsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEIsQ0FBQztZQUNMLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7OztPQUFBO0lBRUQscUJBQXFCO0lBQ1gsb0NBQU0sR0FBaEI7UUFBQSxpQkFTQztRQVJHLDZCQUFhLENBQUMsWUFBWSxDQUFDLFVBQUMsU0FBMkI7WUFDbkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsS0FBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDMUIsS0FBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixLQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sdUNBQVMsR0FBakIsVUFBbUIsU0FBMkI7UUFDMUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsV0FBVztZQUNoRSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxXQUFXO1lBQ2pFLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLFdBQVc7WUFDbkUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsV0FBVztZQUNsRSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxXQUFXO1lBQ2hFLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLFdBQVc7WUFDbEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsV0FBVztZQUNoRSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBQ0wsMEJBQUM7QUFBRCxDQTlEQSxBQThEQyxDQTlEd0MsbUJBQVEsR0E4RGhEO0FBOURZLDJCQUFtQixzQkE4RC9CLENBQUE7QUFFRCxvQkFBcUIsR0FBWTtJQUM3QixFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNmLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0FBQ0wsQ0FBQztBQUVELHNCQUF1QixLQUFjO0lBQ2pDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUN2QixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0FBQ0wsQ0FBQztBQUVELG9CQUFxQixHQUFZO0lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRCw0QkFBNkIsQ0FBVSxFQUFFLENBQVU7SUFDL0MsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDcEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFekIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQztRQUNoRCxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ0osRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFBLENBQUM7WUFDckIsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQztRQUFDLElBQUk7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7QUFDTCxDQUFDO0FBRUQsbUJBQW9CLFdBQXNCLEVBQUUsU0FBMkI7SUFDbkUsSUFBSSxPQUFPLEdBQWMsRUFBRSxDQUFDO0lBRTVCLEdBQUcsQ0FBQyxDQUFnQixVQUFXLEVBQVgsMkJBQVcsRUFBWCx5QkFBVyxFQUFYLElBQVcsQ0FBQztRQUEzQixJQUFJLE9BQU8sb0JBQUE7UUFDWixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUMxQztJQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDbkIsQ0FBQztBQUVELDJCQUE0QixLQUFjLEVBQUUsR0FBWTtJQUVwRCxJQUFJLEdBQUcsR0FBVSxJQUFJLElBQUksRUFBRSxFQUN2QixpQkFBaUIsR0FBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUNyQyxTQUFTLEdBQVUsSUFBSSxJQUFJLEVBQUUsRUFDN0IsU0FBUyxHQUFZLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNuRCxZQUFZLEdBQVksUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3RELGVBQWUsR0FBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUNqQyxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsRUFDcEIsT0FBTyxHQUFZLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDL0MsVUFBVSxHQUFZLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV2RCxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlCLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbkMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxQixPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRS9CLE1BQU0sQ0FBQyxHQUFHLElBQUksU0FBUyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUM7QUFDN0MsQ0FBQzs7O0FDcEpELDhCQUF5QixpQkFBaUIsQ0FBQyxDQUFBO0FBQzNDLHdCQUFzQixpQkFBaUIsQ0FBQyxDQUFBO0FBQ3hDO0lBSUksc0JBQWEsSUFBcUI7UUFDOUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVELHNCQUFXLG9DQUFVO2FBQXJCO1lBQ0ksTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLDBCQUFVLENBQUM7UUFDaEgsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVyxpQ0FBTzthQUFsQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVDLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsNEJBQUU7YUFBYjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUN4QixDQUFDOzs7T0FBQTtJQUVELHNCQUFXLGlDQUFPO2FBQWxCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzdCLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsaUNBQU87YUFBbEI7WUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQ25DLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztnQkFDM0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ2pCLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7OztPQUFBO0lBRU0sK0JBQVEsR0FBZixVQUFpQixNQUFvQjtRQUNqQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHNCQUFXLDhCQUFJO2FBQWY7WUFDSSxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztZQUUzQixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsbUJBQW1CLENBQUM7WUFDdkMsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFFckQsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxPQUFPLENBQUMsU0FBUyxHQUFHLGlCQUFpQixDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUxRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBRTNCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUFBLENBQUM7WUFDdkMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFBQSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQUEsQ0FBQztZQUN6QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUFBLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFBQSxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQzs7O09BQUE7SUFDTCxtQkFBQztBQUFELENBN0RBLEFBNkRDLElBQUE7QUE3RFksb0JBQVksZUE2RHhCLENBQUE7OztBQzdERCxJQUFNLFFBQVEsR0FBRyxpREFBaUQsQ0FBQztBQUN0RCxrQkFBVSxHQUFZLGlCQUFpQixDQUFDO0FBT3JEO0lBQUE7SUF3QkEsQ0FBQztJQXRCaUIsa0JBQUksR0FBbEIsVUFBcUIsSUFBa0MsRUFBRSxJQUFrQjtRQUN2RSxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVhLDBCQUFZLEdBQTFCLFVBQTZCLElBQWtDLEVBQUUsSUFBa0I7UUFDL0UsYUFBYSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFYyxpQkFBRyxHQUFsQixVQUFvQixHQUFZLEVBQUUsSUFBa0MsRUFBRSxJQUFrQjtRQUNwRixJQUFJLEdBQUcsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQy9CLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEMsR0FBRyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7UUFDMUIsR0FBRyxDQUFDLE1BQU0sR0FBRztZQUNULElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDeEIsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNiLElBQUksRUFBRSxDQUFDO1lBQ1gsQ0FBQztRQUNMLENBQUMsQ0FBQztRQUNGLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFDTCxvQkFBQztBQUFELENBeEJBLEFBd0JDLElBQUE7QUF4QlkscUJBQWEsZ0JBd0J6QixDQUFBOzs7QUNwQ0QsaUJBQXlCLFNBQWtCO0lBQ3ZDLElBQUksWUFBcUIsRUFDckIsZUFBd0IsRUFBRSxlQUF3QixFQUFFLGVBQXdCLENBQUM7SUFFakYsaURBQWlEO0lBQ2pELGVBQWUsR0FBRyx5RUFBeUUsQ0FBQztJQUM1RixZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUscUNBQXFDLENBQUMsQ0FBQztJQUV6Rix3RkFBd0Y7SUFDeEYsZUFBZSxHQUFHLGdDQUFnQyxDQUFDO0lBQ25ELFlBQVksR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO0lBRXJHLDJDQUEyQztJQUMzQyxlQUFlLEdBQUcsMERBQTBELENBQUM7SUFDN0UsWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLDRCQUE0QixDQUFDLENBQUM7SUFFbkYsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN4QixDQUFDO0FBakJlLGVBQU8sVUFpQnRCLENBQUE7OztBQ2ZELElBQU0sSUFBSSxHQUFjO0lBQ3BCLFFBQVEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVE7Q0FDL0UsQ0FBQztBQUVGLElBQU0sZUFBZSxHQUErQjtJQUNoRCxRQUFRLEVBQUcsU0FBUztJQUNwQixTQUFTLEVBQUcsU0FBUztJQUNyQixXQUFXLEVBQUcsVUFBVTtJQUN4QixVQUFVLEVBQUcsV0FBVztJQUN4QixRQUFRLEVBQUcsU0FBUztJQUNwQixVQUFVLEVBQUcsVUFBVTtJQUN2QixRQUFRLEVBQUcsUUFBUTtDQUN0QixDQUFDO0FBRUYseUJBQWlDLFdBQWlDO0lBQzlELElBQUksSUFBSSxHQUFpQixRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELEdBQUcsQ0FBQyxDQUFZLFVBQUksRUFBSixhQUFJLEVBQUosa0JBQUksRUFBSixJQUFJLENBQUM7UUFBaEIsSUFBSSxHQUFHLGFBQUE7UUFDUixJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFRLFdBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDN0I7SUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQVJlLHVCQUFlLGtCQVE5QixDQUFBO0FBRUQsaUJBQWtCLEdBQVksRUFBRSxLQUFnQjtJQUM1QyxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUN2QyxRQUFRLEdBQVksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxRQUFRLENBQUM7SUFDNUQsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUNuQixDQUFDO0FBRUQsa0JBQW1CLEtBQWdCO0lBQy9CLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNsQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3JDLFFBQVEsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsUUFBUSxJQUFJLElBQUksQ0FBQztRQUNyQixDQUFDO0lBQ0wsQ0FBQztJQUNELE1BQU0sQ0FBQyxRQUFRLElBQUksVUFBVSxDQUFDO0FBQ2xDLENBQUM7QUFFRCwyQkFBNEIsYUFBdUI7SUFDL0MsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2QyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDO0lBQ2hDLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNKLElBQUksQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUM7SUFDMUMsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDaEIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgYWJzdHJhY3QgY2xhc3MgTG9hZGFibGUge1xyXG5cclxuICAgIHByaXZhdGUgX2lzTG9hZGVkIDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfbG9hZEZhaWxlZCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX3dhaXRpbmdGb3JMb2FkU3VjY2VzcyA6ICgoKSA9PiBhbnkpW10gPSBbXTtcclxuICAgIHByaXZhdGUgX3dhaXRpbmdGb3JMb2FkRmFpbCA6ICgoKSA9PiBhbnkpW10gPSBbXTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHRoaXMuZG9Mb2FkKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXQgaXNMb2FkZWQgKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNMb2FkZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBoYXNMb2FkRmFpbGVkICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvYWRGYWlsZWRcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWZ0ZXJMb2FkIChsb2FkU3VjY2Vzc0NhbGxiYWNrIDogKCkgPT4gYW55LCBsb2FkRmFpbENhbGxiYWNrPyA6ICgpID0+IGFueSkgOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRlZCkge1xyXG4gICAgICAgICAgICBsb2FkU3VjY2Vzc0NhbGxiYWNrKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0xvYWRGYWlsZWQpIHtcclxuICAgICAgICAgICAgaWYgKGxvYWRGYWlsQ2FsbGJhY2spe1xyXG4gICAgICAgICAgICAgICAgbG9hZEZhaWxDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzLnB1c2gobG9hZFN1Y2Nlc3NDYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGlmIChsb2FkRmFpbENhbGxiYWNrKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkRmFpbC5wdXNoKGxvYWRGYWlsQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgbG9hZFN1Y2Nlc3MgKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2VzcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsb2FkRmFpbGVkIChlcnJvciA6IHN0cmluZykgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9sb2FkRmFpbGVkID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiB0aGlzLl93YWl0aW5nRm9yTG9hZEZhaWwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRGYWlsID0gW107XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMb2FkaW5nIGZhaWxlZCA6ICcgKyBlcnJvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGRvTG9hZCAoKSA6IHZvaWQ7XHJcbn0iLCJpbXBvcnQge0ZhY2Vib29rT3BlbmluZ0luZm99IGZyb20gXCIuL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvXCI7XHJcbmltcG9ydCB7b3BlbmluZ0luZm9WaWV3fSBmcm9tIFwiLi92aWV3L09wZW5pbmdJbmZvVmlld1wiO1xyXG5pbXBvcnQge0ZhY2Vib29rRmVlZH0gZnJvbSBcIi4vZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rRmVlZFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFJlbiB7XHJcblxyXG4gICAgcHJpdmF0ZSBfb3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvO1xyXG4gICAgcHJpdmF0ZSBfZmVlZCA6IEZhY2Vib29rRmVlZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgdGhpcy5fb3BlbmluZ0luZm8gPSBuZXcgRmFjZWJvb2tPcGVuaW5nSW5mbygpO1xyXG4gICAgICAgIHRoaXMuX29wZW5pbmdJbmZvLmFmdGVyTG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB2aWV3ID0gb3BlbmluZ0luZm9WaWV3KHRoaXMuX29wZW5pbmdJbmZvKTtcclxuICAgICAgICAgICAgKDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVuLW9wZW5pbmdzdXJlbicpKS5hcHBlbmRDaGlsZCh2aWV3KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9mZWVkID0gbmV3IEZhY2Vib29rRmVlZCgpO1xyXG4gICAgICAgIHRoaXMuX2ZlZWQuYWZ0ZXJMb2FkKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fZmVlZC5yZW5kZXJUbyhkb2N1bWVudC5ib2R5KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGZlZWQgKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9mZWVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgb3BlbmluZ0luZm8gKCkgOiBGYWNlYm9va09wZW5pbmdJbmZvIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3BlbmluZ0luZm87XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge1Jlbn0gZnJvbSBcIi4vUmVuXCI7XHJcblxyXG4oPGFueT53aW5kb3cpLlJlblNwb3J0ID0gbmV3IFJlbigpOyIsImltcG9ydCB7RkJGZWVkUmVzcG9uc2VPYmplY3R9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7TG9hZGFibGV9IGZyb20gXCIuLi9Mb2FkYWJsZVwiO1xyXG5pbXBvcnQge0ZhY2Vib29rUHJveHl9IGZyb20gXCIuL0ZhY2Vib29rUHJveHlcIjtcclxuaW1wb3J0IHtGYWNlYm9va1Bvc3R9IGZyb20gXCIuL0ZhY2Vib29rUG9zdFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rRmVlZCBleHRlbmRzIExvYWRhYmxlIHtcclxuXHJcbiAgICBwcml2YXRlIF9wb3N0cyA6IEFycmF5PEZhY2Vib29rUG9zdD4gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHBvc3RzICgpIDogQXJyYXk8RmFjZWJvb2tQb3N0PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc3RzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGxlZCBieSBzdXBlcigpO1xyXG4gICAgcHJvdGVjdGVkIGRvTG9hZCAoKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkuZmVlZCgocmVzIDogRkJGZWVkUmVzcG9uc2VPYmplY3QpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyZXMuZXJyb3IgJiYgcmVzLmZlZWQgJiYgcmVzLmZlZWQuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcG9zdCBvZiByZXMuZmVlZC5kYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wb3N0cy5wdXNoKG5ldyBGYWNlYm9va1Bvc3QocG9zdCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkU3VjY2VzcygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkRmFpbGVkKHJlcy5lcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHZpZXcgKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICB2aWV3LmNsYXNzTmFtZSA9ICdyZW4tZmJmZWVkJztcclxuICAgICAgICB2aWV3LnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcclxuICAgICAgICB2aWV3LnN0eWxlLmZvbnRGYW1pbHkgPSAnTGF0bywgc2Fucy1zZXJpZic7IC8vICdTU1BJS0EsIHZlcmRhbmEsIHRhaG9tYSc7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBvc3Qgb2YgdGhpcy5wb3N0cykge1xyXG4gICAgICAgICAgICBwb3N0LnJlbmRlclRvKHZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyVG8gKHBhcmVudCA6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMudmlldyk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0ZCSG91cnNSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7RmFjZWJvb2tQcm94eX0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rT3BlbmluZ0luZm8gZXh0ZW5kcyBMb2FkYWJsZSB7XHJcblxyXG4gICAgcHVibGljIG1vbmRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgdHVlc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgd2VkbmVzZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyB0aHVyc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgZnJpZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyBzYXR1cmRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgc3VuZGF5IDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlzQ3VycmVudGx5T3BlbiAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBub3cgOiBEYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgZGF5ID0ganNWYWx1ZVRvRGF5KG5vdy5nZXREYXkoKSksXHJcbiAgICAgICAgICAgIGluZm9Gb3JEYXkgPSAoPGFueT50aGlzKVtkYXldO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZm9Gb3JEYXkubGVuZ3RoOyBpKz0yKSB7XHJcbiAgICAgICAgICAgIGlmIChsaWVzTm93SW5JbnRlcnZhbChpbmZvRm9yRGF5W2ldLCBpbmZvRm9yRGF5W2krMV0pKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxsZWQgYnkgc3VwZXIoKTtcclxuICAgIHByb3RlY3RlZCBkb0xvYWQgKCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5Lm9wZW5pbmdob3Vycygocm91Z2hkYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcm91Z2hkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlRGF0YShyb3VnaGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkU3VjY2VzcygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkRmFpbGVkKHJvdWdoZGF0YS5lcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHBhcnNlRGF0YSAocm91Z2hkYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSB7XHJcbiAgICAgICAgdGhpcy5tb25kYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignbW9uJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMudHVlc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd0dWUnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy53ZWRuZXNkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignd2VkJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMudGh1cnNkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZigndGh1JykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuZnJpZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ2ZyaScpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnNhdHVyZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3NhdCcpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnN1bmRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdzdW4nKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRheVRvVmFsdWUgKGRheSA6IHN0cmluZykgOiBudW1iZXJ7XHJcbiAgICBpZiAoZGF5ID09PSdtb24nKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0ndHVlJykge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3dlZCcpIHtcclxuICAgICAgICByZXR1cm4gMjtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSd0aHUnKSB7XHJcbiAgICAgICAgcmV0dXJuIDM7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nZnJpJykge1xyXG4gICAgICAgIHJldHVybiA0O1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3NhdCcpIHtcclxuICAgICAgICByZXR1cm4gNTtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSdzdW4nKSB7XHJcbiAgICAgICAgcmV0dXJuIDY7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpzVmFsdWVUb0RheSAodmFsdWUgOiBudW1iZXIpIDogc3RyaW5ne1xyXG4gICAgaWYgKHZhbHVlID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuICdzdW5kYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMSkge1xyXG4gICAgICAgIHJldHVybiAnbW9uZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDIpIHtcclxuICAgICAgICByZXR1cm4gJ3R1ZXNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMykge1xyXG4gICAgICAgIHJldHVybiAnd2VkbmVzZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDQpIHtcclxuICAgICAgICByZXR1cm4gJ3RodXJzZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDUpIHtcclxuICAgICAgICByZXR1cm4gJ2ZyaWRheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSA2KSB7XHJcbiAgICAgICAgcmV0dXJuICdzYXR1cmRheSc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpzRGF5VmFsdWUgKGRheSA6IHN0cmluZykgOiBudW1iZXIge1xyXG4gICAgcmV0dXJuICgoZGF5VG9WYWx1ZShkYXkpICsgMSkgJSA3KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29tcGFyZU9wZW5pbmdJbmZvIChhIDogc3RyaW5nLCBiIDogc3RyaW5nKSB7XHJcbiAgICBsZXQgaW5mb0EgPSBhLnNwbGl0KCdfJyksXHJcbiAgICAgICAgaW5mb0IgPSBiLnNwbGl0KCdfJyk7XHJcblxyXG4gICAgaWYgKHBhcnNlSW50KGluZm9BWzFdKSA8IHBhcnNlSW50KGluZm9CWzFdKSkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoaW5mb0FbMV0pID4gcGFyc2VJbnQoaW5mb0JbMV0pKXtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGluZm9BWzJdID09PSAnb3Blbicpe1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfSBlbHNlIHJldHVybiAxO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB0b1RpbWluZ3MgKG9wZW5pbmdUaW1lIDogc3RyaW5nW10sIHJvdWdoRGF0YSA6IEZCSG91cnNSZXNwb25zZSkgOiBzdHJpbmdbXSB7XHJcbiAgICBsZXQgdGltaW5ncyA6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgb3BlbmluZyBvZiBvcGVuaW5nVGltZSkge1xyXG4gICAgICAgIHRpbWluZ3MucHVzaChyb3VnaERhdGEuaG91cnNbb3BlbmluZ10pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRpbWluZ3M7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxpZXNOb3dJbkludGVydmFsIChzdGFydCA6IHN0cmluZywgZW5kIDogc3RyaW5nKSA6IGJvb2xlYW4ge1xyXG5cclxuICAgIGxldCBub3cgOiBEYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICBzdGFydEhvdXJzTWludXRlcyAgPSBzdGFydC5zcGxpdCgnOicpLFxyXG4gICAgICAgIHN0YXJ0RGF0ZSA6IERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIHN0YXJ0SG91ciA6IG51bWJlciA9IHBhcnNlSW50KHN0YXJ0SG91cnNNaW51dGVzWzBdKSxcclxuICAgICAgICBzdGFydE1pbnV0ZXMgOiBudW1iZXIgPSBwYXJzZUludChzdGFydEhvdXJzTWludXRlc1sxXSksXHJcbiAgICAgICAgZW5kSG91cnNNaW51dGVzICA9IGVuZC5zcGxpdCgnOicpLFxyXG4gICAgICAgIGVuZERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIGVuZEhvdXIgOiBudW1iZXIgPSBwYXJzZUludChlbmRIb3Vyc01pbnV0ZXNbMF0pLFxyXG4gICAgICAgIGVuZE1pbnV0ZXMgOiBudW1iZXIgPSBwYXJzZUludChlbmRIb3Vyc01pbnV0ZXNbMV0pO1xyXG5cclxuICAgIHN0YXJ0RGF0ZS5zZXRIb3VycyhzdGFydEhvdXIpO1xyXG4gICAgc3RhcnREYXRlLnNldE1pbnV0ZXMoc3RhcnRNaW51dGVzKTtcclxuICAgIGVuZERhdGUuc2V0SG91cnMoZW5kSG91cik7XHJcbiAgICBlbmREYXRlLnNldE1pbnV0ZXMoZW5kTWludXRlcyk7XHJcblxyXG4gICAgcmV0dXJuIG5vdyA+PSBzdGFydERhdGUgJiYgbm93IDwgZW5kRGF0ZTtcclxufSIsImltcG9ydCB7RkJQb3N0UmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7SW1hZ2VUYWd9IGZyb20gXCIuLi9saWJyYXJ5L1NjcmlwdFRhZ1wiO1xyXG5pbXBvcnQge0ZCX1BBR0VfSUR9IGZyb20gXCIuL0ZhY2Vib29rUHJveHlcIjtcclxuaW1wb3J0IHtsaW5raWZ5fSBmcm9tIFwiLi4vdXRpbC9MaW5raWZ5XCI7XHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1Bvc3Qge1xyXG5cclxuICAgIHByaXZhdGUgaW5mbyA6IEZCUG9zdFJlc3BvbnNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yIChpbmZvIDogRkJQb3N0UmVzcG9uc2UpIHtcclxuICAgICAgICB0aGlzLmluZm8gPSBpbmZvO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgY2FuRGlzcGxheSAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5pbmZvLmlzX2hpZGRlbiAmJiB0aGlzLmluZm8uaXNfcHVibGlzaGVkICYmIHRoaXMuaW5mby5mcm9tICYmIHRoaXMuaW5mby5mcm9tLmlkID09PSBGQl9QQUdFX0lEO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgY3JlYXRlZCAoKSA6IERhdGUge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmluZm8uY3JlYXRlZF90aW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlkICgpIDogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmZvLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbWVzc2FnZSAoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5mby5tZXNzYWdlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IHBpY3R1cmUgKCkgOiBJbWFnZVRhZyB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5mby5mdWxsX3BpY3R1cmUpIHtcclxuICAgICAgICAgICAgbGV0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IHRoaXMuaW5mby5mdWxsX3BpY3R1cmU7XHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLndpZHRoID0gJzEwMCUnO1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XHJcbiAgICAgICAgICAgIHJldHVybiBpbWFnZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlclRvIChwYXJlbnQgOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNhbkRpc3BsYXkpIHtcclxuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMudmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdmlldyAoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBsZXQgdmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHZpZXcuY2xhc3NOYW1lID0gJ3Jlbi1mYnBvc3QnO1xyXG4gICAgICAgIHZpZXcuc3R5bGUud2lkdGggPSAnNTAwcHgnO1xyXG5cclxuICAgICAgICBsZXQgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgaGVhZGVyLmNsYXNzTmFtZSA9ICdyZW4tZmJwb3N0LWhlYWRlcic7XHJcbiAgICAgICAgaGVhZGVyLmlubmVyVGV4dCA9IHRoaXMuY3JlYXRlZC50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuXHJcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgbWVzc2FnZS5jbGFzc05hbWUgPSAncmVuLWZicG9zdC10ZXh0JztcclxuICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9IHRoaXMubWVzc2FnZSAmJiBsaW5raWZ5KHRoaXMubWVzc2FnZSk7XHJcblxyXG4gICAgICAgIGxldCBwaWN0dXJlID0gdGhpcy5waWN0dXJlO1xyXG5cclxuICAgICAgICBpZiAoaGVhZGVyKSB7dmlldy5hcHBlbmRDaGlsZChoZWFkZXIpO31cclxuICAgICAgICBpZiAobWVzc2FnZSkge3ZpZXcuYXBwZW5kQ2hpbGQobWVzc2FnZSk7fVxyXG4gICAgICAgIGlmIChwaWN0dXJlKSB7dmlldy5hcHBlbmRDaGlsZChwaWN0dXJlKTt9XHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0ZCUmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7TG9hZGFibGV9IGZyb20gXCIuLi9Mb2FkYWJsZVwiO1xyXG5pbXBvcnQge1NjcmlwdFRhZ30gZnJvbSBcIi4uL2xpYnJhcnkvU2NyaXB0VGFnXCI7XHJcblxyXG5jb25zdCBwcm94eVVSTCA9ICdodHRwczovL3JlbnNlY3VyaXR5cHJveHktc2FtZ2llbGlzLnJoY2xvdWQuY29tLyc7XHJcbmV4cG9ydCBjb25zdCBGQl9QQUdFX0lEIDogc3RyaW5nID0gXCIyMTU0NzAzNDE5MDk5MzdcIjtcclxuXHJcbmludGVyZmFjZSBJRmFjZWJvb2tTREsge1xyXG4gICAgaW5pdCA6IGFueTtcclxuICAgIGFwaSAoZ3JhcGhwYXRoIDogc3RyaW5nLCBjYWxsYmFjayA6IChyZXNwb25zZSA6IEZCUmVzcG9uc2UpID0+IGFueSkgOiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRmFjZWJvb2tQcm94eSB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBmZWVkICAoc3VjYyA6IChpbmZvIDogRkJSZXNwb25zZSkgPT4gdm9pZCwgZmFpbD8gOiAoKSA9PiB2b2lkKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkuZ2V0KCdmZWVkJywgc3VjYywgZmFpbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBvcGVuaW5naG91cnMgIChzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5nZXQoJ29wZW5pbmdob3VycycsIHN1Y2MsIGZhaWwpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXQgKHVybCA6IHN0cmluZywgc3VjYyA6IChpbmZvIDogRkJSZXNwb25zZSkgPT4gdm9pZCwgZmFpbD8gOiAoKSA9PiB2b2lkKSA6IHZvaWQge1xyXG4gICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICB4aHIub3BlbignZ2V0JywgcHJveHlVUkwgKyB1cmwsIHRydWUpO1xyXG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XHJcbiAgICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cztcclxuICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICAgICAgICAgIHN1Y2MoeGhyLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGZhaWwpIHtcclxuICAgICAgICAgICAgICAgIGZhaWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgeGhyLnNlbmQoKTtcclxuICAgIH1cclxufSIsImV4cG9ydCBmdW5jdGlvbiBsaW5raWZ5IChpbnB1dFRleHQgOiBzdHJpbmcpIDogc3RyaW5nIHtcclxuICAgIHZhciByZXBsYWNlZFRleHQgOiBzdHJpbmcsXHJcbiAgICAgICAgcmVwbGFjZVBhdHRlcm4xIDogUmVnRXhwLCByZXBsYWNlUGF0dGVybjIgOiBSZWdFeHAsIHJlcGxhY2VQYXR0ZXJuMyA6IFJlZ0V4cDtcclxuXHJcbiAgICAvL1VSTHMgc3RhcnRpbmcgd2l0aCBodHRwOi8vLCBodHRwczovLywgb3IgZnRwOi8vXHJcbiAgICByZXBsYWNlUGF0dGVybjEgPSAvKFxcYihodHRwcz98ZnRwKTpcXC9cXC9bLUEtWjAtOSsmQCNcXC8lPz1+X3whOiwuO10qWy1BLVowLTkrJkAjXFwvJT1+X3xdKS9naW07XHJcbiAgICByZXBsYWNlZFRleHQgPSBpbnB1dFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybjEsICc8YSBocmVmPVwiJDFcIiB0YXJnZXQ9XCJfYmxhbmtcIj4kMTwvYT4nKTtcclxuXHJcbiAgICAvL1VSTHMgc3RhcnRpbmcgd2l0aCBcInd3dy5cIiAod2l0aG91dCAvLyBiZWZvcmUgaXQsIG9yIGl0J2QgcmUtbGluayB0aGUgb25lcyBkb25lIGFib3ZlKS5cclxuICAgIHJlcGxhY2VQYXR0ZXJuMiA9IC8oXnxbXlxcL10pKHd3d1xcLltcXFNdKyhcXGJ8JCkpL2dpbTtcclxuICAgIHJlcGxhY2VkVGV4dCA9IHJlcGxhY2VkVGV4dC5yZXBsYWNlKHJlcGxhY2VQYXR0ZXJuMiwgJyQxPGEgaHJlZj1cImh0dHA6Ly8kMlwiIHRhcmdldD1cIl9ibGFua1wiPiQyPC9hPicpO1xyXG5cclxuICAgIC8vQ2hhbmdlIGVtYWlsIGFkZHJlc3NlcyB0byBtYWlsdG86OiBsaW5rcy5cclxuICAgIHJlcGxhY2VQYXR0ZXJuMyA9IC8oKFthLXpBLVowLTlcXC1cXF9cXC5dKStAW2EtekEtWlxcX10rPyhcXC5bYS16QS1aXXsyLDZ9KSspL2dpbTtcclxuICAgIHJlcGxhY2VkVGV4dCA9IHJlcGxhY2VkVGV4dC5yZXBsYWNlKHJlcGxhY2VQYXR0ZXJuMywgJzxhIGhyZWY9XCJtYWlsdG86JDFcIj4kMTwvYT4nKTtcclxuXHJcbiAgICByZXR1cm4gcmVwbGFjZWRUZXh0O1xyXG59IiwiaW1wb3J0IHtGYWNlYm9va09wZW5pbmdJbmZvfSBmcm9tIFwiLi4vZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rT3BlbmluZ0luZm9cIjtcclxuXHJcbmNvbnN0IGRheXMgOiBzdHJpbmdbXSA9IFtcclxuICAgICdtb25kYXknLCAndHVlc2RheScsICd3ZWRuZXNkYXknLCAndGh1cnNkYXknLCAnZnJpZGF5JywgJ3NhdHVyZGF5JywgJ3N1bmRheSdcclxuXTtcclxuXHJcbmNvbnN0IGRheXNUcmFuc2xhdGlvbiA6IHtbZGF5IDogc3RyaW5nXSA6IHN0cmluZ30gPSB7XHJcbiAgICAnbW9uZGF5JyA6ICdNYWFuZGFnJyxcclxuICAgICd0dWVzZGF5JyA6ICdEaW5zZGFnJyxcclxuICAgICd3ZWRuZXNkYXknIDogJ1dvZW5zZGFnJyxcclxuICAgICd0aHVyc2RheScgOiAnRG9uZGVyZGFnJyxcclxuICAgICdmcmlkYXknIDogJ1ZyaWpkYWcnLFxyXG4gICAgJ3NhdHVyZGF5JyA6ICdaYXRlcmRhZycsXHJcbiAgICAnc3VuZGF5JyA6ICdab25kYWcnXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb3BlbmluZ0luZm9WaWV3IChvcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm8pIDogSFRNTEVsZW1lbnQge1xyXG4gICAgbGV0IHJvb3QgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZm9yIChsZXQgZGF5IG9mIGRheXMpIHtcclxuICAgICAgICBsZXQgZGF5dmlldyA9IGRheVZpZXcoZGF5LCAoPGFueT5vcGVuaW5nSW5mbylbZGF5XSk7XHJcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIH1cclxuICAgIHJvb3QuYXBwZW5kQ2hpbGQoY3VycmVudGx5T3BlblZpZXcob3BlbmluZ0luZm8uaXNDdXJyZW50bHlPcGVuKSk7XHJcbiAgICByZXR1cm4gcm9vdDtcclxufVxyXG5cclxuZnVuY3Rpb24gZGF5VmlldyAoZGF5IDogc3RyaW5nLCBob3VycyA6IHN0cmluZ1tdKSA6IEhUTUxFbGVtZW50IHtcclxuICAgIGxldCBkYXl2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcbiAgICAgICAgaG91cnZpZXcgOiBzdHJpbmcgPSBob3VyVmlldyhob3Vycyk7XHJcbiAgICBkYXl2aWV3LmlubmVySFRNTCA9IGRheXNUcmFuc2xhdGlvbltkYXldICsgJyA6ICcgKyBob3VydmlldztcclxuICAgIHJldHVybiBkYXl2aWV3O1xyXG59XHJcblxyXG5mdW5jdGlvbiBob3VyVmlldyAoaG91cnMgOiBzdHJpbmdbXSkgOiBzdHJpbmcge1xyXG4gICAgbGV0IGhvdXJ2aWV3ID0gJyc7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhvdXJzLmxlbmd0aDsgaSs9Mikge1xyXG4gICAgICAgIGhvdXJ2aWV3ICs9IGhvdXJzW2ldICsgJyAtICcgKyBob3Vyc1tpKzFdO1xyXG4gICAgICAgIGlmIChpKzEgIT0gaG91cnMubGVuZ3RoLTEpIHtcclxuICAgICAgICAgICAgaG91cnZpZXcgKz0gJywgJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaG91cnZpZXcgfHwgJ0dlc2xvdGVuJztcclxufVxyXG5cclxuZnVuY3Rpb24gY3VycmVudGx5T3BlblZpZXcgKGN1cnJlbnRseU9wZW4gOiBib29sZWFuKSA6IEhUTUxFbGVtZW50IHtcclxuICAgIGxldCB2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgaWYgKGN1cnJlbnRseU9wZW4pIHtcclxuICAgICAgICB2aWV3LmlubmVySFRNTCA9ICdOdSBPcGVuISc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZpZXcuaW5uZXJIVE1MID0gJ01vbWVudGVlbCBnZXNsb3Rlbic7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmlldztcclxufSJdfQ==
