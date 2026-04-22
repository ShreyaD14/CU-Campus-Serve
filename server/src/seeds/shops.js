// shops.js — all 37 shops mapped to cluster names
const SHOPS = [
  // Cluster: C3 Main Ground
  { cluster: 'C3 Main Ground', name: "Domino's Pizza",      description: 'Freshly baked pizzas and garlic breads', cuisine: 'Pizza,Fast Food', rating: 4.3, time: 25, min: 149 },
  { cluster: 'C3 Main Ground', name: 'Burger Singh',        description: 'Desi twist on classic burgers', cuisine: 'Burgers,Fast Food', rating: 4.1, time: 20, min: 99 },
  { cluster: 'C3 Main Ground', name: 'Taste of Italy',      description: 'Authentic Italian pasta and pizzas', cuisine: 'Italian,Pizza', rating: 4.0, time: 30, min: 120 },
  { cluster: 'C3 Main Ground', name: 'Momos and More',      description: 'Steamed, fried and tandoori momos', cuisine: 'Momos,Chinese', rating: 4.4, time: 15, min: 60 },
  { cluster: 'C3 Main Ground', name: 'Golden Fork',         description: 'Multi-cuisine comfort food', cuisine: 'Multi-cuisine', rating: 3.9, time: 25, min: 80 },
  { cluster: 'C3 Main Ground', name: 'Juice and Bites',     description: 'Fresh juices, smoothies and light snacks', cuisine: 'Juices,Healthy', rating: 4.2, time: 10, min: 40 },
  { cluster: 'C3 Main Ground', name: 'Sip Sip Spot',        description: 'Bubble teas, cold coffees and shakes', cuisine: 'Beverages,Desserts', rating: 4.5, time: 10, min: 50 },
  { cluster: 'C3 Main Ground', name: 'Roll Corner',         description: 'Kathi rolls and wraps with desi fillings', cuisine: 'Rolls,Wraps', rating: 4.2, time: 15, min: 60 },
  { cluster: 'C3 Main Ground', name: "Wenky's",             description: 'Student-favourite snacks and maggie', cuisine: 'Snacks,Fast Food', rating: 3.8, time: 10, min: 40 },
  { cluster: 'C3 Main Ground', name: 'Ice Cream Parlour',   description: 'Scoops, sundaes and kulfi varieties', cuisine: 'Ice Cream,Desserts', rating: 4.6, time: 5,  min: 30 },
  { cluster: 'C3 Main Ground', name: 'Basil',               description: 'Fresh salads, soups and healthy bowls', cuisine: 'Healthy,Salads', rating: 4.1, time: 20, min: 90 },
  { cluster: 'C3 Main Ground', name: 'Samosa Express',      description: 'Samosas, chaat and street food', cuisine: 'Street Food,Snacks', rating: 4.3, time: 10, min: 30 },
  { cluster: 'C3 Main Ground', name: 'Bunkers',             description: 'Loaded sandwiches and club subs', cuisine: 'Sandwiches,Fast Food', rating: 4.0, time: 15, min: 70 },
  { cluster: 'C3 Main Ground', name: 'Chinese Wok',         description: 'Noodles, fried rice and manchurian', cuisine: 'Chinese,Asian', rating: 4.2, time: 20, min: 80 },
  { cluster: 'C3 Main Ground', name: 'Healthy Bowl',        description: 'Nutritious bowls and protein-packed meals', cuisine: 'Healthy,Vegan', rating: 4.0, time: 20, min: 100 },
  { cluster: 'C3 Main Ground', name: 'Chai Sutta Bar',      description: 'Chai in Kulhad with snacks and Maggie', cuisine: 'Chai,Snacks', rating: 4.7, time: 8,  min: 30 },

  // Cluster: DSW Area
  { cluster: 'DSW Area', name: 'Juice Shop',         description: 'Pure fruit juices and health drinks', cuisine: 'Juices,Health', rating: 4.2, time: 8, min: 30 },
  { cluster: 'DSW Area', name: 'Trending Foods',     description: 'Trending campus food items daily', cuisine: 'Fast Food,Snacks', rating: 3.9, time: 15, min: 50 },
  { cluster: 'DSW Area', name: 'Tibet Food Shop',    description: 'Authentic Tibetan thukpa and momos', cuisine: 'Tibetan,Momos', rating: 4.4, time: 20, min: 70 },
  { cluster: 'DSW Area', name: 'Maharaja Foods',     description: 'North Indian thalis and dhabha food', cuisine: 'North Indian,Thali', rating: 4.1, time: 25, min: 80 },
  { cluster: 'DSW Area', name: 'PaniPuri Spot',      description: 'Golgappe, bhel puri and papdi chaat', cuisine: 'Chat,Street Food', rating: 4.5, time: 5, min: 20 },
  { cluster: 'DSW Area', name: 'Pav Bhaji Corner',   description: 'Mumbai-style pav bhaji and vada pav', cuisine: 'Mumbai,Street Food', rating: 4.3, time: 15, min: 50 },
  { cluster: 'DSW Area', name: 'Sandwich Hub',       description: 'Grilled sandwiches and toasts', cuisine: 'Sandwiches,Snacks', rating: 4.0, time: 12, min: 40 },
  { cluster: 'DSW Area', name: 'Maggie Point',       description: 'Maggie, instant noodles and soup', cuisine: 'Snacks,Fast Food', rating: 3.8, time: 8, min: 20 },

  // Cluster: A3 Block
  { cluster: 'A3 Block', name: 'Mummy Di Roti',        description: 'Homestyle dal-roti and sabzi', cuisine: 'North Indian,Roti', rating: 4.5, time: 20, min: 80 },
  { cluster: 'A3 Block', name: 'Chefs on Fire',         description: 'Live tawa cooking and grills', cuisine: 'Grills,North Indian', rating: 4.2, time: 25, min: 100 },
  { cluster: 'A3 Block', name: 'Vada Pav Wale',         description: 'Mumbai vada pav with green chutney', cuisine: 'Mumbai,Street Food', rating: 4.4, time: 8, min: 20 },
  { cluster: 'A3 Block', name: 'Rajma Chawal Corner',   description: 'Classic Punjabi rajma chawal', cuisine: 'Punjabi,North Indian', rating: 4.6, time: 20, min: 70 },
  { cluster: 'A3 Block', name: 'South Indian Express',  description: 'Dosa, idli, vada and sambhar', cuisine: 'South Indian,Dosa', rating: 4.3, time: 20, min: 60 },

  // Cluster: South Campus
  { cluster: 'South Campus', name: 'Deccan Dose',      description: 'Authentic Hyderabadi dosa and filter coffee', cuisine: 'South Indian,Dosa', rating: 4.4, time: 20, min: 70 },
  { cluster: 'South Campus', name: 'Shanti Biryani',   description: 'Slow-cooked dum biryani varieties', cuisine: 'Biryani,North Indian', rating: 4.7, time: 35, min: 120 },
  { cluster: 'South Campus', name: 'Mughlai Darbar',   description: 'Rich Mughlai curries and kebabs', cuisine: 'Mughlai,Non-veg', rating: 4.3, time: 30, min: 130 },
  { cluster: 'South Campus', name: 'Punjabi Dhaba',    description: 'Tandoor roti, lassi and butter chicken', cuisine: 'Punjabi,North Indian', rating: 4.5, time: 25, min: 100 },

  // Cluster: Gate 2
  { cluster: 'Gate 2', name: 'Nescafe',          description: 'Nescafe coffee and quick bites', cuisine: 'Cafe,Coffee', rating: 4.0, time: 10, min: 50 },
  { cluster: 'Gate 2', name: 'HorseShoe Cafe',   description: 'Artisan coffee, waffles and pastries', cuisine: 'Cafe,Desserts', rating: 4.6, time: 15, min: 80 },
  { cluster: 'Gate 2', name: 'Brew Lab Cafe',    description: 'Cold brew, pour-over and specialty coffee', cuisine: 'Cafe,Coffee', rating: 4.5, time: 12, min: 60 },
];

module.exports = { SHOPS };
