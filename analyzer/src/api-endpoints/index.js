import analysis from './analysis';
import subjects from './subjects';
import {ObjectId} from 'mongodb';

// A hook which registers one or more endpoints on the demo server (right now we just have /student-test)
export const registerRoutes = (app) => {
    console.log('registering base param handlers');

    // Add an up-front check to make sure any id param value in an endpoint is validated against the BSON ObbjectID type
    app.param('id', (req, res, next, value) => {
        // if (!value) {
        //     res.status(400).send('An ID string must be supplied in the path for this operation');
        //     return;
        // }

        if (value && !ObjectId.isValid(value)) {
            res.status(400).send('The supplied ID is not a valid mongodb ObjectId');
            return;
        }
        next();
    });

    console.log('registering app endpoints');

    // Analysis endoints
    analysis(app);

    // Subject (models) endpoint
    subjects(app);
};

export default registerRoutes;