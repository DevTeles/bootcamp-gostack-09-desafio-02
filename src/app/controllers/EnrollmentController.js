import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

import BemvindoMail from '../jobs/BemvindoMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async index(req, res) {
    const { page = 1, quatity = 20 } = req.query;

    const enrollments = await Enrollment.findAll({
      order: ['start_date'],
      limit: quatity,
      offset: (page - 1) * quatity,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });

    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;
    /*
     * Check if this student already has an enrollment
     */

    const enrollmentsExists = await Enrollment.findOne({
      where: { student_id },
    });

    if (enrollmentsExists) {
      return res
        .status(401)
        .json({ error: 'A enrollment with this student already exists' });
    }

    /*
     * Check if the plan exists
     */
    const planExists = await Plan.findOne({
      where: { id: plan_id },
    });

    if (!planExists) {
      return res.status(401).json({ error: 'The plan does not exist' });
    }

    // Check is the student exists
    const studentExists = await Student.findOne({
      where: { id: student_id },
    });

    if (!studentExists) {
      return res.status(401).json({ error: 'The student does not exist' });
    }

    /**
     * Calculate the full price and end date.
     */

    const end_date = addMonths(parseISO(start_date), planExists.duration);
    const price = planExists.duration * planExists.price;

    // Cria a matricula
    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    await Queue.add(BemvindoMail.key, {
      start_date,
      planExists,
      studentExists,
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const { student_id, plan_id, start_date } = req.body;

    const enrollment = await Enrollment.findByPk(id);
    const plan = await Plan.findByPk(plan_id);

    /**
     * Check if admin can edit student_id
     */
    if (student_id !== enrollment.student_id) {
      const studentEnrollmentExists = await Enrollment.findOne({
        where: { student_id },
      });

      if (studentEnrollmentExists) {
        return res
          .status(401)
          .json({ error: 'A enrollment with this student already exists' });
      }
    }

    let { price, end_date } = enrollment;

    // Calculate the new end date
    if (start_date !== enrollment.start_date) {
      end_date = addMonths(parseISO(start_date), plan.duration);
    }

    price = req.body.price;

    await enrollment.update(req.body);

    return res.json(enrollment);
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

export default new EnrollmentController();
