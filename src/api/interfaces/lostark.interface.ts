export interface CharListItem {
  icon: string;
  name: string;
  job: string;
  clv: string;
}
export interface CollectionItem {
  name: string; //오르페우스의별
  npc: string; //파우니카 - 알비온
  max: number; // 9
  count: number; // 1
}
export interface LoawaResponseBody {
  info: {
    character: {
      info: {
        server: string; //아만
        job: string; //기상술사
      };
      alignment: string[]; //성형 4개 [1,1,1,1] // 지성/담력/매력/친절
      각인효과: {
        engrave: string; //원한
        level: string; //3
      }[];
    };
    account: {
      charList: CharListItem[];
      id: string;
    };
    collectionTypeList: CollectionItem[];
  };
  updateTimeInfo: string; //2분전 검색
  status: number;
}

export interface LoawaAccount {
  id?: string;
  account_id?: string;
  char_name: string;
  name?: string;
  server_name: string;
  guild: string; // "지우개"
  jobs: string;
  clv: string; // "51"
  maxlv: string; // "1411.67"
  guildmaster?: string;
  icon: string; // https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/weather_artist_s.png
  link: string;
}
export interface LoawaGoldResponseBody {
  result: LoawaAccount[];
  goldAcc: {
    groupList: {
      [dungeonName: string]: {
        name: string; // '아브렐슈드' == dungeonName;
        count: number; // 0;
        type: string; // '군단장 레이드';
      };
    };
    contentsList: {
      id: string; // '1';
      sort: string; // '1';
      type: string; // '군단장 레이드';
      group_name: string; // '아브렐슈드';
      name_ko: string; // '아브렐슈드 5,6 [하드]';
      name_en: string; // '아브렐슈드 5,6 [하드]';
      name_ja: string; // '아브렐슈드 5,6 [하드]';
      name_ru: string; // '아브렐슈드 5,6 [하드]';
      name_es: string; // '아브렐슈드 5,6 [하드]';
      minLevel: string; // '1560';
      maxLevel: string; // '9999';
      gold: string; // '3000';
      addGold: string; // '500';
      chars: LoawaAccount[];
    }[];
  };
}
