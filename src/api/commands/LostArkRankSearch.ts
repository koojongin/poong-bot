import moment from 'moment';
import 'moment-timezone';
import got from 'got';
import cheerio from 'cheerio';
import { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from 'discord.js';
import { LoawaGoldResponseBody, LoawaRankSearchResponse, LoawaResponseBody } from '../interfaces/lostark.interface';
import { IExecuteCommand } from '../interfaces/discord.interface';
import _ from 'lodash';
import { BOT_COMMAND_PREFIX } from '../../config/constants';
import { loadLostArkCharacterHTML } from './LostArkCharacterSearch';

moment.tz.setDefault('Asia/Seoul');

const LOSTARK_JOBS = [
  '디스트로이어',
  '버서커',
  '워로드',
  '홀리나이트',
  '기공사',
  '배틀마스터',
  '스트라이커',
  '인파이터',
  '창술사',
  '건슬링어',
  '데빌헌터',
  '블래스터',
  '스카우터',
  '호크아이',
  '바드',
  '서머너',
  '소서리스',
  '아르카나',
  '데모닉',
  '리퍼',
  '블레이드',
  '기상술사',
  '도화가',
];

const commands = ['로아랭킹'];
async function execute({ msg, client, actionMessage }: IExecuteCommand) {
  if (!actionMessage) return msg.reply(`클래스를 입력해주세요. 예: ${BOT_COMMAND_PREFIX}${commands[0]} 블레이드`);

  if (!LOSTARK_JOBS.includes(actionMessage))
    return msg.reply(
      [
        `클래스를 입력해주세요. 예: ${BOT_COMMAND_PREFIX}${commands[0]} 블레이드`,
        '<검색 가능한 클래스 목록>',
        LOSTARK_JOBS.map((text) => `\`${text}\``).join(' '),
      ].join('\n')
    );

  const getMessage = async () => {
    const embedMessage = new MessageEmbed();
    embedMessage.setDescription('데이터를 불러오는중...');
    if (msg.type == 'REPLY') {
      return msg.edit({ embeds: [embedMessage] });
    }
    return msg.reply({ embeds: [embedMessage] });
  };
  const message = await getMessage();

  const dataURI = `https://loawa.com/apis/rank/itemLevel`;
  const [response] = await Promise.all([
    got.get(dataURI, { headers: { 'x-requested-with': 'XMLHttpRequest' }, searchParams: { 'jobs[]': actionMessage } }),
  ]);

  const { result }: LoawaRankSearchResponse = JSON.parse(response.body);
  const rankUsers = result.map((account) => {
    const { char_name: characterName, equipset, mainseal, maxlv } = account;
    const equipsetElement = cheerio.load(equipset);
    const mainsealElement = cheerio.load(mainseal);
    const equips = equipsetElement('.text-grade5').map((i, node) => equipsetElement(node).text());
    const mainSealString = mainsealElement.root().text();
    const splitPoint = mainSealString.indexOf('Lv') + 4;
    const regex = new RegExp(`(.{${splitPoint}})`);
    const result = mainSealString.split(regex).filter((O) => O);
    return {
      equips: [...equips],
      characterName,
      maxLevel: parseFloat(maxlv.replace(',', '')),
      mainSeal: result.map((i) => `\`${i.replace('Lv.', '')}\``).join(' '), //mainsealElement.root().text(),
    };
  });
  const embedMessage = new MessageEmbed();
  const createDescription = (rankUsers) => {
    const description = [
      ...rankUsers.slice(0, 10).map((account, index) => {
        const { characterName, maxLevel, equips, mainSeal } = account;
        const equipsString = equips.map((equip) => {
          return `\`${equip}\``;
        });

        const characterDesc = [`${index + 1}. ${characterName}[Lv.${maxLevel}] ${equipsString.join(' ')} ${mainSeal}`];
        if (account.ability) {
          characterDesc.push(
            '> ' + account.ability.map((ability) => `${ability.name}(${ability.value})`).join(' | ') + ''
          );
        }
        return characterDesc.join('\n');
      }),
    ];
    return description;
  };

  embedMessage.setTitle(`상위 ${actionMessage} 클래스 10명의 통계 데이터입니다.`);
  embedMessage.setDescription(createDescription(rankUsers).join('\n'));
  await message.edit({ embeds: [embedMessage] });

  const userFetchPromises = rankUsers.map((r) => loadLostArkCharacterHTML(r.characterName));
  const responses = await Promise.all(userFetchPromises);
  const getAbilities = (responses) => {
    return responses.map((html) => {
      const profileHtml = cheerio.load(html);
      const abilityElements = profileHtml.root().find('.profile-ability-battle > ul > li');
      const ability = _.sortBy(
        abilityElements.toArray().map((element) => {
          const name = profileHtml(element).find('span:nth-child(1)').text();
          const value = profileHtml(element).find('span:nth-child(2)').text();
          return { name, value: parseInt(value) };
        }),
        'value'
      ).reverse();
      return ability;
    });
  };
  // const html = await loadLostArkCharacterHTML(rankUsers[0].characterName);
  // const profileHtml = cheerio.load(html);
  // const abilityElements = profileHtml.root().find('.profile-ability-battle > ul > li');
  // const ability = _.sortBy(
  //   abilityElements.toArray().map((element) => {
  //     const name = profileHtml(element).find('span:nth-child(1)').text();
  //     const value = profileHtml(element).find('span:nth-child(2)').text();
  //     return { name, value: parseInt(value) };
  //   }),
  //   'value'
  // ).reverse();
  const abilities = getAbilities(responses);
  const rankUsersWithAbility = [...rankUsers].map((_user, index) => {
    const user = { ..._user, ability: abilities[index] };
    return user;
  });

  embedMessage.setDescription(createDescription(rankUsersWithAbility).join('\n'));
  await message.edit({ embeds: [embedMessage] });
}

export { execute, commands };
