import {FBOpeningHours} from "./facebookplugins/FBOpeningHours";
import {FacebookSDK} from "./facebookplugins/FacebookSDK";

export class Ren {

    private _facebookSDK : FacebookSDK;
    private _openingHours : FBOpeningHours;

    constructor () {
        this._facebookSDK = new FacebookSDK();
        this._facebookSDK.afterLoad(() => {
            this._openingHours = new FBOpeningHours();
        });
    }

    public get facebookFeed () {
        return {};
    }

    public get openingHours () : FBOpeningHours {
        return this._openingHours;
    }

    public get facebookSDK () : FacebookSDK {
        return this.facebookSDK;
    };
}