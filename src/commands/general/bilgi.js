const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bilgi')
        .setDescription('Bot hakkında bilgi verir'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🤖 Çetrefilli Bot Bilgileri')
            .addFields(
                { name: '📅 Oluşturulma', value: `<t:${Math.floor(interaction.client.user.createdTimestamp / 1000)}:D>`, inline: true },
                { name: '💻 Node.js', value: process.version, inline: true },
                { name: '📚 Discord.js', value: require('discord.js').version, inline: true },
                { name: '⏱️ Uptime', value: `<t:${Math.floor((Date.now() - interaction.client.uptime) / 1000)}:R>`, inline: true }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Çetrefilli', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
