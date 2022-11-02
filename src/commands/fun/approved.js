const Command = require('../Command.js');
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const {load} = require('../../utils/emojis.json');

module.exports = class approvedCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'approved',

            usage: 'approved <user mention/id>',
            description: 'Generates an approved image',
            type: client.types.FUN,
            examples: ['approved @split'],
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
        const buffer = await context.client.ameApi.generate('approved', {
            url: this.getAvatarURL(targetUser, 'png'),
        });
        const attachment = new AttachmentBuilder(buffer, { name:  'approved.png' });

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
};
