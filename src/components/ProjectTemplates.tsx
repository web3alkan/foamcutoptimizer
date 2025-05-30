'use client'

import { useState } from 'react'
import { FolderOpen, Sofa, Car, Building, Package, Download, Upload, Star } from 'lucide-react'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: 'furniture' | 'automotive' | 'construction' | 'custom'
  icon: any
  pieces: Array<{
    label: string
    length: number
    width: number
    height: number
    quantity: number
    color?: string
  }>
  stockMaterials: Array<{
    label: string
    length: number
    width: number
    height: number
    quantity: number
  }>
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  efficiency: number
}

interface ProjectTemplatesProps {
  onSelectTemplate: (template: ProjectTemplate) => void
}

export default function ProjectTemplates({ onSelectTemplate }: ProjectTemplatesProps) {
  const [templates] = useState<ProjectTemplate[]>([
    {
      id: 'furniture-sofa',
      name: 'Klasik Koltuk Seti',
      description: '3 kişilik koltuk için standart sünger parçaları',
      category: 'furniture',
      icon: Sofa,
      pieces: [
        { label: 'Oturma Yüzeyi', length: 180, width: 60, height: 8, quantity: 1, color: '#3B82F6' },
        { label: 'Sırt Desteği', length: 180, width: 80, height: 8, quantity: 1, color: '#10B981' },
        { label: 'Kol Desteği', length: 60, width: 25, height: 15, quantity: 2, color: '#F59E0B' },
        { label: 'Yastık', length: 50, width: 50, height: 12, quantity: 3, color: '#EF4444' }
      ],
      stockMaterials: [
        { label: 'Büyük Sünger Blok', length: 200, width: 100, height: 20, quantity: 2 }
      ],
      tags: ['mobilya', 'oturma', 'sünger'],
      difficulty: 'beginner',
      estimatedTime: '2-3 saat',
      efficiency: 85
    },
    {
      id: 'automotive-seat',
      name: 'Otomobil Koltuk Sistemi',
      description: 'Arabalar için ergonomik koltuk parçaları',
      category: 'automotive',
      icon: Car,
      pieces: [
        { label: 'Ana Oturma', length: 50, width: 45, height: 10, quantity: 4, color: '#8B5CF6' },
        { label: 'Sırt Desteği', length: 50, width: 60, height: 8, quantity: 4, color: '#EC4899' },
        { label: 'Baş Desteği', length: 25, width: 20, height: 8, quantity: 4, color: '#06B6D4' },
        { label: 'Yan Destek', length: 40, width: 15, height: 12, quantity: 8, color: '#84CC16' }
      ],
      stockMaterials: [
        { label: 'Otomotiv Sünger', length: 120, width: 80, height: 15, quantity: 3 }
      ],
      tags: ['otomotiv', 'koltuk', 'ergonomik'],
      difficulty: 'intermediate',
      estimatedTime: '4-5 saat',
      efficiency: 78
    },
    {
      id: 'construction-insulation',
      name: 'Bina İzolasyon Sistemi',
      description: 'Duvar ve tavan izolasyonu için köpük paneller',
      category: 'construction',
      icon: Building,
      pieces: [
        { label: 'Duvar Paneli', length: 120, width: 60, height: 5, quantity: 20, color: '#F97316' },
        { label: 'Tavan Paneli', length: 60, width: 60, height: 8, quantity: 15, color: '#EAB308' },
        { label: 'Köşe Profili', length: 100, width: 10, height: 5, quantity: 10, color: '#22C55E' }
      ],
      stockMaterials: [
        { label: 'İzolasyon Bloğu', length: 240, width: 120, height: 10, quantity: 5 }
      ],
      tags: ['inşaat', 'izolasyon', 'panel'],
      difficulty: 'advanced',
      estimatedTime: '6-8 saat',
      efficiency: 92
    },
    {
      id: 'packaging-custom',
      name: 'Özel Ambalaj Çözümü',
      description: 'Kırılgan ürünler için koruyucu köpük parçalar',
      category: 'custom',
      icon: Package,
      pieces: [
        { label: 'Alt Koruma', length: 30, width: 30, height: 3, quantity: 10, color: '#6366F1' },
        { label: 'Üst Koruma', length: 30, width: 30, height: 3, quantity: 10, color: '#8B5CF6' },
        { label: 'Yan Koruma', length: 30, width: 10, height: 15, quantity: 40, color: '#EC4899' },
        { label: 'Ara Seperatör', length: 28, width: 28, height: 2, quantity: 20, color: '#06B6D4' }
      ],
      stockMaterials: [
        { label: 'Koruyucu Köpük', length: 100, width: 100, height: 20, quantity: 2 }
      ],
      tags: ['ambalaj', 'koruma', 'lojistik'],
      difficulty: 'intermediate',
      estimatedTime: '3-4 saat',
      efficiency: 88
    }
  ])

  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory
    const matchesDifficulty = filterDifficulty === 'all' || template.difficulty === filterDifficulty
    return matchesCategory && matchesDifficulty
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'furniture': return 'bg-blue-100 text-blue-800'
      case 'automotive': return 'bg-red-100 text-red-800'
      case 'construction': return 'bg-green-100 text-green-800'
      case 'custom': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Başlangıç'
      case 'intermediate': return 'Orta'
      case 'advanced': return 'İleri'
      default: return 'Bilinmeyen'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="font-semibold text-gray-900 flex items-center">
          <FolderOpen className="w-5 h-5 text-purple-500 mr-2" />
          Proje Şablonları
        </h2>
        <p className="text-sm text-gray-600 mt-1">Hazır projelerle hızla başlayın</p>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="furniture">Mobilya</option>
            <option value="automotive">Otomotiv</option>
            <option value="construction">İnşaat</option>
            <option value="custom">Özel</option>
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">Tüm Seviyeler</option>
            <option value="beginner">Başlangıç</option>
            <option value="intermediate">Orta</option>
            <option value="advanced">İleri</option>
          </select>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => {
            const IconComponent = template.icon
            return (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-purple-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <IconComponent className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs ml-1">{template.efficiency}%</span>
                  </div>
                </div>

                {/* Tags & Categories */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(template.category)}`}>
                    {template.category === 'furniture' ? 'Mobilya' :
                     template.category === 'automotive' ? 'Otomotiv' :
                     template.category === 'construction' ? 'İnşaat' : 'Özel'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(template.difficulty)}`}>
                    {getDifficultyText(template.difficulty)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    {template.estimatedTime}
                  </span>
                </div>

                {/* Piece Summary */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    {template.pieces.length} farklı parça, toplam {template.pieces.reduce((sum, p) => sum + p.quantity, 0)} adet
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.pieces.slice(0, 4).map((piece, index) => (
                      <div key={index} className="text-xs bg-gray-50 px-2 py-1 rounded" title={piece.label}>
                        {piece.label.substring(0, 10)}...
                      </div>
                    ))}
                    {template.pieces.length > 4 && (
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                        +{template.pieces.length - 4} daha
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Use Template Button */}
                <button
                  onClick={() => onSelectTemplate(template)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center font-medium transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Şablonu Kullan
                </button>
              </div>
            )
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Şablon bulunamadı</p>
            <p className="text-sm">Filtre kriterlerinizi değiştirerek tekrar deneyin</p>
          </div>
        )}
      </div>
    </div>
  )
} 