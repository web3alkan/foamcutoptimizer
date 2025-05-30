'use client'

import { useState, useMemo } from 'react'

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

interface Props {
  pieces: FoamPiece[]
  stockFoams: StockFoam[]
  optimizationResult: OptimizationResult
  fixedView?: ViewType
  showTabs?: boolean
  scale?: number
}

type ViewType = 'top' | 'front' | 'side'

export default function FoamCutSlice2D({ 
  pieces, 
  stockFoams, 
  optimizationResult, 
  fixedView, 
  showTabs = true, 
  scale: customScale 
}: Props) {
  const [activeView, setActiveView] = useState<ViewType>(fixedView || 'top')

  const sliceData = useMemo(() => {
    const layouts: Array<{
      stockId: string
      stockFoam: StockFoam
      placedPieces: Array<{
        piece: FoamPiece
        x: number
        y: number
        z: number
        width: number
        height: number
        depth: number
      }>
    }> = []

    optimizationResult.layouts.forEach((layout) => {
      const stockFoam = stockFoams.find(s => s.id === layout.stockId)
      if (!stockFoam) return

      const placedPieces: Array<{
        piece: FoamPiece
        x: number
        y: number
        z: number
        width: number
        height: number
        depth: number
      }> = []

      layout.pieces.forEach((placedPiece) => {
        const originalPiece = pieces.find(p => p.id.startsWith(placedPiece.pieceId.split('_')[0]))
        if (originalPiece) {
          placedPieces.push({
            piece: originalPiece,
            x: placedPiece.x / 10, // MM'den CM'ye
            y: placedPiece.y / 10,
            z: placedPiece.z / 10,
            width: originalPiece.length, // CM cinsinden
            height: originalPiece.width,
            depth: originalPiece.height
          })
        }
      })

      layouts.push({
        stockId: layout.stockId,
        stockFoam,
        placedPieces
      })
    })

    return layouts
  }, [pieces, stockFoams, optimizationResult])

  const getViewDimensions = (stockFoam: StockFoam) => {
    switch (activeView) {
      case 'top': // Yukarıdan (X-Y düzlemi)
        return {
          width: stockFoam.length,
          height: stockFoam.width,
          label1: `${stockFoam.length}`,
          label2: `${stockFoam.width}`
        }
      case 'front': // Önden (X-Z düzlemi)
        return {
          width: stockFoam.length,
          height: stockFoam.height,
          label1: `${stockFoam.length}`,
          label2: `${stockFoam.height}`
        }
      case 'side': // Yandan (Y-Z düzlemi)
        return {
          width: stockFoam.width,
          height: stockFoam.height,
          label1: `${stockFoam.width}`,
          label2: `${stockFoam.height}`
        }
    }
  }

  const getPieceViewData = (placedPiece: {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
    piece: FoamPiece;
  }) => {
    switch (activeView) {
      case 'top': // Yukarıdan (X-Y düzlemi)
        return {
          x: placedPiece.x,
          y: placedPiece.y,
          width: placedPiece.width,
          height: placedPiece.height
        }
      case 'front': // Önden (X-Z düzlemi)
        return {
          x: placedPiece.x,
          y: placedPiece.z,
          width: placedPiece.width,
          height: placedPiece.depth
        }
      case 'side': // Yandan (Y-Z düzlemi)
        return {
          x: placedPiece.y,
          y: placedPiece.z,
          width: placedPiece.height,
          height: placedPiece.depth
        }
    }
  }

  const maxDimensions = useMemo(() => {
    const allStocks = stockFoams
    switch (activeView) {
      case 'top':
        return {
          maxWidth: Math.max(...allStocks.map(s => s.length)),
          maxHeight: Math.max(...allStocks.map(s => s.width))
        }
      case 'front':
        return {
          maxWidth: Math.max(...allStocks.map(s => s.length)),
          maxHeight: Math.max(...allStocks.map(s => s.height))
        }
      case 'side':
        return {
          maxWidth: Math.max(...allStocks.map(s => s.width)),
          maxHeight: Math.max(...allStocks.map(s => s.height))
        }
    }
  }, [stockFoams, activeView])

  // Responsive scaling for better fit
  const containerWidth = 1200
  const scale = customScale || Math.min(
    containerWidth / maxDimensions.maxWidth,
    300 / maxDimensions.maxHeight,
    1.2 // Maximum scale
  )

  const viewTabs = [
    { key: 'top', label: 'Yukarıdan', subtitle: 'X-Y' },
    { key: 'front', label: 'Önden', subtitle: 'X-Z' },
    { key: 'side', label: 'Yandan', subtitle: 'Y-Z' }
  ]

  return (
    <div className="w-full bg-white">
      {/* Minimalist Tab Navigation */}
      {showTabs && (
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-1">
            {viewTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => !fixedView && setActiveView(tab.key as ViewType)}
                disabled={fixedView !== undefined}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeView === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } ${fixedView ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="text-center">
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Single Layout Display - Like the provided image */}
      <div className="w-full">
        {sliceData.map((layout, index) => {
          const viewDims = getViewDimensions(layout.stockFoam)
          const scaledWidth = viewDims.width * scale
          const scaledHeight = viewDims.height * scale
          
          return (
            <div key={layout.stockId} className="mb-8">
              {/* Block Header */}
              <div className="mb-4 text-center">
                <h3 className="text-lg font-bold text-gray-900">
                  Blok {index + 1} - {layout.stockFoam.label}
                </h3>
                <p className="text-sm text-gray-600">
                  Verimlilik: %{optimizationResult.layouts[index]?.utilization.toFixed(1)}
                </p>
              </div>

              {/* Main View Container - Like the image */}
              <div className="w-full overflow-hidden">
                <div className="flex justify-center">
                  <div className="relative inline-block">
                    {/* Main Rectangle with Border */}
                    <div
                      className="relative bg-white border-2 border-gray-800"
                      style={{
                        width: scaledWidth,
                        height: scaledHeight,
                        minWidth: '300px',
                        minHeight: '150px'
                      }}
                    >
                      {/* Placed Pieces */}
                      {layout.placedPieces.map((placedPiece, pieceIndex) => {
                        const pieceViewData = getPieceViewData(placedPiece)
                        
                        return (
                          <div
                            key={pieceIndex}
                            className="absolute border border-gray-600 flex items-center justify-center text-white font-bold text-xs"
                            style={{
                              left: pieceViewData.x * scale,
                              top: pieceViewData.y * scale,
                              width: pieceViewData.width * scale,
                              height: pieceViewData.height * scale,
                              backgroundColor: placedPiece.piece.color || '#4F46E5',
                              fontSize: Math.max(8, Math.min(12, pieceViewData.width * scale / 8)) + 'px'
                            }}
                          >
                            <div className="text-center leading-tight">
                              <div>{placedPiece.piece.label}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Dimension Labels - Like in the image */}
                    {/* Bottom dimension */}
                    <div 
                      className="absolute text-center text-sm font-bold text-red-600"
                      style={{
                        bottom: '-25px',
                        left: '0',
                        right: '0'
                      }}
                    >
                      {viewDims.label1}
                    </div>

                    {/* Right dimension */}
                    <div 
                      className="absolute text-sm font-bold text-red-600"
                      style={{
                        right: '-40px',
                        top: '50%',
                        transform: 'translateY(-50%) rotate(90deg)',
                        transformOrigin: 'center'
                      }}
                    >
                      {viewDims.label2}
                    </div>

                    {/* Grid lines for better visibility (optional) */}
                    <svg 
                      className="absolute top-0 left-0 pointer-events-none opacity-20"
                      width={scaledWidth}
                      height={scaledHeight}
                    >
                      {/* Vertical grid lines every 50cm */}
                      {Array.from({ length: Math.floor(viewDims.width / 50) + 1 }, (_, i) => (
                        <line
                          key={`v-${i}`}
                          x1={i * 50 * scale}
                          y1={0}
                          x2={i * 50 * scale}
                          y2={scaledHeight}
                          stroke="#ddd"
                          strokeWidth="1"
                        />
                      ))}
                      {/* Horizontal grid lines every 50cm */}
                      {Array.from({ length: Math.floor(viewDims.height / 50) + 1 }, (_, i) => (
                        <line
                          key={`h-${i}`}
                          x1={0}
                          y1={i * 50 * scale}
                          x2={scaledWidth}
                          y2={i * 50 * scale}
                          stroke="#ddd"
                          strokeWidth="1"
                        />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Block Info Below */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-4 text-sm text-gray-600">
                  <span>Toplam Parça: {layout.placedPieces.length}</span>
                  <span>•</span>
                  <span>Boyutlar: {viewDims.label1} × {viewDims.label2} cm</span>
                  <span>•</span>
                  <span className="text-green-600 font-semibold">
                    Verimlilik: %{optimizationResult.layouts[index]?.utilization.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info */}
      {showTabs && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm">
            <div className="font-semibold text-gray-900 mb-2">
              {activeView === 'top' ? 'Yukarıdan Bakış' : activeView === 'front' ? 'Önden Bakış' : 'Yandan Bakış'}
            </div>
            <div className="text-gray-600 space-y-1">
              {activeView === 'top' && <div>• Uzunluk × Genişlik boyutları görünür</div>}
              {activeView === 'front' && <div>• Uzunluk × Kalınlık boyutları görünür</div>}
              {activeView === 'side' && <div>• Genişlik × Kalınlık boyutları görünür</div>}
              <div>• Her renkli alan bir parçayı temsil eder</div>
              <div>• Boyutlar santimetre (cm) cinsindendir</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 