import {FacebookOpeningInfo} from "./facebookplugins/FacebookOpeningInfo";
import {openingInfoView} from "./view/OpeningInfoView";
import {FacebookFeed} from "./facebookplugins/FacebookFeed";

export class Ren {

    private _openingInfo : FacebookOpeningInfo;
    private _feed : FacebookFeed;

    constructor () {
        this._openingInfo = new FacebookOpeningInfo();
        this._openingInfo.afterLoad(() => {
            let view = openingInfoView(this._openingInfo);
            (<HTMLElement>document.querySelector('#ren-openingsuren')).appendChild(view);
        });
        this._feed = new FacebookFeed();
        this._feed.afterLoad(() => {
            this._feed.renderTo(document.body);
        });
    }

    public get feed () {
        return this._feed;
    }

    public get openingInfo () : FacebookOpeningInfo {
        return this._openingInfo;
    }
}