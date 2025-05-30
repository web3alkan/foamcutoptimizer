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

interface Solution {
  placements: Array<{
    pieceId: string
    stockId: string
    x: number
    y: number
    z: number
    rotation: number
  }>
  energy: number
  efficiency: number
  waste: number
}

export class SimulatedAnnealing {
  private initialTemperature: number = 1000
  private finalTemperature: number = 1
  private coolingRate: number = 0.99
  private maxIterations: number = 10000
  
  private pieces: FoamPiece[]
  private stockFoams: StockFoam[]
  private expandedPieces: FoamPiece[]

  constructor(pieces: FoamPiece[], stockFoams: StockFoam[]) {
    this.pieces = pieces
    this.stockFoams = stockFoams
    this.expandedPieces = this.expandPieces(pieces)
  }

  async optimize(): Promise<any> {
    console.log('🔥 Simulated Annealing başlıyor...')
    
    // İlk çözüm oluştur
    let currentSolution = this.generateInitialSolution()
    let bestSolution = { ...currentSolution }
    
    let temperature = this.initialTemperature
    let iteration = 0
    let acceptedMoves = 0
    let rejectedMoves = 0
    
    const coolingData = []

    while (temperature > this.finalTemperature && iteration < this.maxIterations) {
      // Komşu çözüm oluştur
      const neighborSolution = this.generateNeighbor(currentSolution)
      
      // Enerji farkını hesapla (düşük enerji = iyi çözüm)
      const deltaE = neighborSolution.energy - currentSolution.energy
      
      // Kabul etme kararı
      const acceptanceProbability = deltaE < 0 ? 1 : Math.exp(-deltaE / temperature)
      
      if (Math.random() < acceptanceProbability) {
        currentSolution = neighborSolution
        acceptedMoves++
        
        // En iyi çözümü güncelle
        if (currentSolution.energy < bestSolution.energy) {
          bestSolution = { ...currentSolution }
          console.log(`🎯 Yeni en iyi çözüm: Verimlilik = ${bestSolution.efficiency.toFixed(2)}%`)
        }
      } else {
        rejectedMoves++
      }
      
      // Sıcaklığı azalt
      temperature *= this.coolingRate
      iteration++
      
      // Her 100 iterasyonda veri kaydet
      if (iteration % 100 === 0) {
        coolingData.push({
          iteration,
          temperature: temperature.toFixed(2),
          currentEnergy: currentSolution.energy,
          bestEnergy: bestSolution.energy,
          efficiency: bestSolution.efficiency,
          acceptanceRate: acceptedMoves / (acceptedMoves + rejectedMoves)
        })
      }
    }

    console.log(`🏆 SA tamamlandı: ${iteration} iterasyon, En iyi verimlilik = ${bestSolution.efficiency.toFixed(1)}%`)
    
    return {
      layouts: this.solutionToLayouts(bestSolution),
      efficiency: bestSolution.efficiency,
      totalWaste: bestSolution.waste,
      totalCost: 0,
      algorithmData: {
        type: 'simulated_annealing',
        iterations: iteration,
        finalTemperature: temperature,
        acceptanceRate: acceptedMoves / (acceptedMoves + rejectedMoves),
        coolingData
      }
    }
  }

  private generateInitialSolution(): Solution {
    const placements = []
    
    // Greedy başlangıç: parçaları hacim sırasına göre yerleştir
    const sortedPieces = this.expandedPieces.sort((a, b) => {
      const volA = a.length * a.width * a.height
      const volB = b.length * b.width * b.height
      return volB - volA
    })

    for (const piece of sortedPieces) {
      let placed = false
      
      for (const stock of this.stockFoams) {
        // 8 farklı rotasyon dene
        for (let rotation = 0; rotation < 8; rotation++) {
          const rotatedDims = this.getRotatedDimensions(piece, rotation)
          
          // Basit yerleştirme - sol alt köşeye yakın
          const x = Math.random() * Math.max(0, stock.length - rotatedDims.length)
          const y = Math.random() * Math.max(0, stock.width - rotatedDims.width)
          const z = Math.random() * Math.max(0, stock.height - rotatedDims.height)
          
          placements.push({
            pieceId: piece.id,
            stockId: stock.id,
            x, y, z, rotation
          })
          
          placed = true
          break
        }
        if (placed) break
      }
    }

    const solution: Solution = {
      placements,
      energy: 0,
      efficiency: 0,
      waste: 0
    }

    this.evaluateSolution(solution)
    return solution
  }

  private generateNeighbor(solution: Solution): Solution {
    const neighbor: Solution = {
      placements: [...solution.placements],
      energy: 0,
      efficiency: 0,
      waste: 0
    }

    // Rastgele bir hareket türü seç
    const moveType = Math.random()
    
    if (moveType < 0.4) {
      // Tip 1: Rastgele bir parçayı taşı
      this.movePiece(neighbor)
    } else if (moveType < 0.7) {
      // Tip 2: Rastgele bir parçayı döndür
      this.rotatePiece(neighbor)
    } else if (moveType < 0.9) {
      // Tip 3: İki parçanın yerini değiştir
      this.swapPieces(neighbor)
    } else {
      // Tip 4: Bir parçayı başka stoka taşı
      this.moveToAnotherStock(neighbor)
    }

    this.evaluateSolution(neighbor)
    return neighbor
  }

  private movePiece(solution: Solution): void {
    if (solution.placements.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * solution.placements.length)
    const placement = solution.placements[randomIndex]
    const stock = this.stockFoams.find(s => s.id === placement.stockId)
    const piece = this.expandedPieces.find(p => p.id === placement.pieceId)
    
    if (stock && piece) {
      const rotatedDims = this.getRotatedDimensions(piece, placement.rotation)
      
      // Pozisyonu biraz değiştir
      const maxX = Math.max(0, stock.length - rotatedDims.length)
      const maxY = Math.max(0, stock.width - rotatedDims.width)
      const maxZ = Math.max(0, stock.height - rotatedDims.height)
      
      placement.x = Math.min(maxX, Math.max(0, placement.x + (Math.random() - 0.5) * 30))
      placement.y = Math.min(maxY, Math.max(0, placement.y + (Math.random() - 0.5) * 30))
      placement.z = Math.min(maxZ, Math.max(0, placement.z + (Math.random() - 0.5) * 30))
    }
  }

  private rotatePiece(solution: Solution): void {
    if (solution.placements.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * solution.placements.length)
    const placement = solution.placements[randomIndex]
    
    // Yeni rotasyon
    placement.rotation = Math.floor(Math.random() * 8)
    
    // Yeni rotasyona göre pozisyonu düzelt
    const stock = this.stockFoams.find(s => s.id === placement.stockId)
    const piece = this.expandedPieces.find(p => p.id === placement.pieceId)
    
    if (stock && piece) {
      const rotatedDims = this.getRotatedDimensions(piece, placement.rotation)
      
      placement.x = Math.min(placement.x, stock.length - rotatedDims.length)
      placement.y = Math.min(placement.y, stock.width - rotatedDims.width)
      placement.z = Math.min(placement.z, stock.height - rotatedDims.height)
      
      placement.x = Math.max(0, placement.x)
      placement.y = Math.max(0, placement.y)
      placement.z = Math.max(0, placement.z)
    }
  }

  private swapPieces(solution: Solution): void {
    if (solution.placements.length < 2) return
    
    const index1 = Math.floor(Math.random() * solution.placements.length)
    let index2 = Math.floor(Math.random() * solution.placements.length)
    while (index2 === index1) {
      index2 = Math.floor(Math.random() * solution.placements.length)
    }
    
    const temp = { ...solution.placements[index1] }
    solution.placements[index1] = { ...solution.placements[index2] }
    solution.placements[index2] = temp
  }

  private moveToAnotherStock(solution: Solution): void {
    if (solution.placements.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * solution.placements.length)
    const placement = solution.placements[randomIndex]
    
    // Rastgele başka bir stok seç
    const newStock = this.stockFoams[Math.floor(Math.random() * this.stockFoams.length)]
    const piece = this.expandedPieces.find(p => p.id === placement.pieceId)
    
    if (piece) {
      const rotatedDims = this.getRotatedDimensions(piece, placement.rotation)
      
      if (newStock.length >= rotatedDims.length && 
          newStock.width >= rotatedDims.width && 
          newStock.height >= rotatedDims.height) {
        
        placement.stockId = newStock.id
        placement.x = Math.random() * (newStock.length - rotatedDims.length)
        placement.y = Math.random() * (newStock.width - rotatedDims.width)
        placement.z = Math.random() * (newStock.height - rotatedDims.height)
      }
    }
  }

  private evaluateSolution(solution: Solution): void {
    const layouts = this.solutionToLayouts(solution)
    
    let totalUsedVolume = 0
    let totalStockVolume = 0
    let overlapPenalty = 0
    let boundsViolation = 0
    
    layouts.forEach(layout => {
      const stock = this.stockFoams.find(s => s.id === layout.stockId)
      if (stock) {
        const stockVolume = stock.length * stock.width * stock.height
        totalStockVolume += stockVolume
        totalUsedVolume += (stockVolume * layout.utilization) / 100
        
        // Çakışma ve sınır ihlali kontrolleri
        overlapPenalty += this.calculateOverlapPenalty(layout.pieces, stock)
        boundsViolation += this.calculateBoundsViolation(layout.pieces, stock)
      }
    })
    
    const efficiency = totalStockVolume > 0 ? (totalUsedVolume / totalStockVolume) * 100 : 0
    const waste = 100 - efficiency
    
    // Enerji fonksiyonu (minimize edilecek)
    // Düşük verimlilik = yüksek enerji
    // Çakışmalar ve sınır ihlalleri = ceza
    solution.energy = (100 - efficiency) + overlapPenalty * 100 + boundsViolation * 50
    solution.efficiency = efficiency
    solution.waste = waste
  }

  private calculateOverlapPenalty(pieces: any[], stock: StockFoam): number {
    let overlapCount = 0
    
    for (let i = 0; i < pieces.length; i++) {
      for (let j = i + 1; j < pieces.length; j++) {
        const piece1 = pieces[i]
        const piece2 = pieces[j]
        
        const p1 = this.expandedPieces.find(p => p.id === piece1.pieceId)
        const p2 = this.expandedPieces.find(p => p.id === piece2.pieceId)
        
        if (p1 && p2) {
          const dims1 = this.getRotatedDimensions(p1, piece1.rotation || 0)
          const dims2 = this.getRotatedDimensions(p2, piece2.rotation || 0)
          
          const overlap = this.isOverlapping(
            piece1.x/10, piece1.y/10, piece1.z/10, dims1.length, dims1.width, dims1.height,
            piece2.x/10, piece2.y/10, piece2.z/10, dims2.length, dims2.width, dims2.height
          )
          if (overlap) overlapCount++
        }
      }
    }
    
    return overlapCount
  }

  private calculateBoundsViolation(pieces: any[], stock: StockFoam): number {
    let violations = 0
    
    pieces.forEach(piece => {
      const p = this.expandedPieces.find(p => p.id === piece.pieceId)
      if (p) {
        const dims = this.getRotatedDimensions(p, piece.rotation || 0)
        
        if (piece.x/10 + dims.length > stock.length ||
            piece.y/10 + dims.width > stock.width ||
            piece.z/10 + dims.height > stock.height ||
            piece.x < 0 || piece.y < 0 || piece.z < 0) {
          violations++
        }
      }
    })
    
    return violations
  }

  private getRotatedDimensions(piece: FoamPiece, rotation: number): {length: number, width: number, height: number} {
    const rotations = [
      { length: piece.length, width: piece.width, height: piece.height }, // 0
      { length: piece.width, width: piece.length, height: piece.height }, // 1
      { length: piece.length, width: piece.height, height: piece.width }, // 2
      { length: piece.height, width: piece.length, height: piece.width }, // 3
      { length: piece.width, width: piece.height, height: piece.length }, // 4
      { length: piece.height, width: piece.width, height: piece.length }, // 5
      { length: piece.height, width: piece.length, height: piece.width }, // 6
      { length: piece.width, width: piece.height, height: piece.length }  // 7
    ]
    
    return rotations[rotation % 8]
  }

  private isOverlapping(
    x1: number, y1: number, z1: number, l1: number, w1: number, h1: number,
    x2: number, y2: number, z2: number, l2: number, w2: number, h2: number
  ): boolean {
    return !(x1 >= x2 + l2 || x2 >= x1 + l1 ||
             y1 >= y2 + w2 || y2 >= y1 + w1 ||
             z1 >= z2 + h2 || z2 >= z1 + h1)
  }

  private solutionToLayouts(solution: Solution): any[] {
    const layoutMap = new Map()
    
    solution.placements.forEach(placement => {
      if (!layoutMap.has(placement.stockId)) {
        layoutMap.set(placement.stockId, {
          stockId: placement.stockId,
          pieces: [],
          utilization: 0
        })
      }
      
      layoutMap.get(placement.stockId).pieces.push({
        pieceId: placement.pieceId,
        x: placement.x * 10, // CM'den MM'ye
        y: placement.y * 10,
        z: placement.z * 10,
        rotated: placement.rotation > 0,
        rotation: placement.rotation
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