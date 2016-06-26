export class Event {
    private _type : string;
    private _target : any;

    constructor(type : string, targetObj : any) {
        this._type = type;
        this._target = targetObj;
    }

    public get target() : any {
        return this._target;
    }

    public get type() : string {
        return this._type;
    }
}