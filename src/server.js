process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

if (typeof(Array.isEmpty) !== 'function') {
    Array.isEmpty = function isEmpty(arr) {
        return !(Array.isArray(arr) && arr.length > 0);
    };
}


if (typeof(Array.prototype.contains) !== 'function') {
    Array.prototype.contains = function doesContain(entry) {
        return !(this.length === 0 || this.indexOf(entry) === -1);
    };
}

if (typeof(Array.prototype.remove) !== 'function') {
    Array.prototype.remove = function removeEntry(entry) {
        if (this.length === 0)
            return false;

        const idx = this.indexOf(entry);
        if (idx === -1)
            return false;

        if (idx === (this.length - 1))
            this.length -= 1;
        else if (idx === 0)
            this.splice(0,1);
        else {
            const tmp = this.slice(0);
            this.length = 0;
            tmp.forEach((val, i) => {
                if (i !== idx)
                    this.push(val);
            });
        }

        return true;
    };
}

if (typeof(Array.prototype.flatMap) !== 'function') {
    Array.prototype.flatMap = function flatMap(mapFn) {
        if (this.length === 0)
            return [];

        if (!mapFn)
            throw new Error('Mapping function must be supplied!');

        return this.map(mapFn).reduce(function(aggregatedArray, mappedEntry) {
            if (!mappedEntry)
                return aggregatedArray;

            if (Array.isArray(mappedEntry)) {
                if (mappedEntry.length === 0)
                    return aggregatedArray;

                return aggregatedArray.concat(mappedEntry);
            }

            return aggregatedArray.push(mappedEntry);
        }, []);
    };
}

const express = require('express');
const bodyParser = require('body-parser');
const childProcess = require('child_process');
const PORT = 8080;

let apiApp;
let apiAppServer;

apiApp = express();
apiApp.use(bodyParser.json());

apiApp.post('/process-application', (req, res) => {
    // You'll create your note here.
    res.status(500).send('STILL not implemented - PR test');
});

apiAppServer = apiApp.listen(PORT, () => {
    console.log('API is live on ' + PORT);
});
