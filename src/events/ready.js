const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🚀 Çetrefilli hazır! ${client.user.tag} olarak giriş yapıldı.`);
        console.log(`📊 ${client.guilds.cache.size} sunucuda aktif.`);
        
        // Bot durumunu ayarla
        client.user.setActivity('Sunucuları koruyor! 🛡️', { type: 'WATCHING' });
    },
};
