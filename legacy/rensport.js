!function(e){var t={};function n(r){if(t[r])return t[r].exports;var a=t[r]={i:r,l:!1,exports:{}};return e[r].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)n.d(r,a,function(t){return e[t]}.bind(null,a));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=4)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.FB_PAGE_ID="215470341909937";class r{static feed(e,t){r.get("news",e,t)}static openinghours(e,t){r.get("hours",e,t)}static get(e,t,n){try{var r=new XMLHttpRequest;r.open("get","https://ren-fb-proxy.netlify.app/.netlify/functions/"+e,!0),r.responseType="json",r.onload=function(){200==r.status?t(r.response):n&&n()},r.onerror=n,r.send()}catch(e){n&&n()}}}t.FacebookProxy=r},function(e,t){e.exports=React},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.Loadable=class{constructor(){this._isLoaded=!1,this._loadFailed=!1,this._waitingForLoadSuccess=[],this._waitingForLoadFail=[],this.doLoad()}get isLoaded(){return this._isLoaded}get hasLoadFailed(){return this._loadFailed}afterLoad(e,t){this.isLoaded?e():this.hasLoadFailed?t&&t():(this._waitingForLoadSuccess.push(e),t&&this._waitingForLoadFail.push(t))}loadSuccess(){this._isLoaded=!0;for(let e of this._waitingForLoadSuccess)e();this._waitingForLoadSuccess=[]}loadFailed(e){this._loadFailed=!0;for(let e of this._waitingForLoadFail)e();throw this._waitingForLoadFail=[],new Error("Loading failed : "+e)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseJSON=function(e){try{return JSON.parse(e)}catch(e){return}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(5);window.RenSport=new r.Ren},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(6),a=n(8),o=n(12),s=n(13),i=n(1),l=n(15),d=n(16),c=n(17),u=n(21);t.Ren=class{constructor(){this._analyticsTracker=c.createAnalyticsTracker(),new u.NewsletterSubscriptionFormController(this._analyticsTracker);let e=window.RenSportConfig;e&&e.loadHeader&&this._loadHeader(e.context),this._loadFooter(),e&&e.loadOpeningHours&&(this._openingInfo=new r.FacebookOpeningInfo,this._openingInfo.afterLoad(()=>{o.renderOpeningInfo(this._openingInfo,document.querySelector("#ren-openingsuren-hook"))})),e&&e.loadNewsFeed&&(this._feed=new a.FacebookFeed,this._feed.afterLoad(()=>{this._feed.renderTo(document.querySelector(".ren-homepage-newsfeed"))}))}get feed(){return this._feed}_loadHeader(e){document.addEventListener("DOMContentLoaded",()=>{l.render(i.createElement(s.PageHeader,{activeContext:e}),document.getElementById("ren-header"))})}_loadFooter(){document.addEventListener("DOMContentLoaded",()=>{l.render(i.createElement(d.PageFooter,null),document.getElementById("ren-footer"))})}get openingInfo(){return this._openingInfo}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(2),a=n(0),o=n(3),s=n(7);class i extends r.Loadable{constructor(){super(...arguments),this.monday=[],this.tuesday=[],this.wednesday=[],this.thursday=[],this.friday=[],this.saturday=[],this.sunday=[]}get isCurrentlyOpen(){let e=this[function(e){if(0===e)return"sunday";if(1===e)return"monday";if(2===e)return"tuesday";if(3===e)return"wednesday";if(4===e)return"thursday";if(5===e)return"friday";if(6===e)return"saturday"}((new Date).getDay())];for(let t=0;t<e.length;t+=2)if(c(e[t],e[t+1]))return!0;return!1}doLoad(){a.FacebookProxy.openinghours(e=>{e.error?this.loadFailed(e.error):(this.parseData(e),this.loadSuccess())},()=>{this.parseData(s.STANDARD_OPENING_HOURS),this.loadSuccess()})}parseData(e){"string"==typeof e&&(e=o.parseJSON(e)),this.monday=d(Object.keys(e.hours).filter(e=>e.indexOf("mon")>-1).sort(l),e),this.tuesday=d(Object.keys(e.hours).filter(e=>e.indexOf("tue")>-1).sort(l),e),this.wednesday=d(Object.keys(e.hours).filter(e=>e.indexOf("wed")>-1).sort(l),e),this.thursday=d(Object.keys(e.hours).filter(e=>e.indexOf("thu")>-1).sort(l),e),this.friday=d(Object.keys(e.hours).filter(e=>e.indexOf("fri")>-1).sort(l),e),this.saturday=d(Object.keys(e.hours).filter(e=>e.indexOf("sat")>-1).sort(l),e),this.sunday=d(Object.keys(e.hours).filter(e=>e.indexOf("sun")>-1).sort(l),e)}}function l(e,t){let n=e.split("_"),r=t.split("_");return parseInt(n[1])<parseInt(r[1])?-1:parseInt(n[1])>parseInt(r[1])?1:"open"===n[2]?-1:1}function d(e,t){let n=[];for(let r of e)n.push(t.hours[r]);return n}function c(e,t){let n=new Date,r=e.split(":"),a=new Date,o=parseInt(r[0]),s=parseInt(r[1]),i=t.split(":"),l=new Date,d=parseInt(i[0]),c=parseInt(i[1]);return a.setHours(o),a.setMinutes(s),l.setHours(d),l.setMinutes(c),n>=a&&n<l}t.FacebookOpeningInfo=i},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.STANDARD_OPENING_HOURS={hours:{mon_1:"09:30",mon_2:"12:30",mon_3:"13:30",mon_4:"18:00",wed_1:"09:30",wed_2:"12:30",wed_3:"13:30",wed_4:"18:00",thu_1:"09:30",thu_2:"12:30",thu_3:"13:30",thu_4:"18:00",fri_1:"09:30",fri_2:"12:30",fri_3:"13:30",fri_4:"18:00",sat_1:"09:30",sat_2:"18:00"}},t.EXCEPTIONAL_OPENING_HOURS={hours:{thu_1:"09:30",thu_2:"12:30",thu_3:"13:30",thu_4:"18:30",fri_1:"09:30",fri_2:"12:30",fri_3:"13:30",fri_4:"19:00",sat_1:"09:30",sat_2:"12:30",sat_3:"13:30",sat_4:"18:30"}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(2),a=n(0),o=n(9),s=n(3),i=n(11);class l extends r.Loadable{constructor(){super(),this._posts=[]}get posts(){return this._posts}doLoad(){a.FacebookProxy.feed(e=>{!e.error&&e.data?this.addPostsFromResponse(e.data):!e.error&&s.parseJSON(e)&&s.parseJSON(e).feed&&s.parseJSON(e).feed.data?this.addPostsFromResponse(s.parseJSON(e.data)):this.addPostsFromResponse(i.manualFacebookFeed)},()=>{this.addPostsFromResponse(i.manualFacebookFeed)})}addPostsFromResponse(e){for(let t of e)this._posts.push(new o.FacebookPost(t));this.loadSuccess()}get view(){let e=[];for(let t=0,n=0;n<Math.min(this.posts.length,5);t++){let r=this.posts[t];r.canDisplay&&(e.push(r.view),n++)}return e}renderTo(e){for(let t of this.view)e.appendChild(t)}}t.FacebookFeed=l},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(0),a=n(10);t.FacebookPost=class{constructor(e){this.info=e}get canDisplay(){return!this.info.is_hidden&&this.info.is_published&&this.info.from&&this.info.from.id===r.FB_PAGE_ID&&!!this.message}get created(){return new Date(this.info.created_time.split("+")[0])}get id(){return this.info.id}get title(){if(this.info.title)return this.info.title;let e=this.message.match(s)||this.message.match(i);return e?e.map((function(e){return e.replace(/^\s+|\s+$/g,"")}))[0]:"Nieuws"}get message(){return this.info.message}get picture(){if(this.info.full_picture){let e=document.createElement("img");return e.src=this.info.full_picture,e.className="ren-newsfeed-item-img",e}return null}renderTo(e){this.canDisplay&&e.appendChild(this.view)}get view(){let e=document.createElement("div");e.className="ren-newsfeed-item-container";let t=this.createDateView();e.appendChild(t);let n=this.createContentView();return e.appendChild(n),e}createContentView(){let e=document.createElement("div");e.className="ren-content-item-container";let t=document.createElement("div");if(t.className="ren-newsfeed-item-content-container",this.message){let e=document.createElement("h2");e.className="ren-newsfeed-item-title",e.innerHTML=this.title,t.appendChild(e)}let n=this.picture;if(n&&t.appendChild(n),this.message){let e=document.createElement("p");e.className="ren-newsfeed-item-text",e.innerHTML=this.message&&a.linkify(this.message),t.appendChild(e)}return e.appendChild(t),e}createDateView(){let e=document.createElement("div");e.className="ren-newsfeed-item-date-container";let t=document.createElement("h1");t.className="ren-newsfeed-item-date-day",t.innerText=""+this.created.getDate(),e.appendChild(t);let n=document.createElement("h6");return n.className="ren-newsfeed-item-date-month-year",n.innerText=o[this.created.getMonth()]+" "+this.created.getFullYear(),e.appendChild(n),e}};const o=["Jan","Feb","Maa","Apr","Mei","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],s=/^.*?[\.!\?](?:\s|$)/g,i=/^.*?[\n](?:\s|$)/g},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.linkify=function(e){var t,n,r;return t=/(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,n=/(^|[^\/])(www\.[\S]+(\b|$))/gim,r=/(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim,e.replace(t,'<a href="$1" target="_blank">$1</a>').replace(n,'$1<a href="http://$2" target="_blank">$2</a>').replace(r,'<a href="mailto:$1">$1</a>')}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(0);function a(e,t,n,a){return{created_time:t,full_picture:n,id:"id",is_hidden:!1,is_published:!0,title:a,message:e,from:{name:"",id:r.FB_PAGE_ID,error:""},error:""}}t.manualFacebookFeed=[a("Met het oog op de aankoop van loop- of wandelschoenen vragen wij om een extra paar propere sokken mee te brengen. Verder verzoeken wij om de corona maatregelen te respecteren.","2020/07/31","/img/facemask.jpg","Start van de solden op zaterdag 1 augustus"),a("OUTLET: Wij hebben weer heel wat nieuwe loopschoenen in onze outlet geplaatst. Bekijk hier de dames-modellen: https://shop.rensport.be/collections/dames?sort_by=created-descending en hier de heren: https://shop.rensport.be/collections/heren?sort_by=created-descending","2020/07/18","/img/promoshop.png","Nieuwe lading outlet schoenen!"),a("Maandag 20 juli zijn we uitzonderlijk gesloten. Vanaf woensdag 22 juli zijn we terug open om u verder te helpen met uw sportmateriaal. Geniet nog van een mooi en sportief weekend.","2020/07/17","/img/holiday.jpg","Gesloten op 20 juli"),a("Onze winkel in Tessenderlo is opnieuw open volgens de normale openingsuren. We hebben extra voorzorgsmaatregelen getroffen voor uw en onze veiligheid.","2020/05/14","/img/back.jpg","We zijn opnieuw open!"),a("Bij aankoop voor interclub vanaf 2 personen een korting van 20%. Ook nieuw: de collectie van Snauwaert!","2020/02/08","/img/tennis2020.jpg","Actie tennis"),a("De winkel is uitzonderlijk open op 24 en 31 december, van 9u30 tot 12.30 en van 13u30 tot 17u.","2019/12/23","/img/kerst.jpg","Open op 24 en 31 december"),a("Thermisch ondergoed van Odlo aan -20%! Deze actie loopt tot en met 30 november, zolang de voorraad strekt.","2019/11/25","/img/bf3.jpg","Pre-Black Friday actie Odlo"),a("De Nike Pegasus 35 koop je nu tijdelijk aan €75 voor volwassenen en €50 voor kids. Deze actie loopt tot en met 30 november, zolang de voorraad strekt.","2019/11/22","/img/bf2.jpg","Pre-Black Friday actie Nike"),a("De Nike Pegasus 35 koop je nu tijdelijk aan €75 voor volwassenen en €50 voor kids. Deze actie loopt tot en met 30 november, zolang de voorraad strekt.","2019/11/22","/img/bf2.jpg","Pre-Black Friday actie Nike"),a("Naar aanleiding van Black Friday koop je deze sweater, broek en vest samen voor slechts €35. Zolang de voorraad strekt","2019/11/22","/img/bf1.jpg","Pre-Black Friday actie Olympic"),a("In November krijg je een gratis paar wandelsokken van Lowa/Meindl bij aankoop van een paar wandelschoenen!","2019/11/02","/img/wandelen.jpg","November: Actiemaand wandelschoenen!"),a("Sinds deze week staat de eerste ASICS wall van Vlaanderen opgesteld in onze winkel in Tessenderlo. Kom zeker eens een kijkje nemen!","2019/10/12","/img/asicswall.jpg","De allereerste ASICS wall van Vlaanderen? Je vindt 'm bij Ren!"),a(" Een grootschalig onderzoek onder bijna 800 gebruikers bevestigt wat Herzog Medical al ruim 20 jaar uitdraagt. Het gebruik van compressiekousen onder sporters draagt op verschillende vlakken positief bij aan de prestatie. De sporter herstelt sneller, heeft minder last van blessures en sport vaak weer volledig blessurevrij. Ontdek Herzog nu in onze winkel! ","2019/07/25","/img/herzog.jpg","Herzog PRO Compressiekousen: bewezen effectief"),a("Solden bij Ren Sport.\nKoopjes sportschoenen aan €10, €20 en €30.\nGrote opruiming van voetbalschoenen aan €30.","2019/07/05","https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/65677373_1131436756979953_4883110582686842880_n.jpg?_nc_cat=102&_nc_oc=AQnykVpje5lggP6vmG6IHWmdEIPa6SD2s3jJERcaW7cL_cmYFYbEPq_lkxGYN8DuV598p2RsOE5ZVZU9aP7ZkILn&_nc_ht=scontent-bru2-1.xx&oh=448b086a22660ba4e7a089f21f6fe6f7&oe=5DAC06B2"),a("Geen inspiratie voor vaderdag? Met deze draadloze headphones van Aftershokz zit je nooit verkeerd! De Trekz Air comes to daddy voor slechts €119.95. De Trekz Titanium voor maar €79.95\n\nDankzij de Bone Conduction Technology zitten deze oordopjes niet in je oor, maar op je junkbeenderen. Via trillingen wordt het geluid naar je oren gestuurd waardoor je niet afgesloten wordt van omgevingsgeluid, zoals het verkeer.\n\nSuper handig tijdens het sporten dus!","2019/06/03","/img/aftershokz.png"),a("NIEUW: Bezoek onze online outlet shop! Op onze nieuwe outletshop kan je loopschoenen reserveren\nuit onze stock van oudere modellen. Zo kan je je favoriete schoen\naan een ronde prijs op de kop tikken!\n\nSchoenen die je reserveert, worden in de winkel voor je aan de kant gezet\nzonder aankoopverplichting. Je kan ze dus eerst nog passen.\nAfrekenen doe je ook in de winkel zelf.\n\nWe breiden de outletshop regelmatig uit, dus hou onze website zeker in de gaten.\nMomenteel staan er zelfs enkele tennisrackets op aan ronde prijzen!","2019/04/01","/img/promoshop.png"),a("Marathon ready met de Polar Vantage M. De Vantage M limited edition is vanaf nu bij ons te verkrijgen. Je ontvangt een gratis polsband bij je aankoop.","2019/03/21","/img/vantagem.png"),a("Onze Online Outlet Shop opent binnenkort! Ontdek meer op shop.rensport.be","2019/03/15","/img/shop_preview.PNG"),a("20% korting op interclub outfits! Nu bij Ren: 20% korting bij elke aankoop van minstens 2 tennis outfits voor Interclub teams.","2019/03/10","/img/headers/duo_interclub.jpg")]},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],a={monday:"M.",tuesday:"D.",wednesday:"W.",thursday:"D.",friday:"V.",saturday:"Z.",sunday:"Z."};function o(e,t){let n=document.createElement("tr");e===r[(new Date).getDay()-1]&&(n.className="ren-openingsuren-currentday");let o=document.createElement("th"),s=document.createElement("td");return o.innerText=a[e],s.innerText=function(e){let t="";for(let n=0;n<e.length;n+=2)t+=e[n]+" - "+e[n+1],n+1!=e.length-1&&(t+=", ");return t||"Gesloten"}(t),n.appendChild(o),n.appendChild(s),n}function s(e,t){let n=document.createElement("a");n.className="ren-openingsuren-indicator-cta-link",n.href=e;let r=document.createElement("i");return r.className="fa "+t+" fa-lg",n.appendChild(r),n}t.renderOpeningInfo=function(e,t){if(!t)return;switch(t.getAttribute("data-viewtype")){case"modest":!function(e,t){t.appendChild(function(e){let t=document.createElement("table");e.isCurrentlyOpen?t.className="ren-openingsuren-open":t.className="ren-openingsuren-closed";for(let n of r){let r=o(n,e[n]);t.appendChild(r)}return t}(e)),t.appendChild(function(e){let t,n=document.createElement("div");n.className="ren-openingsuren-modest-indicator",t=document.createElement("span"),t.className="ren-openingsuren-modest-indicator-label";let r=[];switch(r.push(s("mailto:info@rensport.be","fa-envelope")),e.isCurrentlyOpen){case!0:n.className+=" ren-openingsuren-open",t.innerText="Nu open!",r.push(s("tel:+3213667460","fa-phone"));break;case!1:n.className+=" ren-openingsuren-closed",t.innerText="Gesloten"}n.appendChild(t);for(let e of r)n.appendChild(e);return n}(e))}(e,t)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(1),a=n(14);class o extends r.Component{render(){return r.createElement("div",null,r.createElement(s,null),r.createElement(a.Navbar,{activeContext:this.props.activeContext}))}}t.PageHeader=o;class s extends r.Component{render(){return r.createElement("div",{className:"ren-main-logo-container"},r.createElement("img",{className:"ren-main-logo-img",src:"/img/logo.png"}))}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(1);class a extends r.Component{render(){return r.createElement("nav",{className:"navbar ren-black-background"},r.createElement("div",{className:"container-fluid ren-navbar-container"},r.createElement("div",{className:"navbar-header"},r.createElement(o,null)),r.createElement("div",{className:"collapse navbar-collapse",id:"bs-example-navbar-collapse-1"},r.createElement("ul",{className:"nav navbar-nav"},r.createElement(s,{title:"Home",link:"/",active:"home"===this.props.activeContext}),r.createElement(s,{title:"Sportvoeding",link:"/sportvoeding",tooltip:"Ontdek ons assortiment sportvoeding",active:"sportvoeding"===this.props.activeContext}),r.createElement(s,{title:"Merken",link:"/merken",tooltip:"Ontdek al onze merken",active:"merken"===this.props.activeContext}),r.createElement(s,{title:"Contact",link:"/contact",tooltip:"Contacteer ons",active:"contact"===this.props.activeContext})),r.createElement(i,null))))}}t.Navbar=a;class o extends r.Component{render(){return r.createElement("button",{type:"button",className:"navbar-toggle collapsed","data-toggle":"collapse","data-target":"#bs-example-navbar-collapse-1","aria-expanded":"false"},r.createElement("span",{className:"sr-only"},"Toggle navigation"),r.createElement("span",{className:"icon-bar"}),r.createElement("span",{className:"icon-bar"}),r.createElement("span",{className:"icon-bar"}))}}class s extends r.Component{get className(){return`${this.props.active?"active":""} ${this.props.emphasis?"emphasis":""}`}renderLinkWithOutTooltip(){return r.createElement("a",{href:this.props.link},this.props.title)}renderLinkWithTooltip(){return r.createElement("a",{"data-tooltip":!0,title:this.props.tooltip,href:this.props.link},this.props.title)}render(){return r.createElement("li",{className:this.className},this.props.tooltip?this.renderLinkWithTooltip():this.renderLinkWithOutTooltip())}}class i extends r.Component{render(){return r.createElement("ul",{className:"nav navbar-nav navbar-right"},r.createElement("li",null,r.createElement("a",{className:"ren-navbar-sociallink",href:"https://www.facebook.com/rentessenderlo",target:"_blank"},r.createElement("span",{"data-tooltip":!0,title:"Vind ons op Facebook",className:"ren-navbar-sociallink-span-container"},r.createElement("i",{className:"fa fa-facebook fa-lg"})))))}}},function(e,t){e.exports=ReactDOM},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(1);class a extends r.Component{render(){return r.createElement("div",{className:"container-fluid ren-black-background ren-footer"},r.createElement("h5",null,"Design: ",r.createElement("a",{href:"https://be.linkedin.com/in/samgielis",target:"_blank"},"Sam Gielis"),"."))}}t.PageFooter=a},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(18),a=n(19),o=n(20);t.createAnalyticsTracker=function(){return window.location.hostname===a.REN_PRODUCTION_HOSTNAME?new r.GoogleAnalyticsTracker:new o.DummyAnalyticsTracker}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.GoogleAnalyticsTracker=class{constructor(){const e=window.dataLayer=window.dataLayer||[];this._gtag=window.gtag=function(){e.push(arguments)},this._gtag("js",new Date),this._gtag("config","UA-122224869-1")}trackSubscription(e){if(ga)try{this._gtag("event","newsletterSubscription",{eventCategory:"Newsletter",eventAction:"submit",eventLabel:e})}catch(e){console.warn("REN: Er ging iets verkeerd bij het tracken van de Newsletter subscription.")}}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.REN_PRODUCTION_HOSTNAME="rensport.be"},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.DummyAnalyticsTracker=class{constructor(){console.log("REN/ANALYTICS: Instantiating DummyAnalyticsTracker.")}trackSubscription(e){console.log(`REN/ANALYTICS: Tracking new newsletter subscription for ${e}.`)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.NewsletterSubscriptionFormController=class{constructor(e){this._analyticsTracker=e,this._handleSubmission=()=>{let e=document.querySelector(".ren-nieuwsbrief-container"),t=document.getElementById("ren-nieuwsbrief-input-field"),n=document.querySelector("#vr-hidden-input-field"),r=document.querySelector("#vr-hidden-submit-btn");t&&n&&t.value&&r&&(this._analyticsTracker.trackSubscription(t.value),n.value=t.value,r.click(),e.classList.add("ren-nieuwsbrief-subscribed"))},document.addEventListener("DOMContentLoaded",()=>{this._initForm()})}_initForm(){if(!window.VR||!VR.SignupForm)return;if(!document.getElementById("vr-signup-form-17592186047291"))return;const e=document.getElementById("ren-nieuwsbrief-button");e&&(new VR.SignupForm({id:"17592186047291",element:"vr-signup-form-17592186047291",endpoint:"https://marketingsuite.verticalresponse.com/se/",submitLabel:"Submitting...",invalidEmailMessage:"Invalid email address",generalErrorMessage:"An error occurred",notFoundMessage:"Signup form not found",successMessage:"Success!",nonMailableMessage:"Nonmailable address"}),e.addEventListener("click",this._handleSubmission))}}}]);
//# sourceMappingURL=rensport.js.map