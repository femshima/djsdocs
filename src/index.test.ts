import DocumentationSearch from '.';
import { loadSync } from './loader';

const searcher = new DocumentationSearch(
  'discord.js/stable',
  loadSync('discord.js/stable'),
  true
);

describe('Exact matches', () => {
  it('class', () => {
    expect(searcher.search('MessageButton')).toMatchObject({
      title: '__MessageButton__',
      url: 'https://discord.js.org/#/docs/discord.js/stable/class/MessageButton',
      description:
        '*extends [BaseMessageComponent](https://discord.js.org/#/docs/discord.js/stable/class/BaseMessageComponent)*\nRepresents a button message component.',
      fields: [
        {
          name: 'Properties',
          value: '`customId` `disabled` `emoji` `label` `style` `type` `url`',
        },
        {
          name: 'Methods',
          value:
            '`setCustomId` `setDisabled` `setEmoji` `setLabel` `setStyle` `setURL` `toJSON`',
        },
      ],
      footer: {
        text: '[View Source](https://github.com/discordjs/discord.js/blob/stable/src/structures/MessageButton.js#L12)',
      },
    });
  });
  it('typedef', () => {
    expect(searcher.search('ColorResolvable')).toMatchObject({
      title: '__ColorResolvable__',
      url: 'https://discord.js.org/#/docs/discord.js/stable/typedef/ColorResolvable',
      description: [
        '',
        'Can be a number, hex string, an RGB array like:',
        '```js',
        '[255, 0, 255] // purple',
        '```',
        'or one of the following strings:',
        '- `DEFAULT`',
        '- `WHITE`',
        '- `AQUA`',
        '- `GREEN`',
        '- `BLUE`',
        '- `YELLOW`',
        '- `PURPLE`',
        '- `LUMINOUS_VIVID_PINK`',
        '- `FUCHSIA`',
        '- `GOLD`',
        '- `ORANGE`',
        '- `RED`',
        '- `GREY`',
        '- `NAVY`',
        '- `DARK_AQUA`',
        '- `DARK_GREEN`',
        '- `DARK_BLUE`',
        '- `DARK_PURPLE`',
        '- `DARK_VIVID_PINK`',
        '- `DARK_GOLD`',
        '- `DARK_ORANGE`',
        '- `DARK_RED`',
        '- `DARK_GREY`',
        '- `DARKER_GREY`',
        '- `LIGHT_GREY`',
        '- `DARK_NAVY`',
        '- `BLURPLE`',
        '- `GREYPLE`',
        '- `DARK_BUT_NOT_BLACK`',
        '- `NOT_QUITE_BLACK`',
        '- `RANDOM`',
      ].join('\n'),
      fields: [
        {
          name: 'Type',
          value: '`string` `number` `Array<number>`',
        },
      ],
      footer: {
        text: '[View Source](https://github.com/discordjs/discord.js/blob/stable/src/util/Util.js#L432)',
      },
    });
  });
});

describe('Ambiguous matches', () => {
  it('class', () => {
    expect(searcher.search('messageb')).toMatchObject({
      title: 'Search Results:',
      description: [
        ':regional_indicator_c:[MessageButton](https://discord.js.org/#/docs/discord.js/stable/class/MessageButton)',
        ':regional_indicator_m:[MessageButton.setCustomId()](https://discord.js.org/#/docs/discord.js/stable/class/MessageButton?scrollTo=setCustomId)',
        ':regional_indicator_m:[MessageButton.setDisabled()](https://discord.js.org/#/docs/discord.js/stable/class/MessageButton?scrollTo=setDisabled)',
        ':regional_indicator_m:[MessageButton.setEmoji()](https://discord.js.org/#/docs/discord.js/stable/class/MessageButton?scrollTo=setEmoji)',
        ':regional_indicator_m:[MessageButton.setLabel()](https://discord.js.org/#/docs/discord.js/stable/class/MessageButton?scrollTo=setLabel)',
        ':regional_indicator_m:[MessageButton.setStyle()](https://discord.js.org/#/docs/discord.js/stable/class/MessageButton?scrollTo=setStyle)',
        ':regional_indicator_m:[MessageButton.setURL()](https://discord.js.org/#/docs/discord.js/stable/class/MessageButton?scrollTo=setURL)',
        ':regional_indicator_m:[MessageButton.toJSON()](https://discord.js.org/#/docs/discord.js/stable/class/MessageButton?scrollTo=toJSON)',
        ':regional_indicator_m:[MessageButton.resolveStyle()](https://discord.js.org/#/docs/discord.js/stable/class/MessageButton?scrollTo=resolveStyle)',
        ':regional_indicator_p:[MessageButton.label](https://discord.js.org/#/docs/discord.js/stable/class/MessageButton?scrollTo=label)',
      ].join('\n'),
    });
  });
  it('typedef&event', () => {
    expect(searcher.search('channelcrea')).toMatchObject({
      title: 'Search Results:',
      description: [
        ':regional_indicator_t:[GuildChannelCreateOptions](https://discord.js.org/#/docs/discord.js/stable/typedef/GuildChannelCreateOptions)',
        ':regional_indicator_p:[GuildChannelCreateOptions.parent](https://discord.js.org/#/docs/discord.js/stable/typedef/GuildChannelCreateOptions?scrollTo=parent)',
        ':regional_indicator_e:[Client#channelCreate](https://discord.js.org/#/docs/discord.js/stable/class/Client?scrollTo=e-channelCreate)',
        ':regional_indicator_p:[Channel.createdTimestamp](https://discord.js.org/#/docs/discord.js/stable/class/Channel?scrollTo=createdTimestamp)',
        ':regional_indicator_p:[Channel.createdAt](https://discord.js.org/#/docs/discord.js/stable/class/Channel?scrollTo=createdAt)',
        ':regional_indicator_m:[DMChannel.createMessageCollector()](https://discord.js.org/#/docs/discord.js/stable/class/DMChannel?scrollTo=createMessageCollector)',
        ':regional_indicator_m:[DMChannel.createMessageComponentCollector()](https://discord.js.org/#/docs/discord.js/stable/class/DMChannel?scrollTo=createMessageComponentCollector)',
        ':regional_indicator_p:[DMChannel.createdTimestamp](https://discord.js.org/#/docs/discord.js/stable/class/DMChannel?scrollTo=createdTimestamp)',
        ':regional_indicator_p:[DMChannel.createdAt](https://discord.js.org/#/docs/discord.js/stable/class/DMChannel?scrollTo=createdAt)',
        ':regional_indicator_m:[NewsChannel.createInvite()](https://discord.js.org/#/docs/discord.js/stable/class/NewsChannel?scrollTo=createInvite)',
      ].join('\n'),
    });
  });
  it('interface', () => {
    expect(searcher.search('interactionrespons')).toMatchObject({
      title: 'Search Results:',
      description: [
        ':regional_indicator_t:[InteractionResponseType](https://discord.js.org/#/docs/discord.js/stable/typedef/InteractionResponseType)',
        ':regional_indicator_i:[InteractionResponses](https://discord.js.org/#/docs/discord.js/stable/interface/InteractionResponses)',
        ':regional_indicator_m:[InteractionResponses.deferReply()](https://discord.js.org/#/docs/discord.js/stable/interface/InteractionResponses?scrollTo=deferReply)',
        ':regional_indicator_m:[InteractionResponses.reply()](https://discord.js.org/#/docs/discord.js/stable/interface/InteractionResponses?scrollTo=reply)',
        ':regional_indicator_m:[InteractionResponses.fetchReply()](https://discord.js.org/#/docs/discord.js/stable/interface/InteractionResponses?scrollTo=fetchReply)',
        ':regional_indicator_m:[InteractionResponses.editReply()](https://discord.js.org/#/docs/discord.js/stable/interface/InteractionResponses?scrollTo=editReply)',
        ':regional_indicator_m:[InteractionResponses.deleteReply()](https://discord.js.org/#/docs/discord.js/stable/interface/InteractionResponses?scrollTo=deleteReply)',
        ':regional_indicator_m:[InteractionResponses.followUp()](https://discord.js.org/#/docs/discord.js/stable/interface/InteractionResponses?scrollTo=followUp)',
        ':regional_indicator_m:[InteractionResponses.deferUpdate()](https://discord.js.org/#/docs/discord.js/stable/interface/InteractionResponses?scrollTo=deferUpdate)',
        ':regional_indicator_m:[InteractionResponses.update()](https://discord.js.org/#/docs/discord.js/stable/interface/InteractionResponses?scrollTo=update)',
      ].join('\n'),
    });
  });
});
