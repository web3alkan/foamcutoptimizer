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
  price?: number
}

interface OptimizationResult {
  layouts: Array<{
    stockId: string
    pieces: Array<{
      pieceId: string
      x: number
      y: number
      z: number
      rotated?: boolean
    }>
    utilization: number
  }>
  totalWaste: number
  totalCost: number
  efficiency: number
}

interface PlacedPiece {
  pieceId: string
  x: number
  y: number
  z: number
  length: number
  width: number
  height: number
  rotated?: boolean
}

interface Rotation {
  length: number
  width: number
  height: number
  rotationId: number
}

class BinPacker3D {
  private stockLength: number
  private stockWidth: number
  private stockHeight: number
  private placedPieces: PlacedPiece[] = []

  constructor(stockLength: number, stockWidth: number, stockHeight: number) {
    this.stockLength = stockLength
    this.stockWidth = stockWidth
    this.stockHeight = stockHeight
  }

  // 8 farklı rotasyon kombinasyonu oluştur
  private getRotations(piece: FoamPiece): Rotation[] {
    const { length, width, height } = piece
    return [
      { length, width, height, rotationId: 0 }, // Orijinal
      { length: width, width: length, height, rotationId: 1 }, // XY swap
      { length, width: height, height: width, rotationId: 2 }, // YZ swap
      { length: height, width, height: length, rotationId: 3 }, // XZ swap
      { length: width, width: height, height: length, rotationId: 4 }, // XY+YZ swap
      { length: height, width: length, height: width, rotationId: 5 }, // XZ+XY swap
      { length: height, width: width, height: length, rotationId: 6 } // Diagonal rotations
    ].filter((rotation, index, arr) => {
      // Aynı boyutları olan rotasyonları filtrele
      return !arr.slice(0, index).some(r => 
        r.length === rotation.length && 
        r.width === rotation.width && 
        r.height === rotation.height
      )
    })
  }

  canFit(piece: FoamPiece, x: number, y: number, z: number, rotation: Rotation): boolean {
    const { length: pLength, width: pWidth, height: pHeight } = rotation

    // Stok sınırları kontrol
    if (x + pLength > this.stockLength || 
        y + pWidth > this.stockWidth || 
        z + pHeight > this.stockHeight) {
      return false
    }

    // Diğer parçalarla çakışma kontrol
    for (const placed of this.placedPieces) {
      if (this.isOverlapping(
        x, y, z, pLength, pWidth, pHeight,
        placed.x, placed.y, placed.z, placed.length, placed.width, placed.height
      )) {
        return false
      }
    }

    return true
  }

  private isOverlapping(
    x1: number, y1: number, z1: number, l1: number, w1: number, h1: number,
    x2: number, y2: number, z2: number, l2: number, w2: number, h2: number
  ): boolean {
    return !(x1 >= x2 + l2 || x2 >= x1 + l1 ||
             y1 >= y2 + w2 || y2 >= y1 + w1 ||
             z1 >= z2 + h2 || z2 >= z1 + h1)
  }

  findBestPosition(piece: FoamPiece): { x: number; y: number; z: number; rotation: Rotation } | null {
    // Bottom-left-front stratejisi ile en iyi pozisyonu bul
    const positions = this.generateCandidatePositions()
    const rotations = this.getRotations(piece)
    
    // Tüm pozisyonları ve rotasyonları dene
    for (const pos of positions) {
      for (const rotation of rotations) {
        if (this.canFit(piece, pos.x, pos.y, pos.z, rotation)) {
          return { ...pos, rotation }
        }
      }
    }

    return null
  }

  private generateCandidatePositions(): Array<{ x: number; y: number; z: number }> {
    const positions: Array<{ x: number; y: number; z: number }> = []
    
    // Başlangıç pozisyonu
    positions.push({ x: 0, y: 0, z: 0 })

    // Mevcut parçaların kenarlarına dayalı pozisyonlar
    for (const placed of this.placedPieces) {
      positions.push(
        { x: placed.x + placed.length, y: placed.y, z: placed.z },
        { x: placed.x, y: placed.y + placed.width, z: placed.z },
        { x: placed.x, y: placed.y, z: placed.z + placed.height }
      )
    }

    // Sıralama: sol-alt-ön öncelikli
    return positions.sort((a, b) => {
      if (a.z !== b.z) return a.z - b.z
      if (a.y !== b.y) return a.y - b.y
      return a.x - b.x
    })
  }

  addPiece(piece: FoamPiece, x: number, y: number, z: number, rotation: Rotation): boolean {
    if (!this.canFit(piece, x, y, z, rotation)) {
      return false
    }

    this.placedPieces.push({
      pieceId: piece.id,
      x, y, z,
      length: rotation.length,
      width: rotation.width,
      height: rotation.height,
      rotated: rotation.rotationId > 0
    })

    return true
  }

  getUtilization(): number {
    const usedVolume = this.placedPieces.reduce((sum, piece) => 
      sum + (piece.length * piece.width * piece.height), 0)
    const totalVolume = this.stockLength * this.stockWidth * this.stockHeight
    return (usedVolume / totalVolume) * 100
  }

  getPlacedPieces(): PlacedPiece[] {
    return [...this.placedPieces]
  }
}

export default class OptimizationEngine {
  async optimize(pieces: FoamPiece[], stockFoams: StockFoam[]): Promise<OptimizationResult> {
    // Simulated delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800))

    const layouts: OptimizationResult['layouts'] = []
    let totalUsedVolume = 0
    let totalStockVolume = 0
    let totalCost = 0

    // Parçaları hacim bazında sırala (büyükten küçüğe)
    const sortedPieces = this.expandPieces(pieces).sort((a, b) => {
      const volumeA = a.length * a.width * a.height
      const volumeB = b.length * b.width * b.height
      return volumeB - volumeA
    })

    const remainingPieces = [...sortedPieces]
    let stockIndex = 0

    while (remainingPieces.length > 0 && stockIndex < stockFoams.length) {
      const stock = stockFoams[stockIndex]
      const packer = new BinPacker3D(stock.length, stock.width, stock.height)
      
      let placedInThisStock = 0
      let i = 0

      while (i < remainingPieces.length) {
        const piece = remainingPieces[i]
        const position = packer.findBestPosition(piece)

        if (position) {
          packer.addPiece(piece, position.x, position.y, position.z, position.rotation)
          remainingPieces.splice(i, 1)
          placedInThisStock++
        } else {
          i++
        }
      }

      if (placedInThisStock > 0) {
        const utilization = packer.getUtilization()
        const stockVolume = stock.length * stock.width * stock.height

        layouts.push({
          stockId: stock.id,
          pieces: packer.getPlacedPieces(),
          utilization
        })

        totalUsedVolume += (stockVolume * utilization) / 100
        totalStockVolume += stockVolume
        totalCost += stock.price || 0
      }

      stockIndex++
    }

    const efficiency = totalStockVolume > 0 ? (totalUsedVolume / totalStockVolume) * 100 : 0
    const totalWaste = 100 - efficiency

    return {
      layouts,
      totalWaste,
      totalCost,
      efficiency
    }
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