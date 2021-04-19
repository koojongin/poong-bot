import * as Discord from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService.js';
import * as CONSTANT from '../../config/constants.js';
import * as StreamUtilService from '../services/StreamUtilService.js';
import 'moment-timezone';

moment.tz.setDefault('Asia/Seoul');
const commands = ['업타임'];

async function execute({ msg, client, actionMessage }) {
  const toHHMMSS = (selectedTime) => {
    const sec_num = parseInt(selectedTime, 10); // don't forget the second param
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = `0${hours}`; }
    if (minutes < 10) { minutes = `0${minutes}`; }
    if (seconds < 10) { seconds = `0${seconds}`; }
    const time = `${hours}:${minutes}:${seconds}`;
    return time;
  };

  const time = process.uptime();
  const uptime = `${toHHMMSS(time)}`;
  return msg.reply(`${uptime}`);
}

export {
  execute, commands,
};
