import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import routes from './routes';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import sentryConfig from './config/sentry';
import path from 'path';

import './database';

class App {
    constructor() {
        this.server = express();

        Sentry.init(sentryConfig);

        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.server.use(Sentry.Handlers.requestHandler());
        this.server.use(express.json());
        this.server.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')));

        this.server.use((_, res, next) => {
            res.ok = (params) => res.status(200).json(params);
            res.badRequest = (params) => res.status(400).json(params);
            res.unauthorized = (params) => res.status(401).json(params);
            res.error = (params) => res.status(500).json(params);
            next();
        });

    }

    routes() {
        this.server.use(routes);
        this.server.use(Sentry.Handlers.errorHandler());
    }

    exceptionHandler() {
        this.server.use(async (err, req, res, next) => {
            if (process.env.NODE_ENV === 'development') {
                const errors = await new Youch(err, req).toJSON();

                return res.error(errors);
            }

            return res.error({error: 'Internal server error'});
        });
    }
}

export default new App().server;