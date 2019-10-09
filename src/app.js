import express from 'express';
import routes from './routes';
import path from 'path';
import './database';

class App {
    constructor() {
        this.server = express();

        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.server.use(express.json());
        this.server.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')));

        this.server.use((_, res, next) => {
            res.ok = (params) => res.status(200).json(params);
            res.badRequest = (params) => res.status(400).json(params);
            res.unauthorized = (params) => res.status(401).json(params);
            next();
        });

    }

    routes() {
        this.server.use(routes);
    }
}

export default new App().server;