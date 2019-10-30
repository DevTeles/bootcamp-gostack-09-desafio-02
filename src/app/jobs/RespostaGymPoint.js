import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RespostaGymPoint {
  get key() {
    return 'RespostaGymPoint';
  }

  async handle({ data }) {
    const { question, answer, answer_at, student } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Sua questão foi respondida por GymPoint.',
      template: 'respostaGymPoint',
      context: {
        student: student.name,
        question,
        answer,
        answer_at: format(
          parseISO(answer_at),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new RespostaGymPoint();
