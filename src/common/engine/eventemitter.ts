import { EventEmitter } from 'eventemitter3';

import { Action } from './models';

export class ActionEventEmitter<A extends Action> extends EventEmitter {

    constructor() {
        super();
    }

    emitAction(action: A): boolean {
        const { type, id } = action;
        if (typeof id === 'string') {
            return this.emit(id, action);
        }
        return this.emit(type, action);
    }

}
