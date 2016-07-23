import {FBFeedResponseObject} from "./IFBResponse";
import {Loadable} from "../Loadable";
import {FacebookProxy} from "./FacebookProxy";
import {FacebookPost} from "./FacebookPost";

export class FacebookFeed extends Loadable {

    private _posts : Array<FacebookPost> = [];

    constructor () {
        super();
    }

    public get posts () : Array<FacebookPost> {
        return this._posts;
    }

    // Called by super();
    protected doLoad () : void {
        FacebookProxy.feed((res : FBFeedResponseObject) => {
            if (!res.error && res.feed && res.feed.data) {
                for (let post of res.feed.data){
                    this._posts.push(new FacebookPost(post));
                }
                this.loadSuccess();
            } else {
                this.loadFailed(res.error);
            }
        });
    }

    public get view () : HTMLElement {
        let view = document.createElement('div');
        view.className = 'ren-fbfeed';
        view.style.marginLeft = '1em';
        view.style.fontFamily = 'Lato, sans-serif'; // 'SSPIKA, verdana, tahoma';

        for (let post of this.posts) {
            post.renderTo(view);
        }
        return view;
    }

    public renderTo (parent : HTMLElement) {
        parent.appendChild(this.view);
    }
}