'use client'

import { useState } from 'react'
import { BarChart, Activity, Zap, TrendingUp, Clock, Trophy, Target } from 'lucide-react'

interface AlgorithmDashboardProps {
  optimizationResult: any
}

export default function AlgorithmDashboard({ optimizationResult }: AlgorithmDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!optimizationResult?.algorithmComparison) {
    return null
  }

  const { algorithmComparison } = optimizationResult

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart },
    { id: 'comparison', label: 'Karşılaştırma', icon: Trophy },
    { id: 'convergence', label: 'Yakınsama', icon: TrendingUp },
    { id: 'performance', label: 'Performans', icon: Zap }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg mt-6">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="font-semibold text-gray-900 flex items-center">
          <Activity className="w-5 h-5 text-indigo-500 mr-2" />
          Algoritma Performans Analizi
        </h2>
        <p className="text-sm text-gray-600 mt-1">Gelişmiş optimizasyon algoritmaları karşılaştırması</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">En İyi Algoritma</p>
                    <p className="text-2xl font-bold text-green-900">{algorithmComparison.bestAlgorithm}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Toplam Süre</p>
                    <p className="text-2xl font-bold text-blue-900">{(algorithmComparison.totalExecutionTime / 1000).toFixed(1)}s</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Test Edilen Algoritma</p>
                    <p className="text-2xl font-bold text-purple-900">{algorithmComparison.results.length}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Best Results Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">🏆 En İyi Sonuç Özeti</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Verimlilik</p>
                  <p className="text-xl font-bold text-green-600">{optimizationResult.efficiency.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">İsraf</p>
                  <p className="text-xl font-bold text-red-600">{optimizationResult.totalWaste.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Kullanılan Blok</p>
                  <p className="text-xl font-bold text-blue-600">{optimizationResult.layouts.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Algoritma Türü</p>
                  <p className="text-lg font-medium text-indigo-600">{algorithmComparison.bestAlgorithm}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div>
            <h3 className="font-medium text-gray-900 mb-4">📊 Algoritma Karşılaştırması</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıra</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Algoritma</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verimlilik</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İsraf</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Süre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {algorithmComparison.comparison.ranking.map((algo: any, index: number) => (
                    <tr key={algo.algorithm} className={index === 0 ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && <Trophy className="w-4 h-4 text-yellow-500 mr-2" />}
                          <span className="text-sm font-medium text-gray-900">#{algo.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          algo.algorithm === 'genetic' ? 'bg-blue-100 text-blue-800' :
                          algo.algorithm === 'annealing' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {algo.algorithm === 'genetic' ? '🧬 Genetik' :
                           algo.algorithm === 'annealing' ? '🔥 Tavlama' :
                           algo.algorithm === 'basic' ? '⚡ Temel' :
                           algo.algorithm}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{width: `${algo.efficiency}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{algo.efficiency.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{algo.waste.toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{algo.executionTime}ms</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{algo.score.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Analysis Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📈 Verimlilik Analizi</h4>
                <div className="space-y-1 text-sm">
                  <p>En İyi: <span className="font-medium">{algorithmComparison.comparison.analysis.bestEfficiency.toFixed(1)}%</span></p>
                  <p>Ortalama: <span className="font-medium">{algorithmComparison.comparison.analysis.avgEfficiency.toFixed(1)}%</span></p>
                  <p>En Düşük: <span className="font-medium">{algorithmComparison.comparison.analysis.worstEfficiency.toFixed(1)}%</span></p>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">⏱️ Süre Analizi</h4>
                <div className="space-y-1 text-sm">
                  <p>En Hızlı: <span className="font-medium">{algorithmComparison.comparison.analysis.fastestTime}ms</span></p>
                  <p>Ortalama: <span className="font-medium">{algorithmComparison.comparison.analysis.avgTime.toFixed(0)}ms</span></p>
                  <p>En Yavaş: <span className="font-medium">{algorithmComparison.comparison.analysis.slowestTime}ms</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'convergence' && (
          <div>
            <h3 className="font-medium text-gray-900 mb-4">📈 Yakınsama Analizi</h3>
            {algorithmComparison.convergenceAnalysis && Object.keys(algorithmComparison.convergenceAnalysis).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(algorithmComparison.convergenceAnalysis).map(([algorithm, data]: [string, any]) => (
                  <div key={algorithm} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {algorithm === 'genetic' ? '🧬 Genetik Algoritma' :
                       algorithm === 'annealing' ? '🔥 Simulated Annealing' :
                       algorithm}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Toplam İyileştirme</p>
                        <p className="text-lg font-medium text-green-600">+{data.totalImprovement.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Yakınsama Hızı</p>
                        <p className="text-lg font-medium text-blue-600">{(data.convergenceSpeed * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kararlılık Noktası</p>
                        <p className="text-lg font-medium text-purple-600">{data.stabilityPoint}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Toplam İterasyon</p>
                        <p className="text-lg font-medium text-gray-600">{data.iterations}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Yakınsama verisi mevcut değil</p>
                <p className="text-sm">Bu analiz sadece iteratif algoritmalarda (Genetic, Annealing) kullanılabilir</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div>
            <h3 className="font-medium text-gray-900 mb-4">⚡ Performans Metrikleri</h3>
            
            {/* Hybrid Analysis */}
            {optimizationResult.hybridAnalysis && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-purple-900 mb-3">🔬 Hibrit Analizi</h4>
                <div className="space-y-3">
                  {optimizationResult.hybridAnalysis.stages.map((stage: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded">
                      <span className="font-medium">Aşama {stage.stage}: {stage.algorithm}</span>
                      <span className="text-lg font-bold text-purple-600">{stage.efficiency.toFixed(1)}%</span>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-700">Toplam İyileştirme:</span>
                      <span className="text-xl font-bold text-green-600">+{optimizationResult.hybridAnalysis.improvement.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Recommendations */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">💡 Performans Önerileri</h4>
              <div className="space-y-2 text-sm">
                {algorithmComparison.comparison.analysis.bestEfficiency > 90 && (
                  <p className="text-green-700">✅ Mükemmel verimlilik! Bu ayarları kaydedin.</p>
                )}
                {algorithmComparison.comparison.analysis.bestEfficiency < 70 && (
                  <p className="text-orange-700">⚠️ Parça boyutlarını gözden geçirin, daha küçük parçalar deneyin.</p>
                )}
                {algorithmComparison.comparison.analysis.avgTime > 5000 && (
                  <p className="text-red-700">🐌 Uzun hesaplama süresi. Basit algoritma ile ön teste yapın.</p>
                )}
                {algorithmComparison.comparison.analysis.fastestTime < 1000 && (
                  <p className="text-blue-700">🚀 Hızlı sonuçlar! Daha büyük problemler için ideal.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 