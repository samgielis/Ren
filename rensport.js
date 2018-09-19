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
var VR_FORM_ELEMENT_REFERENCE = 'vr-signup-form-17592186047291';
var REN_INPUT_ELEMENT_REFERENCE = 'ren-nieuwsbrief-input-field';
var REN_NEWSLETTER_BUTTON_REFERENCE = 'ren-nieuwsbrief-button';
var NewsletterSubscriptionFormController = (function () {
    function NewsletterSubscriptionFormController(_analyticsTracker) {
        var _this = this;
        this._analyticsTracker = _analyticsTracker;
        this._handleSubmission = function () {
            var container = document.querySelector('.ren-nieuwsbrief-container');
            var input = document.getElementById(REN_INPUT_ELEMENT_REFERENCE);
            var hiddenInput = document.querySelector('#vr-hidden-input-field'), hiddenSubmit = document.querySelector('#vr-hidden-submit-btn');
            if (!input || !hiddenInput || !input.value || !hiddenSubmit) {
                return;
            }
            _this._analyticsTracker.trackSubscription(input.value);
            hiddenInput.value = input.value;
            hiddenSubmit.click();
            container.classList.add('ren-nieuwsbrief-subscribed');
        };
        document.addEventListener("DOMContentLoaded", function () {
            _this._initForm();
        });
    }
    NewsletterSubscriptionFormController.prototype._initForm = function () {
        if (!VR || !VR.SignupForm) {
            return;
        }
        if (!document.getElementById(VR_FORM_ELEMENT_REFERENCE)) {
            return;
        }
        var visibleButton = document.getElementById(REN_NEWSLETTER_BUTTON_REFERENCE);
        if (!visibleButton) {
            return;
        }
        new VR.SignupForm({
            id: "17592186047291",
            element: VR_FORM_ELEMENT_REFERENCE,
            endpoint: "https://marketingsuite.verticalresponse.com/se/",
            submitLabel: "Submitting...",
            invalidEmailMessage: "Invalid email address",
            generalErrorMessage: "An error occurred",
            notFoundMessage: "Signup form not found",
            successMessage: "Success!",
            nonMailableMessage: "Nonmailable address"
        });
        visibleButton.addEventListener('click', this._handleSubmission);
    };
    return NewsletterSubscriptionFormController;
}());
exports.NewsletterSubscriptionFormController = NewsletterSubscriptionFormController;
},{}],3:[function(require,module,exports){
"use strict";
var FacebookOpeningInfo_1 = require("./facebookplugins/FacebookOpeningInfo");
var FacebookFeed_1 = require("./facebookplugins/FacebookFeed");
var OpeningInfoView_1 = require("./view/OpeningInfoView");
var AnalyticsTracker_1 = require("./analytics/AnalyticsTracker");
var NewsletterSubscriptionFormController_1 = require("./NewsletterSubscriptionFormController");
var Ren = (function () {
    function Ren() {
        var _this = this;
        this._analyticsTracker = AnalyticsTracker_1.createAnalyticsTracker();
        new NewsletterSubscriptionFormController_1.NewsletterSubscriptionFormController(this._analyticsTracker);
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
    return Ren;
}());
exports.Ren = Ren;
},{"./NewsletterSubscriptionFormController":2,"./analytics/AnalyticsTracker":6,"./facebookplugins/FacebookFeed":9,"./facebookplugins/FacebookOpeningInfo":10,"./view/OpeningInfoView":17}],4:[function(require,module,exports){
"use strict";
var Ren_1 = require("./Ren");
window.RenSport = new Ren_1.Ren();
},{"./Ren":3}],5:[function(require,module,exports){
"use strict";
exports.REN_PRODUCTION_HOSTNAME = 'rensport.be';
},{}],6:[function(require,module,exports){
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
},{"../RenSportConfig":5,"./DummyAnalyticsTracker":7,"./GoogleAnalyticsTracker":8}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{"../Loadable":1,"../util/JSONUtils":15,"./FacebookPost":11,"./FacebookProxy":12,"./ManualFeedbookFeed":13}],10:[function(require,module,exports){
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
},{"../Loadable":1,"../util/JSONUtils":15,"./FacebookProxy":12,"./ManualOpeningHours":14}],11:[function(require,module,exports){
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
},{"../util/Linkify":16,"./FacebookProxy":12}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
},{"./FacebookProxy":12}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
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
},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTG9hZGFibGUudHMiLCJzcmMvTmV3c2xldHRlclN1YnNjcmlwdGlvbkZvcm1Db250cm9sbGVyLnRzIiwic3JjL1Jlbi50cyIsInNyYy9SZW5HbG9iYWwudHMiLCJzcmMvUmVuU3BvcnRDb25maWcudHMiLCJzcmMvYW5hbHl0aWNzL0FuYWx5dGljc1RyYWNrZXIudHMiLCJzcmMvYW5hbHl0aWNzL0R1bW15QW5hbHl0aWNzVHJhY2tlci50cyIsInNyYy9hbmFseXRpY3MvR29vZ2xlQW5hbHl0aWNzVHJhY2tlci50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tGZWVkLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va09wZW5pbmdJbmZvLnRzIiwic3JjL2ZhY2Vib29rcGx1Z2lucy9GYWNlYm9va1Bvc3QudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rUHJveHkudHMiLCJzcmMvZmFjZWJvb2twbHVnaW5zL01hbnVhbEZlZWRib29rRmVlZC50cyIsInNyYy9mYWNlYm9va3BsdWdpbnMvTWFudWFsT3BlbmluZ0hvdXJzLnRzIiwic3JjL3V0aWwvSlNPTlV0aWxzLnRzIiwic3JjL3V0aWwvTGlua2lmeS50cyIsInNyYy92aWV3L09wZW5pbmdJbmZvVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtJQU9JO1FBTFEsY0FBUyxHQUFhLEtBQUssQ0FBQztRQUM1QixnQkFBVyxHQUFhLEtBQUssQ0FBQztRQUM5QiwyQkFBc0IsR0FBbUIsRUFBRSxDQUFDO1FBQzVDLHdCQUFtQixHQUFtQixFQUFFLENBQUM7UUFHN0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxzQkFBVyw4QkFBUTthQUFuQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7OztPQUFBO0lBRUQs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O0lBQ3JDLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNsQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3JDLFFBQVEsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsUUFBUSxJQUFJLElBQUksQ0FBQztRQUNyQixDQUFDO0lBQ0wsQ0FBQztJQUNELE1BQU0sQ0FBQyxRQUFRLElBQUksVUFBVSxDQUFDO0FBQ2xDLENBQUM7QUFFRCwwQkFBMkIsSUFBYSxFQUFFLFFBQWlCO0lBRXZELElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxxQ0FBcUMsQ0FBQztJQUNwRCxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUVkLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUU3QyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXBCLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDYixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZXhwb3J0IGFic3RyYWN0IGNsYXNzIExvYWRhYmxlIHtcclxuXHJcbiAgICBwcml2YXRlIF9pc0xvYWRlZCA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgX2xvYWRGYWlsZWQgOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF93YWl0aW5nRm9yTG9hZFN1Y2Nlc3MgOiAoKCkgPT4gYW55KVtdID0gW107XHJcbiAgICBwcml2YXRlIF93YWl0aW5nRm9yTG9hZEZhaWwgOiAoKCkgPT4gYW55KVtdID0gW107XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICB0aGlzLmRvTG9hZCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IGlzTG9hZGVkICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzTG9hZGVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaGFzTG9hZEZhaWxlZCAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sb2FkRmFpbGVkXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFmdGVyTG9hZCAobG9hZFN1Y2Nlc3NDYWxsYmFjayA6ICgpID0+IGFueSwgbG9hZEZhaWxDYWxsYmFjaz8gOiAoKSA9PiBhbnkpIDogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkZWQpIHtcclxuICAgICAgICAgICAgbG9hZFN1Y2Nlc3NDYWxsYmFjaygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oYXNMb2FkRmFpbGVkKSB7XHJcbiAgICAgICAgICAgIGlmIChsb2FkRmFpbENhbGxiYWNrKXtcclxuICAgICAgICAgICAgICAgIGxvYWRGYWlsQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2Vzcy5wdXNoKGxvYWRTdWNjZXNzQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICBpZiAobG9hZEZhaWxDYWxsYmFjayl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl93YWl0aW5nRm9yTG9hZEZhaWwucHVzaChsb2FkRmFpbENhbGxiYWNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGxvYWRTdWNjZXNzICgpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIGZvciAobGV0IGNhbGxiYWNrIG9mIHRoaXMuX3dhaXRpbmdGb3JMb2FkU3VjY2Vzcykge1xyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl93YWl0aW5nRm9yTG9hZFN1Y2Nlc3MgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZEZhaWxlZCAoZXJyb3IgOiBzdHJpbmcpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fbG9hZEZhaWxlZCA9IHRydWU7XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fd2FpdGluZ0ZvckxvYWRGYWlsKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3dhaXRpbmdGb3JMb2FkRmFpbCA9IFtdO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTG9hZGluZyBmYWlsZWQgOiAnICsgZXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBkb0xvYWQgKCkgOiB2b2lkO1xyXG59IiwiaW1wb3J0IHtBbmFseXRpY3NUcmFja2VyfSBmcm9tIFwiLi9hbmFseXRpY3MvQW5hbHl0aWNzVHJhY2tlclwiO1xyXG5cclxuZGVjbGFyZSB2YXIgVlI6IFZlcnRpY2FsUmVzcG9uc2U7XHJcblxyXG5pbnRlcmZhY2UgVmVydGljYWxSZXNwb25zZSB7XHJcbiAgICBTaWdudXBGb3JtOiBhbnlcclxufVxyXG5cclxuY29uc3QgVlJfRk9STV9FTEVNRU5UX1JFRkVSRU5DRSA9ICd2ci1zaWdudXAtZm9ybS0xNzU5MjE4NjA0NzI5MSc7XHJcbmNvbnN0IFJFTl9JTlBVVF9FTEVNRU5UX1JFRkVSRU5DRSA9ICdyZW4tbmlldXdzYnJpZWYtaW5wdXQtZmllbGQnO1xyXG5jb25zdCBSRU5fTkVXU0xFVFRFUl9CVVRUT05fUkVGRVJFTkNFID0gJ3Jlbi1uaWV1d3NicmllZi1idXR0b24nO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5ld3NsZXR0ZXJTdWJzY3JpcHRpb25Gb3JtQ29udHJvbGxlciB7XHJcblxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2FuYWx5dGljc1RyYWNrZXI6IEFuYWx5dGljc1RyYWNrZXIpIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2luaXRGb3JtKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdEZvcm0oKSB7XHJcbiAgICAgICAgaWYgKCFWUiB8fCAhVlIuU2lnbnVwRm9ybSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFZSX0ZPUk1fRUxFTUVOVF9SRUZFUkVOQ0UpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHZpc2libGVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChSRU5fTkVXU0xFVFRFUl9CVVRUT05fUkVGRVJFTkNFKTtcclxuXHJcbiAgICAgICAgaWYgKCF2aXNpYmxlQnV0dG9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5ldyBWUi5TaWdudXBGb3JtKHtcclxuICAgICAgICAgICAgaWQ6IFwiMTc1OTIxODYwNDcyOTFcIixcclxuICAgICAgICAgICAgZWxlbWVudDogVlJfRk9STV9FTEVNRU5UX1JFRkVSRU5DRSxcclxuICAgICAgICAgICAgZW5kcG9pbnQ6IFwiaHR0cHM6Ly9tYXJrZXRpbmdzdWl0ZS52ZXJ0aWNhbHJlc3BvbnNlLmNvbS9zZS9cIixcclxuICAgICAgICAgICAgc3VibWl0TGFiZWw6IFwiU3VibWl0dGluZy4uLlwiLFxyXG4gICAgICAgICAgICBpbnZhbGlkRW1haWxNZXNzYWdlOiBcIkludmFsaWQgZW1haWwgYWRkcmVzc1wiLFxyXG4gICAgICAgICAgICBnZW5lcmFsRXJyb3JNZXNzYWdlOiBcIkFuIGVycm9yIG9jY3VycmVkXCIsXHJcbiAgICAgICAgICAgIG5vdEZvdW5kTWVzc2FnZTogXCJTaWdudXAgZm9ybSBub3QgZm91bmRcIixcclxuICAgICAgICAgICAgc3VjY2Vzc01lc3NhZ2U6IFwiU3VjY2VzcyFcIixcclxuICAgICAgICAgICAgbm9uTWFpbGFibGVNZXNzYWdlOiBcIk5vbm1haWxhYmxlIGFkZHJlc3NcIlxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2aXNpYmxlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlU3VibWlzc2lvbik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaGFuZGxlU3VibWlzc2lvbiA9ICgpID0+IHtcclxuICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlbi1uaWV1d3NicmllZi1jb250YWluZXInKTtcclxuICAgICAgICBsZXQgaW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChSRU5fSU5QVVRfRUxFTUVOVF9SRUZFUkVOQ0UpO1xyXG4gICAgICAgIGxldCBoaWRkZW5JbnB1dDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2ci1oaWRkZW4taW5wdXQtZmllbGQnKSxcclxuICAgICAgICAgICAgaGlkZGVuU3VibWl0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdnItaGlkZGVuLXN1Ym1pdC1idG4nKTtcclxuXHJcbiAgICAgICAgaWYgKCFpbnB1dCB8fCAhaGlkZGVuSW5wdXQgfHwgIWlucHV0LnZhbHVlIHx8ICFoaWRkZW5TdWJtaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fYW5hbHl0aWNzVHJhY2tlci50cmFja1N1YnNjcmlwdGlvbihpbnB1dC52YWx1ZSk7XHJcblxyXG4gICAgICAgIGhpZGRlbklucHV0LnZhbHVlID0gaW5wdXQudmFsdWU7XHJcbiAgICAgICAgaGlkZGVuU3VibWl0LmNsaWNrKCk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdyZW4tbmlldXdzYnJpZWYtc3Vic2NyaWJlZCcpXHJcbiAgICB9O1xyXG59IiwiaW1wb3J0IHtGYWNlYm9va09wZW5pbmdJbmZvfSBmcm9tIFwiLi9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tPcGVuaW5nSW5mb1wiO1xyXG5pbXBvcnQge0ZhY2Vib29rRmVlZH0gZnJvbSBcIi4vZmFjZWJvb2twbHVnaW5zL0ZhY2Vib29rRmVlZFwiO1xyXG5pbXBvcnQge1JlblNwb3J0Q29uZmlnfSBmcm9tIFwiLi9SZW5TcG9ydENvbmZpZ1wiO1xyXG5pbXBvcnQge3JlbmRlck9wZW5pbmdJbmZvfSBmcm9tIFwiLi92aWV3L09wZW5pbmdJbmZvVmlld1wiO1xyXG5pbXBvcnQge0FuYWx5dGljc1RyYWNrZXIsIGNyZWF0ZUFuYWx5dGljc1RyYWNrZXJ9IGZyb20gXCIuL2FuYWx5dGljcy9BbmFseXRpY3NUcmFja2VyXCI7XHJcbmltcG9ydCB7R29vZ2xlQW5hbHl0aWNzVHJhY2tlcn0gZnJvbSBcIi4vYW5hbHl0aWNzL0dvb2dsZUFuYWx5dGljc1RyYWNrZXJcIjtcclxuaW1wb3J0IHtOZXdzbGV0dGVyU3Vic2NyaXB0aW9uRm9ybUNvbnRyb2xsZXJ9IGZyb20gXCIuL05ld3NsZXR0ZXJTdWJzY3JpcHRpb25Gb3JtQ29udHJvbGxlclwiO1xyXG5cclxuZGVjbGFyZSB2YXIgJDogYW55O1xyXG5cclxuZXhwb3J0IGNsYXNzIFJlbiB7XHJcblxyXG4gICAgcHJpdmF0ZSBfb3BlbmluZ0luZm8gOiBGYWNlYm9va09wZW5pbmdJbmZvO1xyXG4gICAgcHJpdmF0ZSBfZmVlZCA6IEZhY2Vib29rRmVlZDtcclxuICAgIHByaXZhdGUgX2FuYWx5dGljc1RyYWNrZXI6IEFuYWx5dGljc1RyYWNrZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHRoaXMuX2FuYWx5dGljc1RyYWNrZXIgPSBjcmVhdGVBbmFseXRpY3NUcmFja2VyKCk7XHJcbiAgICAgICAgbmV3IE5ld3NsZXR0ZXJTdWJzY3JpcHRpb25Gb3JtQ29udHJvbGxlcih0aGlzLl9hbmFseXRpY3NUcmFja2VyKTtcclxuXHJcbiAgICAgICAgbGV0IGNvbmZpZyA6IFJlblNwb3J0Q29uZmlnID0gKDxhbnk+d2luZG93KS5SZW5TcG9ydENvbmZpZztcclxuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5sb2FkSGVhZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYWRIZWFkZXIoY29uZmlnLmNvbnRleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fbG9hZEZvb3RlcigpO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5sb2FkT3BlbmluZ0hvdXJzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29wZW5pbmdJbmZvID0gbmV3IEZhY2Vib29rT3BlbmluZ0luZm8oKTtcclxuICAgICAgICAgICAgdGhpcy5fb3BlbmluZ0luZm8uYWZ0ZXJMb2FkKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlbmRlck9wZW5pbmdJbmZvKHRoaXMuX29wZW5pbmdJbmZvLCA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jlbi1vcGVuaW5nc3VyZW4taG9vaycpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5sb2FkTmV3c0ZlZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fZmVlZCA9IG5ldyBGYWNlYm9va0ZlZWQoKTtcclxuICAgICAgICAgICAgdGhpcy5fZmVlZC5hZnRlckxvYWQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZmVlZC5yZW5kZXJUbyg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlbi1ob21lcGFnZS1uZXdzZmVlZCcpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgZmVlZCAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbG9hZEhlYWRlciAoY29udGV4dCA6IHN0cmluZykgOiB2b2lkIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBob29rIDogYW55ID0gJCggXCIjcmVuLWhlYWRlclwiICk7XHJcbiAgICAgICAgICAgIGhvb2subG9hZCggXCIvY29tcG9uZW50cy9oZWFkZXIuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb250ZXh0TmF2YmFyRWxlbWVudCA6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpW2RhdGEtY29udGV4dC0nICsgY29udGV4dC50b0xvd2VyQ2FzZSgpICsgJ10nKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29udGV4dE5hdmJhckVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dE5hdmJhckVsZW1lbnQuY2xhc3NOYW1lICs9ICdhY3RpdmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2xvYWRGb290ZXIgKCkgOiB2b2lkIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBob29rIDogYW55ID0gJCggXCIjcmVuLWZvb3RlclwiICk7XHJcbiAgICAgICAgICAgIGhvb2subG9hZCggXCIvY29tcG9uZW50cy9mb290ZXIuaHRtbFwiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG9wZW5pbmdJbmZvICgpIDogRmFjZWJvb2tPcGVuaW5nSW5mbyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wZW5pbmdJbmZvO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtSZW59IGZyb20gXCIuL1JlblwiO1xyXG5cclxuKDxhbnk+d2luZG93KS5SZW5TcG9ydCA9IG5ldyBSZW4oKTsiLCJleHBvcnQgaW50ZXJmYWNlICBSZW5TcG9ydENvbmZpZyB7XHJcbiAgICBjb250ZXh0IDogc3RyaW5nO1xyXG4gICAgbG9hZEhlYWRlciA6IGJvb2xlYW5cclxuICAgIGxvYWROZXdzRmVlZCA6IGJvb2xlYW4sXHJcbiAgICBsb2FkT3BlbmluZ0hvdXJzIDogYm9vbGVhblxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgUkVOX1BST0RVQ1RJT05fSE9TVE5BTUU6IHN0cmluZyA9ICdyZW5zcG9ydC5iZSc7IiwiaW1wb3J0IHtHb29nbGVBbmFseXRpY3NUcmFja2VyfSBmcm9tIFwiLi9Hb29nbGVBbmFseXRpY3NUcmFja2VyXCI7XHJcbmltcG9ydCB7UkVOX1BST0RVQ1RJT05fSE9TVE5BTUV9IGZyb20gXCIuLi9SZW5TcG9ydENvbmZpZ1wiO1xyXG5pbXBvcnQge0R1bW15QW5hbHl0aWNzVHJhY2tlcn0gZnJvbSBcIi4vRHVtbXlBbmFseXRpY3NUcmFja2VyXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEFuYWx5dGljc1RyYWNrZXIge1xyXG4gICAgdHJhY2tTdWJzY3JpcHRpb24oZW1haWw6IHN0cmluZyk6IHZvaWRcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFuYWx5dGljc1RyYWNrZXIoKTogQW5hbHl0aWNzVHJhY2tlciB7XHJcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09PSBSRU5fUFJPRFVDVElPTl9IT1NUTkFNRSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgR29vZ2xlQW5hbHl0aWNzVHJhY2tlcigpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBEdW1teUFuYWx5dGljc1RyYWNrZXIoKTtcclxufVxyXG4iLCJpbXBvcnQge0FuYWx5dGljc1RyYWNrZXJ9IGZyb20gXCIuL0FuYWx5dGljc1RyYWNrZXJcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBEdW1teUFuYWx5dGljc1RyYWNrZXIgaW1wbGVtZW50cyBBbmFseXRpY3NUcmFja2VyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnUkVOL0FOQUxZVElDUzogSW5zdGFudGlhdGluZyBEdW1teUFuYWx5dGljc1RyYWNrZXIuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRyYWNrU3Vic2NyaXB0aW9uKGVtYWlsOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgUkVOL0FOQUxZVElDUzogVHJhY2tpbmcgbmV3IG5ld3NsZXR0ZXIgc3Vic2NyaXB0aW9uIGZvciAke2VtYWlsfS5gKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7QW5hbHl0aWNzVHJhY2tlcn0gZnJvbSBcIi4vQW5hbHl0aWNzVHJhY2tlclwiO1xyXG5cclxuZGVjbGFyZSB2YXIgZ2E6IGFueTtcclxuXHJcbmV4cG9ydCBjbGFzcyBHb29nbGVBbmFseXRpY3NUcmFja2VyIGltcGxlbWVudHMgQW5hbHl0aWNzVHJhY2tlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBfZ3RhZzogKGV2ZW50TmFtZTogc3RyaW5nLCAuLi5wYXJhbWV0ZXJzOiBhbnlbXSkgPT4gdm9pZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBjb25zdCBkYXRhTGF5ZXIgPSAoPGFueT53aW5kb3cpLmRhdGFMYXllciA9ICg8YW55PndpbmRvdykuZGF0YUxheWVyIHx8IFtdO1xyXG4gICAgICAgIHRoaXMuX2d0YWcgPSAoPGFueT53aW5kb3cpLmd0YWcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGRhdGFMYXllci5wdXNoKGFyZ3VtZW50cyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLl9ndGFnKCdqcycsIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgIHRoaXMuX2d0YWcoJ2NvbmZpZycsICdVQS0xMjIyMjQ4NjktMScpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cmFja1N1YnNjcmlwdGlvbihlbWFpbDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFnYSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB0aGlzLl9ndGFnKCdldmVudCcsICduZXdzbGV0dGVyU3Vic2NyaXB0aW9uJywge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRDYXRlZ29yeTogJ05ld3NsZXR0ZXInLFxyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb246ICdzdWJtaXQnLFxyXG4gICAgICAgICAgICAgICAgZXZlbnRMYWJlbDogZW1haWxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1JFTjogRXIgZ2luZyBpZXRzIHZlcmtlZXJkIGJpaiBoZXQgdHJhY2tlbiB2YW4gZGUgTmV3c2xldHRlciBzdWJzY3JpcHRpb24uJylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge0ZCRmVlZFJlc3BvbnNlT2JqZWN0LCBGQlBvc3RSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtMb2FkYWJsZX0gZnJvbSBcIi4uL0xvYWRhYmxlXCI7XHJcbmltcG9ydCB7RmFjZWJvb2tQcm94eX0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5pbXBvcnQge0ZhY2Vib29rUG9zdH0gZnJvbSBcIi4vRmFjZWJvb2tQb3N0XCI7XHJcbmltcG9ydCB7cGFyc2VKU09OfSBmcm9tIFwiLi4vdXRpbC9KU09OVXRpbHNcIjtcclxuaW1wb3J0IHttYW51YWxGYWNlYm9va0ZlZWR9IGZyb20gXCIuL01hbnVhbEZlZWRib29rRmVlZFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rRmVlZCBleHRlbmRzIExvYWRhYmxlIHtcclxuXHJcbiAgICBwcml2YXRlIF9wb3N0cyA6IEFycmF5PEZhY2Vib29rUG9zdD4gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHBvc3RzICgpIDogQXJyYXk8RmFjZWJvb2tQb3N0PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc3RzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGxlZCBieSBzdXBlcigpO1xyXG4gICAgcHJvdGVjdGVkIGRvTG9hZCAoKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkuZmVlZCgocmVzIDogRkJGZWVkUmVzcG9uc2VPYmplY3QpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyZXMuZXJyb3IgJiYgcmVzLmZlZWQgJiYgcmVzLmZlZWQuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRQb3N0c0Zyb21SZXNwb25zZShyZXMuZmVlZC5kYXRhKVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFyZXMuZXJyb3IgJiYgcGFyc2VKU09OKDxhbnk+cmVzKSAmJiBwYXJzZUpTT04oPGFueT5yZXMpLmZlZWQgJiYgcGFyc2VKU09OKDxhbnk+cmVzKS5mZWVkLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkUG9zdHNGcm9tUmVzcG9uc2UocGFyc2VKU09OKDxhbnk+cmVzLmZlZWQuZGF0YSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRQb3N0c0Zyb21SZXNwb25zZShtYW51YWxGYWNlYm9va0ZlZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFkZFBvc3RzRnJvbVJlc3BvbnNlKG1hbnVhbEZhY2Vib29rRmVlZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGRQb3N0c0Zyb21SZXNwb25zZSAocmVzIDogRkJQb3N0UmVzcG9uc2VbXSkgOiB2b2lkIHtcclxuICAgICAgICBmb3IgKGxldCBwb3N0IG9mIHJlcyl7XHJcbiAgICAgICAgICAgIHRoaXMuX3Bvc3RzLnB1c2gobmV3IEZhY2Vib29rUG9zdChwb3N0KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubG9hZFN1Y2Nlc3MoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHZpZXcgKCkgOiBIVE1MRWxlbWVudFtdIHtcclxuICAgICAgICBsZXQgdmlldyA6IEhUTUxFbGVtZW50W10gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGRpc3BsYXlpbmdQb3N0cyA9IDA7IGRpc3BsYXlpbmdQb3N0cyA8IE1hdGgubWluKHRoaXMucG9zdHMubGVuZ3RoLCA1KTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwb3N0ID0gdGhpcy5wb3N0c1tpXTtcclxuICAgICAgICAgICAgaWYgKHBvc3QuY2FuRGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgdmlldy5wdXNoKHBvc3Qudmlldyk7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5aW5nUG9zdHMrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyVG8gKHBhcmVudCA6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgZm9yIChsZXQgcG9zdFZpZXcgb2YgdGhpcy52aWV3KSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChwb3N0Vmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtGQkhvdXJzUmVzcG9uc2V9IGZyb20gXCIuL0lGQlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7TG9hZGFibGV9IGZyb20gXCIuLi9Mb2FkYWJsZVwiO1xyXG5pbXBvcnQge0ZhY2Vib29rUHJveHl9IGZyb20gXCIuL0ZhY2Vib29rUHJveHlcIjtcclxuaW1wb3J0IHtwYXJzZUpTT059IGZyb20gXCIuLi91dGlsL0pTT05VdGlsc1wiO1xyXG5pbXBvcnQge1NUQU5EQVJEX09QRU5JTkdfSE9VUlN9IGZyb20gXCIuL01hbnVhbE9wZW5pbmdIb3Vyc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rT3BlbmluZ0luZm8gZXh0ZW5kcyBMb2FkYWJsZSB7XHJcblxyXG4gICAgcHVibGljIG1vbmRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgdHVlc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgd2VkbmVzZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyB0aHVyc2RheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgZnJpZGF5IDogc3RyaW5nW10gPSBbXTtcclxuICAgIHB1YmxpYyBzYXR1cmRheSA6IHN0cmluZ1tdID0gW107XHJcbiAgICBwdWJsaWMgc3VuZGF5IDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlzQ3VycmVudGx5T3BlbiAoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBub3cgOiBEYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgZGF5ID0ganNWYWx1ZVRvRGF5KG5vdy5nZXREYXkoKSksXHJcbiAgICAgICAgICAgIGluZm9Gb3JEYXkgPSAoPGFueT50aGlzKVtkYXldO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZm9Gb3JEYXkubGVuZ3RoOyBpKz0yKSB7XHJcbiAgICAgICAgICAgIGlmIChsaWVzTm93SW5JbnRlcnZhbChpbmZvRm9yRGF5W2ldLCBpbmZvRm9yRGF5W2krMV0pKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxsZWQgYnkgc3VwZXIoKTtcclxuICAgIHByb3RlY3RlZCBkb0xvYWQgKCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5Lm9wZW5pbmdob3Vycygocm91Z2hkYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcm91Z2hkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlRGF0YShyb3VnaGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkU3VjY2VzcygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkRmFpbGVkKHJvdWdoZGF0YS5lcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyc2VEYXRhKDxhbnk+U1RBTkRBUkRfT1BFTklOR19IT1VSUyk7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZFN1Y2Nlc3MoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHBhcnNlRGF0YSAocm91Z2hkYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygcm91Z2hkYXRhID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByb3VnaGRhdGEgPSBwYXJzZUpTT04oPGFueT5yb3VnaGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1vbmRheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCdtb24nKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy50dWVzZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3R1ZScpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgICAgICB0aGlzLndlZG5lc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd3ZWQnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy50aHVyc2RheSA9IHRvVGltaW5ncyhPYmplY3Qua2V5cyhyb3VnaGRhdGEuaG91cnMpLmZpbHRlcigob3BlbmluZ1RpbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcGVuaW5nVGltZS5pbmRleE9mKCd0aHUnKSA+IC0xO1xyXG4gICAgICAgICAgICB9KS5zb3J0KGNvbXBhcmVPcGVuaW5nSW5mbyksIHJvdWdoZGF0YSk7XHJcbiAgICAgICAgdGhpcy5mcmlkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignZnJpJykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuc2F0dXJkYXkgPSB0b1RpbWluZ3MoT2JqZWN0LmtleXMocm91Z2hkYXRhLmhvdXJzKS5maWx0ZXIoKG9wZW5pbmdUaW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3BlbmluZ1RpbWUuaW5kZXhPZignc2F0JykgPiAtMTtcclxuICAgICAgICAgICAgfSkuc29ydChjb21wYXJlT3BlbmluZ0luZm8pLCByb3VnaGRhdGEpO1xyXG4gICAgICAgIHRoaXMuc3VuZGF5ID0gdG9UaW1pbmdzKE9iamVjdC5rZXlzKHJvdWdoZGF0YS5ob3VycykuZmlsdGVyKChvcGVuaW5nVGltZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wZW5pbmdUaW1lLmluZGV4T2YoJ3N1bicpID4gLTE7XHJcbiAgICAgICAgICAgIH0pLnNvcnQoY29tcGFyZU9wZW5pbmdJbmZvKSwgcm91Z2hkYXRhKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZGF5VG9WYWx1ZSAoZGF5IDogc3RyaW5nKSA6IG51bWJlcntcclxuICAgIGlmIChkYXkgPT09J21vbicpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSd0dWUnKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nd2VkJykge1xyXG4gICAgICAgIHJldHVybiAyO1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3RodScpIHtcclxuICAgICAgICByZXR1cm4gMztcclxuICAgIH0gZWxzZSBpZiAoZGF5ID09PSdmcmknKSB7XHJcbiAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICB9IGVsc2UgaWYgKGRheSA9PT0nc2F0Jykge1xyXG4gICAgICAgIHJldHVybiA1O1xyXG4gICAgfSBlbHNlIGlmIChkYXkgPT09J3N1bicpIHtcclxuICAgICAgICByZXR1cm4gNjtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ganNWYWx1ZVRvRGF5ICh2YWx1ZSA6IG51bWJlcikgOiBzdHJpbmd7XHJcbiAgICBpZiAodmFsdWUgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gJ3N1bmRheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuICdtb25kYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gMikge1xyXG4gICAgICAgIHJldHVybiAndHVlc2RheSc7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAzKSB7XHJcbiAgICAgICAgcmV0dXJuICd3ZWRuZXNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gNCkge1xyXG4gICAgICAgIHJldHVybiAndGh1cnNkYXknO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gNSkge1xyXG4gICAgICAgIHJldHVybiAnZnJpZGF5JztcclxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IDYpIHtcclxuICAgICAgICByZXR1cm4gJ3NhdHVyZGF5JztcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24ganNEYXlWYWx1ZSAoZGF5IDogc3RyaW5nKSA6IG51bWJlciB7XHJcbiAgICByZXR1cm4gKChkYXlUb1ZhbHVlKGRheSkgKyAxKSAlIDcpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb21wYXJlT3BlbmluZ0luZm8gKGEgOiBzdHJpbmcsIGIgOiBzdHJpbmcpIHtcclxuICAgIGxldCBpbmZvQSA9IGEuc3BsaXQoJ18nKSxcclxuICAgICAgICBpbmZvQiA9IGIuc3BsaXQoJ18nKTtcclxuXHJcbiAgICBpZiAocGFyc2VJbnQoaW5mb0FbMV0pIDwgcGFyc2VJbnQoaW5mb0JbMV0pKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSBlbHNlIGlmIChwYXJzZUludChpbmZvQVsxXSkgPiBwYXJzZUludChpbmZvQlsxXSkpe1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoaW5mb0FbMl0gPT09ICdvcGVuJyl7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9IGVsc2UgcmV0dXJuIDE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvVGltaW5ncyAob3BlbmluZ1RpbWUgOiBzdHJpbmdbXSwgcm91Z2hEYXRhIDogRkJIb3Vyc1Jlc3BvbnNlKSA6IHN0cmluZ1tdIHtcclxuICAgIGxldCB0aW1pbmdzIDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBvcGVuaW5nIG9mIG9wZW5pbmdUaW1lKSB7XHJcbiAgICAgICAgdGltaW5ncy5wdXNoKHJvdWdoRGF0YS5ob3Vyc1tvcGVuaW5nXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGltaW5ncztcclxufVxyXG5cclxuZnVuY3Rpb24gbGllc05vd0luSW50ZXJ2YWwgKHN0YXJ0IDogc3RyaW5nLCBlbmQgOiBzdHJpbmcpIDogYm9vbGVhbiB7XHJcblxyXG4gICAgbGV0IG5vdyA6IERhdGUgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIHN0YXJ0SG91cnNNaW51dGVzICA9IHN0YXJ0LnNwbGl0KCc6JyksXHJcbiAgICAgICAgc3RhcnREYXRlIDogRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgc3RhcnRIb3VyIDogbnVtYmVyID0gcGFyc2VJbnQoc3RhcnRIb3Vyc01pbnV0ZXNbMF0pLFxyXG4gICAgICAgIHN0YXJ0TWludXRlcyA6IG51bWJlciA9IHBhcnNlSW50KHN0YXJ0SG91cnNNaW51dGVzWzFdKSxcclxuICAgICAgICBlbmRIb3Vyc01pbnV0ZXMgID0gZW5kLnNwbGl0KCc6JyksXHJcbiAgICAgICAgZW5kRGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgZW5kSG91ciA6IG51bWJlciA9IHBhcnNlSW50KGVuZEhvdXJzTWludXRlc1swXSksXHJcbiAgICAgICAgZW5kTWludXRlcyA6IG51bWJlciA9IHBhcnNlSW50KGVuZEhvdXJzTWludXRlc1sxXSk7XHJcblxyXG4gICAgc3RhcnREYXRlLnNldEhvdXJzKHN0YXJ0SG91cik7XHJcbiAgICBzdGFydERhdGUuc2V0TWludXRlcyhzdGFydE1pbnV0ZXMpO1xyXG4gICAgZW5kRGF0ZS5zZXRIb3VycyhlbmRIb3VyKTtcclxuICAgIGVuZERhdGUuc2V0TWludXRlcyhlbmRNaW51dGVzKTtcclxuXHJcbiAgICByZXR1cm4gbm93ID49IHN0YXJ0RGF0ZSAmJiBub3cgPCBlbmREYXRlO1xyXG59IiwiaW1wb3J0IHtGQlBvc3RSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtJbWFnZVRhZ30gZnJvbSBcIi4uL2xpYnJhcnkvU2NyaXB0VGFnXCI7XHJcbmltcG9ydCB7RkJfUEFHRV9JRH0gZnJvbSBcIi4vRmFjZWJvb2tQcm94eVwiO1xyXG5pbXBvcnQge2xpbmtpZnl9IGZyb20gXCIuLi91dGlsL0xpbmtpZnlcIjtcclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rUG9zdCB7XHJcblxyXG4gICAgcHJpdmF0ZSBpbmZvIDogRkJQb3N0UmVzcG9uc2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKGluZm8gOiBGQlBvc3RSZXNwb25zZSkge1xyXG4gICAgICAgIHRoaXMuaW5mbyA9IGluZm87XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjYW5EaXNwbGF5ICgpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmluZm8uaXNfaGlkZGVuICYmIHRoaXMuaW5mby5pc19wdWJsaXNoZWQgJiYgdGhpcy5pbmZvLmZyb20gJiYgdGhpcy5pbmZvLmZyb20uaWQgPT09IEZCX1BBR0VfSUQgJiYgISF0aGlzLm1lc3NhZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjcmVhdGVkICgpIDogRGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuaW5mby5jcmVhdGVkX3RpbWUuc3BsaXQoJysnKVswXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBpZCAoKSA6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5mby5pZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG1lc3NhZ2UgKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZm8ubWVzc2FnZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldCBwaWN0dXJlICgpIDogSW1hZ2VUYWcge1xyXG4gICAgICAgIGlmICh0aGlzLmluZm8uZnVsbF9waWN0dXJlKSB7XHJcbiAgICAgICAgICAgIGxldCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLmluZm8uZnVsbF9waWN0dXJlO1xyXG4gICAgICAgICAgICBpbWFnZS5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0taW1nJztcclxuICAgICAgICAgICAgcmV0dXJuIGltYWdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyVG8gKHBhcmVudCA6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FuRGlzcGxheSkge1xyXG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy52aWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB2aWV3ICgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCB2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgdmlldy5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tY29udGFpbmVyJztcclxuXHJcbiAgICAgICAgbGV0IGRhdGVWaWV3ID0gdGhpcy5jcmVhdGVEYXRlVmlldygpO1xyXG4gICAgICAgIHZpZXcuYXBwZW5kQ2hpbGQoZGF0ZVZpZXcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBjb250ZW50VmlldyA9IHRoaXMuY3JlYXRlQ29udGVudFZpZXcoKTtcclxuICAgICAgICB2aWV3LmFwcGVuZENoaWxkKGNvbnRlbnRWaWV3KTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNyZWF0ZUNvbnRlbnRWaWV3ICgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGxldCBjb250ZW50Q29udGFpbmVyIDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBjb250ZW50Q29udGFpbmVyLmNsYXNzTmFtZSA9ICdyZW4tY29udGVudC1pdGVtLWNvbnRhaW5lcic7XHJcblxyXG4gICAgICAgIGxldCBuZXdzRmVlZENvbnRlbnRDb250YWluZXIgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIG5ld3NGZWVkQ29udGVudENvbnRhaW5lci5jbGFzc05hbWUgPSAncmVuLW5ld3NmZWVkLWl0ZW0tY29udGVudC1jb250YWluZXInO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGxldCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XHJcbiAgICAgICAgICAgIHRpdGxlLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS10aXRsZSc7XHJcblxyXG4gICAgICAgICAgICBsZXQgZmlyc3RTZW50ZW5jZSA9IHRoaXMubWVzc2FnZS5tYXRjaChmaXJzdFNlbnRlbmNlUmVnZXgpIHx8IHRoaXMubWVzc2FnZS5tYXRjaChmaXJzdFNlbnRlbmNlQmVmb3JlTmV3bGluZVJlZ2V4KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmaXJzdFNlbnRlbmNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZS5pbm5lckhUTUwgPSBmaXJzdFNlbnRlbmNlLm1hcChmdW5jdGlvbihzKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCcnKTtcclxuICAgICAgICAgICAgICAgIH0pWzBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5ld3NGZWVkQ29udGVudENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aXRsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwaWN0dXJlID0gdGhpcy5waWN0dXJlO1xyXG4gICAgICAgIGlmIChwaWN0dXJlKSB7XHJcbiAgICAgICAgICAgIG5ld3NGZWVkQ29udGVudENvbnRhaW5lci5hcHBlbmRDaGlsZChwaWN0dXJlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgIG1lc3NhZ2UuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLXRleHQnO1xyXG4gICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9IHRoaXMubWVzc2FnZSAmJiBsaW5raWZ5KHRoaXMubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIG5ld3NGZWVkQ29udGVudENvbnRhaW5lci5hcHBlbmRDaGlsZChtZXNzYWdlKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBjb250ZW50Q29udGFpbmVyLmFwcGVuZENoaWxkKG5ld3NGZWVkQ29udGVudENvbnRhaW5lcik7XHJcbiAgICAgICAgcmV0dXJuIGNvbnRlbnRDb250YWluZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVEYXRlVmlldyAoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBsZXQgZGF0ZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGRhdGVDb250YWluZXIuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWRhdGUtY29udGFpbmVyJztcclxuXHJcbiAgICAgICAgbGV0IGRhdGVEYXlMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gxJyk7XHJcbiAgICAgICAgZGF0ZURheUxhYmVsLmNsYXNzTmFtZSA9ICdyZW4tbmV3c2ZlZWQtaXRlbS1kYXRlLWRheSc7XHJcbiAgICAgICAgZGF0ZURheUxhYmVsLmlubmVyVGV4dCA9ICcnK3RoaXMuY3JlYXRlZC5nZXREYXRlKCk7XHJcbiAgICAgICAgZGF0ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChkYXRlRGF5TGFiZWwpO1xyXG5cclxuICAgICAgICBsZXQgZGF0ZU1vbnRoWWVhckxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDYnKTtcclxuICAgICAgICBkYXRlTW9udGhZZWFyTGFiZWwuY2xhc3NOYW1lID0gJ3Jlbi1uZXdzZmVlZC1pdGVtLWRhdGUtbW9udGgteWVhcic7XHJcbiAgICAgICAgZGF0ZU1vbnRoWWVhckxhYmVsLmlubmVyVGV4dCA9IG1vbnRoc1t0aGlzLmNyZWF0ZWQuZ2V0TW9udGgoKV0gKyAnICcgKyB0aGlzLmNyZWF0ZWQuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICBkYXRlQ29udGFpbmVyLmFwcGVuZENoaWxkKGRhdGVNb250aFllYXJMYWJlbCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkYXRlQ29udGFpbmVyO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBtb250aHMgOiBzdHJpbmdbXSA9IFtcclxuICAgICdKYW4nLCAnRmViJywgJ01hYScsICdBcHInLCAnTWVpJywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPa3QnLCAnTm92JywgJ0RlYydcclxuXTtcclxuXHJcbmNvbnN0IGZpcnN0U2VudGVuY2VSZWdleCA6IFJlZ0V4cCA9IC9eLio/W1xcLiFcXD9dKD86XFxzfCQpL2c7XHJcbmNvbnN0IGZpcnN0U2VudGVuY2VCZWZvcmVOZXdsaW5lUmVnZXggOiBSZWdFeHAgPSAvXi4qP1tcXG5dKD86XFxzfCQpL2c7IiwiaW1wb3J0IHtGQlJlc3BvbnNlfSBmcm9tIFwiLi9JRkJSZXNwb25zZVwiO1xyXG5pbXBvcnQge0xvYWRhYmxlfSBmcm9tIFwiLi4vTG9hZGFibGVcIjtcclxuaW1wb3J0IHtTY3JpcHRUYWd9IGZyb20gXCIuLi9saWJyYXJ5L1NjcmlwdFRhZ1wiO1xyXG5cclxuY29uc3QgcHJveHlVUkwgPSAnaHR0cHM6Ly9yZW5zZWN1cml0eXByb3h5LXNhbWdpZWxpcy5yaGNsb3VkLmNvbS8nO1xyXG5leHBvcnQgY29uc3QgRkJfUEFHRV9JRCA6IHN0cmluZyA9IFwiMjE1NDcwMzQxOTA5OTM3XCI7XHJcblxyXG5pbnRlcmZhY2UgSUZhY2Vib29rU0RLIHtcclxuICAgIGluaXQgOiBhbnk7XHJcbiAgICBhcGkgKGdyYXBocGF0aCA6IHN0cmluZywgY2FsbGJhY2sgOiAocmVzcG9uc2UgOiBGQlJlc3BvbnNlKSA9PiBhbnkpIDogdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rUHJveHkge1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZmVlZCAgKHN1Y2MgOiAoaW5mbyA6IEZCUmVzcG9uc2UpID0+IHZvaWQsIGZhaWw/IDogKCkgPT4gdm9pZCkgOiB2b2lkIHtcclxuICAgICAgICBGYWNlYm9va1Byb3h5LmdldCgnZmVlZCcsIHN1Y2MsIGZhaWwpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgb3BlbmluZ2hvdXJzICAoc3VjYyA6IChpbmZvIDogRkJSZXNwb25zZSkgPT4gdm9pZCwgZmFpbD8gOiAoKSA9PiB2b2lkKSA6IHZvaWQge1xyXG4gICAgICAgIEZhY2Vib29rUHJveHkuZ2V0KCdvcGVuaW5naG91cnMnLCBzdWNjLCBmYWlsKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0ICh1cmwgOiBzdHJpbmcsIHN1Y2MgOiAoaW5mbyA6IEZCUmVzcG9uc2UpID0+IHZvaWQsIGZhaWw/IDogKCkgPT4gdm9pZCkgOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIHhoci5vcGVuKCdnZXQnLCBwcm94eVVSTCArIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XHJcbiAgICAgICAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBzdWNjKHhoci5yZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoZmFpbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZhaWwoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSBmYWlsO1xyXG4gICAgICAgICAgICB4aHIuc2VuZCgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYoZmFpbCkge1xyXG4gICAgICAgICAgICAgICAgZmFpbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtGQlBvc3RSZXNwb25zZX0gZnJvbSBcIi4vSUZCUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtGQl9QQUdFX0lEfSBmcm9tIFwiLi9GYWNlYm9va1Byb3h5XCI7XHJcblxyXG5leHBvcnQgY29uc3QgbWFudWFsRmFjZWJvb2tGZWVkOiBGQlBvc3RSZXNwb25zZVtdID0gW1xyXG4gICAgbWFudWFsRmFjZWJvb2tQb3N0SW1wb3J0KFxyXG4gICAgICAgICdOb2cgc25lbCDDqcOpbiB2YW4gZGUgMjAwIGdlbGltaXRlZXJkZSBTVVBFUlRSQUMgVUxUUkEgUkMgc2Nob2VuZW4gaW4gZGUgd2FjaHQgc2xlcGVuPyBSZW4gU3BvcnQgaGVscHQgamUgZ3JhYWcgdmVyZGVyLicsXHJcbiAgICAgICAgJzIwMTgvMDgvMjQnLFxyXG4gICAgICAgICdodHRwczovL3Njb250ZW50LWJydTItMS54eC5mYmNkbi5uZXQvdi90MS4wLTkvMzk5NDcyMjRfNzk2NzA1NzUzNzg2MzkwXzgwNDA2MjY2NDg3MTE2OTIyODhfbi5wbmc/X25jX2NhdD0wJm9oPTI0MTc5YWZhZTZmM2QyMDAyNzllODI3ZDFhYzYxOTZhJm9lPTVDMzBBRDIxJ1xyXG4gICAgKSxcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnTlUgYmlqIFJlbiBTcG9ydC4gRGUgbmlldXdlIE1penVubyBXYXZlIFVsdGltYSAxMCDigJMgVENTIEFtc3RlcmRhbSBNYXJhdGhvbiBlZGl0aWUuJyxcclxuICAgICAgICAnMjAxOC8wOC8xNycsXHJcbiAgICAgICAgJ2h0dHBzOi8vc2NvbnRlbnQtYnJ1Mi0xLnh4LmZiY2RuLm5ldC92L3QxLjAtOS8zOTQ1MzkwNV83ODgwNTIwNjQ2NTE3NTlfNzg3MDIxNzkwNzA3MjkyNTY5Nl9uLmpwZz9fbmNfY2F0PTAmb2g9ZDFhYjhmZjI2MDA4ZjIxZTI1MmI3NmU5YWM0OGVhYWMmb2U9NUMwNjIwNTYnXHJcbiAgICApLFxyXG4gICAgbWFudWFsRmFjZWJvb2tQb3N0SW1wb3J0KFxyXG4gICAgICAgICdCZXN0ZSBrbGFudGVuLCBtYWFuZGFnIDEzLCBkaW5zZGFnIDE0IGVuIHdvZW5zZGFnIDE1IGF1Z3VzdHVzIHppam4gd2UgZ2VzbG90ZW4uIERvbmRlcmRhZyB6aWpuIHdlIHRlcnVnIG9wZW4uIEdlbmlldCB2YW4ganVsbGllIG1vb2kgZW4gc3BvcnRpZWYgd2Vla2VuZC7vv73vv73vv73vv73vv73vv73igI3imYLvuI/vv73vv73igI3imYDvuI/vv73vv73vv73vv73igI3imYLvuI/vv73vv73igI3imYLvuI/vv73vv73igI3imYDvuI8uIO+/ve+/vScsXHJcbiAgICAgICAgJzIwMTgvMDgvMTEnLFxyXG4gICAgICAgICdodHRwczovL3Njb250ZW50LWJydTItMS54eC5mYmNkbi5uZXQvdi90MS4wLTkvMzg5MjYyNjVfNzgwMDY4NTYyMTE2Nzc2Xzg3ODc0OTkxNTM0MjU5NTY4NjRfbi5qcGc/X25jX2NhdD0wJm9oPTMxODdmOWZjMDA5ZmVjOTE0NWMwMjhhNmUyYmY2NTY3Jm9lPTVDMERCOUQ5J1xyXG4gICAgKSxcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnS25hcCBwb2RpdW0gU3RlZmZhbiBWYW5kZXJsaW5kZW4uIEZvdG8gdmFuIGRlIGJvc3ZyaWVuZGVuLicsXHJcbiAgICAgICAgJzIwMTgvMDgvMDQnLFxyXG4gICAgICAgICdodHRwczovL3Njb250ZW50LWJydTItMS54eC5mYmNkbi5uZXQvdi90MS4wLTkvMzg1Mjg2NDdfNzcwMzE4Njk2NDI1MDk2XzMyODEzMzI4NjQ5OTc2NTQ1Mjhfbi5wbmc/X25jX2NhdD0wJm9oPWY0YzJlODdkODY2NjhlNWRlOGEzZGM2MjI4ZjIzOWQ5Jm9lPTVCRkE2OUIyJ1xyXG4gICAgKSxcclxuICAgIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChcclxuICAgICAgICAnRGlra2UgcHJvZmljaWF0IHZvb3Igb256ZSByb2RlIGR1aXZlbHMgdmFuIGhldCBSZW4gU3BvcnQgdGVhbS4nLFxyXG4gICAgICAgICcyMDE4LzA3LzA3JyxcclxuICAgICAgICAnaHR0cHM6Ly9zY29udGVudC1icnUyLTEueHguZmJjZG4ubmV0L3YvdDEuMC05LzM2NzcwNjQ2XzczNzg1MTcxNjMzODQ2MV8yMTE2OTc3MjUxMjEwNzU2MDk2X24uanBnP19uY19jYXQ9MCZvaD03YWY4NDQ1MzY4ZGEzYWFmOGJmM2NlZThhMzRhYjAwNiZvZT01QkRDNzFCRidcclxuICAgICksXHJcbiAgICBtYW51YWxGYWNlYm9va1Bvc3RJbXBvcnQoXHJcbiAgICAgICAgJ0hlZWwgd2FybSB3ZWVyLCB2ZWVsIGRyaW5rZW4hISFcXG4nICtcclxuICAgICAgICAnV2F0IGRyaW5rZW4gdm9vciBlbiBuYSBlZW4gdHJhaW5pbmcvIHdlZHN0cmlqZD9cXG4nICtcclxuICAgICAgICAnTklFVVcgYmlqIFJlbiBTcG9ydCBpcyBPVkVSU1RJTVMuXFxuJyArXHJcbiAgICAgICAgJ0VlbiBpZGVhYWwgdm9vcmRlZWxwYWtrZXQgdm9vciBkZSBtYXJhdGhvbmxvcGVycywgbWV0IGV4dHJhIGVlbiBiYW5kIHZvb3IgdSBudW1tZXIgZW4gamUgZW5lcmdpZWdlbHMgdm9vciBvbmRlcndlZy4nLFxyXG4gICAgICAgICcyMDE4LzA3LzA0JyxcclxuICAgICAgICAnaHR0cHM6Ly9zY29udGVudC1icnUyLTEueHguZmJjZG4ubmV0L3YvdDEuMC05LzM2NjgyNjEzXzczNDgwMDcxOTk3Njg5NF80OTc1NTU5MDY2NTM4NDc1NTJfbi5qcGc/X25jX2NhdD0wJm9oPWU4N2VjYWM1ZDNlM2ZiOTU3MTJlYzI1YTlhYzRmYmI4Jm9lPTVCRDM2M0FFJ1xyXG4gICAgKS8qLFxyXG4gICAgbWFudWFsRmFjZWJvb2tQb3N0SW1wb3J0KFxyXG4gICAgICAgICdNZXNzYWxpbmEgUGllcm9uaSwgbW9vaSBhcnRpa2VsIGVuIG1vb2kgZm90b+KAmXMuJyxcclxuICAgICAgICAnMjAxOC8wNy8wMycsXHJcbiAgICAgICAgJ2h0dHBzOi8vc2NvbnRlbnQtYnJ1Mi0xLnh4LmZiY2RuLm5ldC92L3QxLjAtOS8zNjUzMTA5NF83MzM0MzUxMTY3ODAxMjFfMTkzOTgyMTgxMTczNDY3NTQ1Nl9uLmpwZz9fbmNfY2F0PTAmb2g9NmM3YjUzMTQ4MjJkYzk0M2Y4Yjg2ZjY3Y2Y0ODc3ZTcmb2U9NUJERTRGQTMnXHJcbiAgICApKi9cclxuXTtcclxuXHJcbmZ1bmN0aW9uIG1hbnVhbEZhY2Vib29rUG9zdEltcG9ydChtZXNzYWdlOiBzdHJpbmcsIGRhdGU6IHN0cmluZywgcGljdHVyZTogc3RyaW5nKTogRkJQb3N0UmVzcG9uc2Uge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjcmVhdGVkX3RpbWU6IGRhdGUsXHJcbiAgICAgICAgZnVsbF9waWN0dXJlOiBwaWN0dXJlLFxyXG4gICAgICAgIGlkOiAnaWQnLFxyXG4gICAgICAgIGlzX2hpZGRlbjogZmFsc2UsXHJcbiAgICAgICAgaXNfcHVibGlzaGVkOiB0cnVlLFxyXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbiAgICAgICAgZnJvbToge1xyXG4gICAgICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICAgICAgaWQ6IEZCX1BBR0VfSUQsXHJcbiAgICAgICAgICAgIGVycm9yOiAnJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXJyb3I6ICcnXHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgU1RBTkRBUkRfT1BFTklOR19IT1VSUyA9IHtcclxuICAgIGhvdXJzOiB7XHJcbiAgICAgICAgXCJtb25fMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJtb25fMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJtb25fM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJtb25fNFwiOiBcIjE4OjMwXCIsXHJcbiAgICAgICAgXCJ3ZWRfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJ3ZWRfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJ3ZWRfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJ3ZWRfNFwiOiBcIjE4OjMwXCIsXHJcbiAgICAgICAgXCJ0aHVfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJ0aHVfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJ0aHVfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJ0aHVfNFwiOiBcIjE4OjMwXCIsXHJcbiAgICAgICAgXCJmcmlfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJmcmlfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJmcmlfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJmcmlfNFwiOiBcIjE5OjAwXCIsXHJcbiAgICAgICAgXCJzYXRfMVwiOiBcIjA5OjMwXCIsXHJcbiAgICAgICAgXCJzYXRfMlwiOiBcIjEyOjMwXCIsXHJcbiAgICAgICAgXCJzYXRfM1wiOiBcIjEzOjMwXCIsXHJcbiAgICAgICAgXCJzYXRfNFwiOiBcIjE4OjMwXCJcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBFWENFUFRJT05BTF9PUEVOSU5HX0hPVVJTID0ge1xyXG4gICAgaG91cnM6IHtcclxuICAgICAgICBcInRodV8xXCI6IFwiMDk6MzBcIixcclxuICAgICAgICBcInRodV8yXCI6IFwiMTI6MzBcIixcclxuICAgICAgICBcInRodV8zXCI6IFwiMTM6MzBcIixcclxuICAgICAgICBcInRodV80XCI6IFwiMTg6MzBcIixcclxuICAgICAgICBcImZyaV8xXCI6IFwiMDk6MzBcIixcclxuICAgICAgICBcImZyaV8yXCI6IFwiMTI6MzBcIixcclxuICAgICAgICBcImZyaV8zXCI6IFwiMTM6MzBcIixcclxuICAgICAgICBcImZyaV80XCI6IFwiMTk6MDBcIixcclxuICAgICAgICBcInNhdF8xXCI6IFwiMDk6MzBcIixcclxuICAgICAgICBcInNhdF8yXCI6IFwiMTI6MzBcIixcclxuICAgICAgICBcInNhdF8zXCI6IFwiMTM6MzBcIixcclxuICAgICAgICBcInNhdF80XCI6IFwiMTg6MzBcIlxyXG4gICAgfVxyXG59OyIsImV4cG9ydCBmdW5jdGlvbiBwYXJzZUpTT04gKGpzb24gOiBzdHJpbmcpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IHBhcnNlZE9iamVjdCA9IEpTT04ucGFyc2UoanNvbik7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZE9iamVjdDtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkOyAgIFxyXG4gICAgfVxyXG59IiwiZXhwb3J0IGZ1bmN0aW9uIGxpbmtpZnkgKGlucHV0VGV4dCA6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgdmFyIHJlcGxhY2VkVGV4dCA6IHN0cmluZyxcclxuICAgICAgICByZXBsYWNlUGF0dGVybjEgOiBSZWdFeHAsIHJlcGxhY2VQYXR0ZXJuMiA6IFJlZ0V4cCwgcmVwbGFjZVBhdHRlcm4zIDogUmVnRXhwO1xyXG5cclxuICAgIC8vVVJMcyBzdGFydGluZyB3aXRoIGh0dHA6Ly8sIGh0dHBzOi8vLCBvciBmdHA6Ly9cclxuICAgIHJlcGxhY2VQYXR0ZXJuMSA9IC8oXFxiKGh0dHBzP3xmdHApOlxcL1xcL1stQS1aMC05KyZAI1xcLyU/PX5ffCE6LC47XSpbLUEtWjAtOSsmQCNcXC8lPX5ffF0pL2dpbTtcclxuICAgIHJlcGxhY2VkVGV4dCA9IGlucHV0VGV4dC5yZXBsYWNlKHJlcGxhY2VQYXR0ZXJuMSwgJzxhIGhyZWY9XCIkMVwiIHRhcmdldD1cIl9ibGFua1wiPiQxPC9hPicpO1xyXG5cclxuICAgIC8vVVJMcyBzdGFydGluZyB3aXRoIFwid3d3LlwiICh3aXRob3V0IC8vIGJlZm9yZSBpdCwgb3IgaXQnZCByZS1saW5rIHRoZSBvbmVzIGRvbmUgYWJvdmUpLlxyXG4gICAgcmVwbGFjZVBhdHRlcm4yID0gLyhefFteXFwvXSkod3d3XFwuW1xcU10rKFxcYnwkKSkvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gcmVwbGFjZWRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4yLCAnJDE8YSBocmVmPVwiaHR0cDovLyQyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JDI8L2E+Jyk7XHJcblxyXG4gICAgLy9DaGFuZ2UgZW1haWwgYWRkcmVzc2VzIHRvIG1haWx0bzo6IGxpbmtzLlxyXG4gICAgcmVwbGFjZVBhdHRlcm4zID0gLygoW2EtekEtWjAtOVxcLVxcX1xcLl0pK0BbYS16QS1aXFxfXSs/KFxcLlthLXpBLVpdezIsNn0pKykvZ2ltO1xyXG4gICAgcmVwbGFjZWRUZXh0ID0gcmVwbGFjZWRUZXh0LnJlcGxhY2UocmVwbGFjZVBhdHRlcm4zLCAnPGEgaHJlZj1cIm1haWx0bzokMVwiPiQxPC9hPicpO1xyXG5cclxuICAgIHJldHVybiByZXBsYWNlZFRleHQ7XHJcbn0iLCJpbXBvcnQge0ZhY2Vib29rT3BlbmluZ0luZm99IGZyb20gXCIuLi9mYWNlYm9va3BsdWdpbnMvRmFjZWJvb2tPcGVuaW5nSW5mb1wiO1xyXG5cclxuY29uc3QgZGF5cyA6IHN0cmluZ1tdID0gW1xyXG4gICAgJ21vbmRheScsICd0dWVzZGF5JywgJ3dlZG5lc2RheScsICd0aHVyc2RheScsICdmcmlkYXknLCAnc2F0dXJkYXknLCAnc3VuZGF5J1xyXG5dO1xyXG5cclxuY29uc3QgZGF5c1RyYW5zbGF0aW9uIDoge1tkYXkgOiBzdHJpbmddIDogc3RyaW5nfSA9IHtcclxuICAgICdtb25kYXknIDogJ00uJyxcclxuICAgICd0dWVzZGF5JyA6ICdELicsXHJcbiAgICAnd2VkbmVzZGF5JyA6ICdXLicsXHJcbiAgICAndGh1cnNkYXknIDogJ0QuJyxcclxuICAgICdmcmlkYXknIDogJ1YuJyxcclxuICAgICdzYXR1cmRheScgOiAnWi4nLFxyXG4gICAgJ3N1bmRheScgOiAnWi4nXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyT3BlbmluZ0luZm8gKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbywgcm9vdCA6IEhUTUxFbGVtZW50KSA6IHZvaWQge1xyXG4gICAgaWYgKCFyb290KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgdHlwZSA9IHJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLXZpZXd0eXBlJyk7XHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlICdtb2Rlc3QnIDpcclxuICAgICAgICAgICAgcmVuZGVyTW9kZXN0T3BlbmluZ0luZm9WaWV3KG9wZW5pbmdJbmZvLCByb290KTtcclxuICAgIH1cclxuICAgIC8qbGV0IHJvb3QgOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZm9yIChsZXQgZGF5IG9mIGRheXMpIHtcclxuICAgICAgICBsZXQgZGF5dmlldyA9IGRheVZpZXcoZGF5LCAoPGFueT5vcGVuaW5nSW5mbylbZGF5XSk7XHJcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIH1cclxuICAgIHJvb3QuYXBwZW5kQ2hpbGQoY3VycmVudGx5T3BlblZpZXcob3BlbmluZ0luZm8uaXNDdXJyZW50bHlPcGVuKSk7XHJcbiAgICByZXR1cm4gcm9vdDsqL1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJNb2Rlc3RPcGVuaW5nSW5mb1ZpZXcgKG9wZW5pbmdJbmZvIDogRmFjZWJvb2tPcGVuaW5nSW5mbywgcm9vdCA6IEhUTUxFbGVtZW50KSA6IHZvaWQge1xyXG4gICAgcm9vdC5hcHBlbmRDaGlsZChtb2Rlc3RXZWVrVmlldyhvcGVuaW5nSW5mbykpO1xyXG4gICAgcm9vdC5hcHBlbmRDaGlsZChtb2Rlc3RJc09wZW5JbmRpY2F0b3Iob3BlbmluZ0luZm8pKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbW9kZXN0SXNPcGVuSW5kaWNhdG9yIChvcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm8pIDogSFRNTEVsZW1lbnQge1xyXG4gICAgbGV0IGNvbnRhaW5lciA6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tbW9kZXN0LWluZGljYXRvcic7XHJcblxyXG4gICAgbGV0IGluZGljYXRvclRleHQgOiBIVE1MU3BhbkVsZW1lbnQ7XHJcbiAgICBpbmRpY2F0b3JUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgaW5kaWNhdG9yVGV4dC5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1tb2Rlc3QtaW5kaWNhdG9yLWxhYmVsJztcclxuXHJcbiAgICBsZXQgY29udGFjdE9wdGlvbnMgOiBBcnJheTxIVE1MRWxlbWVudD4gPSBbXTtcclxuICAgIGNvbnRhY3RPcHRpb25zLnB1c2gobW9kZXN0QWN0Tm93TGluaygnbWFpbHRvOmluZm9AcmVuc3BvcnQuYmUnLCAnZmEtZW52ZWxvcGUnKSk7XHJcblxyXG4gICAgc3dpdGNoIChvcGVuaW5nSW5mby5pc0N1cnJlbnRseU9wZW4pIHtcclxuICAgICAgICBjYXNlIHRydWUgOlxyXG4gICAgICAgICAgICBjb250YWluZXIuY2xhc3NOYW1lICs9ICcgcmVuLW9wZW5pbmdzdXJlbi1vcGVuJztcclxuICAgICAgICAgICAgaW5kaWNhdG9yVGV4dC5pbm5lclRleHQgPSAnTnUgb3BlbiEnO1xyXG4gICAgICAgICAgICBjb250YWN0T3B0aW9ucy5wdXNoKG1vZGVzdEFjdE5vd0xpbmsoJ3RlbDorMzIxMzY2NzQ2MCcsICdmYS1waG9uZScpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBmYWxzZSA6XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc05hbWUgKz0gJyByZW4tb3BlbmluZ3N1cmVuLWNsb3NlZCc7XHJcbiAgICAgICAgICAgIGluZGljYXRvclRleHQuaW5uZXJUZXh0ID0gJ0dlc2xvdGVuJztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGluZGljYXRvclRleHQpO1xyXG5cclxuICAgIGZvciAobGV0IGNvbnRhY3RPcHRpb24gb2YgY29udGFjdE9wdGlvbnMpIHtcclxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY29udGFjdE9wdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdFdlZWtWaWV3IChvcGVuaW5nSW5mbyA6IEZhY2Vib29rT3BlbmluZ0luZm8pIDogSFRNTEVsZW1lbnQge1xyXG4gICAgbGV0IHRhYmxlIDogSFRNTFRhYmxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcblxyXG4gICAgaWYgKG9wZW5pbmdJbmZvLmlzQ3VycmVudGx5T3Blbikge1xyXG4gICAgICAgIHRhYmxlLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLW9wZW4nO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0YWJsZS5jbGFzc05hbWUgPSAncmVuLW9wZW5pbmdzdXJlbi1jbG9zZWQnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmb3IgKGxldCBkYXkgb2YgZGF5cykge1xyXG4gICAgICAgIGxldCBkYXl2aWV3IDogSFRNTFRhYmxlUm93RWxlbWVudCA9IG1vZGVzdERheVZpZXcoZGF5LCAoPGFueT5vcGVuaW5nSW5mbylbZGF5XSk7XHJcbiAgICAgICAgdGFibGUuYXBwZW5kQ2hpbGQoZGF5dmlldyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhYmxlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3REYXlWaWV3IChkYXkgOiBzdHJpbmcsIGhvdXJzIDogc3RyaW5nW10pIDogSFRNTFRhYmxlUm93RWxlbWVudCB7XHJcbiAgICBsZXQgdGFibGVSb3cgOiBIVE1MVGFibGVSb3dFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgIGlmIChkYXkgPT09IGRheXNbbmV3IERhdGUoKS5nZXREYXkoKSAtIDFdKSB7XHJcbiAgICAgICAgdGFibGVSb3cuY2xhc3NOYW1lID0gJ3Jlbi1vcGVuaW5nc3VyZW4tY3VycmVudGRheSc7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRheXZpZXcgOiBIVE1MVGFibGVEYXRhQ2VsbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpLFxyXG4gICAgICAgIGhvdXJ2aWV3IDogSFRNTFRhYmxlRGF0YUNlbGxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICBkYXl2aWV3LmlubmVyVGV4dCA9IGRheXNUcmFuc2xhdGlvbltkYXldO1xyXG4gICAgaG91cnZpZXcuaW5uZXJUZXh0ID0gbW9kZXN0SG91clZpZXcoaG91cnMpO1xyXG5cclxuXHJcbiAgICB0YWJsZVJvdy5hcHBlbmRDaGlsZChkYXl2aWV3KTtcclxuICAgIHRhYmxlUm93LmFwcGVuZENoaWxkKGhvdXJ2aWV3KTtcclxuXHJcbiAgICByZXR1cm4gdGFibGVSb3c7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vZGVzdEhvdXJWaWV3IChob3VycyA6IHN0cmluZ1tdKSA6IHN0cmluZyB7XHJcbiAgICBsZXQgaG91cnZpZXcgPSAnJztcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaG91cnMubGVuZ3RoOyBpKz0yKSB7XHJcbiAgICAgICAgaG91cnZpZXcgKz0gaG91cnNbaV0gKyAnIC0gJyArIGhvdXJzW2krMV07XHJcbiAgICAgICAgaWYgKGkrMSAhPSBob3Vycy5sZW5ndGgtMSkge1xyXG4gICAgICAgICAgICBob3VydmlldyArPSAnLCAnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBob3VydmlldyB8fCAnR2VzbG90ZW4nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtb2Rlc3RBY3ROb3dMaW5rIChocmVmIDogc3RyaW5nLCBpY29uTmFtZSA6IHN0cmluZykgOiBIVE1MRWxlbWVudCB7XHJcblxyXG4gICAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICBhLmNsYXNzTmFtZSA9ICdyZW4tb3BlbmluZ3N1cmVuLWluZGljYXRvci1jdGEtbGluayc7XHJcbiAgICBhLmhyZWYgPSBocmVmO1xyXG5cclxuICAgIGxldCBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpO1xyXG4gICAgaWNvbi5jbGFzc05hbWUgPSAnZmEgJyArIGljb25OYW1lICsgJyBmYS1sZyc7XHJcblxyXG4gICAgYS5hcHBlbmRDaGlsZChpY29uKTtcclxuXHJcbiAgICByZXR1cm4gYTtcclxufSJdfQ==
