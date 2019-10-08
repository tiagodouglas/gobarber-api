import { Router } from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
    const user = await User.create({
        name: 'tiago',
        email: 'tiago.douglas@smn.com.br',
        password_hash: '123443234'
    })

    return res.json(user);
});

export default routes;