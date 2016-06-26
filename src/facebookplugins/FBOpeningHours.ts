import {FacebookSDK} from "./FacebookSDK";
import {FBHoursResponse} from "./IFBResponse";
import {Loadable} from "../Loadable";

export class FBOpeningHours extends Loadable {

    public monday : string[] = [];
    public tuesday : string[] = [];
    public wednesday : string[] = [];
    public thursday : string[] = [];
    public friday : string[] = [];
    public saturday : string[] = [];
    public sunday : string[] = [];

    constructor () {
        super();
    }

    // Called by super();
    protected doLoad () : void {
        FacebookSDK.page<FBHoursResponse>(['hours'], (roughdata : FBHoursResponse) => {
            if (!roughdata.error) {
                this.parseData(roughdata);
                this.loadSuccess();
            } else {
                this.loadFailed(roughdata.error);
            }
        });
    }

    private parseData (roughdata : FBHoursResponse) {
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

function dayValue (day : string) {
    if (day === 'mon') {
        return 0;
    } else if (day === 'tue') {
        return 1;
    } else if (day === 'wed') {
        return 2;
    } else if (day === 'thu') {
        return 3;
    } else if (day === 'fri') {
        return 4;
    } else if (day === 'sat') {
        return 5;
    } else if (day === 'sun') {
        return 6;
    }
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