import * as ShowCommands from './ShowCommands';
import * as StreamInformation from './StreamInformation';
import * as UserInformation from './UserInformation';
import * as BotInformation from './BotInformation';
import * as GetVideos from './GetVideos';
import * as ShowTogether from './ShowTogether';
import * as ShowUptime from './ShowUptime';
import * as SearchImage from './SearchImage';
import * as MovieRank from './MovieRank';
import * as ShowMovie from './ShowMovie';

const commands = {
  ShowCommands,
  StreamInformation,
  UserInformation,
  // HelloVerification,
  BotInformation,
  // GetClip,
  // GetClipPerDay,
  // GetClipPerWeek,
  // GetClipPerMonth,
  // PopularStream,
  GetVideos,
  // ShortCutStreamerNickname,
  ShowTogether,
  ShowUptime,
  // ShowHotclip,
  SearchImage,
  MovieRank,
  ShowMovie,
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

const interactions = Object.keys(commands)
  .map((key) => {
    const { interactions = [] } = commands[key] || {};
    return interactions;
  })
  .reduce((prev, next) => {
    return prev.concat(next);
  }, []);

export { mapping, commands, interactions };
