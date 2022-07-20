import moment from 'moment';
import 'moment-timezone';
import got from 'got';
import cheerio from 'cheerio';
import { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from 'discord.js';
import { LoawaGoldResponseBody, LoawaResponseBody } from '../interfaces/lostark.interface';
import { IExecuteCommand } from '../interfaces/discord.interface';

moment.tz.setDefault('Asia/Seoul');
const commands = ['로아'];
async function execute({ msg, client, actionMessage }: IExecuteCommand) {
  if (!actionMessage) return msg.reply('아이디를 입력해주세요.');
  const getMessage = async () => {
    const embedMessage = new MessageEmbed();
    embedMessage.setDescription('데이터를 불러오는중...');
    if (msg.type == 'REPLY') {
      return msg.edit({ embeds: [embedMessage] });
    }
    return msg.reply({ embeds: [embedMessage] });
  };
  const message = await getMessage();

  const dataURI = `https://lostark.game.onstove.com/Profile/Character/` + actionMessage;
  const dataURILoawa = `https://loawa.com/apis/char/info/${actionMessage}?archive=-1`;
  const [response, responseLoawa] = await Promise.all([
    got.get(dataURI),
    got.get(dataURILoawa, { headers: { 'x-requested-with': 'XMLHttpRequest' } }),
  ]);

  const rootElement = cheerio.load(response.body).root();
  const { info, updateTimeInfo }: LoawaResponseBody = JSON.parse(responseLoawa.body);
  const { character, account } = info;

  const { id: accountId, charList } = account;
  const { info: cInfo, 각인효과, jewels, CardSet: cardSet } = character;

  const dataURILoawaGold = `https://loawa.com/apis/char/account-chars`;
  const responseLoawaGoldResponse: any = await got.post(dataURILoawaGold, {
    headers: { 'x-requested-with': 'XMLHttpRequest' },
    json: {
      account_id: accountId,
    },
    responseType: 'json',
  });
  const {
    body: { goldAcc, result },
  }: { body: LoawaGoldResponseBody } = responseLoawaGoldResponse;

  const searchedAccount = result.find((account) => account.char_name == actionMessage);
  const { collectionTypeList } = info;
  const profileUrl = rootElement.find('.profile-equipment__character img').attr('src');
  const classImageUrl = rootElement.find('.profile-character-info__img').attr('src');
  const expeditionLevel = rootElement.find('.level-info__expedition span:last-child').text();
  const baseLevel = rootElement.find('.level-info__item span:last-child').text();
  const itemLevel = rootElement.find('.level-info2__expedition span:last-child').text();
  const skillPoints = rootElement.find('.profile-skill__point em');

  const characterDataElement = rootElement.find('.profile-ability-basic > ul > li');
  const attackDamage = characterDataElement.first().find('span:last').text();
  const life = characterDataElement.next().find('span:last').text();

  const usedSkillPoint = skillPoints.first().text();
  const maxSkillPoint = skillPoints.next().text();

  const islandHeart = collectionTypeList.find((c) => c.name == '섬의마음');
  const orpheusStar = collectionTypeList.find((c) => c.name == '오르페우스의별');
  const giantHeart = collectionTypeList.find((c) => c.name == '거인의심장');
  const greatArt = collectionTypeList.find((c) => c.name == '위대한미술품');
  const mococo = collectionTypeList.find((c) => c.name == '모코코씨앗');
  const sailsObject = collectionTypeList.find((c) => c.name == '항해모험물');
  const ignea = collectionTypeList.find((c) => c.name == '이그네아의징표');
  const worldTree = collectionTypeList.find((c) => c.name == '세계수의잎');

  const embedMessage = new MessageEmbed();
  // embedMessage.setImage(profileUrl);
  embedMessage.setAuthor({
    name: `${cInfo.server}서버 | ${actionMessage} | ${cInfo.job}`,
    iconURL: searchedAccount?.icon || classImageUrl,
    url: dataURI,
  });
  embedMessage.setThumbnail(profileUrl);
  embedMessage.setURL(dataURI);
  // embedMessage.setTitle(`${cInfo.server} 서버 - ${actionMessage} [${cInfo.job}]`);
  if (expeditionLevel) embedMessage.addField('원정대 레벨', expeditionLevel, true);
  if (itemLevel) embedMessage.addField('아이템 레벨', itemLevel, true);
  if (baseLevel) embedMessage.addField('전투 레벨', baseLevel, true);
  if (usedSkillPoint && maxSkillPoint) embedMessage.addField('스킬포인트', `${usedSkillPoint}/${maxSkillPoint}`, true);
  // if (attackDamage) embedMessage.addField('공격력', attackDamage.toLocaleString(), true);
  // if (life) embedMessage.addField('생명력', life.toLocaleString(), true);
  if (islandHeart?.max && islandHeart?.count)
    embedMessage.addField('섬의 마음', `${islandHeart.count}/${islandHeart.max}`, true);
  if (orpheusStar?.max && orpheusStar?.count)
    embedMessage.addField('오르페우스의 별', `${orpheusStar.count}/${orpheusStar.max}`, true);
  if (giantHeart?.count && giantHeart?.max)
    embedMessage.addField('거인의 심장', `${giantHeart.count}/${giantHeart.max}`, true);
  if (greatArt?.count && greatArt?.max)
    embedMessage.addField('위대한 미술품', `${greatArt.count}/${greatArt.max}`, true);
  if (mococo?.count && mococo?.max) embedMessage.addField('모코코 씨앗', `${mococo.count}/${mococo.max}`, true);
  if (sailsObject?.count && sailsObject?.max)
    embedMessage.addField('항해 모험물', `${sailsObject.count}/${sailsObject.max}`, true);
  if (ignea?.count && ignea?.max) embedMessage.addField('이그네아의 징표', `${ignea.count}/${ignea.max}`, true);
  if (worldTree?.count && worldTree?.max)
    embedMessage.addField('세계수의 잎', `${worldTree.count}/${worldTree.max}`, true);

  if (character?.alignment && character?.alignment.length > 0)
    embedMessage.addField(
      '성향',
      `${character.alignment
        .map((value, index) => {
          const order = ['지성', '담력', '매력', '친절'];
          return `${order[index]}(${value})`;
        })
        .join(' ')}` || '',
      false
    );

  const description = [];
  if (각인효과 && 각인효과.length > 0)
    description.push(
      `**각인효과**\n${각인효과
        .map((engraveEffect) => {
          const { engrave, level } = engraveEffect;
          return `${engrave}(${level})`;
        })
        .join(', ')}`
    );

  const jewelsString = jewels
    .filter((jewel) => jewel.level > 0)
    .map((jewel) => {
      const { type, level } = jewel;
      return `${type}(${level})`;
    });

  if (jewelsString.length > 0) {
    description.push(`**보석**\n${jewelsString.join(' | ')}`);
  }

  if (cardSet.length >= 0) {
    const cardSetString = cardSet.map((card) => card.title);
    description.push(`**카드**\n${cardSetString.join('\n')}`);
  }
  embedMessage.setDescription(description.join('\n\n'));

  const getAccountActionRow = (charList) => {
    if (charList.length == 0) return null;
    const row = new MessageActionRow();
    const selectMenu = new MessageSelectMenu();
    selectMenu.setCustomId('select');
    selectMenu.addOptions(
      charList.map((account) => {
        const { name } = account;
        return {
          label: name,
          value: name,
        };
      })
    );
    row.addComponents([selectMenu]);
    return row;
  };

  const row = getAccountActionRow(charList);
  const components = [row].filter((data) => !!data);
  const replyData = Object.assign({ embeds: [embedMessage] }, { components: components });

  await message.edit(replyData);
}

export { execute, commands };
