const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];

// Komutları topla
const foldersPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`✅ Komut eklendi: ${command.data.name}`);
        } else {
            console.log(`⚠️ Hatalı komut dosyası: ${filePath}`);
        }
    }
}

// REST API ile komutları deploy et
const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`🔄 ${commands.length} slash komut yenileniyor...`);

        // Guild komutları için (test sunucusu)
        if (process.env.GUILD_ID) {
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`✅ ${data.length} guild komut başarıyla yenilendi!`);
        } else {
            // Global komutlar (tüm sunucular - 1 saat gecikme olabilir)
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`✅ ${data.length} global komut başarıyla yenilendi!`);
        }

    } catch (error) {
        console.error('❌ Komutlar yüklenirken hata:', error);
    }
})();
