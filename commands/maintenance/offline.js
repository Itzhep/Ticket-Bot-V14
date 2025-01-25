const { EmbedBuilder } = require('discord.js');
const config = require('../../settings/config.js');

module.exports = {
    name: "offline",
    description: "Put the bot in maintenance mode",
    run: async (client, interaction) => {
        // Check if user has permission with fallback
        const hasPermission = (Array.isArray(config.OWNER_ID) && config.OWNER_ID.includes(interaction.user.id)) || 
                             (Array.isArray(config.DEV_ID) && config.DEV_ID.includes(interaction.user.id));
                             
        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Only the bot owner and developers can use this command!",
                ephemeral: true
            });
        }

        // Update config
        config.maintenance = true;
        
        // Create maintenance embed
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('🛠️ حالت خاموشی روشن شد')
            .setDescription('بات خاموش است فقط اونر ها میتونن بات رو روشن کنن')
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

        // Update bot's presence
        client.user.setPresence({
            activities: [{ name: '🛠️ Maintenance Mode', type: 4 }],
            status: 'idle',
        });

        console.log(`[MAINTENANCE] Bot set to maintenance mode by ${interaction.user.tag}`);
    }
};