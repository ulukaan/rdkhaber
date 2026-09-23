# n8n örnekleri

Base: `https://duzceradikal.com`  
Header: `x-api-key: {{$env.N8N_API_KEY}}`

---

## 1) Kategorileri çek

- Method: `GET`
- URL: `/api/automation/kategoriler`

Sonraki node'da `categorySlug` seç.

---

## 2) Görsel indir + kaydet + haber yayınla

### Node A — Medya (URL)

- Method: `POST`
- URL: `/api/automation/medya`
- Body:

```json
{
  "url": "{{$json.imageUrl}}"
}
```

### Node B — Haber

- Method: `POST`
- URL: `/api/automation/haberler`
- Body:

```json
{
  "title": "{{$json.title}}",
  "summary": "{{$json.summary}}",
  "content": "{{$json.contentHtml}}",
  "coverImageUrl": "{{$node['Medya'].json.media.url}}",
  "categorySlug": "gundem",
  "tags": ["otomasyon"],
  "status": "PUBLISHED",
  "sourceName": "n8n",
  "sourceUrl": "{{$json.sourceUrl}}"
}
```

---

## 3) Taslak kaydet, sonra yayınla

Oluştur:

```json
{ "title": "...", "content": "...", "status": "DRAFT", "categorySlug": "ekonomi" }
```

Yayınla:

- Method: `PATCH`
- URL: `/api/automation/haberler/{{id}}`
- Body: `{ "status": "PUBLISHED" }`

---

## 4) Onaysız yorumları onayla

1. `GET /api/automation/yorumlar?approved=false&limit=20`
2. Loop → `PATCH /api/automation/yorumlar/{{id}}` body `{ "action": "approve" }`

---

## 5) Günlük özet (Telegram / Discord)

- `GET /api/automation/ozet`
- Mesajda kullan: `summary.articles.publishedLast24h`, `summary.pendingComments`

---

## 6) Eski endpoint (hala çalışır)

`POST /api/n8n/publish` — aynı create mantığı; yeni akışlarda `/api/automation/haberler` tercih et.
