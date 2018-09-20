import {FacebookOpeningInfo} from "./facebookplugins/FacebookOpeningInfo";
import {FacebookFeed} from "./facebookplugins/FacebookFeed";
import {RenSportConfig} from "./RenSportConfig";
import {renderOpeningInfo} from "./view/OpeningInfoView";
import {PageHeader} from "./components/PageHeader/PageHeader";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {PageFooter} from "./components/PageFooter";
import {AnalyticsTracker, createAnalyticsTracker} from "./analytics/AnalyticsTracker";
import {NewsletterSubscriptionFormController} from "./NewsletterSubscriptionFormController";

declare var $: any;

export class Ren {

    private _openingInfo: FacebookOpeningInfo;
    private _feed: FacebookFeed;
    private _analyticsTracker: AnalyticsTracker;

    constructor() {
        this._analyticsTracker = createAnalyticsTracker();
        new NewsletterSubscriptionFormController(this._analyticsTracker);
        let config: RenSportConfig = (window as any).RenSportConfig;

        if (config && config.loadHeader) {
            this._loadHeader(config.context);
        }

        this._loadFooter();

        if (config && config.loadOpeningHours) {
            this._openingInfo = new FacebookOpeningInfo();
            this._openingInfo.afterLoad(() => {
                renderOpeningInfo(this._openingInfo, document.querySelector('#ren-openingsuren-hook') as HTMLElement);
            });
        }

        if (config && config.loadNewsFeed) {
            this._feed = new FacebookFeed();
            this._feed.afterLoad(() => {
                this._feed.renderTo(document.querySelector('.ren-homepage-newsfeed') as HTMLElement);
            });
        }
    }

    public get feed() {
        return this._feed;
    }

    private _loadHeader(context: string): void {
        document.addEventListener("DOMContentLoaded", () => {
            ReactDOM.render(
                <PageHeader activeContext={context}/>,
                document.getElementById("ren-header")
            );
        });
    }

    private _loadFooter(): void {
        document.addEventListener("DOMContentLoaded", () => {
            ReactDOM.render(
                <PageFooter/>,
                document.getElementById("ren-footer")
            );
        });
    }

    public get openingInfo(): FacebookOpeningInfo {
        return this._openingInfo;
    }
}