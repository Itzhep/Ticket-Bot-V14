const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const colors = require("colors");

const config = require('./settings/config');

// Define the client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message,
        Partials.Reaction, Partials.ThreadMember, Partials.User
    ],
    restTimeOffset: 0,
    failIfNotExists: false,
    presence: {
        activities: [{
            name: "Loading open tickets...",
            type: ActivityType.Watching
        }],
        status: "online"
    },
    allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false
    }
});

// Update ticket count function
const updateTicketCount = async () => {
    const ticketCategory = await client.channels.cache.get(config.ticket_category);
    const openTickets = ticketCategory.children.cache.filter(channel =>
        !channel.name.startsWith('closed-') &&
        channel.name !== 'انتخواب موضوع'
    ).size;

    // Update the bot's presence with the current open ticket count
    client.user.setPresence({
        activities: [{
            name: `${openTickets} open tickets`,
            type: ActivityType.Watching
        }],
        status: "online"
    });
};

// Log in to the bot
client.login(config.token);

// Set up the slash commands collection
client.slashCommands = new Collection();

// Client ready event
client.on("ready", async () => {
    require('./handler')(client);
    const readyEvent = require('./events/client/ready');
    await readyEvent.execute(client);

    // Update ticket count when the bot is ready
    await updateTicketCount();
    // Optionally, set up an interval to update the ticket count periodically
    setInterval(updateTicketCount, 60000); // Update every minute (60000 ms)
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
    if (error.code == 10062) return; // Unknown interaction
    console.log(`[ERROR] ${error}`.red);
});

module.exports = client;
