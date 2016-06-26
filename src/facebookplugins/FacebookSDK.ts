import {EventDispatcher} from "../event/EventDispatcher";
import {FBResponse} from "./IFBResponse";
import {Loadable} from "../Loadable";

const FB_GRAPH_URI = 'https://graph.facebook.com/';
const PAGE_ID = '215470341909937';
const I_LIKE_GIN_TONIC = ['ZGJjNzEyZTkwZTE4MDg1Yjg2YWVhYjZjYmEyMDY5ZjY=', 'fA==', 'NTk4NzA1MjczNjM3MTIz', 'JmFjY2Vzc190b2tlbj0='];

interface IFacebookSDK {
    init : any;
    api (graphpath : string, callback : (response : FBResponse) => any) : void;
}

export class FacebookSDK extends Loadable {
    
    constructor () {
        super();
    }
    
    // Called by super();
    protected doLoad () : void {
        (<any>window).fbAsyncInit = () => {
            (<any>window).FB.init({
                appId      : '598705273637123',
                xfbml      : true,
                version    : 'v2.6'
            });
            this.loadSuccess();
        }
    }
    
    private static get sdk () : IFacebookSDK {
        return (<any>window).FB;
    }

    public static page<T extends FBResponse> (fields : string[], callback : (response : T) => any) {
        let uri : string = FB_GRAPH_URI + PAGE_ID + '?fields=' + fields.join(',') + candy();
        FacebookSDK.sdk.api(uri, callback);
    }

    public  static api (graphid : string, fields : string[]) {
        let uri : string = FB_GRAPH_URI + graphid + '?fields=' + fields.join(',') + candy();
    }
}

function candy () : string {
    return I_LIKE_GIN_TONIC.reverse().map((e) => {return atob(e)}).join('');
}