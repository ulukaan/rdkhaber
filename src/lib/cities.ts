export type CityDef = {
  slug: string;
  name: string;
  /** Aladhan API city adı */
  query: string;
  lat: number;
  lon: number;
};

export const DEFAULT_CITY_SLUG = "duzce";
export const CITY_COOKIE = "rdk_city";

/** Türkiye illeri — merkez koordinatları */
export const CITIES: CityDef[] = [
  { slug: "adana", name: "Adana", query: "Adana", lat: 37.0, lon: 35.3213 },
  { slug: "adiyaman", name: "Adıyaman", query: "Adiyaman", lat: 37.7648, lon: 38.2786 },
  { slug: "afyonkarahisar", name: "Afyonkarahisar", query: "Afyon", lat: 38.7507, lon: 30.5567 },
  { slug: "agri", name: "Ağrı", query: "Agri", lat: 39.7191, lon: 43.0503 },
  { slug: "aksaray", name: "Aksaray", query: "Aksaray", lat: 38.3687, lon: 34.037 },
  { slug: "amasya", name: "Amasya", query: "Amasya", lat: 40.6499, lon: 35.8353 },
  { slug: "ankara", name: "Ankara", query: "Ankara", lat: 39.9334, lon: 32.8597 },
  { slug: "antalya", name: "Antalya", query: "Antalya", lat: 36.8969, lon: 30.7133 },
  { slug: "ardahan", name: "Ardahan", query: "Ardahan", lat: 41.1105, lon: 42.7022 },
  { slug: "artvin", name: "Artvin", query: "Artvin", lat: 41.1828, lon: 41.8183 },
  { slug: "aydin", name: "Aydın", query: "Aydin", lat: 37.856, lon: 27.8416 },
  { slug: "balikesir", name: "Balıkesir", query: "Balikesir", lat: 39.6484, lon: 27.8826 },
  { slug: "bartin", name: "Bartın", query: "Bartin", lat: 41.6358, lon: 32.3375 },
  { slug: "batman", name: "Batman", query: "Batman", lat: 37.8812, lon: 41.1351 },
  { slug: "bayburt", name: "Bayburt", query: "Bayburt", lat: 40.2552, lon: 40.2249 },
  { slug: "bilecik", name: "Bilecik", query: "Bilecik", lat: 40.1553, lon: 29.9833 },
  { slug: "bingol", name: "Bingöl", query: "Bingol", lat: 38.8855, lon: 40.4966 },
  { slug: "bitlis", name: "Bitlis", query: "Bitlis", lat: 38.4006, lon: 42.1095 },
  { slug: "bolu", name: "Bolu", query: "Bolu", lat: 40.7392, lon: 31.6086 },
  { slug: "burdur", name: "Burdur", query: "Burdur", lat: 37.7203, lon: 30.2906 },
  { slug: "bursa", name: "Bursa", query: "Bursa", lat: 40.1885, lon: 29.061 },
  { slug: "canakkale", name: "Çanakkale", query: "Canakkale", lat: 40.1553, lon: 26.4142 },
  { slug: "cankiri", name: "Çankırı", query: "Cankiri", lat: 40.6013, lon: 33.6134 },
  { slug: "corum", name: "Çorum", query: "Corum", lat: 40.5506, lon: 34.9556 },
  { slug: "denizli", name: "Denizli", query: "Denizli", lat: 37.7765, lon: 29.0864 },
  { slug: "diyarbakir", name: "Diyarbakır", query: "Diyarbakir", lat: 37.9144, lon: 40.2306 },
  { slug: "duzce", name: "Düzce", query: "Duzce", lat: 40.8438, lon: 31.1565 },
  { slug: "edirne", name: "Edirne", query: "Edirne", lat: 41.6818, lon: 26.5623 },
  { slug: "elazig", name: "Elazığ", query: "Elazig", lat: 38.681, lon: 39.2264 },
  { slug: "erzincan", name: "Erzincan", query: "Erzincan", lat: 39.75, lon: 39.5 },
  { slug: "erzurum", name: "Erzurum", query: "Erzurum", lat: 39.9043, lon: 41.2679 },
  { slug: "eskisehir", name: "Eskişehir", query: "Eskisehir", lat: 39.7767, lon: 30.5206 },
  { slug: "gaziantep", name: "Gaziantep", query: "Gaziantep", lat: 37.0662, lon: 37.3833 },
  { slug: "giresun", name: "Giresun", query: "Giresun", lat: 40.9128, lon: 38.3895 },
  { slug: "gumushane", name: "Gümüşhane", query: "Gumushane", lat: 40.4603, lon: 39.4815 },
  { slug: "hakkari", name: "Hakkâri", query: "Hakkari", lat: 37.5744, lon: 43.7408 },
  { slug: "hatay", name: "Hatay", query: "Antakya", lat: 36.4018, lon: 36.3498 },
  { slug: "igdir", name: "Iğdır", query: "Igdir", lat: 39.8875, lon: 44.0048 },
  { slug: "isparta", name: "Isparta", query: "Isparta", lat: 37.7648, lon: 30.5566 },
  { slug: "istanbul", name: "İstanbul", query: "Istanbul", lat: 41.0082, lon: 28.9784 },
  { slug: "izmir", name: "İzmir", query: "Izmir", lat: 38.4237, lon: 27.1428 },
  { slug: "kahramanmaras", name: "Kahramanmaraş", query: "Kahramanmaras", lat: 37.5858, lon: 36.9371 },
  { slug: "karabuk", name: "Karabük", query: "Karabuk", lat: 41.2061, lon: 32.6204 },
  { slug: "karaman", name: "Karaman", query: "Karaman", lat: 37.1759, lon: 33.2287 },
  { slug: "kars", name: "Kars", query: "Kars", lat: 40.6013, lon: 43.0975 },
  { slug: "kastamonu", name: "Kastamonu", query: "Kastamonu", lat: 41.3887, lon: 33.7827 },
  { slug: "kayseri", name: "Kayseri", query: "Kayseri", lat: 38.7312, lon: 35.4787 },
  { slug: "kilis", name: "Kilis", query: "Kilis", lat: 36.7184, lon: 37.1212 },
  { slug: "kirikkale", name: "Kırıkkale", query: "Kirikkale", lat: 39.8468, lon: 33.5153 },
  { slug: "kirklareli", name: "Kırklareli", query: "Kirklareli", lat: 41.7333, lon: 27.2167 },
  { slug: "kirsehir", name: "Kırşehir", query: "Kirsehir", lat: 39.1425, lon: 34.1709 },
  { slug: "kocaeli", name: "Kocaeli", query: "Izmit", lat: 40.7654, lon: 29.9408 },
  { slug: "konya", name: "Konya", query: "Konya", lat: 37.8746, lon: 32.4932 },
  { slug: "kutahya", name: "Kütahya", query: "Kutahya", lat: 39.4242, lon: 29.9833 },
  { slug: "malatya", name: "Malatya", query: "Malatya", lat: 38.3552, lon: 38.3095 },
  { slug: "manisa", name: "Manisa", query: "Manisa", lat: 38.6191, lon: 27.4289 },
  { slug: "mardin", name: "Mardin", query: "Mardin", lat: 37.3212, lon: 40.7245 },
  { slug: "mersin", name: "Mersin", query: "Mersin", lat: 36.8121, lon: 34.6415 },
  { slug: "mugla", name: "Muğla", query: "Mugla", lat: 37.2153, lon: 28.3636 },
  { slug: "mus", name: "Muş", query: "Mus", lat: 38.7432, lon: 41.5065 },
  { slug: "nevsehir", name: "Nevşehir", query: "Nevsehir", lat: 38.6939, lon: 34.6857 },
  { slug: "nigde", name: "Niğde", query: "Nigde", lat: 37.9667, lon: 34.6833 },
  { slug: "ordu", name: "Ordu", query: "Ordu", lat: 40.9862, lon: 37.8797 },
  { slug: "osmaniye", name: "Osmaniye", query: "Osmaniye", lat: 37.0742, lon: 36.2478 },
  { slug: "rize", name: "Rize", query: "Rize", lat: 41.0201, lon: 40.5234 },
  { slug: "sakarya", name: "Sakarya", query: "Adapazari", lat: 40.7889, lon: 30.4053 },
  { slug: "samsun", name: "Samsun", query: "Samsun", lat: 41.2867, lon: 36.33 },
  { slug: "sanliurfa", name: "Şanlıurfa", query: "Sanliurfa", lat: 37.1591, lon: 38.7969 },
  { slug: "siirt", name: "Siirt", query: "Siirt", lat: 37.9443, lon: 41.9329 },
  { slug: "sinop", name: "Sinop", query: "Sinop", lat: 42.0231, lon: 35.1531 },
  { slug: "sirnak", name: "Şırnak", query: "Sirnak", lat: 37.5164, lon: 42.4611 },
  { slug: "sivas", name: "Sivas", query: "Sivas", lat: 39.7477, lon: 37.0179 },
  { slug: "tekirdag", name: "Tekirdağ", query: "Tekirdag", lat: 40.9833, lon: 27.5167 },
  { slug: "tokat", name: "Tokat", query: "Tokat", lat: 40.3167, lon: 36.55 },
  { slug: "trabzon", name: "Trabzon", query: "Trabzon", lat: 41.0027, lon: 39.7168 },
  { slug: "tunceli", name: "Tunceli", query: "Tunceli", lat: 39.1079, lon: 39.5401 },
  { slug: "usak", name: "Uşak", query: "Usak", lat: 38.6823, lon: 29.4082 },
  { slug: "van", name: "Van", query: "Van", lat: 38.4891, lon: 43.4089 },
  { slug: "yalova", name: "Yalova", query: "Yalova", lat: 40.65, lon: 29.2667 },
  { slug: "yozgat", name: "Yozgat", query: "Yozgat", lat: 39.8181, lon: 34.8147 },
  { slug: "zonguldak", name: "Zonguldak", query: "Zonguldak", lat: 41.4564, lon: 31.7987 },
];


export function resolveCity(slug?: string | null): CityDef {
  const found = CITIES.find((c) => c.slug === slug);
  if (found) return found;
  return CITIES.find((c) => c.slug === DEFAULT_CITY_SLUG) ?? CITIES[0]!;
}
