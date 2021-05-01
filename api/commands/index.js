import * as ShowCommands from './ShowCommands.js';
import * as StreamInformation from './StreamInformation.js';
import * as UserInformation from './UserInformation.js';
import * as HelloVerification from './HelloVerification.js';
import * as BotInformation from './BotInformation.js';
import * as GetClip from './GetClip.js';
import * as GetClipPerDay from './GetClipPerDay.js';
import * as GetClipPerWeek from './GetClipPerWeek.js';
import * as GetClipPerMonth from './GetClipPerMonth.js';
import * as PopularStream from './PopularStream.js';
import * as GetVideos from './GetVideos.js';
import * as ShortCutStreamerNickname from './ShortCutStreamerNickname.js';
import * as ShowTogether from './ShowTogether.js';
import * as ShowUptime from './ShowUptime.js';
import * as ShowHotclip from './ShowHotclip.js';
import * as SearchImage from './SearchImage.js';

const commands = {
  ShowCommands,
  StreamInformation,
  UserInformation,
  // HelloVerification,
  BotInformation,
  GetClip,
  GetClipPerDay,
  GetClipPerWeek,
  GetClipPerMonth,
  PopularStream,
  GetVideos,
  ShortCutStreamerNickname,
  ShowTogether,
  ShowUptime,
  ShowHotclip,
  SearchImage,
};

const mapping = (command) => {
  const maps = {};
  Object.keys(commands).forEach((key) => {
    const instance = commands[key];
    const commandList = instance.commands || [];
    commandList.forEach((commandName) => {
      maps[commandName] = commands[key];
    });
  });
  return maps[command];
};

export {
  mapping, commands,
};
