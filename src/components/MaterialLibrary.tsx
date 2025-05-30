'use client'

import { useState } from 'react'
import { Search, Plus, Trash2, Copy, Archive, Tag, Filter } from 'lucide-react'

interface Material {
  id: string
  name: string
  density: number
  cost: number
  category: 'foam' | 'plastic' | 'wood' | 'metal'
  standardSizes: Array<{
    length: number
    width: number
    height: number
    availability: 'in_stock' | 'order' | 'out_of_stock'
  }>
  properties: {
    hardness?: string
    color?: string
    manufacturer?: string
    grade?: string
  }
  tags: string[]
}

interface MaterialLibraryProps {
  onSelectMaterial: (material: Material, size: any) => void
}

export default function MaterialLibrary({ onSelectMaterial }: MaterialLibraryProps) {
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: '1',
      name: 'PU Sünger - Standard',
      density: 25,
      cost: 850,
      category: 'foam',
      standardSizes: [
        { length: 200, width: 120, height: 10, availability: 'in_stock' },
        { length: 240, width: 240, height: 100, availability: 'in_stock' },
        { length: 300, width: 200, height: 50, availability: 'order' }
      ],
      properties: {
        hardness: 'Orta',
        color: 'Beyaz',
        manufacturer: 'FoamTech',
        grade: 'A'
      },
      tags: ['standard', 'mobilya', 'yastık']
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="font-semibold text-gray-900 flex items-center">
          <Archive className="w-5 h-5 text-blue-500 mr-2" />
          Malzeme Kütüphanesi
        </h2>
      </div>
      
      <div className="p-6">
        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Malzeme ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="foam">Sünger</option>
            <option value="plastic">Plastik</option>
            <option value="wood">Ahşap</option>
            <option value="metal">Metal</option>
          </select>
        </div>

        {/* Materials Grid */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{material.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Yoğunluk: {material.density} kg/m³</span>
                    <span>Fiyat: ₺{material.cost}/m³</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      material.category === 'foam' ? 'bg-blue-100 text-blue-800' :
                      material.category === 'plastic' ? 'bg-green-100 text-green-800' :
                      material.category === 'wood' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {material.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Properties */}
              {Object.keys(material.properties).length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(material.properties).map(([key, value]) => (
                      value && (
                        <span key={key} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {key}: {value}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {material.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {material.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Sizes */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Standart Boyutlar:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {material.standardSizes.map((size, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-sm">
                        {size.length}×{size.width}×{size.height}cm
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          size.availability === 'in_stock' ? 'bg-green-100 text-green-800' :
                          size.availability === 'order' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {size.availability === 'in_stock' ? 'Stokta' :
                           size.availability === 'order' ? 'Sipariş' : 'Tükendi'}
                        </span>
                        <button
                          onClick={() => onSelectMaterial(material, size)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Kullan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Archive className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>Eşleşen malzeme bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  )
} 