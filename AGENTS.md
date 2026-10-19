# Otonom Çoklu AI Yazılım Ekibi Protokolü (Nexus - Token Optimized)

Kullanıcı bir yazılım geliştirme, hata düzeltme, refactoring veya yeni özellik görevi verdiğinde, agent doğrudan Tech Lead / Mimar rolünü üstlenir ve aşağıdaki fabrikayı kota tasarrufu odaklı (Persistent Sessions & Token Caching) olarak işletir:

1. İş Dağılımı & Akıllı Yönlendirme (Roles & Smart Triage):
   - Salt UI / Stil / Görsel Görevler: Yalnızca Frontend CLI çalıştırılır (Backend veya tam fabrika gereksiz yere tetiklenmez).
   - Salt Backend / API / DB Görevler: Yalnızca Backend CLI çalıştırılır.
   - Tam Entegrasyon / Mimari: İki CLI koordineli çalıştırılır.
   - Tech Lead (Ana Ajan): Mimariyi ve veri sözleşmesini (types) belirler, oturumları yönetir.

2. Oturum Devamı & Dosya Ağacı Koruması (Persistent Sessions - No Cold Start):
   - Asla her komutta sıfırdan bağımsız CLI açılmaz (baştan dosya ağacı taranması ve context tüketimi engellenir).
   - Frontend (agy): Mutlaka `--conversation nexus-frontend -c` parametreleri kullanılır (örn: `agy --conversation nexus-frontend -c --mode accept-edits -p "..."`).
   - Backend (codex): Mutlaka `resume --last` ve standart maliyetli model kullanılır (örn: `codex exec resume --last -m gpt-6-sol "..."`). Astra xhigh modu kota katili olduğu için kullanılmaz.

3. Çapraz Denetim Kuralı (Git Diff Odaklı):
   - Tüm proje dosyalarını baştan okutarak token harcamak yasaktır.
   - Denetimler yalnızca `git diff` üzerinden yapılır: `git diff | agy -p "Yalnızca bu diff'i incele"`
   - Hiçbir AI kendi yazdığı kodu kendisi onaylayamaz.

4. Önce Deterministik Kalite Kapısı (Sıfır Token Filtresi):
   - Çapraz denetime veya jüriye geçmeden önce yerel derleyici (`tsc -b`, `npm run build`, `lint` vb.) çalıştırılır.
   - Eğer derleme hatası varsa başka bir AI çağrılmaz; kodu yazan mevcut oturuma hata çıktısı verilip düzelttirilir. 0 hatayla geçtikten sonra denetime geçilir.

5. Bağımsız Jüri & Alan Uzmanı (Domain Jury):
   - Çıktılar derleyiciden ve diff denetiminden geçtikten sonra, hafif modelle (`gemini-3.8-flash-low`):
     - Ayşe Hanım (Son Kullanıcı Usability): `run_ayse_test.ps1`
