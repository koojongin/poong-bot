import got from 'got';

const DOMAIN_GOOGLE = 'https://www.google.com';
const API_URL = 'https://www.google.com/search';
const CUSTOM_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1';
const CUSTOM_API_PROJECT_KEY = '40c1a14740b061747';
const { CUSTOM_API_SECRET_KEY } = process.env;

async function customSearchImage({ keyword }) {
  const uri = `${CUSTOM_SEARCH_API_URL}`;
  // const options = {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'text/html; charset=UTF-8',
  //   },
  //   qs: {
  //     q: keyword,
  //     key: CUSTOM_API_SECRET_KEY,
  //     cx: CUSTOM_API_PROJECT_KEY,
  //   },
  //   json: true,
  // };

  const { body } = await got.get(uri, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
    },
    searchParams: {
      q: keyword,
      key: CUSTOM_API_SECRET_KEY,
      cx: CUSTOM_API_PROJECT_KEY,
    },
    responseType: 'json',
  });
  const { items: images } = body;
  const result = images.map((image) => {
    try {
      const [cseImage, ...rest] = image.pagemap.cse_image;
      const [cseImageThumbnail, ...rest2] = image.pagemap.cse_thumbnail;
      const [metatag, ...rest3] = image.pagemap.metatags;

      const iUrl = cseImage.src || cseImageThumbnail.src || metatag['og:image'];
      // const iUrl = cseImage.src;
      if (image.link.indexOf('facebook.com') >= 0) {
        return null;
      }

      return {
        title: image.title,
        link: image.link,
        url: iUrl,
      };
    } catch (e) {
      return null;
    }
  }).filter((r) => !!r);

  return result;
}

export {
  customSearchImage,
};
