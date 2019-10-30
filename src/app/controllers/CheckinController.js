import * as Yup from 'yup';
import { startOfDay, endOfDay, format, subDays, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Student from '../models/Student';
import Checkin from '../models/Checkin';
import Enrollment from '../models/Enrollment';

class CheckinController {
  async index(req, res) {
    const { page = 1, quatity = 20 } = req.query;

    const checkin = await Checkin.findAll({
      where: { student_id: req.body.student_id },
      limit: quatity,
      offset: (page - 1) * quatity,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(checkin);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id } = req.body;

    // Check is the student exists
    const studentExists = await Student.findOne({
      where: { id: student_id },
    });

    if (!studentExists) {
      return res.status(401).json({ error: 'The student does not exist' });
    }

    const enrollmentExists = await Enrollment.findOne({
      where: { student_id },
    });

    if (!enrollmentExists) {
      return res.status(400).json({ error: 'Student has not enrollment.' });
    }

    // checks 5 check ins within 7 calendar days
    const oldDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    const qtdCheckinStudent = await Checkin.count({
      where: {
        student_id: req.body.student_id,
        created_at: {
          [Op.between]: [startOfDay(parseISO(oldDate)), endOfDay(new Date())],
        },
      },
    });

    if (qtdCheckinStudent === 5) {
      return res.status(401).json({ error: 'maximum login reached.' });
    }

    // Cria a matricula
    const checkin = await Checkin.create(req.body);

    return res.json(checkin);
  }
}

export default new CheckinController();
