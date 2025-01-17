import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

class AppointmentController {
    async index(req, res) {
        const { page = 1 } = req.query;

        const appointments = await Appointment.findAll({
            where: { userId: req.userId, canceled_at: null },
            order: ['date'],
            attributes: ['id', 'date', 'past'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [{
                model: User,
                as: 'provider',
                attributes: ['id', 'name'],
                include: [{
                    model: File,
                    as: 'avatar',
                    attributes: ['id', 'path', 'url']
                }]
            }]
        });

        return res.ok(appointments);
    }

    async store(req, res) {
        const schema = Yup.object.shape({
            provider_id: Yup.number.required(),
            date: Yup.date().required()

        });

        if (!await schema.isValid(req.body))
            return res.badRequest({ error: 'Validation fails' });

        const { provider_id, date } = req.body;

        const isProvider = await User.findOne({
            where: { id: provider_id, provider: true }
        });

        if (!isProvider) {
            return res.unauthorized({ error: 'You can only create appointments with providers' });
        }

        const hourStart = startOfHour(parseISO(date));

        if (isBefore(hourStart, new Date())) {
            return res.badRequest({ error: 'Past dates are not permitted' });
        }

        const checkAvailability = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart
            },
        });

        if (checkAvailability) {
            return res.badRequest({ error: 'Appointment date not available' });
        }

        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date
        });

        const user = await User.findByPk(req.userId);
        const formattedDate = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h' ", {
            locale: pt
        });

        await Notification.create({
            content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
            user: provider_id
        });

        return res.ok(appointment);
    }

    async delete(req, res) {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'provider',
                attributes: ['name', 'email']
            }, {
                model: User,
                as: 'user',
                attributes: ['name']
            }]
        });

        if (appointment.user_id !== req.userId) {
            return res.unauthorized({ error: "You don't have permission to cancel this appointment" })
        }

        const dateWithSub = subHours(appointment.date, 2);

        if (isBefore(dateWithSub, new Date())) {
            return res.unauthorized({
                error: 'You can only cancel appointments 2 hours in advance.'
            })
        }

        appointment.canceled_at = new Date();

        await appointment.save();

        await Queue.add(CancellationMail.key, {
            appointment
        });

        return res.ok(appointment);
    }
}

export default new AppointmentController(); 