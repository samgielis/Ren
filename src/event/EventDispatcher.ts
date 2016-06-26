export class EventDispatcher {
    
    private _listeners : any[];
    
    constructor() {
        this._listeners = [];
    }

    public hasEventListener (type : string, listener : Function) : Boolean {
        var exists : Boolean = false;
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].type === type && this._listeners[i].listener === listener) {
                exists = true;
            }
        }

        return exists;
    }

    public addEventListener (typeStr : string, listenerFunc : Function) : void {
        if (this.hasEventListener(typeStr, listenerFunc)) {
            return;
        }

        this._listeners.push({type :  typeStr, listener :  listenerFunc});
    }

    public removeEventListener (typeStr : string, listenerFunc : Function) : void {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].type === typeStr && this._listeners[i].listener === listenerFunc) {
                this._listeners.splice(i, 1);
            }
        }
    }

    public dispatchEvent (evt : Event) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].type === evt.type) {
                this._listeners[i].listener.call(this, evt);
            }
        }
    }
}