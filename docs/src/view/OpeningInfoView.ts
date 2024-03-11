import {FacebookOpeningInfo} from "../facebookplugins/FacebookOpeningInfo";

const days : string[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const daysTranslation : {[day : string] : string} = {
    'monday' : 'M.',
    'tuesday' : 'D.',
    'wednesday' : 'W.',
    'thursday' : 'D.',
    'friday' : 'V.',
    'saturday' : 'Z.',
    'sunday' : 'Z.'
};

export function renderOpeningInfo (openingInfo : FacebookOpeningInfo, root : HTMLElement) : void {
    if (!root) {
        return;
    }
    
    let type = root.getAttribute('data-viewtype');
    switch (type) {
        case 'modest' :
            renderModestOpeningInfoView(openingInfo, root);
    }
    /*let root : HTMLElement = document.createElement('div');
    for (let day of days) {
        let dayview = dayView(day, (<any>openingInfo)[day]);
        root.appendChild(dayview);
    }
    root.appendChild(currentlyOpenView(openingInfo.isCurrentlyOpen));
    return root;*/
}

function renderModestOpeningInfoView (openingInfo : FacebookOpeningInfo, root : HTMLElement) : void {
    root.appendChild(modestWeekView(openingInfo));
    root.appendChild(modestIsOpenIndicator(openingInfo));
}

function modestIsOpenIndicator (openingInfo : FacebookOpeningInfo) : HTMLElement {
    let container : HTMLElement = document.createElement('div');
    container.className = 'ren-openingsuren-modest-indicator';

    let indicatorText : HTMLSpanElement;
    indicatorText = document.createElement('span');
    indicatorText.className = 'ren-openingsuren-modest-indicator-label';

    let contactOptions : Array<HTMLElement> = [];
    contactOptions.push(modestActNowLink('mailto:info@rensport.be', 'fa-envelope'));

    switch (openingInfo.isCurrentlyOpen) {
        case true :
            container.className += ' ren-openingsuren-open';
            indicatorText.innerText = 'Nu open!';
            contactOptions.push(modestActNowLink('tel:+3213667460', 'fa-phone'));
            break;
        case false :
            container.className += ' ren-openingsuren-closed';
            indicatorText.innerText = 'Gesloten';
            break;
    }

    container.appendChild(indicatorText);

    for (let contactOption of contactOptions) {
        container.appendChild(contactOption);
    }

    return container;

}

function modestWeekView (openingInfo : FacebookOpeningInfo) : HTMLElement {
    let table : HTMLTableElement = document.createElement('table');

    if (openingInfo.isCurrentlyOpen) {
        table.className = 'ren-openingsuren-open';
    } else {
        table.className = 'ren-openingsuren-closed';
    }
    
    for (let day of days) {
        let dayview : HTMLTableRowElement = modestDayView(day, (<any>openingInfo)[day]);
        table.appendChild(dayview);
    }

    return table;
}

function modestDayView (day : string, hours : string[]) : HTMLTableRowElement {
    let tableRow : HTMLTableRowElement = document.createElement('tr');
    if (day === days[new Date().getDay() - 1]) {
        tableRow.className = 'ren-openingsuren-currentday';
    }

    let dayview : HTMLTableDataCellElement = document.createElement('th'),
        hourview : HTMLTableDataCellElement = document.createElement('td');

    dayview.innerText = daysTranslation[day];
    hourview.innerText = modestHourView(hours);


    tableRow.appendChild(dayview);
    tableRow.appendChild(hourview);

    return tableRow;
}

function modestHourView (hours : string[]) : string {
    let hourview = '';
    for (let i = 0; i < hours.length; i+=2) {
        hourview += hours[i] + ' - ' + hours[i+1];
        if (i+1 != hours.length-1) {
            hourview += ', ';
        }
    }
    return hourview || 'Gesloten';
}

function modestActNowLink (href : string, iconName : string) : HTMLElement {

    let a = document.createElement('a');
    a.className = 'ren-openingsuren-indicator-cta-link';
    a.href = href;

    let icon = document.createElement('i');
    icon.className = 'fa ' + iconName + ' fa-lg';

    a.appendChild(icon);

    return a;
}