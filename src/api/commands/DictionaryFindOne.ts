import moment from 'moment';
import 'moment-timezone';
import { Dictionary } from '../models/Dictionary';
import { BOT_COMMAND_PREFIX } from '../../config/constants';

moment.tz.setDefault('Asia/Seoul');
const commands = ['알려'];

async function execute({ msg, client, actionMessage }) {
  const [commandName] = commands;
  if (!actionMessage)
    return msg.reply(`\`${BOT_COMMAND_PREFIX}${commandName} [찾고자 하는 단어]\`형식으로 입력해주세요.`);
  const dictionary = await Dictionary.findOne({ vocabulary: actionMessage }).populate('user');
  if (!dictionary)
    return msg.reply(
      `[__${actionMessage}__] 검색 결과가 없습니다.\n__${BOT_COMMAND_PREFIX}기억__ 명령을 통해 기록이 가능합니다.`
    );

  const { content, user } = dictionary;
  const { discriminator, username } = user;
  const messages = [`"${actionMessage}" - \`${username}#${discriminator}\``, `${content}`];
  msg.reply(messages.join('\n'));
}

export { execute, commands };
