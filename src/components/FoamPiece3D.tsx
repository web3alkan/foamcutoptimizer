'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Text } from '@react-three/drei'
import { useMemo } from 'react'

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
  optimizationResult: OptimizationResult | null
}

function StockFoamMesh({ stockFoam, position }: { 
  stockFoam: StockFoam; 
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Ana stok bloğu - sadece kenar çizgileri */}
      <Box args={[stockFoam.length / 10, stockFoam.height / 10, stockFoam.width / 10]}>
        <meshBasicMaterial color="#8B4513" wireframe={true} transparent opacity={0.3} />
      </Box>
      
      {/* Etiket */}
      <Text
        position={[0, stockFoam.height / 20 + 1.5, 0]}
        fontSize={0.8}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {stockFoam.label}
      </Text>
    </group>
  )
}

function OptimizedPieceMesh({ 
  piece, 
  basePosition, 
  foamPiece,
  separationOffset = 0
}: { 
  piece: {
    pieceId: string;
    x: number;
    y: number;
    z: number;
    rotated?: boolean;
  }; 
  basePosition: [number, number, number]; 
  foamPiece: FoamPiece;
  separationOffset?: number;
}) {
  // MM'den CM'ye çevir ve ayrıştır
  const piecePos: [number, number, number] = [
    basePosition[0] + (piece.x / 100) + separationOffset, // Parçalar arası boşluk ekle
    basePosition[1] + (piece.z / 100) + separationOffset,
    basePosition[2] + (piece.y / 100) + separationOffset
  ]
  
  return (
    <group position={piecePos}>
      {/* Ana parça */}
      <Box args={[foamPiece.length / 10, foamPiece.height / 10, foamPiece.width / 10]}>
        <meshStandardMaterial 
          color={foamPiece.color || '#4F46E5'} 
          transparent 
          opacity={0.9}
        />
      </Box>
      
      {/* Kenar çizgileri */}
      <Box args={[foamPiece.length / 10, foamPiece.height / 10, foamPiece.width / 10]}>
        <meshBasicMaterial 
          color="#000000" 
          wireframe={true}
          transparent
          opacity={0.8}
        />
      </Box>
      
      {/* Etiket */}
      <Text
        position={[0, foamPiece.height / 20 + 0.4, 0]}
        fontSize={0.4}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {foamPiece.label}
      </Text>
    </group>
  )
}

function Scene({ pieces, stockFoams, optimizationResult }: Props) {
  const sceneData = useMemo(() => {
    if (!optimizationResult) {
      // Optimizasyon yoksa sadece stok süngerleri göster
      return {
        stockPositions: stockFoams.map((_, index) => [index * 30, 0, 0] as [number, number, number]),
        optimizedPieces: []
      }
    }

    // Optimizasyon varsa ayrıştırılmış parçaları göster
    const stockPositions: [number, number, number][] = []
    const optimizedPieces: Array<{
      piece: {
        pieceId: string;
        x: number;
        y: number;
        z: number;
        rotated?: boolean;
      }
      basePosition: [number, number, number]
      foamPiece: FoamPiece
      separationOffset: number
    }> = []

    let totalPieceIndex = 0

    optimizationResult.layouts.forEach((layout, layoutIndex) => {
      const stockPosition: [number, number, number] = [layoutIndex * 40, 0, 0]
      stockPositions.push(stockPosition)
      
      layout.pieces.forEach((piece) => {
        const foamPiece = pieces.find(p => p.id.startsWith(piece.pieceId.split('_')[0]))
        if (foamPiece) {
          // Her parça için farklı bir ayrışma offseti
          const separationOffset = totalPieceIndex * 0.3
          
          optimizedPieces.push({
            piece,
            basePosition: stockPosition,
            foamPiece,
            separationOffset
          })
          
          totalPieceIndex++
        }
      })
    })

    return { stockPositions, optimizedPieces }
  }, [pieces, stockFoams, optimizationResult])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <pointLight position={[20, 20, 20]} intensity={1} />
      <directionalLight position={[-15, 15, 10]} intensity={0.8} />

      {/* Stock Foams - sadece kenar çizgileri */}
      {stockFoams.slice(0, optimizationResult?.layouts.length || stockFoams.length).map((stockFoam, index) => (
        <StockFoamMesh
          key={stockFoam.id}
          stockFoam={stockFoam}
          position={sceneData.stockPositions[index] || [0, 0, 0]}
        />
      ))}

      {/* Optimized Pieces - ayrıştırılmış */}
      {sceneData.optimizedPieces.map((item, index) => (
        <OptimizedPieceMesh
          key={`${item.foamPiece.id}-${index}`}
          piece={item.piece}
          basePosition={item.basePosition}
          foamPiece={item.foamPiece}
          separationOffset={item.separationOffset}
        />
      ))}

      {/* Unoptimized Pieces (preview) */}
      {!optimizationResult && pieces.map((piece, index) => (
        <group key={piece.id} position={[0, index * 5 + 10, -20]}>
          <Box args={[piece.length / 10, piece.height / 10, piece.width / 10]}>
            <meshStandardMaterial color={piece.color || '#4F46E5'} transparent opacity={0.8} />
          </Box>
          
          {/* Kenar çizgileri */}
          <Box args={[piece.length / 10, piece.height / 10, piece.width / 10]}>
            <meshBasicMaterial color="#000000" wireframe={true} transparent opacity={0.6} />
          </Box>
          
          <Text
            position={[0, piece.height / 20 + 1, 0]}
            fontSize={0.6}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {piece.label} x{piece.quantity}
          </Text>
        </group>
      ))}

      {/* Bilgi metni */}
      {optimizationResult && (
        <Text
          position={[0, -8, 0]}
          fontSize={1}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          Parçalar optimum şekilde ayrıştırıldı
        </Text>
      )}

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={10}
        maxDistance={100}
      />
    </>
  )
}

export default function FoamPiece3D({ pieces, stockFoams, optimizationResult }: Props) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [25, 20, 25], fov: 60 }}
        style={{ background: '#f8fafc' }}
      >
        <Scene pieces={pieces} stockFoams={stockFoams} optimizationResult={optimizationResult} />
      </Canvas>
    </div>
  )
} 