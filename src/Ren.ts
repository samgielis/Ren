import {FacebookOpeningInfo} from "./facebookplugins/FacebookOpeningInfo";
import {FacebookFeed} from "./facebookplugins/FacebookFeed";
import {RenSportConfig} from "./RenSportConfig";
import {renderOpeningInfo} from "./view/OpeningInfoView";
import {AnalyticsTracker, createAnalyticsTracker} from "./analytics/AnalyticsTracker";
import {GoogleAnalyticsTracker} from "./analytics/GoogleAnalyticsTracker";
import {NewsletterSubscriptionFormController} from "./NewsletterSubscriptionFormController";

declare var $: any;

export class Ren {

    private _openingInfo : FacebookOpeningInfo;
    private _feed : FacebookFeed;
    private _analyticsTracker: AnalyticsTracker;

    constructor () {
        this._analyticsTracker = createAnalyticsTracker();
        new NewsletterSubscriptionFormController(this._analyticsTracker);

        let config : RenSportConfig = (<any>window).RenSportConfig;
        if (config && config.loadHeader) {
            this._loadHeader(config.context);
        }

        this._loadFooter();

        if (config && config.loadOpeningHours) {
            this._openingInfo = new FacebookOpeningInfo();
            this._openingInfo.afterLoad(() => {
                renderOpeningInfo(this._openingInfo, <HTMLElement>document.querySelector('#ren-openingsuren-hook'));
            });
        }

        if (config && config.loadNewsFeed) {
            this._feed = new FacebookFeed();
            this._feed.afterLoad(() => {
                this._feed.renderTo(<HTMLElement>document.querySelector('.ren-homepage-newsfeed'));
            });
        }
    }

    public get feed () {
        return this._feed;
    }

    private _loadHeader (context : string) : void {
        document.addEventListener("DOMContentLoaded", () => {
            let hook : any = $( "#ren-header" );
            hook.load( "/components/header.html",
                () => {
                    let contextNavbarElement : HTMLElement = <HTMLElement>document.querySelector('li[data-context-' + context.toLowerCase() + ']');
                    if (contextNavbarElement) {
                        contextNavbarElement.className += 'active';
                    }
                });
        });
    }

    private _loadFooter () : void {
        document.addEventListener("DOMContentLoaded", () => {
            let hook : any = $( "#ren-footer" );
            hook.load( "/components/footer.html");
        });
    }

    public get openingInfo () : FacebookOpeningInfo {
        return this._openingInfo;
    }
}