// components/publicApi.js
// Pure helpers for mapping Open Food Facts API responses to app data structures.

const OFF_URL = 'https://world.openfoodfacts.org/api/v0/product';

// Fetch product data for a given barcode. Returns null if not found.
export async function lookupBarcode(barcode) {
  const res = await fetch(`${OFF_URL}/${barcode}.json`, {
    method: 'GET',
    headers: { 'User-Agent': 'PantryManager/1.0' },
  });
  if (!res.ok) throw new Error(`API responded ${res.status}`);
  const data = await res.json();
  if (data.status === 0) return null;
  return data.product;
}

// Map Open Food Facts category tags to our app categories.
// Checks all tags joined together so e.g. "en:long-grain-rice" matches Dry Goods.
export function mapApiCategory(tags) {
  if (!tags || tags.length === 0) return '';
  const joined = tags.join(' ').toLowerCase();

  // Dairy - check before drinks so "milk" doesn't fall into drinks
  if (joined.includes('dairy') || joined.includes(':milk') || joined.includes('milks') ||
      joined.includes('cheese') || joined.includes('yogurt') || joined.includes('yoghurt') ||
      joined.includes('butter') || joined.includes('cream') || joined.includes('kefir')) return 'Dairy';

  // Bakery
  if (joined.includes('bread') || joined.includes('biscuit') || joined.includes('cake') ||
      joined.includes('pastry') || joined.includes('bak') || joined.includes('loaf') ||
      joined.includes('roll') || joined.includes('cracker') || joined.includes('wafer')) return 'Bakery';

  // Meat & fish
  if (joined.includes('meat') || joined.includes('beef') || joined.includes('pork') ||
      joined.includes('chicken') || joined.includes('poultry') || joined.includes('fish') ||
      joined.includes('seafood') || joined.includes('salmon') || joined.includes('tuna') ||
      joined.includes('lamb') || joined.includes('sausage') || joined.includes('bacon')) return 'Meat';

  // Frozen
  if (joined.includes('frozen') || joined.includes('ice-cream') || joined.includes('ice cream')) return 'Frozen';

  // Dry Goods - grains, pasta, rice, cereals, canned goods, pulses
  if (joined.includes('rice') || joined.includes('pasta') || joined.includes('noodle') ||
      joined.includes('cereal') || joined.includes('grain') || joined.includes('flour') ||
      joined.includes('oat') || joined.includes('lentil') || joined.includes('bean') ||
      joined.includes('chickpea') || joined.includes('canned') || joined.includes('tinned') ||
      joined.includes('dried') || joined.includes('legume') || joined.includes('pulse') ||
      joined.includes('soup') || joined.includes('sauce') || joined.includes('condiment') ||
      joined.includes('oil') || joined.includes('vinegar') || joined.includes('spice') ||
      joined.includes('sugar') || joined.includes('salt') || joined.includes('snack') ||
      joined.includes('chocolate') || joined.includes('jam') || joined.includes('spread') ||
      joined.includes('nut') || joined.includes('seed')) return 'Dry Goods';

  // Produce - fruit and veg
  if (joined.includes('fruit') || joined.includes('vegetable') || joined.includes('produce') ||
      joined.includes('fresh') || joined.includes('salad') || joined.includes('herb') ||
      joined.includes('apple') || joined.includes('banana') || joined.includes('orange') ||
      joined.includes('potato') || joined.includes('onion') || joined.includes('tomato')) return 'Produce';

  // Drinks - last so milk/juice products don't accidentally match here
  if (joined.includes('beverage') || joined.includes('drink') || joined.includes('juice') ||
      joined.includes('water') || joined.includes('soda') || joined.includes('cola') ||
      joined.includes('beer') || joined.includes('wine') || joined.includes('coffee') ||
      joined.includes('tea') || joined.includes('smoothie') || joined.includes('energy-drink')) return 'Drinks';

  return ''; // Return empty string so the field stays unset rather than wrong
}

// Parse Open Food Facts quantity - tries every field the API may populate.
export function parseQuantity(product) {
  const unitMap = { l: 'litre', cl: 'ml', oz: 'g', lb: 'kg' };

  function extractFromString(raw) {
    if (!raw) return null;
    // Handle "6 x 330 ml" - take the last number+unit pair
    const matches = [...raw.matchAll(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|cl|oz|lb|pcs|pack|bottle|can|box)/gi)];
    const match = matches[matches.length - 1];
    if (!match) return null;
    const rawUnit = match[2].toLowerCase();
    return { quantity: match[1], unit: unitMap[rawUnit] || rawUnit };
  }

  const packageSources = [
    product.quantity,         // e.g. "500 g" or "1 l" - most reliable
    product.product_quantity, // e.g. "500" - sometimes populated separately
  ];

  for (const src of packageSources) {
    const result = extractFromString(String(src || ''));
    if (result && result.quantity) return result;
  }

  // Try numeric quantity + separate unit field as last resort
  if (product.product_quantity && product.quantity_unit) {
    const rawUnit = product.quantity_unit.toLowerCase();
    return { quantity: String(product.product_quantity), unit: unitMap[rawUnit] || rawUnit };
  }

  // Quantity genuinely not available for this product - leave blank for user to fill in
  return { quantity: '', unit: '' };
}
