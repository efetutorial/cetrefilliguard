const { Events, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Ban takip sistemi - her sunucu için ayrı
const banTracking = new Map();

module.exports = {
    name: Events.GuildBanAdd,
    async execute(ban) {
        // Güvenlik komutu modülünü yükle
        const securityCommand = require('../commands/security/güvenlik.js');
        
        // Ban spam koruması kapalıysa işlem yapma
        if (!securityCommand.isBanSpamProtectionEnabled(ban.guild.id)) {
            return;
        }

        try {
            // Audit log'dan kim ban attı bulalım
            const auditLogs = await ban.guild.fetchAuditLogs({
                type: 22, // MEMBER_BAN_ADD
                limit: 1
            });

            const auditEntry = auditLogs.entries.first();
            
            if (!auditEntry || !auditEntry.executor || auditEntry.executor.bot) {
                return; // Bot tarafından yapılan banları görmezden gel
            }

            const executor = auditEntry.executor;
            const guildId = ban.guild.id;
            const executorId = executor.id;
            const now = Date.now();

            // Sunucu için ban takip verisini hazırla
            if (!banTracking.has(guildId)) {
                banTracking.set(guildId, new Map());
            }

            const guildBanData = banTracking.get(guildId);

            // Kullanıcı için ban geçmişini hazırla
            if (!guildBanData.has(executorId)) {
                guildBanData.set(executorId, []);
            }

            const userBans = guildBanData.get(executorId);

            // 5 dakikadan eski banları temizle
            const fiveMinutesAgo = now - (5 * 60 * 1000);
            const recentBans = userBans.filter(banTime => banTime > fiveMinutesAgo);

            // Yeni ban'ı ekle
            recentBans.push(now);
            guildBanData.set(executorId, recentBans);

            console.log(`📊 ${executor.tag} son 5 dakikada ${recentBans.length} ban attı`);

            // 3'ten fazla ban kontrolü
            if (recentBans.length > 3) {
                const member = ban.guild.members.cache.get(executorId);
                
                if (member) {
                    // Tüm yönetici yetkilerini al - kapsamlı koruma
                    const dangerousPermissions = [
                        PermissionFlagsBits.Administrator,
                        PermissionFlagsBits.BanMembers,
                        PermissionFlagsBits.KickMembers,
                        PermissionFlagsBits.ManageRoles,
                        PermissionFlagsBits.ManageGuild,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.ManageNicknames,
                        PermissionFlagsBits.ManageWebhooks,
                        PermissionFlagsBits.ManageEmojisAndStickers,
                        PermissionFlagsBits.ModerateMembers,
                        PermissionFlagsBits.ViewAuditLog,
                        PermissionFlagsBits.MentionEveryone
                    ];

                    // Üyenin rollerini kontrol et ve tehlikeli yetkileri kaldır
                    let removedRoles = [];
                    
                    for (const role of member.roles.cache.values()) {
                        if (role.id === ban.guild.id) continue; // @everyone rolünü atla
                        
                        const hasDangerousPerms = dangerousPermissions.some(perm => role.permissions.has(perm));
                        
                        if (hasDangerousPerms) {
                            try {
                                await member.roles.remove(role, 'Çetrefilli: Ban spam koruması - aşırı ban attığı için tüm yönetici yetkileri kaldırıldı');
                                removedRoles.push(role.name);
                            } catch (error) {
                                console.error(`Rol kaldırma hatası: ${error.message}`);
                            }
                        }
                    }

                    // Yetkili kullanıcıya DM gönder
                    try {
                        const targetUser = await ban.client.users.fetch('918541479100686406');
                        const nickname = member.nickname || member.user.username;
                        
                        const embed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('🚨 Ban Spam Uyarısı!')
                            .setDescription(`**${nickname}**(${executor.username}) (${executor.id}) gerizekalısı 5 dakika içinde ${recentBans.length} kişiyi banladı!`)
                            .addFields(
                                { name: '👤 Suçlu', value: `${executor.tag}`, inline: true },
                                { name: '📊 Ban Sayısı', value: `${recentBans.length}`, inline: true },
                                { name: '🏠 Sunucu', value: ban.guild.name, inline: true },
                                { name: '🛡️ Kaldırılan Roller', value: removedRoles.length > 0 ? removedRoles.join(', ') : 'Hiçbiri', inline: false }
                            )
                            .setTimestamp();

                        await targetUser.send({ embeds: [embed] });
                        
                    } catch (dmError) {
                        console.error('DM gönderilemedi:', dmError);
                    }

                    console.log(`🛡️ ${executor.tag} ban spam nedeniyle yetkisi kaldırıldı! (${recentBans.length} ban)`);
                    
                    // Ban verilerini temizle
                    guildBanData.delete(executorId);
                }
            }

        } catch (error) {
            console.error('Ban takip sistemi hatası:', error);
        }
    },
};
