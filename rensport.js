!function (e) {
    var t = {};

    function n(r) {
        if (t[r]) return t[r].exports;
        var s = t[r] = {i: r, l: !1, exports: {}};
        return e[r].call(s.exports, s, s.exports, n), s.l = !0, s.exports
    }

    n.m = e, n.c = t, n.d = function (e, t, r) {
        n.o(e, t) || Object.defineProperty(e, t, {enumerable: !0, get: r})
    }, n.r = function (e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {value: "Module"}), Object.defineProperty(e, "__esModule", {value: !0})
    }, n.t = function (e, t) {
        if (1 & t && (e = n(e)), 8 & t) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var r = Object.create(null);
        if (n.r(r), Object.defineProperty(r, "default", {
            enumerable: !0,
            value: e
        }), 2 & t && "string" != typeof e) for (var s in e) n.d(r, s, function (t) {
            return e[t]
        }.bind(null, s));
        return r
    }, n.n = function (e) {
        var t = e && e.__esModule ? function () {
            return e.default
        } : function () {
            return e
        };
        return n.d(t, "a", t), t
    }, n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }, n.p = "", n(n.s = 4)
}([function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = "https://rensecurityproxy-samgielis.rhcloud.com/";
    t.FB_PAGE_ID = "215470341909937";

    class s {
        static feed(e, t) {
            s.get("feed", e, t)
        }

        static openinghours(e, t) {
            s.get("openinghours", e, t)
        }

        static get(e, t, n) {
            try {
                var s = new XMLHttpRequest;
                s.open("get", r + e, !0), s.responseType = "json", s.onload = function () {
                    200 == s.status ? t(s.response) : n && n()
                }, s.onerror = n, s.send()
            } catch (e) {
                n && n()
            }
        }
    }

    t.FacebookProxy = s
}, function (e, t) {
    e.exports = React
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    t.Loadable = class {
        constructor() {
            this._isLoaded = !1, this._loadFailed = !1, this._waitingForLoadSuccess = [], this._waitingForLoadFail = [], this.doLoad()
        }

        get isLoaded() {
            return this._isLoaded
        }

        get hasLoadFailed() {
            return this._loadFailed
        }

        afterLoad(e, t) {
            this.isLoaded ? e() : this.hasLoadFailed ? t && t() : (this._waitingForLoadSuccess.push(e), t && this._waitingForLoadFail.push(t))
        }

        loadSuccess() {
            this._isLoaded = !0;
            for (let e of this._waitingForLoadSuccess) e();
            this._waitingForLoadSuccess = []
        }

        loadFailed(e) {
            this._loadFailed = !0;
            for (let e of this._waitingForLoadFail) e();
            throw this._waitingForLoadFail = [], new Error("Loading failed : " + e)
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0}), t.parseJSON = function (e) {
        try {
            return JSON.parse(e)
        } catch (e) {
            return
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = n(5);
    window.RenSport = new r.Ren
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = n(6), s = n(8), a = n(12), o = n(13), i = n(1), l = n(15), c = n(16), d = n(17), u = n(21);
    t.Ren = class {
        constructor() {
            this._analyticsTracker = d.createAnalyticsTracker(), new u.NewsletterSubscriptionFormController(this._analyticsTracker);
            let e = window.RenSportConfig;
            e && e.loadHeader && this._loadHeader(e.context), this._loadFooter(), e && e.loadOpeningHours && (this._openingInfo = new r.FacebookOpeningInfo, this._openingInfo.afterLoad(() => {
                a.renderOpeningInfo(this._openingInfo, document.querySelector("#ren-openingsuren-hook"))
            })), e && e.loadNewsFeed && (this._feed = new s.FacebookFeed, this._feed.afterLoad(() => {
                this._feed.renderTo(document.querySelector(".ren-homepage-newsfeed"))
            }))
        }

        get feed() {
            return this._feed
        }

        _loadHeader(e) {
            document.addEventListener("DOMContentLoaded", () => {
                l.render(i.createElement(o.PageHeader, {activeContext: e}), document.getElementById("ren-header"))
            })
        }

        _loadFooter() {
            document.addEventListener("DOMContentLoaded", () => {
                l.render(i.createElement(c.PageFooter, null), document.getElementById("ren-footer"))
            })
        }

        get openingInfo() {
            return this._openingInfo
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = n(2), s = n(0), a = n(3), o = n(7);

    function i(e, t) {
        let n = e.split("_"), r = t.split("_");
        return parseInt(n[1]) < parseInt(r[1]) ? -1 : parseInt(n[1]) > parseInt(r[1]) ? 1 : "open" === n[2] ? -1 : 1
    }

    function l(e, t) {
        let n = [];
        for (let r of e) n.push(t.hours[r]);
        return n
    }

    function c(e, t) {
        let n = new Date, r = e.split(":"), s = new Date, a = parseInt(r[0]), o = parseInt(r[1]), i = t.split(":"),
            l = new Date, c = parseInt(i[0]), d = parseInt(i[1]);
        return s.setHours(a), s.setMinutes(o), l.setHours(c), l.setMinutes(d), n >= s && n < l
    }

    t.FacebookOpeningInfo = class extends r.Loadable {
        constructor() {
            super(...arguments), this.monday = [], this.tuesday = [], this.wednesday = [], this.thursday = [], this.friday = [], this.saturday = [], this.sunday = []
        }

        get isCurrentlyOpen() {
            let e = this[(t = (new Date).getDay(), 0 === t ? "sunday" : 1 === t ? "monday" : 2 === t ? "tuesday" : 3 === t ? "wednesday" : 4 === t ? "thursday" : 5 === t ? "friday" : 6 === t ? "saturday" : void 0)];
            var t;
            for (let t = 0; t < e.length; t += 2) if (c(e[t], e[t + 1])) return !0;
            return !1
        }

        doLoad() {
            s.FacebookProxy.openinghours(e => {
                e.error ? this.loadFailed(e.error) : (this.parseData(e), this.loadSuccess())
            }, () => {
                this.parseData(o.STANDARD_OPENING_HOURS), this.loadSuccess()
            })
        }

        parseData(e) {
            "string" == typeof e && (e = a.parseJSON(e)), this.monday = l(Object.keys(e.hours).filter(e => e.indexOf("mon") > -1).sort(i), e), this.tuesday = l(Object.keys(e.hours).filter(e => e.indexOf("tue") > -1).sort(i), e), this.wednesday = l(Object.keys(e.hours).filter(e => e.indexOf("wed") > -1).sort(i), e), this.thursday = l(Object.keys(e.hours).filter(e => e.indexOf("thu") > -1).sort(i), e), this.friday = l(Object.keys(e.hours).filter(e => e.indexOf("fri") > -1).sort(i), e), this.saturday = l(Object.keys(e.hours).filter(e => e.indexOf("sat") > -1).sort(i), e), this.sunday = l(Object.keys(e.hours).filter(e => e.indexOf("sun") > -1).sort(i), e)
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0}), t.STANDARD_OPENING_HOURS = {
        hours: {
            mon_1: "09:30",
            mon_2: "12:30",
            mon_3: "13:30",
            mon_4: "18:00",
            wed_1: "09:30",
            wed_2: "12:30",
            wed_3: "13:30",
            wed_4: "18:00",
            thu_1: "09:30",
            thu_2: "12:30",
            thu_3: "13:30",
            thu_4: "18:00",
            fri_1: "09:30",
            fri_2: "12:30",
            fri_3: "13:30",
            fri_4: "18:00",
            sat_1: "09:30",
            sat_2: "18:00"
        }
    }, t.EXCEPTIONAL_OPENING_HOURS = {
        hours: {
            thu_1: "09:30",
            thu_2: "12:30",
            thu_3: "13:30",
            thu_4: "18:30",
            fri_1: "09:30",
            fri_2: "12:30",
            fri_3: "13:30",
            fri_4: "19:00",
            sat_1: "09:30",
            sat_2: "12:30",
            sat_3: "13:30",
            sat_4: "18:30"
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = n(2), s = n(0), a = n(9), o = n(3), i = n(11);
    t.FacebookFeed = class extends r.Loadable {
        constructor() {
            super(), this._posts = []
        }

        get posts() {
            return this._posts
        }

        doLoad() {
            s.FacebookProxy.feed(e => {
                !e.error && e.feed && e.feed.data ? this.addPostsFromResponse(e.feed.data) : !e.error && o.parseJSON(e) && o.parseJSON(e).feed && o.parseJSON(e).feed.data ? this.addPostsFromResponse(o.parseJSON(e.feed.data)) : this.addPostsFromResponse(i.manualFacebookFeed)
            }, () => {
                this.addPostsFromResponse(i.manualFacebookFeed)
            })
        }

        addPostsFromResponse(e) {
            for (let t of e) this._posts.push(new a.FacebookPost(t));
            this.loadSuccess()
        }

        get view() {
            let e = [];
            for (let t = 0, n = 0; n < Math.min(this.posts.length, 5); t++) {
                let r = this.posts[t];
                r.canDisplay && (e.push(r.view), n++)
            }
            return e
        }

        renderTo(e) {
            for (let t of this.view) e.appendChild(t)
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = n(0), s = n(10);
    t.FacebookPost = class {
        constructor(e) {
            this.info = e
        }

        get canDisplay() {
            return !this.info.is_hidden && this.info.is_published && this.info.from && this.info.from.id === r.FB_PAGE_ID && !!this.message
        }

        get created() {
            return new Date(this.info.created_time.split("+")[0])
        }

        get id() {
            return this.info.id
        }

        get message() {
            return this.info.message
        }

        get picture() {
            if (this.info.full_picture) {
                let e = document.createElement("img");
                return e.src = this.info.full_picture, e.className = "ren-newsfeed-item-img", e
            }
            return null
        }

        renderTo(e) {
            this.canDisplay && e.appendChild(this.view)
        }

        get view() {
            let e = document.createElement("div");
            e.className = "ren-newsfeed-item-container";
            let t = this.createDateView();
            e.appendChild(t);
            let n = this.createContentView();
            return e.appendChild(n), e
        }

        createContentView() {
            let e = document.createElement("div");
            e.className = "ren-content-item-container";
            let t = document.createElement("div");
            if (t.className = "ren-newsfeed-item-content-container", this.message) {
                let e = document.createElement("h2");
                e.className = "ren-newsfeed-item-title";
                let n = this.message.match(o) || this.message.match(i);
                n && (e.innerHTML = n.map(function (e) {
                    return e.replace(/^\s+|\s+$/g, "")
                })[0]), t.appendChild(e)
            }
            let n = this.picture;
            if (n && t.appendChild(n), this.message) {
                let e = document.createElement("p");
                e.className = "ren-newsfeed-item-text", e.innerHTML = this.message && s.linkify(this.message), t.appendChild(e)
            }
            return e.appendChild(t), e
        }

        createDateView() {
            let e = document.createElement("div");
            e.className = "ren-newsfeed-item-date-container";
            let t = document.createElement("h1");
            t.className = "ren-newsfeed-item-date-day", t.innerText = "" + this.created.getDate(), e.appendChild(t);
            let n = document.createElement("h6");
            return n.className = "ren-newsfeed-item-date-month-year", n.innerText = a[this.created.getMonth()] + " " + this.created.getFullYear(), e.appendChild(n), e
        }
    };
    const a = ["Jan", "Feb", "Maa", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
        o = /^.*?[\.!\?](?:\s|$)/g, i = /^.*?[\n](?:\s|$)/g
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0}), t.linkify = function (e) {
        var t, n, r;
        return t = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim, n = /(^|[^\/])(www\.[\S]+(\b|$))/gim, r = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim, e.replace(t, '<a href="$1" target="_blank">$1</a>').replace(n, '$1<a href="http://$2" target="_blank">$2</a>').replace(r, '<a href="mailto:$1">$1</a>')
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = n(0);

    function s(e, t, n) {
        return {
            created_time: t,
            full_picture: n,
            id: "id",
            is_hidden: !1,
            is_published: !0,
            message: e,
            from: {name: "", id: r.FB_PAGE_ID, error: ""},
            error: ""
        }
    }

    t.manualFacebookFeed = [s("Marathon ready met de Polar Vantage M. De Vantage M limited edition is vanaf nu bij ons te verkrijgen. Je ontvangt een gratis polsband bij je aankoop.", "2019/03/20", "/img/vantagem.png"), s("Onze Online Outlet Shop opent binnenkort! Ontdek meer op shop.rensport.be", "2019/03/15", "/img/shop_preview.PNG"), s("20% korting op interclub outfits! Nu bij Ren: 20% korting bij elke aankoop van minstens 2 tennis outfits voor Interclub teams.", "2019/03/10", "/img/headers/duo_interclub.jpg")]
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        s = {monday: "M.", tuesday: "D.", wednesday: "W.", thursday: "D.", friday: "V.", saturday: "Z.", sunday: "Z."};

    function a(e, t) {
        let n = document.createElement("tr");
        e === r[(new Date).getDay() - 1] && (n.className = "ren-openingsuren-currentday");
        let a = document.createElement("th"), o = document.createElement("td");
        return a.innerText = s[e], o.innerText = function (e) {
            let t = "";
            for (let n = 0; n < e.length; n += 2) t += e[n] + " - " + e[n + 1], n + 1 != e.length - 1 && (t += ", ");
            return t || "Gesloten"
        }(t), n.appendChild(a), n.appendChild(o), n
    }

    function o(e, t) {
        let n = document.createElement("a");
        n.className = "ren-openingsuren-indicator-cta-link", n.href = e;
        let r = document.createElement("i");
        return r.className = "fa " + t + " fa-lg", n.appendChild(r), n
    }

    t.renderOpeningInfo = function (e, t) {
        if (!t) return;
        switch (t.getAttribute("data-viewtype")) {
            case"modest":
                !function (e, t) {
                    t.appendChild(function (e) {
                        let t = document.createElement("table");
                        e.isCurrentlyOpen ? t.className = "ren-openingsuren-open" : t.className = "ren-openingsuren-closed";
                        for (let n of r) {
                            let r = a(n, e[n]);
                            t.appendChild(r)
                        }
                        return t
                    }(e)), t.appendChild(function (e) {
                        let t, n = document.createElement("div");
                        n.className = "ren-openingsuren-modest-indicator", (t = document.createElement("span")).className = "ren-openingsuren-modest-indicator-label";
                        let r = [];
                        switch (r.push(o("mailto:info@rensport.be", "fa-envelope")), e.isCurrentlyOpen) {
                            case!0:
                                n.className += " ren-openingsuren-open", t.innerText = "Nu open!", r.push(o("tel:+3213667460", "fa-phone"));
                                break;
                            case!1:
                                n.className += " ren-openingsuren-closed", t.innerText = "Gesloten"
                        }
                        n.appendChild(t);
                        for (let e of r) n.appendChild(e);
                        return n
                    }(e))
                }(e, t)
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = n(1), s = n(14);
    t.PageHeader = class extends r.Component {
        render() {
            return r.createElement("div", null, r.createElement(a, null), r.createElement(s.Navbar, {activeContext: this.props.activeContext}))
        }
    };

    class a extends r.Component {
        render() {
            return r.createElement("div", {className: "row ren-main-logo-container"}, r.createElement("div", {className: "col-md-12"}, r.createElement("img", {
                className: "ren-main-logo-img",
                src: "/img/logo.png"
            })))
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = n(1);
    t.Navbar = class extends r.Component {
        render() {
            return r.createElement("nav", {className: "navbar ren-black-background"}, r.createElement("div", {className: "container-fluid ren-navbar-container"}, r.createElement("div", {className: "navbar-header"}, r.createElement(s, null)), r.createElement("div", {
                className: "collapse navbar-collapse",
                id: "bs-example-navbar-collapse-1"
            }, r.createElement("ul", {className: "nav navbar-nav"}, r.createElement(a, {
                title: "Home",
                link: "/",
                active: "home" === this.props.activeContext
            }), r.createElement(a, {
                title: "Sportvoeding",
                link: "/sportvoeding",
                tooltip: "Ontdek ons assortiment sportvoeding",
                active: "sportvoeding" === this.props.activeContext
            }), r.createElement(a, {
                title: "Merken",
                link: "/merken",
                tooltip: "Ontdek al onze merken",
                active: "merken" === this.props.activeContext
            }), r.createElement(a, {
                title: "Outlet shop",
                link: "//shop.rensport.be",
                tooltip: "Ontdek onze nieuwe Online Outlet Shop",
                active: "shop" === this.props.activeContext,
                emphasis: !0
            }), r.createElement(a, {
                title: "Contact",
                link: "/contact",
                tooltip: "Contacteer ons",
                active: "contact" === this.props.activeContext
            })), r.createElement(o, null))))
        }
    };

    class s extends r.Component {
        render() {
            return r.createElement("button", {
                type: "button",
                className: "navbar-toggle collapsed",
                "data-toggle": "collapse",
                "data-target": "#bs-example-navbar-collapse-1",
                "aria-expanded": "false"
            }, r.createElement("span", {className: "sr-only"}, "Toggle navigation"), r.createElement("span", {className: "icon-bar"}), r.createElement("span", {className: "icon-bar"}), r.createElement("span", {className: "icon-bar"}))
        }
    }

    class a extends r.Component {
        get className() {
            return `${this.props.active ? "active" : ""} ${this.props.emphasis ? "emphasis" : ""}`
        }

        renderLinkWithOutTooltip() {
            return r.createElement("a", {href: this.props.link}, this.props.title)
        }

        renderLinkWithTooltip() {
            return r.createElement("a", {
                "data-tooltip": !0,
                title: this.props.tooltip,
                href: this.props.link
            }, this.props.title)
        }

        render() {
            return r.createElement("li", {className: this.className}, this.props.tooltip ? this.renderLinkWithTooltip() : this.renderLinkWithOutTooltip())
        }
    }

    class o extends r.Component {
        render() {
            return r.createElement("ul", {className: "nav navbar-nav navbar-right"}, r.createElement("li", null, r.createElement("a", {
                className: "ren-navbar-sociallink",
                href: "https://www.facebook.com/rentessenderlo",
                target: "_blank"
            }, r.createElement("span", {
                "data-tooltip": !0,
                title: "Vind ons op Facebook",
                className: "ren-navbar-sociallink-span-container"
            }, r.createElement("i", {className: "fa fa-facebook fa-lg"})))))
        }
    }
}, function (e, t) {
    e.exports = ReactDOM
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = n(1);
    t.PageFooter = class extends r.Component {
        render() {
            return r.createElement("div", {className: "container-fluid ren-black-background ren-footer"}, r.createElement("h5", null, "Design: ", r.createElement("a", {
                href: "https://be.linkedin.com/in/samgielis",
                target: "_blank"
            }, "Sam Gielis"), "."))
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = n(18), s = n(19), a = n(20);
    t.createAnalyticsTracker = function () {
        return window.location.hostname === s.REN_PRODUCTION_HOSTNAME ? new r.GoogleAnalyticsTracker : new a.DummyAnalyticsTracker
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    t.GoogleAnalyticsTracker = class {
        constructor() {
            const e = window.dataLayer = window.dataLayer || [];
            this._gtag = window.gtag = function () {
                e.push(arguments)
            }, this._gtag("js", new Date), this._gtag("config", "UA-122224869-1")
        }

        trackSubscription(e) {
            if (ga) try {
                this._gtag("event", "newsletterSubscription", {
                    eventCategory: "Newsletter",
                    eventAction: "submit",
                    eventLabel: e
                })
            } catch (e) {
                console.warn("REN: Er ging iets verkeerd bij het tracken van de Newsletter subscription.")
            }
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0}), t.REN_PRODUCTION_HOSTNAME = "rensport.be"
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    t.DummyAnalyticsTracker = class {
        constructor() {
            console.log("REN/ANALYTICS: Instantiating DummyAnalyticsTracker.")
        }

        trackSubscription(e) {
            console.log(`REN/ANALYTICS: Tracking new newsletter subscription for ${e}.`)
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    const r = "vr-signup-form-17592186047291", s = "ren-nieuwsbrief-input-field", a = "ren-nieuwsbrief-button";
    t.NewsletterSubscriptionFormController = class {
        constructor(e) {
            this._analyticsTracker = e, this._handleSubmission = (() => {
                let e = document.querySelector(".ren-nieuwsbrief-container"), t = document.getElementById(s),
                    n = document.querySelector("#vr-hidden-input-field"),
                    r = document.querySelector("#vr-hidden-submit-btn");
                t && n && t.value && r && (this._analyticsTracker.trackSubscription(t.value), n.value = t.value, r.click(), e.classList.add("ren-nieuwsbrief-subscribed"))
            }), document.addEventListener("DOMContentLoaded", () => {
                this._initForm()
            })
        }

        _initForm() {
            if (!window.VR || !VR.SignupForm) return;
            if (!document.getElementById(r)) return;
            const e = document.getElementById(a);
            e && (new VR.SignupForm({
                id: "17592186047291",
                element: r,
                endpoint: "https://marketingsuite.verticalresponse.com/se/",
                submitLabel: "Submitting...",
                invalidEmailMessage: "Invalid email address",
                generalErrorMessage: "An error occurred",
                notFoundMessage: "Signup form not found",
                successMessage: "Success!",
                nonMailableMessage: "Nonmailable address"
            }), e.addEventListener("click", this._handleSubmission))
        }
    }
}]);
//# sourceMappingURL=rensport.js.map