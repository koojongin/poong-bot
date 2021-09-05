import moment from 'moment';
import 'moment-timezone';
import 'moment-duration-format';
import { getStreamByUser } from '../services/DiscordService.js';
import { searchResultsPage } from '../services/GQLAPIService.js';

moment.tz.setDefault('Asia/Seoul');

const commands = ['방송'];

async function execute({ msg, client, actionMessage }) {
  // eslint-disable-next-line prefer-const
  let [actionUserId, page, ...actions] = actionMessage.split(' ');
  page = page || 1;
  page = parseInt(page);
  let embedMessage;
  let savedUserId;
  try {
    embedMessage = await getStreamByUser({ userIdOrNicknameShotcut: actionMessage });
  } catch (error) {
    if (error.response?.statusCode !== 400) {
      embedMessage = error.message;
    } else {
      const edges = await getEdgesByNameOfUser({ actionMessage });
      const textLines = edges.splice(0, 5).map((edge, index) => {
        const {
          item: {
            followers, displayName, login, stream,
          },
        } = edge;
        if (index === 0) savedUserId = login;
        if (index + 1 === page) savedUserId = login;
        return `${index + 1}. ${displayName}(${login}) | ${followers.totalCount.toLocaleString()}`;
      });
      let description = '```';
      description += `[${actionMessage}]으로 찾은 검색 결과입니다.\n`;
      description += textLines.join('\n');
      description += '```';

      embedMessage = description;
    }
  }

  await msg.reply(embedMessage);
  if (savedUserId) {
    const emdbedMessage2nd = await getStreamByUser({ userIdOrNicknameShotcut: savedUserId });
    msg.reply(emdbedMessage2nd);
  }
  return true;
}

async function getEdgesByNameOfUser({ actionMessage }) {
  const { data: { searchFor } } = await searchResultsPage({ query: actionMessage });
  const {
    channels, games, videos, relatedLiveChannels,
  } = searchFor;
  return channels.edges;
}
export {
  execute, commands,
};
