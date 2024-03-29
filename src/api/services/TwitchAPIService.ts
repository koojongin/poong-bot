import got from 'got';

const TWITCH_API_DOMAIN = 'https://api.twitch.tv/helix';

let accessToken;
function getApiAccessToken() {
  return accessToken;
}

function setApiAccessToken(token) {
  accessToken = token;
}

async function setTwitchOAuth2Token() {
  // eslint-disable-next-line no-use-before-define
  try {
    const { body } = await getOAuth2Token();
    const { access_token }: any = body;
    setApiAccessToken(access_token);
  } catch (error) {
    console.log(error);
  }
}
async function getOAuth2Token() {
  const uri = 'https://id.twitch.tv/oauth2/token';
  const searchParams = {
    client_id: process.env.TWITCH_BOT_CLIENT_ID,
    client_secret: process.env.TWITCH_BOT_CLIENT_SECRET,
    grant_type: 'client_credentials',
  };
  return got.post(uri, {
    searchParams,
    responseType: 'json',
  });
}

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
  return got
    .post(uri, {
      headers: {
        'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'X-Device-Id': 'T9sSxvMxkP3hAbXXynlMHmbMeH06DE8v',
        Authorization: `${process.env.TWITCH_USER_PREVIEW_CARD_OAUTH}`,
        // "Content-Type": "application/json"
      },
      json: rawBody,
      responseType: 'json',
    })
    .then((r) => r.body);
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
  return got
    .post(uri, {
      headers: {
        'Client-ID': process.env.TWITCH_USER_CLIENT_ID,
        //     Authorization: TWITCH_USER_OAUTH,
        //     "Content-Type": "application/json"
      },
      json: rawBody,
      responseType: 'json',
    })
    .then((r) => r.body);
}

async function getClips({
  userId,
  first = 10,
  startedAt,
  endedAt,
}: {
  userId: string;
  first: number;
  startedAt?: any;
  endedAt?: any;
}) {
  if (!userId) throw new Error('UserId 없음');
  const uri = 'clips';
  const getSearchParams = (startedAt, endedAt) => {
    if (!startedAt || !endedAt) {
      return {
        first,
        broadcaster_id: userId,
      };
    }

    return {
      first,
      broadcaster_id: userId,
      startedAt,
      endedAt,
    };
  };

  try {
    const result = await got.get(uri, {
      prefixUrl: TWITCH_API_DOMAIN,
      responseType: 'json',
      headers: {
        'Client-Id': process.env.TWITCH_BOT_CLIENT_ID,
        Authorization: `Bearer ${getApiAccessToken()}`,
      },
      searchParams: getSearchParams(startedAt, endedAt),
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

async function getVideos({ userId }) {
  const uri = 'videos';
  return got.get(uri, {
    prefixUrl: TWITCH_API_DOMAIN,
    responseType: 'json',
    headers: {
      'Client-Id': process.env.TWITCH_BOT_CLIENT_ID,
      Authorization: `Bearer ${getApiAccessToken()}`,
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
      'Client-Id': process.env.TWITCH_BOT_CLIENT_ID,
      Authorization: `Bearer ${getApiAccessToken()}`,
    },
  });
}

async function getStreamInformation({ userId }) {
  const uri = `streams?user_login=${userId}`;
  return got.get(uri, {
    prefixUrl: TWITCH_API_DOMAIN,
    responseType: 'json',
    headers: {
      'Client-Id': process.env.TWITCH_BOT_CLIENT_ID,
      Authorization: `Bearer ${getApiAccessToken()}`,
    },
  });
}

async function getGames({ gameId }) {
  const uri = `games?id=${gameId}`;
  return got.get(uri, {
    prefixUrl: TWITCH_API_DOMAIN,
    responseType: 'json',
    headers: {
      'Client-Id': process.env.TWITCH_BOT_CLIENT_ID,
      Authorization: `Bearer ${getApiAccessToken()}`,
    },
  });
}

async function getFollows({ toId }) {
  const uri = 'users/follows';
  return got.get(uri, {
    prefixUrl: TWITCH_API_DOMAIN,
    responseType: 'json',
    headers: {
      'Client-Id': process.env.TWITCH_BOT_CLIENT_ID,
      Authorization: `Bearer ${getApiAccessToken()}`,
    },
    searchParams: {
      to_id: toId,
    },
  });
}

export {
  getUserInformation,
  getStreamInformation,
  getClips,
  getPopularStreams,
  getVideos,
  getPreviewCardByVideo,
  getGames,
  getFollows,
  getOAuth2Token,
  setTwitchOAuth2Token,
  getApiAccessToken,
};
