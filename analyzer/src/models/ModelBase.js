import MongoClient, {ObjectId} from 'mongodb';
import {buildPseudoUUID} from '../common/helpers';
import { constants } from 'candidate-analysis-core';

const { dbConfig } = constants;

const getMongoErrMsg = (modelType, err, action = 'persist', id = null) => {
    const isNew = !id;

    let retVal = `Failed to ${action} ${isNew ? 'new ' : ''}${modelType} entity${isNew ? ':' : ` having ID of ${id}:`} ${err}`;


    return retVal;
};

const setId = (id, data) => {
    if (!id)
        return;
    let idString = id.toString().replace('ObjectId("', '').replace('")', '');
    data._id = ObjectId(idString);
    data.id && delete data.id;
};

export const buildExtensibilityMap = (knownProps, rawData) => {
    const retVal = {};
    Object.entries(rawData).filter(e => knownProps.indexOf(e[0]) === -1).forEach(entry => {
        retVal[entry[0]] = entry[1];
    });
    return retVal;
};

const symData = Symbol('data');
const symCollectionName = Symbol('collectionName');
const symModelType = Symbol('type');
const symId = Symbol('id');

/**
 * Base model supporting mongodb persistence - standalone or extended
 */
export default class ModelBase {
    constructor(modelType, data = null) {
        this[symData] = data;
        this[symModelType] = modelType;
        this[symCollectionName] = modelType.replace(/(\s|\.|\-)+/g, '_');

        if (this[symData]) {
            // Should we take the full-facade approach with extensibility map/etc?
            //this[symExtra] = buildExtensibilityMap(knownAttributes, rawData);
            const id = data.id || data._id;
            setId(id, this[symData]);
            this[symId] = this[symData]._id.toString();
        }
    }

    /**
     * Unique identifier for the entity (as string)
     * @return {string|null}
     */
    get id() { return this[symId]; }

    /**
     * The type of entity represented by the instance - used by default as the collection name for persistence
     * @return {*}
     */
    get type() { return this[symModelType]; }

    /**
     * Underlying POJO represented by this model
     * @return {*}
     */
    get rawData() { return this[symData]; }
    set rawData(data) {
        this[symData] = data;
        this[symId] = !(data && data._id)
            ? null
            : data._id.toString();
    }

    /**
     * Gets arbitrary property value
     * @param propertyName {string}
     * @param ifAbsent {*|null} a default value if the property is not found/valued
     * @return {*}
     */
    get(propertyName, ifAbsent = null) {
        return this[symData][propertyName] || ifAbsent;
    }

    /**
     * Set an arbitrary property value
     * @param propertyName {string}
     * @param value {*|null}
     * @param onlyIfNull {boolean} will only set the property if it is not currently valued
     * @param typeConstraint {*|string} the standard primitive type name if type should be constrained
     */
    set(propertyName, value, onlyIfNull = false, typeConstraint = null) {
        if (onlyIfNull && !!this[symExtra][propertyName])
            return;

        if (typeConstraint && typeof(typeConstraint) === 'string' && values !== null && typeof(value) !== typeConstraint)
            throw new Error(`invalid value supplied for Person.${propertyName}: expected ${typeConstraint}`);

        this[symData][propertyName] = value;
    }

    persist(dbName = dbConfig.defaultDbName, hostname = dbConfig.defaultHostname) {
        if (!this.rawData)
            throw new Error('Cannot persist an empty model (model has not been initialized with any data)');

        return MongoClient.connect(hostname)
            .then(cli => {
                const collection = cli.database(dbName).collection(this[symCollectionName]);

                if (!this.id) {
                    return collection.insertOne(this.rawData)
                        .then(res => {
                            if (res.insertedCount !== 1) {
                                throw new Error('Unknown failure on inserting new model entity');
                            }

                            this.rawData._id = res.insertedId;
                            this[symId] = this.rawData._id.toString();

                            return cli.close()
                                .then(() => true)
                                .catch(() => true);
                        })
                        .catch(err => {
                            const postSave = () => {
                                console.error(getMongoErrMsg(this.type, err));
                                return false;
                            };

                            return cli.close()
                                .then(postSave)
                                .catch(postSave);
                        });
                }

                return collection.save(this.rawData)
                    .then(() => {
                        return cli.close()
                            .then(() => true)
                            .catch(() => true);
                    })
                    .catch(err => {
                        const postSave = () => {
                            console.error(getMongoErrMsg(this.type, err, 'update', this[symId]));
                            return false;
                        };

                        return cli.close()
                            .then(postSave)
                            .catch(postSave);
                    });
            })
            .catch(err => {
                console.error(getMongoErrMsg(this.type, `Failed to connect to mongo at ${hostname}`, this.id), err);
                return false;
            });
    }

    delete(dbName = dbConfig.defaultDbName, hostname = dbConfig.defaultHostname) {
        if (!this.id)
            throw new Error('Cannot delete a model which has not been persisted (has a null UID)');

        return MongoClient.connect(hostname)
            .then(cli => {
                const collection = cli.database(dbName).collection(this[symCollectionName]);

                return collection.deleteOne({_id: this.rawData._id})
                    .then(() => true)
                    .catch(err => {
                        console.error(getMongoErrMsg(this.type, err, 'delete', this.id));
                        return false;
                    });
            })
            .catch(err => {
                console.error(getMongoErrMsg(this.type, `Failed to connect to mongo at ${hostname}`, 'delete', this.id), err);
                return false;
            });
    }

    /**
     * Produce a serializable representation of the object
     * @return {{*}}
     */
    toPOJO() {
        const { id } = this;

        const retVal = {
            id,
            ...this.rawData // ...this[symExtra] for extensibility map
        };

        // again...extensibility map...
        if (!!retVal._id)
            delete retVal._id;

        return retVal;
    }

    static get knownAttributes() { return [ 'id', '_id', 'uid']; }
}