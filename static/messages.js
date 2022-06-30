const API_URL = '';
const rootWrapperElementClassName = 'wrapper';
const messageWrapperElementClassName = 'wrapper-message';
const guildsWrapperElementClassName = 'wrapper-guilds';

async function getMessages(before, channelId) {
  return fetch(`${API_URL}/messages?channel=${channelId}${before?'&before='+before:''}`)
    .then((response) => response.json());
}
async function getGuilds() {
  return fetch(`${API_URL}/guilds`)
    .then((response) => response.json());
}
async function loadGuilds() {
  const getChannelElement = (channel, guild) => {
    const channelButtonElement = $(`<button id="${channel.id}">#${channel.name}</button>`);
    channelButtonElement.on('click', () => {
      document.location.search = `channel=${channel.id}&guild=${guild.id}`;
      loadMessages();
    });
    console.log(channelButtonElement)
    return channelButtonElement;
  };
  const createGuildElement = (data) => {
    const { guild, channels = [] } = data;
    const filteredChannels = channels.filter((channel) => channel.type === 'GUILD_TEXT');
    const guildButtonElement = $(`<button id="${guild.id}">${guild.name}</button>`);
    const guildWrapperElement = $(`.${guildsWrapperElementClassName}`);
    const guildButtonClickEventHandler = (event) => {
      $('.guilds button').removeClass('active');
      const channelElement = guildWrapperElement.find('.channels');
      guildWrapperElement.find('.channels').html('');
      filteredChannels.forEach((channel) => channelElement.append(getChannelElement(channel, guild)));
      $(event.target).addClass('active');

      const selectedChannelId = getSearchParameter('channel');
      $('.channels').find(`#${selectedChannelId}`).addClass('active');
    };
    guildButtonElement.on('click', (event) => guildButtonClickEventHandler(event));
    guildWrapperElement.find('.guilds').append(guildButtonElement);
  };
  $(`.${guildsWrapperElementClassName}`).html('');
  const guilds = await getGuilds();
  const guildsChildString = '<div class="guilds"></div><div class="channels"></div>';
  $(`.${guildsWrapperElementClassName}`).append($(guildsChildString));
  guilds.forEach((guildData) => createGuildElement(guildData));

  const selectedGuildId = getSearchParameter('guild');
  console.log(selectedGuildId);
  if (selectedGuildId) $(`#${selectedGuildId}`).click();
}
async function loadMessages({ before } = {}) {
  console.log(before);
  const messages = await getMessages(before, getChannelId());
  const [lastMessage] = [...messages].reverse();
  messages.forEach((message) => {
    const messageElement = createMessageDiv(message);
    $(`.${rootWrapperElementClassName}`).append(messageElement);
  });

  const loadMoreElement = $(`<button id='${lastMessage}'>load more</button>`);
  // eslint-disable-next-line consistent-return
  loadMoreElement.on('click', (event) => {
    if (!lastMessage?.id) return $(event.target).remove();
    loadMessages({ before: lastMessage.id, channel: getChannelId() });
    $(event.target).remove();
  });
  $(`.${rootWrapperElementClassName}`).append(loadMoreElement);
  // loadMoreElement.click();
}

function createMessageDiv(message) {
  const {
    content, author, createdTimestamp, attachments, embeds, reactions,
  } = message;
  const { username, avatarURL } = author;
  const div = $(`<div class="${messageWrapperElementClassName}"/>`);

  /**
   * user-thumbnail
   */
  div.append(`
    <div class="user-thumbnail">
        <img src="${avatarURL}" onerror="this.src='/discord.png'">
    </div>`);

  /**
   * message-line
   */
  div.append(`<div class="message-line">
      <div class="time-line">
          <div class="username">${username}</div>
          <div class="created">${moment(createdTimestamp).format('YY/MM/DD kk:mm:ss')}</div>
      </div>
      <div class="text-line">
        <div class="content">${content}</div>
      </div>
    </div>`);

  /**
   * text-line
   */
  div.find('.text-line').append(`
    <div class="image-line"></div>
  `);

  /**
   * embeds
   */
  const DEFAULT_HEX_COLOR = '#ccc';
  const getHexColor = (embeds) => {
    const filteredEmbed = embeds.filter((embed) => embed.color);
    if (!filteredEmbed) return DEFAULT_HEX_COLOR;
    const [color] = filteredEmbed.map((embed) => embed.color);
    if (!color) return DEFAULT_HEX_COLOR;
    const stringColor = Number(color).toString(16);
    return `#${stringColor}`;
  };
  const embedMessage = embeds.map((embed) => {
    const {
      description, footer, image = {}, thumbnail, fields, author,
    } = embed;
    const message = $(`
        <div class="embed-message">
          <div class="embed-desc">${description || ''}</div>
          <div class="embed-image"></div>
          <div class="embed-footer"></div>
        </div>`);

    const imageElement = message.find('.embed-image');
    if (image?.url) imageElement.append(`<img src="${image.url}" width="${image.width >= 500 ? 500 : image.width}" >`);

    const descElement = message.find('.embed-desc');
    if (thumbnail?.url) descElement.append(`<img width="${thumbnail.width >= 500 ? 500 : thumbnail.width}" src="${thumbnail.url}">`);
    if (fields && fields.length !== 0) {
      descElement.prepend($('<div class="embed-fields"></div>'));
      const fieldsElement = message.find('.embed-fields');
      fields.forEach((field) => {
        const { name, value } = field;
        const fieldMessage = `${name || ''} ${value || ''}`;
        if (fieldMessage.length > 1) fieldsElement.append(`<div>${fieldMessage}</div>`);
      });
    }
    if (author) {
      const { icon_url, name, url } = author;
      message.append(`<div class='embed-author' style="display:flex;align-items: center"><a target="_blank" href="${url}">${name}</a></div>`);
      if (icon_url) message.find('.embed-author').prepend(`<img style="margin-right:6px" width="30" src="${icon_url}"/>`);
    }

    const footerElement = message.find('.embed-footer');
    if (footer?.text) footerElement.append(`${footer.text}`);
    return message;
  });
  if (embedMessage && embedMessage.length > 0) {
    // style="border-color:${getHexColor(embeds)}"
    const target = div.find('.content').append(embedMessage);
    target.find('.embed-message').css('border-color', getHexColor(embeds));
  }

  /**
   * attachments
   */
  attachments.forEach((attach) => {
    const { attachment, width } = attach;
    if (attachment) div.find('.image-line').append(`<img src='${attachment}' width="${width >= 500 ? 500 : width}"/>`);
  });

  /**
   * reactions
   */

  const { message: reactionMessage } = reactions;
  const { type } = reactionMessage;
  if (type === 'GUILD_MEMBER_JOIN') {
    div.find('.message-line').append('<div class="first-join">서버에 신규 입장하셨습니다.</div>');
  }

  return div;
}

function getChannelId() {
  const params = document.location.search.substr(1).split('&');
  const [channelParameter] = params.filter((param) => {
    const [name, value] = param.split('=');
    if (name === 'channel') return true;
    return false;
  });
  if(!channelParameter)return;
  const [, channelId] = channelParameter.split('=');
  return channelId;
}

function getSearchParameter(parameter) {
  const params = document.location.search.substr(1).split('&');
  const [channelParameter] = params.filter((param) => {
    const [name, value] = param.split('=');
    if (name === parameter) return true;
    return false;
  });
  if(!channelParameter)return;
  const [, channelId] = channelParameter.split('=');
  return channelId;
}

window.addEventListener('load', async () => {
  $('body').html('');
  $('body').append(`<div class="${guildsWrapperElementClassName}">`);
  $('body').append(`<div class="${rootWrapperElementClassName}">`);
  await loadGuilds();
  const channelId = getChannelId();
  if (channelId) await loadMessages();
});
