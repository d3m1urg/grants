import Compliance from '../compliance';

import { COMPLIANCE } from '../constants';

const { SCHEMA: { CHECK, COMPLY, LOAD, LOADED, INVALID: SCHEMA_INVALID },
        ENTITLEMENTS: { VERIFY, VERIFIED, INVALID: ENTITLEMENTS_INVALID } } = COMPLIANCE;

const compliance = new Compliance();

function handleMessage({ event, data }) {
  switch (event) {
    case CHECK:
      compliance.checkSchema(data);
      break;
    case LOAD:
      compliance.loadSchema(data);
      break;
    case VERIFY:
      compliance.verifyEntitlements(data);
      break;
    default:
      break;
  }
}

function listenToEvents() {
  compliance.on(SCHEMA_INVALID, error => process.send({
    event: SCHEMA_INVALID,
    data: { error },
  }));
  compliance.on(COMPLY, name => process.send({
    event: COMPLY,
    data: { name },
  }));
  compliance.on(LOADED, name => process.send({
    event: LOADED,
    data: { name },
  }));
  compliance.on(ENTITLEMENTS_INVALID, error => process.send({
    event: ENTITLEMENTS_INVALID,
    data: { error },
  }));
  compliance.on(VERIFIED, entitlements => process.send({
    event: VERIFIED,
    data: { entitlements },
  }));
  process.on('message', handleMessage);
}

listenToEvents();
