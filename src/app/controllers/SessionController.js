import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
    async store(req, res) {
        const schema = Yup.object().shape({
            email: Yup.string().required(),
            password: Yup.string().required()
        });

        if (!await schema.isValid(req.body)) {
            return res.badRequest({ error: 'Validation fails' })
        }

        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.unauthorized({ error: 'User not found' });
        }

        if (!await user.checkPassword(password)) {
            return res.unauthorized({ error: 'Password does not match' });
        }

        const { id, name } = user;

        return res.ok({
            user: {
                id,
                name,
                email,
            },
            token: jwt.sign({ id }, authConfig.secret, { expiresIn: authConfig.expiresIn })
        });
    }

}

export default new SessionController();