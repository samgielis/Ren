import {FBResponse} from "./IFBResponse";
import {Loadable} from "../Loadable";
import {ScriptTag} from "../library/ScriptTag";

const proxyURL = 'https://rensecurityproxy-samgielis.rhcloud.com/';
export const FB_PAGE_ID : string = "215470341909937";

interface IFacebookSDK {
    init : any;
    api (graphpath : string, callback : (response : FBResponse) => any) : void;
}

export class FacebookProxy {

    public static feed  (succ : (info : FBResponse) => void, fail? : () => void) : void {
        FacebookProxy.get('feed', succ, fail);
    }

    public static openinghours  (succ : (info : FBResponse) => void, fail? : () => void) : void {
        FacebookProxy.get('openinghours', succ, fail);
    }
    
    private static get (url : string, succ : (info : FBResponse) => void, fail? : () => void) : void {
        var xhr = new XMLHttpRequest();
        xhr.open('get', proxyURL + url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
            var status = xhr.status;
            if (status == 200) {
                succ(xhr.response);
            } else if(fail) {
                fail();
            }
        };
        xhr.send();
    }
}