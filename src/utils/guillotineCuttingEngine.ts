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

interface CutPattern {
  type: 'horizontal' | 'vertical'
  position: number
  pieces: string[]
}

interface GuillotineLayout {
  stockId: string
  pieces: Array<{
    pieceId: string
    x: number
    y: number
    z: number
    width: number
    height: number
    rotated: boolean
  }>
  horizontalCuts: number[]
  verticalCuts: number[]
  utilization: number
}

export class GuillotineCuttingEngine {
  private pieces: FoamPiece[]
  private stockFoams: StockFoam[]
  private expandedPieces: FoamPiece[]

  constructor(pieces: FoamPiece[], stockFoams: StockFoam[]) {
    this.pieces = pieces
    this.stockFoams = stockFoams
    this.expandedPieces = this.expandPieces(pieces)
  }

  async optimize(): Promise<any> {
    console.log('🔪 Guillotine Cutting Engine başlıyor...')
    console.log('📐 Gerçek makine kısıtlamaları: Sadece düz kesimler')
    
    const layouts: GuillotineLayout[] = []
    let remainingPieces = [...this.expandedPieces]
    
    for (const stock of this.stockFoams) {
      for (let stockIndex = 0; stockIndex < stock.quantity; stockIndex++) {
        if (remainingPieces.length === 0) break
        
        console.log(`📦 Blok ${stockIndex + 1}/${stock.quantity} işleniyor...`)
        
        const layout = this.createGuillotineLayout(stock, remainingPieces)
        if (layout.pieces.length > 0) {
          layouts.push(layout)
          
          // Yerleştirilen parçaları kaldır
          const placedPieceIds = layout.pieces.map(p => p.pieceId)
          remainingPieces = remainingPieces.filter(piece => 
            !placedPieceIds.includes(piece.id)
          )
          
          console.log(`✅ ${layout.pieces.length} parça yerleştirildi, verimlilik: ${layout.utilization.toFixed(1)}%`)
        }
      }
    }
    
    // Sonuçları hesapla
    const totalUsedVolume = layouts.reduce((sum, layout) => {
      const stock = this.stockFoams.find(s => s.id === layout.stockId)
      return sum + (stock ? (stock.length * stock.width * stock.height * layout.utilization / 100) : 0)
    }, 0)
    
    const totalStockVolume = layouts.reduce((sum, layout) => {
      const stock = this.stockFoams.find(s => s.id === layout.stockId)
      return sum + (stock ? stock.length * stock.width * stock.height : 0)
    }, 0)
    
    const efficiency = totalStockVolume > 0 ? (totalUsedVolume / totalStockVolume) * 100 : 0
    const waste = 100 - efficiency
    
    console.log(`🏆 Guillotine optimizasyon tamamlandı!`)
    console.log(`📊 Verimlilik: ${efficiency.toFixed(1)}%, İsraf: ${waste.toFixed(1)}%`)
    console.log(`🔪 Toplam kesim sayısı: ${this.calculateTotalCuts(layouts)}`)
    
    return {
      layouts: layouts.map(layout => ({
        stockId: layout.stockId,
        pieces: layout.pieces.map(piece => ({
          pieceId: piece.pieceId,
          x: piece.x * 10, // CM'den MM'ye
          y: piece.y * 10,
          z: piece.z * 10,
          rotated: piece.rotated
        })),
        utilization: layout.utilization,
        cuttingPattern: {
          horizontalCuts: layout.horizontalCuts,
          verticalCuts: layout.verticalCuts,
          totalCuts: layout.horizontalCuts.length + layout.verticalCuts.length
        }
      })),
      efficiency,
      totalWaste: waste,
      totalCost: 0,
      cuttingInstructions: this.generateCuttingInstructions(layouts),
      algorithmData: {
        type: 'guillotine',
        totalCuts: this.calculateTotalCuts(layouts),
        cuttingTime: this.estimateCuttingTime(layouts)
      }
    }
  }

  private createGuillotineLayout(stock: StockFoam, availablePieces: FoamPiece[]): GuillotineLayout {
    // Grid-based yaklaşım: En uygun grid boyutunu bul
    const sortedPieces = availablePieces.sort((a, b) => {
      const areaA = a.length * a.width
      const areaB = b.length * b.width
      return areaB - areaA // Büyükten küçüğe
    })

    const layout: GuillotineLayout = {
      stockId: stock.id,
      pieces: [],
      horizontalCuts: [],
      verticalCuts: [],
      utilization: 0
    }

    // Guillotine algoritması: Önce en büyük parçayı yerleştir
    let currentX = 0
    let currentY = 0
    let rowHeight = 0
    let maxY = 0

    for (const piece of sortedPieces) {
      // Normal ve 90° döndürülmüş halleri dene
      const orientations = [
        { width: piece.length, height: piece.width, rotated: false },
        { width: piece.width, height: piece.length, rotated: true }
      ]

      let placed = false
      for (const orientation of orientations) {
        // Mevcut pozisyonda sığar mı?
        if (currentX + orientation.width <= stock.length && 
            currentY + orientation.height <= stock.width) {
          
          layout.pieces.push({
            pieceId: piece.id,
            x: currentX,
            y: currentY,
            z: 0,
            width: orientation.width,
            height: orientation.height,
            rotated: orientation.rotated
          })

          // Dikey kesim çizgisi ekle (eğer sağda yer varsa)
          if (currentX + orientation.width < stock.length) {
            const cutPosition = currentX + orientation.width
            if (!layout.verticalCuts.includes(cutPosition)) {
              layout.verticalCuts.push(cutPosition)
            }
          }

          // Yatay kesim çizgisi ekle (eğer altında yer varsa)  
          if (currentY + orientation.height < stock.width) {
            const cutPosition = currentY + orientation.height
            if (!layout.horizontalCuts.includes(cutPosition)) {
              layout.horizontalCuts.push(cutPosition)
            }
          }

          currentX += orientation.width
          rowHeight = Math.max(rowHeight, orientation.height)
          placed = true
          break
        }
      }

      if (!placed) {
        // Yeni satıra geç
        if (rowHeight > 0) {
          currentX = 0
          currentY += rowHeight
          maxY = Math.max(maxY, currentY)
          rowHeight = 0

          // Tekrar dene
          for (const orientation of orientations) {
            if (currentX + orientation.width <= stock.length && 
                currentY + orientation.height <= stock.width) {
              
              layout.pieces.push({
                pieceId: piece.id,
                x: currentX,
                y: currentY,
                z: 0,
                width: orientation.width,
                height: orientation.height,
                rotated: orientation.rotated
              })

              if (currentX + orientation.width < stock.length) {
                const cutPosition = currentX + orientation.width
                if (!layout.verticalCuts.includes(cutPosition)) {
                  layout.verticalCuts.push(cutPosition)
                }
              }

              if (currentY + orientation.height < stock.width) {
                const cutPosition = currentY + orientation.height
                if (!layout.horizontalCuts.includes(cutPosition)) {
                  layout.horizontalCuts.push(cutPosition)
                }
              }

              currentX += orientation.width
              rowHeight = Math.max(rowHeight, orientation.height)
              placed = true
              break
            }
          }
        }
      }

      if (!placed) {
        // Bu parça hiçbir şekilde sığmıyor
        break
      }
    }

    // Utilization hesapla
    const usedArea = layout.pieces.reduce((sum, piece) => sum + (piece.width * piece.height), 0)
    const totalArea = stock.length * stock.width
    layout.utilization = (usedArea / totalArea) * 100

    // Kesim listelerini sırala
    layout.horizontalCuts.sort((a, b) => a - b)
    layout.verticalCuts.sort((a, b) => a - b)

    return layout
  }

  private generateCuttingInstructions(layouts: GuillotineLayout[]): any {
    const instructions = []

    for (let i = 0; i < layouts.length; i++) {
      const layout = layouts[i]
      const stock = this.stockFoams.find(s => s.id === layout.stockId)
      
      instructions.push({
        blockNumber: i + 1,
        stockLabel: stock?.label || 'Bilinmeyen',
        steps: [
          {
            phase: 1,
            description: 'Yatay Kesimler (X ekseni)',
            cuts: layout.horizontalCuts.map(pos => ({
              type: 'horizontal',
              position: pos,
              description: `Y=${pos}cm pozisyonundan yatay kesim (sol→sağ)`
            }))
          },
          {
            phase: 2, 
            description: 'Dikey Kesimler (Y ekseni)',
            cuts: layout.verticalCuts.map(pos => ({
              type: 'vertical',
              position: pos,
              description: `X=${pos}cm pozisyonundan dikey kesim (yukarı→aşağı)`
            }))
          }
        ],
        totalCuts: layout.horizontalCuts.length + layout.verticalCuts.length,
        estimatedTime: this.estimateBlockCuttingTime(layout)
      })
    }

    return {
      instructions,
      summary: {
        totalBlocks: layouts.length,
        totalCuts: this.calculateTotalCuts(layouts),
        estimatedTotalTime: instructions.reduce((sum, inst) => sum + inst.estimatedTime, 0)
      }
    }
  }

  private calculateTotalCuts(layouts: GuillotineLayout[]): number {
    return layouts.reduce((sum, layout) => 
      sum + layout.horizontalCuts.length + layout.verticalCuts.length, 0
    )
  }

  private estimateCuttingTime(layouts: GuillotineLayout[]): number {
    // Her kesim için tahmini süre (saniye)
    const timePerCut = 15 // 15 saniye/kesim
    return this.calculateTotalCuts(layouts) * timePerCut
  }

  private estimateBlockCuttingTime(layout: GuillotineLayout): number {
    const timePerCut = 15
    return (layout.horizontalCuts.length + layout.verticalCuts.length) * timePerCut
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