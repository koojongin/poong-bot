import moment from 'moment';
import 'moment-timezone';
import got from 'got';
import { Client, Message, MessageEmbed } from 'discord.js';
import { LoawaAccount, LoawaGoldResponseBody, LoawaResponseBody } from '../interfaces/lostark.interface';

moment.tz.setDefault('Asia/Seoul');
const commands = ['로아골드'];
async function execute({ msg, client, actionMessage }: { msg: Message; client: Client; actionMessage: string }) {
  if (!actionMessage) return msg.reply('아이디를 입력해주세요.');
  const embedMessage = new MessageEmbed();
  embedMessage.setTitle(`${actionMessage}님의 주간 원정대 수입`);
  embedMessage.setDescription('데이터를 검색중입니다. 잠시만 기다려주세요...');
  const defaultMessage = await msg.reply({ embeds: [embedMessage] });
  const dataURILoawa = `https://loawa.com/apis/char/info/${actionMessage}?archive=-1`;
  const responseLoawa = await got.get(dataURILoawa, {
    headers: { 'x-requested-with': 'XMLHttpRequest' },
  });
  const {
    info: {
      account: { id: accountId },
    },
  }: LoawaResponseBody = JSON.parse(responseLoawa.body);

  embedMessage.setDescription('조회할 수 없는 아이디입니다.');
  if (!accountId) return defaultMessage.edit({ embeds: [embedMessage] });

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

  const { contentsList } = goldAcc;

  const embedCharacters = result.map((account: LoawaAccount & { gold: number; completed: string[] }) => {
    account.gold = 0;
    account.completed = [];
    return account;
  });

  const completedContents = contentsList.filter((content) => content.chars.length > 0);
  let totalGold = 0;
  completedContents.forEach((content) => {
    totalGold += content.chars.length * parseInt(content.gold);

    content.chars.forEach((clearedCharacter) => {
      const account = embedCharacters.find((account) => account.char_name == clearedCharacter.name);
      if (!account) return;
      account.gold += parseInt(content.gold);
      account.completed.push(content.name_ko);
    });
  });

  embedMessage.setDescription(`예상 최대 획득 주간 원정대 수입은 :moneybag: ${totalGold.toLocaleString()}골드입니다.`);
  if (completedContents.length == 0) await defaultMessage.edit({ embeds: [embedMessage] });

  const characterEmbeds = embedCharacters
    .filter((account) => account.gold > 0)
    .map((account) => {
      const { clv, char_name, jobs, maxlv, gold, completed } = account;
      return [
        `**Lv.${clv} ${char_name}**\`${jobs} Lv.${maxlv}\` :moneybag:${gold.toLocaleString()}`,
        `${completed.map((mapName) => `\`${mapName}\``).join(' ')}`,
      ].join('\n');
    });
  const description = [embedMessage.description, characterEmbeds.join('\n\n')].join('\n\n');
  embedMessage.setDescription(description);

  const [firstAccount] = result;
  if (firstAccount) embedMessage.setThumbnail(firstAccount.icon);
  await defaultMessage.edit({ embeds: [embedMessage] });
}

export { execute, commands };
