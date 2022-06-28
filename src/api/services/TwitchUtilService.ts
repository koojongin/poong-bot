import { searchResultsPage } from './GQLAPIService';

async function getEdgesByNameOfUser({ actionMessage }) {
  const {
    data: { searchFor },
  }: any = await searchResultsPage({ query: actionMessage });
  const { channels, games, videos, relatedLiveChannels } = searchFor;
  return channels.edges;
}

async function getSearchedUserMessage(actionUserId, page = 0) {
  let isLive = false;
  let savedUserId;
  const edges = await getEdgesByNameOfUser({ actionMessage: actionUserId });
  const textLines = edges.splice(0, 5).map((edge, index) => {
    const {
      item: { followers, displayName, login, stream },
    } = edge;
    if (index === 0 || index + 1 === page) {
      isLive = !!stream;
      savedUserId = login;
    }
    return `${index + 1}. ${displayName}(${login}) | ${followers.totalCount.toLocaleString()}`;
  });
  let description = '```';
  description += `[${actionUserId}]으로 찾은 검색 결과입니다.\n`;
  description += textLines.join('\n');
  description += '```';
  return { description, isLive, savedUserId };
}

export { getEdgesByNameOfUser, getSearchedUserMessage };
