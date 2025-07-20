const { Events, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: Events.ChannelDelete,
    async execute(channel) {
        try {
            // Audit log'dan kim kanalı sildi bulalım
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: 12, // CHANNEL_DELETE
                limit: 1
            });

            const auditEntry = auditLogs.entries.first();
            
            if (!auditEntry || !auditEntry.executor || auditEntry.executor.bot) {
                return; // Bot tarafından yapılan işlemleri görmezden gel
            }

            const executor = auditEntry.executor;
            
            // Güvenlik komutu modülünü yükle
            const securityCommand = require('../commands/security/güvenlik.js');
            
            // Ses kanalları için özel kontrol
            if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
                // Ses kanalları için ayrı koruma kontrol et
                if (!securityCommand.isVoiceChannelProtectionEnabled(channel.guild.id, executor.id)) {
                    return; // Bu kullanıcı ses kanallarında korunmuyor
                }
                // Ses kanalı koruması devam eder
            } else {
                // Normal kanal koruması kontrolü
                if (!securityCommand.isChannelProtectionEnabled(channel.guild.id)) {
                    return;
                }
            }

            const member = channel.guild.members.cache.get(executor.id);

            if (member) {
                // Tehlikeli yetkileri tanımla
                const dangerousPermissions = [
                    PermissionFlagsBits.Administrator,
                    PermissionFlagsBits.ManageGuild,
                    PermissionFlagsBits.ManageRoles,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.BanMembers,
                    PermissionFlagsBits.KickMembers
                ];

                // Üyenin rollerini kontrol et ve tehlikeli yetkileri kaldır
                let removedRoles = [];
                
                for (const role of member.roles.cache.values()) {
                    if (role.id === channel.guild.id) continue; // @everyone rolünü atla
                    
                    const hasDangerousPerms = dangerousPermissions.some(perm => role.permissions.has(perm));
                    
                    if (hasDangerousPerms) {
                        try {
                            await member.roles.remove(role, 'Çetrefilli: Kanal silme koruması - yetkisiz kanal sildiği için yetkileri kaldırıldı');
                            removedRoles.push(role.name);
                        } catch (error) {
                            console.error(`Rol kaldırma hatası: ${error.message}`);
                        }
                    }
                }

                // Yetkili kullanıcıya DM gönder
                try {
                    const targetUser = await channel.client.users.fetch('918541479100686406');
                    const nickname = member.nickname || member.user.username;
                    
                    // Kanal türünü belirle
                    let channelTypeText = 'Kanal';
                    switch (channel.type) {
                        case ChannelType.GuildText:
                            channelTypeText = 'Metin Kanalı';
                            break;
                        case ChannelType.GuildCategory:
                            channelTypeText = 'Kategori';
                            break;
                        case ChannelType.GuildNews:
                            channelTypeText = 'Duyuru Kanalı';
                            break;
                        case ChannelType.GuildForum:
                            channelTypeText = 'Forum Kanalı';
                            break;
                        case ChannelType.GuildVoice:
                            channelTypeText = 'Ses Kanalı';
                            break;
                        case ChannelType.GuildStageVoice:
                            channelTypeText = 'Sahne Kanalı';
                            break;
                        default:
                            channelTypeText = 'Kanal';
                    }
                    
                    const isVoiceChannel = channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice;
                    
                    const embed = new EmbedBuilder()
                        .setColor(isVoiceChannel ? '#ff6600' : '#ff4444')
                        .setTitle(isVoiceChannel ? '🔊 Ses Kanalı Silme Uyarısı!' : '🗑️ Kanal Silme Uyarısı!')
                        .setDescription(`**${nickname}**(${executor.username}) (${executor.id}) gerizekalısı "${channel.name}" ${channelTypeText.toLowerCase()}ını sildi!`)
                        .addFields(
                            { name: '👤 Suçlu', value: `${executor.tag}`, inline: true },
                            { name: '📺 Silinen Kanal', value: `${isVoiceChannel ? '🔊' : '#'}${channel.name}`, inline: true },
                            { name: '📋 Kanal Türü', value: channelTypeText, inline: true },
                            { name: '🏠 Sunucu', value: channel.guild.name, inline: true },
                            { name: '🛡️ Kaldırılan Roller', value: removedRoles.length > 0 ? removedRoles.join(', ') : 'Hiçbiri', inline: false }
                        )
                        .setTimestamp();

                    if (isVoiceChannel) {
                        embed.addFields({ name: '🔊 Özel Koruma', value: 'Bu kullanıcı ses kanalı korumasındaydı', inline: false });
                    }

                    await targetUser.send({ embeds: [embed] });
                    
                } catch (dmError) {
                    console.error('DM gönderilemedi:', dmError);
                }

                console.log(`🛡️ ${executor.tag} kanal silme nedeniyle yetkisi kaldırıldı! Silinen kanal: ${isVoiceChannel ? '🔊' : '#'}${channel.name}`);
            }

        } catch (error) {
            console.error('Kanal koruma sistemi hatası:', error);
        }
    },
};

