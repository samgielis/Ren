import {FBOpeningInfo} from "./facebookplugins/FBOpeningInfo";
import {FacebookSDK} from "./facebookplugins/FacebookSDK";
import {openingInfoView} from "./view/OpeningInfoView";

export class Ren {

    private _facebookSDK : FacebookSDK;
    private _openingHours : FBOpeningInfo;

    constructor () {
        this._facebookSDK = new FacebookSDK();
        this._facebookSDK.afterLoad(() => {
            this._openingHours = new FBOpeningInfo();
            this._openingHours.afterLoad(() => {
                let view = openingInfoView(this._openingHours);
                (<HTMLElement>document.querySelector('#ren-openingsuren')).appendChild(view);
            });
        });
    }

    public get facebookFeed () {
        return {};
    }

    public get openingHours () : FBOpeningInfo {
        return this._openingHours;
    }

    public get facebookSDK () : FacebookSDK {
        return this.facebookSDK;
    };
}