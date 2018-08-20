import {FBHoursResponse} from "./IFBResponse";
import {Loadable} from "../Loadable";
import {FacebookProxy} from "./FacebookProxy";
import {parseJSON} from "../util/JSONUtils";
import {STANDARD_OPENING_HOURS} from "./ManualOpeningHours";

export class FacebookOpeningInfo extends Loadable {

    public monday : string[] = [];
    public tuesday : string[] = [];
    public wednesday : string[] = [];
    public thursday : string[] = [];
    public friday : string[] = [];
    public saturday : string[] = [];
    public sunday : string[] = [];

    public get isCurrentlyOpen () : boolean {
        let now : Date = new Date(),
            day = jsValueToDay(now.getDay()),
            infoForDay = (<any>this)[day];

        for (let i = 0; i < infoForDay.length; i+=2) {
            if (liesNowInInterval(infoForDay[i], infoForDay[i+1])){
                return true;
            }
        }
        return false;
    }

    // Called by super();
    protected doLoad () : void {
        FacebookProxy.openinghours((roughdata : FBHoursResponse) => {
            if (!roughdata.error) {
                this.parseData(roughdata);
                this.loadSuccess();
            } else {
                this.loadFailed(roughdata.error);
            }
        }, () => {
            this.parseData(<any>STANDARD_OPENING_HOURS);
            this.loadSuccess();
        });
    }

    private parseData (roughdata : FBHoursResponse) {

        if (typeof roughdata === 'string') {
            roughdata = parseJSON(<any>roughdata);
        }
        
        this.monday = toTimings(Object.keys(roughdata.hours).filter((openingTime) => {
                return openingTime.indexOf('mon') > -1;
            }).sort(compareOpeningInfo), roughdata);
        this.tuesday = toTimings(Object.keys(roughdata.hours).filter((openingTime) => {
                return openingTime.indexOf('tue') > -1;
            }).sort(compareOpeningInfo), roughdata);
        this.wednesday = toTimings(Object.keys(roughdata.hours).filter((openingTime) => {
                return openingTime.indexOf('wed') > -1;
            }).sort(compareOpeningInfo), roughdata);
        this.thursday = toTimings(Object.keys(roughdata.hours).filter((openingTime) => {
                return openingTime.indexOf('thu') > -1;
            }).sort(compareOpeningInfo), roughdata);
        this.friday = toTimings(Object.keys(roughdata.hours).filter((openingTime) => {
                return openingTime.indexOf('fri') > -1;
            }).sort(compareOpeningInfo), roughdata);
        this.saturday = toTimings(Object.keys(roughdata.hours).filter((openingTime) => {
                return openingTime.indexOf('sat') > -1;
            }).sort(compareOpeningInfo), roughdata);
        this.sunday = toTimings(Object.keys(roughdata.hours).filter((openingTime) => {
                return openingTime.indexOf('sun') > -1;
            }).sort(compareOpeningInfo), roughdata);
    }
}

function dayToValue (day : string) : number{
    if (day ==='mon') {
        return 0;
    } else if (day ==='tue') {
        return 1;
    } else if (day ==='wed') {
        return 2;
    } else if (day ==='thu') {
        return 3;
    } else if (day ==='fri') {
        return 4;
    } else if (day ==='sat') {
        return 5;
    } else if (day ==='sun') {
        return 6;
    }
}

function jsValueToDay (value : number) : string{
    if (value === 0) {
        return 'sunday';
    } else if (value === 1) {
        return 'monday';
    } else if (value === 2) {
        return 'tuesday';
    } else if (value === 3) {
        return 'wednesday';
    } else if (value === 4) {
        return 'thursday';
    } else if (value === 5) {
        return 'friday';
    } else if (value === 6) {
        return 'saturday';
    }
}

function jsDayValue (day : string) : number {
    return ((dayToValue(day) + 1) % 7);
}

function compareOpeningInfo (a : string, b : string) {
    let infoA = a.split('_'),
        infoB = b.split('_');

    if (parseInt(infoA[1]) < parseInt(infoB[1])) {
        return -1;
    } else if (parseInt(infoA[1]) > parseInt(infoB[1])){
        return 1;
    } else {
        if (infoA[2] === 'open'){
            return -1;
        } else return 1;
    }
}

function toTimings (openingTime : string[], roughData : FBHoursResponse) : string[] {
    let timings : string[] = [];

    for (let opening of openingTime) {
        timings.push(roughData.hours[opening]);
    }
    return timings;
}

function liesNowInInterval (start : string, end : string) : boolean {

    let now : Date = new Date(),
        startHoursMinutes  = start.split(':'),
        startDate : Date = new Date(),
        startHour : number = parseInt(startHoursMinutes[0]),
        startMinutes : number = parseInt(startHoursMinutes[1]),
        endHoursMinutes  = end.split(':'),
        endDate = new Date(),
        endHour : number = parseInt(endHoursMinutes[0]),
        endMinutes : number = parseInt(endHoursMinutes[1]);

    startDate.setHours(startHour);
    startDate.setMinutes(startMinutes);
    endDate.setHours(endHour);
    endDate.setMinutes(endMinutes);

    return now >= startDate && now < endDate;
}