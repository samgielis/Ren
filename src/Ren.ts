import {FBOpeningInfo} from "./facebookplugins/FBOpeningInfo";
import {FacebookSDK} from "./facebookplugins/FacebookSDK";
import {openingInfoView} from "./view/OpeningInfoView";

export class Ren {

    private _facebookSDK : FacebookSDK;
    private _openingInfo : FBOpeningInfo;

    constructor () {
        this._facebookSDK = new FacebookSDK();
        this._facebookSDK.afterLoad(() => {
            this._openingInfo = new FBOpeningInfo();
            this._openingInfo.afterLoad(() => {
                let view = openingInfoView(this._openingInfo);
                (<HTMLElement>document.querySelector('#ren-openingsuren')).appendChild(view);
            });
        });
    }

    public get facebookFeed () {
        return {};
    }

    public get openingInfo () : FBOpeningInfo {
        return this._openingInfo;
    }

    public get facebookSDK () : FacebookSDK {
        return this.facebookSDK;
    };
}