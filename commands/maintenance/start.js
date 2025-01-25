const { EmbedBuilder } = require('discord.js');
const config = require('../../settings/config.js');

module.exports = {
    name: "start",
    description: "Take the bot out of maintenance mode",
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
        config.maintenance = false;

        // Create online embed
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('✅ بات انلاین شد')
            .setDescription('بات انلاین شد ')
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

        // Update bot's presence
        client.user.setPresence({ 
            activities: [{ name: `Argon Shop`, type: 1 }],
            status: 'online',
        });

        console.log(`[MAINTENANCE] Bot taken out of maintenance mode by ${interaction.user.tag}`);
    }
};