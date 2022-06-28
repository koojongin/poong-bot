import got from 'got';
import FormData from 'form-data';
import fs from 'fs';

async function getPlaytime({ gameName }) {
  const uri = 'https://howlongtobeat.com/search_results?page=1';
  const form = new FormData();
  form.append('queryString', gameName);
  form.append('t', 'games');
  // form.append('sorthead', 'popular');
  // form.append('sortd', 'Normal Order');
  // form.append('length_type', 'main');
  return got.post(uri, {
    headers: {
      // 'content-type': 'application/x-www-form-urlencoded',
      // 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
    },
    // json: rawBody,
    body: form,
    // responseType: 'json',
  }).then((r) => r.body);
}

export {
  getPlaytime,
};
