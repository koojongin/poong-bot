import * as Discord from 'discord.js';
import moment from 'moment';
import 'moment-timezone';
import * as PlaytimeService from '../services/PlaytimeService';
import cheerio from 'cheerio';

moment.tz.setDefault('Asia/Seoul');
const commands = ['플탐', '플레이타임'];

async function execute({ msg, client, actionMessage }) {
  const res = await PlaytimeService.getPlaytime({ gameName: actionMessage });
  const document = cheerio.load(res).root();
  const elementsBeforeParse = document
    .find('.search_list_details')
    .toArray()
    .map((element) => cheerio.load(element).root());
  const elements = elementsBeforeParse.map((element) => {
    const result = {
      title: '',
      data: [],
    };
    result.title = element.find('a[title]').text();
    const data = element
      .find('.search_list_details_block div')
      .text()
      .trim()
      .replace(/\n/gi, '')
      .split('\t\t\t\t\t\t\t\t');
    result.data = data.filter((r) => !!r).map((d) => d.replace(/\t/gi, ''));
    return result;
  });

  if (elements.length === 0) return msg.reply(`검색결과가 없습니다. \`${actionMessage}\``);
  const embedMessage = new Discord.MessageEmbed();
  let desc = '.\n';
  desc += elements
    .map((element, index) => {
      const { title, data } = element;
      let result = '';
      result += `${index + 1}.`;
      result += `\`${title}\``;
      result += `__${data[0]}__:${data[1]} | ${data[2] ? `__${data[2]}__:${data[3]}` : ''})`;
      result += '\n';
      return result;
    })
    .join('');
  embedMessage.setDescription(desc);

  return msg.reply(desc);
}

export { execute, commands };
