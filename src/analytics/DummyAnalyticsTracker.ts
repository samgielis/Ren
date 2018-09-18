import {AnalyticsTracker} from "./AnalyticsTracker";

export class DummyAnalyticsTracker implements AnalyticsTracker {

    constructor() {
        console.log('REN/ANALYTICS: Instantiating DummyAnalyticsTracker.');
    }

    public trackSubscription(email: string) {
        console.log(`REN/ANALYTICS: Tracking new newsletter subscription for ${email}.`);
    }
}