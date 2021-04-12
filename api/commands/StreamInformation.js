import * as path from 'path';
import * as Discord from 'discord.js';
import * as TwitchAPIService from '../services/TwitchAPIService.js';
import * as CONSTANT from '../../config/constants.js';
import moment from 'moment';
import 'moment-timezone';
import 'moment-duration-format';

moment.tz.setDefault("Asia/Seoul");
import * as StreamUtilService from '../services/StreamUtilService.js';

const commands = ['방송'];


async function execute({msg, client, actionMessage}) {
    let userId = StreamUtilService.convertByNickname(actionMessage) || CONSTANT.DEFAULT_USERID;
    return await TwitchAPIService.getStreamInformation({userId})
        .then(async (response) => {
            const [data] = response.body.data;
            if (!data)
                return msg.reply(`${userId}님은 현재 방송 중이 아닙니다.`);

            const gameId = data.game_id;
            const {body} = await TwitchAPIService.getGames({gameId})
            const {data: gameData} = body;
            const [gameDatum] = gameData;
            const boxArtUrl = gameDatum.box_art_url.replace('{width}', 285).replace('{height}', 380);

            let description = `**${data.user_name}** - [${data.title}](https://twitch.tv/${data.user_login})
                **\`${data.game_name}\`** __${data.viewer_count.toLocaleString()}__명이 시청중
                방송 시작 \`${moment(data.started_at).format('YYYY-MM-DD HH:mm:ss')}\`
                \n__**${new Date(moment().diff(data.started_at)).toISOString().substr(11, 8)} 동안 스트리밍 중**__`

            const videoRes = await TwitchAPIService.getVideos({userId: data.user_id});
            if (videoRes?.body?.data) {
                const [datum, ...restData] = videoRes.body.data;
                const videoId = datum.id;
                const {data: previewData} = await TwitchAPIService.getPreviewCardByVideo(videoId);
                const {video} = previewData;
                const {id, moments} = video;
                const {edges} = moments;

                edges.forEach((edge, index) => {
                    const {node} = edge;
                    const {positionMilliseconds, durationMilliseconds: duration, type, description: chapterName, details, video} = node;
                    let playtime = new Date(moment(duration)).toISOString().substr(11, 8)
                    let onAirMessage = '';
                    if (duration === 0) {
                        onAirMessage = ':arrow_forward:';
                        // video.lengthSeconds*1000 - positionMilliseconds
                        // playtime = moment().toDate().toISOString().substr(11, 8);
                        playtime = moment.duration(video.lengthSeconds * 1000 - positionMilliseconds).format('hh:mm:ss');
                    }
                    description += `\n${duration === 0 ? onAirMessage + ' ' : ''}${index + 1}. ${chapterName} \`${playtime}${onAirMessage ? ' ~ now' : ''}\``;
                })
            }
            const embedMessage = new Discord.MessageEmbed()
                .setColor('#51ace8')
                .setImage(data.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080') + "?v=" + new Date().getTime())
                .setThumbnail(boxArtUrl)
                .setDescription(description)
            msg.reply(embedMessage);
        })
        .catch(err => {
            msg.reply(`${err.message} ${err?.response?.body?.message}`);
        })
}

export {
    execute, commands
}
