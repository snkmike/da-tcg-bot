// Utility function for custom react-select styles
export const getCustomSelectStyles = () => ({
  control: (base, state) => ({
    ...base,
    borderRadius: '0.5rem',
    borderColor: state.isFocused ? '#4f46e5' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99,102,241,0.5)' : 'none',
    '&:hover': { borderColor: '#4f46e5' },
    padding: '2px 8px',
  }),
  menu: base => ({ ...base, borderRadius: '0.5rem', zIndex: 10 }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? '#4f46e5' : isFocused ? '#eef2ff' : 'white',
    color: isSelected ? 'white' : '#111827',
    padding: '8px 12px',
  }),
});

// Shared constants
export const DEFAULT_RARITIES = ['Common', 'Uncommon', 'Rare', 'Super_rare', 'Legendary', 'Enchanted', 'Promo'];

export const DEFAULT_RARITY_DISPLAY_NAMES = {
  'common': 'Common',
  'uncommon': 'Uncommon', 
  'rare': 'Rare',
  'super_rare': 'Super rare',
  'legendary': 'Legendary',
  'enchanted': 'Enchanted',
  'promo': 'Promo'
};

export const DEFAULT_SORT_OPTIONS = [
  { value: 'alpha', label: 'Ordre alphabétique' },
  { value: 'number', label: 'Numéro' },
  { value: 'price', label: 'Prix' }
];
