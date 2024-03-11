import {LogoSearchDataPoint} from "./LogoSearchDataSet";

export class LogoSearchFactory {

    static buildDataPointview (dataPoint : LogoSearchDataPoint) : HTMLElement {
        let root : HTMLElement = div('logosearch-datapoint col-sm-2');

        let logoContainer : HTMLElement = div('logosearch-logo-container');

        let logoImg : HTMLImageElement = img('logosearch-logo', dataPoint.img);

        let nameLabel : HTMLElement = p('logosearch-name', dataPoint.name);

        logoContainer.appendChild(logoImg);
        root.appendChild(logoContainer);
        root.appendChild(nameLabel);

        return root;
    }

    static buildSearchBar () : HTMLElement {
        let form : HTMLElement = div('logosearch-searchbar form-group');

        let inputContainer : HTMLElement = div('logosearch-input-container col-sm-12');

        let inputGroup : HTMLElement = div('input-group');

        let searchIcon : HTMLSpanElement  = span('logosearch-searchicon input-group-addon fa fa-search');

        let inputEL : HTMLInputElement = input('logosearch-input form-control', 'text');

        inputGroup.appendChild(searchIcon);
        inputGroup.appendChild(inputEL);
        inputContainer.appendChild(inputGroup);
        form.appendChild(inputContainer);

        return form;
    }
}

function  div (className : string) : HTMLElement {
    let div = document.createElement('div');
    div.className = className;
    return div;
}

function  span (className : string, innerText? : string) : HTMLSpanElement {
    let span = document.createElement('span');
    span.className = className;
    if (innerText) {
        span.innerText = innerText;
    }
    return span;
}

function input (className : string, type : string) : HTMLInputElement {
    let input : HTMLInputElement = document.createElement('input');
    input.className = className;
    input.type = type;
    return input;
}

function img (className : string, src : string) : HTMLImageElement{
    let img : HTMLImageElement = document.createElement('img');
    img.className = className;
    img.src = src;
    return img;
}

function p (className : string, innerText : string) : HTMLParagraphElement {
    let p : HTMLParagraphElement = document.createElement('p');
    p.className = className;
    p.innerText = innerText;
    return p;
}