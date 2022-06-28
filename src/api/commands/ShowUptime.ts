import moment from 'moment';
import 'moment-timezone';

moment.tz.setDefault('Asia/Seoul');
const commands = ['업타임'];

async function execute({ msg, client, actionMessage }) {
  //TODO: Next Refactoring
  // 아래 코드 지우고 moment로 교체
  const toHHMMSS = (selectedTime) => {
    const sec_num = parseInt(selectedTime, 10); // don't forget the second param
    let hours: string = Math.floor(sec_num / 3600) + '';
    let minutes: string = Math.floor((sec_num - parseInt(hours) * 3600) / 60) + '';
    let seconds: string = sec_num - parseInt(hours) * 3600 - parseInt(minutes) * 60 + '';

    if (hours.length > 1) {
      hours = `0${hours}`;
    }
    if (minutes.length > 1) {
      minutes = `0${minutes}`;
    }
    if (seconds.length > 1) {
      seconds = `0${seconds}`;
    }
    const time = `${hours}:${minutes}:${seconds}`;
    return time;
  };

  const time = process.uptime();
  const uptime = `${toHHMMSS(time)}`;
  return msg.reply(`${uptime}`);
}

export { execute, commands };
