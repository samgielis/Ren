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
    };
    Loadable.prototype.loadFailed = function (error) {
        this._loadFailed = true;
        for (var _i = 0, _a = this._waitingForLoadFail; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback();
        }
        throw new Error('Loading failed : ' + error);
    };
    return Loadable;
}());
exports.Loadable = Loadable;
},{}],2:[function(require,module,exports){
"use strict";
var FBOpeningHours_1 = require("./facebookplugins/FBOpeningHours");
var FacebookSDK_1 = require("./facebookplugins/FacebookSDK");
var Ren = (function () {
    function Ren() {
        var _this = this;
        this._facebookSDK = new FacebookSDK_1.FacebookSDK();
        this._facebookSDK.afterLoad(function () {
            _this._openingHours = new FBOpeningHours_1.FBOpeningHours();
        });
    }
    Object.defineProperty(Ren.prototype, "facebookFeed", {
        get: function () {
            return {};
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ren.prototype, "openingHours", {
        get: function () {
            return this._openingHours;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ren.prototype, "facebookSDK", {
        get: function () {
            return this.facebookSDK;
        },
        enumerable: true,
        configurable: true
    });
    ;
    return Ren;
}());
exports.Ren = Ren;
},{"./facebookplugins/FBOpeningHours":4,"./facebookplugins/FacebookSDK":5}],3:[function(require,module,exports){
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
var FacebookSDK_1 = require("./FacebookSDK");
var Loadable_1 = require("../Loadable");
var FBOpeningHours = (function (_super) {
    __extends(FBOpeningHours, _super);
    function FBOpeningHours() {
        _super.call(this);
        this.monday = [];
        this.tuesday = [];
        this.wednesday = [];
        this.thursday = [];
        this.friday = [];
        this.saturday = [];
        this.sunday = [];
    }
    // Called by super();
    FBOpeningHours.prototype.doLoad = function () {
        var _this = this;
        FacebookSDK_1.FacebookSDK.page(['hours'], function (roughdata) {
            if (!roughdata.error) {
                _this.parseData(roughdata);
                _this.loadSuccess();
            }
            else {
                _this.loadFailed(roughdata.error);
            }
        });
    };
    FBOpeningHours.prototype.parseData = function (roughdata) {
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
    return FBOpeningHours;
}(Loadable_1.Loadable));
exports.FBOpeningHours = FBOpeningHours;
function dayValue(day) {
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
},{"../Loadable":1,"./FacebookSDK":5}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Loadable_1 = require("../Loadable");
var FB_GRAPH_URI = 'https://graph.facebook.com/';
var PAGE_ID = '215470341909937';
var I_LIKE_GIN_TONIC = ['ZGJjNzEyZTkwZTE4MDg1Yjg2YWVhYjZjYmEyMDY5ZjY=', 'fA==', 'NTk4NzA1MjczNjM3MTIz', 'JmFjY2Vzc190b2tlbj0='];
var FacebookSDK = (function (_super) {
    __extends(FacebookSDK, _super);
    function FacebookSDK() {
        _super.call(this);
    }
    // Called by super();
    FacebookSDK.prototype.doLoad = function () {
        var _this = this;
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: '598705273637123',
                xfbml: true,
                version: 'v2.6'
            });
            _this.loadSuccess();
        };
    };
    Object.defineProperty(FacebookSDK, "sdk", {
        get: function () {
            return window.FB;
        },
        enumerable: true,
        configurable: true
    });
    FacebookSDK.page = function (fields, callback) {
        var uri = FB_GRAPH_URI + PAGE_ID + '?fields=' + fields.join(',') + candy();
        FacebookSDK.sdk.api(uri, callback);
    };
    FacebookSDK.api = function (graphid, fields) {
        var uri = FB_GRAPH_URI + graphid + '?fields=' + fields.join(',') + candy();
    };
    return FacebookSDK;
}(Loadable_1.Loadable));
exports.FacebookSDK = FacebookSDK;
function candy() {
    return I_LIKE_GIN_TONIC.reverse().map(function (e) { return atob(e); }).join('');
}
},{"../Loadable":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTG9hZGFibGUudHMiLCJzcmMvUmVuLnRzIiwic3JjL1Jlbkdsb2JhbC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvRkJPcGVuaW5nSG91cnMudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rU0RLLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0lBT0k7UUFMUSxjQUFTLEdBQWEsS0FBSyxDQUFDO1FBQzVCLGdCQUFXLEdBQWEsS0FBSyxDQUFDO1FBQzlCLDJCQUFzQixHQUFtQixFQUFFLENBQUM7UUFDNUMsd0JBQW1CLEdBQW1CLEVBQUUsQ0FBQztRQUc3QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELHNCQUFXLDhCQUFRO2FBQW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVyxtQ0FBYTthQUF4QjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFBO1FBQzNCLENBQUM7OztPQUFBO0lBRU0sNEJBQVMsR0FBaEIsVUFBa0IsbUJBQStCLEVBQUUsZ0JBQTZCO1FBQzVFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLG1CQUFtQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBLENBQUM7Z0JBQ2xCLGdCQUFnQixFQUFFLENBQUM7WUFDdkIsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN0RCxFQUFFLENBQUMs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WTtJQUMzQixFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztBQUNMLENBQUM7QUFFRCw0QkFBNkIsQ0FBVSxFQUFFLENBQVU7SUFDL0MsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDcEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFekIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMs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IjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IGFic3RyYWN0IGNsYXNzIExvYWRhYmxlIHtcclxuXHJcbiAgICBwcml2YXRlIF9pc0xvYWRlZCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX2xvYWRGYWlsZWQgOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF93YWl0aW5nRm9yTG9hZFN1Y2Nlc3MgOiAoKCkgPT4gYW55KVtdID0gW107XHJcbiAgICBwcml2YXRlIF93YWl0aW5nRm9yTG9hZEZhaWwgOiAoKCkgPT4gYW55KVtdID0gW107XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICB0aGlzLmRvTG9hZCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IGlzTG9hZGVkICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzTG9hZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaGFzTG9hZEZhaWxlZCAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sb2FkRmFpbGVkXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFmdGVyTG9hZCAobG9hZFN1Y2Nlc3NDYWxsYmFjayA6ICgpID0+IGFueSwgbG9hZEZhaWxDYWxsYmFjaz8gOiAoKSA9PiBhbnkpIDogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkZWQpIHtcclxuICAgICAgICAgICAgbG9hZFN1Y2Nlc3NDYWxsYmFjaygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oYXNMb2FkRmFpbGVkKSB7XHJcbiAgICAgICAgICAgIGlmIChsb2FkRmFpbENhbGxiYWNrKXtcclxuICAgICAgICAgICAgICAgIGxvYWRGYWlsQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2Vzcy5wdXNoKGxvYWRTdWNjZXNzQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICBpZiAobG9hZEZhaWxDYWxsYmFjayl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl93YWl0aW5nRm9yTG9hZEZhaWwucHVzaChsb2FkRmFpbENhbGxiYWNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGxvYWRTdWNjZXNzICgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIGZvciAobGV0IGNhbGxiYWNrIG9mIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2Vzcykge1xyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZEZhaWxlZCAoZXJyb3IgOiBzdHJpbmcpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fbG9hZEZhaWxlZCA9IHRydWU7XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fd2FpdGluZ0ZvckxvYWRGYWlsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTG9hZGluZyBmYWlsZWQgOiAnICsgZXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBkb0xvYWQgKCkgOiB2b2lkO1xyXG59IiwiaW1wb3J0IHtGQk9wZW5pbmdIb3Vyc30gZnJvbSBcIi4vZmFjZWJvb2twbHVnaW5zL0ZCT3BlbmluZ0hvdXJzXCI7XHJcbmltcG9ydCB7RmFjZWJvb2tTREt9IGZyb20gXCIuL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va1NES1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFJlbiB7XHJcblxyXG4gICAgcHJpdmF0ZSBfZmFjZWJvb2tTREsgOiBGYWNlYm9va1NESztcclxuICAgIHByaXZhdGUgX29wZW5pbmdIb3VycyA6IEZCT3BlbmluZ0hvdXJzO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICB0aGlzLl9mYWNlYm9va1NESyA9IG5ldyBGYWNlYm9va1NESygpO1xyXG4gICAgICAgIHRoaXMuX2ZhY2Vib29rU0RLLmFmdGVyTG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX29wZW5pbmdIb3VycyA9IG5ldyBGQk9wZW5pbmdIb3VycygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgZmFjZWJvb2tGZWVkICgpIHtcclxuICAgICAgICByZXR1cm4ge307XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBvcGVuaW5nSG91cnMgKCkgOiBGQk9wZW5pbmdIb3VycyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wZW5pbmdIb3VycztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGZhY2Vib29rU0RLICgpIDogRmFjZWJvb2tTREsge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZhY2Vib29rU0RLO1xyXG4gICAgfTtcclxufSIsImltcG9ydCB7UmVufSBmcm9tIFwiLi9SZW5cIjtcclxuXHJcbig8YW55PndpbmRvdykuUmVuU3BvcnQgPSBuZXcgUmVuKCk7IiwiaW1wb3J0IHtGYWNlYm9va1NES30gZnJvbSBcIi4vRmFjZWJvb2tTREtcIjtcclxuaW1wb3J0IHtGQkhvdXJzUmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7TG9hZGFibGV9IGZyb20gXCIuLi9Mb2FkYWJsZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZCT3BlbmluZ0hvdXJzIGV4dGVuZHMgTG9hZGFibGUge1xyXG5cclxuICAgIHB1YmxpYyBtb25kYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHR1ZXNkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHdlZG5lc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgdGh1cnNkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIGZyaWRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgc2F0dXJkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHN1bmRheSA6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FsbGVkIGJ5IHN1cGVyKCk7XHJcbiAgICBwcm90ZWN0ZWQgZG9Mb2FkICgpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tTREsucGFnZTxGQkhvdXJzUmVzcG9uc2U+KFsnaG91cnMnXSwgKHJvdWdoZGF0YSA6IEZCSG91cnNSZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJvdWdoZGF0YS5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZURhdGEocm91Z2hkYXRhKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZFN1Y2Nlc3MoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZEZhaWxlZChyb3VnaGRhdGEuZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwYXJzZURhdGEgKHJvdWdoZGF0YSA6IEZCSG91cnNSZXNwb25zZSkge1xyXG4gICAgICAgIHRoaXMubW9uZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ21vbicpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnR1ZXNkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZigndHVlJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMud2VkbmVzZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3dlZCcpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnRodXJzZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3RodScpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLmZyaWRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdmcmknKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5zYXR1cmRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdzYXQnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5zdW5kYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignc3VuJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkYXlWYWx1ZSAoZGF5IDogc3RyaW5nKSB7XHJcbiAgICBpZiAoZGF5ID09PSAnbW9uJykge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09ICd0dWUnKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0gJ3dlZCcpIHtcclxuICAgICAgICByZXR1cm4gMjtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSAndGh1Jykge1xyXG4gICAgICAgIHJldHVybiAzO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09ICdmcmknKSB7XHJcbiAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0gJ3NhdCcpIHtcclxuICAgICAgICByZXR1cm4gNTtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSAnc3VuJykge1xyXG4gICAgICAgIHJldHVybiA2O1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjb21wYXJlT3BlbmluZ0luZm8gKGEgOiBzdHJpbmcsIGIgOiBzdHJpbmcpIHtcclxuICAgIGxldCBpbmZvQSA9IGEuc3BsaXQoJ18nKSxcclxuICAgICAgICBpbmZvQiA9IGIuc3BsaXQoJ18nKTtcclxuXHJcbiAgICBpZiAocGFyc2VJbnQoaW5mb0FbMV0pIDwgcGFyc2VJbnQoaW5mb0JbMV0pKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSBlbHNlIGlmIChwYXJzZUludChpbmZvQVsxXSkgPiBwYXJzZUludChpbmZvQlsxXSkpe1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoaW5mb0FbMl0gPT09ICdvcGVuJyl7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9IGVsc2UgcmV0dXJuIDE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvVGltaW5ncyAob3BlbmluZ1RpbWUgOiBzdHJpbmdbXSwgcm91Z2hEYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSA6IHN0cmluZ1tdIHtcclxuICAgIGxldCB0aW1pbmdzIDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBvcGVuaW5nIG9mIG9wZW5pbmdUaW1lKSB7XHJcbiAgICAgICAgdGltaW5ncy5wdXNoKHJvdWdoRGF0YS5ob3Vyc1tvcGVuaW5nXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGltaW5ncztcclxufSIsImltcG9ydCB7RXZlbnREaXNwYXRjaGVyfSBmcm9tIFwiLi4vZXZlbnQvRXZlbnREaXNwYXRjaGVyXCI7XHJcbmltcG9ydCB7RkJSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcblxyXG5jb25zdCBGQl9HUkFQSF9VUkkgPSAnaHR0cHM6Ly9ncmFwaC5mYWNlYm9vay5jb20vJztcclxuY29uc3QgUEFHRV9JRCA9ICcyMTU0NzAzNDE5MDk5MzcnO1xyXG5jb25zdCBJX0xJS0VfR0lOX1RPTklDID0gWydaR0pqTnpFeVpUa3daVEU0TURnMVlqZzJZV1ZoWWpaalltRXlNRFk1WmpZPScsICdmQT09JywgJ05UazROekExTWpjek5qTTNNVEl6JywgJ0ptRmpZMlZ6YzE5MGIydGxiajA9J107XHJcblxyXG5pbnRlcmZhY2UgSUZhY2Vib29rU0RLIHtcclxuICAgIGluaXQgOiBhbnk7XHJcbiAgICBhcGkgKGdyYXBocGF0aCA6IHN0cmluZywgY2FsbGJhY2sgOiAocmVzcG9uc2UgOiBGQlJlc3BvbnNlKSA9PiBhbnkpIDogdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rU0RLIGV4dGVuZHMgTG9hZGFibGUge1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gQ2FsbGVkIGJ5IHN1cGVyKCk7XHJcbiAgICBwcm90ZWN0ZWQgZG9Mb2FkICgpIDogdm9pZCB7XHJcbiAgICAgICAgKDxhbnk+d2luZG93KS5mYkFzeW5jSW5pdCA9ICgpID0+IHtcclxuICAgICAgICAgICAgKDxhbnk+d2luZG93KS5GQi5pbml0KHtcclxuICAgICAgICAgICAgICAgIGFwcElkICAgICAgOiAnNTk4NzA1MjczNjM3MTIzJyxcclxuICAgICAgICAgICAgICAgIHhmYm1sICAgICAgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiAgICA6ICd2Mi42J1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5sb2FkU3VjY2VzcygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0IHNkayAoKSA6IElGYWNlYm9va1NESyB7XHJcbiAgICAgICAgcmV0dXJuICg8YW55PndpbmRvdykuRkI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBwYWdlPFQgZXh0ZW5kcyBGQlJlc3BvbnNlPiAoZmllbGRzIDogc3RyaW5nW10sIGNhbGxiYWNrIDogKHJlc3BvbnNlIDogVCkgPT4gYW55KSB7XHJcbiAgICAgICAgbGV0IHVyaSA6IHN0cmluZyA9IEZCX0dSQVBIX1VSSSArIFBBR0VfSUQgKyAnP2ZpZWxkcz0nICsgZmllbGRzLmpvaW4oJywnKSArIGNhbmR5KCk7XHJcbiAgICAgICAgRmFjZWJvb2tTREsuc2RrLmFwaSh1cmksIGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgIHN0YXRpYyBhcGkgKGdyYXBoaWQgOiBzdHJpbmcsIGZpZWxkcyA6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgbGV0IHVyaSA6IHN0cmluZyA9IEZCX0dSQVBIX1VSSSArIGdyYXBoaWQgKyAnP2ZpZWxkcz0nICsgZmllbGRzLmpvaW4oJywnKSArIGNhbmR5KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhbmR5ICgpIDogc3RyaW5nIHtcclxuICAgIHJldHVybiBJX0xJS0VfR0lOX1RPTklDLnJldmVyc2UoKS5tYXAoKGUpID0+IHtyZXR1cm4gYXRvYihlKX0pLmpvaW4oJycpO1xyXG59Il19
