export interface FBResponse {
    error : any;
}

export interface FBHoursResponse extends FBResponse {
    hours : {[moment : string] : string};
    pageid : string;
}

export interface FBFeedResponseObject extends FBResponse {
    feed : FBFeedResponse;
}

export interface FBFeedResponse extends FBResponse {
    data : Array<FBPostResponse>;
}

export interface FBPostResponse extends FBResponse {
    title? : string;
    created_time : string;
    full_picture : string;
    id : string;
    is_hidden : boolean;
    is_published : boolean;
    message : string;
    from : FBAuthorResponse;
}

export interface FBAuthorResponse extends FBResponse {
    name : string;
    id : string;
}