// ============================================================
// Verve — Configuration
// Change ANY value here and it reflects across ALL pages.
// ============================================================

export const featuredProducts = [
  { id: 1, name: 'Linen Blend Shirt', price: '$68', image: 'Relaxed linen shirt' },
  { id: 2, name: 'Wide Leg Trousers', price: '$89', image: 'Flowing wide leg trousers' },
  { id: 3, name: 'Canvas Tote Bag', price: '$42', image: 'Everyday canvas tote' },
  { id: 4, name: 'Leather Sandals', price: '$95', image: 'Handcrafted leather sandals' },
]

export const categoryCards = [
  { name: 'Women', count: '240+ items' },
  { name: 'Men', count: '180+ items' },
  { name: 'Accessories', count: '120+ items' },
  { name: 'Sale', count: 'Up to 50% off' },
]

export const allProducts = [
  { id: 1, name: 'Linen Blend Shirt', price: 68, category: 'Women', color: 'White', size: ['S', 'M', 'L'], rating: 4.5, image: 'Linen shirt' },
  { id: 2, name: 'Wide Leg Trousers', price: 89, category: 'Women', color: 'Beige', size: ['S', 'M', 'L', 'XL'], rating: 4.7, image: 'Wide trousers' },
  { id: 3, name: 'Canvas Tote Bag', price: 42, category: 'Accessories', color: 'Natural', size: ['One Size'], rating: 4.8, image: 'Canvas tote' },
  { id: 4, name: 'Leather Sandals', price: 95, category: 'Women', color: 'Tan', size: ['6', '7', '8', '9'], rating: 4.3, image: 'Leather sandals' },
  { id: 5, name: 'Oxford Button-Down', price: 72, category: 'Men', color: 'Blue', size: ['S', 'M', 'L', 'XL'], rating: 4.6, image: 'Oxford shirt' },
  { id: 6, name: 'Chino Shorts', price: 58, category: 'Men', color: 'Olive', size: ['S', 'M', 'L'], rating: 4.4, image: 'Chino shorts' },
  { id: 7, name: 'Silk Scarf', price: 36, category: 'Accessories', color: 'Multi', size: ['One Size'], rating: 4.9, image: 'Silk scarf' },
  { id: 8, name: 'Wool Blend Blazer', price: 148, category: 'Women', color: 'Charcoal', size: ['S', 'M', 'L'], rating: 4.7, image: 'Wool blazer' },
  { id: 9, name: 'Relaxed Fit Jeans', price: 82, category: 'Men', color: 'Indigo', size: ['30', '32', '34', '36'], rating: 4.5, image: 'Relaxed jeans' },
  { id: 10, name: 'Leather Belt', price: 45, category: 'Accessories', color: 'Black', size: ['S', 'M', 'L'], rating: 4.6, image: 'Leather belt' },
  { id: 11, name: 'Knit Polo', price: 64, category: 'Men', color: 'Navy', size: ['S', 'M', 'L', 'XL'], rating: 4.3, image: 'Knit polo' },
  { id: 12, name: 'Midi Wrap Dress', price: 112, category: 'Women', color: 'Sage', size: ['XS', 'S', 'M', 'L'], rating: 4.8, image: 'Wrap dress' },
]

export const categoriesFilter = ['All', 'Women', 'Men', 'Accessories']
const priceRanges = ['All', 'Under $50', '$50 - $100', 'Over $100']

export const sizes = ['XS', 'S', 'M', 'L', 'XL']
const colors = [
  { name: 'Sage', class: 'bg-success/40' },
  { name: 'Charcoal', class: 'bg-foreground/70' },
  { name: 'Ivory', class: 'bg-accent' },
]

export const reviews = [
  { name: 'Alex M.', rating: 5, date: 'March 2026', text: 'Beautiful quality fabric. Fits true to size and the color is exactly as pictured. Will definitely order more.' },
  { name: 'Jordan K.', rating: 4, date: 'February 2026', text: 'Great dress for everyday wear. Comfortable and versatile. The wrap style is very flattering.' },
  { name: 'Casey P.', rating: 5, date: 'January 2026', text: 'Exceeded expectations. The material feels premium and the stitching is impeccable. Fast shipping too.' },
]

export const initialItems: CartItem[] = [
  { id: 1, name: 'Midi Wrap Dress', size: 'M', color: 'Sage', price: 112, quantity: 1, image: 'Wrap dress' },
  { id: 2, name: 'Linen Blend Shirt', size: 'S', color: 'White', price: 68, quantity: 2, image: 'Linen shirt' },
  { id: 3, name: 'Leather Sandals', size: '8', color: 'Tan', price: 95, quantity: 1, image: 'Leather sandals' },
]
