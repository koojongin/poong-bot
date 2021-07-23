import got from 'got';

const TWITCH_API_DOMAIN = 'https://api.twitch.tv/helix';
const {
  NAVER_API_CLIENT_ID,
  NAVER_API_SECRET_KEY,
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

export {

};
