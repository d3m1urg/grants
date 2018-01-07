function merge(stack) {
    if (stack.length === 0) {
        throw new Error('Merge stack must contain at least one element');
    }
    const [head, ...tail] = stack;
    let merged = Object.create(head);
    Object.freeze(merged);
    for (const item of tail) {
        const proto = Object.create(merged);
        merged = Object.assign(proto, item);
        Object.freeze(merged);
    }
    return merged;
}
const st = [{ a: 1 }, { b: 2 }, { c: 3 }];
const x = merge(st);
console.log(x.a, x.b, x.c);
console.log(x);
x.a = 2;
console.log(x.a);
console.log(x.__proto__);
