import { Client, Message, EmbedBuilder } from 'discord.js';
import moment from 'moment';
import * as GoogleSearchAPIService from '../services/GoogleSearchAPIService';
import 'moment-timezone';

moment.tz.setDefault('Asia/Seoul');
const commands = ['이미지'];

function buildMessageFromSelectedImage(selectedImage, author) {
  return new EmbedBuilder()
    .setTitle(selectedImage.title)
    .setURL(selectedImage.link)
    .setAuthor({ name: author.username })
    .setImage(selectedImage.url)
    .setTimestamp();
}

async function execute({
  msg,
  client,
  actionMessage,
  fromInteraction = false,
}: {
  msg: Message;
  client: Client;
  actionMessage: string;
  fromInteraction?: boolean;
}) {
  const images = await GoogleSearchAPIService.customSearchImage({ keyword: actionMessage });
  // const selectedImage = images[Math.floor(Math.random() * images.length)];
  const [selectedImage] = images;
  if (selectedImage) {
    const embedMessage = buildMessageFromSelectedImage(selectedImage, msg.author);
    const slicedImages = images.splice(0, 5);
    const options = slicedImages.map((image, index) => {
      const { title, link, url } = image;
      return {
        label: `${index + 1}. ${title}`,
        value: title,
        // emoji: {
        //   name: 'rogue',
        //   id: '625891304148303894',
        // },
      };
    });
    const components = [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'poong-bot-search-image',
            options,
            placeholder: '링크골라!',
            min_values: 1,
            max_values: 1,
          },
        ],
      },
    ];

    const data = {
      embeds: [embedMessage],
      components,
    };
    if (fromInteraction) return msg.edit(data);
    return msg.reply(data);
  }
  return msg.reply(`[${actionMessage}] 검색 결과가 없습니다.`);
}

const interactions = [
  {
    customId: 'poong-bot-search-image',
    action: async (interaction) => {
      const [actionMessage] = interaction.values;
      await execute({
        msg: interaction.message,
        client: null,
        actionMessage,
        fromInteraction: true,
      });
      return interaction;
    },
  },
];

export { execute, commands, interactions };
