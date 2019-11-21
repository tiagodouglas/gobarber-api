import { startOfDay, endOfDay, parseISO, parse } from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';
import User from '../models/User';
import Appointment from '../models/Appointment';

class ScheduleController {
    async index(req, res) {
        const checkUserProvider = await User.findOne({
            where: { id: req.userId, provider: true }
        });

        if (!checkUserProvider) {
            return res.unauthorized({ error: 'User is not a provider' });
        }

        const { date } = req.query;
        const parsedDate = parseISO(date);

        const appointments = Appointment.findAll({
            where: {
                provider_id: req.userId,
                canceled_At: null,
                date: {
                    [Op.between]: [
                        startOfDay(parsedDate),
                        endOfDay(parsedDate)
                    ]
                }
            },
            order: ['date']
        });

        return res.ok(appointments);
    }
}

export default new ScheduleController();