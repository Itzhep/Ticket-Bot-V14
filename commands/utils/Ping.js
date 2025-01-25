const { EmbedBuilder } = require("discord.js");
const os = require('os');
const { ServerIconUrl, EMBED_COLOR } = require("../../settings/config.js");

function formatUptime(uptime) {
    const days = Math.floor(uptime / (60 * 60 * 24));
    const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function getSystemLoad() {
    const load = os.loadavg();
    return {
        '1min': load[0].toFixed(2),
        '5min': load[1].toFixed(2),
        '15min': load[2].toFixed(2)
    };
}

function getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usedPercent = ((used / total) * 100).toFixed(2);
    return {
        total: (total / (1024 * 1024 * 1024)).toFixed(2),
        free: (free / (1024 * 1024 * 1024)).toFixed(2),
        used: (used / (1024 * 1024 * 1024)).toFixed(2),
        percent: usedPercent
    };
}

function getProcessMemory() {
    const usage = process.memoryUsage();
    return {
        rss: (usage.rss / (1024 * 1024)).toFixed(2),
        heapTotal: (usage.heapTotal / (1024 * 1024)).toFixed(2),
        heapUsed: (usage.heapUsed / (1024 * 1024)).toFixed(2)
    };
}

function getStatusIndicator(value, thresholds) {
    if (value <= thresholds.good) return "🟢";
    if (value <= thresholds.medium) return "🟡";
    return "🔴";
}

module.exports = {
    name: "ping",
    description: "Check detailed system and bot status",
    run: async (client, interaction) => {
        const startTime = performance.now();
        await interaction.deferReply();
        const endTime = performance.now();
        const ping = endTime - startTime;

        // Cache static system info
        const systemInfo = {
            nodeVersion: process.version,
            platform: os.platform(),
            arch: os.arch(),
            cpuCores: os.cpus().length,
            cpuModel: os.cpus()[0].model
        };

        // Use Promise.all for parallel execution of async operations
        const [load, memory, processMemory] = await Promise.all([
            getSystemLoad(),
            getMemoryUsage(),
            getProcessMemory()
        ]);

        // Calculate dynamic data after ping measurement
        const uptime = formatUptime(process.uptime());
        const systemUptime = formatUptime(os.uptime());
        const guildCount = client.guilds.cache.size;
        const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const channelCount = client.channels.cache.size;

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR || '#2F3136') // Add fallback color
            .setTitle("📊 System Monitor & Bot Status")
            .addFields(
                // Bot Status Section
                {
                    name: "🤖 Bot Status",
                    value: `>>> **Ping:** ${getStatusIndicator(ping, { good: 100, medium: 300 })} ${ping}ms
**Uptime:** ⏰ ${uptime}
**Servers:** 🏢 ${guildCount}
**Users:** 👥 ${userCount}
**Channels:** 📁 ${channelCount}`,
                    inline: false
                },
                // System Section
                {
                    name: "💻 System",
                    value: `>>> **Platform:** ${systemInfo.platform} (${systemInfo.arch})
**CPU:** ${systemInfo.cpuModel}
**Cores:** ${systemInfo.cpuCores}
**System Uptime:** ${systemUptime}
**Node.js:** ${systemInfo.nodeVersion}`,
                    inline: false
                },
                // Load Average Section
                {
                    name: "📈 System Load",
                    value: `>>> **1min:** ${getStatusIndicator(load['1min'], { good: 1, medium: 2 })} ${load['1min']}
**5min:** ${getStatusIndicator(load['5min'], { good: 1, medium: 2 })} ${load['5min']}
**15min:** ${getStatusIndicator(load['15min'], { good: 1, medium: 2 })} ${load['15min']}`,
                    inline: true
                },
                // Memory Section
                {
                    name: "🧮 Memory",
                    value: `>>> **Total:** ${memory.total} GB
**Used:** ${getStatusIndicator(memory.percent, { good: 60, medium: 80 })} ${memory.used} GB (${memory.percent}%)
**Free:** ${memory.free} GB`,
                    inline: true
                },
                // Process Memory Section
                {
                    name: "📊 Process Memory",
                    value: `>>> **RSS:** ${processMemory.rss} MB
**Heap Total:** ${processMemory.heapTotal} MB
**Heap Used:** ${processMemory.heapUsed} MB`,
                    inline: true
                }
            )
            .setThumbnail(ServerIconUrl || client.user.displayAvatarURL())
            .setFooter({ text: `Last Updated: ${new Date().toLocaleString()}` });
            
        await interaction.editReply({ embeds: [embed] });
    }
};
