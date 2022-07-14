import moment from 'moment';
import 'moment-timezone';
import MAP_LIST from '../../config/constants';
import got from 'got';
import cheerio from 'cheerio';

moment.tz.setDefault('Asia/Seoul');
const commands = ['모코코'];

async function execute({ msg, client, actionMessage }) {
  const selectedMap = MAP_LIST.find((map) => map.name == actionMessage);
  if (!selectedMap) return msg.reply('조회 가능한 맵이 없습니다.');
  const dataURI = `https://lostark.inven.co.kr/dataninfo/world/?code=` + selectedMap.code;
  const response = await got.get(dataURI);
  const [dataElement] = cheerio.load(response.body).root().find('script').toArray().reverse();
  const [scriptNode]: any = dataElement.children;
  const variableText = findTextAndReturnRemainder(scriptNode.data, 'map.data =');
  const items = [];
  const result = eval(`(${variableText})`);
  const { poi } = result;
  const STATIC_URI = `https://static.inven.co.kr/image_2011/lostark/dataninfo/world/maps`;
  const worldCode = selectedMap.code;
  const URI = `${STATIC_URI}/${worldCode}.png?v=1`;
  msg.reply([URI, dataURI].join('\n'));
}

function findTextAndReturnRemainder(target, variable) {
  const chopFront = target.substring(target.search(variable));
  const result = chopFront.substring(variable.length, chopFront.search(';'));
  return result;
}

export { execute, commands };
