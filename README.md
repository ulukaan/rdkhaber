# Düzce Radikal (rdkhaber)

Türkiye odaklı haber portalı — Next.js 16, Prisma, MySQL. Canlı site: [duzceradikal.com](https://duzceradikal.com)

## Özellikler

- **Haber yönetimi:** makale, kategori, etiket, manşet, son dakika, video, foto galeri
- **Editör + admin paneli:** rol bazlı (`/admin`, `/editor`), mobil uyumlu arayüz
- **Okuyucu:** haber gönderimi, ihbar hattı, yorumlar, bülten aboneliği
- **Haber botu:** kaynak sitelerden kelime eşlemeli içerik çekme
- **E-posta:** SMTP bülten, şifre sıfırlama, panel gelen/giden kutusu (IMAP)
- **Reklam:** slot yönetimi, yapışkan alt banner, kule reklamları
- **SEO:** sitemap, robots, Open Graph, Google Site Kit alanları
- **WordPress import:** `scripts/import-duzceradikal.ts`

## Teknoloji

| Katman | Stack |
|--------|--------|
| Framework | Next.js 16 (App Router), React 19 |
| Veritabanı | MySQL + Prisma |
| Auth | Auth.js (NextAuth v5) |
| UI | Tailwind CSS 4, TipTap editör |
| E-posta | Nodemailer, IMAP (imapflow + mailparser) |

## Gereksinimler

- Node.js **20+**
- MySQL 8 (veya Hostinger MySQL)

## Kurulum (geliştirme)

```bash
git clone https://github.com/ulukaan/rdkhaber.git
cd rdkhaber
npm install
```

`.env` dosyası oluşturun (örnek: `.env.hostinger.example`):

```env
DATABASE_URL="mysql://USER:PASS@localhost:3306/rdkhaber"
AUTH_SECRET="uzun-rastgele-metin"
AUTH_TRUST_HOST=true
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Veritabanı:

```bash
npx prisma migrate deploy
npm run db:seed          # isteğe bağlı örnek veri
```

Geliştirme sunucusu:

```bash
npm run dev
```

Panel: `/admin` · Site: `/`

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run start` | Production sunucu |
| `npm run import:live` | duzceradikal.com WP API import |
| `npm run seed:bot-words` | Haber botu kelime listesi |
| `node scripts/generate-favicon.mjs` | Logodan favicon üret |

## Proje yapısı

```
src/
  app/
    (site)/          # Kamuya açık site
    (auth)/          # Giriş / kayıt
    admin/           # Yönetim paneli
    editor/          # Editör paneli
    api/             # API route'ları
  actions/           # Server Actions
  components/        # UI bileşenleri
  lib/               # Yardımcılar, ayarlar, e-posta
prisma/              # Şema ve migration'lar
public/brand/        # Logo ve favicon (deploy-safe)
scripts/             # Import, deploy yardımcıları
```

## Production deploy (Hostinger)

### A) GitHub Actions ile otomatik deploy (önerilen)

`main` branch'e merge sonrası veya Actions sekmesinden **Deploy Hostinger** workflow'unu manuel çalıştırın.

**GitHub → Settings → Secrets and variables → Actions** altında tanımlayın:

| Secret | Açıklama |
|--------|----------|
| `HOSTINGER_SSH_HOST` | SSH host (ör. `srv123.hostinger.com`) |
| `HOSTINGER_SSH_USER` | SSH kullanıcı adı |
| `HOSTINGER_SSH_KEY` | SSH private key (PEM) |
| `HOSTINGER_SSH_PORT` | Opsiyonel, varsayılan `22` |
| `HOSTINGER_DEPLOY_PATH` | Sunucudaki proje klasörü (git clone yolu) |
| `DATABASE_URL_BUILD` | Build için MySQL — `srv2024.hstgr.io` host |
| `AUTH_SECRET` | Oturum secret |
| `NEXT_PUBLIC_SITE_URL` | `https://duzceradikal.com` |
| `AUTH_URL` / `NEXTAUTH_URL` | Canlı site URL |
| `HOSTINGER_RESTART_CMD` | Opsiyonel restart komutu |

Sunucuda bir kez:

```bash
git clone https://github.com/ulukaan/rdkhaber.git
cd rdkhaber
# .env.production.local → runtime DATABASE_URL localhost/127.0.0.1
```

Workflow sunucuda `git pull → npm ci → npm run build → tablo ensure` çalıştırır.

### B) Manuel zip deploy

1. Kaynak kodu `.deploy` staging'e kopyala ( `node_modules`, `.next`, `public/uploads` hariç )
2. `.env` → build için `srv2024.hstgr.io` MySQL host
3. `.env.production.local` → runtime için `localhost` MySQL host
4. `deploy-rdkhaber.zip` oluştur ve Hostinger Node.js deploy
5. Önbellek temizle + Node uygulamasını yeniden başlat

**Önemli:** `.env`, `hostinger-env.txt` ve veritabanı şifreleri repoya eklenmez.

**CI notu:** `npm ci` / postinstall, `DATABASE_URL` yoksa tablo script'lerini atlar; GitHub CI ve Hostinger build worker uyumludur.

## Marka varlıkları

- Logo: `public/brand/logo.png`
- Favicon: `public/brand/favicon.png` ( `node scripts/generate-favicon.mjs` ile yenilenir )
- Panel ayarlarından logo/favicon URL'si değiştirilebilir; `/uploads/` yolları deploy sonrası `/brand/` yedeğine düşer.

## Lisans

MIT — bkz. [LICENSE](LICENSE)
