import got from 'got';

const {
  NAVER_API_CLIENT_ID,
  NAVER_API_SECRET_KEY,
} = process.env;

async function getMovies({ query }) {
  const uri = 'https://openapi.naver.com/v1/search/movie.json';

  return got.get(uri, {
    headers: {
      'X-Naver-Client-Id': NAVER_API_CLIENT_ID,
      'X-Naver-Client-Secret': NAVER_API_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    searchParams: {
      query,
    },
    responseType: 'json',
  }).then((r) => r.body);
}

async function getMovie({ movieName }) {
  const { items } = await getMovies({ query: movieName });
  const [firstResult] = items;
  return firstResult;
}

export { getMovies, getMovie };
