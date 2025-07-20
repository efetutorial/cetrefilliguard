const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Güvenlik sistemi durumu (sunucu bazlı)
const securitySettings = new Map();
const banSpamSettings = new Map();
const channelProtectionSettings = new Map();
const voiceChannelProtectedUsers = new Map(); // Sunucu bazlı ses kanalı korumalı kullanıcılar

module.exports = {
    data: new SlashCommandBuilder()
        .setName('güvenlik')
        .setDescription('Rol güvenlik sistemini yönet (Sadece yetkili kullanıcı)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('aç')
                .setDescription('Rol güvenlik sistemini aç')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('kapat')
                .setDescription('Rol güvenlik sistemini kapat')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('durum')
                .setDescription('Güvenlik sistemi durumunu göster')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban-koruma')
                .setDescription('Ban spam korumasını aç/kapat')
                .addStringOption(option =>
                    option.setName('durum')
                        .setDescription('Ban koruması durumu')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Aç', value: 'enable' },
                            { name: 'Kapat', value: 'disable' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('kanal-koruma')
                .setDescription('Kanal silme korumasını aç/kapat')
                .addStringOption(option =>
                    option.setName('durum')
                        .setDescription('Kanal koruması durumu')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Aç', value: 'enable' },
                            { name: 'Kapat', value: 'disable' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('ses')
                .setDescription('Ses kanalı koruması yönetimi')
                .addStringOption(option =>
                    option.setName('işlem')
                        .setDescription('Yapılacak işlem')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Üye Ekle', value: 'add' },
                            { name: 'Üye Çıkar', value: 'remove' },
                            { name: 'Liste', value: 'list' }
                        )
                )
                .addUserOption(option =>
                    option.setName('üye')
                        .setDescription('Korunacak/çıkarılacak üye')
                        .setRequired(false)
                )
        ),
    
    async execute(interaction) {
        // Sadece belirtilen kullanıcı bu komutu kullanabilir
        if (interaction.user.id !== '918541479100686406') {
            return interaction.reply({ 
                content: '❌ Bu komutu kullanma yetkiniz yok!', 
                ephemeral: true 
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        switch (subcommand) {
            case 'aç':
                securitySettings.set(guildId, true);
                
                const enableEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('🛡️ Güvenlik Sistemi Aktif')
                    .setDescription('Rol güvenlik sistemi başarıyla **açıldı**!')
                    .addFields(
                        { name: '🔒 Korunan Yetkiler', value: '• Administrator\n• Manage Server\n• Manage Roles\n• Manage Channels\n• Ban Members\n• Kick Members' }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [enableEmbed] });
                break;

            case 'kapat':
                securitySettings.set(guildId, false);
                
                const disableEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('🔓 Güvenlik Sistemi Pasif')
                    .setDescription('Rol güvenlik sistemi **kapatıldı**!')
                    .addFields(
                        { name: '⚠️ Uyarı', value: 'Artık rollere yönetici yetkisi verilmesi kontrol edilmeyecek!' }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [disableEmbed] });
                break;

            case 'durum':
                const isEnabled = securitySettings.get(guildId) !== false; // Varsayılan: açık
                const isBanProtectionEnabled = banSpamSettings.get(guildId) !== false; // Varsayılan: açık
                const isChannelProtectionEnabled = channelProtectionSettings.get(guildId) !== false; // Varsayılan: açık
                
                const statusEmbed = new EmbedBuilder()
                    .setColor(isEnabled ? '#00ff00' : '#ff0000')
                    .setTitle('📊 Güvenlik Sistemi Durumu')
                    .addFields(
                        { name: '🔐 Rol Koruması', value: isEnabled ? '✅ **Aktif**' : '❌ **Pasif**', inline: true },
                        { name: '🚫 Ban Spam Koruması', value: isBanProtectionEnabled ? '✅ **Aktif**' : '❌ **Pasif**', inline: true },
                        { name: '🗑️ Kanal Silme Koruması', value: isChannelProtectionEnabled ? '✅ **Aktif**' : '❌ **Pasif**', inline: true },
                        { name: '🎯 Hedef Sunucu', value: interaction.guild.name, inline: true },
                        { name: '👤 Yönetici', value: `<@${interaction.user.id}>`, inline: true }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [statusEmbed] });
                break;

            case 'ban-koruma':
                const banStatus = interaction.options.getString('durum');
                const enableBanProtection = banStatus === 'enable';
                
                banSpamSettings.set(guildId, enableBanProtection);
                
                const banEmbed = new EmbedBuilder()
                    .setColor(enableBanProtection ? '#00ff00' : '#ff0000')
                    .setTitle(enableBanProtection ? '🛡️ Ban Spam Koruması Aktif' : '🔓 Ban Spam Koruması Pasif')
                    .setDescription(enableBanProtection ? 
                        'Ban spam koruması **açıldı**!\n\n5 dakika içinde 3\'ten fazla ban atan kişilerin yetkileri otomatik olarak kaldırılacak.' : 
                        'Ban spam koruması **kapatıldı**!'
                    )
                    .addFields(
                        { name: '⚙️ Ayar', value: enableBanProtection ? '5 dakika = 3 ban limiti' : 'Ban takibi devre dışı' }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [banEmbed] });
                break;

            case 'kanal-koruma':
                const channelStatus = interaction.options.getString('durum');
                const enableChannelProtection = channelStatus === 'enable';
                
                channelProtectionSettings.set(guildId, enableChannelProtection);
                
                const channelEmbed = new EmbedBuilder()
                    .setColor(enableChannelProtection ? '#00ff00' : '#ff0000')
                    .setTitle(enableChannelProtection ? '🛡️ Kanal Silme Koruması Aktif' : '🔓 Kanal Silme Koruması Pasif')
                    .setDescription(enableChannelProtection ? 
                        'Kanal silme koruması **açıldı**!\n\nKanal silen kişilerin yönetici yetkileri otomatik olarak kaldırılacak.\n\n**Not:** Ses kanalları bu korumanın dışındadır.' : 
                        'Kanal silme koruması **kapatıldı**!'
                    )
                    .addFields(
                        { name: '🔒 Korunan Kanallar', value: enableChannelProtection ? 'Metin, Kategori, Duyuru, Forum kanalları' : 'Hiçbiri' },
                        { name: '🔊 Hariç Tutulan', value: 'Ses kanalları ve sahne kanalları' }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [channelEmbed] });
                break;

            case 'ses':
                const voiceAction = interaction.options.getString('işlem');
                const targetUser = interaction.options.getUser('üye');
                
                // Sunucu için korumalı kullanıcı listesini hazırla
                if (!voiceChannelProtectedUsers.has(guildId)) {
                    voiceChannelProtectedUsers.set(guildId, new Set(['447386704626581504'])); // Varsayılan korumalı kullanıcı
                }
                
                const protectedUsers = voiceChannelProtectedUsers.get(guildId);
                
                switch (voiceAction) {
                    case 'add':
                        if (!targetUser) {
                            return interaction.reply({ content: '❌ Üye belirtmelisiniz!', ephemeral: true });
                        }
                        
                        protectedUsers.add(targetUser.id);
                        
                        const addEmbed = new EmbedBuilder()
                            .setColor('#00ff00')
                            .setTitle('🔊 Ses Kanalı Koruması')
                            .setDescription(`✅ **${targetUser.tag}** ses kanalı korumasına eklendi!`)
                            .addFields(
                                { name: '👤 Korunan Kullanıcı', value: `<@${targetUser.id}>`, inline: true },
                                { name: '🛡️ Koruma', value: 'Ses kanalı silerse yetkileri kaldırılacak', inline: true }
                            )
                            .setTimestamp();
                        
                        await interaction.reply({ embeds: [addEmbed] });
                        break;
                        
                    case 'remove':
                        if (!targetUser) {
                            return interaction.reply({ content: '❌ Üye belirtmelisiniz!', ephemeral: true });
                        }
                        
                        if (targetUser.id === '447386704626581504') {
                            return interaction.reply({ content: '❌ Bu kullanıcı varsayılan korumalı kullanıcıdır, çıkarılamaz!', ephemeral: true });
                        }
                        
                        protectedUsers.delete(targetUser.id);
                        
                        const removeEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('🔊 Ses Kanalı Koruması')
                            .setDescription(`❌ **${targetUser.tag}** ses kanalı korumasından çıkarıldı!`)
                            .addFields(
                                { name: '👤 Çıkarılan Kullanıcı', value: `<@${targetUser.id}>`, inline: true },
                                { name: '🔓 Durum', value: 'Artık ses kanalı koruması yok', inline: true }
                            )
                            .setTimestamp();
                        
                        await interaction.reply({ embeds: [removeEmbed] });
                        break;
                        
                    case 'list':
                        const userList = Array.from(protectedUsers).map(userId => `<@${userId}>`).join('\n') || 'Hiç korumalı kullanıcı yok';
                        
                        const listEmbed = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle('🔊 Ses Kanalı Korumalı Kullanıcılar')
                            .addFields(
                                { name: '👥 Korumalı Kullanıcılar', value: userList, inline: false },
                                { name: '📊 Toplam', value: `${protectedUsers.size} kullanıcı`, inline: true },
                                { name: '🏠 Sunucu', value: interaction.guild.name, inline: true }
                            )
                            .setTimestamp();
                        
                        await interaction.reply({ embeds: [listEmbed] });
                        break;
                }
                break;
        }
    },

    // Bu fonksiyonlar güvenlik sistemlerinin durumunu kontrol etmek için
    isSecurityEnabled(guildId) {
        return securitySettings.get(guildId) !== false; // Varsayılan: açık
    },

    isBanSpamProtectionEnabled(guildId) {
        return banSpamSettings.get(guildId) !== false; // Varsayılan: açık
    },

    isChannelProtectionEnabled(guildId) {
        return channelProtectionSettings.get(guildId) !== false; // Varsayılan: açık
    },

    isVoiceChannelProtectionEnabled(guildId, userId) {
        if (!voiceChannelProtectedUsers.has(guildId)) {
            voiceChannelProtectedUsers.set(guildId, new Set(['447386704626581504'])); // Varsayılan korumalı kullanıcı
        }
        return voiceChannelProtectedUsers.get(guildId).has(userId);
    }
};
