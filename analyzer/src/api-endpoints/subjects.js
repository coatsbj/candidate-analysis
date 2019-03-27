import { ObjectId } from 'mongodb';
import ModelBase from '../models/ModelBase';

/**
 * Registers the /subject endpoint for persisting entities
 * @param app
 */
export default (app, routePrefix = '') => {
    app.post(`${routePrefix}/subject`, (req, res) => {
        const subjectModel = req.body;
        if (!subjectModel) {
            res.status(400).send('Request must contain subject entity to persist');
            return;
        }
        if (subjectModel._id) {
            res.status(400).send('Entity to insert may not contain _id property');
            return;
        }

        try {
            const newModel = new ModelBase('subject', req.body);

            newModel.persist()
                .then(result => {
                    if (result === true) {
                        res.json(newModel.rawData);
                        return;
                    }
                    throw new Error('Received false result from persist operation');
                })
                .catch(err => {
                    throw err;
                });
        }
        catch (err) {
            res.status(500).send('Unknown error persisting new subject entity: ' + err);
        }
    });

    /**
     * Update existing subject entity...probably should support a PATCH
     */
    app.put(`${routePrefix}/subject`, (req, res) => {
        const subjectModel = req.body;
        if (!subjectModel) {
            res.status(400).send('Request must contain subject entity to persist');
            return;
        }
        if (subjectModel.id || subjectModel._id) {
            res.status(400).send('Entity to insert must contain id or _id property');
            return;
        }

        try {
            const toSave = new ModelBase('subject', req.body);

            toSave.persist()
                .then(result => {
                    if (result === true) {
                        res.json(toSave.rawData);
                        return;
                    }
                    throw new Error('Received false result from persist operation');
                })
                .catch(err => {
                    throw err;
                });
        }
        catch(err) {
            res.status(500).send('Unknown error persisting new subject entity: ' + err);
        }
    });

    app.delete(`${routePrefix}/subject/:id`, (req, res) => {
        const subjectModel = req.body;

        const subjectId = req.params.id;
        if (!subjectId) {
            res.status(400).send('An ID string must be supplied in the path for a delete operation');
            return;
        }
        else if (!ObjectId.isValid(subjectId)) {
            res.status(400).send('The supplied ID is not a valid mongo ObjectId');
            return;
        }

        try {
            const toDelete = new ModelBase('subject', { _id: req.params.id });

            toDelete.delete()
                .then(result => {
                    if (result === true) {
                        res.ok('Entity successfully deleted');
                    }
                    throw new Error(`Failed to delete subject ${req.params.id}`);
                })
                .catch(err => {
                    throw err;
                });
        }
        catch(err) {
            res.status(500).send(`Unknown error deleting subject having ID of ${req.params.id}: ${err}`);
        }
    });

};