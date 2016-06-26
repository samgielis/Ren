export interface FBResponse {
    error : any;
}

export interface FBHoursResponse extends FBResponse {
    hours : {[moment : string] : string};
    pageid : string;
}