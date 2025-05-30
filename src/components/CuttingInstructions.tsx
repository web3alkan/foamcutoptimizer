'use client'

import { ArrowRight, ArrowDown, Clock, Scissors, CheckCircle, AlertCircle } from 'lucide-react'

interface CuttingInstructionsProps {
  cuttingInstructions: any
  algorithmData: any
}

export default function CuttingInstructions({ cuttingInstructions, algorithmData }: CuttingInstructionsProps) {
  if (!cuttingInstructions || !cuttingInstructions.instructions) {
    return null
  }

  const { instructions, summary } = cuttingInstructions

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}dk ${remainingSeconds}sn`
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl lg:rounded-3xl border border-white/20 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 px-4 sm:px-6 py-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
          ✂️ KESİM TALİMATLARI
        </h2>
        <p className="text-red-100 text-xs sm:text-sm mt-1">
          Adım adım basit kesim rehberi - Çocuk bile anlayacak kadar basit!
        </p>
      </div>

      {/* Ultra Basit Özet */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4">📋 NE YAPACAKSIN?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="text-3xl mb-2">📦</div>
              <div className="text-xl font-bold text-blue-600">{summary.totalBlocks}</div>
              <div className="text-sm text-blue-600">Blok Keseceksin</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="text-3xl mb-2">✂️</div>
              <div className="text-xl font-bold text-red-600">{summary.totalCuts}</div>
              <div className="text-sm text-red-600">Kez Keseceksin</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="text-3xl mb-2">⏰</div>
              <div className="text-xl font-bold text-green-600">{formatTime(summary.estimatedTotalTime)}</div>
              <div className="text-sm text-green-600">Sürecek</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-xl font-bold text-purple-600">KOLAY</div>
              <div className="text-sm text-purple-600">Sadece Düz Kes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Her Blok İçin Ultra Basit Talimatlar */}
      <div className="p-4 sm:p-6">
        <div className="space-y-8">
          {instructions.map((instruction: any, blockIndex: number) => (
            <div key={blockIndex} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-4 border-yellow-300">
              
              {/* Blok Başlığı - Çok Büyük ve Net */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  BLOK {instruction.blockNumber}
                </h3>
                <p className="text-lg text-gray-700">{instruction.stockLabel}</p>
                <div className="inline-flex items-center mt-4 px-6 py-3 bg-red-500 text-white rounded-full text-xl font-bold">
                  ✂️ {instruction.totalCuts} KEZ KESECEKSİN
                </div>
              </div>

              {/* Çok Basit Adımlar */}
              <div className="space-y-6">
                {instruction.steps.map((step: any, stepIndex: number) => (
                  <div key={stepIndex} className="bg-white rounded-2xl p-6 border-4 border-gray-300">
                    
                    {/* Adım Başlığı - Çok Büyük */}
                    <div className="text-center mb-6">
                      <div className="text-8xl mb-4">
                        {step.phase === 1 ? '↔️' : '↕️'}
                      </div>
                      <div className={`inline-flex items-center px-8 py-4 rounded-full text-white text-2xl font-bold ${
                        step.phase === 1 ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {step.phase === 1 ? 'ÖNCE YATAY KES' : 'SONRA DİKEY KES'}
                      </div>
                      <p className="text-lg text-gray-600 mt-3">
                        {step.phase === 1 ? 'Soldan sağa doğru çizgi çek' : 'Yukarıdan aşağıya çizgi çek'}
                      </p>
                    </div>

                    {/* Basit Kesim Kartları */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {step.cuts.map((cut: any, cutIndex: number) => (
                        <div key={cutIndex} className={`p-6 rounded-xl text-center border-4 transform hover:scale-105 transition-transform ${
                          cut.type === 'horizontal' 
                            ? 'bg-blue-100 border-blue-500' 
                            : 'bg-green-100 border-green-500'
                        }`}>
                          {/* Büyük Ok */}
                          <div className="text-6xl mb-4">
                            {cut.type === 'horizontal' ? '↔️' : '↕️'}
                          </div>
                          
                          {/* Kesim Yeri */}
                          <div className="text-3xl font-bold mb-3 text-gray-900">
                            {cut.position}cm
                          </div>
                          
                          {/* Basit Açıklama */}
                          <div className="text-lg font-medium text-gray-700 mb-2">
                            {cut.type === 'horizontal' ? 'Yatay Kesim' : 'Dikey Kesim'}
                          </div>
                          
                          {/* Sıra Numarası */}
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white text-xl font-bold ${
                            cut.type === 'horizontal' ? 'bg-blue-500' : 'bg-green-500'
                          }`}>
                            {cutIndex + 1}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Basit Hatırlatma */}
                    <div className="mt-6 bg-yellow-100 border-4 border-yellow-400 rounded-xl p-4 text-center">
                      <div className="text-2xl mb-2">⚠️</div>
                      <div className="text-lg font-bold text-yellow-800">
                        {step.phase === 1 ? 'TÜM YATAY KESİMLERİ BİTİR!' : 'TÜM DİKEY KESİMLERİ BİTİR!'}
                      </div>
                      <div className="text-sm text-yellow-700 mt-1">
                        {step.phase === 1 ? 'Sonra dikey kesimlere geç' : 'Bu blok tamamlandı!'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blok Özeti */}
              <div className="mt-8 bg-green-100 border-4 border-green-400 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">✅</div>
                <div className="text-2xl font-bold text-green-800 mb-2">
                  BLOK {instruction.blockNumber} TAMAMLANDı!
                </div>
                <div className="text-lg text-green-700">
                  ⏱️ Tahmini Süre: {formatTime(instruction.estimatedTime)}
                </div>
                <div className="text-base text-green-600 mt-2">
                  Toplam {instruction.totalCuts} kesim yaptın
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ultra Basit Genel Kurallar */}
        <div className="mt-8 bg-gradient-to-r from-red-100 to-pink-100 border-4 border-red-400 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h4 className="text-3xl font-bold text-red-800 mb-6">
              UNUTMA! ÖNEMLİ KURALLAR
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-5xl mb-3">1️⃣</div>
                <div className="text-xl font-bold text-red-700 mb-2">ÖNCE YATAY</div>
                <div className="text-base text-red-600">Tüm ↔️ kesimleri bitir</div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-5xl mb-3">2️⃣</div>
                <div className="text-xl font-bold text-red-700 mb-2">SONRA DİKEY</div>
                <div className="text-base text-red-600">Tüm ↕️ kesimleri bitir</div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-5xl mb-3">🎯</div>
                <div className="text-xl font-bold text-red-700 mb-2">SADECE DÜZ</div>
                <div className="text-base text-red-600">Bıçak düz gider, dönmez</div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-5xl mb-3">✋</div>
                <div className="text-xl font-bold text-red-700 mb-2">SIKICA TUT</div>
                <div className="text-base text-red-600">Parçalar hareket etmesin</div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-5xl mb-3">📏</div>
                <div className="text-xl font-bold text-red-700 mb-2">ÖLÇÜ KONTROL</div>
                <div className="text-base text-red-600">Keserken cm'leri kontrol et</div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-5xl mb-3">🐌</div>
                <div className="text-xl font-bold text-red-700 mb-2">YAVAŞ YAP</div>
                <div className="text-base text-red-600">Acele etme, dikkatli kes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Kutlama */}
        <div className="mt-8 bg-gradient-to-r from-green-100 to-blue-100 border-4 border-green-400 rounded-2xl p-8 text-center">
          <div className="text-8xl mb-4">🎉</div>
          <h4 className="text-4xl font-bold text-green-800 mb-4">
            TEBRIKLER!
          </h4>
          <p className="text-xl text-green-700 mb-2">
            Tüm kesimleri tamamladın!
          </p>
          <p className="text-lg text-green-600">
            Artık parçaların hazır ve kulıma uygun! 🎯
          </p>
        </div>
      </div>
    </div>
  )
} 