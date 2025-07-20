const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bir kullanıcıyı sunucudan yasaklar')
        .addUserOption(option =>
            option.setName('hedef')
                .setDescription('Yasaklanacak kullanıcı')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('sebep')
                .setDescription('Yasaklama sebebi')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('mesaj-sil')
                .setDescription('Kaç günlük mesajları silinsin? (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const target = interaction.options.getUser('hedef');
        const reason = interaction.options.getString('sebep') || 'Sebep belirtilmemiş';
        const deleteMessageDays = interaction.options.getInteger('mesaj-sil') || 0;
        const member = interaction.guild.members.cache.get(target.id);

        // Kendini banlama kontrolü
        if (target.id === interaction.user.id) {
            return interaction.reply({ 
                content: '❌ Kendini yasaklayamazsın!', 
                ephemeral: true 
            });
        }

        // Bot'u banlama kontrolü
        if (target.id === interaction.client.user.id) {
            return interaction.reply({ 
                content: '❌ Beni yasaklayamazsın!', 
                ephemeral: true 
            });
        }

        // Üye varsa yetki kontrolü
        if (member && member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ 
                content: '❌ Bu kullanıcıyı yasaklamak için yeterli yetkin yok!', 
                ephemeral: true 
            });
        }

        try {
            await interaction.guild.members.ban(target, { 
                reason: reason,
                deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60
            });
            
            await interaction.reply({ 
                content: `✅ ${target.tag} başarıyla yasaklandı!\n**Sebep:** ${reason}${deleteMessageDays > 0 ? `\n**Silinen mesajlar:** ${deleteMessageDays} gün` : ''}` 
            });
        } catch (error) {
            console.error('Ban hatası:', error);
            await interaction.reply({ 
                content: '❌ Kullanıcı yasaklanırken bir hata oluştu!', 
                ephemeral: true 
            });
        }
    },
};
