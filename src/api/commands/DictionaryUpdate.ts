import moment from 'moment';
import 'moment-timezone';
import { BOT_COMMAND_PREFIX } from '../../config/constants';
import { Dictionary } from '../models/Dictionary';
import { User } from '../models/User';

moment.tz.setDefault('Asia/Seoul');
const commands = ['덮어'];

async function execute({ msg, client, actionMessage }) {
  const [commandName] = commands;
  if (!actionMessage)
    return msg.reply(`\`${BOT_COMMAND_PREFIX}${commandName} [제목] [내용]\`을 통해 내용 덮어쓰기가 가능합니다.`);

  const [searchTitle, ...contentList] = actionMessage.split(' ');
  const content = contentList.join(' ');

  if (!searchTitle || !content)
    return msg.reply(`\`${BOT_COMMAND_PREFIX}${commandName} [제목] [내용]\`을 통해 내용 저장이 가능합니다.`);

  const dictionary = await Dictionary.findOne({ title: searchTitle });
  if (!dictionary) return msg.reply(`등록되지 않은 단어입니다.`);

  const { author } = msg;
  const { username, id, avatar, avatarURL, discriminator } = author;

  const user = await User.findOne({ id });
  dictionary.userId = user.id;
  if (!user) {
    const foundUser = await new User({ username, id, avatar, avatarURL, discriminator }).save();
    dictionary.userId = foundUser.id;
  }

  dictionary.content = content;
  dictionary.updatedAt = new Date();

  const { title } = await dictionary.save();

  msg.reply(`[${title}] 정상적으로 덮어씌웠습니다.`);
}

export { execute, commands };
