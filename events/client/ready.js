const colors = require('colors');
const config = require('../../settings/config');
const { ActionRowBuilder, Colors, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: false,
    execute: async (client) => {
        console.log(`[READY] ${client.user.tag} (${client.user.id}) is ready !`.green);

        // Function to update ticket count status
        const updateTicketCount = async () => {
            const ticketCategory = await client.channels.cache.get(config.ticket_category);
            const openTickets = ticketCategory.children.cache.filter(channel => 
                !channel.name.startsWith('closed-') && 
                channel.name !== 'انتخواب موضوع'
            ).size;

            client.user.setPresence({
                activities: [{
                    name: `${openTickets} open tickets`,
                    type: ActivityType.Watching
                }],
                status: 'online'
            });
        };

        // Initial status update
        await updateTicketCount();

        // Set up ticket counter refresh interval
        setInterval(updateTicketCount, 60000); // Updates every minute

        let channelTicket = client.channels.cache.get(config.ticket_channel);
        await channelTicket.send({ content: "." })
        await channelTicket.bulkDelete(2);

        await channelTicket.send({
            embeds: [{
                title: "تیکت",
                description: "**برای ارتباط با کارکنان، روی دکمه زیر کلیک کنید!**",
                color: Colors.Blurple,
                footer: {
                    name: "تیکت",
                },
                timestamp: new Date(),
            }],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder() .setCustomId('ticket') .setLabel('ایجاد تیکت') .setStyle(ButtonStyle.Success)
                )
            ]
        });

        const checkInactiveTickets = async (client) => {
            const ticketCategory = await client.channels.cache.get(config.ticket_category);
            const tickets = ticketCategory.children.cache.filter(channel => 
                !channel.name.startsWith('closed-')
            );

            tickets.forEach(async ticket => {
                const lastMessage = (await ticket.messages.fetch({ limit: 1 })).first();
                const inactiveTime = Date.now() - lastMessage.createdTimestamp;
                
                if (inactiveTime > 24 * 60 * 60 * 1000) { // 24 hours
                    ticket.send({
                        content: "⚠️ This ticket will be closed due to inactivity in 24 hours."
                    });
                }
            });
        };

        // Run check every 12 hours
        setInterval(() => checkInactiveTickets(client), 12 * 60 * 60 * 1000);
    }
}
