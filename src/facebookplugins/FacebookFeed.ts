import {FBFeedResponseObject} from "./IFBResponse";
import {Loadable} from "../Loadable";
import {FacebookProxy} from "./FacebookProxy";
import {FacebookPost} from "./FacebookPost";
import {parseJSON} from "../util/JSONUtils";

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
                this.addPostsFromResponse(res)
            } else if (!res.error && parseJSON(<any>res) && parseJSON(<any>res).feed && parseJSON(<any>res).feed.data) {
                this.addPostsFromResponse(parseJSON(<any>res));
            } else {
                this.loadFailed(res.error);
            }
        });
    }

    private addPostsFromResponse (res : FBFeedResponseObject) : void {
        for (let post of res.feed.data){
            this._posts.push(new FacebookPost(post));
        }
        this.loadSuccess();
    }

    public get view () : HTMLElement[] {
        let view : HTMLElement[] = [];

        for (let i = 0, displayingPosts = 0; displayingPosts < Math.min(this.posts.length, 5); i++) {
            let post = this.posts[i];
            if (post.canDisplay) {
                view.push(post.view);
                displayingPosts++;
            }
        }
        return view;
    }

    public renderTo (parent : HTMLElement) {
        for (let postView of this.view) {
            parent.appendChild(postView);
        }
    }
}