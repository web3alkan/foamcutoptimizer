# Sünger Kesim Optimizasyonu - Ekran Görüntüleri

## Ana Arayüz

Uygulama şu bileşenlerden oluşur:

### Sol Panel (Giriş ve Yönetim)
1. **Parça Ekleme Formu**
   - Parça adı
   - Boyutlar (Uzunluk × Genişlik × Yükseklik)
   - Adet

2. **Parça Listesi**
   - Eklenen parçaların listesi
   - Silme işlevi
   - Demo veri yükleme butonu

3. **Stok Yönetimi**
   - Stok sünger tanımlama
   - Boyut ve fiyat bilgileri
   - Düzenleme/silme işlevleri

4. **İstatistikler**
   - Toplam parça sayısı
   - Toplam hacim
   - Stok maliyeti
   - Optimizasyon sonuçları

### Sağ Panel (3D Görselleştirme)
1. **3D Sahne**
   - Three.js ile interaktif 3D görünüm
   - Stok süngerler (saydam kahverengi)
   - Kesim parçaları (renkli)
   - Orbit kontrolü (zoom, rotate, pan)

2. **Optimizasyon Sonuçları**
   - Kullanılan stok sayısı
   - Verimlilik yüzdesi
   - Toplam maliyet

## Kullanım Akışı

1. **Demo Veri Yükleme**: Hızlı test için örnek veriler
2. **Parça Ekleme**: Manuel parça tanımlama
3. **Stok Ayarlama**: Stok sünger boyutları
4. **Optimizasyon**: "Optimizasyonu Hesapla" butonu
5. **Görselleştirme**: 3D sonuçları inceleme

## Teknik Özellikler

- **Responsive Design**: Mobile-friendly arayüz
- **Real-time 3D**: Anında görselleştirme
- **Advanced Algorithm**: 3D Bin Packing
- **TypeScript**: Type-safe development
- **Modern UI**: Tailwind CSS ile şık tasarım

## Demo Veriler

Örnek mobilya parçaları:
- Koltuk Yastığı: 300×200×50mm × 4
- Sırt Desteği: 400×150×80mm × 2
- Oturma Minderi: 250×250×30mm × 6
- Kol Desteği: 150×100×100mm × 8
- Uzun Şerit: 500×80×40mm × 3
- Kare Parça: 200×200×60mm × 2 