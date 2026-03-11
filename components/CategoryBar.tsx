import React from 'react';

const CATEGORIES = [
  { id: 'all', name: 'All', value: '', type: 'category' },
  { id: 'trending', name: 'Trending', value: 'top-weekly', type: 'order' },
  { id: 'top-rated', name: 'Top Rated', value: 'top-rated', type: 'order' },
  { id: 'popular', name: 'Most Viewed', value: 'most-viewed', type: 'order' },
  { id: 'amateur', name: 'Amateur', value: 'amateur', type: 'category' },
  { id: 'vr', name: 'VR', value: 'vr', type: 'category' },
  { id: '4k', name: '4K', value: '4k', type: 'category' },
  { id: 'homemade', name: 'Homemade', value: 'homemade', type: 'category' },
  { id: 'hentai', name: 'Hentai', value: 'hentai', type: 'category' },
  { id: 'milf', name: 'MILF', value: 'milf', type: 'category' },
  { id: 'teen', name: 'Teen', value: 'teen', type: 'category' },
  { id: 'anal', name: 'Anal', value: 'anal', type: 'category' },
  { id: 'ebony', name: 'Ebony', value: 'ebony', type: 'category' },
  { id: 'asian', name: 'Asian', value: 'asian', type: 'category' },
  { id: 'latina', name: 'Latina', value: 'latina', type: 'category' },
];

interface CategoryBarProps {
  selectedCategory: string;
  selectedSort: string;
  onSelect: (value: string, type: 'category' | 'order') => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ selectedCategory, selectedSort, onSelect }) => {
  return (
    <div className="w-full overflow-hidden mb-4 animate-fade-in relative">
      {/* Gradient Fades for Scroll */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none md:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none md:hidden" />
      
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
        {CATEGORIES.map((cat) => {
          const isActive = cat.type === 'category' ? selectedCategory === cat.value : selectedSort === cat.value;
          
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.value, cat.type as 'category' | 'order')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                isActive
                  ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-105'
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white backdrop-blur-sm'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
