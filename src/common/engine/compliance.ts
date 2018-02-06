import { ComplianceInputActions, ComplianceOutputActions } from './actions';
import { ActionEventEmitter } from './eventemitter';

export class CachingCompliance extends ActionEventEmitter<ComplianceOutputActions> {

    private eventBus: ActionEventEmitter<ComplianceInputActions>;

    constructor(eventBus: ActionEventEmitter<ComplianceInputActions>) {
        super();
        this.eventBus = eventBus;
    }

}
