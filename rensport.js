!function(e){var t={};function n(a){if(t[a])return t[a].exports;var r=t[a]={i:a,l:!1,exports:{}};return e[a].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,a){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(n.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(a,r,function(t){return e[t]}.bind(null,r));return a},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=4)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a="https://rensecurityproxy-samgielis.rhcloud.com/";t.FB_PAGE_ID="215470341909937";class r{static feed(e,t){r.get("feed",e,t)}static openinghours(e,t){r.get("openinghours",e,t)}static get(e,t,n){try{var r=new XMLHttpRequest;r.open("get",a+e,!0),r.responseType="json",r.onload=function(){200==r.status?t(r.response):n&&n()},r.onerror=n,r.send()}catch(e){n&&n()}}}t.FacebookProxy=r},function(e,t){e.exports=React},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.Loadable=class{constructor(){this._isLoaded=!1,this._loadFailed=!1,this._waitingForLoadSuccess=[],this._waitingForLoadFail=[],this.doLoad()}get isLoaded(){return this._isLoaded}get hasLoadFailed(){return this._loadFailed}afterLoad(e,t){this.isLoaded?e():this.hasLoadFailed?t&&t():(this._waitingForLoadSuccess.push(e),t&&this._waitingForLoadFail.push(t))}loadSuccess(){this._isLoaded=!0;for(let e of this._waitingForLoadSuccess)e();this._waitingForLoadSuccess=[]}loadFailed(e){this._loadFailed=!0;for(let e of this._waitingForLoadFail)e();throw this._waitingForLoadFail=[],new Error("Loading failed : "+e)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseJSON=function(e){try{return JSON.parse(e)}catch(e){return}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a=n(5);window.RenSport=new a.Ren},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a=n(6),r=n(8),s=n(12),o=n(13),i=n(1),c=n(15),d=n(16),l=n(17),u=n(21);t.Ren=class{constructor(){this._analyticsTracker=l.createAnalyticsTracker(),new u.NewsletterSubscriptionFormController(this._analyticsTracker);let e=window.RenSportConfig;e&&e.loadHeader&&this._loadHeader(e.context),this._loadFooter(),e&&e.loadOpeningHours&&(this._openingInfo=new a.FacebookOpeningInfo,this._openingInfo.afterLoad(()=>{s.renderOpeningInfo(this._openingInfo,document.querySelector("#ren-openingsuren-hook"))})),e&&e.loadNewsFeed&&(this._feed=new r.FacebookFeed,this._feed.afterLoad(()=>{this._feed.renderTo(document.querySelector(".ren-homepage-newsfeed"))}))}get feed(){return this._feed}_loadHeader(e){document.addEventListener("DOMContentLoaded",()=>{c.render(i.createElement(o.PageHeader,{activeContext:e}),document.getElementById("ren-header"))})}_loadFooter(){document.addEventListener("DOMContentLoaded",()=>{c.render(i.createElement(d.PageFooter,null),document.getElementById("ren-footer"))})}get openingInfo(){return this._openingInfo}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a=n(2),r=n(0),s=n(3),o=n(7);function i(e,t){let n=e.split("_"),a=t.split("_");return parseInt(n[1])<parseInt(a[1])?-1:parseInt(n[1])>parseInt(a[1])?1:"open"===n[2]?-1:1}function c(e,t){let n=[];for(let a of e)n.push(t.hours[a]);return n}function d(e,t){let n=new Date,a=e.split(":"),r=new Date,s=parseInt(a[0]),o=parseInt(a[1]),i=t.split(":"),c=new Date,d=parseInt(i[0]),l=parseInt(i[1]);return r.setHours(s),r.setMinutes(o),c.setHours(d),c.setMinutes(l),n>=r&&n<c}t.FacebookOpeningInfo=class extends a.Loadable{constructor(){super(...arguments),this.monday=[],this.tuesday=[],this.wednesday=[],this.thursday=[],this.friday=[],this.saturday=[],this.sunday=[]}get isCurrentlyOpen(){let e=this[function(e){return 0===e?"sunday":1===e?"monday":2===e?"tuesday":3===e?"wednesday":4===e?"thursday":5===e?"friday":6===e?"saturday":void 0}((new Date).getDay())];for(let t=0;t<e.length;t+=2)if(d(e[t],e[t+1]))return!0;return!1}doLoad(){r.FacebookProxy.openinghours(e=>{e.error?this.loadFailed(e.error):(this.parseData(e),this.loadSuccess())},()=>{this.parseData(o.STANDARD_OPENING_HOURS),this.loadSuccess()})}parseData(e){"string"==typeof e&&(e=s.parseJSON(e)),this.monday=c(Object.keys(e.hours).filter(e=>e.indexOf("mon")>-1).sort(i),e),this.tuesday=c(Object.keys(e.hours).filter(e=>e.indexOf("tue")>-1).sort(i),e),this.wednesday=c(Object.keys(e.hours).filter(e=>e.indexOf("wed")>-1).sort(i),e),this.thursday=c(Object.keys(e.hours).filter(e=>e.indexOf("thu")>-1).sort(i),e),this.friday=c(Object.keys(e.hours).filter(e=>e.indexOf("fri")>-1).sort(i),e),this.saturday=c(Object.keys(e.hours).filter(e=>e.indexOf("sat")>-1).sort(i),e),this.sunday=c(Object.keys(e.hours).filter(e=>e.indexOf("sun")>-1).sort(i),e)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.STANDARD_OPENING_HOURS={hours:{mon_1:"09:30",mon_2:"12:30",mon_3:"13:30",mon_4:"18:00",wed_1:"09:30",wed_2:"12:30",wed_3:"13:30",wed_4:"18:00",thu_1:"09:30",thu_2:"12:30",thu_3:"13:30",thu_4:"18:00",fri_1:"09:30",fri_2:"12:30",fri_3:"13:30",fri_4:"18:00",sat_1:"09:30",sat_2:"18:00"}},t.EXCEPTIONAL_OPENING_HOURS={hours:{thu_1:"09:30",thu_2:"12:30",thu_3:"13:30",thu_4:"18:30",fri_1:"09:30",fri_2:"12:30",fri_3:"13:30",fri_4:"18:00",sat_1:"09:30",sat_2:"12:30",sat_3:"13:30",sat_4:"18:30"}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a=n(2),r=n(0),s=n(9),o=n(3),i=n(11);t.FacebookFeed=class extends a.Loadable{constructor(){super(),this._posts=[]}get posts(){return this._posts}doLoad(){r.FacebookProxy.feed(e=>{!e.error&&e.feed&&e.feed.data?this.addPostsFromResponse(e.feed.data):!e.error&&o.parseJSON(e)&&o.parseJSON(e).feed&&o.parseJSON(e).feed.data?this.addPostsFromResponse(o.parseJSON(e.feed.data)):this.addPostsFromResponse(i.manualFacebookFeed)},()=>{this.addPostsFromResponse(i.manualFacebookFeed)})}addPostsFromResponse(e){for(let t of e)this._posts.push(new s.FacebookPost(t));this.loadSuccess()}get view(){let e=[];for(let t=0,n=0;n<Math.min(this.posts.length,5);t++){let a=this.posts[t];a.canDisplay&&(e.push(a.view),n++)}return e}renderTo(e){for(let t of this.view)e.appendChild(t)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a=n(0),r=n(10);t.FacebookPost=class{constructor(e){this.info=e}get canDisplay(){return!this.info.is_hidden&&this.info.is_published&&this.info.from&&this.info.from.id===a.FB_PAGE_ID&&!!this.message}get created(){return new Date(this.info.created_time.split("+")[0])}get id(){return this.info.id}get message(){return this.info.message}get picture(){if(this.info.full_picture){let e=document.createElement("img");return e.src=this.info.full_picture,e.className="ren-newsfeed-item-img",e}return null}renderTo(e){this.canDisplay&&e.appendChild(this.view)}get view(){let e=document.createElement("div");e.className="ren-newsfeed-item-container";let t=this.createDateView();e.appendChild(t);let n=this.createContentView();return e.appendChild(n),e}createContentView(){let e=document.createElement("div");e.className="ren-content-item-container";let t=document.createElement("div");if(t.className="ren-newsfeed-item-content-container",this.message){let e=document.createElement("h2");e.className="ren-newsfeed-item-title";let n=this.message.match(o)||this.message.match(i);n&&(e.innerHTML=n.map(function(e){return e.replace(/^\s+|\s+$/g,"")})[0]),t.appendChild(e)}let n=this.picture;if(n&&t.appendChild(n),this.message){let e=document.createElement("p");e.className="ren-newsfeed-item-text",e.innerHTML=this.message&&r.linkify(this.message),t.appendChild(e)}return e.appendChild(t),e}createDateView(){let e=document.createElement("div");e.className="ren-newsfeed-item-date-container";let t=document.createElement("h1");t.className="ren-newsfeed-item-date-day",t.innerText=""+this.created.getDate(),e.appendChild(t);let n=document.createElement("h6");return n.className="ren-newsfeed-item-date-month-year",n.innerText=s[this.created.getMonth()]+" "+this.created.getFullYear(),e.appendChild(n),e}};const s=["Jan","Feb","Maa","Apr","Mei","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],o=/^.*?[\.!\?](?:\s|$)/g,i=/^.*?[\n](?:\s|$)/g},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.linkify=function(e){var t,n,a;return t=/(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,n=/(^|[^\/])(www\.[\S]+(\b|$))/gim,a=/(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim,e.replace(t,'<a href="$1" target="_blank">$1</a>').replace(n,'$1<a href="http://$2" target="_blank">$2</a>').replace(a,'<a href="mailto:$1">$1</a>')}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a=n(0);function r(e,t,n){return{created_time:t,full_picture:n,id:"id",is_hidden:!1,is_published:!0,message:e,from:{name:"",id:a.FB_PAGE_ID,error:""},error:""}}t.manualFacebookFeed=[r("Wedstrijd week 2. Van maandag 12/11/218 tot zaterdag, 17/11/2018. Zondag wordt de winnaar gekozen.\nDe prijsvraag is. \nPlaats de onderstaande merken in de juiste volgorde van start van onze running kleding tot de huidige tijd.\n- GORE RUNNING WEAR\n- CONCURVE\n- GORE® Wear\nUit alle inzendingen verloten wij een winnaar. Er zijn twee winnaars, 1 man en 1 vrouw. Goretex vesten, 1 herenvest en 1 damesvest. Wij verwittigen de gelukkige. \nVolg ons op Facebook zo blijf je op de hoogte van onze acties.\nDeel en like mag altijd.\n#rensport #gore","2018/11/12","https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/46146766_867468263376805_6607802357352759296_n.jpg?_nc_cat=104&_nc_ht=scontent-bru2-1.xx&oh=e3769e057b1f3eeb47c1b69b86d4cf44&oe=5C3CF85B"),r("Nu te verkrijgen bij Ren Sport.","2018/11/07","https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/45088658_2001600013270094_5049284284708290560_n.jpg?_nc_cat=107&_nc_ht=scontent-bru2-1.xx&oh=107a0165d84f05a0eeff77ede96b2a33&oe=5C790729"),r("Wedstrijd week 1. Van maandag 5/11/218 tot zaterdag, 10/11/2018. Zaterdag wordt de winnaar gekozen.\nMaak een leuke Saucony foto en post deze hier op de Ren Sport Facebook , uit alle inzendingen verloten wij een winnaar. De prijs is één paar Saucony schoenen, maat en model zelf te kiezen. Wij verwittigen de gelukkige. \nVolg ons op Facebook zo blijf je op de hoogte van onze acties.","2018/11/05",""),r("Ren Sport wordt 30 jaar in november. Het wordt een feest, we houden u op de hoogte.","2018/09/29","https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/42622440_825187714271527_7484433237192736768_n.jpg?_nc_cat=101&oh=60df80c73b86f2c634db964e3dcf84a8&oe=5C5BE254"),r("Nieuw bij Ren Sport: Padel!","2018/09/16","https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/42092155_815230038600628_3539549451339169792_n.jpg?_nc_cat=101&oh=bd3fe2cb3c0a2a8b3f0712d82ca3b9c0&oe=5C21744E"),r("Nog snel één van de 200 gelimiteerde SUPERTRAC ULTRA RC schoenen in de wacht slepen? Ren Sport helpt je graag verder.","2018/08/24","https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/39947224_796705753786390_8040626648711692288_n.png?_nc_cat=0&oh=24179afae6f3d200279e827d1ac6196a&oe=5C30AD21"),r("NU bij Ren Sport. De nieuwe Mizuno Wave Ultima 10 – TCS Amsterdam Marathon editie.","2018/08/17","https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/39453905_788052064651759_7870217907072925696_n.jpg?_nc_cat=0&oh=d1ab8ff26008f21e252b76e9ac48eaac&oe=5C062056"),r("Beste klanten, maandag 13, dinsdag 14 en woensdag 15 augustus zijn we gesloten. Donderdag zijn we terug open. Geniet van jullie mooi en sportief weekend.🌞🌞🏃‍♂️🏃‍♀️🎾🏊‍♂️🚴‍♂️🚴‍♀️. 😜","2018/08/11","https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/38926265_780068562116776_8787499153425956864_n.jpg?_nc_cat=0&oh=3187f9fc009fec9145c028a6e2bf6567&oe=5C0DB9D9"),r("Knap podium Steffan Vanderlinden. Foto van de bosvrienden.","2018/08/04","https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/38528647_770318696425096_3281332864997654528_n.png?_nc_cat=0&oh=f4c2e87d86668e5de8a3dc6228f239d9&oe=5BFA69B2"),r("Dikke proficiat voor onze rode duivels van het Ren Sport team.","2018/07/07","https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36770646_737851716338461_2116977251210756096_n.jpg?_nc_cat=0&oh=7af8445368da3aaf8bf3cee8a34ab006&oe=5BDC71BF"),r("Heel warm weer, veel drinken!!!\nWat drinken voor en na een training/ wedstrijd?\nNIEUW bij Ren Sport is OVERSTIMS.\nEen ideaal voordeelpakket voor de marathonlopers, met extra een band voor u nummer en je energiegels voor onderweg.","2018/07/04","https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36682613_734800719976894_497555906653847552_n.jpg?_nc_cat=0&oh=e87ecac5d3e3fb95712ec25a9ac4fbb8&oe=5BD363AE")]},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],r={monday:"M.",tuesday:"D.",wednesday:"W.",thursday:"D.",friday:"V.",saturday:"Z.",sunday:"Z."};function s(e,t){let n=document.createElement("tr");e===a[(new Date).getDay()-1]&&(n.className="ren-openingsuren-currentday");let s=document.createElement("th"),o=document.createElement("td");return s.innerText=r[e],o.innerText=function(e){let t="";for(let n=0;n<e.length;n+=2)t+=e[n]+" - "+e[n+1],n+1!=e.length-1&&(t+=", ");return t||"Gesloten"}(t),n.appendChild(s),n.appendChild(o),n}function o(e,t){let n=document.createElement("a");n.className="ren-openingsuren-indicator-cta-link",n.href=e;let a=document.createElement("i");return a.className="fa "+t+" fa-lg",n.appendChild(a),n}t.renderOpeningInfo=function(e,t){if(!t)return;switch(t.getAttribute("data-viewtype")){case"modest":!function(e,t){t.appendChild(function(e){let t=document.createElement("table");e.isCurrentlyOpen?t.className="ren-openingsuren-open":t.className="ren-openingsuren-closed";for(let n of a){let a=s(n,e[n]);t.appendChild(a)}return t}(e)),t.appendChild(function(e){let t,n=document.createElement("div");n.className="ren-openingsuren-modest-indicator",(t=document.createElement("span")).className="ren-openingsuren-modest-indicator-label";let a=[];switch(a.push(o("mailto:info@rensport.be","fa-envelope")),e.isCurrentlyOpen){case!0:n.className+=" ren-openingsuren-open",t.innerText="Nu open!",a.push(o("tel:+3213667460","fa-phone"));break;case!1:n.className+=" ren-openingsuren-closed",t.innerText="Gesloten"}n.appendChild(t);for(let e of a)n.appendChild(e);return n}(e))}(e,t)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a=n(1),r=n(14);t.PageHeader=class extends a.Component{render(){return a.createElement("div",null,a.createElement(s,null),a.createElement(r.Navbar,{activeContext:this.props.activeContext}))}};class s extends a.Component{render(){return a.createElement("div",{className:"row ren-main-logo-container"},a.createElement("div",{className:"col-md-12"},a.createElement("img",{className:"ren-main-logo-img",src:"/img/30-jaar.png"})))}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a=n(1);t.Navbar=class extends a.Component{render(){return a.createElement("nav",{className:"navbar ren-black-background"},a.createElement("div",{className:"container-fluid ren-navbar-container"},a.createElement("div",{className:"navbar-header"},a.createElement(r,null)),a.createElement("div",{className:"collapse navbar-collapse",id:"bs-example-navbar-collapse-1"},a.createElement("ul",{className:"nav navbar-nav"},a.createElement(s,{title:"Home",link:"/",active:"home"===this.props.activeContext}),a.createElement(s,{title:"Sportvoeding",link:"/sportvoeding",tooltip:"Ontdek ons assortiment sportvoeding",active:"sportvoeding"===this.props.activeContext}),a.createElement(s,{title:"Merken",link:"/merken",tooltip:"Ontdek al onze merken",active:"merken"===this.props.activeContext}),a.createElement(s,{title:"30 jaar",link:"/30-jaar",tooltip:"Ren bestaat 30 jaar! Ontdek onze acties",active:"30-jaar"===this.props.activeContext,emphasis:!0}),a.createElement(s,{title:"Contact",link:"/contact",tooltip:"Contacteer ons",active:"contact"===this.props.activeContext})),a.createElement(o,null))))}};class r extends a.Component{render(){return a.createElement("button",{type:"button",className:"navbar-toggle collapsed","data-toggle":"collapse","data-target":"#bs-example-navbar-collapse-1","aria-expanded":"false"},a.createElement("span",{className:"sr-only"},"Toggle navigation"),a.createElement("span",{className:"icon-bar"}),a.createElement("span",{className:"icon-bar"}),a.createElement("span",{className:"icon-bar"}))}}class s extends a.Component{get className(){return`${this.props.active?"active":""} ${this.props.emphasis?"emphasis":""}`}renderLinkWithOutTooltip(){return a.createElement("a",{href:this.props.link},this.props.title)}renderLinkWithTooltip(){return a.createElement("a",{"data-tooltip":!0,title:this.props.tooltip,href:this.props.link},this.props.title)}render(){return a.createElement("li",{className:this.className},this.props.tooltip?this.renderLinkWithTooltip():this.renderLinkWithOutTooltip())}}class o extends a.Component{render(){return a.createElement("ul",{className:"nav navbar-nav navbar-right"},a.createElement("li",null,a.createElement("a",{className:"ren-navbar-sociallink",href:"https://www.facebook.com/rentessenderlo",target:"_blank"},a.createElement("span",{"data-tooltip":!0,title:"Vind ons op Facebook",className:"ren-navbar-sociallink-span-container"},a.createElement("i",{className:"fa fa-facebook fa-lg"})))))}}},function(e,t){e.exports=ReactDOM},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a=n(1);t.PageFooter=class extends a.Component{render(){return a.createElement("div",{className:"container-fluid ren-black-background ren-footer"},a.createElement("h5",null,"Design: ",a.createElement("a",{href:"https://be.linkedin.com/in/samgielis",target:"_blank"},"Sam Gielis"),"."))}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a=n(18),r=n(19),s=n(20);t.createAnalyticsTracker=function(){return window.location.hostname===r.REN_PRODUCTION_HOSTNAME?new a.GoogleAnalyticsTracker:new s.DummyAnalyticsTracker}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.GoogleAnalyticsTracker=class{constructor(){const e=window.dataLayer=window.dataLayer||[];this._gtag=window.gtag=function(){e.push(arguments)},this._gtag("js",new Date),this._gtag("config","UA-122224869-1")}trackSubscription(e){if(ga)try{this._gtag("event","newsletterSubscription",{eventCategory:"Newsletter",eventAction:"submit",eventLabel:e})}catch(e){console.warn("REN: Er ging iets verkeerd bij het tracken van de Newsletter subscription.")}}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.REN_PRODUCTION_HOSTNAME="rensport.be"},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.DummyAnalyticsTracker=class{constructor(){console.log("REN/ANALYTICS: Instantiating DummyAnalyticsTracker.")}trackSubscription(e){console.log(`REN/ANALYTICS: Tracking new newsletter subscription for ${e}.`)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const a="vr-signup-form-17592186047291",r="ren-nieuwsbrief-input-field",s="ren-nieuwsbrief-button";t.NewsletterSubscriptionFormController=class{constructor(e){this._analyticsTracker=e,this._handleSubmission=(()=>{let e=document.querySelector(".ren-nieuwsbrief-container"),t=document.getElementById(r),n=document.querySelector("#vr-hidden-input-field"),a=document.querySelector("#vr-hidden-submit-btn");t&&n&&t.value&&a&&(this._analyticsTracker.trackSubscription(t.value),n.value=t.value,a.click(),e.classList.add("ren-nieuwsbrief-subscribed"))}),document.addEventListener("DOMContentLoaded",()=>{this._initForm()})}_initForm(){if(!window.VR||!VR.SignupForm)return;if(!document.getElementById(a))return;const e=document.getElementById(s);e&&(new VR.SignupForm({id:"17592186047291",element:a,endpoint:"https://marketingsuite.verticalresponse.com/se/",submitLabel:"Submitting...",invalidEmailMessage:"Invalid email address",generalErrorMessage:"An error occurred",notFoundMessage:"Signup form not found",successMessage:"Success!",nonMailableMessage:"Nonmailable address"}),e.addEventListener("click",this._handleSubmission))}}}]);
//# sourceMappingURL=rensport.js.map