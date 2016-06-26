export abstract class Loadable {

    private _isLoaded : boolean = false;
    private _loadFailed : boolean = false;
    private _waitingForLoadSuccess : (() => any)[] = [];
    private _waitingForLoadFail : (() => any)[] = [];
    
    constructor () {
        this.doLoad();
    }
    
    public get isLoaded () : boolean {
        return this._isLoaded;
    }

    public get hasLoadFailed () : boolean {
        return this._loadFailed
    }

    public afterLoad (loadSuccessCallback : () => any, loadFailCallback? : () => any) : void {
        if (this.isLoaded) {
            loadSuccessCallback();
        } else if (this.hasLoadFailed) {
            if (loadFailCallback){
                loadFailCallback();
            }
        } else {
            this._waitingForLoadSuccess.push(loadSuccessCallback);
            if (loadFailCallback){
                this._waitingForLoadFail.push(loadFailCallback);
            }
        }
    }
    
    protected loadSuccess () : void {
        this._isLoaded = true;
        for (let callback of this._waitingForLoadSuccess) {
            callback();
        }
    }

    public loadFailed (error : string) : void {
        this._loadFailed = true;
        for (let callback of this._waitingForLoadFail) {
            callback();
        }
        throw new Error('Loading failed : ' + error);
    }

    protected abstract doLoad () : void;
}