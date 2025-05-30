'use client'

import { useState } from 'react'
import { BarChart3, Clock, TrendingUp, Award, Zap, Brain, Target, ChevronRight } from 'lucide-react'

interface AlgorithmDashboardProps {
  optimizationResult: any
}

export default function AlgorithmDashboard({ optimizationResult }: AlgorithmDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!optimizationResult || !optimizationResult.algorithmComparison) {
    return null
  }

  const { algorithmComparison, hybridAnalysis } = optimizationResult

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'comparison', label: 'Karşılaştırma', icon: TrendingUp },
    { id: 'convergence', label: 'Yakınsama', icon: Target },
    { id: 'performance', label: 'Performans', icon: Zap }
  ]

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Best Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <span className="text-xs sm:text-sm text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
              En İyi
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-green-800 mb-1">
            {algorithmComparison.bestAlgorithm}
          </div>
          <div className="text-sm text-green-600">
            {algorithmComparison.bestEfficiency?.toFixed(1)}% verimlilik
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-800 mb-1">
            {algorithmComparison.totalExecutionTime?.toFixed(1)}s
          </div>
          <div className="text-sm text-blue-600">Toplam süre</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-800 mb-1">
            {algorithmComparison.algorithms?.length || 0}
          </div>
          <div className="text-sm text-purple-600">Test edilen algoritma</div>
        </div>
      </div>

      {/* Quick Stats */}
      {hybridAnalysis && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 sm:p-6">
          <h4 className="font-bold text-orange-800 mb-3 flex items-center text-base sm:text-lg">
            <Zap className="w-5 h-5 mr-2" />
            Hibrit Analizi
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-orange-700">
                +{hybridAnalysis.improvement?.toFixed(1)}%
              </div>
              <div className="text-xs sm:text-sm text-orange-600">İyileştirme</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-orange-700">
                {hybridAnalysis.stages?.length || 0}
              </div>
              <div className="text-xs sm:text-sm text-orange-600">Aşama</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-orange-700">
                {hybridAnalysis.finalEfficiency?.toFixed(1)}%
              </div>
              <div className="text-xs sm:text-sm text-orange-600">Nihai verimlilik</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderComparison = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 sm:px-4 text-sm sm:text-base font-medium text-gray-600">Algoritma</th>
              <th className="text-center py-3 px-2 sm:px-4 text-sm sm:text-base font-medium text-gray-600">Verimlilik</th>
              <th className="text-center py-3 px-2 sm:px-4 text-sm sm:text-base font-medium text-gray-600">Süre</th>
              <th className="text-center py-3 px-2 sm:px-4 text-sm sm:text-base font-medium text-gray-600">Sıralama</th>
            </tr>
          </thead>
          <tbody>
            {algorithmComparison.algorithms?.map((algo: any, index: number) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-2 sm:px-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      algo.name === algorithmComparison.bestAlgorithm 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}></div>
                    <span className="font-medium text-sm sm:text-base">{algo.name}</span>
                  </div>
                </td>
                <td className="text-center py-3 px-2 sm:px-4">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-sm sm:text-base">{algo.efficiency?.toFixed(1)}%</span>
                    <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(algo.efficiency || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="text-center py-3 px-2 sm:px-4 text-sm sm:text-base">{algo.executionTime?.toFixed(2)}s</td>
                <td className="text-center py-3 px-2 sm:px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    #{index + 1}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderConvergence = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6">
        <h4 className="font-bold text-blue-800 mb-4 text-base sm:text-lg">Yakınsama Analizi</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {algorithmComparison.algorithms?.slice(0, 2).map((algo: any, index: number) => (
            <div key={index} className="bg-white rounded-xl p-4">
              <h5 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">{algo.name}</h5>
              {algo.convergenceData && algo.convergenceData.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                    <span>İterasyon sayısı</span>
                    <span>{algo.convergenceData.length}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                    <span>Son iyileştirme</span>
                    <span>#{algo.convergenceData.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (algo.efficiency || 0))}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-xs sm:text-sm">Yakınsama verisi mevcut değil</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPerformance = () => (
    <div className="space-y-4 sm:space-y-6">
      {hybridAnalysis && hybridAnalysis.stages && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 sm:p-6">
          <h4 className="font-bold text-purple-800 mb-4 text-base sm:text-lg">Hibrit Performans</h4>
          <div className="space-y-3">
            {hybridAnalysis.stages.map((stage: any, index: number) => (
              <div key={index} className="bg-white rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-bold text-xs sm:text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <span className="font-medium text-sm sm:text-base">{stage.algorithm}</span>
                      <div className="text-xs text-gray-500">{stage.executionTime?.toFixed(2)}s</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-purple-700 text-sm sm:text-base">
                      {stage.efficiency?.toFixed(1)}%
                    </span>
                    {stage.improvement && (
                      <div className="text-xs text-green-600">
                        +{stage.improvement.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-purple-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-purple-800 text-sm sm:text-base">Toplam İyileştirme</span>
              <span className="text-lg sm:text-xl font-bold text-purple-700">
                +{hybridAnalysis.improvement?.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-6">
        <h4 className="font-bold text-green-800 mb-4 text-base sm:text-lg">Öneriler</h4>
        <div className="space-y-3">
          <div className="flex items-start">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm sm:text-base text-green-700">
              {algorithmComparison.bestAlgorithm} algoritması en iyi sonucu verdi
            </span>
          </div>
          {hybridAnalysis && (
            <div className="flex items-start">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base text-green-700">
                Hibrit yaklaşım %{hybridAnalysis.improvement?.toFixed(1)} ek verimlilik sağladı
              </span>
            </div>
          )}
          <div className="flex items-start">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm sm:text-base text-green-700">
              Gelecek optimizasyonlar için {algorithmComparison.bestAlgorithm} tercih edilebilir
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl lg:rounded-3xl border border-white/20 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 sm:px-6 py-4">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Algoritma Performans Dashboard
        </h2>
        <p className="text-indigo-100 text-xs sm:text-sm mt-1">Detaylı analiz ve karşılaştırma</p>
      </div>

      {/* Mobile-Responsive Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'comparison' && renderComparison()}
        {activeTab === 'convergence' && renderConvergence()}
        {activeTab === 'performance' && renderPerformance()}
      </div>
    </div>
  )
} 