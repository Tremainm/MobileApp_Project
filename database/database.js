// database.js
// - Purpose: Initialises the SQLite database, runs table migrations, and seeds on first launch.
// - Called by <SQLiteProvider onInit={initDatabase}> in App.js.
//   SQLiteProvider resolves the promise before rendering children, so by the time
//   PantryProvider mounts the DB is fully ready.
//
// SQL concepts:
//   CREATE TABLE IF NOT EXISTS pantry_items (...)
//   INSERT INTO meta (key, value) VALUES (?, ?)  - migration version flag
//   INSERT INTO pantry_items (...)               - seed data on first launch

function getDateFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const SEED_ITEMS = [
  { id: '1', name: 'Whole Milk', category: 'Dairy', quantity: 1, unit: 'litre', location: 'Fridge', expiryDate: getDateFromNow(2) },
  { id: '2', name: 'Cheddar Cheese', category: 'Dairy', quantity: 500, unit: 'g', location: 'Fridge',  expiryDate: getDateFromNow(12) },
  { id: '3', name: 'Whole Wheat Bread', category: 'Bakery', quantity: 1, unit: 'loaf', location: 'Pantry', expiryDate: getDateFromNow(5) },
  { id: '4', name: 'Sourdough Loaf', category: 'Bakery', quantity: 1, unit: 'loaf', location: 'Pantry', expiryDate: getDateFromNow(-1) },
  { id: '5', name: 'Broccoli', category: 'Produce', quantity: 2, unit: 'heads', location: 'Fridge', expiryDate: getDateFromNow(3) },
  { id: '6', name: 'Bananas', category: 'Produce', quantity: 6, unit: 'pcs', location: 'Counter', expiryDate: getDateFromNow(6) },
  { id: '7', name: 'Greek Yogurt', category: 'Dairy', quantity: 150, unit: 'ml', location: 'Fridge', expiryDate: getDateFromNow(8) },
  { id: '8', name: 'Orange Juice', category: 'Drinks', quantity: 1, unit: 'litre', location: 'Fridge', expiryDate: getDateFromNow(7) },
  { id: '9', name: 'Pasta', category: 'Dry Goods', quantity: 500, unit: 'g', location: 'Pantry', expiryDate: getDateFromNow(180) },
  { id: '10', name: 'Tinned Tomatoes', category: 'Dry Goods', quantity: 3, unit: 'cans', location: 'Pantry', expiryDate: null },
];

// Init
export async function initDatabase(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pantry_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      location TEXT NOT NULL,
      expiryDate TEXT,
      mongoId TEXT
    );

    CREATE TABLE IF NOT EXISTS basket_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      mongoId TEXT
    );
  `);

  // Only seed on first launch - version flag acts as a migration marker.
  // Increment the version string when adding new migrations in future.
  const versionRow = await db.getFirstAsync(
    "SELECT value FROM meta WHERE key = 'db_version'"
  );

  if (!versionRow) {
    await seedDatabase(db);
    await db.runAsync(
      "INSERT INTO meta (key, value) VALUES ('db_version', '1')"
    );
  }
}

async function seedDatabase(db) {
  for (const item of SEED_ITEMS) {
    await db.runAsync(
      'INSERT INTO pantry_items (id, name, category, quantity, unit, location, expiryDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [item.id, item.name, item.category, item.quantity, item.unit, item.location, item.expiryDate ?? null]
    );
  }
}