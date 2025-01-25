const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, PermissionFlagsBits } = require('discord.js');
const config = require('../../settings/config');
const fs = require('fs');

module.exports = {
    name: 'interactionCreate',
    once: false,
    execute: async (interaction, client) => {
        if (!interaction.isButton()) return;

        try {
            if (interaction.customId === "close") {
                // Defer the reply immediately
                await interaction.deferReply({ ephemeral: true });

                // Rename the channel
                await interaction.channel.setName(`closed-${interaction.channel.name}`);

                // Update permissions to read-only
                await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
                    SendMessages: false
                });

                await interaction.channel.permissionOverwrites.edit(config.support_team, {
                    SendMessages: false
                });

                // Send closed message with reopen button
                await interaction.channel.send({
                    embeds: [{
                        title: "تیکت",
                        description: `این تیکت توسط ${interaction.user} بسته شد`,
                        color: Colors.Red,
                        footer: {
                            text: "تیکت"
                        },
                        timestamp: new Date()
                    }],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('reopen')
                                    .setLabel('بازگشایی تیکت')
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setCustomId('delete')
                                    .setLabel('حذف تیکت')
                                    .setStyle(ButtonStyle.Danger)
                            )
                    ]
                });

                await interaction.editReply({
                    content: 'تیکت با موفقیت بسته شد!',
                    ephemeral: true
                });

                await client.emit('ticketUpdate');
            } else if (interaction.customId === "reopen") {
                // Defer the reply
                await interaction.deferReply({ ephemeral: true });

                // Remove "closed-" prefix from channel name
                const newName = interaction.channel.name.replace('closed-', '');
                await interaction.channel.setName(newName);

                // Restore permissions
                await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
                    SendMessages: true
                });

                await interaction.channel.permissionOverwrites.edit(config.support_team, {
                    SendMessages: true
                });

                // Send reopened message with close button
                await interaction.channel.send({
                    embeds: [{
                        title: "تیکت",
                        description: `این تیکت توسط ${interaction.user} باز شد`,
                        color: Colors.Green,
                        footer: {
                            text: "تیکت"
                        },
                        timestamp: new Date()
                    }],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('close')
                                    .setLabel('بستن تیکت')
                                    .setStyle(ButtonStyle.Danger)
                            )
                    ]
                });

                await interaction.editReply({
                    content: 'تیکت با موفقیت باز شد!',
                    ephemeral: true
                });

                await client.emit('ticketUpdate');
            } else if (interaction.customId === "delete") {
                // Defer the reply
                await interaction.deferReply({ ephemeral: true });

                try {
                    // Get ticket opener's ID from channel topic
                    const ticketOpenerID = interaction.channel.topic;
                    const ticketOpener = await client.users.fetch(ticketOpenerID);

                    // Fetch all messages in the channel
                    const messages = await interaction.channel.messages.fetch();
                    let transcript = "";

                    messages.reverse().forEach(msg => {
                        transcript += `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;
                    });

                    // Save transcript to a file
                    const filename = `transcript-${interaction.channel.name}.txt`;
                    fs.writeFileSync(filename, transcript);

                    // Send transcript to the ticket opener
                    try {
                        await ticketOpener.send({
                            embeds: [{
                                title: "تیکت",
                                description: `Transcript of your ticket (${interaction.channel.name})`,
                                color: Colors.Blue,
                                footer: {
                                    text: "تیکت"
                                },
                                timestamp: new Date()
                            }],
                            files: [filename]
                        });
                    } catch (error) {
                        console.log("Could not DM transcript to ticket opener:", error);
                    }

                    // Send transcript to logs channel
                    const ticketLogs = client.channels.cache.get(config.ticket_logs);
                    await ticketLogs.send({
                        embeds: [{
                            title: "تیکت",
                            description: `تیکت حذف شد (${interaction.channel.name}) توسط ${interaction.user}`,
                            color: Colors.Red,
                            footer: {
                                text: "تیکت"
                            },
                            timestamp: new Date()
                        }],
                        files: [filename]
                    });

                    // After sending transcript
                    fs.unlink(filename, (err) => {
                        if (err) console.error('Error deleting transcript:', err);
                    });

                    // Notify user of deletion
                    await interaction.editReply({
                        content: 'تیکت در حال حذف شدن است...',
                        ephemeral: true
                    });

                    // Delete the channel after a short delay
                    setTimeout(() => {
                        interaction.channel.delete().catch(console.error);
                    }, 5000);

                    await client.emit('ticketUpdate');

                } catch (error) {
                    console.error("Error in delete ticket handler:", error);
                    await interaction.editReply({
                        content: "خطایی رخ داد.",
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error("Error handling interaction:", error);
            if (!interaction.deferred && !interaction.replied) {
                try {
                    await interaction.reply({
                        content: "An error occurred while processing your request.",
                        ephemeral: true
                    });
                } catch (err) {
                    console.error("Could not send error message:", err);
                }
            }
        }
    }
};
