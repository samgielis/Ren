import {FBOpeningInfo} from "../facebookplugins/FBOpeningInfo";

const days : string[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const daysTranslation : {[day : string] : string} = {
    'monday' : 'Maandag',
    'tuesday' : 'Dinsdag',
    'wednesday' : 'Woensdag',
    'thursday' : 'Donderdag',
    'friday' : 'Vrijdag',
    'saturday' : 'Zaterdag',
    'sunday' : 'Zondag'
};

export function openingInfoView (openingInfo : FBOpeningInfo) : HTMLElement {
    let root : HTMLElement = document.createElement('div');
    for (let day of days) {
        let dayview = dayView(day, (<any>openingInfo)[day]);
        root.appendChild(dayview);
    }
    root.appendChild(currentlyOpenView(openingInfo.isCurrentlyOpen));
    return root;
}

function dayView (day : string, hours : string[]) : HTMLElement {
    let dayview = document.createElement('div'),
        hourview : string = hourView(hours);
    dayview.innerHTML = daysTranslation[day] + ' : ' + hourview;
    return dayview;
}

function hourView (hours : string[]) : string {
    let hourview = '';
    for (let i = 0; i < hours.length; i+=2) {
        hourview += hours[i] + ' - ' + hours[i+1];
        if (i+1 != hours.length-1) {
            hourview += ', ';
        }
    }
    return hourview || 'Gesloten';
}

function currentlyOpenView (currentlyOpen : boolean) : HTMLElement {
    let view = document.createElement('p');
    if (currentlyOpen) {
        view.innerHTML = 'Nu Open!';
    } else {
        view.innerHTML = 'Momenteel gesloten';
    }
    return view;
}