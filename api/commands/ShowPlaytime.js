import * as Discord from 'discord.js';
import moment from 'moment';
import 'moment-timezone';
import * as PlaytimeService from '../services/PlaytimeService.js';
import cheerio from 'cheerio';

moment.tz.setDefault('Asia/Seoul');
const commands = ['플탐', '플레이타임'];

async function execute({ msg, client, actionMessage }) {
  const res = await PlaytimeService.getPlaytime({ gameName: actionMessage });
  const document = cheerio.load(res).root();
  const elementsBeforeParse = document.find('.search_list_details').toArray().map((element) => cheerio.load(element).root());
  const elements = elementsBeforeParse.map((element) => {
    const title = element.find('a[title]').text();
    const data = element.find('.search_list_details_block div').text().trim().replace(/\n/gi, '')
      .split('\t\t\t\t\t\t\t\t');
    const [d1, d2, d3, d4, ...rest] = data;
    const mainTime = d2.replace(/\t/gi, '');
    const fullTime = d4.replace(/\t/gi, '');
    return {
      title, mainTime, fullTime,
    };
  });

  if (elements.length === 0) return msg.reply(`검색결과가 없습니다. \`${actionMessage}\``);
  const embedMessage = new Discord.MessageEmbed();
  let desc = '.\n';
  desc += elements.map((element, index) => {
    const { mainTime, fullTime } = element;
    let result = '';
    result += `${index + 1}.`;
    result += `${element.title}`;
    result += `(메인:${mainTime} / 메인+서버:${fullTime})`;
    result += '\n';
    return result;
  }).join('');
  embedMessage.setDescription(desc);

  return msg.reply(desc);
}

export {
  execute, commands,
};
