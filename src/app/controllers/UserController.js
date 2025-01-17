import User from '../models/User';
import * as Yup from 'yup';

class UserController {

    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            password: Yup.string().required().min(6)
        });

        if (!await schema.isValid(req.body)) {
            return res.badRequest({ error: 'Validation fails' })
        }

        const userExists = await User.findOne({ where: { email: req.body.email } });

        if (userExists) {
            return res.badRequest({ error: 'User already exists' });
        }

        const { id, name, email, provider } = await User.create(req.body);

        return res.ok({
            id,
            name,
            email,
            provider,
        });
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            oldPassword: Yup.string().required().min(6),
            password: Yup.string().min(6).when('oldPassword', (oldPassword, field) =>
                oldPassword ? field.required() : field
            ),
            confirmPassword: Yup.string().when('password', (password, field) =>
                password ? field.required().oneOf([Yup.ref('password')]) : field
            )
        });

        if (!await schema.isValid(req.body)) {
            return res.badRequest({ error: 'Validation fails' })
        }
        const { email, oldPassword } = req.body;

        const user = await User.findByPk(req.userId);

        if (email != user.email) {
            const userExists = await User.findOne({ where: { email: req.body.email } });

            if (userExists) {
                return res.badRequest({ error: 'User already exists' });
            }
        }

        if (oldPassword && !await user.checkPassword(oldPassword)) {
            return res.unauthorized({ error: 'Password does not match' })
        }

        const { id, name, provider } = await user.update(req.body);

        return res.ok({
            id,
            name,
            email,
            provider,
        });
    }

}

export default new UserController();