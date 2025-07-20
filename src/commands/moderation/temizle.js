const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('temizle')
        .setDescription('Belirtilen sayıda mesajı siler')
        .addIntegerOption(option =>
            option.setName('sayi')
                .setDescription('Silinecek mesaj sayısı (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Sadece bu kullanıcının mesajlarını sil')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger('sayi');
        const targetUser = interaction.options.getUser('kullanici');

        // 100'den fazla mesaj temizlenmesini engelle
        if (amount > 100) {
            return interaction.reply({ 
                content: '❌ Güvenlik nedeniyle en fazla 100 mesaj silebilirsiniz!', 
                ephemeral: true 
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const messages = await interaction.channel.messages.fetch({ limit: Math.min(amount + 50, 150) });
            
            let messagesToDelete;
            if (targetUser) {
                messagesToDelete = messages.filter(msg => msg.author.id === targetUser.id).first(amount);
            } else {
                messagesToDelete = messages.first(amount);
            }

            // 14 günden eski mesajları filtrele (Discord API kısıtlaması)
            const twoWeeks = 14 * 24 * 60 * 60 * 1000;
            const validMessages = messagesToDelete.filter(msg => Date.now() - msg.createdTimestamp < twoWeeks);

            if (validMessages.length === 0) {
                return interaction.editReply('❌ Silinecek geçerli mesaj bulunamadı! (14 günden eski mesajlar silinemez)');
            }

            await interaction.channel.bulkDelete(validMessages, true);

            const successMessage = targetUser 
                ? `✅ ${targetUser.tag} kullanıcısının ${validMessages.length} mesajı silindi!`
                : `✅ ${validMessages.length} mesaj silindi!`;

            await interaction.editReply(successMessage);

        } catch (error) {
            console.error('Temizleme hatası:', error);
            await interaction.editReply('❌ Mesajlar silinirken bir hata oluştu!');
        }
    },
};
