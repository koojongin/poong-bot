import moment from 'moment';
import 'moment-timezone';
import got from 'got';
import { Client, Message, MessageEmbed } from 'discord.js';
import { LoawaAccount, LoawaGoldResponseBody, LoawaResponseBody } from '../interfaces/lostark.interface';
import _ from 'lodash';

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

  const embedCharacters = result.map(
    (account: LoawaAccount & { gold: number; completed: { name; gold; groupGold; groupName }[]; maxLevel: number }) => {
      account.gold = 0;
      account.completed = [];
      return account;
    }
  );

  const completedContents = contentsList.filter((content) => content.chars.length > 0);
  let totalGold = 0;
  completedContents.forEach((content, index) => {
    content.chars.forEach((clearedCharacter) => {
      const account = embedCharacters.find((account) => account.char_name == clearedCharacter.name);
      const { group_name: groupName, gold } = content;
      const floatGold = parseFloat(gold);
      if (!account) return;
      account.maxLevel = parseFloat(account.maxlv);
      account.completed.push({
        groupGold: 0,
        groupName,
        name: content.name_ko,
        gold: floatGold,
      });

      const selectedGroups = account.completed.filter((map) => map.groupName == groupName);
      selectedGroups.forEach((selectedGroup) => {
        selectedGroup.groupGold += floatGold;
      });
    });
  });

  embedMessage.setDescription(['예측되는 골드 수입이 없습니다.'].join('\n'));
  if (completedContents.length == 0) await defaultMessage.edit({ embeds: [embedMessage] });

  const availableGoldCharacters = _.sortBy(embedCharacters, 'maxLevel')
    .filter((account) => account.completed.length > 0)
    .reverse();

  const goldCharacters = availableGoldCharacters.map((account) => {
    const { completed } = account;
    account.completed = _.sortBy(completed, 'groupGold').reverse();
    const topThreeMap = Object.keys(
      account.completed
        .map((r) => ({ [r.groupName]: r.groupName }))
        .reduce((prev, next) => {
          return { ...prev, ...next };
        })
    ).slice(0, 3);
    account.completed.map((map) => {
      const disabled = !topThreeMap.includes(map.groupName);
      if (!disabled) account.gold += map.gold;
      map.disabled = disabled;
    });
    return account;
  });
  const characterEmbeds = goldCharacters.map((account, index) => {
    const { clv, char_name, jobs, maxLevel, gold, completed } = account;

    if (index < 6) {
      totalGold += account.gold;
      return (
        [
          `**Lv.${clv} ${char_name}**\`${jobs} Lv.${maxLevel}\` :moneybag:${gold.toLocaleString()}`,
          `${completed
            .map((map) => {
              const { disabled } = map;
              if (disabled) return `~~${map.name}~~`;
              return `\`${map.name}\``;
            })
            .join(' ')}`,
        ].join('\n') + '\n'
      );
    }
    return [`**Lv.${clv} ${char_name}**\`${jobs} Lv.${maxLevel}\``].join('');
  });

  embedMessage.setDescription(
    [
      `예상 최대 획득 주간 원정대 수입은 :moneybag: ${totalGold.toLocaleString()}골드입니다.`,
      '총 골드는 상위 레벨의 6개 캐릭터까지 합산됩니다.',
    ].join('\n')
  );

  const description = [embedMessage.description, characterEmbeds.join('\n')].join('\n\n');
  embedMessage.setDescription(description);

  const [firstAccount] = result;
  if (firstAccount) embedMessage.setThumbnail(firstAccount.icon);
  await defaultMessage.edit({ embeds: [embedMessage] });
}

export { execute, commands };
