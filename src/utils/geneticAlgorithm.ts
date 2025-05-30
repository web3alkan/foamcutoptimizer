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

interface Gene {
  pieceId: string
  stockId: string
  x: number
  y: number
  z: number
  rotation: number // 0-7 rotasyon
}

interface Individual {
  genes: Gene[]
  fitness: number
  efficiency: number
  waste: number
}

export class GeneticAlgorithm {
  private populationSize: number = 50
  private generations: number = 100
  private mutationRate: number = 0.1
  private crossoverRate: number = 0.8
  private elitismRate: number = 0.2
  
  private pieces: FoamPiece[]
  private stockFoams: StockFoam[]
  private expandedPieces: FoamPiece[]

  constructor(pieces: FoamPiece[], stockFoams: StockFoam[]) {
    this.pieces = pieces
    this.stockFoams = stockFoams
    this.expandedPieces = this.expandPieces(pieces)
  }

  async optimize(): Promise<any> {
    console.log('🧬 Genetic Algorithm başlıyor...')
    
    // İlk popülasyon oluştur
    let population = this.createInitialPopulation()
    
    // Fitness hesapla
    population = this.evaluatePopulation(population)
    
    let bestIndividual = this.getBestIndividual(population)
    let generationData = []

    for (let generation = 0; generation < this.generations; generation++) {
      // Seçim, çaprazlama, mutasyon
      population = this.evolvePopulation(population)
      population = this.evaluatePopulation(population)
      
      const currentBest = this.getBestIndividual(population)
      if (currentBest.fitness > bestIndividual.fitness) {
        bestIndividual = currentBest
        console.log(`🎯 Gen ${generation}: Yeni en iyi fitness = ${currentBest.fitness.toFixed(3)}`)
      }

      // Nesil verilerini kaydet
      generationData.push({
        generation,
        bestFitness: currentBest.fitness,
        avgFitness: population.reduce((sum, ind) => sum + ind.fitness, 0) / population.length,
        efficiency: currentBest.efficiency,
        waste: currentBest.waste
      })

      // Erken durdurma: 20 nesil boyunca iyileşme yoksa
      if (generation > 20) {
        const recentBest = generationData.slice(-20).map(g => g.bestFitness)
        const improvement = Math.max(...recentBest) - Math.min(...recentBest)
        if (improvement < 0.001) {
          console.log(`⚡ Erken durdurma: Gen ${generation}`)
          break
        }
      }
    }

    console.log(`🏆 En iyi çözüm: Verimlilik = ${bestIndividual.efficiency.toFixed(1)}%`)
    
    return {
      layouts: this.genesToLayouts(bestIndividual.genes),
      efficiency: bestIndividual.efficiency,
      totalWaste: bestIndividual.waste,
      totalCost: 0,
      algorithmData: {
        type: 'genetic',
        generations: generationData.length,
        finalPopulation: population.length,
        convergenceData: generationData
      }
    }
  }

  private createInitialPopulation(): Individual[] {
    const population: Individual[] = []
    
    for (let i = 0; i < this.populationSize; i++) {
      const individual: Individual = {
        genes: [],
        fitness: 0,
        efficiency: 0,
        waste: 0
      }

      // Her parça için rastgele yerleştirme
      for (const piece of this.expandedPieces) {
        const stockIndex = Math.floor(Math.random() * this.stockFoams.length)
        const stock = this.stockFoams[stockIndex]
        
        const gene: Gene = {
          pieceId: piece.id,
          stockId: stock.id,
          x: Math.random() * (stock.length - piece.length),
          y: Math.random() * (stock.width - piece.width),
          z: Math.random() * (stock.height - piece.height),
          rotation: Math.floor(Math.random() * 8)
        }
        
        individual.genes.push(gene)
      }
      
      population.push(individual)
    }
    
    return population
  }

  private evaluatePopulation(population: Individual[]): Individual[] {
    return population.map(individual => {
      const layouts = this.genesToLayouts(individual.genes)
      const metrics = this.calculateMetrics(layouts)
      
      individual.efficiency = metrics.efficiency
      individual.waste = metrics.waste
      individual.fitness = this.calculateFitness(metrics)
      
      return individual
    })
  }

  private calculateFitness(metrics: any): number {
    // Multi-objective fitness function
    const efficiencyWeight = 0.7
    const wasteWeight = 0.2
    const feasibilityWeight = 0.1
    
    const efficiencyScore = metrics.efficiency / 100
    const wasteScore = 1 - (metrics.waste / 100)
    const feasibilityScore = metrics.feasible ? 1 : 0
    
    return (
      efficiencyWeight * efficiencyScore +
      wasteWeight * wasteScore +
      feasibilityWeight * feasibilityScore
    )
  }

  private evolvePopulation(population: Individual[]): Individual[] {
    const newPopulation: Individual[] = []
    
    // Elitism - en iyi bireyleri koru
    const eliteCount = Math.floor(this.populationSize * this.elitismRate)
    const sortedPop = population.sort((a, b) => b.fitness - a.fitness)
    newPopulation.push(...sortedPop.slice(0, eliteCount))
    
    // Kalan popülasyonu oluştur
    while (newPopulation.length < this.populationSize) {
      // Tournament selection
      const parent1 = this.tournamentSelection(population)
      const parent2 = this.tournamentSelection(population)
      
      let offspring1, offspring2
      
      if (Math.random() < this.crossoverRate) {
        [offspring1, offspring2] = this.crossover(parent1, parent2)
      } else {
        offspring1 = { ...parent1 }
        offspring2 = { ...parent2 }
      }
      
      // Mutasyon
      if (Math.random() < this.mutationRate) {
        offspring1 = this.mutate(offspring1)
      }
      if (Math.random() < this.mutationRate) {
        offspring2 = this.mutate(offspring2)
      }
      
      newPopulation.push(offspring1)
      if (newPopulation.length < this.populationSize) {
        newPopulation.push(offspring2)
      }
    }
    
    return newPopulation
  }

  private tournamentSelection(population: Individual[]): Individual {
    const tournamentSize = 5
    const tournament: Individual[] = []
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length)
      tournament.push(population[randomIndex])
    }
    
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    )
  }

  private crossover(parent1: Individual, parent2: Individual): [Individual, Individual] {
    const offspring1: Individual = { genes: [], fitness: 0, efficiency: 0, waste: 0 }
    const offspring2: Individual = { genes: [], fitness: 0, efficiency: 0, waste: 0 }
    
    // Single-point crossover
    const crossoverPoint = Math.floor(Math.random() * parent1.genes.length)
    
    offspring1.genes = [
      ...parent1.genes.slice(0, crossoverPoint),
      ...parent2.genes.slice(crossoverPoint)
    ]
    
    offspring2.genes = [
      ...parent2.genes.slice(0, crossoverPoint),
      ...parent1.genes.slice(crossoverPoint)
    ]
    
    return [offspring1, offspring2]
  }

  private mutate(individual: Individual): Individual {
    const mutated = { ...individual, genes: [...individual.genes] }
    
    // Rastgele bir gen seç ve mutasyona uğrat
    const geneIndex = Math.floor(Math.random() * mutated.genes.length)
    const gene = { ...mutated.genes[geneIndex] }
    const stock = this.stockFoams.find(s => s.id === gene.stockId)
    
    if (stock) {
      const piece = this.expandedPieces.find(p => p.id === gene.pieceId)
      if (piece) {
        // %50 şansla pozisyon, %50 şansla rotasyon mutasyonu
        if (Math.random() < 0.5) {
          // Pozisyon mutasyonu
          gene.x = Math.max(0, Math.min(stock.length - piece.length, gene.x + (Math.random() - 0.5) * 20))
          gene.y = Math.max(0, Math.min(stock.width - piece.width, gene.y + (Math.random() - 0.5) * 20))
          gene.z = Math.max(0, Math.min(stock.height - piece.height, gene.z + (Math.random() - 0.5) * 20))
        } else {
          // Rotasyon mutasyonu
          gene.rotation = Math.floor(Math.random() * 8)
        }
      }
    }
    
    mutated.genes[geneIndex] = gene
    return mutated
  }

  private getBestIndividual(population: Individual[]): Individual {
    return population.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    )
  }

  private genesToLayouts(genes: Gene[]): any[] {
    // Genleri layout formatına çevir
    const layoutMap = new Map()
    
    genes.forEach(gene => {
      if (!layoutMap.has(gene.stockId)) {
        layoutMap.set(gene.stockId, {
          stockId: gene.stockId,
          pieces: [],
          utilization: 0
        })
      }
      
      layoutMap.get(gene.stockId).pieces.push({
        pieceId: gene.pieceId,
        x: gene.x * 10, // CM'den MM'ye
        y: gene.y * 10,
        z: gene.z * 10,
        rotated: gene.rotation > 0
      })
    })
    
    return Array.from(layoutMap.values()).map(layout => {
      const stock = this.stockFoams.find(s => s.id === layout.stockId)
      if (stock) {
        const totalStockVolume = stock.length * stock.width * stock.height
        const usedVolume = layout.pieces.reduce((sum: number, piece: any) => {
          const originalPiece = this.expandedPieces.find(p => p.id === piece.pieceId)
          return sum + (originalPiece ? originalPiece.length * originalPiece.width * originalPiece.height : 0)
        }, 0)
        layout.utilization = (usedVolume / totalStockVolume) * 100
      }
      return layout
    })
  }

  private calculateMetrics(layouts: any[]): any {
    let totalUsedVolume = 0
    let totalStockVolume = 0
    let feasible = true
    
    layouts.forEach(layout => {
      const stock = this.stockFoams.find(s => s.id === layout.stockId)
      if (stock) {
        const stockVolume = stock.length * stock.width * stock.height
        totalStockVolume += stockVolume
        totalUsedVolume += (stockVolume * layout.utilization) / 100
        
        // Çakışma kontrolü (basitleştirilmiş)
        if (layout.pieces.length > 0) {
          const overlaps = this.checkOverlaps(layout.pieces)
          if (overlaps > 0) feasible = false
        }
      }
    })
    
    const efficiency = totalStockVolume > 0 ? (totalUsedVolume / totalStockVolume) * 100 : 0
    const waste = 100 - efficiency
    
    return { efficiency, waste, feasible }
  }

  private checkOverlaps(pieces: any[]): number {
    let overlapCount = 0
    
    for (let i = 0; i < pieces.length; i++) {
      for (let j = i + 1; j < pieces.length; j++) {
        const piece1 = pieces[i]
        const piece2 = pieces[j]
        
        const p1 = this.expandedPieces.find(p => p.id === piece1.pieceId)
        const p2 = this.expandedPieces.find(p => p.id === piece2.pieceId)
        
        if (p1 && p2) {
          const overlap = this.isOverlapping(
            piece1.x/10, piece1.y/10, piece1.z/10, p1.length, p1.width, p1.height,
            piece2.x/10, piece2.y/10, piece2.z/10, p2.length, p2.width, p2.height
          )
          if (overlap) overlapCount++
        }
      }
    }
    
    return overlapCount
  }

  private isOverlapping(
    x1: number, y1: number, z1: number, l1: number, w1: number, h1: number,
    x2: number, y2: number, z2: number, l2: number, w2: number, h2: number
  ): boolean {
    return !(x1 >= x2 + l2 || x2 >= x1 + l1 ||
             y1 >= y2 + w2 || y2 >= y1 + w1 ||
             z1 >= z2 + h2 || z2 >= z1 + h1)
  }

  private expandPieces(pieces: FoamPiece[]): FoamPiece[] {
    const expanded: FoamPiece[] = []
    
    pieces.forEach(piece => {
      for (let i = 0; i < piece.quantity; i++) {
        expanded.push({
          ...piece,
          id: `${piece.id}_${i}`,
          quantity: 1
        })
      }
    })

    return expanded
  }
} 