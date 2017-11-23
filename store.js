const level = require('level');
const { Map, List, fromJS } = require('immutable');

const getKey = map => map.keys().next().value;

const getValue = map => map.first();

const mergeValues = (v1, v2) => v1.mergeDeep(v2);

const openStore = storeLocation => Promise.resolve(level(storeLocation, { valueEncoding: 'json' }));

const storeInDatabase = list => databaseLocation =>
    list.reduce(
        (store, map) => {
            const key = getKey(map);
            const value = getValue(map);
            return new Promise((res, rej) => {
                store.then(
                    db => {
                        db.get(key).then(
                            v => db.put(key, mergeValues(fromJS(v), value)).then(() => res(db)),
                            err => err.message.includes('Key not found') ? db.put(key, value).then(() => res(db)) :
                                        console.log(err)
                        )
                    }
                )
            })
        },
        openStore(location)
    );

module.exports = {
    storeInDatabase
}