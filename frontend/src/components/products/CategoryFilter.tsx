import React from 'react';
import { Filter } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { value: '', label: 'All Categories', icon: '📦' },
  { value: 'milk', label: 'Milk', icon: '🥛' },
  { value: 'meat', label: 'Meat', icon: '🥩' },
  { value: 'organic-oils', label: 'Organic Oils', icon: '🫒' },
  { value: 'organic-powders', label: 'Organic Powders', icon: '🌾' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-2">
      <div className="flex items-center space-x-2 text-gray-700">
        <Filter className="h-5 w-5" />
        <span className="font-medium">Filter:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
              selectedCategory === category.value
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};