import {AnalyticsTracker} from "./AnalyticsTracker";

declare var ga: any;

export class GoogleAnalyticsTracker implements AnalyticsTracker {

    private _gtag: (eventName: string, ...parameters: any[]) => void;

    constructor() {
        const dataLayer = (<any>window).dataLayer = (<any>window).dataLayer || [];
        this._gtag = (<any>window).gtag = function () {
            dataLayer.push(arguments);
        };
        this._gtag('js', new Date());
        this._gtag('config', 'UA-122224869-1');
    }

    public trackSubscription(email: string) {
        if (!ga) {
            return;
        }

        try {
            this._gtag('event', 'newsletterSubscription', {
                eventCategory: 'Newsletter',
                eventAction: 'submit',
                eventLabel: email
            });
        } catch (e) {
            console.warn('REN: Er ging iets verkeerd bij het tracken van de Newsletter subscription.')
        }
    }
}