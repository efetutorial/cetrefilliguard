const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildDelete,
    execute(guild) {
        console.log(`➖ Sunucudan ayrıldım: ${guild.name} (${guild.id})`);
    },
};
