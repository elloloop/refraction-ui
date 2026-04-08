// ============================================================
// Ember — Configuration
// Change ANY value here and it reflects across ALL pages.
// ============================================================

export const menuHighlights = [
  {
    name: 'Pan-Seared Scallops',
    description: 'Hokkaido scallops with cauliflower puree, brown butter, and crispy capers',
    price: '$38',
  },
  {
    name: 'Wagyu Beef Tenderloin',
    description: 'A5 wagyu with truffle jus, roasted bone marrow, and seasonal vegetables',
    price: '$72',
  },
  {
    name: 'Wild Mushroom Risotto',
    description: 'Arborio rice with porcini, chanterelle, and shaved Parmigiano-Reggiano',
    price: '$28',
  },
  {
    name: 'Tarte Tatin',
    description: 'Caramelized apple tart with vanilla bean ice cream and salted caramel',
    price: '$18',
  },
]

export const menu: Record<Category, MenuItem[]> = {
  starters: [
    { name: 'Pan-Seared Scallops', description: 'Hokkaido scallops, cauliflower puree, brown butter, crispy capers', price: '$24', badges: ['GF'] },
    { name: 'Burrata Salad', description: 'Creamy burrata, heirloom tomatoes, basil oil, aged balsamic', price: '$18', badges: ['V', 'GF'] },
    { name: 'Tuna Tartare', description: 'Yellowfin tuna, avocado, soy-yuzu dressing, wonton chips', price: '$22', badges: ['DF'] },
    { name: 'Mushroom Soup', description: 'Forest mushroom veloute, truffle oil, sourdough croutons', price: '$16', badges: ['V'] },
    { name: 'Grilled Octopus', description: 'Spanish octopus, romesco, fingerling potatoes, chorizo crumble', price: '$26', badges: ['GF', 'DF'] },
  ],
  mains: [
    { name: 'Wagyu Beef Tenderloin', description: 'A5 wagyu, truffle jus, roasted bone marrow, seasonal vegetables', price: '$72', badges: ['GF'] },
    { name: 'Wild Mushroom Risotto', description: 'Arborio rice, porcini, chanterelle, shaved Parmigiano-Reggiano', price: '$28', badges: ['V', 'GF'] },
    { name: 'Pan-Roasted Salmon', description: 'King salmon, miso glaze, bok choy, jasmine rice', price: '$36', badges: ['GF', 'DF'] },
    { name: 'Duck Breast', description: 'Moulard duck, cherry gastrique, sweet potato puree, braised greens', price: '$42', badges: ['GF'] },
    { name: 'Grilled Lamb Rack', description: 'New Zealand lamb, herb crust, ratatouille, rosemary jus', price: '$48', badges: ['GF'] },
    { name: 'Lobster Linguine', description: 'Maine lobster, cherry tomato, saffron cream, fresh herbs', price: '$44' },
  ],
  desserts: [
    { name: 'Tarte Tatin', description: 'Caramelized apple tart, vanilla bean ice cream, salted caramel', price: '$18', badges: ['V'] },
    { name: 'Chocolate Fondant', description: 'Dark chocolate, molten center, raspberry coulis, cream', price: '$16', badges: ['V'] },
    { name: 'Creme Brulee', description: 'Classic vanilla custard, caramelized sugar, seasonal berries', price: '$14', badges: ['V', 'GF'] },
    { name: 'Cheese Selection', description: 'Curated artisan cheeses, honeycomb, fig compote, crackers', price: '$22', badges: ['V'] },
  ],
  drinks: [
    { name: 'Espresso Martini', description: 'Vodka, espresso, Kahlua, vanilla', price: '$18' },
    { name: 'Old Fashioned', description: 'Bourbon, Angostura bitters, orange peel, Demerara', price: '$16' },
    { name: 'Negroni', description: 'Gin, Campari, sweet vermouth, orange twist', price: '$16' },
    { name: 'Sparkling Water', description: 'San Pellegrino 750ml', price: '$8' },
  ],
}

export const wines = [
  { name: '2020 Chateau Margaux', region: 'Bordeaux, France', price: '$180', type: 'Red' },
  { name: '2021 Cloudy Bay Sauvignon Blanc', region: 'Marlborough, NZ', price: '$65', type: 'White' },
  { name: '2019 Barolo Riserva', region: 'Piedmont, Italy', price: '$120', type: 'Red' },
  { name: '2022 Sancerre', region: 'Loire Valley, France', price: '$72', type: 'White' },
  { name: 'NV Dom Perignon', region: 'Champagne, France', price: '$280', type: 'Champagne' },
]

export const categories: { key: Category; label: string }[] = [
  { key: 'starters', label: 'Starters' },
  { key: 'mains', label: 'Mains' },
  { key: 'desserts', label: 'Desserts' },
  { key: 'drinks', label: 'Drinks' },
]

export const badgeColors: Record<string, string> = {
  V: 'bg-success/10 text-success ring-success/20',
  GF: 'bg-warning/10 text-warning ring-warning/20',
  DF: 'bg-primary/10 text-primary ring-primary/20',
}

export const timeSlots = [
  '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
]

export const socialLinks = ['Social', 'Facebook', 'Yelp']
