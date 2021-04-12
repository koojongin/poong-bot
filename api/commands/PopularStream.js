import * as path from 'path';
import * as Discord from 'discord.js';
import * as TwitchAPIService from '../services/TwitchAPIService.js';
import * as CONSTANT from '../../config/constants.js';
import moment from 'moment';
import 'moment-timezone';
import _ from 'lodash';

moment.tz.setDefault("Asia/Seoul");
const commands = ['인기', '실시간'];

async function execute({msg, client, actionMessage}) {
    let userId = actionMessage || CONSTANT.DEFAULT_USERID;

    let page = 0;
    if (_.isNumber(+actionMessage) && !_.isEmpty(actionMessage)) {
        page = (+actionMessage) - 1;
    }

    if (page > 2) page = 2;
    const limit = 10;
    const skip = (page) * limit;

    return await TwitchAPIService.getPopularStreams()
        .then((body) => {
            const {streams} = body.data;
            const liveStreams = streams.edges;
            const embedMessage = new Discord.MessageEmbed()
                .setColor('#51ace8')
                .setTitle(`트위치 실시간 시청자수 TOP ${skip + 1}~${(page + 1) * limit}`)
            // .setImage(data.offline_image_url)
            // .setDescription(`views : ${data.view_count.toLocaleString()}\n${data.description}`)
            // .setThumbnail(data.profile_image_url);
            let description = '';
            liveStreams.splice(skip, limit).forEach((stream, index) => {
                const {previewImageURL, title, id, viewersCount, broadcaster, game} = stream.node;
                const {displayName = ""} = game || {};
                // embedMessage.addField(
                //     `${index + 1 + (skip)}. ${broadcaster.displayName} (${viewersCount.toLocaleString()})`,
                //     [
                //         `\`${displayName}\` [${title}](https://twitch.tv/${broadcaster.login})`,
                //         `[__미리보기__](${previewImageURL})`
                //     ].join('\n')),
                //     true

                description += `${index + 1 + (skip)}. \`${broadcaster.displayName} (${viewersCount.toLocaleString()})\``;
                description += `\n`;
                description += `__**[${displayName}]**__ [${title}](https://twitch.tv/${broadcaster.login})`;
                description += `\n\n`;
            });

            description += `집계일시 : ${moment().format('YYYY-MM-DD HH:mm:ss')}\n[**[__더보기__]**](https://www.twitch.tv/directory/all?sort=VIEWER_COUNT)`,
            embedMessage.setDescription(description);
            msg.reply(embedMessage);
        })
        .catch(err => {
            console.log(err);
            msg.reply(`${err.message} ${err?.response?.body?.message}`);
        })
}

export {
    execute, commands
}
