import moment from 'moment';
import 'moment-timezone';
import { BOT_COMMAND_PREFIX } from '../../config/constants';
import { Dictionary } from '../models/Dictionary';
import { User } from '../models/User';

moment.tz.setDefault('Asia/Seoul');
const commands = ['기억'];

async function execute({ msg, client, actionMessage }) {
  const [commandName] = commands;
  if (!actionMessage)
    return msg.reply(`\`${BOT_COMMAND_PREFIX}${commandName} [제목] [내용]\`을 통해 내용 저장이 가능합니다.`);

  const [searchTitle, ...searchContentList] = actionMessage.split(' ');
  const searchContent = searchContentList.join(' ');

  if (!searchTitle || !searchContent)
    return msg.reply(`\`${BOT_COMMAND_PREFIX}${commandName} [제목] [내용]\`을 통해 내용 저장이 가능합니다.`);

  const dictionary = await Dictionary.findOne({ title: searchTitle });
  if (dictionary) return msg.reply(`이미 등록되어있는 단어입니다.`);

  const { author } = msg;
  const { username, id, avatar, avatarURL, discriminator } = author;

  const user = await User.findOne({ id });
  if (!user) {
    await new User({ username, id, avatar, avatarURL, discriminator }).save();
  }
  const newDictionary = new Dictionary({
    title: searchTitle,
    content: searchContent,
    userId: id,
  });
  const { title } = await newDictionary.save();

  msg.reply(`[${title}] 정상적으로 등록되었습니다.`);
}

export { execute, commands };
