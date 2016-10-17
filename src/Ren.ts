import {FacebookOpeningInfo} from "./facebookplugins/FacebookOpeningInfo";
import {FacebookFeed} from "./facebookplugins/FacebookFeed";
import {RenSportConfig} from "./RenSportConfig";

declare var $: any;

export class Ren {

    private _openingInfo : FacebookOpeningInfo;
    private _feed : FacebookFeed;

    constructor () {
        let config : RenSportConfig = (<any>window).RenSportConfig;
        if (config && config.loadHeader) {
            this._loadHeader();
        }

        if (config && config.loadOpeningHours) {
            this._openingInfo = new FacebookOpeningInfo();
            this._openingInfo.afterLoad(() => {
                //let view = openingInfoView(this._openingInfo);
                //(<HTMLElement>document.querySelector('#ren-openingsuren')).appendChild(view);
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

    private _loadHeader () : void {
        document.addEventListener("DOMContentLoaded", () => {
            let hook = $( "#ren-header" );
            hook.load( "/components/header.html" );
        });
    }

    public get openingInfo () : FacebookOpeningInfo {
        return this._openingInfo;
    }

    public subscribeToNewsletter () {
        let input : HTMLInputElement = <HTMLInputElement>document.querySelector('#ren-nieuwsbrief-input-field');
        let hiddenInput : HTMLInputElement = <HTMLInputElement>document.querySelector('#vr-hidden-input-field'),
            hiddenSubmit : HTMLElement = <HTMLElement>document.querySelector('#vr-hidden-submit-btn');

        if (input && input.value && hiddenInput && hiddenSubmit) {
            hiddenInput.value = input.value;
            hiddenSubmit.click();
        }
    }
}