import moment from 'moment';
import 'moment-timezone';
import { BOT_COMMAND_PREFIX } from '../../config/constants';
import { Dictionary } from '../models/Dictionary';
import { User } from '../models/User';

moment.tz.setDefault('Asia/Seoul');
const commands = ['잊어'];

async function execute({ msg, client, actionMessage }) {
  const [commandName] = commands;
  if (!actionMessage) return msg.reply(`\`${BOT_COMMAND_PREFIX}${commandName} [단어]\`을 통해 내용 삭제가 가능합니다.`);

  const dictionary = await Dictionary.findOne({ title: actionMessage });
  if (!dictionary) return msg.reply(`존재하지 않는 단어입니다.`);

  const { author } = msg;
  const { username, id, avatar, avatarURL, discriminator } = author;

  if (dictionary.userId != id) return msg.reply('자신이 등록한 단어만 삭제할 수 있습니다.');

  await dictionary.remove();
  msg.reply(`[${actionMessage}] 정상적으로 삭제되었습니다.`);
}

export { execute, commands };
