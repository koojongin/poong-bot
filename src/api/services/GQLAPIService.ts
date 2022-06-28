import got from 'got';

const url = 'https://gql.twitch.tv/gql';
async function searchResultsPage({ query }) {
  const rawBody = {
    operationName: 'SearchResultsPage_SearchResults',
    variables: {
      query,
      options: null,
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: 'ee977ac21b324669b4c109be49ed3032227e8850bea18503d0ced68e8156c2a5',
      },
    },
  };
  return got.post(url, {
    headers: {
      'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
      'Content-Type': 'application/json',
    },
    json: rawBody,
    responseType: 'json',
  }).then((r) => r.body);
}

export {
  searchResultsPage,
};
