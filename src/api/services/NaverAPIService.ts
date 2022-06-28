import got from 'got';

async function getMovies({ query }): Promise<{ items: any[] } | any> {
  const uri = 'https://openapi.naver.com/v1/search/movie.json';

  const { body } = await got.get(uri, {
    headers: {
      'X-Naver-Client-Id': process.env.NAVER_API_CLIENT_ID,
      'X-Naver-Client-Secret': process.env.NAVER_API_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    searchParams: {
      query,
    },
    responseType: 'json',
  });
  return body;
}
async function getMovie({ movieName }) {
  const { items } = await getMovies({ query: movieName });
  const [firstResult] = items;
  return firstResult;
}

export { getMovies, getMovie };
