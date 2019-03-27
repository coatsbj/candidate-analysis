export const defineEnum = (values) => {};

const validateInput = (o) => {
    if (!o || typeof(o) !== 'object' || (Array.isArray(o) && (Array.isEmpty(o) || o.some(el => typeof(el) !== 'string'))) || Array.isEmpty(Object.keys(o)))
        throw new Error('null/invalid base object - must be non-empty array of strings or string=>primitive object map');
};

const symInner = Symbol('inner');
const symValue = Symbol('value');
const symDefaultVal = Symbol('defaultValue');

export class Enum {
    constructor(elementsMapOrArray, value = null) {
        validateInput(elementsMapOrArray);

        if (Array.isArray(elementsMapOrArray)) {
            if (Array.isEmpty(elementsMapOrArray) || elementsMapOrArray.some(el => typeof(el) !== 'string'))
                throw new Error('invalid base object - must be non-empty array of strings or string=>primitive object map');
            const inner = {};
            elementsMapOrArray.forEach(n => Object.defineProperty(inner, n, { enumerable: true, writable: false, configurable: false, value: n }));
            this[symInner] = inner;
        }
        else if (typeof(elementsMapOrArray) === 'object') {
            this[symInner] = { ...elementsMapOrArray };
        }

        this[symDefaultVal] = Object.values(this[symInner])[0];
        this[symValue] = value || this[symDefaultVal];
    }

    values() { return Object.values(this[symInner]); }
    names() { return Object.keys(this[symInner]); }

    valueOf() { return this[symValue]; }

    toString() { return Object.entries(this[symInner]).find(e => e[1] === this[symValue])[0]; }

    equals(compareTo) {
        return this.valueOf() === compareTo.valueOf();
    }
}