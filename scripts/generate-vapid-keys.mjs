#!/usr/bin/env node
/**
 * VAPID anahtar çifti üretir — web push (son dakika bildirimi) için.
 * Kullanım: node scripts/generate-vapid-keys.mjs
 * Çıktıyı .env / Hostinger env'e yapıştırın.
 */
const webpush = require("web-push");

const keys = webpush.generateVAPIDKeys();
console.log(`
# Web Push (VAPID) — son dakika bildirimi
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}
VAPID_PUBLIC_KEY=${keys.publicKey}
VAPID_PRIVATE_KEY=${keys.privateKey}
VAPID_SUBJECT=mailto:info@duzceradikal.com
`);
