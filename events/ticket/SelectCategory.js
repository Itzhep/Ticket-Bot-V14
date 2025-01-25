const { ActionRowBuilder, ChannelType, Colors, PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js')
const config = require('../../settings/config');

module.exports = {
    name: 'interactionCreate',
    once: false,
    execute: async (interaction, client) => {
        if(!interaction.isButton()) return;

        if(interaction.customId == 'ticket') {
            
            let ticket = interaction.guild.channels.create({
                name: `انتخواب موضوع`,
                type: ChannelType.GuildText,
                parent: config.ticket_category,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages],
                        deny: [PermissionFlagsBits.MentionEveryone]
                    },
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.MentionEveryone]
                    }
                ]
            }).then((c) => {
                c.send({
                    embeds: [{
                        title: "تیکت", 
                        description: "لطفا دسته بندی تیکت خود را انتخاب کنید!",
                        color: Colors.Blurple,
                    }],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                            .setCustomId('category')
                            .setPlaceholder('انتخاب دسته بندی')
                            .addOptions([
                                {
                                    label: 'خرید',
                                    description: 'خرید محصول',
                                    value: 'other',
                                    emoji: '🛒'
                                },
                                {
                                    label: 'سوال',
                                    description: 'هر گونه سوال',
                                    value: 'question',
                                    emoji: '📝'
                                },
                                {
                                    label: 'گزارش',
                                    description: 'گزارش کاربر',
                                    value: 'report',
                                    emoji: '🐛'
                                },
                            ])
                        )
                    ]
                });
                c.send({
                    content: `${interaction.user}`
                }).then(msg => {
                    setTimeout(() => {
                        msg.delete(), 1000
                    })
                });
            });
            interaction.reply({
                content: `:white_check_mark: | تیکت شما ساخته شد !`,
                ephemeral: true
            })
        }
    }
}