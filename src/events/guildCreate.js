const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    execute(guild) {
        console.log(`➕ Yeni sunucuya katıldım: ${guild.name} (${guild.id})`);
        console.log(`👥 Üye sayısı: ${guild.memberCount}`);
    },
};
