import * as BotUtilService from '../services/BotUtilService.js';

const commands = ['명령'];

async function execute({ msg, client, actionMessage }) {
  const commands = BotUtilService.getCommandsInstance();
  const commandList = [];
  Object.keys(commands).filter((key) => key !== 'mapping').forEach((key) => {
    commands[key].commands.forEach((command) => {
      commandList.push(command);
    });
  });

  const parsedCommandListMessage = commandList.map((commandName) => `\`${commandName}\``).join(' ');
  const message = `명령어는 아래 링크를 참고해주세요.
        http://poong-bot.herokuapp.com/
        ${parsedCommandListMessage}`;
  msg.reply(message);
}

export {
  execute, commands,
};
