import * as Yup from 'yup';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import HelpOrders from '../models/Help_orders';
import RespostaGymPoint from '../jobs/RespostaGymPoint';
import Queue from '../../lib/Queue';

class HelpOrdersController {
  async index(req, res) {
    const { page = 1, quatity = 20 } = req.query;

    const helpOrders = await HelpOrders.findAll({
      where: {
        answer: null,
      },
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

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id } = req.params;

    // Check is the student exists
    const studentExists = await Student.findOne({
      where: { id: student_id },
    });

    if (!studentExists) {
      return res.status(401).json({ error: 'The student does not exist' });
    }

    // Check if this student already has an enrollment
    const enrollmentsExists = await Enrollment.findOne({
      where: { student_id },
    });

    if (!enrollmentsExists) {
      return res.status(401).json({ error: 'Student is not enrolled' });
    }

    // create question
    const helpOrders = await HelpOrders.create({ ...req.body, student_id });

    return res.json(helpOrders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
      answer_at: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const helpOrders = await HelpOrders.findByPk(id);

    if (!helpOrders) {
      res.status(400).json({ error: 'Help orders does not exist.' });
    }

    const { answer, answer_at } = await helpOrders.update(req.body);

    const student = await Student.findByPk(helpOrders.student_id);

    // Envia o email para fila
    await Queue.add(RespostaGymPoint.key, {
      question: helpOrders.question,
      student,
      answer,
      answer_at,
    });

    return res.json({ answer, answer_at });
  }

  async show(req, res) {
    const helpOrders = await HelpOrders.findAll({
      where: { student_id: req.params.student_id },
    });
    console.log(helpOrders);
    return res.json(helpOrders);
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const enrollment = await Enrollment.findByPk(id);

      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found.' });
      }

      await Enrollment.destroy({ where: { id } });
      return res.status(200).json({ sucess: 'Deleted with sucess.' });
    } catch (err) {
      return res.status(400).json({ erro: 'Delete failed.' });
    }
  }
}

export default new HelpOrdersController();
