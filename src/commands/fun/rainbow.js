const Command = require('../Command.js');
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const {fail, load} = require('../../utils/emojis.json');

module.exports = class gayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'gay',
            aliases: ['rainbow'],
            usage: 'gay <user mention/id>',
            description: 'Applies a rainbow filter to an avatar image',
            type: client.types.FUN,
            examples: ['gay @split'],
        });
    }

    async run(message, args) {
        const member = (await this.getGuildMember(message.guild, args.join(' '))) || message.author;
        await message.channel
            .send({
                embeds: [new EmbedBuilder().setDescription(`${load} Loading...`)],
            }).then(msg => {
                message.loadingMessage = msg;
                this.handle(member, message, false);
            });
    }

    async interact(interaction) {
        await interaction.deferReply();
        const member = interaction.options.getUser('user') || interaction.author;
        await this.handle(member, interaction, true);
    }

    async handle(targetUser, context, isInteraction) {
        try {
            const buffer = await context.client.ameApi.generate('rainbow', {
                url: this.getAvatarURL(targetUser, 'png'),
            });
            const attachment = new AttachmentBuilder(buffer, { name:  'rainbow.png' });

            if (isInteraction) {
                await context.editReply({
                    files: [attachment],
                });
            }
            else {
                context.loadingMessage ? context.loadingMessage.edit({
                    files: [attachment],
                    embeds: []
                }) : context.channel.send({
                    files: [attachment],
                });
            }
        }
        catch (err) {
            const embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(fail + ' ' + err.message)
                .setColor('RED');
            if (isInteraction) {
                await context.editReply({
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
