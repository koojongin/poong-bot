import moment from 'moment';
import 'moment-timezone';
import { BOT_COMMAND_PREFIX } from '../../config/constants';
import { Dictionary } from '../models/Dictionary';
import { User } from '../models/User';

moment.tz.setDefault('Asia/Seoul');
const commands = ['찾아'];

async function execute({ msg, client, actionMessage }) {
  const [commandName] = commands;
  if (!actionMessage) return msg.reply(`__${BOT_COMMAND_PREFIX}${commandName} [단어]__를 통해 검색이 가능합니다.`);

  const [searchTitle] = actionMessage.split(' ');

  // const users = await User.find({ username: { $regex: searchTitle, $options: 'i' } });
  const users = await User.find({ username: searchTitle });
  const userIds = users.map((user) => user.id);

  const searchQuery = {
    $or: [{ title: { $regex: searchTitle, $options: 'i' } }, { userId: { $in: userIds } }],
  };
  const count = await Dictionary.find(searchQuery).count();
  const dicts = await Dictionary.find(searchQuery).limit(10).populate('user');
  const dictRows = dicts.map((dict) => {
    const { title, content, user } = dict;
    const { username, discriminator } = user;
    // return `[${title}] ${content} \`${username}#${discriminator}\``;
    return `[${title}] \`${username}#${discriminator}\``;
  });

  const messageList = [`\`"${actionMessage}" - ${count.toLocaleString()}개의 검색결과\``, ...dictRows];
  msg.reply(messageList.join('\n'));
}

export { execute, commands };
