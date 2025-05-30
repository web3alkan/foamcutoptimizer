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
          label1: `${stockFoam.length}cm`,
          label2: `${stockFoam.width}cm`,
          depthLabel: `Kalınlık: ${stockFoam.height}cm`
        }
      case 'front': // Önden (X-Z düzlemi)
        return {
          width: stockFoam.length,
          height: stockFoam.height,
          label1: `${stockFoam.length}cm`,
          label2: `${stockFoam.height}cm`,
          depthLabel: `Derinlik: ${stockFoam.width}cm`
        }
      case 'side': // Yandan (Y-Z düzlemi)
        return {
          width: stockFoam.width,
          height: stockFoam.height,
          label1: `${stockFoam.width}cm`,
          label2: `${stockFoam.height}cm`,
          depthLabel: `Derinlik: ${stockFoam.length}cm`
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
          height: placedPiece.height,
          depthInfo: `${placedPiece.depth}cm`
        }
      case 'front': // Önden (X-Z düzlemi)
        return {
          x: placedPiece.x,
          y: placedPiece.z,
          width: placedPiece.width,
          height: placedPiece.depth,
          depthInfo: `${placedPiece.height}cm`
        }
      case 'side': // Yandan (Y-Z düzlemi)
        return {
          x: placedPiece.y,
          y: placedPiece.z,
          width: placedPiece.height,
          height: placedPiece.depth,
          depthInfo: `${placedPiece.width}cm`
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

  const scale = customScale || Math.min(280 / maxDimensions.maxWidth, 180 / maxDimensions.maxHeight)

  const viewTabs = [
    { key: 'top', label: 'Yukarıdan', subtitle: 'X-Y' },
    { key: 'front', label: 'Önden', subtitle: 'X-Z' },
    { key: 'side', label: 'Yandan', subtitle: 'Y-Z' }
  ]

  return (
    <div className="w-full h-full bg-white">
      {/* Minimalist Tab Navigation */}
      {showTabs && (
        <div className="border-b border-gray-200 mb-4">
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

      {/* Slice Views */}
      <div className="overflow-auto max-h-60">
        <div className="flex flex-wrap gap-6 justify-center">
          {sliceData.map((layout, index) => {
            const viewDims = getViewDimensions(layout.stockFoam)
            
            return (
              <div key={layout.stockId} className="text-center">
                {/* Block Header */}
                <div className="mb-3">
                  <div className="text-sm font-semibold text-gray-900">Blok {index + 1}</div>
                  <div className="text-xs text-gray-600">{layout.stockFoam.label}</div>
                </div>

                {/* Block Container */}
                <div className="relative bg-white border border-gray-300 rounded-lg shadow-sm">
                  <div className="p-4">
                    <div
                      className="relative bg-amber-50 border-2 border-amber-200 rounded"
                      style={{
                        width: viewDims.width * scale,
                        height: viewDims.height * scale,
                      }}
                    >
                      {/* Placed Pieces */}
                      {layout.placedPieces.map((placedPiece, pieceIndex) => {
                        const pieceViewData = getPieceViewData(placedPiece)
                        
                        return (
                          <div
                            key={pieceIndex}
                            className="absolute border border-gray-800 flex items-center justify-center text-white text-xs font-medium"
                            style={{
                              left: pieceViewData.x * scale,
                              top: pieceViewData.y * scale,
                              width: pieceViewData.width * scale,
                              height: pieceViewData.height * scale,
                              backgroundColor: placedPiece.piece.color || '#4F46E5',
                            }}
                          >
                            <div className="text-center">
                              <div className="font-bold">{placedPiece.piece.label}</div>
                              <div className="opacity-90">{pieceViewData.depthInfo}</div>
                            </div>
                          </div>
                        )
                      })}
                      
                      {/* Dimension Labels */}
                      <div className="absolute -bottom-6 left-0 right-0 text-center">
                        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border">
                          {viewDims.label1}
                        </span>
                      </div>
                      <div className="absolute -left-6 top-0 bottom-0 flex items-center">
                        <div className="transform -rotate-90">
                          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border whitespace-nowrap">
                            {viewDims.label2}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Block Info */}
                  <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-700">{viewDims.depthLabel}</span>
                      <span className="text-green-600 font-semibold">
                        %{optimizationResult.layouts[index]?.utilization.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info */}
      {showTabs && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm">
            <div className="font-semibold text-gray-900 mb-2">
              {activeView === 'top' ? 'Yukarıdan Bakış' : activeView === 'front' ? 'Önden Bakış' : 'Yandan Bakış'}
            </div>
            <div className="text-gray-600 space-y-1">
              {activeView === 'top' && <div>• Uzunluk × Genişlik boyutları, kalınlık parçalarda gösterilir</div>}
              {activeView === 'front' && <div>• Uzunlık × Kalınlık boyutları, derinlik parçalarda gösterilir</div>}
              {activeView === 'side' && <div>• Genişlik × Kalınlık boyutları, derinlik parçalarda gösterilir</div>}
              <div>• Her renkli alan bir parçayı temsil eder</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 