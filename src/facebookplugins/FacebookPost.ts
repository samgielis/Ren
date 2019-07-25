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
        return !this.info.is_hidden && this.info.is_published && this.info.from && this.info.from.id === FB_PAGE_ID && !!this.message;
    }

    public get created () : Date {
        return new Date(this.info.created_time.split('+')[0]);
    }

    public get id () : string {
        return this.info.id;
    }

    public get title () : string {
        if (this.info.title) {
            return this.info.title;
        }
        let firstSentence = this.message.match(firstSentenceRegex) || this.message.match(firstSentenceBeforeNewlineRegex);

        if (firstSentence) {
            return firstSentence.map(function(s){
                return s.replace(/^\s+|\s+$/g,'');
            })[0];
        }

        return "Nieuws";
    }

    public get message () : string {
        return this.info.message;
    }

    public get picture () : ImageTag {
        if (this.info.full_picture) {
            let image = document.createElement('img');
            image.src = this.info.full_picture;
            image.className = 'ren-newsfeed-item-img';
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
        view.className = 'ren-newsfeed-item-container';

        let dateView = this.createDateView();
        view.appendChild(dateView);
        
        let contentView = this.createContentView();
        view.appendChild(contentView);
        
        return view;
    }

    private createContentView () : HTMLElement {
        let contentContainer : HTMLElement = document.createElement('div');
        contentContainer.className = 'ren-content-item-container';

        let newsFeedContentContainer : HTMLElement = document.createElement('div');
        newsFeedContentContainer.className = 'ren-newsfeed-item-content-container';

        if (this.message) {
            let title = document.createElement('h2');
            title.className = 'ren-newsfeed-item-title';
            title.innerHTML = this.title;
            newsFeedContentContainer.appendChild(title);
        }
        
        let picture = this.picture;
        if (picture) {
            newsFeedContentContainer.appendChild(picture);
        }

        if (this.message) {
            let message = document.createElement('p');
            message.className = 'ren-newsfeed-item-text';
            message.innerHTML = this.message && linkify(this.message);
            newsFeedContentContainer.appendChild(message);
        }


        contentContainer.appendChild(newsFeedContentContainer);
        return contentContainer;
    }

    private createDateView () : HTMLElement {
        let dateContainer = document.createElement('div');
        dateContainer.className = 'ren-newsfeed-item-date-container';

        let dateDayLabel = document.createElement('h1');
        dateDayLabel.className = 'ren-newsfeed-item-date-day';
        dateDayLabel.innerText = ''+this.created.getDate();
        dateContainer.appendChild(dateDayLabel);

        let dateMonthYearLabel = document.createElement('h6');
        dateMonthYearLabel.className = 'ren-newsfeed-item-date-month-year';
        dateMonthYearLabel.innerText = months[this.created.getMonth()] + ' ' + this.created.getFullYear();
        dateContainer.appendChild(dateMonthYearLabel);

        return dateContainer;
    }
}

const months : string[] = [
    'Jan', 'Feb', 'Maa', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
];

const firstSentenceRegex : RegExp = /^.*?[\.!\?](?:\s|$)/g;
const firstSentenceBeforeNewlineRegex : RegExp = /^.*?[\n](?:\s|$)/g;