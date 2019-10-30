import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'price', 'duration'],
    });

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const titleExists = await Plan.findOne({
      where: { title: req.body.title },
    });

    if (titleExists) {
      return res.status(400).json({ error: 'Title already exists.' });
    }

    const { id, title, price, duration } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      price: Yup.number(),
      duration: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const plan = await Plan.findByPk(req.params.id);
    const { title } = req.body;

    const PlanExists = await Plan.findOne({ where: { title } });

    if (PlanExists) {
      return res.status(400).json({ error: 'Plan already exists.' });
    }

    const { price, duration } = await plan.update(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan ID not found.' });
    }

    try {
      await plan.destroy();
      // await plan.destroy({ where: { id: req.params.id } });
      return res.status(200).json({ sucess: 'Deleted with sucess.' });
    } catch (err) {
      return res.status(400).json({ erro: 'Delete failed.' });
    }
  }
}

export default new PlanController();
