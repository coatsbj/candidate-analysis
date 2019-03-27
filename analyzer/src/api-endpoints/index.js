import analysis from './analysis';
import subjects from './subjects';
import {ObjectId} from 'mongodb';
import jwt from 'node-jwt';

const SIG_KEY = 'some-sig-key';
const JWT_AUDIENCE = 'app://candidate-analysis.io';
const PLACEHOLDER_AUTH_USER = 'demo-user';
const PLACEHOLDER_AUTH_PW = 'P@ssw0rd!';

const constructJwt = (username) => {
    return {
        header: {
            alg: 'HS256'
        },
        payload: {
            aud: JWT_AUDIENCE,
            exp: new Date().valueOf() + (10 * 60 * 1000),
            sub: username
        }
    };
};

const validateToken = (sessionToken, renewExpired = false) => {
    const token = typeof(sessionToken) === 'object'
        ? sessionToken
        : jwt.decodeToken(sessionToken);

    if (!(jwt.isSignatureValid(token, SIG_KEY) && jwt.isAudienceValid(token, JWT_AUDIENCE))) {
        return null;
    }

    if (jwt.isExpired(token)) {
        return renewExpired ? constructJwt(token.payload.sub) : null;
    }

    return token;
};

// A hook which registers one or more endpoints on the demo server (right now we just have /student-test)
export const registerRoutes = (app, routePrefix = '') => {
    console.log('registering base param handlers');

    // Add an up-front check to make sure any id param value in an endpoint is validated against the BSON ObjectID type
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

    app.param('session-token', (req, res, next, value) => {
        if (!value)
            next();

        const token = validateToken(value);
        if (token === null) {
            res.status(401).send('Session authentication invalid or expired!');
        }

        req._authJwt = token;

        next();
    });

    app.post(`${routePrefix}/authenticate`, (req, res) => {
        const { body } = req;

        if (req._authJwt) {

        }

        if (!(body.username && body.password)) {
            return res.status(400).send('Invalid authentication request');
        }

        // TEMP
        if (!(body.username === PLACEHOLDER_AUTH_USER && body.password === PLACEHOLDER_AUTH_PW)) {
            return res.status(403).send('Invalid username or password');
        }



        const jwt = jwt.encodeToken(jwtObj);
    });

    console.log('registering app endpoints');

    // Analysis endoints
    analysis(app, routePrefix);

    // Subject (models) endpoint
    subjects(app, routePrefix);
};

export default registerRoutes;