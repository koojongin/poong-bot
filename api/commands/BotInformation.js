const commands = ['서버'];

async function execute({msg, client, actionMessage}) {
    const guildsCache = client.guilds.cache;
    const guilds = guildsCache.toJSON();
    msg.reply(`${guilds.length}에서 사용중입니다.`);
}

export {
    execute, commands
}
