const { db, initializeDatabase } = require('../config/database');
const { CLUSTERS } = require('./clusters');
const { SHOPS } = require('./shops');
const { MENUS } = require('./menus');
const { HOSTELS, PICKUP_POINTS } = require('./locations');
const { DEMO_USERS } = require('./users');

function runSeeds() {
  initializeDatabase();

  const already = db.prepare("SELECT value FROM seed_meta WHERE key = 'seeded'").get();
  if (already) {
    console.log('✅ Database already seeded. Skipping...');
    return;
  }

  const seedAll = db.transaction(() => {
    // Seed users
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (phone, name, uid, role) VALUES (?, ?, ?, ?)
    `);
    for (const u of DEMO_USERS) {
      insertUser.run(u.phone, u.name, u.uid, u.role);
    }
    console.log(`✅ Seeded ${DEMO_USERS.length} users`);

    // Seed delivery agents (for delivery role users)
    const deliveryUsers = db.prepare("SELECT id FROM users WHERE role = 'delivery'").all();
    const insertAgent = db.prepare(`
      INSERT OR IGNORE INTO delivery_agents (user_id, is_available) VALUES (?, 1)
    `);
    for (const u of deliveryUsers) insertAgent.run(u.id);
    console.log(`✅ Seeded ${deliveryUsers.length} delivery agents`);

    // Seed clusters
    const insertCluster = db.prepare(`
      INSERT INTO clusters (name, description, latitude, longitude, icon) VALUES (?, ?, ?, ?, ?)
    `);
    for (const c of CLUSTERS) {
      insertCluster.run(c.name, c.description, c.latitude, c.longitude, c.icon);
    }
    console.log(`✅ Seeded ${CLUSTERS.length} clusters`);

    // Seed locations
    const insertLoc = db.prepare(`
      INSERT INTO locations (name, type, latitude, longitude, description) VALUES (?, ?, ?, ?, ?)
    `);
    for (const l of [...HOSTELS, ...PICKUP_POINTS]) {
      insertLoc.run(l.name, l.type, l.latitude, l.longitude, l.description);
    }
    console.log(`✅ Seeded ${HOSTELS.length + PICKUP_POINTS.length} locations`);

    // Seed shops + menus
    const vendorUser = db.prepare("SELECT id FROM users WHERE role = 'vendor' LIMIT 1").get();
    const insertShop = db.prepare(`
      INSERT INTO shops (cluster_id, vendor_id, name, description, image_url, cuisine_tags, rating, avg_delivery_time, min_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMenuItem = db.prepare(`
      INSERT INTO menu_items (shop_id, name, description, price, category, is_veg, is_available, is_bestseller)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `);

    let shopCount = 0, menuCount = 0;
    for (const shop of SHOPS) {
      const cluster = db.prepare('SELECT id FROM clusters WHERE name = ?').get(shop.cluster);
      if (!cluster) continue;

      let specificVendor = null;
      if (shop.name === 'Deccan Dose') specificVendor = db.prepare('SELECT id FROM users WHERE phone = ?').get('9000000011');
      if (shop.name === 'Shanti Biryani') specificVendor = db.prepare('SELECT id FROM users WHERE phone = ?').get('9000000012');
      if (shop.name === 'Chai Sutta Bar') specificVendor = db.prepare('SELECT id FROM users WHERE phone = ?').get('9000000013');
      if (shop.name === 'Rajma Chawal Corner') specificVendor = db.prepare('SELECT id FROM users WHERE phone = ?').get('9000000014');
      if (shop.name === 'Punjabi Dhaba') specificVendor = db.prepare('SELECT id FROM users WHERE phone = ?').get('9000000015');

      const result = insertShop.run(
        cluster.id, specificVendor ? specificVendor.id : (vendorUser ? vendorUser.id : null),
        shop.name, shop.description, generateImageFromCuisine(shop.cuisine), shop.cuisine,
        shop.rating, shop.time, shop.min
      );
      shopCount++;
      const shopId = result.lastInsertRowid;
      const items = MENUS[shop.name] || [];
      for (const item of items) {
        insertMenuItem.run(
          shopId, item.name, item.description, item.price,
          item.category, item.isVeg ? 1 : 0, item.isBestseller ? 1 : 0
        );
        menuCount++;
      }
    }
    console.log(`✅ Seeded ${shopCount} shops with ${menuCount} menu items`);

    // Mark seeded
    db.prepare("INSERT INTO seed_meta (key, value) VALUES ('seeded', 'true')").run();
  });

  seedAll();
  console.log('\n🎉 All seed data inserted successfully!');
  console.log('\n📱 Demo Login Numbers:');
  for (const u of DEMO_USERS) {
    console.log(`   ${u.role.padEnd(10)} → Phone: ${u.phone}  (OTP: any 6 digits)`);
  }
}

function generateImageFromCuisine(cuisine) {
  const q = (cuisine || '').toLowerCase();
  if (q.includes('pizza') || q.includes('italian')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80';
  if (q.includes('burger') || q.includes('fast')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80';
  if (q.includes('cafe') || q.includes('coffee')) return 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80';
  if (q.includes('chinese') || q.includes('asian')) return 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80';
  if (q.includes('south indian') || q.includes('dosa')) return 'https://images.unsplash.com/photo-1610196597159-baf9ce925434?w=800&q=80';
  if (q.includes('punjabi') || q.includes('north indian')) return 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80';
  if (q.includes('dessert') || q.includes('ice cream')) return 'https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?w=800&q=80';
  if (q.includes('juice') || q.includes('health')) return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80';
  if (q.includes('biryani')) return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80';
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';
}

runSeeds();
module.exports = { runSeeds };
