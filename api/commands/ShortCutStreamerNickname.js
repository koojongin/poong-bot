import * as StreamUtilService from '../services/StreamUtilService.js';

const commands = ['숏컷', '닉네임'];

async function execute({ msg, client, actionMessage }) {
  const message = Object.keys(StreamUtilService.dictionary).map((nickname) => `\`${nickname}(${StreamUtilService.dictionary[nickname]})\``).join(' ');
  msg.reply(message);
}

export {
  execute, commands,
};
