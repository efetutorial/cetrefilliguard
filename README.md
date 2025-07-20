# Çetrefilli - Güvenlik Odaklı Discord Bot

Discord.js v14 ile yapılmış güvenlik odaklı Discord bot.

## 🚀 Kurulum

1. **Gerekli paketleri yükleyin:**
   ```bash
   npm install
   ```

2. **Çevre değişkenlerini ayarlayın:**
   - `.env.example` dosyasını `.env` olarak kopyalayın
   - Gerekli bilgileri doldurun:
     ```
     TOKEN=your_bot_token_here
     CLIENT_ID=your_bot_client_id_here
     GUILD_ID=your_guild_id_here (opsiyonel - test sunucusu için)
     ```

3. **Komutları Discord'a kaydedin:**
   ```bash
   node deploy-commands.js
   ```

4. **Bot'u başlatın:**
   ```bash
   npm start
   ```

## 📁 Proje Yapısı

```
cetbot/
├── src/
│   ├── commands/
│   │   ├── general/         # Genel komutlar
│   │   │   ├── ping.js
│   │   │   ├── bilgi.js
│   │   │   └── kullanici.js
│   │   └── moderation/      # Moderasyon komutları
│   │       ├── kick.js
│   │       ├── ban.js
│   │       └── temizle.js
│   └── events/              # Bot event'leri
│       ├── ready.js
│       ├── interactionCreate.js
│       ├── guildCreate.js
│       └── guildDelete.js
├── index.js                 # Ana bot dosyası
├── deploy-commands.js       # Komut deployment scripti
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🛡️ Güvenlik Özellikleri

### Rol Güvenlik Sistemi
- **Yönetici Yetkisi Koruması**: Herhangi bir role yönetici yetkisi verildiğinde otomatik olarak kaldırır
- **Anında Bildirim**: Yetkisiz yönetici yetkisi verme girişimlerini belirtilen kullanıcıya DM ile bildirir
- **Audit Log Takibi**: Kim hangi rolü değiştirdiğini takip eder

### Ban Spam Koruması
- **Otomatik Tespit**: 5 dakika içinde 3'ten fazla ban atan kullanıcıları tespit eder
- **Kapsamlı Yetki Kaldırma**: Spam yapan kullanıcının tüm yönetici ve moderasyon yetkilerini otomatik kaldırır
- **Detaylı Bildirim**: Ban spam girişimlerini embed mesajla bildirir

### Kanal Silme Koruması
- **Anında Tepki**: Kanal sildiği anda yetkilerini kaldırır
- **Seçici Koruma**: Metin, kategori, duyuru ve forum kanallarını korur
- **Ses Kanalı Özel Koruması**: Belirli kullanıcılar için ses kanalı koruması
- **Hızlı Bildirim**: Kanal silme girişimlerini anında rapor eder

**Ses Kanalı Koruması:**
- Varsayılan korumalı kullanıcı: ID `447386704626581504`
- Yetkili kullanıcı tarafından yeni kullanıcılar eklenebilir
- Ses kanalı silen korumalı kullanıcıların yetkileri kaldırılır

Kaldırılan yetkiler (her iki korumada):
- Administrator
- Ban Members
- Kick Members
- Manage Roles
- Manage Server (Manage Guild)
- Manage Channels

### Rol Güvenlik Sistemi
- Administrator
- Manage Server
- Manage Roles
- Manage Channels
- Ban Members
- Kick Members

## 🎯 Mevcut Komutlar

### Genel Komutlar
- `/ping` - Bot'un ping değerini gösterir
- `/bilgi` - Bot hakkında bilgi verir
- `/kullanici [hedef]` - Kullanıcı bilgilerini gösterir

### Moderasyon Komutları
- `/kick <hedef> [sebep]` - Kullanıcıyı sunucudan atar
- `/ban <hedef> [sebep] [mesaj-sil]` - Kullanıcıyı yasaklar
- `/temizle <sayi> [kullanici]` - Mesajları siler

## ➕ Yeni Komut Ekleme

1. `src/commands/kategori/` klasöründe yeni bir `.js` dosyası oluşturun
2. Şu şablonu kullanın:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('komut-adi')
        .setDescription('Komut açıklaması'),
    async execute(interaction) {
        await interaction.reply('Merhaba!');
    },
};
```

3. Komutları yeniden deploy edin:
   ```bash
   node deploy-commands.js
   ```

## 🔧 Geliştirme

Development modunda çalıştırmak için:
```bash
npm run dev
```

## 📝 Notlar

- Komutlar otomatik olarak yüklenir
- Event'ler otomatik olarak dinlenir
- Hata yönetimi dahil edilmiştir
- Discord.js v14 ile uyumludur
- Slash komutları kullanır

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Yeni bir branch oluşturun
3. Değişikliklerinizi yapın
4. Pull request gönderin
