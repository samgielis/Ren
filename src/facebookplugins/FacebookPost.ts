import {FBPostResponse} from "./IFBResponse";
import {ImageTag} from "../library/ScriptTag";
import {FB_PAGE_ID} from "./FacebookProxy";
import {linkify} from "../util/Linkify";
export class FacebookPost {

    private info : FBPostResponse;

    constructor (info : FBPostResponse) {
        this.info = info;
    }

    public get canDisplay () : boolean {
        return !this.info.is_hidden && this.info.is_published && this.info.from && this.info.from.id === FB_PAGE_ID;
    }

    public get created () : Date {
        return new Date(this.info.created_time);
    }

    public get id () : string {
        return this.info.id;
    }

    public get message () : string {
        return this.info.message;
    }
    
    public get picture () : ImageTag {
        if (this.info.full_picture) {
            let image = document.createElement('img');
            image.src = this.info.full_picture;
            image.style.width = '100%';
            image.style.height = 'auto';
            return image;
        }
        return null;
    }

    public renderTo (parent : HTMLElement) {
        if (this.canDisplay) {
            parent.appendChild(this.view);
        }
    }

    public get view () : HTMLElement {
        let view = document.createElement('div');
        view.className = 'ren-fbpost';
        view.style.width = '500px';

        let header = document.createElement('div');
        header.className = 'ren-fbpost-header';
        header.innerText = this.created.toLocaleDateString();

        let message = document.createElement('p');
        message.className = 'ren-fbpost-text';
        message.innerHTML = this.message && linkify(this.message);

        let picture = this.picture;

        if (header) {view.appendChild(header);}
        if (message) {view.appendChild(message);}
        if (picture) {view.appendChild(picture);}
        return view;
    }
}