const Command = require('../Command.js');
const Discord = require('discord.js');
const {SlashCommandBuilder} = require('discord.js');
const {EmbedBuilder} = require('discord.js');
const {load, fail} = require('../../utils/emojis.json');

module.exports = class enlargeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'enlarge',
            aliases: [
                'en',
                'el',
                'big',
                'maximize',
                'bigemoji',
                'enemoji',
                'expand',
                'enhance',
            ],
            usage: 'en <emoji>',
            description: 'Enlarges a custom emoji',
            type: client.types.FUN,
            clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            examples: ['enlarge 🙄'],
            slashCommand: new SlashCommandBuilder().addStringOption((s) => s.setName('emoji').setRequired(true).setDescription('The emoji to enlarge')),
        });
    }

    async run(message, args) {
        if (!args[0]) return message.reply({embeds: [this.createHelpEmbed(message, 'Enlarge Emoji', this)]});

        await message.channel
            .send({
                embeds: [new EmbedBuilder().setDescription(`${load} Loading...`)],
            }).then(msg => {
                message.loadingMessage = msg;
                this.handle(args[0], message, false);
            });
    }

    async interact(interaction) {
        await interaction.deferReply();
        this.handle(interaction.options.getString('emoji'), interaction, true);
    }

    handle(text, context, isInteraction) {
        try {
            let customemoji = Discord.Util.parseEmoji(text); //Check if it's a emoji

            if (customemoji.id) {
                const Link = `https://cdn.discordapp.com/emojis/${customemoji.id}.${
                    customemoji.animated ? 'gif' : 'png'
                }`;
                if (isInteraction) {
                    context.editReply({
                        files: [new Discord.AttachmentBuilder(Link)],
                    });
                }
                else {
                    context.loadingMessage ? context.loadingMessage.edit({
                        files: [new Discord.AttachmentBuilder(Link)],
                    }) : context.channel.send({
                        files: [new Discord.AttachmentBuilder(Link)],
                    });
                }
            }
            else {
                this.sendErrorMessage(
                    context,
                    0,
                    'Please mention a valid custom emoji.'
                );
            }
        }
        catch (err) {
            const embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(fail + ' ' + err.message)
                .setColor('RED');
            if (isInteraction) {
                context.editReply({
                    embeds: [embed],
                });
            }
            else {
                context.loadingMessage ? context.loadingMessage.edit({
                    embeds: [embed]
                }) : context.channel.send({
                    embeds: [embed]
                });
            }
        }
    }
};
