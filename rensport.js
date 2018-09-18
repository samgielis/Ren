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
var AnalyticsTracker_1 = require("./analytics/AnalyticsTracker");
var Ren = (function () {
    function Ren() {
        var _this = this;
        this._analyticsTracker = AnalyticsTracker_1.createAnalyticsTracker();
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
        this._analyticsTracker.trackSubscription(input.value);
        hiddenInput.value = input.value;
        hiddenSubmit.click();
    };
    return Ren;
}());
exports.Ren = Ren;
},{"./analytics/AnalyticsTracker":5,"./facebookplugins/FacebookFeed":8,"./facebookplugins/FacebookOpeningInfo":9,"./view/OpeningInfoView":16}],3:[function(require,module,exports){
"use strict";
var Ren_1 = require("./Ren");
window.RenSport = new Ren_1.Ren();
},{"./Ren":2}],4:[function(require,module,exports){
"use strict";
exports.REN_PRODUCTION_HOSTNAME = 'rensport.be';
},{}],5:[function(require,module,exports){
"use strict";
var GoogleAnalyticsTracker_1 = require("./GoogleAnalyticsTracker");
var RenSportConfig_1 = require("../RenSportConfig");
var DummyAnalyticsTracker_1 = require("./DummyAnalyticsTracker");
function createAnalyticsTracker() {
    if (window.location.hostname === RenSportConfig_1.REN_PRODUCTION_HOSTNAME) {
        return new GoogleAnalyticsTracker_1.GoogleAnalyticsTracker();
    }
    return new DummyAnalyticsTracker_1.DummyAnalyticsTracker();
}
exports.createAnalyticsTracker = createAnalyticsTracker;
},{"../RenSportConfig":4,"./DummyAnalyticsTracker":6,"./GoogleAnalyticsTracker":7}],6:[function(require,module,exports){
"use strict";
var DummyAnalyticsTracker = (function () {
    function DummyAnalyticsTracker() {
        console.log('REN/ANALYTICS: Instantiating DummyAnalyticsTracker.');
    }
    DummyAnalyticsTracker.prototype.trackSubscription = function (email) {
        console.log("REN/ANALYTICS: Tracking new newsletter subscription for " + email + ".");
    };
    return DummyAnalyticsTracker;
}());
exports.DummyAnalyticsTracker = DummyAnalyticsTracker;
},{}],7:[function(require,module,exports){
"use strict";
var GoogleAnalyticsTracker = (function () {
    function GoogleAnalyticsTracker() {
        var dataLayer = window.dataLayer = window.dataLayer || [];
        this._gtag = window.gtag = function () {
            dataLayer.push(arguments);
        };
        this._gtag('js', new Date());
        this._gtag('config', 'UA-122224869-1');
    }
    GoogleAnalyticsTracker.prototype.trackSubscription = function (email) {
        if (!ga) {
            return;
        }
        try {
            this._gtag('event', 'newsletterSubscription', {
                eventCategory: 'Newsletter',
                eventAction: 'submit',
                eventLabel: email
            });
        }
        catch (e) {
            console.warn('REN: Er ging iets verkeerd bij het tracken van de Newsletter subscription.');
        }
    };
    return GoogleAnalyticsTracker;
}());
exports.GoogleAnalyticsTracker = GoogleAnalyticsTracker;
},{}],8:[function(require,module,exports){
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
},{"../Loadable":1,"../util/JSONUtils":14,"./FacebookPost":10,"./FacebookProxy":11,"./ManualFeedbookFeed":12}],9:[function(require,module,exports){
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
},{"../Loadable":1,"../util/JSONUtils":14,"./FacebookProxy":11,"./ManualOpeningHours":13}],10:[function(require,module,exports){
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
},{"../util/Linkify":15,"./FacebookProxy":11}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
"use strict";
var FacebookProxy_1 = require("./FacebookProxy");
exports.manualFacebookFeed = [
    manualFacebookPostImport('Nog snel één van de 200 gelimiteerde SUPERTRAC ULTRA RC schoenen in de wacht slepen? Ren Sport helpt je graag verder.', '2018/08/24', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/39947224_796705753786390_8040626648711692288_n.png?_nc_cat=0&oh=24179afae6f3d200279e827d1ac6196a&oe=5C30AD21'),
    manualFacebookPostImport('NU bij Ren Sport. De nieuwe Mizuno Wave Ultima 10 – TCS Amsterdam Marathon editie.', '2018/08/17', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/39453905_788052064651759_7870217907072925696_n.jpg?_nc_cat=0&oh=d1ab8ff26008f21e252b76e9ac48eaac&oe=5C062056'),
    manualFacebookPostImport('Beste klanten, maandag 13, dinsdag 14 en woensdag 15 augustus zijn we gesloten. Donderdag zijn we terug open. Geniet van jullie mooi en sportief weekend.🌞🌞🏃‍♂️🏃‍♀️🎾🏊‍♂️🚴‍♂️🚴‍♀️. 😜', '2018/08/11', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/38926265_780068562116776_8787499153425956864_n.jpg?_nc_cat=0&oh=3187f9fc009fec9145c028a6e2bf6567&oe=5C0DB9D9'),
    manualFacebookPostImport('Knap podium Steffan Vanderlinden. Foto van de bosvrienden.', '2018/08/04', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/38528647_770318696425096_3281332864997654528_n.png?_nc_cat=0&oh=f4c2e87d86668e5de8a3dc6228f239d9&oe=5BFA69B2'),
    manualFacebookPostImport('Dikke proficiat voor onze rode duivels van het Ren Sport team.', '2018/07/07', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36770646_737851716338461_2116977251210756096_n.jpg?_nc_cat=0&oh=7af8445368da3aaf8bf3cee8a34ab006&oe=5BDC71BF'),
    manualFacebookPostImport('Heel warm weer, veel drinken!!!\n' +
        'Wat drinken voor en na een training/ wedstrijd?\n' +
        'NIEUW bij Ren Sport is OVERSTIMS.\n' +
        'Een ideaal voordeelpakket voor de marathonlopers, met extra een band voor u nummer en je energiegels voor onderweg.', '2018/07/04', 'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36682613_734800719976894_497555906653847552_n.jpg?_nc_cat=0&oh=e87ecac5d3e3fb95712ec25a9ac4fbb8&oe=5BD363AE') /*,
    manualFacebookPostImport(
        'Messalina Pieroni, mooi artikel en mooi foto’s.',
        '2018/07/03',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36531094_733435116780121_1939821811734675456_n.jpg?_nc_cat=0&oh=6c7b5314822dc943f8b86f67cf4877e7&oe=5BDE4FA3'
    )*/
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
},{"./FacebookProxy":11}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTG9hZGFibGUudHMiLCJzcmMvUmVuLnRzIiwic3JjL1Jlbkdsb2JhbC50cyIsInNyYy9SZW5TcG9ydENvbmZpZy50cyIsInNyYy9hbmFseXRpY3MvQW5hbHl0aWNzVHJhY2tlci50cyIsInNyYy9hbmFseXRpY3MvRHVtbXlBbmFseXRpY3NUcmFja2VyLnRzIiwic3JjL2FuYWx5dGljcy9Hb29nbGVBbmFseXRpY3NUcmFja2VyLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va0ZlZWQudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rT3BlbmluZ0luZm8udHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rUG9zdC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tQcm94eS50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvTWFudWFsRmVlZGJvb2tGZWVkLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9NYW51YWxPcGVuaW5nSG91cnMudHMiLCJzcmMvdXRpbC9KU09OVXRpbHMudHMiLCJzcmMvdXRpbC9MaW5raWZ5LnRzIiwic3JjL3ZpZXcvT3BlbmluZ0luZm9WaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0lBT0k7UUFMUSxjQUFTLEdBQWEsS0FBSyxDQUFDO1FBQzVCLGdCQUFXLEdBQWEsS0FBSyxDQUFDO1FBQzlCLDJCQUFzQixHQUFtQixFQUFFLENBQUM7UUFDNUMsd0JBQW1CLEdBQW1CLEVBQUUsQ0FBQztRQUc3QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELHNCQUFXLDhCQUFRO2FBQW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVyxtQ0FBYTthQUF4QjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FB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LEtBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztBQUNMLENBQUM7QUFFRCxzQkFBdUIsS0FBYztJQUNqQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDdEIsQ0FBQztBQUNMLENBQUM7QUFFRCxvQkFBcUIsR0FBWTtJQUM3QixNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRUQsNEJBQTZCLENBQVUsRUFBRSxDQUFVO0lBQy9DLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQ3BCLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXpCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNkLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUM7UUFDaEQsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNKLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQSxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUM7UUFBQyxJQUFJO1lBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNwQixDQUFDO0FBQ0wsQ0FBQztBQUVELG1CQUFvQixXQUFzQixFQUFFLFNBQTJCO0lBQ25FLElBQUksT0FBTyxHQUFjLEVBQUUsQ0FBQztJQUU1QixHQUFHLENBQUMsQ0FBZ0IsVUFBVyxFQUFYLDJCQUFXLEVBQVgseUJBQVcsRUFBWCxJQUFXLENBQUM7UUFBM0IsSUFBSSxPQUFPLG9CQUFBO1FBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FDMUM7SUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQ25CLENBQUM7QUFFRCwyQkFBNEIsS0FBYyxFQUFFLEdBQVk7SUFFcEQsSUFBSSxHQUFHLEdBQVUsSUFBSSxJQUFJLEVBQUUsRUFDdkIsaUJBQWlCLEdBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDckMsU0FBUyxHQUFVLElBQUksSUFBSSxFQUFFLEVBQzdCLFNBQVMsR0FBWSxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDbkQsWUFBWSxHQUFZLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN0RCxlQUFlLEdBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDakMsT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLEVBQ3BCLE9BQU8sR0FBWSxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQy9DLFVBQVUsR0FBWSxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFdkQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5QixTQUFTLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ25DLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUUvQixNQUFNLENBQUMsR0FBRyxJQUFJLFNBQVMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDO0FBQzdDLENBQUM7OztBQzFKRCw4QkFBeUIsaUJBQWlCLENBQUMsQ0FBQTtBQUMzQyx3QkFBc0IsaUJBQWlCLENBQUMsQ0FBQTtBQUN4QztJQUlJLHNCQUFhLElBQXFCO1FBQzlCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxzQkFBVyxvQ0FBVTthQUFyQjtZQUNJLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSywwQkFBVSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ2xJLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsaUNBQU87YUFBbEI7WUFDSSxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUQsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVyw0QkFBRTthQUFiO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3hCLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsaUNBQU87YUFBbEI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDN0IsQ0FBQzs7O09BQUE7SUFFRCxzQkFBVyxpQ0FBTzthQUFsQjtZQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDekIsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztnQkFDbkMsS0FBSyxDQUFDLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQztnQkFDMUMsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDOzs7T0FBQTtJQUVNLCtCQUFRLEdBQWYsVUFBaUIsTUFBb0I7UUFDakMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDbEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7SUFFRCxzQkFBVyw4QkFBSTthQUFmO1lBQ0ksSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsU0FBUyxHQUFHLDZCQUE2QixDQUFDO1lBRS9DLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTNCLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFOUIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDOzs7T0FBQTtJQUVPLHdDQUFpQixHQUF6QjtRQUNJLElBQUksZ0JBQWdCLEdBQWlCLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkUsZ0JBQWdCLENBQUMsU0FBUyxHQUFHLDRCQUE0QixDQUFDO1FBRTFELElBQUksd0JBQXdCLEdBQWlCLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0Usd0JBQXdCLENBQUMsU0FBUyxHQUFHLHFDQUFxQyxDQUFDO1FBRTNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2YsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QyxLQUFLLENBQUMsU0FBUyxHQUFHLHlCQUF5QixDQUFDO1lBRTVDLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUVsSCxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUNoQixLQUFLLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBUyxDQUFDO29CQUMxQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1YsQ0FBQztZQUNELHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUMzQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1Ysd0JBQXdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsT0FBTyxDQUFDLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQztZQUM3QyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksaUJBQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUQsd0JBQXdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFHRCxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLENBQUMsZ0JBQWdCLENBQUM7SUFDNUIsQ0FBQztJQUVPLHFDQUFjLEdBQXRCO1FBQ0ksSUFBSSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsRCxhQUFhLENBQUMsU0FBUyxHQUFHLGtDQUFrQyxDQUFDO1FBRTdELElBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsWUFBWSxDQUFDLFNBQVMsR0FBRyw0QkFBNEIsQ0FBQztRQUN0RCxZQUFZLENBQUMsU0FBUyxHQUFHLEVBQUUsR0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25ELGFBQWEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFeEMsSUFBSSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELGtCQUFrQixDQUFDLFNBQVMsR0FBRyxtQ0FBbUMsQ0FBQztRQUNuRSxrQkFBa0IsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNsRyxhQUFhLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFOUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztJQUN6QixDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQTNHQSxBQTJHQyxJQUFBO0FBM0dZLG9CQUFZLGVBMkd4QixDQUFBO0FBRUQsSUFBTSxNQUFNLEdBQWM7SUFDdEIsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO0NBQ3JGLENBQUM7QUFFRixJQUFNLGtCQUFrQixHQUFZLHNCQUFzQixDQUFDO0FBQzNELElBQU0sK0JBQStCLEdBQVksbUJBQW1CLENBQUM7OztBQ2xIckUsSUFBTSxRQUFRLEdBQUcsaURBQWlELENBQUM7QUFDdEQsa0JBQVUsR0FBWSxpQkFBaUIsQ0FBQztBQU9yRDtJQUFBO0lBK0JBLENBQUM7SUE3QmlCLGtCQUFJLEdBQWxCLFVBQXFCLElBQWtDLEVBQUUsSUFBa0I7UUFDdkUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFYSwwQkFBWSxHQUExQixVQUE2QixJQUFrQyxFQUFFLElBQWtCO1FBQy9FLGFBQWEsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRWMsaUJBQUcsR0FBbEIsVUFBb0IsR0FBWSxFQUFFLElBQWtDLEVBQUUsSUFBa0I7UUFDcEYsSUFBSSxDQUFDO1lBQ0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUMvQixHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1lBQzFCLEdBQUcsQ0FBQyxNQUFNLEdBQUc7Z0JBQ1QsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztnQkFDeEIsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2IsSUFBSSxFQUFFLENBQUM7Z0JBQ1gsQ0FBQztZQUNMLENBQUMsQ0FBQztZQUNGLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ25CLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNmLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDTixJQUFJLEVBQUUsQ0FBQztZQUNYLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUNMLG9CQUFDO0FBQUQsQ0EvQkEsQUErQkMsSUFBQTtBQS9CWSxxQkFBYSxnQkErQnpCLENBQUE7OztBQzFDRCw4QkFBeUIsaUJBQWlCLENBQUMsQ0FBQTtBQUU5QiwwQkFBa0IsR0FBcUI7SUFDaEQsd0JBQXdCLENBQ3BCLHVIQUF1SCxFQUN2SCxZQUFZLEVBQ1osNEpBQTRKLENBQy9KO0lBQ0Qsd0JBQXdCLENBQ3BCLG9GQUFvRixFQUNwRixZQUFZLEVBQ1osNEpBQTRKLENBQy9KO0lBQ0Qsd0JBQXdCLENBQ3BCLDhMQUE4TCxFQUM5TCxZQUFZLEVBQ1osNEpBQTRKLENBQy9KO0lBQ0Qsd0JBQXdCLENBQ3BCLDREQUE0RCxFQUM1RCxZQUFZLEVBQ1osNEpBQTRKLENBQy9KO0lBQ0Qsd0JBQXdCLENBQ3BCLGdFQUFnRSxFQUNoRSxZQUFZLEVBQ1osNEpBQTRKLENBQy9KO0lBQ0Qsd0JBQXdCLENBQ3BCLG1DQUFtQztRQUNuQyxtREFBbUQ7UUFDbkQscUNBQXFDO1FBQ3JDLHFIQUFxSCxFQUNySCxZQUFZLEVBQ1osMkpBQTJKLENBQzlKLENBQUE7Ozs7O09BS0U7Q0FDTixDQUFDO0FBRUYsa0NBQWtDLE9BQWUsRUFBRSxJQUFZLEVBQUUsT0FBZTtJQUM1RSxNQUFNLENBQUM7UUFDSCxZQUFZLEVBQUUsSUFBSTtRQUNsQixZQUFZLEVBQUUsT0FBTztRQUNyQixFQUFFLEVBQUUsSUFBSTtRQUNSLFNBQVMsRUFBRSxLQUFLO1FBQ2hCLFlBQVksRUFBRSxJQUFJO1FBQ2xCLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLElBQUksRUFBRTtZQUNGLElBQUksRUFBRSxFQUFFO1lBQ1IsRUFBRSxFQUFFLDBCQUFVO1lBQ2QsS0FBSyxFQUFFLEVBQUU7U0FDWjtRQUNELEtBQUssRUFBRSxFQUFFO0tBQ1osQ0FBQTtBQUNMLENBQUM7OztBQzNEWSw4QkFBc0IsR0FBRztJQUNsQyxLQUFLLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztLQUNuQjtDQUNKLENBQUM7QUFFVyxpQ0FBeUIsR0FBRztJQUNyQyxLQUFLLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixPQUFPLEVBQUUsT0FBTztLQUNuQjtDQUNKLENBQUM7OztBQ3hDRixtQkFBMkIsSUFBYTtJQUNwQyxJQUFJLENBQUM7UUFDRCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxZQUFZLENBQUM7SUFDeEIsQ0FBRTtJQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7QUFDTCxDQUFDO0FBUGUsaUJBQVMsWUFPeEIsQ0FBQTs7O0FDUEQsaUJBQXlCLFNBQWtCO0lBQ3ZDLElBQUksWUFBcUIsRUFDckIsZUFBd0IsRUFBRSxlQUF3QixFQUFFLGVBQXdCLENBQUM7SUFFakYsaURBQWlEO0lBQ2pELGVBQWUsR0FBRyx5RUFBeUUsQ0FBQztJQUM1RixZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUscUNBQXFDLENBQUMsQ0FBQztJQUV6Rix3RkFBd0Y7SUFDeEYsZUFBZSxHQUFHLGdDQUFnQyxDQUFDO0lBQ25ELFlBQVksR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO0lBRXJHLDJDQUEyQztJQUMzQyxlQUFlLEdBQUcsMERBQTBELENBQUM7SUFDN0UsWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLDRCQUE0QixDQUFDLENBQUM7SUFFbkYsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN4QixDQUFDO0FBakJlLGVBQU8sVUFpQnRCLENBQUE7OztBQ2ZELElBQU0sSUFBSSxHQUFjO0lBQ3BCLFFBQVEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVE7Q0FDL0UsQ0FBQztBQUVGLElBQU0sZUFBZSxHQUErQjtJQUNoRCxRQUFRLEVBQUcsSUFBSTtJQUNmLFNBQVMsRUFBRyxJQUFJO0lBQ2hCLFdBQVcsRUFBRyxJQUFJO0lBQ2xCLFVBQVUsRUFBRyxJQUFJO0lBQ2pCLFFBQVEsRUFBRyxJQUFJO0lBQ2YsVUFBVSxFQUFHLElBQUk7SUFDakIsUUFBUSxFQUFHLElBQUk7Q0FDbEIsQ0FBQztBQUVGLDJCQUFtQyxXQUFpQyxFQUFFLElBQWtCO0lBQ3BGLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNSLE1BQU0sQ0FBQztJQUNYLENBQUM7SUFFRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDWCxLQUFLLFFBQVE7WUFDVCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUNEOzs7Ozs7a0JBTWM7QUFDbEIsQ0FBQztBQWpCZSx5QkFBaUIsb0JBaUJoQyxDQUFBO0FBRUQscUNBQXNDLFdBQWlDLEVBQUUsSUFBa0I7SUFDdkYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUM5QyxJQUFJLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUVELCtCQUFnQyxXQUFpQztJQUM3RCxJQUFJLFNBQVMsR0FBaUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1RCxTQUFTLENBQUMsU0FBUyxHQUFHLG1DQUFtQyxDQUFDO0lBRTFELElBQUksYUFBK0IsQ0FBQztJQUNwQyxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQyxhQUFhLENBQUMsU0FBUyxHQUFHLHlDQUF5QyxDQUFDO0lBRXBFLElBQUksY0FBYyxHQUF3QixFQUFFLENBQUM7SUFDN0MsY0FBYyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBRWhGLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLEtBQUssSUFBSTtZQUNMLFNBQVMsQ0FBQyxTQUFTLElBQUksd0JBQXdCLENBQUM7WUFDaEQsYUFBYSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7WUFDckMsY0FBYyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLEtBQUssQ0FBQztRQUNWLEtBQUssS0FBSztZQUNOLFNBQVMsQ0FBQyxTQUFTLElBQUksMEJBQTBCLENBQUM7WUFDbEQsYUFBYSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7WUFDckMsS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVMsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFckMsR0FBRyxDQUFDLENBQXNCLFVBQWMsRUFBZCxpQ0FBYyxFQUFkLDRCQUFjLEVBQWQsSUFBYyxDQUFDO1FBQXBDLElBQUksYUFBYSx1QkFBQTtRQUNsQixTQUFTLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQ3hDO0lBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUVyQixDQUFDO0FBRUQsd0JBQXlCLFdBQWlDO0lBQ3RELElBQUksS0FBSyxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRS9ELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzlCLEtBQUssQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUM7SUFDOUMsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ0osS0FBSyxDQUFDLFNBQVMsR0FBRyx5QkFBeUIsQ0FBQztJQUNoRCxDQUFDO0lBRUQsR0FBRyxDQUFDLENBQVksVUFBSSxFQUFKLGFBQUksRUFBSixrQkFBSSxFQUFKLElBQUksQ0FBQztRQUFoQixJQUFJLEdBQUcsYUFBQTtRQUNSLElBQUksT0FBTyxHQUF5QixhQUFhLENBQUMsR0FBRyxFQUFRLFdBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDOUI7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFFRCx1QkFBd0IsR0FBWSxFQUFFLEtBQWdCO0lBQ2xELElBQUksUUFBUSxHQUF5QixRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEMsUUFBUSxDQUFDLFNBQVMsR0FBRyw2QkFBNkIsQ0FBQztJQUN2RCxDQUFDO0lBRUQsSUFBSSxPQUFPLEdBQThCLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQ2pFLFFBQVEsR0FBOEIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV2RSxPQUFPLENBQUMsU0FBUyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QyxRQUFRLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUczQyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNwQixDQUFDO0FBRUQsd0JBQXlCLEtBQWdCO0lBQ3JDLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNsQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3JDLFFBQVEsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsUUFBUSxJQUFJLElBQUksQ0FBQztRQUNyQixDQUFDO0lBQ0wsQ0FBQztJQUNELE1BQU0sQ0FBQyxRQUFRLElBQUksVUFBVSxDQUFDO0FBQ2xDLENBQUM7QUFFRCwwQkFBMkIsSUFBYSxFQUFFLFFBQWlCO0lBRXZELElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxxQ0FBcUMsQ0FBQztJQUNwRCxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUVkLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUU3QyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXBCLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDYixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZXhwb3J0IGFic3RyYWN0IGNsYXNzIExvYWRhYmxlIHtcclxuXHJcbiAgICBwcml2YXRlIF9pc0xvYWRlZCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX2xvYWRGYWlsZWQgOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF93YWl0aW5nRm9yTG9hZFN1Y2Nlc3MgOiAoKCkgPT4gYW55KVtdID0gW107XHJcbiAgICBwcml2YXRlIF93YWl0aW5nRm9yTG9hZEZhaWwgOiAoKCkgPT4gYW55KVtdID0gW107XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICB0aGlzLmRvTG9hZCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IGlzTG9hZGVkICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzTG9hZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaGFzTG9hZEZhaWxlZCAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sb2FkRmFpbGVkXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFmdGVyTG9hZCAobG9hZFN1Y2Nlc3NDYWxsYmFjayA6ICgpID0+IGFueSwgbG9hZEZhaWxDYWxsYmFjaz8gOiAoKSA9PiBhbnkpIDogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkZWQpIHtcclxuICAgICAgICAgICAgbG9hZFN1Y2Nlc3NDYWxsYmFjaygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oYXNMb2FkRmFpbGVkKSB7XHJcbiAgICAgICAgICAgIGlmIChsb2FkRmFpbENhbGxiYWNrKXtcclxuICAgICAgICAgICAgICAgIGxvYWRGYWlsQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2Vzcy5wdXNoKGxvYWRTdWNjZXNzQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICBpZiAobG9hZEZhaWxDYWxsYmFjayl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl93YWl0aW5nRm9yTG9hZEZhaWwucHVzaChsb2FkRmFpbENhbGxiYWNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGxvYWRTdWNjZXNzICgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIGZvciAobGV0IGNhbGxiYWNrIG9mIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2Vzcykge1xyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl93YWl0aW5nRm9yTG9hZFN1Y2Nlc3MgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZEZhaWxlZCAoZXJyb3IgOiBzdHJpbmcpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fbG9hZEZhaWxlZCA9IHRydWU7XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fd2FpdGluZ0ZvckxvYWRGYWlsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkRmFpbCA9IFtdO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTG9hZGluZyBmYWlsZWQgOiAnICsgZXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBkb0xvYWQgKCkgOiB2b2lkO1xyXG59IiwiaW1wb3J0IHtGYWNlYm9va09wZW5pbmdJbmZvfSBmcm9tIFwiLi9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tPcGVuaW5nSW5mb1wiO1xyXG5pbXBvcnQge0ZhY2Vib29rRmVlZH0gZnJvbSBcIi4vZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rRmVlZFwiO1xyXG5pbXBvcnQge1JlblNwb3J0Q29uZmlnfSBmcm9tIFwiLi9SZW5TcG9ydENvbmZpZ1wiO1xyXG5pbXBvcnQge3JlbmRlck9wZW5pbmdJbmZvfSBmcm9tIFwiLi92aWV3L09wZW5pbmdJbmZvVmlld1wiO1xyXG5pbXBvcnQge0FuYWx5dGljc1RyYWNrZXIsIGNyZWF0ZUFuYWx5dGljc1RyYWNrZXJ9IGZyb20gXCIuL2FuYWx5dGljcy9BbmFseXRpY3NUcmFja2VyXCI7XHJcbmltcG9ydCB7R29vZ2xlQW5hbHl0aWNzVHJhY2tlcn0gZnJvbSBcIi4vYW5hbHl0aWNzL0dvb2dsZUFuYWx5dGljc1RyYWNrZXJcIjtcclxuXHJcbmRlY2xhcmUgdmFyICQ6IGFueTtcclxuXHJcbmV4cG9ydCBjbGFzcyBSZW4ge1xyXG5cclxuICAgIHByaXZhdGUgX29wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbztcclxuICAgIHByaXZhdGUgX2ZlZWQgOiBGYWNlYm9va0ZlZWQ7XHJcbiAgICBwcml2YXRlIF9hbmFseXRpY3NUcmFja2VyOiBBbmFseXRpY3NUcmFja2VyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICB0aGlzLl9hbmFseXRpY3NUcmFja2VyID0gY3JlYXRlQW5hbHl0aWNzVHJhY2tlcigpO1xyXG4gICAgICAgIGxldCBjb25maWcgOiBSZW5TcG9ydENvbmZpZyA9ICg8YW55PndpbmRvdykuUmVuU3BvcnRDb25maWc7XHJcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcubG9hZEhlYWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkSGVhZGVyKGNvbmZpZy5jb250ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2xvYWRGb290ZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcubG9hZE9wZW5pbmdIb3Vycykge1xyXG4gICAgICAgICAgICB0aGlzLl9vcGVuaW5nSW5mbyA9IG5ldyBGYWNlYm9va09wZW5pbmdJbmZvKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX29wZW5pbmdJbmZvLmFmdGVyTG9hZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZW5kZXJPcGVuaW5nSW5mbyh0aGlzLl9vcGVuaW5nSW5mbywgPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZW4tb3BlbmluZ3N1cmVuLWhvb2snKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcubG9hZE5ld3NGZWVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZlZWQgPSBuZXcgRmFjZWJvb2tGZWVkKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZlZWQuYWZ0ZXJMb2FkKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZlZWQucmVuZGVyVG8oPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZW4taG9tZXBhZ2UtbmV3c2ZlZWQnKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGZlZWQgKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9mZWVkO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2xvYWRIZWFkZXIgKGNvbnRleHQgOiBzdHJpbmcpIDogdm9pZCB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaG9vayA6IGFueSA9ICQoIFwiI3Jlbi1oZWFkZXJcIiApO1xyXG4gICAgICAgICAgICBob29rLmxvYWQoIFwiL2NvbXBvbmVudHMvaGVhZGVyLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY29udGV4dE5hdmJhckVsZW1lbnQgOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaVtkYXRhLWNvbnRleHQtJyArIGNvbnRleHQudG9Mb3dlckNhc2UoKSArICddJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRleHROYXZiYXJFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHROYXZiYXJFbGVtZW50LmNsYXNzTmFtZSArPSAnYWN0aXZlJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9sb2FkRm9vdGVyICgpIDogdm9pZCB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaG9vayA6IGFueSA9ICQoIFwiI3Jlbi1mb290ZXJcIiApO1xyXG4gICAgICAgICAgICBob29rLmxvYWQoIFwiL2NvbXBvbmVudHMvZm9vdGVyLmh0bWxcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBvcGVuaW5nSW5mbyAoKSA6IEZhY2Vib29rT3BlbmluZ0luZm8ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcGVuaW5nSW5mbztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3Vic2NyaWJlVG9OZXdzbGV0dGVyICgpIHtcclxuICAgICAgICBsZXQgaW5wdXQgOiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jlbi1uaWV1d3NicmllZi1pbnB1dC1maWVsZCcpO1xyXG4gICAgICAgIGxldCBoaWRkZW5JbnB1dCA6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdnItaGlkZGVuLWlucHV0LWZpZWxkJyksXHJcbiAgICAgICAgICAgIGhpZGRlblN1Ym1pdCA6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2ci1oaWRkZW4tc3VibWl0LWJ0bicpO1xyXG5cclxuICAgICAgICBpZiAoIWlucHV0IHx8ICFoaWRkZW5JbnB1dCB8fCAhaW5wdXQudmFsdWUgfHwgIWhpZGRlblN1Ym1pdCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9hbmFseXRpY3NUcmFja2VyLnRyYWNrU3Vic2NyaXB0aW9uKGlucHV0LnZhbHVlKTtcclxuXHJcbiAgICAgICAgaGlkZGVuSW5wdXQudmFsdWUgPSBpbnB1dC52YWx1ZTtcclxuICAgICAgICBoaWRkZW5TdWJtaXQuY2xpY2soKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7UmVufSBmcm9tIFwiLi9SZW5cIjtcclxuXHJcbig8YW55PndpbmRvdykuUmVuU3BvcnQgPSBuZXcgUmVuKCk7IiwiZXhwb3J0IGludGVyZmFjZSAgUmVuU3BvcnRDb25maWcge1xyXG4gICAgY29udGV4dCA6IHN0cmluZztcclxuICAgIGxvYWRIZWFkZXIgOiBib29sZWFuXHJcbiAgICBsb2FkTmV3c0ZlZWQgOiBib29sZWFuLFxyXG4gICAgbG9hZE9wZW5pbmdIb3VycyA6IGJvb2xlYW5cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFJFTl9QUk9EVUNUSU9OX0hPU1ROQU1FOiBzdHJpbmcgPSAncmVuc3BvcnQuYmUnOyIsImltcG9ydCB7R29vZ2xlQW5hbHl0aWNzVHJhY2tlcn0gZnJvbSBcIi4vR29vZ2xlQW5hbHl0aWNzVHJhY2tlclwiO1xyXG5pbXBvcnQge1JFTl9QUk9EVUNUSU9OX0hPU1ROQU1FfSBmcm9tIFwiLi4vUmVuU3BvcnRDb25maWdcIjtcclxuaW1wb3J0IHtEdW1teUFuYWx5dGljc1RyYWNrZXJ9IGZyb20gXCIuL0R1bW15QW5hbHl0aWNzVHJhY2tlclwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBBbmFseXRpY3NUcmFja2VyIHtcclxuICAgIHRyYWNrU3Vic2NyaXB0aW9uKGVtYWlsOiBzdHJpbmcpOiB2b2lkXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBbmFseXRpY3NUcmFja2VyKCk6IEFuYWx5dGljc1RyYWNrZXIge1xyXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PT0gUkVOX1BST0RVQ1RJT05fSE9TVE5BTUUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEdvb2dsZUFuYWx5dGljc1RyYWNrZXIoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgRHVtbXlBbmFseXRpY3NUcmFja2VyKCk7XHJcbn1cclxuIiwiaW1wb3J0IHtBbmFseXRpY3NUcmFja2VyfSBmcm9tIFwiLi9BbmFseXRpY3NUcmFja2VyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRHVtbXlBbmFseXRpY3NUcmFja2VyIGltcGxlbWVudHMgQW5hbHl0aWNzVHJhY2tlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1JFTi9BTkFMWVRJQ1M6IEluc3RhbnRpYXRpbmcgRHVtbXlBbmFseXRpY3NUcmFja2VyLicpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cmFja1N1YnNjcmlwdGlvbihlbWFpbDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFJFTi9BTkFMWVRJQ1M6IFRyYWNraW5nIG5ldyBuZXdzbGV0dGVyIHN1YnNjcmlwdGlvbiBmb3IgJHtlbWFpbH0uYCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0FuYWx5dGljc1RyYWNrZXJ9IGZyb20gXCIuL0FuYWx5dGljc1RyYWNrZXJcIjtcclxuXHJcbmRlY2xhcmUgdmFyIGdhOiBhbnk7XHJcblxyXG5leHBvcnQgY2xhc3MgR29vZ2xlQW5hbHl0aWNzVHJhY2tlciBpbXBsZW1lbnRzIEFuYWx5dGljc1RyYWNrZXIge1xyXG5cclxuICAgIHByaXZhdGUgX2d0YWc6IChldmVudE5hbWU6IHN0cmluZywgLi4ucGFyYW1ldGVyczogYW55W10pID0+IHZvaWQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YUxheWVyID0gKDxhbnk+d2luZG93KS5kYXRhTGF5ZXIgPSAoPGFueT53aW5kb3cpLmRhdGFMYXllciB8fCBbXTtcclxuICAgICAgICB0aGlzLl9ndGFnID0gKDxhbnk+d2luZG93KS5ndGFnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBkYXRhTGF5ZXIucHVzaChhcmd1bWVudHMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5fZ3RhZygnanMnLCBuZXcgRGF0ZSgpKTtcclxuICAgICAgICB0aGlzLl9ndGFnKCdjb25maWcnLCAnVUEtMTIyMjI0ODY5LTEnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJhY2tTdWJzY3JpcHRpb24oZW1haWw6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghZ2EpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5fZ3RhZygnZXZlbnQnLCAnbmV3c2xldHRlclN1YnNjcmlwdGlvbicsIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50Q2F0ZWdvcnk6ICdOZXdzbGV0dGVyJyxcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9uOiAnc3VibWl0JyxcclxuICAgICAgICAgICAgICAgIGV2ZW50TGFiZWw6IGVtYWlsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdSRU46IEVyIGdpbmcgaWV0cyB2ZXJrZWVyZCBiaWogaGV0IHRyYWNrZW4gdmFuIGRlIE5ld3NsZXR0ZXIgc3Vic2NyaXB0aW9uLicpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtGQkZlZWRSZXNwb25zZU9iamVjdCwgRkJQb3N0UmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7TG9hZGFibGV9IGZyb20gXCIuLi9Mb2FkYWJsZVwiO1xyXG5pbXBvcnQge0ZhY2Vib29rUHJveHl9IGZyb20gXCIuL0ZhY2Vib29rUHJveHlcIjtcclxuaW1wb3J0IHtGYWNlYm9va1Bvc3R9IGZyb20gXCIuL0ZhY2Vib29rUG9zdFwiO1xyXG5pbXBvcnQge3BhcnNlSlNPTn0gZnJvbSBcIi4uL3V0aWwvSlNPTlV0aWxzXCI7XHJcbmltcG9ydCB7bWFudWFsRmFjZWJvb2tGZWVkfSBmcm9tIFwiLi9NYW51YWxGZWVkYm9va0ZlZWRcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va0ZlZWQgZXh0ZW5kcyBMb2FkYWJsZSB7XHJcblxyXG4gICAgcHJpdmF0ZSBfcG9zdHMgOiBBcnJheTxGYWNlYm9va1Bvc3Q+ID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBwb3N0cyAoKSA6IEFycmF5PEZhY2Vib29rUG9zdD4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wb3N0cztcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxsZWQgYnkgc3VwZXIoKTtcclxuICAgIHByb3RlY3RlZCBkb0xvYWQgKCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5LmZlZWQoKHJlcyA6IEZCRmVlZFJlc3BvbnNlT2JqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzLmVycm9yICYmIHJlcy5mZWVkICYmIHJlcy5mZWVkLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkUG9zdHNGcm9tUmVzcG9uc2UocmVzLmZlZWQuZGF0YSlcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghcmVzLmVycm9yICYmIHBhcnNlSlNPTig8YW55PnJlcykgJiYgcGFyc2VKU09OKDxhbnk+cmVzKS5mZWVkICYmIHBhcnNlSlNPTig8YW55PnJlcykuZmVlZC5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFBvc3RzRnJvbVJlc3BvbnNlKHBhcnNlSlNPTig8YW55PnJlcy5mZWVkLmRhdGEpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkUG9zdHNGcm9tUmVzcG9uc2UobWFudWFsRmFjZWJvb2tGZWVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hZGRQb3N0c0Zyb21SZXNwb25zZShtYW51YWxGYWNlYm9va0ZlZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkUG9zdHNGcm9tUmVzcG9uc2UgKHJlcyA6IEZCUG9zdFJlc3BvbnNlW10pIDogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgcG9zdCBvZiByZXMpe1xyXG4gICAgICAgICAgICB0aGlzLl9wb3N0cy5wdXNoKG5ldyBGYWNlYm9va1Bvc3QocG9zdCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxvYWRTdWNjZXNzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB2aWV3ICgpIDogSFRNTEVsZW1lbnRbXSB7XHJcbiAgICAgICAgbGV0IHZpZXcgOiBIVE1MRWxlbWVudFtdID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBkaXNwbGF5aW5nUG9zdHMgPSAwOyBkaXNwbGF5aW5nUG9zdHMgPCBNYXRoLm1pbih0aGlzLnBvc3RzLmxlbmd0aCwgNSk7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcG9zdCA9IHRoaXMucG9zdHNbaV07XHJcbiAgICAgICAgICAgIGlmIChwb3N0LmNhbkRpc3BsYXkpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcucHVzaChwb3N0LnZpZXcpO1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheWluZ1Bvc3RzKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlclRvIChwYXJlbnQgOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGZvciAobGV0IHBvc3RWaWV3IG9mIHRoaXMudmlldykge1xyXG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQocG9zdFZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7RkJIb3Vyc1Jlc3BvbnNlfSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0xvYWRhYmxlfSBmcm9tIFwiLi4vTG9hZGFibGVcIjtcclxuaW1wb3J0IHtGYWNlYm9va1Byb3h5fSBmcm9tIFwiLi9GYWNlYm9va1Byb3h5XCI7XHJcbmltcG9ydCB7cGFyc2VKU09OfSBmcm9tIFwiLi4vdXRpbC9KU09OVXRpbHNcIjtcclxuaW1wb3J0IHtTVEFOREFSRF9PUEVOSU5HX0hPVVJTfSBmcm9tIFwiLi9NYW51YWxPcGVuaW5nSG91cnNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va09wZW5pbmdJbmZvIGV4dGVuZHMgTG9hZGFibGUge1xyXG5cclxuICAgIHB1YmxpYyBtb25kYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHR1ZXNkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHdlZG5lc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgdGh1cnNkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIGZyaWRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgc2F0dXJkYXkgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHVibGljIHN1bmRheSA6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgcHVibGljIGdldCBpc0N1cnJlbnRseU9wZW4gKCkgOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgbm93IDogRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgIGRheSA9IGpzVmFsdWVUb0RheShub3cuZ2V0RGF5KCkpLFxyXG4gICAgICAgICAgICBpbmZvRm9yRGF5ID0gKDxhbnk+dGhpcylbZGF5XTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmZvRm9yRGF5Lmxlbmd0aDsgaSs9Mikge1xyXG4gICAgICAgICAgICBpZiAobGllc05vd0luSW50ZXJ2YWwoaW5mb0ZvckRheVtpXSwgaW5mb0ZvckRheVtpKzFdKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FsbGVkIGJ5IHN1cGVyKCk7XHJcbiAgICBwcm90ZWN0ZWQgZG9Mb2FkICgpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5vcGVuaW5naG91cnMoKHJvdWdoZGF0YSA6IEZCSG91cnNSZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJvdWdoZGF0YS5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZURhdGEocm91Z2hkYXRhKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZFN1Y2Nlc3MoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZEZhaWxlZChyb3VnaGRhdGEuZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnNlRGF0YSg8YW55PlNUQU5EQVJEX09QRU5JTkdfSE9VUlMpO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRTdWNjZXNzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwYXJzZURhdGEgKHJvdWdoZGF0YSA6IEZCSG91cnNSZXNwb25zZSkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHJvdWdoZGF0YSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcm91Z2hkYXRhID0gcGFyc2VKU09OKDxhbnk+cm91Z2hkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tb25kYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignbW9uJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMudHVlc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd0dWUnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy53ZWRuZXNkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignd2VkJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMudGh1cnNkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZigndGh1JykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuZnJpZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ2ZyaScpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnNhdHVyZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3NhdCcpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLnN1bmRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdzdW4nKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRheVRvVmFsdWUgKGRheSA6IHN0cmluZykgOiBudW1iZXJ7XHJcbiAgICBpZiAoZGF5ID09PSdtb24nKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0ndHVlJykge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3dlZCcpIHtcclxuICAgICAgICByZXR1cm4gMjtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSd0aHUnKSB7XHJcbiAgICAgICAgcmV0dXJuIDM7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nZnJpJykge1xyXG4gICAgICAgIHJldHVybiA0O1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3NhdCcpIHtcclxuICAgICAgICByZXR1cm4gNTtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSdzdW4nKSB7XHJcbiAgICAgICAgcmV0dXJuIDY7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpzVmFsdWVUb0RheSAodmFsdWUgOiBudW1iZXIpIDogc3RyaW5ne1xyXG4gICAgaWYgKHZhbHVlID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuICdzdW5kYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMSkge1xyXG4gICAgICAgIHJldHVybiAnbW9uZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDIpIHtcclxuICAgICAgICByZXR1cm4gJ3R1ZXNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMykge1xyXG4gICAgICAgIHJldHVybiAnd2VkbmVzZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDQpIHtcclxuICAgICAgICByZXR1cm4gJ3RodXJzZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDUpIHtcclxuICAgICAgICByZXR1cm4gJ2ZyaWRheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSA2KSB7XHJcbiAgICAgICAgcmV0dXJuICdzYXR1cmRheSc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpzRGF5VmFsdWUgKGRheSA6IHN0cmluZykgOiBudW1iZXIge1xyXG4gICAgcmV0dXJuICgoZGF5VG9WYWx1ZShkYXkpICsgMSkgJSA3KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29tcGFyZU9wZW5pbmdJbmZvIChhIDogc3RyaW5nLCBiIDogc3RyaW5nKSB7XHJcbiAgICBsZXQgaW5mb0EgPSBhLnNwbGl0KCdfJyksXHJcbiAgICAgICAgaW5mb0IgPSBiLnNwbGl0KCdfJyk7XHJcblxyXG4gICAgaWYgKHBhcnNlSW50KGluZm9BWzFdKSA8IHBhcnNlSW50KGluZm9CWzFdKSkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoaW5mb0FbMV0pID4gcGFyc2VJbnQoaW5mb0JbMV0pKXtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGluZm9BWzJdID09PSAnb3Blbicpe1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfSBlbHNlIHJldHVybiAxO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB0b1RpbWluZ3MgKG9wZW5pbmdUaW1lIDogc3RyaW5nW10sIHJvdWdoRGF0YSA6IEZCSG91cnNSZXNwb25zZSkgOiBzdHJpbmdbXSB7XHJcbiAgICBsZXQgdGltaW5ncyA6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgb3BlbmluZyBvZiBvcGVuaW5nVGltZSkge1xyXG4gICAgICAgIHRpbWluZ3MucHVzaChyb3VnaERhdGEuaG91cnNbb3BlbmluZ10pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRpbWluZ3M7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxpZXNOb3dJbkludGVydmFsIChzdGFydCA6IHN0cmluZywgZW5kIDogc3RyaW5nKSA6IGJvb2xlYW4ge1xyXG5cclxuICAgIGxldCBub3cgOiBEYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICBzdGFydEhvdXJzTWludXRlcyAgPSBzdGFydC5zcGxpdCgnOicpLFxyXG4gICAgICAgIHN0YXJ0RGF0ZSA6IERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIHN0YXJ0SG91ciA6IG51bWJlciA9IHBhcnNlSW50KHN0YXJ0SG91cnNNaW51dGVzWzBdKSxcclxuICAgICAgICBzdGFydE1pbnV0ZXMgOiBudW1iZXIgPSBwYXJzZUludChzdGFydEhvdXJzTWludXRlc1sxXSksXHJcbiAgICAgICAgZW5kSG91cnNNaW51dGVzICA9IGVuZC5zcGxpdCgnOicpLFxyXG4gICAgICAgIGVuZERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIGVuZEhvdXIgOiBudW1iZXIgPSBwYXJzZUludChlbmRIb3Vyc01pbnV0ZXNbMF0pLFxyXG4gICAgICAgIGVuZE1pbnV0ZXMgOiBudW1iZXIgPSBwYXJzZUludChlbmRIb3Vyc01pbnV0ZXNbMV0pO1xyXG5cclxuICAgIHN0YXJ0RGF0ZS5zZXRIb3VycyhzdGFydEhvdXIpO1xyXG4gICAgc3RhcnREYXRlLnNldE1pbnV0ZXMoc3RhcnRNaW51dGVzKTtcclxuICAgIGVuZERhdGUuc2V0SG91cnMoZW5kSG91cik7XHJcbiAgICBlbmREYXRlLnNldE1pbnV0ZXMoZW5kTWludXRlcyk7XHJcblxyXG4gICAgcmV0dXJuIG5vdyA+PSBzdGFydERhdGUgJiYgbm93IDwgZW5kRGF0ZTtcclxufSIsImltcG9ydCB7RkJQb3N0UmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7SW1hZ2VUYWd9IGZyb20gXCIuLi9saWJyYXJ5L1NjcmlwdFRhZ1wiO1xyXG5pbXBvcnQge0ZCX1BBR0VfSUR9IGZyb20gXCIuL0ZhY2Vib29rUHJveHlcIjtcclxuaW1wb3J0IHtsaW5raWZ5fSBmcm9tIFwiLi4vdXRpbC9MaW5raWZ5XCI7XHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1Bvc3Qge1xyXG5cclxuICAgIHByaXZhdGUgaW5mbyA6IEZCUG9zdFJlc3BvbnNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yIChpbmZvIDogRkJQb3N0UmVzcG9uc2UpIHtcclxuICAgICAgICB0aGlzLmluZm8gPSBpbmZvO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgY2FuRGlzcGxheSAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5pbmZvLmlzX2hpZGRlbiAmJiB0aGlzLmluZm8uaXNfcHVibGlzaGVkICYmIHRoaXMuaW5mby5mcm9tICYmIHRoaXMuaW5mby5mcm9tLmlkID09PSBGQl9QQUdFX0lEICYmICEhdGhpcy5tZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgY3JlYXRlZCAoKSA6IERhdGUge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmluZm8uY3JlYXRlZF90aW1lLnNwbGl0KCcrJylbMF0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaWQgKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZm8uaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBtZXNzYWdlICgpIDogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmZvLm1lc3NhZ2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBnZXQgcGljdHVyZSAoKSA6IEltYWdlVGFnIHtcclxuICAgICAgICBpZiAodGhpcy5pbmZvLmZ1bGxfcGljdHVyZSkge1xyXG4gICAgICAgICAgICBsZXQgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gdGhpcy5pbmZvLmZ1bGxfcGljdHVyZTtcclxuICAgICAgICAgICAgaW1hZ2UuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWltZyc7XHJcbiAgICAgICAgICAgIHJldHVybiBpbWFnZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlclRvIChwYXJlbnQgOiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNhbkRpc3BsYXkpIHtcclxuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMudmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdmlldyAoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBsZXQgdmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIHZpZXcuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGxldCBkYXRlVmlldyA9IHRoaXMuY3JlYXRlRGF0ZVZpZXcoKTtcclxuICAgICAgICB2aWV3LmFwcGVuZENoaWxkKGRhdGVWaWV3KTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgY29udGVudFZpZXcgPSB0aGlzLmNyZWF0ZUNvbnRlbnRWaWV3KCk7XHJcbiAgICAgICAgdmlldy5hcHBlbmRDaGlsZChjb250ZW50Vmlldyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVDb250ZW50VmlldyAoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBsZXQgY29udGVudENvbnRhaW5lciA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgY29udGVudENvbnRhaW5lci5jbGFzc05hbWUgPSAncmVuLWNvbnRlbnQtaXRlbS1jb250YWluZXInO1xyXG5cclxuICAgICAgICBsZXQgbmV3c0ZlZWRDb250ZW50Q29udGFpbmVyIDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWNvbnRlbnQtY29udGFpbmVyJztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubWVzc2FnZSkge1xyXG4gICAgICAgICAgICBsZXQgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xyXG4gICAgICAgICAgICB0aXRsZS5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tdGl0bGUnO1xyXG5cclxuICAgICAgICAgICAgbGV0IGZpcnN0U2VudGVuY2UgPSB0aGlzLm1lc3NhZ2UubWF0Y2goZmlyc3RTZW50ZW5jZVJlZ2V4KSB8fCB0aGlzLm1lc3NhZ2UubWF0Y2goZmlyc3RTZW50ZW5jZUJlZm9yZU5ld2xpbmVSZWdleCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZmlyc3RTZW50ZW5jZSkge1xyXG4gICAgICAgICAgICAgICAgdGl0bGUuaW5uZXJIVE1MID0gZmlyc3RTZW50ZW5jZS5tYXAoZnVuY3Rpb24ocyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHMucmVwbGFjZSgvXlxccyt8XFxzKyQvZywnJyk7XHJcbiAgICAgICAgICAgICAgICB9KVswXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQodGl0bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgcGljdHVyZSA9IHRoaXMucGljdHVyZTtcclxuICAgICAgICBpZiAocGljdHVyZSkge1xyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQocGljdHVyZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICBtZXNzYWdlLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS10ZXh0JztcclxuICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSB0aGlzLm1lc3NhZ2UgJiYgbGlua2lmeSh0aGlzLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBuZXdzRmVlZENvbnRlbnRDb250YWluZXIuYXBwZW5kQ2hpbGQobWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgY29udGVudENvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdzRmVlZENvbnRlbnRDb250YWluZXIpO1xyXG4gICAgICAgIHJldHVybiBjb250ZW50Q29udGFpbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlRGF0ZVZpZXcgKCkgOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgbGV0IGRhdGVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBkYXRlQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1kYXRlLWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGxldCBkYXRlRGF5TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMScpO1xyXG4gICAgICAgIGRhdGVEYXlMYWJlbC5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tZGF0ZS1kYXknO1xyXG4gICAgICAgIGRhdGVEYXlMYWJlbC5pbm5lclRleHQgPSAnJyt0aGlzLmNyZWF0ZWQuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIGRhdGVDb250YWluZXIuYXBwZW5kQ2hpbGQoZGF0ZURheUxhYmVsKTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGVNb250aFllYXJMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g2Jyk7XHJcbiAgICAgICAgZGF0ZU1vbnRoWWVhckxhYmVsLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1kYXRlLW1vbnRoLXllYXInO1xyXG4gICAgICAgIGRhdGVNb250aFllYXJMYWJlbC5pbm5lclRleHQgPSBtb250aHNbdGhpcy5jcmVhdGVkLmdldE1vbnRoKCldICsgJyAnICsgdGhpcy5jcmVhdGVkLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgZGF0ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChkYXRlTW9udGhZZWFyTGFiZWwpO1xyXG5cclxuICAgICAgICByZXR1cm4gZGF0ZUNvbnRhaW5lcjtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgbW9udGhzIDogc3RyaW5nW10gPSBbXHJcbiAgICAnSmFuJywgJ0ZlYicsICdNYWEnLCAnQXByJywgJ01laScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2t0JywgJ05vdicsICdEZWMnXHJcbl07XHJcblxyXG5jb25zdCBmaXJzdFNlbnRlbmNlUmVnZXggOiBSZWdFeHAgPSAvXi4qP1tcXC4hXFw/XSg/Olxcc3wkKS9nO1xyXG5jb25zdCBmaXJzdFNlbnRlbmNlQmVmb3JlTmV3bGluZVJlZ2V4IDogUmVnRXhwID0gL14uKj9bXFxuXSg/Olxcc3wkKS9nOyIsImltcG9ydCB7RkJSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7U2NyaXB0VGFnfSBmcm9tIFwiLi4vbGlicmFyeS9TY3JpcHRUYWdcIjtcclxuXHJcbmNvbnN0IHByb3h5VVJMID0gJ2h0dHBzOi8vcmVuc2VjdXJpdHlwcm94eS1zYW1naWVsaXMucmhjbG91ZC5jb20vJztcclxuZXhwb3J0IGNvbnN0IEZCX1BBR0VfSUQgOiBzdHJpbmcgPSBcIjIxNTQ3MDM0MTkwOTkzN1wiO1xyXG5cclxuaW50ZXJmYWNlIElGYWNlYm9va1NESyB7XHJcbiAgICBpbml0IDogYW55O1xyXG4gICAgYXBpIChncmFwaHBhdGggOiBzdHJpbmcsIGNhbGxiYWNrIDogKHJlc3BvbnNlIDogRkJSZXNwb25zZSkgPT4gYW55KSA6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1Byb3h5IHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGZlZWQgIChzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgRmFjZWJvb2tQcm94eS5nZXQoJ2ZlZWQnLCBzdWNjLCBmYWlsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIG9wZW5pbmdob3VycyAgKHN1Y2MgOiAoaW5mbyA6IEZCUmVzcG9uc2UpID0+IHZvaWQsIGZhaWw/IDogKCkgPT4gdm9pZCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5LmdldCgnb3BlbmluZ2hvdXJzJywgc3VjYywgZmFpbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc3RhdGljIGdldCAodXJsIDogc3RyaW5nLCBzdWNjIDogKGluZm8gOiBGQlJlc3BvbnNlKSA9PiB2b2lkLCBmYWlsPyA6ICgpID0+IHZvaWQpIDogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICB4aHIub3BlbignZ2V0JywgcHJveHlVUkwgKyB1cmwsIHRydWUpO1xyXG4gICAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xyXG4gICAgICAgICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cztcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VjYyh4aHIucmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKGZhaWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBmYWlsKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHhoci5vbmVycm9yID0gZmFpbDtcclxuICAgICAgICAgICAgeGhyLnNlbmQoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGlmKGZhaWwpIHtcclxuICAgICAgICAgICAgICAgIGZhaWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7RkJQb3N0UmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7RkJfUEFHRV9JRH0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IG1hbnVhbEZhY2Vib29rRmVlZDogRkJQb3N0UmVzcG9uc2VbXSA9IFtcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnTm9nIHNuZWwgw6nDqW4gdmFuIGRlIDIwMCBnZWxpbWl0ZWVyZGUgU1VQRVJUUkFDIFVMVFJBIFJDIHNjaG9lbmVuIGluIGRlIHdhY2h0IHNsZXBlbj8gUmVuIFNwb3J0IGhlbHB0IGplIGdyYWFnIHZlcmRlci4nLFxyXG4gICAgICAgICcyMDE4LzA4LzI0JyxcclxuICAgICAgICAnaHR0cHM6Ly9zY29udGVudC1icnUyLTEueHguZmJjZG4ubmV0L3YvdDEuMC05LzM5OTQ3MjI0Xzc5NjcwNTc1Mzc4NjM5MF84MDQwNjI2NjQ4NzExNjkyMjg4X24ucG5nP19uY19jYXQ9MCZvaD0yNDE3OWFmYWU2ZjNkMjAwMjc5ZTgyN2QxYWM2MTk2YSZvZT01QzMwQUQyMSdcclxuICAgICksXHJcbiAgICBtYW51YWxGYWNlYm9va1Bvc3RJbXBvcnQoXHJcbiAgICAgICAgJ05VIGJpaiBSZW4gU3BvcnQuIERlIG5pZXV3ZSBNaXp1bm8gV2F2ZSBVbHRpbWEgMTAg4oCTIFRDUyBBbXN0ZXJkYW0gTWFyYXRob24gZWRpdGllLicsXHJcbiAgICAgICAgJzIwMTgvMDgvMTcnLFxyXG4gICAgICAgICdodHRwczovL3Njb250ZW50LWJydTItMS54eC5mYmNkbi5uZXQvdi90MS4wLTkvMzk0NTM5MDVfNzg4MDUyMDY0NjUxNzU5Xzc4NzAyMTc5MDcwNzI5MjU2OTZfbi5qcGc/X25jX2NhdD0wJm9oPWQxYWI4ZmYyNjAwOGYyMWUyNTJiNzZlOWFjNDhlYWFjJm9lPTVDMDYyMDU2J1xyXG4gICAgKSxcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnQmVzdGUga2xhbnRlbiwgbWFhbmRhZyAxMywgZGluc2RhZyAxNCBlbiB3b2Vuc2RhZyAxNSBhdWd1c3R1cyB6aWpuIHdlIGdlc2xvdGVuLiBEb25kZXJkYWcgemlqbiB3ZSB0ZXJ1ZyBvcGVuLiBHZW5pZXQgdmFuIGp1bGxpZSBtb29pIGVuIHNwb3J0aWVmIHdlZWtlbmQu77+977+977+977+977+977+94oCN4pmC77iP77+977+94oCN4pmA77iP77+977+977+977+94oCN4pmC77iP77+977+94oCN4pmC77iP77+977+94oCN4pmA77iPLiDvv73vv70nLFxyXG4gICAgICAgICcyMDE4LzA4LzExJyxcclxuICAgICAgICAnaHR0cHM6Ly9zY29udGVudC1icnUyLTEueHguZmJjZG4ubmV0L3YvdDEuMC05LzM4OTI2MjY1Xzc4MDA2ODU2MjExNjc3Nl84Nzg3NDk5MTUzNDI1OTU2ODY0X24uanBnP19uY19jYXQ9MCZvaD0zMTg3ZjlmYzAwOWZlYzkxNDVjMDI4YTZlMmJmNjU2NyZvZT01QzBEQjlEOSdcclxuICAgICksXHJcbiAgICBtYW51YWxGYWNlYm9va1Bvc3RJbXBvcnQoXHJcbiAgICAgICAgJ0tuYXAgcG9kaXVtIFN0ZWZmYW4gVmFuZGVybGluZGVuLiBGb3RvIHZhbiBkZSBib3N2cmllbmRlbi4nLFxyXG4gICAgICAgICcyMDE4LzA4LzA0JyxcclxuICAgICAgICAnaHR0cHM6Ly9zY29udGVudC1icnUyLTEueHguZmJjZG4ubmV0L3YvdDEuMC05LzM4NTI4NjQ3Xzc3MDMxODY5NjQyNTA5Nl8zMjgxMzMyODY0OTk3NjU0NTI4X24ucG5nP19uY19jYXQ9MCZvaD1mNGMyZTg3ZDg2NjY4ZTVkZThhM2RjNjIyOGYyMzlkOSZvZT01QkZBNjlCMidcclxuICAgICksXHJcbiAgICBtYW51YWxGYWNlYm9va1Bvc3RJbXBvcnQoXHJcbiAgICAgICAgJ0Rpa2tlIHByb2ZpY2lhdCB2b29yIG9uemUgcm9kZSBkdWl2ZWxzIHZhbiBoZXQgUmVuIFNwb3J0IHRlYW0uJyxcclxuICAgICAgICAnMjAxOC8wNy8wNycsXHJcbiAgICAgICAgJ2h0dHBzOi8vc2NvbnRlbnQtYnJ1Mi0xLnh4LmZiY2RuLm5ldC92L3QxLjAtOS8zNjc3MDY0Nl83Mzc4NTE3MTYzMzg0NjFfMjExNjk3NzI1MTIxMDc1NjA5Nl9uLmpwZz9fbmNfY2F0PTAmb2g9N2FmODQ0NTM2OGRhM2FhZjhiZjNjZWU4YTM0YWIwMDYmb2U9NUJEQzcxQkYnXHJcbiAgICApLFxyXG4gICAgbWFudWFsRmFjZWJvb2tQb3N0SW1wb3J0KFxyXG4gICAgICAgICdIZWVsIHdhcm0gd2VlciwgdmVlbCBkcmlua2VuISEhXFxuJyArXHJcbiAgICAgICAgJ1dhdCBkcmlua2VuIHZvb3IgZW4gbmEgZWVuIHRyYWluaW5nLyB3ZWRzdHJpamQ/XFxuJyArXHJcbiAgICAgICAgJ05JRVVXIGJpaiBSZW4gU3BvcnQgaXMgT1ZFUlNUSU1TLlxcbicgK1xyXG4gICAgICAgICdFZW4gaWRlYWFsIHZvb3JkZWVscGFra2V0IHZvb3IgZGUgbWFyYXRob25sb3BlcnMsIG1ldCBleHRyYSBlZW4gYmFuZCB2b29yIHUgbnVtbWVyIGVuIGplIGVuZXJnaWVnZWxzIHZvb3Igb25kZXJ3ZWcuJyxcclxuICAgICAgICAnMjAxOC8wNy8wNCcsXHJcbiAgICAgICAgJ2h0dHBzOi8vc2NvbnRlbnQtYnJ1Mi0xLnh4LmZiY2RuLm5ldC92L3QxLjAtOS8zNjY4MjYxM183MzQ4MDA3MTk5NzY4OTRfNDk3NTU1OTA2NjUzODQ3NTUyX24uanBnP19uY19jYXQ9MCZvaD1lODdlY2FjNWQzZTNmYjk1NzEyZWMyNWE5YWM0ZmJiOCZvZT01QkQzNjNBRSdcclxuICAgICkvKixcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnTWVzc2FsaW5hIFBpZXJvbmksIG1vb2kgYXJ0aWtlbCBlbiBtb29pIGZvdG/igJlzLicsXHJcbiAgICAgICAgJzIwMTgvMDcvMDMnLFxyXG4gICAgICAgICdodHRwczovL3Njb250ZW50LWJydTItMS54eC5mYmNkbi5uZXQvdi90MS4wLTkvMzY1MzEwOTRfNzMzNDM1MTE2NzgwMTIxXzE5Mzk4MjE4MTE3MzQ2NzU0NTZfbi5qcGc/X25jX2NhdD0wJm9oPTZjN2I1MzE0ODIyZGM5NDNmOGI4NmY2N2NmNDg3N2U3Jm9lPTVCREU0RkEzJ1xyXG4gICAgKSovXHJcbl07XHJcblxyXG5mdW5jdGlvbiBtYW51YWxGYWNlYm9va1Bvc3RJbXBvcnQobWVzc2FnZTogc3RyaW5nLCBkYXRlOiBzdHJpbmcsIHBpY3R1cmU6IHN0cmluZyk6IEZCUG9zdFJlc3BvbnNlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY3JlYXRlZF90aW1lOiBkYXRlLFxyXG4gICAgICAgIGZ1bGxfcGljdHVyZTogcGljdHVyZSxcclxuICAgICAgICBpZDogJ2lkJyxcclxuICAgICAgICBpc19oaWRkZW46IGZhbHNlLFxyXG4gICAgICAgIGlzX3B1Ymxpc2hlZDogdHJ1ZSxcclxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxyXG4gICAgICAgIGZyb206IHtcclxuICAgICAgICAgICAgbmFtZTogJycsXHJcbiAgICAgICAgICAgIGlkOiBGQl9QQUdFX0lELFxyXG4gICAgICAgICAgICBlcnJvcjogJydcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yOiAnJ1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGNvbnN0IFNUQU5EQVJEX09QRU5JTkdfSE9VUlMgPSB7XHJcbiAgICBob3Vyczoge1xyXG4gICAgICAgIFwibW9uXzFcIjogXCIwOTozMFwiLFxyXG4gICAgICAgIFwibW9uXzJcIjogXCIxMjozMFwiLFxyXG4gICAgICAgIFwibW9uXzNcIjogXCIxMzozMFwiLFxyXG4gICAgICAgIFwibW9uXzRcIjogXCIxODozMFwiLFxyXG4gICAgICAgIFwid2VkXzFcIjogXCIwOTozMFwiLFxyXG4gICAgICAgIFwid2VkXzJcIjogXCIxMjozMFwiLFxyXG4gICAgICAgIFwid2VkXzNcIjogXCIxMzozMFwiLFxyXG4gICAgICAgIFwid2VkXzRcIjogXCIxODozMFwiLFxyXG4gICAgICAgIFwidGh1XzFcIjogXCIwOTozMFwiLFxyXG4gICAgICAgIFwidGh1XzJcIjogXCIxMjozMFwiLFxyXG4gICAgICAgIFwidGh1XzNcIjogXCIxMzozMFwiLFxyXG4gICAgICAgIFwidGh1XzRcIjogXCIxODozMFwiLFxyXG4gICAgICAgIFwiZnJpXzFcIjogXCIwOTozMFwiLFxyXG4gICAgICAgIFwiZnJpXzJcIjogXCIxMjozMFwiLFxyXG4gICAgICAgIFwiZnJpXzNcIjogXCIxMzozMFwiLFxyXG4gICAgICAgIFwiZnJpXzRcIjogXCIxOTowMFwiLFxyXG4gICAgICAgIFwic2F0XzFcIjogXCIwOTozMFwiLFxyXG4gICAgICAgIFwic2F0XzJcIjogXCIxMjozMFwiLFxyXG4gICAgICAgIFwic2F0XzNcIjogXCIxMzozMFwiLFxyXG4gICAgICAgIFwic2F0XzRcIjogXCIxODozMFwiXHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgRVhDRVBUSU9OQUxfT1BFTklOR19IT1VSUyA9IHtcclxuICAgIGhvdXJzOiB7XHJcbiAgICAgICAgXCJ0aHVfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJ0aHVfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJ0aHVfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJ0aHVfNFwiOiBcIjE4OjMwXCIsXHJcbiAgICAgICAgXCJmcmlfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJmcmlfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJmcmlfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJmcmlfNFwiOiBcIjE5OjAwXCIsXHJcbiAgICAgICAgXCJzYXRfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJzYXRfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJzYXRfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJzYXRfNFwiOiBcIjE4OjMwXCJcclxuICAgIH1cclxufTsiLCJleHBvcnQgZnVuY3Rpb24gcGFyc2VKU09OIChqc29uIDogc3RyaW5nKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxldCBwYXJzZWRPYmplY3QgPSBKU09OLnBhcnNlKGpzb24pO1xyXG4gICAgICAgIHJldHVybiBwYXJzZWRPYmplY3Q7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDsgICBcclxuICAgIH1cclxufSIsImV4cG9ydCBmdW5jdGlvbiBsaW5raWZ5IChpbnB1dFRleHQgOiBzdHJpbmcpIDogc3RyaW5nIHtcclxuICAgIHZhciByZXBsYWNlZFRleHQgOiBzdHJpbmcsXHJcbiAgICAgICAgcmVwbGFjZVBhdHRlcm4xIDogUmVnRXhwLCByZXBsYWNlUGF0dGVybjIgOiBSZWdFeHAsIHJlcGxhY2VQYXR0ZXJuMyA6IFJlZ0V4cDtcclxuXHJcbiAgICAvL1VSTHMgc3RhcnRpbmcgd2l0aCBodHRwOi8vLCBodHRwczovLywgb3IgZnRwOi8vXHJcbiAgICByZXBsYWNlUGF0dGVybjEgPSAvKFxcYihodHRwcz98ZnRwKTpcXC9cXC9bLUEtWjAtOSsmQCNcXC8lPz1+X3whOiwuO10qWy1BLVowLTkrJkAjXFwvJT1+X3xdKS9naW07XHJcbiAgICByZXBsYWNlZFRleHQgPSBpbnB1dFRleHQucmVwbGFjZShyZXBsYWNlUGF0dGVybjEsICc8YSBocmVmPVwiJDFcIiB0YXJnZXQ9XCJfYmxhbmtcIj4kMTwvYT4nKTtcclxuXHJcbiAgICAvL1VSTHMgc3RhcnRpbmcgd2l0aCBcInd3dy5cIiAod2l0aG91dCAvLyBiZWZvcmUgaXQsIG9yIGl0J2QgcmUtbGluayB0aGUgb25lcyBkb25lIGFib3ZlKS5cclxuICAgIHJlcGxhY2VQYXR0ZXJuMiA9IC8oXnxbXlxcL10pKHd3d1xcLltcXFNdKyhcXGJ8JCkpL2dpbTtcclxuICAgIHJlcGxhY2VkVGV4dCA9IHJlcGxhY2VkVGV4dC5yZXBsYWNlKHJlcGxhY2VQYXR0ZXJuMiwgJyQxPGEgaHJlZj1cImh0dHA6Ly8kMlwiIHRhcmdldD1cIl9ibGFua1wiPiQyPC9hPicpO1xyXG5cclxuICAgIC8vQ2hhbmdlIGVtYWlsIGFkZHJlc3NlcyB0byBtYWlsdG86OiBsaW5rcy5cclxuICAgIHJlcGxhY2VQYXR0ZXJuMyA9IC8oKFthLXpBLVowLTlcXC1cXF9cXC5dKStAW2EtekEtWlxcX10rPyhcXC5bYS16QS1aXXsyLDZ9KSspL2dpbTtcclxuICAgIHJlcGxhY2VkVGV4dCA9IHJlcGxhY2VkVGV4dC5yZXBsYWNlKHJlcGxhY2VQYXR0ZXJuMywgJzxhIGhyZWY9XCJtYWlsdG86JDFcIj4kMTwvYT4nKTtcclxuXHJcbiAgICByZXR1cm4gcmVwbGFjZWRUZXh0O1xyXG59IiwiaW1wb3J0IHtGYWNlYm9va09wZW5pbmdJbmZvfSBmcm9tIFwiLi4vZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rT3BlbmluZ0luZm9cIjtcclxuXHJcbmNvbnN0IGRheXMgOiBzdHJpbmdbXSA9IFtcclxuICAgICdtb25kYXknLCAndHVlc2RheScsICd3ZWRuZXNkYXknLCAndGh1cnNkYXknLCAnZnJpZGF5JywgJ3NhdHVyZGF5JywgJ3N1bmRheSdcclxuXTtcclxuXHJcbmNvbnN0IGRheXNUcmFuc2xhdGlvbiA6IHtbZGF5IDogc3RyaW5nXSA6IHN0cmluZ30gPSB7XHJcbiAgICAnbW9uZGF5JyA6ICdNLicsXHJcbiAgICAndHVlc2RheScgOiAnRC4nLFxyXG4gICAgJ3dlZG5lc2RheScgOiAnVy4nLFxyXG4gICAgJ3RodXJzZGF5JyA6ICdELicsXHJcbiAgICAnZnJpZGF5JyA6ICdWLicsXHJcbiAgICAnc2F0dXJkYXknIDogJ1ouJyxcclxuICAgICdzdW5kYXknIDogJ1ouJ1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlck9wZW5pbmdJbmZvIChvcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm8sIHJvb3QgOiBIVE1MRWxlbWVudCkgOiB2b2lkIHtcclxuICAgIGlmICghcm9vdCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IHR5cGUgPSByb290LmdldEF0dHJpYnV0ZSgnZGF0YS12aWV3dHlwZScpO1xyXG4gICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnbW9kZXN0JyA6XHJcbiAgICAgICAgICAgIHJlbmRlck1vZGVzdE9wZW5pbmdJbmZvVmlldyhvcGVuaW5nSW5mbywgcm9vdCk7XHJcbiAgICB9XHJcbiAgICAvKmxldCByb290IDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGZvciAobGV0IGRheSBvZiBkYXlzKSB7XHJcbiAgICAgICAgbGV0IGRheXZpZXcgPSBkYXlWaWV3KGRheSwgKDxhbnk+b3BlbmluZ0luZm8pW2RheV0pO1xyXG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoZGF5dmlldyk7XHJcbiAgICB9XHJcbiAgICByb290LmFwcGVuZENoaWxkKGN1cnJlbnRseU9wZW5WaWV3KG9wZW5pbmdJbmZvLmlzQ3VycmVudGx5T3BlbikpO1xyXG4gICAgcmV0dXJuIHJvb3Q7Ki9cclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyTW9kZXN0T3BlbmluZ0luZm9WaWV3IChvcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm8sIHJvb3QgOiBIVE1MRWxlbWVudCkgOiB2b2lkIHtcclxuICAgIHJvb3QuYXBwZW5kQ2hpbGQobW9kZXN0V2Vla1ZpZXcob3BlbmluZ0luZm8pKTtcclxuICAgIHJvb3QuYXBwZW5kQ2hpbGQobW9kZXN0SXNPcGVuSW5kaWNhdG9yKG9wZW5pbmdJbmZvKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdElzT3BlbkluZGljYXRvciAob3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvKSA6IEhUTUxFbGVtZW50IHtcclxuICAgIGxldCBjb250YWluZXIgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgY29udGFpbmVyLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLW1vZGVzdC1pbmRpY2F0b3InO1xyXG5cclxuICAgIGxldCBpbmRpY2F0b3JUZXh0IDogSFRNTFNwYW5FbGVtZW50O1xyXG4gICAgaW5kaWNhdG9yVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIGluZGljYXRvclRleHQuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tbW9kZXN0LWluZGljYXRvci1sYWJlbCc7XHJcblxyXG4gICAgbGV0IGNvbnRhY3RPcHRpb25zIDogQXJyYXk8SFRNTEVsZW1lbnQ+ID0gW107XHJcbiAgICBjb250YWN0T3B0aW9ucy5wdXNoKG1vZGVzdEFjdE5vd0xpbmsoJ21haWx0bzppbmZvQHJlbnNwb3J0LmJlJywgJ2ZhLWVudmVsb3BlJykpO1xyXG5cclxuICAgIHN3aXRjaCAob3BlbmluZ0luZm8uaXNDdXJyZW50bHlPcGVuKSB7XHJcbiAgICAgICAgY2FzZSB0cnVlIDpcclxuICAgICAgICAgICAgY29udGFpbmVyLmNsYXNzTmFtZSArPSAnIHJlbi1vcGVuaW5nc3VyZW4tb3Blbic7XHJcbiAgICAgICAgICAgIGluZGljYXRvclRleHQuaW5uZXJUZXh0ID0gJ051IG9wZW4hJztcclxuICAgICAgICAgICAgY29udGFjdE9wdGlvbnMucHVzaChtb2Rlc3RBY3ROb3dMaW5rKCd0ZWw6KzMyMTM2Njc0NjAnLCAnZmEtcGhvbmUnKSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgZmFsc2UgOlxyXG4gICAgICAgICAgICBjb250YWluZXIuY2xhc3NOYW1lICs9ICcgcmVuLW9wZW5pbmdzdXJlbi1jbG9zZWQnO1xyXG4gICAgICAgICAgICBpbmRpY2F0b3JUZXh0LmlubmVyVGV4dCA9ICdHZXNsb3Rlbic7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbmRpY2F0b3JUZXh0KTtcclxuXHJcbiAgICBmb3IgKGxldCBjb250YWN0T3B0aW9uIG9mIGNvbnRhY3RPcHRpb25zKSB7XHJcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNvbnRhY3RPcHRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb250YWluZXI7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3RXZWVrVmlldyAob3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvKSA6IEhUTUxFbGVtZW50IHtcclxuICAgIGxldCB0YWJsZSA6IEhUTUxUYWJsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG5cclxuICAgIGlmIChvcGVuaW5nSW5mby5pc0N1cnJlbnRseU9wZW4pIHtcclxuICAgICAgICB0YWJsZS5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1vcGVuJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGFibGUuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tY2xvc2VkJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgZm9yIChsZXQgZGF5IG9mIGRheXMpIHtcclxuICAgICAgICBsZXQgZGF5dmlldyA6IEhUTUxUYWJsZVJvd0VsZW1lbnQgPSBtb2Rlc3REYXlWaWV3KGRheSwgKDxhbnk+b3BlbmluZ0luZm8pW2RheV0pO1xyXG4gICAgICAgIHRhYmxlLmFwcGVuZENoaWxkKGRheXZpZXcpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YWJsZTtcclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0RGF5VmlldyAoZGF5IDogc3RyaW5nLCBob3VycyA6IHN0cmluZ1tdKSA6IEhUTUxUYWJsZVJvd0VsZW1lbnQge1xyXG4gICAgbGV0IHRhYmxlUm93IDogSFRNTFRhYmxlUm93RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICBpZiAoZGF5ID09PSBkYXlzW25ldyBEYXRlKCkuZ2V0RGF5KCkgLSAxXSkge1xyXG4gICAgICAgIHRhYmxlUm93LmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLWN1cnJlbnRkYXknO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBkYXl2aWV3IDogSFRNTFRhYmxlRGF0YUNlbGxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGgnKSxcclxuICAgICAgICBob3VydmlldyA6IEhUTUxUYWJsZURhdGFDZWxsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcblxyXG4gICAgZGF5dmlldy5pbm5lclRleHQgPSBkYXlzVHJhbnNsYXRpb25bZGF5XTtcclxuICAgIGhvdXJ2aWV3LmlubmVyVGV4dCA9IG1vZGVzdEhvdXJWaWV3KGhvdXJzKTtcclxuXHJcblxyXG4gICAgdGFibGVSb3cuYXBwZW5kQ2hpbGQoZGF5dmlldyk7XHJcbiAgICB0YWJsZVJvdy5hcHBlbmRDaGlsZChob3Vydmlldyk7XHJcblxyXG4gICAgcmV0dXJuIHRhYmxlUm93O1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3RIb3VyVmlldyAoaG91cnMgOiBzdHJpbmdbXSkgOiBzdHJpbmcge1xyXG4gICAgbGV0IGhvdXJ2aWV3ID0gJyc7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhvdXJzLmxlbmd0aDsgaSs9Mikge1xyXG4gICAgICAgIGhvdXJ2aWV3ICs9IGhvdXJzW2ldICsgJyAtICcgKyBob3Vyc1tpKzFdO1xyXG4gICAgICAgIGlmIChpKzEgIT0gaG91cnMubGVuZ3RoLTEpIHtcclxuICAgICAgICAgICAgaG91cnZpZXcgKz0gJywgJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaG91cnZpZXcgfHwgJ0dlc2xvdGVuJztcclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0QWN0Tm93TGluayAoaHJlZiA6IHN0cmluZywgaWNvbk5hbWUgOiBzdHJpbmcpIDogSFRNTEVsZW1lbnQge1xyXG5cclxuICAgIGxldCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgYS5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1pbmRpY2F0b3ItY3RhLWxpbmsnO1xyXG4gICAgYS5ocmVmID0gaHJlZjtcclxuXHJcbiAgICBsZXQgaWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2knKTtcclxuICAgIGljb24uY2xhc3NOYW1lID0gJ2ZhICcgKyBpY29uTmFtZSArICcgZmEtbGcnO1xyXG5cclxuICAgIGEuYXBwZW5kQ2hpbGQoaWNvbik7XHJcblxyXG4gICAgcmV0dXJuIGE7XHJcbn0iXX0=
