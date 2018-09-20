import {GoogleAnalyticsTracker} from "./GoogleAnalyticsTracker";
import {REN_PRODUCTION_HOSTNAME} from "../RenSportConfig";
import {DummyAnalyticsTracker} from "./DummyAnalyticsTracker";

export interface AnalyticsTracker {
    trackSubscription(email: string): void
}

export function createAnalyticsTracker(): AnalyticsTracker {
    if (window.location.hostname === REN_PRODUCTION_HOSTNAME) {
        return new GoogleAnalyticsTracker();
    }
    return new DummyAnalyticsTracker();
}
