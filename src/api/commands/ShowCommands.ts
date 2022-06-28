import * as BotUtilService from '../services/BotUtilService';

const commands = ['명령'];

async function execute({ msg, client, actionMessage }) {
  const commands = BotUtilService.getCommandsInstance();
  const commandList = [];
  Object.keys(commands)
    .filter((key) => key !== 'mapping')
    .forEach((key) => {
      commands[key].commands.forEach((command) => {
        commandList.push(command);
      });
    });
  // http://poong-bot.herokuapp.com/
  const parsedCommandListMessage = commandList.map((commandName) => `\`${commandName}\``).join(' ');
  const message = `방송 알림을 끄려면 pause-listen를 입력하세요. 그외 문의\`jiku90#8335\` 명령어는 아래 링크를 참고해주세요.
  http://jiku90.com:3000
  ${parsedCommandListMessage}`;
  msg.reply(message);
}

export { execute, commands };
