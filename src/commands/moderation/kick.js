const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Bir kullanıcıyı sunucudan atar')
        .addUserOption(option =>
            option.setName('hedef')
                .setDescription('Atılacak kullanıcı')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('sebep')
                .setDescription('Atma sebebi')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const target = interaction.options.getUser('hedef');
        const reason = interaction.options.getString('sebep') || 'Sebep belirtilmemiş';
        const member = interaction.guild.members.cache.get(target.id);

        // Kullanıcı kontrolü
        if (!member) {
            return interaction.reply({ 
                content: '❌ Bu kullanıcı sunucuda bulunamadı!', 
                ephemeral: true 
            });
        }

        // Kendini atmaya çalışma kontrolü
        if (target.id === interaction.user.id) {
            return interaction.reply({ 
                content: '❌ Kendini atamazsın!', 
                ephemeral: true 
            });
        }

        // Bot sahibini atma kontrolü
        if (target.id === interaction.client.user.id) {
            return interaction.reply({ 
                content: '❌ Beni atamazsın!', 
                ephemeral: true 
            });
        }

        // Yetki kontrolü
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ 
                content: '❌ Bu kullanıcıyı atmak için yeterli yetkin yok!', 
                ephemeral: true 
            });
        }

        try {
            await member.kick(reason);
            await interaction.reply({ 
                content: `✅ ${target.tag} başarıyla atıldı!\n**Sebep:** ${reason}` 
            });
        } catch (error) {
            console.error('Kick hatası:', error);
            await interaction.reply({ 
                content: '❌ Kullanıcı atılırken bir hata oluştu!', 
                ephemeral: true 
            });
        }
    },
};
