# NEXUS — Personal Application Library / Launcher

## 1. Proje Tanımı

NEXUS, bilgisayarda yerel olarak kullanılan uygulama, oyun, script ve projeleri tek bir modern arayüzde toplayan kişisel bir uygulama kütüphanesi ve launcher'dır.

Amaç; masaüstündeki çok sayıdaki kısayol, klasör ve programı tek bir merkezi arayüzde toplamak ve uygulamaları hızlıca başlatmaktır.

NEXUS programları kopyalamaz, taşımaz veya yeniden kurmaz. Mevcut yerel uygulamaların çalıştırma bilgilerini yönetir.

---

## 2. Tasarım Dili

Ana görsel yaklaşım:

- Frost Glass / Glassmorphism
- Selen UI tarzı modern, teknolojik arayüz
- Koyu ve premium görünüm
- Cam yüzeyler
- Hafif çelik / metal yüzey hissi
- İnce ışık yansımaları
- Yumuşak gölgeler
- Modern ve temiz kart tasarımı
- Abartılı animasyonlardan kaçınılacak

Arayüz, modern ve premium görünmeli; ancak kullanım kolaylığı görselliğin önünde tutulmalıdır.

### Tema sistemi

NEXUS fonksiyonları temadan bağımsız çalışmalıdır.

İlk sürümde tema altyapısı bulunacak ve başlangıçta önerilen yaklaşık 10 tema hazırlanacaktır. Temaların isimleri ve nihai görsel stilleri daha sonra kullanıcı tarafından değiştirilebilir.

Önerilen başlangıç temaları:

1. Frost Glass — ana referans tema
2. Dark Steel
3. Arctic Glass
4. Obsidian
5. Silver Mist
6. Midnight Blue
7. Titanium
8. Aurora Glass
9. Carbon
10. White Glass

Tema değişimi uygulama verilerini ve fonksiyonlarını etkilememelidir.

---

## 3. Ana Ekran

Ana ekran mümkün olduğunca sade tutulacak.

Ana ekranda teknik uygulama bilgileri gösterilmeyecek.

Temel yapı:

- NEXUS başlığı/logo
- Arama alanı
- Kategori çubuğu
- Favoriler / son kullanılanlar
- Uygulama kartları
- Ayarlar erişimi

Örnek kategori yapısı:

- Tümü
- Favoriler
- AI
- Geliştirme
- Office
- Oyunlar
- Araçlar
- Kullanıcının oluşturduğu kategoriler
- `+ Kategori`

Kullanıcı istediği kadar yeni kategori oluşturabilmelidir.

---

## 4. Uygulama Kartları

Her uygulama kartı sade tutulacaktır.

Kartta temel olarak:

- Özel / uygulama ikonu
- Uygulama adı
- Kısa açıklama veya kategori bilgisi
- Başlatma butonu

bulunabilir.

Kartın sağ üstünde `⋮` menüsü bulunacaktır.

Kartın kendisi veya Başlat butonu uygulamayı başlatır.

---

## 5. Uygulama `⋮` Menüsü

Teknik ve gelişmiş özellikler ana ekranda gösterilmeyecek.

Kullanıcı kartın sağ üstündeki `⋮` menüsüne bastığında masaüstünde sağ tıklama menüsüne benzer bir bağlam menüsü açılacaktır.

Önerilen menü:

- Başlat
- Kapat
- Yeniden Başlat
- Favorilere Ekle / Favorilerden Çıkar
- Etiketler
- Düzenle
- Dosya Konumunu Aç
- Uygulama Ayarları
- Kütüphaneden Kaldır

Kapatma işlemi normal Windows uygulama kapatma davranışını tercih etmeli; ileride ayrıca "Zorla Kapat" seçeneği eklenebilir.

---

## 6. Uygulama Yönetimi

Her uygulama için aşağıdaki bilgiler desteklenecek:

1. Uygulama versiyonu
2. Son çalıştırılma zamanı
3. Favori durumu
4. Etiketler
5. Uygulama açıklaması
6. Özel ikon
7. Çalışma parametreleri
8. Yönetici olarak çalıştır
9. Çalışma klasörü
10. Uygulamayı kapat

Desteklenmesi planlanan çalıştırılabilir hedefler:

- `.exe`
- `.bat`
- `.cmd`
- PowerShell scriptleri
- Gerekirse diğer yerel çalıştırma hedefleri

---

## 7. Arama

NEXUS'ta hızlı arama bulunacak.

Arama:

- Uygulama adına
- Kategoriye
- Etiketlere

göre sonuçları filtreleyebilmelidir.

Arama arayüzü hızlı ve sade olmalıdır.

---

## 8. Favoriler

Kullanıcı uygulamaları favorilere ekleyebilir.

Favoriler:

- Ana ekranda ayrı bir bölüm olarak gösterilebilir.
- Filtrelenebilir.
- `⋮` menüsünden yönetilebilir.

---

## 9. Son Kullanılanlar

NEXUS, uygulamaların son çalıştırılma zamanını kaydedecek.

Ana ekranda "Son Kullanılanlar" bölümü bulunabilir.

Son kullanılanlar, kullanım kolaylığı için normal uygulama kartlarından daha kompakt gösterilebilir.

---

## 10. Etiketler

Kullanıcı uygulamalara birden fazla etiket verebilir.

Örnek:

- AI
- İş
- Geliştirme
- Sık Kullanılan
- Proje
- Deneysel
- Sunucu

Etiketler arama ve filtreleme amacıyla kullanılabilir.

---

## 11. Çalışma Grupları

NEXUS'un önemli ileri özelliklerinden biri olacaktır.

Bir çalışma grubu birden fazla uygulama veya script içerebilir.

Örneğin:

### AI Development

- Antigravity
- VS Code
- Terminal
- Local Server
- Browser

Tek bir işlemle çalışma grubundaki öğeler belirlenen sırayla başlatılabilir.

Bu özellik sadece uygulama açmak için değil, komple bir çalışma ortamını hazırlamak için tasarlanacaktır.

---

## 12. Proje Kartları

Uygulamalardan farklı olarak kullanıcı projeleri de NEXUS içinde temsil edilebilir.

Örnek:

- Crime Analysis
- NEXUS
- Hibrit Kurutma
- Diğer kişisel projeler

Bir proje kartı tek bir uygulamayı veya bir çalışma grubunu çalıştırabilir.

Böylece:

> Uygulama başlatmak

ile

> Çalışma ortamı / proje başlatmak

birbirinden ayrılabilir.

---

## 13. Hızlı Başlat

NEXUS'un ilerleyen sürümlerinde global bir klavye kısayolu bulunabilir.

Önerilen:

`Ctrl + Space`

Kısayol ile NEXUS'un tamamını açmadan küçük bir Frost Glass arama penceresi açılır.

Örneğin:

`Ctrl + Space`

→ `Antigravity`

→ `Enter`

→ Antigravity başlatılır.

Bu özellik NEXUS'u klasik Windows Start Menu'den daha hızlı bir kişisel launcher haline getirmeyi amaçlar.

---

## 14. Uygulama Başlatma

NEXUS uygulama kaydında en az şu çalıştırma bilgilerini tutmalıdır:

- Hedef dosya yolu
- Hedef türü
- Çalışma parametreleri
- Çalışma klasörü
- Yönetici olarak çalıştır seçeneği

Örnek:

```text
Name:
Antigravity

Type:
EXE

Path:
C:\Apps\Antigravity\Antigravity.exe

Arguments:
--example

Working Directory:
C:\Apps\Antigravity

Run as Administrator:
false
```

---

## 15. Uygulama Ekleme

Uygulama ekleme arayüzü:

- Ad
- Kategori
- Hedef dosya
- Hedef türü
- Parametreler
- Çalışma klasörü
- Yönetici olarak çalıştır
- İkon
- Açıklama
- Etiketler

alanlarını desteklemelidir.

İleride sürükle-bırak ile `.exe`, `.bat` vb. dosyaların doğrudan NEXUS'a bırakılması desteklenebilir.

---

## 16. Otomatik Keşif

İlerleyen sürümde NEXUS bilgisayardaki mevcut uygulamaları tarayabilir.

Tarama kaynakları:

- Windows Start Menu kısayolları
- Desktop kısayolları
- Kullanıcının belirlediği klasörler
- Bilinen uygulama dizinleri

NEXUS bulunan uygulamaları kullanıcıya listeleyerek seçilenleri kütüphaneye ekleyebilir.

Otomatik keşif sırasında kullanıcı onayı olmadan mevcut dosyalar değiştirilmemelidir.

---

## 17. İleri Kullanım İstatistikleri

Kullanıcı isterse uygulama ayarlarında:

- Son çalıştırılma
- Toplam çalıştırma sayısı
- Son 7 gün kullanım sayısı

gibi istatistikleri görebilir.

Bu bilgiler ana uygulama kartında zorunlu olarak gösterilmeyecektir.

---

## 18. NEXUS'ta OLMAYACAK Özellikler

İlk ve planlanan sürümlerde aşağıdaki özelliklere gerek yok:

- Çoklu monitör yönetimi
- Uygulama pencere konumu hatırlama
- Gelişmiş pencere yönetimi
- Gereksiz sistem optimizasyonları
- Bilgisayardaki uygulamaları otomatik olarak taşıma/kopyalama
- Programların kurulumunu yönetme

NEXUS'un temel amacı uygulama yönetimi ve başlatma deneyimidir.

---

## 19. Tasarım İlkesi

NEXUS'un temel felsefesi:

> "Bilgisayarındaki bütün araçlar, tek bir modern kütüphanede."

Ana ekran bir vitrin gibi davranmalıdır.

Teknik ayrıntılar `⋮` menüsünde ve ayarlarda tutulmalıdır.

Kullanıcı uygulamayı gördüğünde mümkün olduğunca hızlı şekilde:

**Gör → Bul → Başlat**

akışını gerçekleştirebilmelidir.

---

## 20. Sürüm Yaklaşımı

### NEXUS v1.0

- Frost Glass + Selen UI tabanlı arayüz
- Tema sistemi
- Başlangıçta 10 tema
- Uygulama ekleme
- EXE / BAT / CMD / PowerShell desteği
- Kategoriler
- Kategori oluşturma
- Arama
- Favoriler
- Son kullanılanlar
- Etiketler
- Özel ikon
- Uygulama açıklaması
- Versiyon bilgisi
- Çalışma parametreleri
- Çalışma klasörü
- Yönetici olarak çalıştır
- Başlat
- Kapat
- Yeniden başlat
- `⋮` bağlam menüsü
- Uygulama ayarları

### NEXUS v1.5 / İleri Sürüm

- Çalışma grupları
- Proje kartları
- Çoklu uygulama başlatma
- Hızlı Başlat / `Ctrl + Space`
- Uygulama kullanım istatistikleri
- Otomatik uygulama keşfi
- Sürükle-bırak ile uygulama ekleme

---

## 21. Teknik Tasarım Prensibi

NEXUS mümkün olduğunca hafif bir masaüstü uygulaması olarak tasarlanmalıdır.

Uygulama kayıtları merkezi bir yerel veri yapısında tutulmalıdır.

Örnek uygulama kaydı:

```json
{
  "name": "Antigravity",
  "category": "AI",
  "type": "exe",
  "path": "C:\Apps\Antigravity\Antigravity.exe",
  "arguments": "",
  "workingDirectory": "C:\Apps\Antigravity",
  "runAsAdmin": false,
  "version": "2.1.4",
  "description": "AI development environment",
  "icon": "antigravity.png",
  "favorite": true,
  "tags": ["AI", "Development"],
  "lastRun": "2026-09-22T14:32:00"
}
```

NEXUS uygulamaların kendisini değiştirmez. Kütüphanedeki kayıtlar uygulamaların mevcut yerel konumlarına referans verir.

---

## 22. Öncelik

Öncelik sırası:

1. Temiz ve premium arayüz
2. Hızlı uygulama başlatma
3. Kolay kategori ve uygulama yönetimi
4. `⋮` bağlam menüsü ile gelişmiş özelliklere erişim
5. Güçlü arama
6. Favoriler / son kullanılanlar
7. Çalışma grupları ve proje başlatma
8. Tema sistemi

Görsellik, işlevselliği desteklemeli; işlevselliğin önüne geçmemelidir.
