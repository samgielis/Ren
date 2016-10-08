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
var Ren = (function () {
    function Ren() {
        this._openingInfo = new FacebookOpeningInfo_1.FacebookOpeningInfo();
        this._openingInfo.afterLoad(function () {
            //let view = openingInfoView(this._openingInfo);
            //(<HTMLElement>document.querySelector('#ren-openingsuren')).appendChild(view);
        });
        this._feed = new FacebookFeed_1.FacebookFeed();
        this._feed.afterLoad(function () {
            //this._feed.renderTo(<HTMLElement>document.querySelector('.ren-background-image'));
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
},{"./facebookplugins/FacebookFeed":4,"./facebookplugins/FacebookOpeningInfo":5}],3:[function(require,module,exports){
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
},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTG9hZGFibGUudHMiLCJzcmMvUmVuLnRzIiwic3JjL1Jlbkdsb2JhbC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va1Bvc3QudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rUHJveHkudHMiLCJzcmMvdXRpbC9MaW5raWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0lBT0k7UUFMUSxjQUFTLEdBQWEsS0FBSyxDQUFDO1FBQzVCLGdCQUFXLEdBQWEsS0FBSyxDQUFDO1FBQzlCLDJCQUFzQixHQUFtQixFQUFFLENBQUM7UUFDNUMsd0JBQW1CLEdBQW1CLEVBQUUsQ0FBQztRQUc3QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELHNCQUFXLDhCQUFRO2FBQW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVyxtQ0FBYTthQUF4QjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFBO1FBQzNCLENBQUM7OztPQUFBO0lBRU0sNEJBQVMsR0FBaEIsVUFBa0IsbUJBQStCLEVBQUUsZ0JBQTZCO1FBQzVFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLG1CQUFtQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBLENBQUM7Z0JBQ2xCLGdCQUFnQixFQUFFLENBQUM7WUFDdkIs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Q0FBQyxDQUFDLENBQUM7UUFDZCxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3RCLENBQUM7QUFDTCxDQUFDO0FBRUQsb0JBQXFCLEdBQVk7SUFDN0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUVELDRCQUE2QixDQUFVLEVBQUUsQ0FBVTtJQUMvQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUNwQixLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUV6QixFQUFFLENBQUMsQ0FB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QUN4RixlQUFlLEdBQUcsZ0NBQWdDLENBQUM7SUFDbkQsWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLDhDQUE4QyxDQUFDLENBQUM7SUFFckcsMkNBQTJDO0lBQzNDLGVBQWUsR0FBRywwREFBMEQsQ0FBQztJQUM3RSxZQUFZLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztJQUVuRixNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3hCLENBQUM7QUFqQmUsZUFBTyxVQWlCdEIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgYWJzdHJhY3QgY2xhc3MgTG9hZGFibGUge1xyXG5cclxuICAgIHByaXZhdGUgX2lzTG9hZGVkIDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfbG9hZEZhaWxlZCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX3dhaXRpbmdGb3JMb2FkU3VjY2VzcyA6ICgoKSA9PiBhbnkpW10gPSBbXTtcclxuICAgIHByaXZhdGUgX3dhaXRpbmdGb3JMb2FkRmFpbCA6ICgoKSA9PiBhbnkpW10gPSBbXTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHRoaXMuZG9Mb2FkKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXQgaXNMb2FkZWQgKCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNMb2FkZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBoYXNMb2FkRmFpbGVkICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvYWRGYWlsZWRcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWZ0ZXJMb2FkIChsb2FkU3VjY2Vzc0NhbGxiYWNrIDogKCkgPT4gYW55LCBsb2FkRmFpbENhbGxiYWNrPyA6ICgpID0+IGFueSkgOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRlZCkge1xyXG4gICAgICAgICAgICBsb2FkU3VjY2Vzc0NhbGxiYWNrKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0xvYWRGYWlsZWQpIHtcclxuICAgICAgICAgICAgaWYgKGxvYWRGYWlsQ2FsbGJhY2spe1xyXG4gICAgICAgICAgICAgICAgbG9hZEZhaWxDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzLnB1c2gobG9hZFN1Y2Nlc3NDYWxsYmFjayk7XHJcbiAgICAgICAgICAgIGlmIChsb2FkRmFpbENhbGxiYWNrKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkRmFpbC5wdXNoKGxvYWRGYWlsQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgbG9hZFN1Y2Nlc3MgKCkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fd2FpdGluZ0ZvckxvYWRTdWNjZXNzKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2VzcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsb2FkRmFpbGVkIChlcnJvciA6IHN0cmluZykgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9sb2FkRmFpbGVkID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiB0aGlzLl93YWl0aW5nRm9yTG9hZEZhaWwpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fd2FpdGluZ0ZvckxvYWRGYWlsID0gW107XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMb2FkaW5nIGZhaWxlZCA6ICcgKyBlcnJvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGRvTG9hZCAoKSA6IHZvaWQ7XHJcbn0iLCJpbXBvcnQge0ZhY2Vib29rT3BlbmluZ0luZm99IGZyb20gXCIuL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvXCI7XHJcbmltcG9ydCB7b3BlbmluZ0luZm9WaWV3fSBmcm9tIFwiLi92aWV3L09wZW5pbmdJbmZvVmlld1wiO1xyXG5pbXBvcnQge0ZhY2Vib29rRmVlZH0gZnJvbSBcIi4vZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rRmVlZFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFJlbiB7XHJcblxyXG4gICAgcHJpdmF0ZSBfb3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvO1xyXG4gICAgcHJpdmF0ZSBfZmVlZCA6IEZhY2Vib29rRmVlZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgdGhpcy5fb3BlbmluZ0luZm8gPSBuZXcgRmFjZWJvb2tPcGVuaW5nSW5mbygpO1xyXG4gICAgICAgIHRoaXMuX29wZW5pbmdJbmZvLmFmdGVyTG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vbGV0IHZpZXcgPSBvcGVuaW5nSW5mb1ZpZXcodGhpcy5fb3BlbmluZ0luZm8pO1xyXG4gICAgICAgICAgICAvLyg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jlbi1vcGVuaW5nc3VyZW4nKSkuYXBwZW5kQ2hpbGQodmlldyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fZmVlZCA9IG5ldyBGYWNlYm9va0ZlZWQoKTtcclxuICAgICAgICB0aGlzLl9mZWVkLmFmdGVyTG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vdGhpcy5fZmVlZC5yZW5kZXJUbyg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlbi1iYWNrZ3JvdW5kLWltYWdlJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgZmVlZCAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBvcGVuaW5nSW5mbyAoKSA6IEZhY2Vib29rT3BlbmluZ0luZm8ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcGVuaW5nSW5mbztcclxuICAgIH1cclxufSIsImltcG9ydCB7UmVufSBmcm9tIFwiLi9SZW5cIjtcclxuXHJcbig8YW55PndpbmRvdykuUmVuU3BvcnQgPSBuZXcgUmVuKCk7IiwiaW1wb3J0IHtGQkZlZWRSZXNwb25zZU9iamVjdH0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7RmFjZWJvb2tQcm94eX0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5pbXBvcnQge0ZhY2Vib29rUG9zdH0gZnJvbSBcIi4vRmFjZWJvb2tQb3N0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRmFjZWJvb2tGZWVkIGV4dGVuZHMgTG9hZGFibGUge1xyXG5cclxuICAgIHByaXZhdGUgX3Bvc3RzIDogQXJyYXk8RmFjZWJvb2tQb3N0PiA9IFtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcG9zdHMgKCkgOiBBcnJheTxGYWNlYm9va1Bvc3Q+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcG9zdHM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FsbGVkIGJ5IHN1cGVyKCk7XHJcbiAgICBwcm90ZWN0ZWQgZG9Mb2FkICgpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5mZWVkKChyZXMgOiBGQkZlZWRSZXNwb25zZU9iamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJlcy5lcnJvciAmJiByZXMuZmVlZCAmJiByZXMuZmVlZC5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwb3N0IG9mIHJlcy5mZWVkLmRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Bvc3RzLnB1c2gobmV3IEZhY2Vib29rUG9zdChwb3N0KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRTdWNjZXNzKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRGYWlsZWQocmVzLmVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdmlldyAoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBsZXQgdmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHZpZXcuY2xhc3NOYW1lID0gJ3Jlbi1mYmZlZWQnO1xyXG4gICAgICAgIHZpZXcuc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIHZpZXcuc3R5bGUuZm9udEZhbWlseSA9ICdMYXRvLCBzYW5zLXNlcmlmJzsgLy8gJ1NTUElLQSwgdmVyZGFuYSwgdGFob21hJztcclxuXHJcbiAgICAgICAgZm9yIChsZXQgcG9zdCBvZiB0aGlzLnBvc3RzKSB7XHJcbiAgICAgICAgICAgIHBvc3QucmVuZGVyVG8odmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXJUbyAocGFyZW50IDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy52aWV3KTtcclxuICAgIH1cclxufSIsImltcG9ydCB7RkJIb3Vyc1Jlc3BvbnNlfSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0xvYWRhYmxlfSBmcm9tIFwiLi4vTG9hZGFibGVcIjtcclxuaW1wb3J0IHtGYWNlYm9va1Byb3h5fSBmcm9tIFwiLi9GYWNlYm9va1Byb3h5XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRmFjZWJvb2tPcGVuaW5nSW5mbyBleHRlbmRzIExvYWRhYmxlIHtcclxuXHJcbiAgICBwdWJsaWMgbW9uZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyB0dWVzZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyB3ZWRuZXNkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHRodXJzZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyBmcmlkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHNhdHVyZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyBzdW5kYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNDdXJyZW50bHlPcGVuICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG5vdyA6IERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICBkYXkgPSBqc1ZhbHVlVG9EYXkobm93LmdldERheSgpKSxcclxuICAgICAgICAgICAgaW5mb0ZvckRheSA9ICg8YW55PnRoaXMpW2RheV07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5mb0ZvckRheS5sZW5ndGg7IGkrPTIpIHtcclxuICAgICAgICAgICAgaWYgKGxpZXNOb3dJbkludGVydmFsKGluZm9Gb3JEYXlbaV0sIGluZm9Gb3JEYXlbaSsxXSkpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGxlZCBieSBzdXBlcigpO1xyXG4gICAgcHJvdGVjdGVkIGRvTG9hZCAoKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkub3BlbmluZ2hvdXJzKChyb3VnaGRhdGEgOiBGQkhvdXJzUmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyb3VnaGRhdGEuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VEYXRhKHJvdWdoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRTdWNjZXNzKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRGYWlsZWQocm91Z2hkYXRhLmVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGFyc2VEYXRhIChyb3VnaGRhdGEgOiBGQkhvdXJzUmVzcG9uc2UpIHtcclxuICAgICAgICB0aGlzLm1vbmRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdtb24nKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy50dWVzZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3R1ZScpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLndlZG5lc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd3ZWQnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy50aHVyc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd0aHUnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5mcmlkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignZnJpJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuc2F0dXJkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignc2F0JykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuc3VuZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3N1bicpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGF5VG9WYWx1ZSAoZGF5IDogc3RyaW5nKSA6IG51bWJlcntcclxuICAgIGlmIChkYXkgPT09J21vbicpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSd0dWUnKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nd2VkJykge1xyXG4gICAgICAgIHJldHVybiAyO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3RodScpIHtcclxuICAgICAgICByZXR1cm4gMztcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSdmcmknKSB7XHJcbiAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nc2F0Jykge1xyXG4gICAgICAgIHJldHVybiA1O1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3N1bicpIHtcclxuICAgICAgICByZXR1cm4gNjtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ganNWYWx1ZVRvRGF5ICh2YWx1ZSA6IG51bWJlcikgOiBzdHJpbmd7XHJcbiAgICBpZiAodmFsdWUgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gJ3N1bmRheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuICdtb25kYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMikge1xyXG4gICAgICAgIHJldHVybiAndHVlc2RheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAzKSB7XHJcbiAgICAgICAgcmV0dXJuICd3ZWRuZXNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gNCkge1xyXG4gICAgICAgIHJldHVybiAndGh1cnNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gNSkge1xyXG4gICAgICAgIHJldHVybiAnZnJpZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDYpIHtcclxuICAgICAgICByZXR1cm4gJ3NhdHVyZGF5JztcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ganNEYXlWYWx1ZSAoZGF5IDogc3RyaW5nKSA6IG51bWJlciB7XHJcbiAgICByZXR1cm4gKChkYXlUb1ZhbHVlKGRheSkgKyAxKSAlIDcpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb21wYXJlT3BlbmluZ0luZm8gKGEgOiBzdHJpbmcsIGIgOiBzdHJpbmcpIHtcclxuICAgIGxldCBpbmZvQSA9IGEuc3BsaXQoJ18nKSxcclxuICAgICAgICBpbmZvQiA9IGIuc3BsaXQoJ18nKTtcclxuXHJcbiAgICBpZiAocGFyc2VJbnQoaW5mb0FbMV0pIDwgcGFyc2VJbnQoaW5mb0JbMV0pKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSBlbHNlIGlmIChwYXJzZUludChpbmZvQVsxXSkgPiBwYXJzZUludChpbmZvQlsxXSkpe1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoaW5mb0FbMl0gPT09ICdvcGVuJyl7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9IGVsc2UgcmV0dXJuIDE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvVGltaW5ncyAob3BlbmluZ1RpbWUgOiBzdHJpbmdbXSwgcm91Z2hEYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSA6IHN0cmluZ1tdIHtcclxuICAgIGxldCB0aW1pbmdzIDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBvcGVuaW5nIG9mIG9wZW5pbmdUaW1lKSB7XHJcbiAgICAgICAgdGltaW5ncy5wdXNoKHJvdWdoRGF0YS5ob3Vyc1tvcGVuaW5nXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGltaW5ncztcclxufVxyXG5cclxuZnVuY3Rpb24gbGllc05vd0luSW50ZXJ2YWwgKHN0YXJ0IDogc3RyaW5nLCBlbmQgOiBzdHJpbmcpIDogYm9vbGVhbiB7XHJcblxyXG4gICAgbGV0IG5vdyA6IERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIHN0YXJ0SG91cnNNaW51dGVzICA9IHN0YXJ0LnNwbGl0KCc6JyksXHJcbiAgICAgICAgc3RhcnREYXRlIDogRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgc3RhcnRIb3VyIDogbnVtYmVyID0gcGFyc2VJbnQoc3RhcnRIb3Vyc01pbnV0ZXNbMF0pLFxyXG4gICAgICAgIHN0YXJ0TWludXRlcyA6IG51bWJlciA9IHBhcnNlSW50KHN0YXJ0SG91cnNNaW51dGVzWzFdKSxcclxuICAgICAgICBlbmRIb3Vyc01pbnV0ZXMgID0gZW5kLnNwbGl0KCc6JyksXHJcbiAgICAgICAgZW5kRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgZW5kSG91ciA6IG51bWJlciA9IHBhcnNlSW50KGVuZEhvdXJzTWludXRlc1swXSksXHJcbiAgICAgICAgZW5kTWludXRlcyA6IG51bWJlciA9IHBhcnNlSW50KGVuZEhvdXJzTWludXRlc1sxXSk7XHJcblxyXG4gICAgc3RhcnREYXRlLnNldEhvdXJzKHN0YXJ0SG91cik7XHJcbiAgICBzdGFydERhdGUuc2V0TWludXRlcyhzdGFydE1pbnV0ZXMpO1xyXG4gICAgZW5kRGF0ZS5zZXRIb3VycyhlbmRIb3VyKTtcclxuICAgIGVuZERhdGUuc2V0TWludXRlcyhlbmRNaW51dGVzKTtcclxuXHJcbiAgICByZXR1cm4gbm93ID49IHN0YXJ0RGF0ZSAmJiBub3cgPCBlbmREYXRlO1xyXG59IiwiaW1wb3J0IHtGQlBvc3RSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtJbWFnZVRhZ30gZnJvbSBcIi4uL2xpYnJhcnkvU2NyaXB0VGFnXCI7XHJcbmltcG9ydCB7RkJfUEFHRV9JRH0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5pbXBvcnQge2xpbmtpZnl9IGZyb20gXCIuLi91dGlsL0xpbmtpZnlcIjtcclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rUG9zdCB7XHJcblxyXG4gICAgcHJpdmF0ZSBpbmZvIDogRkJQb3N0UmVzcG9uc2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKGluZm8gOiBGQlBvc3RSZXNwb25zZSkge1xyXG4gICAgICAgIHRoaXMuaW5mbyA9IGluZm87XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjYW5EaXNwbGF5ICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmluZm8uaXNfaGlkZGVuICYmIHRoaXMuaW5mby5pc19wdWJsaXNoZWQgJiYgdGhpcy5pbmZvLmZyb20gJiYgdGhpcy5pbmZvLmZyb20uaWQgPT09IEZCX1BBR0VfSUQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjcmVhdGVkICgpIDogRGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuaW5mby5jcmVhdGVkX3RpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaWQgKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZm8uaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBtZXNzYWdlICgpIDogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmZvLm1lc3NhZ2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXQgcGljdHVyZSAoKSA6IEltYWdlVGFnIHtcclxuICAgICAgICBpZiAodGhpcy5pbmZvLmZ1bGxfcGljdHVyZSkge1xyXG4gICAgICAgICAgICBsZXQgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gdGhpcy5pbmZvLmZ1bGxfcGljdHVyZTtcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUud2lkdGggPSAnMTAwJSc7XHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcclxuICAgICAgICAgICAgcmV0dXJuIGltYWdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyVG8gKHBhcmVudCA6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FuRGlzcGxheSkge1xyXG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy52aWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB2aWV3ICgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCB2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgdmlldy5jbGFzc05hbWUgPSAncmVuLWZicG9zdCc7XHJcbiAgICAgICAgdmlldy5zdHlsZS53aWR0aCA9ICc1MDBweCc7XHJcblxyXG4gICAgICAgIGxldCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBoZWFkZXIuY2xhc3NOYW1lID0gJ3Jlbi1mYnBvc3QtaGVhZGVyJztcclxuICAgICAgICBoZWFkZXIuaW5uZXJUZXh0ID0gdGhpcy5jcmVhdGVkLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG5cclxuICAgICAgICBsZXQgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICBtZXNzYWdlLmNsYXNzTmFtZSA9ICdyZW4tZmJwb3N0LXRleHQnO1xyXG4gICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gdGhpcy5tZXNzYWdlICYmIGxpbmtpZnkodGhpcy5tZXNzYWdlKTtcclxuXHJcbiAgICAgICAgbGV0IHBpY3R1cmUgPSB0aGlzLnBpY3R1cmU7XHJcblxyXG4gICAgICAgIGlmIChoZWFkZXIpIHt2aWV3LmFwcGVuZENoaWxkKGhlYWRlcik7fVxyXG4gICAgICAgIGlmIChtZXNzYWdlKSB7dmlldy5hcHBlbmRDaGlsZChtZXNzYWdlKTt9XHJcbiAgICAgICAgaWYgKHBpY3R1cmUpIHt2aWV3LmFwcGVuZENoaWxkKHBpY3R1cmUpO31cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxufSIsImltcG9ydCB7RkJSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7U2NyaXB0VGFnfSBmcm9tIFwiLi4vbGlicmFyeS9TY3JpcHRUYWdcIjtcclxuXHJcbmNvbnN0IHByb3h5VVJMID0gJ2h0dHBzOi8vcmVuc2VjdXJpdHlwcm94eS1zYW1naWVsaXMucmhjbG91ZC5jb20vJztcclxuZXhwb3J0IGNvbnN0IEZCX1BBR0VfSUQgOiBzdHJpbmcgPSBcIjIxNTQ3MDM0MTkwOTkzN1wiO1xyXG5cclxuaW50ZXJmYWNlIElGYWNlYm9va1NESyB7XHJcbiAgICBpbml0IDogYW55O1xyXG4gICAgYXBpIChncmFwaHBhdGggOiBzdHJpbmcsIGNhbGxiYWNrIDogKHJlc3BvbnNlIDogRkJSZXNwb25zZSkgPT4gYW55KSA6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1Byb3h5IHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGZlZWQgIChzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5nZXQoJ2ZlZWQnLCBzdWNjLCBmYWlsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIG9wZW5pbmdob3VycyAgKHN1Y2MgOiAoaW5mbyA6IEZCUmVzcG9uc2UpID0+IHZvaWQsIGZhaWw/IDogKCkgPT4gdm9pZCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5LmdldCgnb3BlbmluZ2hvdXJzJywgc3VjYywgZmFpbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc3RhdGljIGdldCAodXJsIDogc3RyaW5nLCBzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgIHhoci5vcGVuKCdnZXQnLCBwcm94eVVSTCArIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcclxuICAgICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzO1xyXG4gICAgICAgICAgICBpZiAoc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgc3VjYyh4aHIucmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoZmFpbCkge1xyXG4gICAgICAgICAgICAgICAgZmFpbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB4aHIuc2VuZCgpO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGZ1bmN0aW9uIGxpbmtpZnkgKGlucHV0VGV4dCA6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgdmFyIHJlcGxhY2VkVGV4dCA6IHN0cmluZyxcclxuICAgICAgICByZXBsYWNlUGF0dGVybjEgOiBSZWdFeHAsIHJlcGxhY2VQYXR0ZXJuMiA6IFJlZ0V4cCwgcmVwbGFjZVBhdHRlcm4zIDogUmVnRXhwO1xyXG5cclxuICAgIC8vVVJMcyBzdGFydGluZyB3aXRoIGh0dHA6Ly8sIGh0dHBzOi8vLCBvciBmdHA6Ly9cclxuICAgIHJlcGxhY2VQYXR0ZXJuMSA9IC8oXFxiKGh0dHBzP3xmdHApOlxcL1xcL1stQS1aMC05KyZAI1xcLyU/PX5ffCE6LC47XSpbLUEtWjAtOSsmQCNcXC8lPX5ffF0pL2dpbTtcclxuICAgIHJlcGxhY2VkVGV4dCA9IGlucHV0VGV4dC5yZXBsYWNlKHJlcGxhY2VQYXR0ZXJuMSwgJzxhIGhyZWY9XCIkMVwiIHRhcmdldD1cIl9ibGFua1wiPiQxPC9hPicpO1xyXG5cclxuICAgIC8vVVJMcyBzdGFydGluZyB3aXRoIFwid3d3LlwiICh3aXRob3V0IC8vIGJlZm9yZSBpdCwgb3IgaXQnZCByZS1saW5rIHRoZSBvbmVzIGRvbmUgYWJvdmUpLlxyXG4gICAgcmVwbGFjZVBhdHRlcm4yID0gLyhefFteXFwvXSkod3d3XFwuW1xcU10rKFxcYnwkKSkvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gcmVwbGFjZWRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4yLCAnJDE8YSBocmVmPVwiaHR0cDovLyQyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JDI8L2E+Jyk7XHJcblxyXG4gICAgLy9DaGFuZ2UgZW1haWwgYWRkcmVzc2VzIHRvIG1haWx0bzo6IGxpbmtzLlxyXG4gICAgcmVwbGFjZVBhdHRlcm4zID0gLygoW2EtekEtWjAtOVxcLVxcX1xcLl0pK0BbYS16QS1aXFxfXSs/KFxcLlthLXpBLVpdezIsNn0pKykvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gcmVwbGFjZWRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4zLCAnPGEgaHJlZj1cIm1haWx0bzokMVwiPiQxPC9hPicpO1xyXG5cclxuICAgIHJldHVybiByZXBsYWNlZFRleHQ7XHJcbn0iXX0=
