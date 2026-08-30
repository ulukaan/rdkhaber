import { prisma } from "@/lib/prisma";

export type LegalPageDef = {
  slug: string;
  title: string;
  content: string;
};

export function legalPageDefs(siteName: string): LegalPageDef[] {
  const name = siteName.trim() || "Düzce Radikal";
  return [
    {
      slug: "kunye",
      title: "Künye",
      content: `${name}

Yerel ve ulusal gündemi tarafsız ve hızlı aktaran internet haberciliği platformu.

İmtiyaz sahibi / yayın yönetmeni
Yayın kimliği, sorumlu müdür ve ticari unvan bilgilerini yönetim panelindeki Künye sayfasından güncelleyin.

Sorumlu yazı işleri müdürü
Panelden bu alanı doldurun.

Yasal uyarı
Bu künye, 5187 sayılı Basın Kanunu ve ilgili mevzuat uyarınca yayımlanmaktadır. İçeriklerin izinsiz kopyalanması ve ticari kullanımı yasaktır.`,
    },
    {
      slug: "gizlilik",
      title: "Gizlilik Politikası",
      content: `${name} olarak kişisel verilerinizin güvenliğine önem veriyoruz. Bu politika, sitemizi ziyaret ettiğinizde veya iletişim formunu kullandığınızda hangi verilerin işlendiğini açıklar.

Toplanan veriler
• İletişim ve ihbar formlarında paylaştığınız ad, e-posta, telefon ve mesaj içeriği
• Hesap oluşturursanız ad, e-posta ve oturum bilgileri
• Yorum bırakırsanız adınız ve yorum metniniz
• Teknik olarak tarayıcı, IP ve çerez kayıtları (güvenlik ve istatistik)

Kullanım amacı
Veriler habercilik, okuyucu iletişimi, üyelik, yorum yönetimi ve yasal yükümlülükler için işlenir. Pazarlama amacıyla üçüncü kişilere satılmaz.

Çerezler
Oturum, tercih ve ölçüm çerezleri kullanılabilir. Tarayıcı ayarlarından çerezleri sınırlayabilirsiniz.

Haklarınız
KVKK kapsamındaki erişim, düzeltme, silme ve itiraz haklarınız için İletişim sayfasındaki kanalları kullanabilirsiniz.

Bu metin genel bilgilendirme niteliğindedir; güncel uygulamayı yönetim panelinden düzenleyebilirsiniz.`,
    },
    {
      slug: "kvkk",
      title: "KVKK Aydınlatma Metni",
      content: `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca ${siteName.trim() || "Düzce Radikal"} veri sorumlusu sıfatıyla aşağıdaki aydınlatmayı yapar.

Veri kategorileri
Kimlik, iletişim, işlem güvenliği ve mesaj/içerik verileri; form, üyelik, yorum, ihbar ve teknik loglar üzerinden elde edilebilir.

İşleme amaçları
Haber ve içerik sunumu, okuyucu taleplerinin yanıtlanması, üyelik ve yorum süreçleri, güvenlik, hukuki yükümlülüklerin yerine getirilmesi.

Hukuki sebepler
KVKK m.5 kapsamında açık rıza, sözleşmenin kurulması/ifası, hukuki yükümlülük ve meşru menfaat.

Aktarım
Barındırma, e-posta ve güvenlik hizmet sağlayıcılarına, yasal zorunluluk halinde yetkili kurumlara aktarılabilir.

Saklama
İşleme amacı ve yasal sürelerle sınırlı tutulur; süre bitiminde silinir, yok edilir veya anonimleştirilir.

Haklarınız
KVKK m.11 kapsamındaki haklarınızı İletişim sayfasından iletebilirsiniz. Başvurular makul sürede yanıtlanır.

Ayrıntılı ticari unvan ve tebligat adresi künye ve iletişim ayarlarından güncellenir.`,
    },
    {
      slug: "kullanim-kosullari",
      title: "Kullanım Şartları",
      content: `${siteName.trim() || "Düzce Radikal"} sitesini kullanarak aşağıdaki şartları kabul etmiş olursunuz.

İçerik
Haber, fotoğraf, video ve diğer materyallerin telif hakkı saklıdır. Kaynak gösterilerek dahi izinsiz kopyalama, toplu tarama veya ticari kullanım yasaktır.

Kullanıcı katkıları
İhbar, haber gönderimi ve yorumlar hukuka, kişilik haklarına ve kamu düzenine aykırı olamaz. Uygun görülmeyen içerikler yayından kaldırılabilir.

Hesap
Üyelik bilgilerinizin doğruluğundan ve hesabınızın güvenliğinden siz sorumlusunuz.

Sorumluluk
Sitedeki bilgiler habercilik amacıyla sunulur; güncellik ve kesintisiz erişim taahhüt edilmez. Üçüncü taraf bağlantı ve yayınlardan ${siteName.trim() || "yayıncı"} sorumlu tutulamaz.

Değişiklik
Bu şartlar duyuru yapılmaksızın güncellenebilir. Güncel metin bu sayfada yayımlanır.

Uyuşmazlıklarda Türkiye Cumhuriyeti hukuku ve Düzce mahkemeleri / icra daireleri yetkilidir.`,
    },
  ];
}

export async function ensureLegalPages(siteName: string) {
  const defs = legalPageDefs(siteName);
  const existing = await prisma.page.findMany({
    where: { slug: { in: defs.map((d) => d.slug) } },
    select: { slug: true, content: true },
  });
  const bySlug = new Map(existing.map((p) => [p.slug, p]));
  const missing = defs.filter((d) => !bySlug.has(d.slug));

  if (missing.length > 0) {
    await prisma.page.createMany({
      data: missing.map((d) => ({
        title: d.title,
        slug: d.slug,
        content: d.content,
        published: true,
      })),
    });
  }

  // Eski placeholder künyeyi yenile (panelde özel metin yazılmadıysa)
  const kunye = bySlug.get("kunye");
  const freshKunye = defs.find((d) => d.slug === "kunye");
  if (
    kunye &&
    freshKunye &&
    (kunye.content.includes("Panelden bu metni güncelleyerek") ||
      kunye.content.includes("İletişim formu, e-posta ve telefon"))
  ) {
    await prisma.page.update({
      where: { slug: "kunye" },
      data: { content: freshKunye.content, title: freshKunye.title, published: true },
    });
  }
}
