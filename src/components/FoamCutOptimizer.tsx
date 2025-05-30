'use client'

import { useState, useMemo, useEffect } from 'react'
import { Calculator, Plus, Trash2, Package, Scissors, Info, Grid3X3, Sparkles, TrendingUp, FileText, Download, Edit3, Save, X } from 'lucide-react'
import FoamPiece3D from './FoamPiece3D'
import FoamCutSlice2D from './FoamCutSlice2D'
import OptimizationEngine from '../utils/optimizationEngine'

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

export default function FoamCutOptimizer() {
  const [pieces, setPieces] = useState<FoamPiece[]>([
    {
      id: '1',
      length: 30,
      width: 40,
      height: 20,
      quantity: 2,
      label: 'Parça A',
      color: '#3B82F6'
    },
    {
      id: '2',
      length: 40,
      width: 90,
      height: 10,
      quantity: 4,
      label: 'Parça B',
      color: '#10B981'
    },
    {
      id: '3',
      length: 50,
      width: 30,
      height: 20,
      quantity: 1,
      label: 'Parça C',
      color: '#F59E0B'
    },
    {
      id: '4',
      length: 100,
      width: 90,
      height: 7.5,
      quantity: 6,
      label: 'Parça D',
      color: '#EF4444'
    },
    {
      id: '5',
      length: 60,
      width: 40,
      height: 30,
      quantity: 1,
      label: 'Parça E',
      color: '#8B5CF6'
    }
  ])
  const [stockFoams, setStockFoams] = useState<StockFoam[]>([
    {
      id: 'stock1',
      length: 240,
      width: 240,
      height: 100,
      quantity: 1,
      label: 'Büyük Sünger Blok'
    }
  ])
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showEfficiencyWarning, setShowEfficiencyWarning] = useState<string | null>(null)
  const [editingPiece, setEditingPiece] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    length: '',
    width: '',
    height: '',
    quantity: '',
    label: ''
  })

  // Form state'leri
  const [newPiece, setNewPiece] = useState({
    length: '',
    width: '',
    height: '',
    quantity: '1',
    label: 'Parça'
  })

  const [newStock, setNewStock] = useState({
    length: '',
    width: '',
    height: '',
    quantity: '1',
    label: 'Sünger Blok'
  })

  // Tek parça için maksimum adet hesaplama
  const calculateMaxQuantity = () => {
    if (!newPiece.length || !newPiece.width || !newPiece.height || stockFoams.length === 0) {
      alert('Önce parça ölçülerini girin!')
      return
    }

    const pieceLength = parseFloat(newPiece.length)
    const pieceWidth = parseFloat(newPiece.width)
    const pieceHeight = parseFloat(newPiece.height)

    let maxTotal = 0

    stockFoams.forEach(stock => {
      // 8 farklı rotasyon kombinasyonu test et
      const rotations = [
        [pieceLength, pieceWidth, pieceHeight],
        [pieceLength, pieceHeight, pieceWidth],
        [pieceWidth, pieceLength, pieceHeight],
        [pieceWidth, pieceHeight, pieceLength],
        [pieceHeight, pieceLength, pieceWidth],
        [pieceHeight, pieceWidth, pieceLength]
      ]

      let maxForThisStock = 0
      rotations.forEach(([l, w, h]) => {
        const fitL = Math.floor(stock.length / l)
        const fitW = Math.floor(stock.width / w)
        const fitH = Math.floor(stock.height / h)
        const total = fitL * fitW * fitH
        maxForThisStock = Math.max(maxForThisStock, total)
      })

      maxTotal += maxForThisStock * stock.quantity
    })

    setNewPiece({ ...newPiece, quantity: maxTotal.toString() })
  }

  // Tüm parçalar için maksimizasyon (minimum adetleri koruyarak)
  const maximizeAllPieces = async () => {
    if (pieces.length === 0) {
      alert('Önce parça ekleyin!')
      return
    }

    console.log('Maksimizasyon başlıyor...')
    setIsCalculating(true)
    setShowEfficiencyWarning('Maksimum adetler hesaplanıyor...')

    try {
      // Toplam ham malzeme hacmini hesapla
      const totalStockVolume = stockFoams.reduce((sum, stock) => 
        sum + (stock.length * stock.width * stock.height * stock.quantity), 0
      )

      console.log('Toplam ham malzeme hacmi:', totalStockVolume, 'cm³')

      // Mevcut parçaların toplam hacmini hesapla
      const currentTotalVolume = pieces.reduce((sum, piece) => 
        sum + (piece.length * piece.width * piece.height * piece.quantity), 0
      )

      console.log('Mevcut parçalar toplam hacmi:', currentTotalVolume, 'cm³')

      if (currentTotalVolume >= totalStockVolume) {
        setShowEfficiencyWarning('Mevcut parçalar zaten tüm bloklara sığmıyor! Parça adetlerini azaltın.')
        setIsCalculating(false)
        return
      }

      // Basit hacim temelli maksimizasyon
      const remainingVolume = totalStockVolume - currentTotalVolume
      console.log('Kalan hacim:', remainingVolume, 'cm³')

      // Her parça için unit hacim hesapla
      const pieceVolumeData = pieces.map(piece => ({
        ...piece,
        unitVolume: piece.length * piece.width * piece.height,
        index: pieces.findIndex(p => p.id === piece.id)
      }))

      // Küçük parçalardan başlayarak maksimize et
      const sortedByVolume = [...pieceVolumeData].sort((a, b) => a.unitVolume - b.unitVolume)
      
      const optimizedPieces = [...pieces]
      let usedExtraVolume = 0

      for (const pieceData of sortedByVolume) {
        const availableVolume = remainingVolume - usedExtraVolume
        const maxAdditionalPieces = Math.floor(availableVolume / pieceData.unitVolume)
        
        console.log(`${pieceData.label}: Unit hacim ${pieceData.unitVolume}, maksimum ek adet: ${maxAdditionalPieces}`)

        if (maxAdditionalPieces > 0) {
          const pieceIndex = optimizedPieces.findIndex(p => p.id === pieceData.id)
          if (pieceIndex !== -1) {
            const newQuantity = optimizedPieces[pieceIndex].quantity + maxAdditionalPieces
            optimizedPieces[pieceIndex] = {
              ...optimizedPieces[pieceIndex],
              quantity: newQuantity
            }
            usedExtraVolume += maxAdditionalPieces * pieceData.unitVolume
            console.log(`${pieceData.label} güncellendi: ${pieceData.quantity} -> ${newQuantity}`)
          }
        }
      }

      // Sonuç kontrolü
      const hasChanges = optimizedPieces.some((piece, index) => piece.quantity !== pieces[index].quantity)
      
      if (hasChanges) {
        const finalTotalVolume = optimizedPieces.reduce((sum, piece) => 
          sum + (piece.length * piece.width * piece.height * piece.quantity), 0
        )
        const efficiency = ((finalTotalVolume / totalStockVolume) * 100).toFixed(1)
        
        console.log('Maksimizasyon tamamlandı:', {
          öncekiToplam: currentTotalVolume,
          yeniToplam: finalTotalVolume,
          verimlilik: efficiency + '%'
        })

        setPieces(optimizedPieces)
        setShowEfficiencyWarning(`Parçalar maksimize edildi! Toplam verimlilik: %${efficiency}`)
      } else {
        console.log('Parçalar zaten maksimum seviyede')
        setShowEfficiencyWarning('Parçalar zaten maksimum seviyede! Daha fazla eklenemez.')
      }

    } catch (error) {
      console.error('Maksimizasyon hatası:', error)
      setShowEfficiencyWarning('Maksimizasyon sırasında hata oluştu: ' + (error as Error).message)
    } finally {
      setIsCalculating(false)
    }
  }

  // Verimlilik kontrolü
  useEffect(() => {
    if (showEfficiencyWarning) {
      const timer = setTimeout(() => setShowEfficiencyWarning(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [showEfficiencyWarning])

  // Optimizasyon hesaplama
  const calculateOptimization = async () => {
    if (pieces.length === 0) return
    
    setIsCalculating(true)
    try {
      // CM'yi MM'ye çevir (optimizasyon motoru MM kullanıyor)
      const piecesInMM = pieces.map(p => ({
        ...p,
        length: p.length * 10,
        width: p.width * 10,
        height: p.height * 10
      }))
      
      const stocksInMM = stockFoams.map(s => ({
        ...s,
        length: s.length * 10,
        width: s.width * 10,
        height: s.height * 10
      }))
      
      const engine = new OptimizationEngine()
      const result = await engine.optimize(piecesInMM, stocksInMM)
      setOptimizationResult(result)
    } catch (error) {
      console.error('Optimizasyon hatası:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  // Parça ekleme
  const addPiece = () => {
    if (!newPiece.length || !newPiece.width || !newPiece.height || !newPiece.label) return

    const piece: FoamPiece = {
      id: Date.now().toString(),
      length: parseFloat(newPiece.length),
      width: parseFloat(newPiece.width),
      height: parseFloat(newPiece.height),
      quantity: parseInt(newPiece.quantity),
      label: newPiece.label,
      color: `hsl(${Math.random() * 360}, 65%, 55%)`
    }

    setPieces([...pieces, piece])
    setNewPiece({ length: '', width: '', height: '', quantity: '1', label: 'Parça' })
  }

  // Stok ekleme
  const addStock = () => {
    if (!newStock.length || !newStock.width || !newStock.height || !newStock.label) return

    const stock: StockFoam = {
      id: Date.now().toString(),
      length: parseFloat(newStock.length),
      width: parseFloat(newStock.width),
      height: parseFloat(newStock.height),
      quantity: parseInt(newStock.quantity),
      label: newStock.label
    }

    setStockFoams([...stockFoams, stock])
    setNewStock({ length: '', width: '', height: '', quantity: '1', label: 'Sünger Blok' })
  }

  // Silme işlemleri
  const removePiece = (id: string) => {
    setPieces(pieces.filter(p => p.id !== id))
  }

  const removeStock = (id: string) => {
    setStockFoams(stockFoams.filter(s => s.id !== id))
  }

  // Parça düzenleme fonksiyonları
  const startEditPiece = (piece: FoamPiece) => {
    setEditingPiece(piece.id)
    setEditForm({
      length: piece.length.toString(),
      width: piece.width.toString(),
      height: piece.height.toString(),
      quantity: piece.quantity.toString(),
      label: piece.label
    })
  }

  const saveEditPiece = () => {
    if (!editingPiece || !editForm.length || !editForm.width || !editForm.height || !editForm.quantity || !editForm.label) return

    const updatedPieces = pieces.map(piece => 
      piece.id === editingPiece 
        ? {
            ...piece,
            length: parseFloat(editForm.length),
            width: parseFloat(editForm.width),
            height: parseFloat(editForm.height),
            quantity: parseInt(editForm.quantity),
            label: editForm.label
          }
        : piece
    )

    setPieces(updatedPieces)
    setEditingPiece(null)
    setEditForm({ length: '', width: '', height: '', quantity: '', label: '' })
  }

  const cancelEdit = () => {
    setEditingPiece(null)
    setEditForm({ length: '', width: '', height: '', quantity: '', label: '' })
  }

  // İstatistikler
  const stats = useMemo(() => {
    const totalPieces = pieces.reduce((sum, p) => sum + p.quantity, 0)
    const totalVolume = pieces.reduce((sum, p) => sum + (p.length * p.width * p.height * p.quantity), 0)
    return { totalPieces, totalVolume }
  }, [pieces])

  // PDF Rapor Oluşturma
  const generatePDFReport = () => {
    if (!optimizationResult) {
      alert('Önce optimizasyon yapın!')
      return
    }

    // 2D kesit verilerini hazırla
    const generate2DSliceHTML = (viewType: 'top' | 'front' | 'side', title: string, subtitle: string) => {
      // Tüm layouts için SVG oluştur
      const svgElements = optimizationResult.layouts.map((layout, index) => {
        const stock = stockFoams.find(s => s.id === layout.stockId)
        if (!stock) return ''

        // View boyutlarını hesapla
        let viewWidth, viewHeight, depthLabel
        switch (viewType) {
          case 'top':
            viewWidth = stock.length
            viewHeight = stock.width
            depthLabel = `Kalınlık: ${stock.height}cm`
            break
          case 'front':
            viewWidth = stock.length
            viewHeight = stock.height
            depthLabel = `Derinlik: ${stock.width}cm`
            break
          case 'side':
            viewWidth = stock.width
            viewHeight = stock.height
            depthLabel = `Derinlik: ${stock.length}cm`
            break
        }

        const scale = Math.min(400 / viewWidth, 300 / viewHeight)
        const scaledWidth = viewWidth * scale
        const scaledHeight = viewHeight * scale

        // Parçaları çiz
        const pieceElements = layout.pieces.map((placedPiece) => {
          const originalPiece = pieces.find(p => placedPiece.pieceId.startsWith(p.id))
          if (!originalPiece) return ''

          let x, y, width, height, depthInfo
          switch (viewType) {
            case 'top':
              x = (placedPiece.x / 10) * scale
              y = (placedPiece.y / 10) * scale
              width = originalPiece.length * scale
              height = originalPiece.width * scale
              depthInfo = `${originalPiece.height}cm`
              break
            case 'front':
              x = (placedPiece.x / 10) * scale
              y = (placedPiece.z / 10) * scale
              width = originalPiece.length * scale
              height = originalPiece.height * scale
              depthInfo = `${originalPiece.width}cm`
              break
            case 'side':
              x = (placedPiece.y / 10) * scale
              y = (placedPiece.z / 10) * scale
              width = originalPiece.width * scale
              height = originalPiece.height * scale
              depthInfo = `${originalPiece.length}cm`
              break
          }

          return `
            <rect x="${x}" y="${y}" width="${width}" height="${height}" 
                  fill="${originalPiece.color || '#4F46E5'}" 
                  stroke="#000" stroke-width="1" opacity="0.8"/>
            <text x="${x + width/2}" y="${y + height/2}" 
                  text-anchor="middle" dominant-baseline="middle" 
                  fill="white" font-size="10" font-weight="bold">
              ${originalPiece.label}
            </text>
            <text x="${x + width/2}" y="${y + height/2 + 12}" 
                  text-anchor="middle" dominant-baseline="middle" 
                  fill="white" font-size="8">
              ${depthInfo}
            </text>
          `
        }).join('')

        return `
          <div style="margin-bottom: 40px; text-align: center;">
            <h3 style="margin-bottom: 10px;">Blok ${index + 1} - ${stock.label}</h3>
            <p style="margin-bottom: 15px; color: #666;">${depthLabel} | Verimlilik: ${layout.utilization.toFixed(1)}%</p>
            <svg width="${scaledWidth + 80}" height="${scaledHeight + 80}" style="border: 2px solid #ddd; background: #f9f9f9;">
              <rect x="40" y="40" width="${scaledWidth}" height="${scaledHeight}" 
                    fill="#fff3cd" stroke="#ffc107" stroke-width="2"/>
              ${pieceElements}
              <text x="${40 + scaledWidth/2}" y="${scaledHeight + 65}" 
                    text-anchor="middle" font-size="12" fill="#666">
                ${viewWidth}cm
              </text>
              <text x="25" y="${40 + scaledHeight/2}" 
                    text-anchor="middle" font-size="12" fill="#666" 
                    transform="rotate(-90, 25, ${40 + scaledHeight/2})">
                ${viewHeight}cm
              </text>
            </svg>
          </div>
        `
      }).join('')

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @page { margin: 20mm; size: A4; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .logo { max-width: 100px; height: auto; margin-bottom: 10px; }
            h1 { color: #333; margin: 10px 0; }
            .subtitle { color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo.jpeg" alt="Logo" class="logo">
            <h1>${title}</h1>
            <p>Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          ${svgElements}
        </body>
        </html>
      `
    }

    // Ana rapor
    const reportContent = {
      title: 'Sünger Kesim Optimizasyon Raporu',
      date: new Date().toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      summary: {
        totalPieces: stats.totalPieces,
        totalVolume: (stats.totalVolume / 1000).toFixed(1) + 'L',
        efficiency: optimizationResult.efficiency.toFixed(1) + '%',
        waste: optimizationResult.totalWaste.toFixed(1) + '%',
        blocksUsed: optimizationResult.layouts.length
      },
      stockMaterials: stockFoams.map(stock => ({
        label: stock.label,
        dimensions: `${stock.length}×${stock.width}×${stock.height}cm`,
        quantity: stock.quantity,
        volume: ((stock.length * stock.width * stock.height * stock.quantity) / 1000).toFixed(1) + 'L'
      })),
      pieces: pieces.map(piece => ({
        label: piece.label,
        dimensions: `${piece.length}×${piece.width}×${piece.height}cm`,
        quantity: piece.quantity,
        unitVolume: ((piece.length * piece.width * piece.height) / 1000).toFixed(3) + 'L',
        totalVolume: ((piece.length * piece.width * piece.height * piece.quantity) / 1000).toFixed(1) + 'L'
      })),
      layouts: optimizationResult.layouts.map((layout, index) => {
        const stock = stockFoams.find(s => s.id === layout.stockId)
        return {
          blockNumber: index + 1,
          stockLabel: stock?.label || 'Bilinmeyen',
          utilization: layout.utilization.toFixed(1) + '%',
          piecesCount: layout.pieces.length,
          pieces: layout.pieces.map(p => {
            const originalPiece = pieces.find(piece => p.pieceId.startsWith(piece.id))
            return {
              label: originalPiece?.label || 'Bilinmeyen',
              position: `X:${(p.x/10).toFixed(1)}, Y:${(p.y/10).toFixed(1)}, Z:${(p.z/10).toFixed(1)}cm`,
              rotated: p.rotated ? 'Evet' : 'Hayır'
            }
          })
        }
      })
    }

    // Ana rapor HTML'i
    const mainReportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${reportContent.title}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { max-width: 120px; height: auto; margin-bottom: 15px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .summary-item { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .summary-label { color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .layout-section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
          .piece-position { font-family: monospace; font-size: 12px; }
          .rotated-yes { color: #ef4444; font-weight: bold; }
          .rotated-no { color: #10b981; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/logo.jpeg" alt="Logo" class="logo">
          <h1>${reportContent.title}</h1>
          <p>Oluşturulma Tarihi: ${reportContent.date}</p>
        </div>
        
        <div class="section">
          <h2>📊 Özet Bilgiler</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${reportContent.summary.totalPieces}</div>
              <div class="summary-label">Toplam Parça</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportContent.summary.totalVolume}</div>
              <div class="summary-label">Toplam Hacim</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportContent.summary.efficiency}</div>
              <div class="summary-label">Verimlilik</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportContent.summary.waste}</div>
              <div class="summary-label">İsraf</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportContent.summary.blocksUsed}</div>
              <div class="summary-label">Kullanılan Blok</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>📦 Ham Malzemeler</h2>
          <table>
            <thead>
              <tr>
                <th>Malzeme Adı</th>
                <th>Boyutlar</th>
                <th>Adet</th>
                <th>Toplam Hacim</th>
              </tr>
            </thead>
            <tbody>
              ${reportContent.stockMaterials.map(stock => `
                <tr>
                  <td>${stock.label}</td>
                  <td>${stock.dimensions}</td>
                  <td>${stock.quantity}</td>
                  <td>${stock.volume}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>✂️ Kesilecek Parçalar</h2>
          <table>
            <thead>
              <tr>
                <th>Parça Adı</th>
                <th>Boyutlar</th>
                <th>Adet</th>
                <th>Birim Hacim</th>
                <th>Toplam Hacim</th>
              </tr>
            </thead>
            <tbody>
              ${reportContent.pieces.map(piece => `
                <tr>
                  <td>${piece.label}</td>
                  <td>${piece.dimensions}</td>
                  <td>${piece.quantity}</td>
                  <td>${piece.unitVolume}</td>
                  <td>${piece.totalVolume}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>🎯 Optimizasyon Sonuçları</h2>
          ${reportContent.layouts.map(layout => `
            <div class="layout-section">
              <h3>Blok ${layout.blockNumber} - ${layout.stockLabel}</h3>
              <p><strong>Verimlilik:</strong> ${layout.utilization} | <strong>Parça Sayısı:</strong> ${layout.piecesCount}</p>
              <table>
                <thead>
                  <tr>
                    <th>Parça Adı</th>
                    <th>Pozisyon (cm)</th>
                    <th>Döndürüldü mü?</th>
                  </tr>
                </thead>
                <tbody>
                  ${layout.pieces.map(piece => `
                    <tr>
                      <td>${piece.label}</td>
                      <td class="piece-position">${piece.position}</td>
                      <td class="${piece.rotated === 'Evet' ? 'rotated-yes' : 'rotated-no'}">${piece.rotated}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
        </div>

        <!-- 2D Kesit Görünümleri -->
        <div class="page-break">
          ${generate2DSliceHTML('top', '🔽 Yukarıdan Görünüm (X-Y Düzlemi)', 'Uzunluk × Genişlik boyutları görünür, kalınlık parçalarda gösterilir')}
        </div>

        <div class="page-break">
          ${generate2DSliceHTML('front', '➡️ Önden Görünüm (X-Z Düzlemi)', 'Uzunluk × Kalınlık boyutları görünür, derinlik parçalarda gösterilir')}
        </div>

        <div class="page-break">
          ${generate2DSliceHTML('side', '⬅️ Yandan Görünüm (Y-Z Düzlemi)', 'Genişlik × Kalınlık boyutları görünür, derinlik parçalarda gösterilir')}
        </div>

        <div class="section page-break">
          <h2>📋 Notlar</h2>
          <ul>
            <li>Bu rapor AI destekli 3D optimizasyon algoritması kullanılarak oluşturulmuştur.</li>
            <li>Parçalar 8 farklı rotasyon seçeneği ile optimize edilmiştir.</li>
            <li>Pozisyon değerleri sol-alt-ön köşeden başlayarak cm cinsindedir.</li>
            <li>Verimlilik yüzdesi kullanılan hacmin toplam hacme oranını gösterir.</li>
            <li>Döndürülmüş parçalar farklı yönelimde yerleştirilmiştir.</li>
            <li>2D kesit görünümleri üretim için kullanılabilir.</li>
            <li>Minimum israf hedefi ile optimize edilmiştir.</li>
          </ul>
        </div>
      </body>
      </html>
    `

    // PDF'i yeni pencerede aç
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(mainReportHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // İsraf Optimizasyonu - Kalan parçaları tekrar böl
  const optimizeWaste = async () => {
    if (!optimizationResult) {
      alert('Önce optimizasyon yapın!')
      return
    }

    setIsCalculating(true)
    setShowEfficiencyWarning('Kalan parçalar optimize ediliyor...')

    try {
      // Her blok için kalan (kullanılmayan) alanları hesapla
      const wasteAnalysis = optimizationResult.layouts.map((layout, index) => {
        const stock = stockFoams.find(s => s.id === layout.stockId)
        if (!stock) return null

        const totalVolume = stock.length * stock.width * stock.height
        const usedVolume = (totalVolume * layout.utilization) / 100
        const wasteVolume = totalVolume - usedVolume

        return {
          blockIndex: index + 1,
          stockLabel: stock.label,
          totalVolume,
          usedVolume,
          wasteVolume,
          wastePercentage: ((wasteVolume / totalVolume) * 100).toFixed(1),
          stockDimensions: { length: stock.length, width: stock.width, height: stock.height }
        }
      }).filter(Boolean)

      // Toplam israf hesapla
      const totalWasteVolume = wasteAnalysis.reduce((sum, block) => sum + block!.wasteVolume, 0)
      
      if (totalWasteVolume < 1000) { // 1000 cm³ = 1L altındaysa
        setShowEfficiencyWarning('İsraf miktarı çok düşük. Ekstra optimizasyon gerekmiyor!')
        setIsCalculating(false)
        return
      }

      // En küçük parçayı bul (tekrar kesim için referans)
      const smallestPiece = pieces.reduce((smallest, piece) => {
        const volume = piece.length * piece.width * piece.height
        const smallestVolume = smallest.length * smallest.width * smallest.height
        return volume < smallestVolume ? piece : smallest
      })

      // İsraf parçalarından ne kadar küçük parça çıkabileceğini hesapla
      let additionalPieces = 0
      wasteAnalysis.forEach(block => {
        if (!block) return
        
        // Kalan alan içinde en küçük parçadan kaç tane sığabilir
        const possiblePieces = Math.floor(block.wasteVolume / (smallestPiece.length * smallestPiece.width * smallestPiece.height))
        additionalPieces += possiblePieces
      })

      if (additionalPieces > 0) {
        // En küçük parçanın miktarını artır
        const updatedPieces = pieces.map(piece => 
          piece.id === smallestPiece.id 
            ? { ...piece, quantity: piece.quantity + additionalPieces }
            : piece
        )

        setPieces(updatedPieces)
        setShowEfficiencyWarning(`İsraf optimize edildi! ${additionalPieces} adet "${smallestPiece.label}" daha eklenebilir. Tekrar optimizasyon yapın.`)
      } else {
        setShowEfficiencyWarning('İsraf parçaları mevcut parça boyutlarına uygun değil. Daha küçük parçalar deneyin.')
      }

    } catch (error) {
      console.error('İsraf optimizasyon hatası:', error)
      setShowEfficiencyWarning('İsraf optimizasyonu sırasında hata oluştu.')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimalist Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sünger Kesim Optimizasyonu</h1>
                <p className="text-gray-600">3D optimizasyon ile minimum israf</p>
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Efficiency Warning */}
      {showEfficiencyWarning && (
        <div className="mx-6 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-amber-600 mr-3" />
              <p className="text-amber-800 font-medium">{showEfficiencyWarning}</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Left Panel - Minimalist Input */}
          <div className="space-y-6">
            
            {/* Stock Materials */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 text-orange-500 mr-2" />
                  Ham Malzeme
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Uzunluk"
                    value={newStock.length}
                    onChange={(e) => setNewStock({ ...newStock, length: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Genişlik"
                    value={newStock.width}
                    onChange={(e) => setNewStock({ ...newStock, width: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Kalınlık"
                    value={newStock.height}
                    onChange={(e) => setNewStock({ ...newStock, height: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="number"
                    placeholder="Adet"
                    value={newStock.quantity}
                    onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Malzeme adı"
                  value={newStock.label}
                  onChange={(e) => setNewStock({ ...newStock, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-4"
                />
                <button
                  onClick={addStock}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Malzeme Ekle
                </button>

                <div className="mt-4 space-y-2">
                  {stockFoams.map((stock) => (
                    <div key={stock.id} className="flex justify-between items-center bg-orange-50 border border-orange-100 p-3 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{stock.label}</div>
                        <div className="text-sm text-gray-600">
                          {stock.length}×{stock.width}×{stock.height}cm × {stock.quantity} adet
                        </div>
                      </div>
                      <button
                        onClick={() => removeStock(stock.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cut Pieces */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <Scissors className="w-5 h-5 text-blue-500 mr-2" />
                  Kesilecek Parçalar
                </h2>
                {pieces.length > 0 && (
                  <button
                    onClick={maximizeAllPieces}
                    disabled={isCalculating}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium"
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Hesaplanıyor...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        MAKSİMİZE ET
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Uzunluk"
                    value={newPiece.length}
                    onChange={(e) => setNewPiece({ ...newPiece, length: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Genişlik"
                    value={newPiece.width}
                    onChange={(e) => setNewPiece({ ...newPiece, width: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Kalınlık"
                    value={newPiece.height}
                    onChange={(e) => setNewPiece({ ...newPiece, height: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <input
                    type="number"
                    placeholder="Adet"
                    value={newPiece.quantity}
                    onChange={(e) => setNewPiece({ ...newPiece, quantity: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={calculateMaxQuantity}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
                    title="Bu parça için maksimum adet hesapla"
                  >
                    MAX ADET
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Parça adı"
                  value={newPiece.label}
                  onChange={(e) => setNewPiece({ ...newPiece, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                />
                <button
                  onClick={addPiece}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Parça Ekle
                </button>

                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {pieces.map((piece) => (
                    <div key={piece.id} className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                      {editingPiece === piece.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Uzunluk"
                              value={editForm.length}
                              onChange={(e) => setEditForm({ ...editForm, length: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Genişlik"
                              value={editForm.width}
                              onChange={(e) => setEditForm({ ...editForm, width: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Kalınlık"
                              value={editForm.height}
                              onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Adet"
                              value={editForm.quantity}
                              onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Parça adı"
                              value={editForm.label}
                              onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={saveEditPiece}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Kaydet
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center"
                            >
                              <X className="w-3 h-3 mr-1" />
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">{piece.label}</div>
                            <div className="text-sm text-gray-600">
                              {piece.length}×{piece.width}×{piece.height}cm × {piece.quantity} adet
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditPiece(piece)}
                              className="text-blue-500 hover:text-blue-700 p-1"
                              title="Düzenle"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removePiece(piece.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {pieces.length === 0 && (
                    <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <Scissors className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>Henüz parça eklenmedi</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateOptimization}
              disabled={pieces.length === 0 || isCalculating}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-xl flex items-center justify-center"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Hesaplanıyor...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5 mr-2" />
                  Optimizasyonu Hesapla
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.totalPieces}</div>
                <div className="text-sm text-gray-600 font-medium">Toplam Parça</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(stats.totalVolume / 1000).toFixed(1)}L
                </div>
                <div className="text-sm text-gray-600 font-medium">Toplam Hacim</div>
              </div>
            </div>

            {/* Optimization Results */}
            {optimizationResult && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="font-semibold text-gray-900">Optimizasyon Sonuçları</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{optimizationResult.layouts.length}</div>
                      <div className="text-xs text-gray-600 font-medium">Kullanılan Blok</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{optimizationResult.efficiency.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600 font-medium">Verimlilik</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{optimizationResult.totalWaste.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600 font-medium">İsraf</div>
                    </div>
                  </div>
                  
                  {/* İsraf Optimizasyonu Butonu */}
                  {optimizationResult.totalWaste > 5 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-yellow-800">İsraf Azaltılabilir</h4>
                          <p className="text-sm text-yellow-600">Kalan parçalar daha küçük parçalara bölünebilir</p>
                        </div>
                        <button
                          onClick={optimizeWaste}
                          disabled={isCalculating}
                          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-medium px-4 py-2 rounded-lg flex items-center text-sm"
                        >
                          {isCalculating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Hesaplanıyor...
                            </>
                          ) : (
                            <>
                              <Scissors className="w-4 h-4 mr-2" />
                              İsrafı Azalt
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3D Visualization */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="font-semibold text-gray-900">3D Görselleştirme</h2>
              </div>
              <div className="p-6">
                <div className="h-96 bg-gray-50 rounded-lg border border-gray-200">
                  <FoamPiece3D 
                    pieces={pieces} 
                    stockFoams={stockFoams}
                    optimizationResult={optimizationResult}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width 2D Views Section */}
      {optimizationResult && (
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Grid3X3 className="w-6 h-6 text-purple-500 mr-3" />
              2D Kesit Görünümleri - Tüm Açılar
            </h2>
            <p className="text-gray-600">Her görünüm farklı açıdan kesilmiş parçaları gösterir</p>
          </div>

          {/* Yukarıdan Görünüm */}
          <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white flex items-center">
                🔽 Yukarıdan Görünüm (X-Y Düzlemi)
              </h3>
              <p className="text-blue-100 text-sm">Uzunluk × Genişlik boyutları görünür, kalınlık parçalarda gösterilir</p>
            </div>
            <div className="p-8">
              <div className="min-h-96 bg-gray-50 rounded-lg border border-gray-200">
                <FoamCutSlice2D 
                  pieces={pieces} 
                  stockFoams={stockFoams}
                  optimizationResult={optimizationResult}
                  fixedView="top"
                  showTabs={false}
                  scale={1.5}
                />
              </div>
            </div>
          </div>

          {/* Önden Görünüm */}
          <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white flex items-center">
                ➡️ Önden Görünüm (X-Z Düzlemi)
              </h3>
              <p className="text-emerald-100 text-sm">Uzunluk × Kalınlık boyutları görünür, derinlik parçalarda gösterilir</p>
            </div>
            <div className="p-8">
              <div className="min-h-96 bg-gray-50 rounded-lg border border-gray-200">
                <FoamCutSlice2D 
                  pieces={pieces} 
                  stockFoams={stockFoams}
                  optimizationResult={optimizationResult}
                  fixedView="front"
                  showTabs={false}
                  scale={1.5}
                />
              </div>
            </div>
          </div>

          {/* Yandan Görünüm */}
          <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white flex items-center">
                ⬅️ Yandan Görünüm (Y-Z Düzlemi)
              </h3>
              <p className="text-purple-100 text-sm">Genişlik × Kalınlık boyutları görünür, derinlik parçalarda gösterilir</p>
            </div>
            <div className="p-8">
              <div className="min-h-96 bg-gray-50 rounded-lg border border-gray-200">
                <FoamCutSlice2D 
                  pieces={pieces} 
                  stockFoams={stockFoams}
                  optimizationResult={optimizationResult}
                  fixedView="side"
                  showTabs={false}
                  scale={1.5}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Rapor Oluşturma */}
      {optimizationResult && (
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 text-center">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">📄 Detaylı Rapor</h3>
              <p className="text-gray-600">Tüm optimizasyon sonuçlarını, malzeme listelerini ve kesim planlarını içeren kapsamlı PDF raporu oluşturun.</p>
            </div>
            <button
              onClick={generatePDFReport}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center mx-auto transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-200/50"
            >
              <FileText className="w-6 h-6 mr-3" />
              PDF RAPORU OLUŞTUR
              <Download className="w-5 h-5 ml-3" />
            </button>
            <div className="mt-4 text-sm text-gray-500">
              <p>• Ham malzeme listesi • Parça detayları • Optimizasyon sonuçları</p>
              <p>• Pozisyon bilgileri • Verimlilik analizi • Kesim planları</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 