import {FacebookOpeningInfo} from "./facebookplugins/FacebookOpeningInfo";
import {FacebookFeed} from "./facebookplugins/FacebookFeed";
import {RenSportConfig} from "./RenSportConfig";
import {renderOpeningInfo} from "./view/OpeningInfoView";
import {PageHeader} from "./components/PageHeader/PageHeader";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {PageFooter} from "./components/PageFooter";

declare var $: any;
declare var ga: any;

export class Ren {

    private _openingInfo: FacebookOpeningInfo;
    private _feed: FacebookFeed;

    constructor() {
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
                <PageFooter />,
                document.getElementById("ren-footer")
            );
        });
    }

    public get openingInfo(): FacebookOpeningInfo {
        return this._openingInfo;
    }

    public subscribeToNewsletter() {
        let input: HTMLInputElement = document.querySelector('#ren-nieuwsbrief-input-field') as HTMLInputElement;
        let hiddenInput: HTMLInputElement = document.querySelector('#vr-hidden-input-field') as HTMLInputElement,
            hiddenSubmit: HTMLElement = document.querySelector('#vr-hidden-submit-btn') as HTMLElement;

        if (!input || !hiddenInput || !input.value || !hiddenSubmit) {
            return;
        }

        this._trackSubscription(input.value);

        hiddenInput.value = input.value;
        hiddenSubmit.click();
    }

    private _trackSubscription(email: string): void {
        if (!ga) {
            return;
        }

        try {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Newsletter',
                eventAction: 'submit',
                eventLabel: email
            });
        } catch (e) {
            console.warn('REN: Er ging iets verkeerd bij het tracken van de Newsletter subscription.')
        }
    }
}