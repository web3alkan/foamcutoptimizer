# 🧽 Sünger Kesim Optimizasyonu

**CutList Optimizer** benzeri, fakat **3D sünger kesimi** için özel olarak tasarlanmış, sade ve kullanıcı dostu web uygulaması.

## ✨ Özellikler

- **Sade Tasarım**: Temiz, anlaşılır arayüz
- **Ham Malzeme Yönetimi**: Büyük blok tanımlama
- **Parça Yönetimi**: Küçük blok girişi
- **3D Optimizasyon**: Gerçek 3D bin packing algoritması
- **Minimum İsraf**: En az atık ile yerleştirme
- **Anlık Sonuçlar**: Hızlı hesaplama ve görselleştirme

## 🎯 Kullanım

### 1. Ham Malzeme (Büyük Bloklar)
- **Ölçüler**: Uzunluk × Genişlik × Kalınlık (mm)
- **Adet**: Kaç tane büyük blok var
- **Fiyat**: Malzeme maliyeti (opsiyonel)

### 2. Kesilecek Parçalar (Küçük Bloklar) 
- **Ölçüler**: İstenen parça boyutları (mm)
- **Adet**: Her parçadan kaç tane
- **Etiket**: Parça tanımı

### 3. Optimizasyon
- **Hesapla**: Tek tıkla optimum yerleştirme
- **Sonuçlar**: Verimlilik, israf oranı, kullanılan blok sayısı
- **3D Görünüm**: İnteraktif görselleştirme

## 🚀 Kurulum

```bash
# Projeyi klonlayın
git clone [repository-url]
cd foam-cut-optimizer

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışmaya başlayacak.

## 🛠️ Teknolojiler

- **Next.js 14** - React framework
- **TypeScript** - Type-safe development  
- **Tailwind CSS** - Utility-first CSS
- **Three.js** - 3D graphics
- **Lucide React** - Modern icons

## 📋 Örnek Kullanım

### Ham Malzeme Örneği
```
Sünger Blok: 2000×1000×200mm × 3 adet
Fiyat: ₺350/adet
```

### Parça Örneği
```
Koltuk Yastığı: 600×400×100mm × 4 adet
Sırt Minderi: 800×300×80mm × 2 adet  
Kol Desteği: 300×200×100mm × 8 adet
```

### Optimizasyon Sonucu
```
✅ 2 blok kullanıldı (3 bloktan)
✅ %85.4 verimlilik
✅ %14.6 israf
💰 ₺700 toplam maliyet
```

## 🎨 Arayüz

### Sol Panel
1. **Ham Malzeme Girişi** - Orange theme
2. **Parça Girişi** - Blue theme  
3. **Hesaplama Butonu** - Green

### Sağ Panel
1. **İstatistik Kartları** - Parça sayısı, hacim
2. **Optimizasyon Sonuçları** - Blok, verimlilik, israf
3. **3D Görselleştirme** - İnteraktif sahne

## 📊 CutList Optimizer Karşılaştırması

| Özellik | CutList Optimizer | Foam Cut Optimizer |
|---------|------------------|-------------------|
| **Boyut** | 2D (X×Y) | **3D (X×Y×Z)** |
| **Malzeme** | Panel/Tahta | **Sünger/Foam** |
| **Arayüz** | Tablo bazlı | **Kart bazlı** |
| **Görselleştirme** | 2D Layout | **3D İnteraktif** |
| **Optimizasyon** | 2D Nesting | **3D Bin Packing** |

## 📝 Lisans

MIT License - Açık kaynak
