import { PrismaClient, Role, ArticleStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_WEAK_SEED !== "1") {
    throw new Error(
      "Üretimde zayıf seed şifreleri yasak. Gerekirse ALLOW_WEAK_SEED=1 ile bilinçli çalıştırın.",
    );
  }

  console.log("🌱 Veritabanı temizleniyor ve seed işlemi başlatılıyor...");

  // Mevcut verileri temizle
  await prisma.article.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.newsSubmission.deleteMany();
  await prisma.tip.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Kullanıcılar oluşturuluyor...");

  const adminPass = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const editorPass = process.env.SEED_EDITOR_PASSWORD || "editor123";
  if (
    process.env.NODE_ENV !== "production" &&
    (adminPass === "admin123" || editorPass === "editor123")
  ) {
    console.warn("⚠️  Seed varsayılan şifreleri kullanıyor — yalnızca yerel geliştirme için.");
  }

  const adminPassword = await bcrypt.hash(adminPass, 12);
  const editorPassword = await bcrypt.hash(editorPass, 12);

  const adminUser = await prisma.user.create({
    data: {
      name: "Ahmet Yılmaz",
      email: "admin@rdkhaber.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      bio: "RD Haber Genel Yayın Yönetmeni ve Kıdemli Gazeteci.",
      avatarUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop",
    },
  });

  const editorUser = await prisma.user.create({
    data: {
      name: "Zeynep Kaya",
      email: "zeynep@rdkhaber.com",
      passwordHash: editorPassword,
      role: Role.EDITOR,
      bio: "Ekonomi ve teknoloji dünyasını yakından takip eden araştırmacı gazeteci.",
      avatarUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
    },
  });

  console.log("📂 Kategoriler oluşturuluyor...");

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Gündem",
        slug: "gundem",
        description: "Türkiye ve dünyadaki en son gelişmeler, önemli haberler ve güncel olaylar.",
        color: "#dc2626",
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Ekonomi",
        slug: "ekonomi",
        description: "Piyasalar, borsa, döviz, enflasyon ve finans haberleri.",
        color: "#2563eb",
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Siyaset",
        slug: "siyaset",
        description: "İç ve dış politika haberleri, meclis kararları ve siyasi gelişmeler.",
        color: "#4f46e5",
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Dünya",
        slug: "dunya",
        description: "Uluslararası haberler, küresel diplomasi ve dünya genelinden gelişmeler.",
        color: "#059669",
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: "Teknoloji",
        slug: "teknoloji",
        description: "Yapay zeka, dijital dönüşüm, girişimcilik ve yeni nesil teknolojiler.",
        color: "#7c3aed",
        order: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: "Spor",
        slug: "spor",
        description: "Futbol, basketbol, olimpiyatlar ve tüm spor dallarından son dakika haberleri.",
        color: "#ea580c",
        order: 6,
      },
    }),
    prisma.category.create({
      data: {
        name: "Kültür - Sanat",
        slug: "kultur-sanat",
        description: "Sinema, tiyatro, edebiyat, konserler ve sanat etkinlikleri.",
        color: "#db2777",
        order: 7,
      },
    }),
    prisma.category.create({
      data: {
        name: "Sağlık",
        slug: "saglik",
        description: "Tıp dünyasındaki yenilikler, sağlıklı yaşam ve beslenme tavsiyeleri.",
        color: "#0d9488",
        order: 8,
      },
    }),
    prisma.category.create({
      data: {
        name: "Röportaj",
        slug: "roportaj",
        description: "Özel söyleşiler ve konuk röportajları.",
        color: "#d0021b",
        order: 9,
      },
    }),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  console.log("🏷️ Etiketler oluşturuluyor...");

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "Son Dakika", slug: "son-dakika" } }),
    prisma.tag.create({ data: { name: "Türkiye", slug: "turkiye" } }),
    prisma.tag.create({ data: { name: "Merkez Bankası", slug: "merkez-bankasi" } }),
    prisma.tag.create({ data: { name: "Enflasyon", slug: "enflasyon" } }),
    prisma.tag.create({ data: { name: "Yapay Zeka", slug: "yapay-zeka" } }),
    prisma.tag.create({ data: { name: "Süper Lig", slug: "super-lig" } }),
    prisma.tag.create({ data: { name: "Şampiyonlar Ligi", slug: "sampiyonlar-ligi" } }),
    prisma.tag.create({ data: { name: "Enerji", slug: "enerji" } }),
    prisma.tag.create({ data: { name: "Uzay", slug: "uzay" } }),
    prisma.tag.create({ data: { name: "Yazılım", slug: "yazilim" } }),
    prisma.tag.create({ data: { name: "Futbol", slug: "futbol" } }),
    prisma.tag.create({ data: { name: "Borsa", slug: "borsa" } }),
  ]);

  const tagMap = Object.fromEntries(tags.map((t) => [t.slug, t.id]));

  console.log("📰 Haberler oluşturuluyor...");

  const articlesData = [
    {
      title: "Merkez Bankası Politika Faiz Kararını Açıkladı",
      slug: "merkez-bankasi-politika-faiz-kararini-acikladi",
      summary:
        "Türkiye Cumhuriyet Merkez Bankası Para Politikası Kurulu, yılın yeni faiz kararını kamuoyuyla paylaştı. Karar sonrası piyasalarda hareketlilik yaşandı.",
      content: `
<p>Türkiye Cumhuriyet Merkez Bankası (TCMB) Para Politikası Kurulu (PPK), merakla beklenen faiz kararını açıkladı. Kurul, piyasa beklentilerine paralel şekilde politika faizini sabit tutma kararı aldı.</p>
<p>Karar metninde, sıkı parasal duruşun enflasyonda kalıcı düşüş sağlanana kadar sürdürüleceği vurgulandı. Aylık enflasyonun ana eğilimindeki düşüşün devam etmesi gerektiği belirtildi.</p>
<h3>Piyasaların İlk Tepkisi</h3>
<p>Faiz kararının ardından Dolar/TL paritesi yatay seyrini korurken, Borsa İstanbul BIST 100 endeksi günü pozitif bir seyirle tamamladı. Ekonomistler kararın sürpriz olmadığını ifade etti.</p>
<p>Önümüzdeki dönemde küresel ekonomik gelişmeler ve enflasyon verilerinin TCMB'nin sonraki adımlarında belirleyici olacağı kaydedildi.</p>
      `,
      coverImageUrl:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: true,
      isFeatured: true,
      viewCount: 4230,
      publishedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 dk önce
      authorId: editorUser.id,
      categoryId: catMap["ekonomi"],
      tagSlugs: ["son-dakika", "merkez-bankasi", "enflasyon"],
    },
    {
      title: "Yerli Otonom Araç Projesinde Yeni Milat: Seri Üretime Geçiliyor",
      slug: "yerli-otonom-arac-projesinde-yeni-milat-seri-uretime-geciliyor",
      summary:
        "Türkiye'nin geliştirdiği yerli ve milli elektrikli otonom ulaşım aracı, tüm güvenlik testlerini başarıyla tamamlayarak seri üretim aşamasına geçti.",
      content: `
<p>Sanayi ve Teknoloji Bakanlığı desteğiyle hayata geçirilen tam otonom elektrikli otobüs projesi, uluslararası geçerliliğe sahip Seviye 4 otonom sürüş sertifikasını aldı.</p>
<p>Proje kapsamında üretilen sürücüsüz araçlar, ilk etapta havaalanları ve üniversite kampüslerinde hizmet vermeye başlayacak. Yerlilik oranı %85 olan araçların ihraç edilmesi de hedefleniyor.</p>
<blockquote>"Teknoloji hamlemizde tarihi bir adımı daha geride bıraktık. Türk mühendislerinin geliştirdiği bu otonom araç küresel pazarda da ses getirecek."</blockquote>
<p>Test sürüşlerini başarıyla tamamlayan araçlar önümüzdeki aydan itibaren belirli rotalarda yolcu taşımaya başlayacak.</p>
      `,
      coverImageUrl:
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 3120,
      publishedAt: new Date(Date.now() - 1000 * 60 * 120), // 2 saat önce
      authorId: adminUser.id,
      categoryId: catMap["teknoloji"],
      tagSlugs: ["turkiye", "yazilim", "yapay-zeka"],
    },
    {
      title: "Şampiyonlar Ligi'nde Temsilcimiz Dev Maçına Çıkıyor",
      slug: "sampiyonlar-liginde-temsilcimiz-dev-macina-cikiyor",
      summary:
        "Avrupa arenasında mücadele eden temsilcimiz, bu akşam kader maçına çıkıyor. Teknik direktör ve kaptan maç öncesi iddialı açıklamalarda bulundu.",
      content: `
<p>UEFA Şampiyonlar Ligi grup aşaması 5. maçında temsilcimiz, bu akşam saat 22.00'de evinde zorlu rakibini konuk ediyor. Mücadele kapalı gişe oynanacak.</p>
<p>Düzenlenen basın toplantısında konuşan teknik direktör, "Hazırlıklarımızı eksiksiz tamamladık. Taraftarımızın da desteğiyle sahaya galibiyet için çıkacağız," ifadelerini kullandı.</p>
<p>Muhtemel 11'ler ve maç öncesi son sakatlık durumları da açıklandı. Karşılaşma ulusal kanalda canlı yayınlanacak.</p>
      `,
      coverImageUrl:
        "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      status: ArticleStatus.PUBLISHED,
      isBreaking: true,
      isFeatured: true,
      viewCount: 6540,
      publishedAt: new Date(Date.now() - 1000 * 60 * 240), // 4 saat önce
      authorId: editorUser.id,
      categoryId: catMap["spor"],
      tagSlugs: ["son-dakika", "futbol", "sampiyonlar-ligi", "super-lig"],
    },
    {
      title: "Yapay Zeka ve Sağlıkta Devrim: Kanseri Erken Teşhis Eden Algoritma",
      slug: "yapay-zeka-ve-saglikta-devrim-kanseri-erken-teshis-eden-algoritma",
      summary:
        "Bilim insanları, medikal görüntüleri saniyeler içinde analiz ederek kanserli hücreleri %99 hassasiyetle tespit eden yeni bir yapay zeka modeli geliştirdi.",
      content: `
<p>Tıp dünyasını heyecanlandıran uluslararası ortak bir araştırmada, derin öğrenme temelli yeni bir yapay zeka algoritması tanıtıldı.</p>
<p>Radyoloji taramalarını insan gözünden çok daha hızlı inceleyen sistem, erken evre tümörleri henüz gözle tespit edilemezken dahi belirleyebiliyor.</p>
<p>Araştırmacılar, bu yöntemin gelecekte teşhis süreçlerini kısaltacağını ve hayat kurtarma oranını önemli ölçüde artıracağını vurguluyor.</p>
      `,
      coverImageUrl:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: true,
      isFeatured: true,
      viewCount: 2890,
      publishedAt: new Date(Date.now() - 1000 * 60 * 360), // 6 saat önce
      authorId: editorUser.id,
      categoryId: catMap["saglik"],
      tagSlugs: ["yapay-zeka", "yazilim"],
    },
    {
      title: "İklim Zirvesi'nde Tarihi Anlaşma: Yenilenebilir Enerjiye Dev Yatırım",
      slug: "iklim-zirvesinde-tarihi-anlasma-yenilenebilir-enerjiye-dev-yatirim",
      summary:
        "Dünya liderleri 2030 yılına kadar karbon emisyonunu %45 azaltmayı hedefleyen kapsamlı iklim paktına imza attı.",
      content: `
<p>Birleşmiş Milletler İklim Değişikliği Konferansı küresel enerji dönüşümü açısından tarihi bir kararla sona erdi. Katılımcı 120 ülke, fosil yakıt bağımlılığını azaltacak bildirgeye onay verdi.</p>
<p>Anlaşma uyarınca önümüzdeki 5 yıl içinde rüzgar ve güneş enerjisi yatırımlarına toplam 1.5 trilyon dolarlık fon ayrılacak.</p>
      `,
      coverImageUrl:
        "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: false,
      viewCount: 1450,
      publishedAt: new Date(Date.now() - 1000 * 60 * 500),
      authorId: adminUser.id,
      categoryId: catMap["dunya"],
      tagSlugs: ["enerji"],
    },
    {
      title: "İstanbul Film Festivali Başlıyor: 150'den Fazla Film Seyirciyle Buluşacak",
      slug: "istanbul-film-festivali-basliyor-150den-fazla-film-seyirciyle-bulusacak",
      summary:
        "Sinemaseverlerin heyecanla beklediği uluslararası film festivali bu yıl zengin programı ve usta yönetmenlerin katılımıyla kapılarını açıyor.",
      content: `
<p>Bu yıl 43. kez düzenlenen sinema şöleninde dünya sinemasının en yeni örnekleri, klasik eserler ve restore edilmiş kült filmler gösterilecek.</p>
<p>Açılış töreninde onur ödülleri sahiplerine takdim edilirken, festival boyunca usta atölyeleri ve yönetmen söyleşileri de düzenlenecek.</p>
      `,
      coverImageUrl:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: false,
      viewCount: 980,
      publishedAt: new Date(Date.now() - 1000 * 60 * 700),
      authorId: editorUser.id,
      categoryId: catMap["kultur-sanat"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "Uzay Teleskobu Güneş Sistemi Dışında Yaşanabilir Gezegen Adayı Keşfetti",
      slug: "uzay-teleskobu-gunes-sistemi-disinda-yasanabilir-gezegen-adayi-kesfetti",
      summary:
        "Gökbilimciler, Dünya'dan 120 ışık yılı uzaklıkta yer alan ve atmosferinde su buharı izleri bulunan bir ötegezegen tespit ettiler.",
      content: `
<p>Uzay ajansı bilim insanları, yeni nesil derin uzay teleskobundan elde edilen verilerin analizini tamamladı.</p>
<p>'TOI-700 e' olarak adlandırılan gezegenin, yörüngesinde döndüğü yıldıza olan uzaklığı sebebiyle sıvı halde su barındırma ihtimali oldukça yüksek.</p>
      `,
      coverImageUrl:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: false,
      viewCount: 3870,
      publishedAt: new Date(Date.now() - 1000 * 60 * 900),
      authorId: adminUser.id,
      categoryId: catMap["teknoloji"],
      tagSlugs: ["uzay", "yapay-zeka"],
    },
    {
      title: "TBMM'de Yeni Yasa Teklifi Görüşülüyor: Dijital Hizmetlerde Düzenleme",
      slug: "tbmmde-yeni-yasa-teklifi-gorusuluyor-dijital-hizmetlerde-duzenleme",
      summary:
        "Meclis Genel Kurulu'nda dijital yayıncılık, veri güvenliği ve tüketici haklarını kapsayan yeni kanun teklifinin maddeleri ele alınıyor.",
      content: `
<p>Türkiye Büyük Millet Meclisi Genel Kurulu, dijital mecralarda kullanıcı güvenliğini artırmayı hedefleyen yeni yasa tasarısını gündemine aldı.</p>
<p>Düzenleme ile kullanıcı verilerinin korunması, lisanslama şartları ve dijital aboneliklerin kolayca iptal edilebilmesine dair yeni yükümlülükler getiriliyor.</p>
      `,
      coverImageUrl:
        "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: true,
      isFeatured: false,
      viewCount: 1760,
      publishedAt: new Date(Date.now() - 1000 * 60 * 1100),
      authorId: adminUser.id,
      categoryId: catMap["siyaset"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "İhracatta Yeni Rekor: Geçen Yılın Aynı Dönemine Göre %14 Artış",
      slug: "ihracatta-yeni-rekor-gecen-yilin-ayni-donemine-gore-yuzde-14-artis",
      summary:
        "Ticaret Bakanlığı tarafından açıklanan son verilere göre sanayi ve tarım ihracatında aylık bazda tüm zamanların zirvesine ulaşıldı.",
      content: `
<p>Türkiye'nin dış ticaret istatistikleri sevindirici rakamlar ortaya koydu. Sanayi ürünleri ihracatı öncülüğünde toplam dış satım rakamları rekor kırdı.</p>
<p>Bakanlık yetkilileri, özellikle Avrupa ve Orta Doğu pazarlarındaki pazar payı artışının bu başarıda kritik rol oynadığını kaydetti.</p>
      `,
      coverImageUrl:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: false,
      viewCount: 2210,
      publishedAt: new Date(Date.now() - 1000 * 60 * 1400),
      authorId: editorUser.id,
      categoryId: catMap["ekonomi"],
      tagSlugs: ["enflasyon", "borsa", "turkiye"],
    },
    {
      title: "Afet Yönetiminde İnsansız Hava Araçları Dönemi",
      slug: "afet-yonetiminde-insansiz-hava-araclari-donemi",
      summary:
        "Arama kurtarma ekipleri, termal kamera ve yapay zeka destekli dron sistemleriyle doğal afetlere müdahale süresini yarı yarıya düşürdü.",
      content: `
<p>Afet ve acil durum senaryolarında dronların kullanımı yaygınlaşıyor. Yerli dron filoları sayesinde ulaşılamaz arazi şartlarında hayat kurtaran haritalama yapılıyor.</p>
<p>Tatbikatlarda başarıyla kullanılan yeni nesil dronlar enkaz altındaki ısıl işaretleri anında merkeze raporlayabiliyor.</p>
      `,
      coverImageUrl:
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: false,
      viewCount: 1640,
      publishedAt: new Date(Date.now() - 1000 * 60 * 1800),
      authorId: adminUser.id,
      categoryId: catMap["gundem"],
      tagSlugs: ["turkiye", "yazilim"],
    },
    {
      title: "İstanbul'da Toplu Taşımaya Yeni Hat: Metro Uzatma Projesi Onaylandı",
      slug: "istanbulda-toplu-tasimaya-yeni-hat-metro-uzatma-projesi-onaylandi",
      summary: "İstanbul'un Avrupa yakasında uzun süredir beklenen metro uzatma hattı için kesin güzergah ve takvim açıklandı.",
      content: `<p>Ulaştırma ve Altyapı Bakanlığı, metro uzatma projesinin onaylandığını duyurdu. Yeni hat birkaç ilçeyi doğrudan merkeze bağlayacak.</p><p>İnşaatın etaplar halinde yürütüleceği, ilk kazmanın bu yıl içinde vurulmasının planlandığı belirtildi.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: true,
      isFeatured: true,
      viewCount: 2100,
      publishedAt: new Date(Date.now() - 1000 * 60 * 50),
      authorId: adminUser.id,
      categoryId: catMap["gundem"],
      tagSlugs: ["turkiye", "son-dakika"],
    },
    {
      title: "Tarımda Kuraklık Uyarısı: Sulama Sezonu Erken Başlıyor",
      slug: "tarimda-kuraklik-uyarisi-sulama-sezonu-erken-basliyor",
      summary: "Meteoroloji ve tarım uzmanları, yaz aylarında su stresi yaşanabileceğini belirterek üreticileri erken planlamaya çağırdı.",
      content: `<p>Baraj doluluk oranlarındaki düşüş, tarım bölgelerinde sulama takvimini öne çekti.</p><p>Yetkililer damla sulama ve gece sulamasının teşvik edileceğini açıkladı.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 980,
      publishedAt: new Date(Date.now() - 1000 * 60 * 80),
      authorId: editorUser.id,
      categoryId: catMap["gundem"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "Asgari Ücret Komisyonu İlk Toplantısını Yaptı",
      slug: "asgari-ucret-komisyonu-ilk-toplantisini-yapti",
      summary: "İşçi, işveren ve hükümet temsilcileri asgari ücret görüşmelerinin ilk turunu tamamladı.",
      content: `<p>Komisyon, enflasyon ve geçim endekslerini masaya yatırdı.</p><p>İkinci tur toplantının önümüzdeki hafta yapılması bekleniyor.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: true,
      isFeatured: true,
      viewCount: 5400,
      publishedAt: new Date(Date.now() - 1000 * 60 * 95),
      authorId: adminUser.id,
      categoryId: catMap["ekonomi"],
      tagSlugs: ["enflasyon", "son-dakika", "turkiye"],
    },
    {
      title: "Konut Kredilerinde Yeni Düzenleme Yürürlüğe Girdi",
      slug: "konut-kredilerinde-yeni-duzenleme-yururluge-girdi",
      summary: "Bankacılık düzenleyicisi, ilk konut alımlarında kredi-değer oranını güncelledi.",
      content: `<p>Yeni oranların özellikle genç alıcıları desteklemesi bekleniyor.</p><p>Bankalar sistem güncellemelerini bu hafta tamamlayacak.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 1870,
      publishedAt: new Date(Date.now() - 1000 * 60 * 140),
      authorId: editorUser.id,
      categoryId: catMap["ekonomi"],
      tagSlugs: ["borsa", "turkiye"],
    },
    {
      title: "Dış Ticaret Açığı Daraldı: İthalat Geriledi",
      slug: "dis-ticaret-acigi-daraldi-ithalat-geriledi",
      summary: "TÜİK verilerine göre dış ticaret açığı bir önceki aya göre belirgin şekilde geriledi.",
      content: `<p>Enerji ithalatındaki düşüş açığın daralmasında etkili oldu.</p><p>Ekonomistler trendin sürdürülebilirliğini izleyeceklerini belirtti.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 1320,
      publishedAt: new Date(Date.now() - 1000 * 60 * 200),
      authorId: editorUser.id,
      categoryId: catMap["ekonomi"],
      tagSlugs: ["enflasyon", "turkiye"],
    },
    {
      title: "Meclis'te Bütçe Görüşmeleri Başladı",
      slug: "mecliste-butce-gorusmeleri-basladi",
      summary: "TBMM Plan ve Bütçe Komisyonu, yılın bütçe teklifini madde madde ele almaya başladı.",
      content: `<p>Muhalefet ve iktidar milletvekilleri harcama kalemleri üzerinde soru-cevap yaptı.</p><p>Genel Kurul takviminin önümüzdeki ay netleşmesi bekleniyor.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 1760,
      publishedAt: new Date(Date.now() - 1000 * 60 * 260),
      authorId: adminUser.id,
      categoryId: catMap["siyaset"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "Yerel Yönetim Reformu Taslağı Kamuoyuna Sunuldu",
      slug: "yerel-yonetim-reformu-taslagi-kamuoyuna-sunuldu",
      summary: "Belediyelerin mali özerkliğini artıracak taslak, görüşe açıldı.",
      content: `<p>Taslakta şeffaflık ve denetim maddeleri öne çıkıyor.</p><p>STK'lardan 15 gün içinde görüş toplanacak.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1436450412740-6b9888d8b8c2?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 640,
      publishedAt: new Date(Date.now() - 1000 * 60 * 320),
      authorId: editorUser.id,
      categoryId: catMap["siyaset"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "NATO Genel Sekreteri Ankara'da Temaslarda Bulundu",
      slug: "nato-genel-sekreteri-ankarada-temaslarda-bulundu",
      summary: "İttifakın güvenlik gündemi ve bölgesel istikrar konuları masaya yatırıldı.",
      content: `<p>Heyet, savunma iş birliği ve ortak tatbikat takvimini değerlendirdi.</p><p>Ortak açıklamada diyaloğun süreceği vurgulandı.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1526304640171-2edc8c0c1c0a?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 2450,
      publishedAt: new Date(Date.now() - 1000 * 60 * 380),
      authorId: adminUser.id,
      categoryId: catMap["dunya"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "Avrupa'da Enerji Fiyatları Yaz Rekoru Kırdı",
      slug: "avrupada-enerji-fiyatlari-yaz-rekoru-kirdi",
      summary: "Sıcak hava dalgası elektrik talebini artırırken spot piyasalarda fiyatlar yükseldi.",
      content: `<p>Analistler, yenilenebilir üretimdeki dalgalanmanın etkili olduğunu söyledi.</p><p>Hanehalkı faturalarına yansımanın sınırlı kalması bekleniyor.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 1180,
      publishedAt: new Date(Date.now() - 1000 * 60 * 440),
      authorId: editorUser.id,
      categoryId: catMap["dunya"],
      tagSlugs: ["enerji"],
    },
    {
      title: "Akdeniz'de Arama Kurtarma Tatbikatı Tamamlandı",
      slug: "akdenizde-arama-kurtarma-tatbikati-tamamlandi",
      summary: "Çok uluslu tatbikatta deniz ve hava unsurları koordineli senaryoları başarıyla uyguladı.",
      content: `<p>Tatbikatta göçmen gemisi ve yangın senaryoları çalışıldı.</p><p>Komutanlık, hazırlık seviyesinin yükseldiğini kaydetti.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 720,
      publishedAt: new Date(Date.now() - 1000 * 60 * 500),
      authorId: adminUser.id,
      categoryId: catMap["dunya"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "Yerli Çip Tasarım Merkezi İlk Prototipi Duyurdu",
      slug: "yerli-cip-tasarim-merkezi-ilk-prototipi-duyurdu",
      summary: "Savunma ve sivil elektronik için geliştirilen işlemci ailesinin ilk örneği tanıtıldı.",
      content: `<p>Merkez, prototipin laboratuvar testlerini geçtiğini açıkladı.</p><p>Seri üretim için sanayi ortaklıkları görüşülüyor.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 3010,
      publishedAt: new Date(Date.now() - 1000 * 60 * 560),
      authorId: editorUser.id,
      categoryId: catMap["teknoloji"],
      tagSlugs: ["yazilim", "yapay-zeka"],
    },
    {
      title: "5G Kapsama Alanı 81 İlde Genişliyor",
      slug: "5g-kapsama-alani-81-ilde-genisliyor",
      summary: "Operatörler, yeni baz istasyonu yatırımlarıyla kırsal bölgelerde de 5G hızına geçiyor.",
      content: `<p>Ulaştırma Bakanlığı yol haritasını güncelledi.</p><p>İlk etapta sanayi bölgeleri önceliklendirilecek.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d17?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 1540,
      publishedAt: new Date(Date.now() - 1000 * 60 * 620),
      authorId: adminUser.id,
      categoryId: catMap["teknoloji"],
      tagSlugs: ["yazilim"],
    },
    {
      title: "Siber Güvenlik Kurulu Yeni Standartları Yayımladı",
      slug: "siber-guvenlik-kurulu-yeni-standartlari-yayimladi",
      summary: "Kamu kurumları ve kritik altyapı işletmecileri için zorunlu güvenlik çerçevesi güncellendi.",
      content: `<p>Standart, olay müdahale sürelerini kısaltmayı hedefliyor.</p><p>Uyum için 12 aylık geçiş süresi tanındı.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 890,
      publishedAt: new Date(Date.now() - 1000 * 60 * 680),
      authorId: editorUser.id,
      categoryId: catMap["teknoloji"],
      tagSlugs: ["yazilim"],
    },
    {
      title: "Milli Takım Avrupa Elemelerinde Kritik Viraja Girdi",
      slug: "milli-takim-avrupa-elemelerinde-kritik-viraja-girdi",
      summary: "A Milli Futbol Takımı, grupta puan farkını korumak için deplasman maçına çıkıyor.",
      content: `<p>Teknik heyet, kadroda sürpriz isimlere yer verdi.</p><p>Karşılaşma ulusal kanalda canlı yayınlanacak.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: true,
      isFeatured: true,
      viewCount: 6120,
      publishedAt: new Date(Date.now() - 1000 * 60 * 740),
      authorId: editorUser.id,
      categoryId: catMap["spor"],
      tagSlugs: ["futbol", "son-dakika"],
    },
    {
      title: "Basketbol Liginde Derbi Gecesi: Salonlar Doldu",
      slug: "basketbol-liginde-derbi-gecesi-salonlar-doldu",
      summary: "Haftanın derbisi, yüksek tempolu bir mücadeleye sahne oldu.",
      content: `<p>Son çeyrekteki üçlük yağmuru skoru belirledi.</p><p>Play-off yarışı iyice sıkılaştı.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 2340,
      publishedAt: new Date(Date.now() - 1000 * 60 * 800),
      authorId: adminUser.id,
      categoryId: catMap["spor"],
      tagSlugs: ["super-lig"],
    },
    {
      title: "Olimpiyat Adayları Kampa Girdi",
      slug: "olimpiyat-adaylari-kampa-girdi",
      summary: "Atletizm ve yüzme branşlarında milli sporcular yoğun idman programına başladı.",
      content: `<p>Kamp programı altı hafta sürecek.</p><p>Federasyon, performans verilerini haftalık paylaşacak.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066027b?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 560,
      publishedAt: new Date(Date.now() - 1000 * 60 * 860),
      authorId: editorUser.id,
      categoryId: catMap["spor"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "Ankara'da Uluslararası Tiyatro Festivali Perde Açtı",
      slug: "ankarada-uluslararasi-tiyatro-festivali-perde-acti",
      summary: "On ülkeden topluluklar, on gün boyunca sahnelerde olacak.",
      content: `<p>Açılış oyunu büyük salonun tamamını doldurdu.</p><p>Öğrenci biletleri için kontenjan ayrıldı.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 430,
      publishedAt: new Date(Date.now() - 1000 * 60 * 920),
      authorId: adminUser.id,
      categoryId: catMap["kultur-sanat"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "Restorasyonu Biten Tarihi Han Ziyarete Açıldı",
      slug: "restorasyonu-biten-tarihi-han-ziyarete-acildi",
      summary: "Osmanlı döneminden kalma han, müze ve atölye işleviyle yeniden hayat buldu.",
      content: `<p>Restorasyonda özgün malzemeye sadık kalındı.</p><p>Hafta sonu ücretsiz rehberli turlar düzenlenecek.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 770,
      publishedAt: new Date(Date.now() - 1000 * 60 * 980),
      authorId: editorUser.id,
      categoryId: catMap["kultur-sanat"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "Yeni Aşı Takvimi Aile Hekimlerine Ulaştırıldı",
      slug: "yeni-asi-takvimi-aile-hekimlerine-ulastirildi",
      summary: "Sağlık Bakanlığı, çocukluk çağı aşı takviminde güncelleme yaptığını duyurdu.",
      content: `<p>Güncelleme, uluslararası kılavuzlarla uyumlu hale getirildi.</p><p>Velilere SMS ile hatırlatma gönderilecek.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: true,
      viewCount: 1990,
      publishedAt: new Date(Date.now() - 1000 * 60 * 1040),
      authorId: editorUser.id,
      categoryId: catMap["saglik"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "Hastanelerde Randevu Yoğunluğuna Yeni Slot Sistemi",
      slug: "hastanelerde-randevu-yogunluguna-yeni-slot-sistemi",
      summary: "MHRS'de sabah erken saatlerde ek kontenjan açılacak.",
      content: `<p>Pilot uygulama büyükşehirlerde başlıyor.</p><p>Amaç, beklemeyi kısaltmak ve no-show oranını düşürmek.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: false,
      viewCount: 1120,
      publishedAt: new Date(Date.now() - 1000 * 60 * 1100),
      authorId: adminUser.id,
      categoryId: catMap["saglik"],
      tagSlugs: ["turkiye", "yazilim"],
    },
    {
      title: "Okullarda Beslenme Çantası Rehberi Yayınlandı",
      slug: "okullarda-beslenme-cantasi-rehberi-yayinlandi",
      summary: "Diyetisyenler, öğrenci öğünleri için pratik ve dengeli öneriler derledi.",
      content: `<p>Rehber, şekerli içeceklerin azaltılmasını tavsiye ediyor.</p><p>Okul kantin menüleri de gözden geçirilecek.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1498837161126-2e0c05d49616?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: false,
      viewCount: 640,
      publishedAt: new Date(Date.now() - 1000 * 60 * 1160),
      authorId: editorUser.id,
      categoryId: catMap["saglik"],
      tagSlugs: ["turkiye"],
    },
    {
      title: "Dijital Tasarım Uzmanı Kerem Yıldız ile Özel Röportaj",
      slug: "dijital-tasarim-uzmani-kerem-yildiz-ile-ozel-roportaj",
      summary: "Arayüz, marka ve ürün tasarımında yeni nesil yaklaşımlar.",
      content: `<p>Kerem Yıldız, dijital tasarımda sadeleşmenin neden daha zor olduğunu anlattı.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: false,
      headlineKicker: "Kerem YILDIZ",
      viewCount: 420,
      publishedAt: new Date(Date.now() - 1000 * 60 * 200),
      authorId: editorUser.id,
      categoryId: catMap["roportaj"],
      tagSlugs: ["yazilim"],
    },
    {
      title: "TE Bilişim Teknik Ekip Lideri Emre Dilek ile Özel Röportaj",
      slug: "te-bilisim-teknik-ekip-lideri-emre-dilek-ile-ozel-roportaj",
      summary: "Yazılım ekiplerinde tempo, kalite ve sürdürülebilir teslimat.",
      content: `<p>Emre Dilek, teknik liderliğin günlük ritmini paylaştı.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: false,
      headlineKicker: "Emre DİLEK",
      viewCount: 380,
      publishedAt: new Date(Date.now() - 1000 * 60 * 260),
      authorId: editorUser.id,
      categoryId: catMap["roportaj"],
      tagSlugs: ["yazilim"],
    },
    {
      title: "TE Bilişim Mobil Uygulama Geliştiricisi Hamit Dincel ile Özel Röportaj",
      slug: "te-bilisim-mobil-uygulama-gelistiricisi-hamit-dincel-ile-ozel-roportaj",
      summary: "Mobil ürünlerde performans ve kullanıcı alışkanlıkları.",
      content: `<p>Hamit Dincel, uygulama mağazası süreçlerini anlattı.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: false,
      headlineKicker: "Hamit DİNCEL",
      viewCount: 310,
      publishedAt: new Date(Date.now() - 1000 * 60 * 320),
      authorId: adminUser.id,
      categoryId: catMap["roportaj"],
      tagSlugs: ["yazilim"],
    },
    {
      title: "Önce Sevgi",
      slug: "once-sevgi-senol-gunes-roportaj",
      summary: "Teknik direktörlükte insan ve disiplin dengesi.",
      content: `<p>Şenol Güneş, soyunma odasında güvenin nasıl kurulduğunu anlattı.</p>`,
      coverImageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
      status: ArticleStatus.PUBLISHED,
      isBreaking: false,
      isFeatured: false,
      headlineKicker: "Şenol Güneş",
      viewCount: 890,
      publishedAt: new Date(Date.now() - 1000 * 60 * 380),
      authorId: adminUser.id,
      categoryId: catMap["roportaj"],
      tagSlugs: ["futbol"],
    },
  ];

  for (const item of articlesData) {
    const { tagSlugs, ...data } = item;
    await prisma.article.create({
      data: {
        ...data,
        tags: {
          connect: tagSlugs.map((slug) => ({ id: tagMap[slug] })),
        },
      },
    });
  }

  console.log("🖼️ Foto galeriler ekleniyor...");

  await prisma.gallery.create({
    data: {
      title: "Türkiye’de Hafta Sonu Kaçamakları İçin Saklı Rotalar",
      slug: "hafta-sonu-kacamaklari-sakli-rotalar",
      coverImageUrl: "https://images.unsplash.com/photo-1605559424843-9e0c080cba16?q=80&w=1400&auto=format&fit=crop",
      images: {
        create: [
          { imageUrl: "https://images.unsplash.com/photo-1605559424843-9e0c080cba16?q=80&w=1400&auto=format&fit=crop", order: 0, caption: "Kapadokya" },
          { imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1400&auto=format&fit=crop", order: 1 },
        ],
      },
    },
  });
  await prisma.gallery.create({
    data: {
      title: "Mimovic dev maçta sahne aldı: Rusya'da zirveyi karıştıran müsabaka",
      slug: "mimovic-dev-macta-sahne-aldi",
      coverImageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200&auto=format&fit=crop",
      images: {
        create: [{ imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200&auto=format&fit=crop", order: 0 }],
      },
    },
  });
  await prisma.gallery.create({
    data: {
      title: "Süper Lig'de gol krallığı yarışı (2024-2025 sezonu)",
      slug: "super-lig-gol-kralligi-yarisi",
      coverImageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1200&auto=format&fit=crop",
      images: {
        create: [{ imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1200&auto=format&fit=crop", order: 0 }],
      },
    },
  });

  console.log("⚙️ Site ayarları kaydediliyor...");

  const settingsData = [
    { key: "siteName", value: "RD Haber" },
    { key: "siteSlogan", value: "Güncel, Tarafsız ve Hızlı Haber Portalı" },
    { key: "whatsappNumber", value: "905551234567" },
    { key: "tipLinePhone", value: "0850 123 45 67" },
    { key: "tipLineEmail", value: "info@duzceradikal.com" },
    { key: "contactEmail", value: "info@duzceradikal.com" },
    { key: "facebookUrl", value: "https://facebook.com/rdkhaber" },
    { key: "twitterUrl", value: "https://x.com/rdkhaber" },
    { key: "instagramUrl", value: "https://instagram.com/rdkhaber" },
    { key: "youtubeUrl", value: "https://youtube.com/rdkhaber" },
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  console.log("📩 Örnek İhbarlar ve Haber Gönderimleri ekleniyor...");

  await prisma.tip.create({
    data: {
      message: "Ankara Kızılay meydanında trafik ışıklarında arıza nedeniyle uzun araç kuyrukları oluştu.",
      contactInfo: "ahmet@gmail.com",
    },
  });

  await prisma.newsSubmission.create({
    data: {
      title: "Mahallemizdeki Park Yenilendi",
      content: "Belediye ekipleri 6 aydır kapalı olan çocuk parkını yenileyerek bugün hizmete açtı.",
      submitterName: "Mehmet Demir",
      submitterEmail: "mehmet.d@example.com",
    },
  });

  console.log("✅ Seed işlemi başarıyla tamamlandı!");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
