const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kullanici')
        .setDescription('Kullanıcı bilgilerini gösterir')
        .addUserOption(option =>
            option.setName('hedef')
                .setDescription('Bilgilerini görmek istediğiniz kullanıcı')
                .setRequired(false)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('hedef') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle(`👤 ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Hesap Oluşturma', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
                { name: '🎯 Mention', value: `${user}`, inline: true }
            );

        if (member) {
            embed.addFields(
                { name: '📥 Sunucuya Katılma', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
                { name: '🎨 Renk', value: member.displayHexColor, inline: true },
                { name: '📋 Roller', value: member.roles.cache.filter(role => role.id !== interaction.guild.id).map(role => role).join(', ') || 'Rol yok', inline: false }
            );
        }

        embed.setFooter({ text: `Bilgiler ${user.tag} için` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
