import got from 'got';

const TWITCH_API_DOMAIN = 'https://api.twitch.tv/helix';
const {
  TWITCH_BOT_CLIENT_ID,
  ACCESS_TOKEN,
  TWITCH_USER_OAUTH,
  TIWTCH_USER_CLIENT_ID,
  TWITCH_USER_PREVIEW_CARD_OAUTH,
} = process.env;

async function getPreviewCardByVideo(videoId) {
  const uri = 'https://gql.twitch.tv/gql';
  const rawBody = {
    operationName: 'VideoPreviewCard__VideoMoments',
    variables: {
      videoId,
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: '0094e99aab3438c7a220c0b1897d144be01954f8b4765b884d330d0c0893dbde',
      },
    },
  };
  return got.post(uri, {
    headers: {
      'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
      'X-Device-Id': 'T9sSxvMxkP3hAbXXynlMHmbMeH06DE8v',
      Authorization: `${TWITCH_USER_PREVIEW_CARD_OAUTH}`,
      // "Content-Type": "application/json"
    },
    json: rawBody,
    responseType: 'json',
  }).then((r) => r.body);
}

async function getPopularStreams() {
  const uri = 'https://gql.twitch.tv/gql';
  const rawBody = {
    operationName: 'BrowsePage_Popular',
    variables: {
      limit: 30,
      platformType: 'all',
      options: {
        includeRestricted: ['SUB_ONLY_LIVE'],
        sort: 'VIEWER_COUNT',
        tags: ['ab2975e3-b9ca-4b1a-a93e-fb61a5d5c3a4'],
        recommendationsContext: { platform: 'web' },
        requestID: 'JIRA-VXP-2397',
      },
      sortTypeIsRecency: false,
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: 'c3322a9df3121f437182beb5a75c2a8db9a1e27fa57701ffcae70e681f502557',
      },
    },
  };
  return got.post(uri, {
    headers: {
      'Client-ID': TIWTCH_USER_CLIENT_ID,
      //     Authorization: TWITCH_USER_OAUTH,
      //     "Content-Type": "application/json"
    },
    json: rawBody,
    responseType: 'json',
  }).then((r) => r.body);
}

async function getClips({ userId, first = 10 }) {
  const uri = 'clips';
  return got.get(uri, {
    prefixUrl: TWITCH_API_DOMAIN,
    responseType: 'json',
    headers: {
      'Client-Id': TWITCH_BOT_CLIENT_ID,
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    searchParams: {
      first,
      broadcaster_id: userId,
    },
  });
}

async function getVideos({ userId }) {
  const uri = 'videos';
  return got.get(uri, {
    prefixUrl: TWITCH_API_DOMAIN,
    responseType: 'json',
    headers: {
      'Client-Id': TWITCH_BOT_CLIENT_ID,
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    searchParams: {
      user_id: userId,
    },
  });
}

async function getUserInformation({ userId }) {
  const uri = `users?login=${userId}`;
  return got.get(uri, {
    prefixUrl: TWITCH_API_DOMAIN,
    responseType: 'json',
    headers: {
      'Client-Id': TWITCH_BOT_CLIENT_ID,
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
}

async function getStreamInformation({ userId }) {
  const uri = `streams?user_login=${userId}`;
  return got.get(uri, {
    prefixUrl: TWITCH_API_DOMAIN,
    responseType: 'json',
    headers: {
      'Client-Id': TWITCH_BOT_CLIENT_ID,
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
}

async function getGames({ gameId }) {
  const uri = `games?id=${gameId}`;
  return got.get(uri, {
    prefixUrl: TWITCH_API_DOMAIN,
    responseType: 'json',
    headers: {
      'Client-Id': TWITCH_BOT_CLIENT_ID,
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
}

async function getFollows({ toId }) {
  const uri = 'users/follows';
  return got.get(uri, {
    prefixUrl: TWITCH_API_DOMAIN,
    responseType: 'json',
    headers: {
      'Client-Id': TWITCH_BOT_CLIENT_ID,
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    searchParams: {
      to_id: toId,
    },
  });
}

export {
  getUserInformation, getStreamInformation, getClips
  , getPopularStreams, getVideos, getPreviewCardByVideo, getGames,
  getFollows,
};
