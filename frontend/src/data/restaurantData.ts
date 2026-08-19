import { MenuItem } from '../types';

export const RESTAURANT_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Wild Brittany Scallops & Osetra Caviar',
    description: 'Pan-seared coastal scallops, golden cauliflower mousseline, chive infused beurre blanc, 10g Royal Osetra Caviar.',
    price: '$68',
    category: 'Starters',
    dietary: ['Gluten-Free', 'Seafood'],
    isChefSpecial: true
  },
  {
    id: 'm2',
    name: 'Heirloom Black Truffle Burrata',
    description: 'Creamy Puglia burrata, winter black truffle shavings, aged balsamic glaze, toasted pine nuts, artisan brioche.',
    price: '$42',
    category: 'Starters',
    dietary: ['Vegetarian']
  },
  {
    id: 'm3',
    name: 'A5 Japanese Wagyu Tenderloin',
    description: 'Miyazaki A5 Wagyu beef, smoked bone marrow reduction, caramelized shallot purée, pomme soufflé, charred wild mushrooms.',
    price: '$185',
    category: 'Main Courses',
    isChefSpecial: true
  },
  {
    id: 'm4',
    name: 'Line-Caught Mediterranean Sea Bass',
    description: 'Crispy skin Chilean sea bass, saffron emulsion, braised fennel confit, Manila clams, sea asparagus.',
    price: '$88',
    category: 'Main Courses',
    dietary: ['Gluten-Free', 'Seafood']
  },
  {
    id: 'm5',
    name: 'Morel & Morel Wild Mushroom Risotto',
    description: 'Acquerello carnaroli rice, French morels, 36-month Parmigiano-Reggiano foam, shaved white truffle oil.',
    price: '$74',
    category: 'Main Courses',
    dietary: ['Vegetarian', 'Gluten-Free']
  },
  {
    id: 'm6',
    name: 'Valrhona Grand Cru Dark Chocolate Sphere',
    description: '70% Guanaja chocolate shell, gold leaf accents, hazelnut praline core, warm salted caramel coulis pouring.',
    price: '$34',
    category: 'Desserts',
    isChefSpecial: true
  },
  {
    id: 'm7',
    name: 'Tahitian Vanilla & Lavender Mille-Feuille',
    description: 'Caramelized inverted puff pastry, Tahitian vanilla bean diplomat cream, wild blackberry sorbet.',
    price: '$28',
    category: 'Desserts'
  },
  {
    id: 'm8',
    name: 'Château Margaux Premier Grand Cru Classé (2015)',
    description: 'Glass selection. Exceptional depth of blackcurrant, cedar, violet aromas, silky tannins.',
    price: '$160 / Glass',
    category: 'Wines & Spirits'
  },
  {
    id: 'm9',
    name: 'Dom Pérignon Rosé Vintage Champagne',
    description: 'Bottle selection. Radiant notes of wild strawberries, pink grapefruit, soft spice finish.',
    price: '$620 / Bottle',
    category: 'Wines & Spirits'
  }
];
