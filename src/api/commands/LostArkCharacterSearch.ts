import moment from 'moment';
import 'moment-timezone';
import got from 'got';
import cheerio from 'cheerio';
import { MessageEmbed } from 'discord.js';
import { LoawaResponseBody } from '../interfaces/lostark.interface';

moment.tz.setDefault('Asia/Seoul');
const commands = ['로아'];
async function execute({ msg, client, actionMessage }) {
  if (!actionMessage) return msg.reply('아이디를 입력해주세요.');
  const dataURI = `https://lostark.game.onstove.com/Profile/Character/` + actionMessage;
  const dataURILoawa = `https://loawa.com/apis/char/info/${actionMessage}?archive=-1`;
  const [response, responseLoawa] = await Promise.all([
    got.get(dataURI),
    got.get(dataURILoawa, { headers: { 'x-requested-with': 'XMLHttpRequest' } }),
  ]);
  const rootElement = cheerio.load(response.body).root();
  const { info, updateTimeInfo }: LoawaResponseBody = JSON.parse(responseLoawa.body);
  const { character } = info;
  const { info: cInfo, 각인효과 } = character;
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
  embedMessage.setImage(profileUrl);
  embedMessage.setThumbnail(classImageUrl);
  embedMessage.setURL(dataURI);
  embedMessage.setTitle(`${cInfo.server} 서버 - ${actionMessage} [${cInfo.job}]`);
  embedMessage.addField('원정대 레벨', expeditionLevel, true);
  embedMessage.addField('아이템 레벨', itemLevel, true);
  embedMessage.addField('전투 레벨', baseLevel, true);
  embedMessage.addField('스킬포인트', `${usedSkillPoint}/${maxSkillPoint}`, true);
  embedMessage.addField('공격력', attackDamage.toLocaleString(), true);
  embedMessage.addField('생명력', life.toLocaleString(), true);
  embedMessage.addField('섬의 마음', `${islandHeart.count}/${islandHeart.max}`, true);
  embedMessage.addField('오르페우스의 별', `${orpheusStar.count}/${orpheusStar.max}`, true);
  embedMessage.addField('거인의 심장', `${giantHeart.count}/${giantHeart.max}`, true);
  embedMessage.addField('위대한 미술품', `${greatArt.count}/${greatArt.max}`, true);
  embedMessage.addField('모코코 씨앗', `${mococo.count}/${mococo.max}`, true);
  embedMessage.addField('항해 모험물', `${sailsObject.count}/${sailsObject.max}`, true);
  embedMessage.addField('이그네아의 징표', `${ignea.count}/${ignea.max}`, true);
  embedMessage.addField('세계수의 잎', `${worldTree.count}/${worldTree.max}`, true);
  embedMessage.addField(
    '성향',
    `${character.alignment
      .map((value, index) => {
        const order = ['지성', '담력', '매력', '친절'];
        return `${order[index]}(${value})`;
      })
      .join(' ')}`,
    false
  );

  const description = [];
  description.push(
    `**각인효과**\n${각인효과
      .map((engraveEffect) => {
        const { engrave, level } = engraveEffect;
        return `${engrave}(${level})`;
      })
      .join(', ')}`
  );
  embedMessage.setDescription(description.join('\n'));
  msg.reply({ embeds: [embedMessage] });
}

export { execute, commands };
