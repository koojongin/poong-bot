import * as ShowCommands from './ShowCommands';
import * as StreamInformation from './StreamInformation';
import * as UserInformation from './UserInformation';
import * as BotInformation from './BotInformation';
import * as GetClip from './GetClip';
import * as GetClipPerDay from './GetClipPerDay';
import * as GetClipPerWeek from './GetClipPerWeek';
import * as GetClipPerMonth from './GetClipPerMonth';
import * as PopularStream from './PopularStream';
import * as GetVideos from './GetVideos';
import * as ShowTogether from './ShowTogether';
import * as ShowUptime from './ShowUptime';
import * as ShowHotclip from './ShowHotclip';
import * as SearchImage from './SearchImage';
import * as ShowPlaytime from './ShowPlaytime';
import * as MovieRank from './MovieRank';
import * as ShowMovie from './ShowMovie';
import * as DictionaryFind from './DictionaryFind';
import * as DictionaryFindOne from './DictionaryFindOne';
import * as DictionarySave from './DictionarySave';
import * as DictionaryUpdate from './DictionaryUpdate';
import * as DictionaryDelete from './DictionaryDelete';
import * as LostArkMokoko from './LostArkMokoko';
import * as LostArkCharacterSearch from './LostArkCharacterSearch';
import * as LostArkGoldSearch from './LostArkGoldSearch';
import * as LostArkRankSearch from './LostArkRankSearch';

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
  // ShortCutStreamerNickname,
  ShowTogether,
  ShowUptime,
  ShowHotclip,
  SearchImage,
  ShowPlaytime,
  MovieRank,
  ShowMovie,
  DictionaryFind,
  DictionaryFindOne,
  DictionarySave,
  DictionaryUpdate,
  DictionaryDelete,
  LostArkMokoko,
  LostArkCharacterSearch,
  LostArkGoldSearch,
  LostArkRankSearch,
  // LostArkTradeSearch,
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

export { mapping, commands };
