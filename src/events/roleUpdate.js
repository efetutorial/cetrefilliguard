const { Events, PermissionFlagsBits } = require('discord.js');
const path = require('node:path');

module.exports = {
    name: Events.GuildRoleUpdate,
    async execute(oldRole, newRole) {
        // Güvenlik komutu modülünü yükle
        const securityCommand = require('../commands/security/güvenlik.js');
        
        // Güvenlik sistemi kapalıysa işlem yapma
        if (!securityCommand.isSecurityEnabled(newRole.guild.id)) {
            return;
        }
        // Yönetici yetkisi kontrolü
        const adminPermissions = [
            PermissionFlagsBits.Administrator,
            PermissionFlagsBits.ManageGuild,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.BanMembers,
            PermissionFlagsBits.KickMembers
        ];

        // Eski rolde yönetici yetkisi var mıydı?
        const oldHadAdminPerms = adminPermissions.some(perm => oldRole.permissions.has(perm));
        // Yeni rolde yönetici yetkisi var mı?
        const newHasAdminPerms = adminPermissions.some(perm => newRole.permissions.has(perm));

        // Eğer eskiden yoktu ama şimdi varsa
        if (!oldHadAdminPerms && newHasAdminPerms) {
            try {
                // Audit log'dan kim bu değişikliği yaptı bulalım
                const auditLogs = await newRole.guild.fetchAuditLogs({
                    type: 31, // ROLE_UPDATE
                    limit: 1
                });

                const auditEntry = auditLogs.entries.first();
                
                if (auditEntry && auditEntry.target.id === newRole.id && auditEntry.executor) {
                    const culprit = auditEntry.executor;
                    
                    // Yönetici yetkilerini kaldır
                    const permissionsToRemove = newRole.permissions.toArray().filter(perm => 
                        adminPermissions.includes(PermissionFlagsBits[perm])
                    );
                    
                    if (permissionsToRemove.length > 0) {
                        // Yetkileri kaldır
                        const newPermissions = newRole.permissions.remove(adminPermissions);
                        await newRole.setPermissions(newPermissions, 'Çetrefilli: Yetkisiz yönetici yetkisi verilmesi engellendi');
                        
                        // Belirtilen kullanıcıya DM gönder
                        try {
                            const targetUser = await newRole.client.users.fetch('918541479100686406');
                            const member = newRole.guild.members.cache.get(culprit.id);
                            const nickname = member ? (member.nickname || member.user.username) : culprit.username;
                            
                            await targetUser.send(
                                `${nickname}(${culprit.username}) (${culprit.id}) gerizekalısı "${newRole.name}" rolüne yönetici vermeye çalıştı.`
                            );
                        } catch (dmError) {
                            console.error('DM gönderilemedi:', dmError);
                        }
                        
                        console.log(`🛡️ ${culprit.tag} tarafından "${newRole.name}" rolüne verilen yönetici yetkisi kaldırıldı!`);
                    }
                }
            } catch (error) {
                console.error('Rol güvenlik sistemi hatası:', error);
            }
        }
    },
};
