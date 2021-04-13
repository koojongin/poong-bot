import * as ShowCommands from './ShowCommands.js';
import * as StreamInformation from './StreamInformation.js';
import * as UserInformation from './UserInformation.js';
import * as HelloVerification from './HelloVerification.js';
import * as BotInformation from './BotInformation.js';
import * as GetClip from './GetClip.js';
import * as PopularStream from './PopularStream.js';
import * as GetVideos from './GetVideos.js';
import * as ShortCutStreamerNickname from './ShortCutStreamerNickname.js';

const commands = {
  ShowCommands,
  StreamInformation,
  UserInformation,
  // HelloVerification,
  BotInformation,
  GetClip,
  PopularStream,
  GetVideos,
  ShortCutStreamerNickname,
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
