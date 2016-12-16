/* eslint-disable no-constant-condition, no-continue */
import set from 'lodash/set';

export default function (schema) {
  const stack = [];
  const names = [];
  let curr = [...schema.children];
  let elem = null;
  const result = {};
  while (true) {
    if (curr.length > 0) {
      elem = curr.shift();
      names.push(elem.name);
    } else if (stack.length > 0) {
      curr = stack.pop();
      names.pop();
      continue;
    } else {
      break;
    }
    if (elem.children && elem.children.length > 0) {
      stack.push(curr);
      curr = elem.children;
    } else {
      set(result, names, elem.init);
      names.pop();
    }
  }
  return result;
}
