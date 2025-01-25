const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "ticketstats",
    description: "View ticket statistics",
    run: async (client, interaction) => {
        const ticketCategory = client.channels.cache.get(config.ticket_category);
        
        const stats = {
            total: 0,
            open: 0,
            closed: 0,
            avgResponseTime: 0
        };

        // Calculate statistics
        ticketCategory.children.cache.forEach(channel => {
            stats.total++;
            if(channel.name.startsWith('closed-')) {
                stats.closed++;
            } else {
                stats.open++;
            }
        });

        const embed = new EmbedBuilder()
            .setTitle('📊 Ticket Statistics')
            .setDescription(`
                Total Tickets: ${stats.total}
                Open Tickets: ${stats.open}
                Closed Tickets: ${stats.closed}
                Resolution Rate: ${((stats.closed/stats.total) * 100).toFixed(2)}%
            `)
            .setColor('Blue')
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
}; 