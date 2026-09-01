# Düzce Radikal — Sistem ve Kullanım Kılavuzu

Bu belge, **duzceradikal.com** haber portalının site sahipleri, yöneticiler ve editörler için hazırlanmış kullanım rehberidir.

---

## İçindekiler

1. [Sistem nedir?](#1-sistem-nedir)
2. [Roller ve erişim](#2-roller-ve-erişim)
3. [Kamu sitesi (okuyucu tarafı)](#3-kamu-sitesi-okuyucu-tarafı)
4. [Yönetim paneli (Admin)](#4-yönetim-paneli-admin)
5. [Editör paneli](#5-editör-paneli)
6. [Üye hesabı](#6-üye-hesabı)
7. [Haber yazma ve yayınlama](#7-haber-yazma-ve-yayınlama)
8. [Ana sayfa ve görünüm ayarları](#8-ana-sayfa-ve-görünüm-ayarları)
9. [Okuyucu katkıları ve moderasyon](#9-okuyucu-katkıları-ve-moderasyon)
10. [Bülten ve e-posta](#10-bülten-ve-e-posta)
11. [Reklam yönetimi](#11-reklam-yönetimi)
12. [Anketler](#12-anketler)
13. [Güvenlik](#13-güvenlik)
14. [Otomatik görevler (Cron)](#14-otomatik-görevler-cron)
15. [Sık sorulan sorular](#15-sık-sorulan-sorular)

---

## 1. Sistem nedir?

Düzce Radikal, modern bir **haber yönetim sistemi (CMS)** üzerine kuruludur. Tek panelden:

- Haber üretimi ve yayınlama
- Kategori, galeri, video içerikleri
- Okuyucu yorumları, ihbarlar, haber gönderimleri
- Bülten, reklam, anket
- Site görünümü ve menü yönetimi

işlemlerini yapabilirsiniz.

**Canlı adres:** https://duzceradikal.com  
**Yönetim paneli:** https://duzceradikal.com/admin  
**Editör paneli:** https://duzceradikal.com/editor

---

## 2. Roller ve erişim

| Rol | Kim? | Nereye girer? |
|-----|------|---------------|
| **Üye (USER)** | Kayıtlı okuyucu | `/hesabim` |
| **Editör (EDITOR)** | Haber yazan personel | `/editor` + `/hesabim` |
| **Yönetici (ADMIN)** | Tam yetkili | `/admin` + `/editor` + `/hesabim` |

### İlk giriş (yönetici / editör)

1. `/giris` adresinden e-posta ve şifre ile giriş yapın.
2. Canlı ortamda **2FA (iki adımlı doğrulama) zorunludur.**
3. İlk girişte `/hesabim/guvenlik` sayfasına yönlendirilirsiniz.
4. Google Authenticator (veya benzeri) ile QR kodu okutun, 6 haneli kodu girin.
5. 2FA kurulumu tamamlandıktan sonra panele erişebilirsiniz.

> **Not:** Canlı ortamda personel hesaplarında 2FA kapatılamaz.

---

## 3. Kamu sitesi (okuyucu tarafı)

### Ana bölümler

| Sayfa | Adres | Açıklama |
|-------|-------|----------|
| Ana sayfa | `/` | Manşet, gündem, kategori blokları, servis şeritleri |
| Kategori | `/{slug}` | Örn. `/gundem`, `/spor` |
| Haber | `/haber/{slug}` | Tekil haber sayfası |
| Arama | `/arama?q=...` | Site içi arama |
| Video haberler | `/video-haberler` | Video içerikli haberler |
| Foto galeri | `/foto-galeri` | Galeri listesi ve detay |
| Yazarlar | `/yazarlar` | Editör/yazar profilleri |
| Enler | `/enler` | Çok okunan, trend, yorumlanan, kaydedilen |
| Yayın akışı | `/yayin-akisi` | TV program rehberi |
| Burçlar | `/burclar` | Günlük burç yorumları |

### Okuyucu formları

| Form | Adres |
|------|-------|
| Haber gönder | `/haber-gonder` |
| İhbar hattı | `/ihbar-hatti` |
| İletişim | `/iletisim` |
| İçerik şikayeti | `/sikayet` |
| Üye kayıt | `/kayit` |
| Giriş | `/giris` |

### Yasal sayfalar

Künye, gizlilik, KVKK ve kullanım şartları `/sayfa/{slug}` altında yayınlanır (ör. `/sayfa/kunye`).

---

## 4. Yönetim paneli (Admin)

**Adres:** `/admin` — yalnızca ADMIN rolü.

### 4.1 Genel Bakış (`/admin`)

- Yayınlanan haber, taslak, görüntülenme sayıları
- Bekleyen yorum, ihbar, okuyucu haberi özeti
- Hızlı bağlantılar (onay kuyruğu, istatistik, bot)

### 4.2 Haberler

| Menü | Adres | Ne yapılır? |
|------|-------|-------------|
| Haberler | `/admin/makaleler` | Tüm haberler — arama, filtre, düzenleme |
| Yeni haber | `/admin/makaleler/yeni` | Sıfırdan haber oluştur |
| Haber Botu | `/admin/haber-botu` | Kaynak sitelerden otomatik haber çekme |
| Arşiv | `/admin/arsiv` | Arşivlenmiş haberler |
| Ana Manşetler | `/admin/manset` | Ana sayfa büyük manşet kartları |
| Üst Manşetler | `/admin/son-dakika` | Son dakika / üst bant haberleri |
| Videolar | `/admin/videolar` | Video haber listesi |

### 4.3 Okuyucu

| Menü | Adres | Ne yapılır? |
|------|-------|-------------|
| Haber Gönderimleri | `/admin/haber-basvurulari` | Okuyucuların gönderdiği haberler |
| İhbar Hattı | `/admin/ihbarlar` | İhbar ve iletişim mesajları |
| Yorumlar | `/admin/yorumlar` | Yorum onaylama / silme |
| Anketler | `/admin/anketler` | Okuyucu anketleri oluşturma |

### 4.4 İçerik

| Menü | Adres | Ne yapılır? |
|------|-------|-------------|
| Kategoriler | `/admin/kategoriler` | Kategori ağacı, sıra, renk, şablon |
| Etiketler | `/admin/etiketler` | Haber etiketleri |
| Sayfalar | `/admin/sayfalar` | Statik sayfalar (KVKK, künye vb.) |
| Galeriler | `/admin/galeriler` | Bağımsız foto galeri paketleri |
| Medya | `/admin/medya` | Görsel kütüphanesi |
| Künye | `/admin/kunye` | Künye metni düzenleme |

### 4.5 Görünüm

| Menü | Adres | Ne yapılır? |
|------|-------|-------------|
| Görünüm | `/admin/gorunum` | Görünüm merkezi |
| Menü | `/admin/gorunum/menu` | Üst menü ve footer linkleri |
| Öğeler | `/admin/gorunum/ogeler` | Ana sayfa modüllerini aç/kapa |
| Tema | `/admin/gorunum/tema` | Logo, site adı, marka rengi |
| Google | `/admin/gorunum/google` | Analytics, GTM, AdSense |
| Özel Kod | `/admin/gorunum/ozel-kod` | Head/body özel HTML |

### 4.6 Yayın

| Menü | Adres | Ne yapılır? |
|------|-------|-------------|
| Yayın Akışı | `/admin/yayin-akisi` | TV rehberi ayarları |
| Bülten | `/admin/bulten` | E-posta kampanyaları |
| E-posta | `/admin/eposta` | Gelen/giden kutusu |
| Reklamlar | `/admin/reklamlar` | Reklam slot yönetimi |

### 4.7 Sistem

| Menü | Adres | Ne yapılır? |
|------|-------|-------------|
| Onay Kuyruğu | `/admin/onay-kuyrugu` | Editör haberlerinin onayı |
| İstatistikler | `/admin/istatistikler` | Trafik ve içerik özeti |
| Şikayetler | `/admin/sikayetlar` | İçerik şikayetleri |
| BİK | `/admin/bik` | Basın İlan Kurumu bilgileri |
| Denetim Kaydı | `/admin/audit-log` | Son işlem geçmişi |
| Güvenlik | `/hesabim/guvenlik` | 2FA kurulumu |
| Kullanıcılar | `/admin/kullanicilar` | Üye ve personel yönetimi |
| Ayarlar | `/admin/ayarlar` | Site kimliği, iletişim, SEO |

---

## 5. Editör paneli

**Adres:** `/editor` — ADMIN ve EDITOR rolleri.

Editör menüsü admin'in bir alt kümesidir:

- Haber yazma, düzenleme, arşivleme
- Son dakika ve video haberler
- Okuyucu gönderimleri, ihbarlar, yorum moderasyonu

**Editörde olmayanlar** (yalnızca admin):

- Kategoriler, etiketler, sayfalar, galeriler, medya
- Görünüm, bülten, reklam, anket
- Haber botu, kullanıcılar, site ayarları

### Editör onay kuralı

`/admin/ayarlar` içinde **“Editör yayını admin onayı gerektirsin”** açıksa, editör “Yayında” seçse bile haber **İncelemede** kalır. Admin `/admin/onay-kuyrugu` üzerinden onaylar.

---

## 6. Üye hesabı

**Adres:** `/hesabim` — giriş zorunlu.

| Bölüm | Adres | Açıklama |
|-------|-------|----------|
| Özet | `/hesabim` | İstatistikler, son aktiviteler |
| Kaydettiklerim | `/hesabim/kaydettiklerim` | Yer imi haberler |
| Okuduklarım | `/hesabim/okuduklarim` | Okuma geçmişi |
| Takip | `/hesabim/takip` | Takip edilen yazarlar |
| Haberlerim | `/hesabim/haberlerim` | Gönderilen okuyucu haberleri |
| Yorumlarım | `/hesabim/yorumlarim` | Kendi yorumları |
| Profil | `/hesabim/profil` | Ad, biyografi, avatar |
| Bildirimler | `/hesabim/bildirimler` | Sistem bildirimleri |
| Verilerim | `/hesabim/verilerim` | KVKK veri indirme / hesap silme |
| Haber gönder | `/hesabim/haber-gonder` | Panel içinden haber gönderimi |
| İhbar | `/hesabim/ihbar` | Panel içinden ihbar |
| Bülten | `/hesabim/bulten` | E-posta aboneliği |
| Güvenlik | `/hesabim/guvenlik` | 2FA (personel için) |

### Misafir kaydetme

Giriş yapmadan haber sayfasında **Kaydet** butonuna basıldığında haber cihaza kaydedilir. Giriş yapınca kayıtlar hesaba otomatik birleştirilir.

### “Senin için” önerileri

Giriş yapmış üyelere ana sayfada okuma geçmişi ve takip edilen yazarlara göre kişiselleştirilmiş haber bloğu gösterilir (`/admin/gorunum/ogeler` → “Senin için” modülü).

---

## 7. Haber yazma ve yayınlama

### Adım adım yeni haber

1. `/admin/makaleler/yeni` veya `/editor/makaleler/yeni` açın.
2. **Başlık** ve **spot** (özet) girin — slug otomatik oluşur.
3. **İçerik** alanına zengin metin editörü ile yazın (kalın, link, görsel, tablo vb.).
4. **Kapak görseli** yükleyin.
5. **Kategori** ve isteğe bağlı **etiket** seçin.
6. **Durum** seçin:
   - **Taslak** — henüz yayınlanmaz
   - **İncelemede** — onay bekler
   - **Yayında** — hemen veya zamanlanmış yayın
   - **Arşivlendi** — siteden kalkar
7. İsteğe bağlı: **Zamanlanmış yayın** tarihi belirleyin.
8. **Kaydet**.

### Manşet ve son dakika

| Bayrak | Nerede ayarlanır? | Etkisi |
|--------|-------------------|--------|
| Ana manşet | `/admin/manset` | Ana sayfa büyük kart |
| Üst manşet / son dakika | `/admin/son-dakika` | Üst bant, push bildirimi |
| Öne çıkan | Haber formu | Vitrin listelerinde öncelik |

### Canlı anlatım

Haber formunda **Canlı anlatım** açıldığında, yayın sırasında zaman çizelgesine güncelleme ekleyebilirsiniz (maç, seçim, afet vb.).

### Düzeltme notu

Yayında bir hata düzeltildiğinde **düzeltme notu** eklenir; okuyucu haberin güncellendiğini görür.

### Revizyon geçmişi

Her kayıtta önceki sürümler `/admin/makaleler/{id}/revizyonlar` altında saklanır.

---

## 8. Ana sayfa ve görünüm ayarları

### Menü düzenleme (`/admin/gorunum/menu`)

- Üst navigasyon linkleri
- Footer kategori sütunları
- Servis ve kurumsal linkler

### Ana sayfa modülleri (`/admin/gorunum/ogeler`)

Her modül ayrı ayrı açılıp kapatılabilir:

- Kur şeridi, son dakika bandı, manşetler
- Kategori kartları, gündem bandı
- Video, röportaj, foto galeri
- Yan sütun: çok okunan, trend, anket, “Senin için”
- Servisler: parite, imsakiye, burç, canlı skor, TV rehberi

### Tema (`/admin/gorunum/tema`)

- Site adı, slogan
- Logo ve favicon URL
- Marka rengi

### Google (`/admin/gorunum/google`)

- Google Analytics (GA4) ölçüm kimliği
- Google Tag Manager
- Search Console doğrulama meta etiketi
- AdSense yayıncı kimliği

---

## 9. Okuyucu katkıları ve moderasyon

### Haber gönderimi

Okuyucu `/haber-gonder` veya `/hesabim/haber-gonder` üzerinden haber gönderir.  
Panel: `/admin/haber-basvurulari` — onayla veya reddet.

### İhbar hattı

`/ihbar-hatti` formu ve WhatsApp/telefon kanalları.  
Panel: `/admin/ihbarlar` — tüm ihbar ve iletişim mesajları burada toplanır.

### Yorumlar

- Yorumlar varsayılan olarak **onaysız** kaydedilir.
- Onaylanınca haber sayfasında görünür.
- Onaylanan yoruma üye bildirimi gider.
- Panel: `/admin/yorumlar` veya `/editor/yorumlar`

### İçerik şikayeti

`/sikayet` formu — KVKK, telif, düzeltme talepleri.  
Panel: `/admin/sikayetlar`

### Bildirimler (üye)

Takip edilen yazar yeni haber yayınladığında veya yorum onaylandığında üye bildirim alır.  
Header'daki zil ikonu ve `/hesabim/bildirimler`.

---

## 10. Bülten ve e-posta

### SMTP ayarları

`/admin/bulten/ayarlar` — Hostinger için tipik değerler:

- Host: `smtp.hostinger.com`
- Port: `587`
- Kullanıcı: tam e-posta adresi
- Şifre: e-posta hesabı şifresi

### Kampanya gönderme

1. `/admin/bulten/yeni` — konu ve HTML içerik
2. Taslak olarak kaydet veya gönder
3. `/admin/bulten/aboneler` — abone listesi

### Panel e-posta kutusu

`/admin/eposta` — IMAP ile gelen kutusu senkronizasyonu, panelden yanıt yazma.

---

## 11. Reklam yönetimi

`/admin/reklamlar` — reklam slotları:

- Header banner, yan kule, yapışkan alt banner vb.
- Her slot için görsel, hedef URL, aktif/pasif
- Pozisyon kodları site şablonunda sabittir

AdSense ayrıca `/admin/gorunum/google` üzerinden yapılandırılır; çerez onayı sonrası yüklenir.

---

## 12. Anketler

1. `/admin/anketler/yeni` — soru, seçenekler, isteğe bağlı kapak ve seçenek görselleri
2. Bitiş tarihi ve sonuç gösterimi ayarla
3. Ana sayfa yan sütununda veya belirli habere bağlı göster
4. `/admin/gorunum/ogeler` → Anket modülünü aç

Okuyucu başına tek oy (çerez ile sınırlı).

---

## 13. Güvenlik

| Özellik | Açıklama |
|---------|----------|
| 2FA | Admin/editör için zorunlu (canlı) |
| Turnstile captcha | Giriş, kayıt, iletişim, şikayet formları |
| Rol kontrolü | Admin / editör / üye ayrımı |
| Rate limit | Brute-force ve spam koruması |
| Denetim kaydı | Kritik işlemler loglanır |
| KVKK | Veri indirme ve hesap silme |

### Güvenlik kontrol listesi (canlı ortam)

- [ ] `TURNSTILE_SECRET_KEY` ve `NEXT_PUBLIC_TURNSTILE_SITE_KEY` tanımlı
- [ ] Tüm admin/editör hesaplarında 2FA aktif
- [ ] `CRON_SECRET` güçlü ve gizli
- [ ] `AUTH_SECRET` en az 32 karakter
- [ ] SMTP şifreleri panelde şifreli saklanıyor

---

## 14. Otomatik görevler (Cron)

Hostinger veya harici cron servisi ile çağrılır:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://duzceradikal.com/api/cron/publish-scheduled
```

| Uç nokta | Görev |
|----------|--------|
| `/api/cron/publish-scheduled` | Zamanı gelen haberleri yayınlar |
| `/api/cron/haber-bot` | Haber botu kaynaklarını çeker |
| `/api/cron/backup-db` | Veritabanı yedeği alır |
| `/api/cron/cleanup-uploads` | Eski okuyucu yüklemelerini temizler |

**Önerilen sıklık:**

- Zamanlanmış yayın: her 5 dakika
- Haber botu: saatte bir (veya ihtiyaca göre)
- Yedek: günde bir (gece)

---

## 15. Sık sorulan sorular

### Haber yayınlandı ama ana sayfada görünmüyor?

- Durum “Yayında” mı kontrol edin.
- Manşet/son dakika bayrağı gerekiyorsa ilgili panelden ekleyin.
- `/admin/gorunum/ogeler` modülünün açık olduğundan emin olun.

### Editör haberi yayınlayamıyor?

- Ayarlarda “editör onayı gerekli” açık olabilir → admin onay kuyruğuna bakın.

### E-posta gitmiyor?

- `/admin/bulten/ayarlar` SMTP bilgilerini kontrol edin.
- Hostinger'da e-posta hesabının aktif olduğundan emin olun.

### Logo deploy sonrası kayboldu?

- Yüklemeler deploy ile silinebilir. Logo için `public/brand/` yedek yolu kullanılır veya `UPLOAD_DIR` deploy dışında tutulmalıdır.

### Canlı skor görünmüyor?

- `LIVESCORE_API_AUTH` ortam değişkeni tanımlı olmalıdır.

### Giriş yapamıyorum (personel)?

- 2FA kurulumu tamamlandı mı? → `/hesabim/guvenlik`
- Turnstile anahtarları canlıda tanımlı mı?

---

## Hızlı adres kartı

```
Site          → https://duzceradikal.com
Admin         → /admin
Editör        → /editor
Üye hesabı    → /hesabim
Güvenlik 2FA  → /hesabim/guvenlik
Ayarlar       → /admin/ayarlar
Ana sayfa mod → /admin/gorunum/ogeler
Onay kuyruğu  → /admin/onay-kuyrugu
```

---

*Son güncelleme: Eylül 2026 — rdkhaber v0.1*
