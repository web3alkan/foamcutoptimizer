import { GeneticAlgorithm } from './geneticAlgorithm'
import { SimulatedAnnealing } from './simulatedAnnealing'
import OptimizationEngine from './optimizationEngine'

interface FoamPiece {
  id: string
  length: number
  width: number
  height: number
  quantity: number
  label: string
  color?: string
}

interface StockFoam {
  id: string
  length: number
  width: number
  height: number
  quantity: number
  label: string
}

interface AlgorithmResult {
  name: string
  result: any
  executionTime: number
  efficiency: number
  waste: number
  convergenceData?: any[]
}

export class AdvancedOptimizationEngine {
  private pieces: FoamPiece[]
  private stockFoams: StockFoam[]

  constructor(pieces: FoamPiece[], stockFoams: StockFoam[]) {
    this.pieces = pieces
    this.stockFoams = stockFoams
  }

  async optimizeWithMultipleAlgorithms(algorithms: string[] = ['basic', 'genetic', 'annealing']): Promise<any> {
    console.log('🚀 Multi-Algorithm Optimization başlıyor...')
    console.log(`📊 Test edilecek algoritmalar: ${algorithms.join(', ')}`)
    
    const results: AlgorithmResult[] = []
    const startTime = Date.now()

    // Algoritmaları paralel çalıştır
    const promises = algorithms.map(async (algorithm) => {
      const algoStartTime = Date.now()
      
      try {
        let result
        let convergenceData = []

        switch (algorithm) {
          case 'basic':
            console.log('⚡ Basic Algorithm çalışıyor...')
            const basicEngine = new OptimizationEngine()
            result = await basicEngine.optimize(
              this.pieces.map(p => ({ ...p, length: p.length * 10, width: p.width * 10, height: p.height * 10 })),
              this.stockFoams.map(s => ({ ...s, length: s.length * 10, width: s.width * 10, height: s.height * 10 }))
            )
            break

          case 'genetic':
            console.log('🧬 Genetic Algorithm çalışıyor...')
            const geneticEngine = new GeneticAlgorithm(this.pieces, this.stockFoams)
            result = await geneticEngine.optimize()
            convergenceData = result.algorithmData?.convergenceData || []
            break

          case 'annealing':
            console.log('🔥 Simulated Annealing çalışıyor...')
            const annealingEngine = new SimulatedAnnealing(this.pieces, this.stockFoams)
            result = await annealingEngine.optimize()
            convergenceData = result.algorithmData?.coolingData || []
            break

          default:
            throw new Error(`Bilinmeyen algoritma: ${algorithm}`)
        }

        const executionTime = Date.now() - algoStartTime

        return {
          name: algorithm,
          result,
          executionTime,
          efficiency: result.efficiency,
          waste: result.totalWaste,
          convergenceData
        }
      } catch (error) {
        console.error(`❌ ${algorithm} algoritmasında hata:`, error)
        return {
          name: algorithm,
          result: null,
          executionTime: Date.now() - algoStartTime,
          efficiency: 0,
          waste: 100,
          error: (error as Error).message
        }
      }
    })

    // Tüm algoritmaların tamamlanmasını bekle
    const algorithmResults = await Promise.all(promises)
    results.push(...algorithmResults.filter(r => r.result !== null))

    const totalTime = Date.now() - startTime

    // En iyi sonucu bul
    const bestResult = results.reduce((best, current) => 
      current.efficiency > best.efficiency ? current : best
    )

    // Sonuçları karşılaştır
    const comparison = this.generateComparison(results)

    console.log('🏆 Multi-Algorithm Optimization tamamlandı!')
    console.log(`⏱️ Toplam süre: ${totalTime}ms`)
    console.log(`🥇 En iyi algoritma: ${bestResult.name} (${bestResult.efficiency.toFixed(1)}% verimlilik)`)

    return {
      ...bestResult.result,
      algorithmComparison: {
        totalExecutionTime: totalTime,
        bestAlgorithm: bestResult.name,
        results: results.map(r => ({
          name: r.name,
          efficiency: r.efficiency,
          waste: r.waste,
          executionTime: r.executionTime,
          rank: results.sort((a, b) => b.efficiency - a.efficiency).findIndex(sorted => sorted.name === r.name) + 1
        })),
        comparison,
        convergenceAnalysis: this.analyzeConvergence(results)
      }
    }
  }

  async optimizeWithHybridApproach(): Promise<any> {
    console.log('🔬 Hybrid Optimization başlıyor...')
    
    // 1. Aşama: Hızlı başlangıç için Basic Algorithm
    console.log('⚡ 1. Aşama: Basic Algorithm ile hızlı başlangıç...')
    const basicEngine = new OptimizationEngine()
    const basicResult = await basicEngine.optimize(
      this.pieces.map(p => ({ ...p, length: p.length * 10, width: p.width * 10, height: p.height * 10 })),
      this.stockFoams.map(s => ({ ...s, length: s.length * 10, width: s.width * 10, height: s.height * 10 }))
    )

    // 2. Aşama: Genetic Algorithm ile iyileştirme
    console.log('🧬 2. Aşama: Genetic Algorithm ile iyileştirme...')
    const geneticEngine = new GeneticAlgorithm(this.pieces, this.stockFoams)
    const geneticResult = await geneticEngine.optimize()

    // 3. Aşama: En iyi sonucu Simulated Annealing ile rafine etme
    console.log('🔥 3. Aşama: Simulated Annealing ile rafine etme...')
    const annealingEngine = new SimulatedAnnealing(this.pieces, this.stockFoams)
    const annealingResult = await annealingEngine.optimize()

    // En iyi sonucu seç
    const results = [
      { name: 'basic', ...basicResult },
      { name: 'genetic', ...geneticResult },
      { name: 'annealing', ...annealingResult }
    ]

    const bestResult = results.reduce((best, current) => 
      current.efficiency > best.efficiency ? current : best
    )

    console.log('🏆 Hybrid Optimization tamamlandı!')
    console.log(`🥇 En iyi sonuç: ${bestResult.name} (${bestResult.efficiency.toFixed(1)}% verimlilik)`)

    return {
      ...bestResult,
      hybridAnalysis: {
        stages: [
          { stage: 1, algorithm: 'basic', efficiency: basicResult.efficiency },
          { stage: 2, algorithm: 'genetic', efficiency: geneticResult.efficiency },
          { stage: 3, algorithm: 'annealing', efficiency: annealingResult.efficiency }
        ],
        improvement: bestResult.efficiency - basicResult.efficiency,
        bestAlgorithm: bestResult.name
      }
    }
  }

  async optimizeWithAdaptiveParameters(): Promise<any> {
    console.log('🎯 Adaptive Parameter Optimization başlıyor...')
    
    // Problem büyüklüğüne göre parametreleri ayarla
    const pieceCount = this.pieces.reduce((sum, p) => sum + p.quantity, 0)
    const stockCount = this.stockFoams.length
    const complexity = pieceCount * stockCount

    console.log(`📊 Problem analizi: ${pieceCount} parça, ${stockCount} stok, karmaşıklık: ${complexity}`)

    // Küçük problemler için hızlı algoritmalar
    if (complexity < 50) {
      console.log('🏃‍♂️ Küçük problem: Basic + Annealing kombinasyonu')
      return this.runBasicWithAnnealing()
    }
    // Orta problemler için dengeli yaklaşım
    else if (complexity < 200) {
      console.log('⚖️ Orta problem: Genetic + Annealing kombinasyonu')
      return this.runGeneticWithAnnealing()
    }
    // Büyük problemler için güçlü algoritmalar
    else {
      console.log('🦾 Büyük problem: Tüm algoritmalar + paralel işleme')
      return this.optimizeWithMultipleAlgorithms(['genetic', 'annealing'])
    }
  }

  private async runBasicWithAnnealing(): Promise<any> {
    const basicEngine = new OptimizationEngine()
    const basicResult = await basicEngine.optimize(
      this.pieces.map(p => ({ ...p, length: p.length * 10, width: p.width * 10, height: p.height * 10 })),
      this.stockFoams.map(s => ({ ...s, length: s.length * 10, width: s.width * 10, height: s.height * 10 }))
    )

    const annealingEngine = new SimulatedAnnealing(this.pieces, this.stockFoams)
    const annealingResult = await annealingEngine.optimize()

    return annealingResult.efficiency > basicResult.efficiency ? annealingResult : basicResult
  }

  private async runGeneticWithAnnealing(): Promise<any> {
    const geneticEngine = new GeneticAlgorithm(this.pieces, this.stockFoams)
    const geneticResult = await geneticEngine.optimize()

    const annealingEngine = new SimulatedAnnealing(this.pieces, this.stockFoams)
    const annealingResult = await annealingEngine.optimize()

    return annealingResult.efficiency > geneticResult.efficiency ? annealingResult : geneticResult
  }

  private generateComparison(results: AlgorithmResult[]): any {
    const sortedResults = [...results].sort((a, b) => b.efficiency - a.efficiency)
    
    return {
      ranking: sortedResults.map((result, index) => ({
        rank: index + 1,
        algorithm: result.name,
        efficiency: result.efficiency,
        waste: result.waste,
        executionTime: result.executionTime,
        score: this.calculateOverallScore(result)
      })),
      analysis: {
        bestEfficiency: Math.max(...results.map(r => r.efficiency)),
        worstEfficiency: Math.min(...results.map(r => r.efficiency)),
        avgEfficiency: results.reduce((sum, r) => sum + r.efficiency, 0) / results.length,
        fastestTime: Math.min(...results.map(r => r.executionTime)),
        slowestTime: Math.max(...results.map(r => r.executionTime)),
        avgTime: results.reduce((sum, r) => sum + r.executionTime, 0) / results.length
      }
    }
  }

  private calculateOverallScore(result: AlgorithmResult): number {
    // Verimlilik %70, hız %30 ağırlıklı skor
    const efficiencyScore = result.efficiency / 100
    const speedScore = 1 - (result.executionTime / 10000) // 10 saniye max varsayımı
    return (efficiencyScore * 0.7 + Math.max(0, speedScore) * 0.3) * 100
  }

  private analyzeConvergence(results: AlgorithmResult[]): any {
    const convergenceAnalysis: any = {}
    
    results.forEach(result => {
      if (result.convergenceData && result.convergenceData.length > 0) {
        const data = result.convergenceData
        const finalEfficiency = data[data.length - 1].efficiency || data[data.length - 1].bestFitness * 100
        const initialEfficiency = data[0].efficiency || data[0].bestFitness * 100
        
        convergenceAnalysis[result.name] = {
          totalImprovement: finalEfficiency - initialEfficiency,
          convergenceSpeed: this.calculateConvergenceSpeed(data),
          stabilityPoint: this.findStabilityPoint(data),
          iterations: data.length
        }
      }
    })
    
    return convergenceAnalysis
  }

  private calculateConvergenceSpeed(data: any[]): number {
    if (data.length < 2) return 0
    
    let improvements = 0
    for (let i = 1; i < data.length; i++) {
      const current = data[i].efficiency || data[i].bestFitness * 100
      const previous = data[i-1].efficiency || data[i-1].bestFitness * 100
      if (current > previous) improvements++
    }
    
    return improvements / (data.length - 1)
  }

  private findStabilityPoint(data: any[]): number {
    if (data.length < 10) return data.length
    
    const windowSize = 5
    for (let i = windowSize; i < data.length; i++) {
      const window = data.slice(i - windowSize, i)
      const efficiency = window.map(d => d.efficiency || d.bestFitness * 100)
      const variance = this.calculateVariance(efficiency)
      
      if (variance < 0.1) { // %0.1'den az değişim
        return i - windowSize
      }
    }
    
    return data.length
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  }
} 