const x = {a: {b: {c: 1}}};

const proxy = new Proxy(x, {
    get(target, property, receiver) {
        console.log(property)
        return Reflect.get(target, property, receiver)
        /* switch(property) {
            case 'a': {
                return new Proxy(x, {
                    get(t,p) {
                        console.log('second get', p)
                        switch(p) {
                            case 'b':
                                return { c: 3 }
                            default:
                                'a property';
                        }
                    }
                })
            }
        } */
    }
});

console.log(proxy.a)
console.log(proxy.a.b)
console.log(proxy.a.b.c)

// console.log(Reflect.get(x, 'a', { a: 3 }));

entitlement.add.new
