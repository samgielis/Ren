import {GoogleAnalyticsTracker} from "./GoogleAnalyticsTracker";

export interface AnalyticsTracker {
    trackSubscription(email: string): void
}

export function createAnalyticsTracker(): AnalyticsTracker {
    return new GoogleAnalyticsTracker();
}
