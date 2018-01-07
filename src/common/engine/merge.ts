function merge<T extends object>(stack: T[]): T {
    if (stack.length === 0) {
        throw new Error('Merge stack must contain at least one element');
    }
    const [head, ...tail] = stack;
    let merged = Object.create(head);
    merged = Object.freeze(merged);
    for (const item of tail) {
        const proto = Object.create(merged);
        merged = Object.assign(proto, item);
        merged = Object.freeze(merged);
    }
    return merged;
}

function deepFreeze<T extends object>(obj: T): T {
    
}

const st = [{ a: 1 }, { b: 2 }, { c: 3 }];

const x = merge(st) as any;

console.log(x.a, x.b, x.c);
console.log(x)

x.a = 2;

console.log(x.a)

console.log(x.__proto__)
