# Otomasyon API'leri (n8n / bot)

Bu klasör, site ve admin paneli yönetmek için kullanılan **Automation API** dokümantasyonudur.

Canlı base URL örnekleri:
- Yerel: `http://localhost:3000`
- Canlı: `https://duzceradikal.com`

Tüm endpoint'ler: `/api/automation/...`

Eski uyumluluk: `POST /api/n8n/publish` (aynı haber oluşturma mantığı)

---

## Kimlik doğrulama

Her istekte şu header'lardan **biri** zorunlu:

```http
Authorization: Bearer <N8N_API_KEY>
```

veya

```http
x-api-key: <N8N_API_KEY>
```

veya

```http
x-n8n-secret: <N8N_API_KEY>
```

veya

```http
x-automation-key: <N8N_API_KEY>
```

Sunucuda env sırası: `N8N_API_KEY` → yoksa `CRON_SECRET` → yoksa `AUTH_SECRET`.

Hostinger / `.env` örneği:

```env
N8N_API_KEY=uzun-guclu-bir-anahtar
```

---

## Endpoint özeti

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/api/automation/ozet` | Panel özeti (sayılar + son haberler) |
| GET | `/api/automation/haberler` | Haber listesi |
| POST | `/api/automation/haberler` | Haber oluştur |
| GET | `/api/automation/haberler/:id` | Haber detay |
| PATCH | `/api/automation/haberler/:id` | Haber güncelle |
| DELETE | `/api/automation/haberler/:id` | Haber sil |
| GET | `/api/automation/kategoriler` | Kategori listesi |
| GET | `/api/automation/medya` | Medya listesi |
| POST | `/api/automation/medya` | Görsel yükle (URL veya dosya) |
| GET | `/api/automation/yorumlar` | Yorum listesi (varsayılan: onaysız) |
| PATCH | `/api/automation/yorumlar/:id` | Onayla / reddet |
| DELETE | `/api/automation/yorumlar/:id` | Yorum sil |
| GET | `/api/automation/ayarlar` | Salt okunur site ayarları |

Detaylı örnekler: [n8n-ornekler.md](./n8n-ornekler.md)

---

## Ortak yanıt formatı

Başarı:

```json
{ "ok": true, "...": "..." }
```

Hata:

```json
{ "ok": false, "error": "mesaj" }
```

---

## Haber oluşturma gövdesi

`POST /api/automation/haberler`

```json
{
  "title": "Başlık",
  "content": "<p>HTML içerik</p>",
  "summary": "Kısa özet",
  "coverImageUrl": "https://...",
  "categorySlug": "gundem",
  "categoryName": "Gündem",
  "tags": ["Düzce", "haber"],
  "status": "PUBLISHED",
  "isBreaking": false,
  "isFeatured": false,
  "inSpotlight": false,
  "inFiveHeadline": false,
  "sourceName": "n8n",
  "sourceUrl": "https://kaynak.ornek",
  "seoTitle": "...",
  "seoDescription": "...",
  "authorId": null
}
```

Zorunlu: `title`, `content`.  
`status`: `DRAFT` | `REVIEW` | `PUBLISHED` | `ARCHIVED`  
Kategori: `categoryId` / `categorySlug` / `categoryName` (yoksa ilk kategori)

Yanıtta `article.url` ve `article.absoluteUrl` gelir.

---

## Medya yükleme

### A) Uzak URL

```http
POST /api/automation/medya
Content-Type: application/json

{ "url": "https://ornek.com/foto.jpg" }
```

### B) Dosya (multipart)

```http
POST /api/automation/medya
Content-Type: multipart/form-data

file=<binary>
```

Dönen `media.url` değerini haberin `coverImageUrl` alanına yazabilirsiniz.

---

## Yorum moderasyonu

```http
PATCH /api/automation/yorumlar/{id}
{ "action": "approve" }
```

`action`: `approve` | `unapprove` | `reject` (reject = sil)  
veya `{ "approved": true }`

---

## n8n hızlı kurulum

1. Hostinger env'e `N8N_API_KEY` ekle, deploy et.
2. n8n'de **HTTP Request** node:
   - Method: POST
   - URL: `https://duzceradikal.com/api/automation/haberler`
   - Authentication: Header Auth → Name `x-api-key`, Value = anahtar
   - Body: JSON (yukarıdaki alanlar)
3. Kategori slug'larını önce `GET /api/automation/kategoriler` ile al.

---

## Güvenlik notları

- Anahtarı asla istemci tarafına / public repo'ya koyma.
- Bu API admin paneli yetkisine eşdeğerdir (haber silme dahil).
- Rate limit / IP kısıtı istersen Hostinger veya n8n tarafında sınırla.
