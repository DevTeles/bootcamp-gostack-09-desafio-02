import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class BemvindoMail {
  get key() {
    return 'BemvindoMail';
  }

  async handle({ data }) {
    const { start_date, studentExists, planExists } = data;

    console.log('A fila executou', start_date, studentExists, planExists);

    await Mail.sendMail({
      to: `${studentExists.name} <${studentExists.email}>`,
      subject: 'Inscrição realizada na acamedia GymPoint.',
      template: 'welcome',
      context: {
        name: studentExists.name,
        title: planExists.title,
        price: planExists.price,
        start_date: format(
          parseISO(start_date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new BemvindoMail();
