import moment from 'moment';
import 'moment-timezone';

moment.tz.setDefault('Asia/Seoul');
const commands = ['찾아'];

async function execute({ msg, client, actionMessage }) {
  msg.reply(`[${actionMessage}] 개발중..`);
}

export { execute, commands };
