import moment from 'moment';
import 'moment-timezone';
import got from 'got';
import { Client, Message, MessageEmbed } from 'discord.js';
import { LoawaAccount, LoawaGoldResponseBody, LoawaResponseBody } from '../interfaces/lostark.interface';
import cheerio from 'cheerio';

moment.tz.setDefault('Asia/Seoul');
const commands = ['로아시세'];
async function execute({ msg, client, actionMessage }: { msg: Message; client: Client; actionMessage: string }) {
  if (!actionMessage) return msg.reply('아이템명을 입력해주세요.');
  const embedMessage = new MessageEmbed();
  embedMessage.setTitle(`${actionMessage} 경매장 검색`);
  embedMessage.setDescription('데이터를 검색중입니다. 잠시만 기다려주세요...');
  const defaultMessage = await msg.reply({ embeds: [embedMessage] });
  const tradeSearchUri = `https://m-lostark.game.onstove.com/Market/List_v2`;
  const response = await got.post(tradeSearchUri, {
    headers: { 'X-Requested-With': 'XMLHttpRequest', cookie: process.env.LOSTARK_TRADE_COOKIE },
    json: {
      firstCategory: 0,
      secondCategory: 0,
      tier: 0,
      grade: 99,
      itemName: actionMessage,
      pageSize: 10,
      pageNo: 1,
      isInit: false,
      sortType: 7,
    },
  });

  const $ = cheerio.load(response.body);
  const itemListElements = $.root().find('li').toArray();

  const items = itemListElements.map((itemElement) => {
    const node = $(itemElement);
    const itemName = node.find('li span.name').text();
    const grade = node.find('.list__grade').attr('data-grade');
    const prices = node
      .find('.list__detail tr em')
      .toArray()
      .map((data) => {
        return $(data).text();
      });

    return {
      name: itemName,
      prices,
      grade: parseInt(grade),
    };
  });
  console.log(items);
  console.log($);

  const parseGrade = (_grade: number) => {
    switch (_grade) {
      case 0:
        return { name: '일반', colorString: ':black_large_square:' };
        break;
      case 1:
        return { name: '고급', colorString: ':green_square:' };
        break;
      case 2:
        return { name: '희귀', colorString: ':blue_square:' };
        break;
      case 3:
        return { name: '영웅', colorString: ':purple_square:' };
        break;
      case 4:
        return { name: '전설', colorString: ':yellow_square:' };
        break;
      case 5:
        return { name: '유물', colorString: ':brown_square:' };
        break;
      case 6:
        return { name: '고대', colorString: ':orange_square:' };
        break;
      case 7:
        return { name: '에스더', colorString: ':high_brightness:' };
        break;
      default:
        return { name: _grade, colorString: '' };
        break;
    }
  };
  const itemsString = items.map((item) => {
    const { name, prices, grade } = item;
    const { name: gradeName, colorString } = parseGrade(grade);
    return `${colorString}${name}(${gradeName}) - :moneybag:\`${prices[0]}\` :moneybag:\`${prices[1]}\` :moneybag:\`${prices[2]}\``;
  });
  const description = ['아이템명(등급) | 최저가 | 전일 평균 거래가 | 최근 구매가\n', ...itemsString];
  embedMessage.setDescription(description.join('\n'));
  await defaultMessage.edit({ embeds: [embedMessage] });
}

export { execute, commands };
