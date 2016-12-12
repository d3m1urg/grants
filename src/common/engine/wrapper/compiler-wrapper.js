import Compiler from '../compiler';

import { COMPILER, PROFILE } from '../constants';

const { EVENT: { PROCESS, COMPILED } } = COMPILER;
const { EVENT: { INVALIDATE } } = PROFILE;

const compiler = new Compiler();

function handleMessage({ event, data }) {
  switch (event) {
    case PROCESS:
      compiler.process(data);
      break;
    case INVALIDATE:
      compiler.delete(data);
      break;
    default:
      break;
  }
}

function listenToEvents() {
  compiler.on(COMPILED, (name, entitlements) => {
    process.send({
      event: COMPILED,
      data: { name, entitlements },
    });
  });
  process.on('message', handleMessage);
}

listenToEvents();
