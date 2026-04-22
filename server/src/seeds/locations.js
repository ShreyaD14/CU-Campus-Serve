// All campus locations: Chandigarh University, Gharuan, Mohali
// Campus center: ~30.7714° N, 76.5762° E

const HOSTELS = [
  { name: 'Zakir Hostel A', type: 'hostel', latitude: 30.7728, longitude: 76.5748, description: 'Boys Hostel Block A' },
  { name: 'Zakir Hostel B', type: 'hostel', latitude: 30.7731, longitude: 76.5752, description: 'Boys Hostel Block B' },
  { name: 'Zakir Hostel C', type: 'hostel', latitude: 30.7734, longitude: 76.5756, description: 'Boys Hostel Block C' },
  { name: 'Zakir Hostel D', type: 'hostel', latitude: 30.7737, longitude: 76.5760, description: 'Boys Hostel Block D' },
  { name: 'Tagore Hostel',  type: 'hostel', latitude: 30.7720, longitude: 76.5775, description: 'Boys Hostel - Tagore Block' },
  { name: 'Sukhna Hostel',  type: 'hostel', latitude: 30.7708, longitude: 76.5780, description: 'Girls Hostel - Sukhna' },
  { name: 'Shivalik Hostel',type: 'hostel', latitude: 30.7700, longitude: 76.5770, description: 'Girls Hostel - Shivalik' },
  { name: 'Govind Hostel',  type: 'hostel', latitude: 30.7695, longitude: 76.5755, description: 'Boys Hostel - Govind' },
  { name: 'LC Hostel',      type: 'hostel', latitude: 30.7690, longitude: 76.5740, description: 'Ladies Controller Hostel' },
];

const PICKUP_POINTS = [
  { name: 'Near Fountain',         type: 'pickup_point', latitude: 30.7714, longitude: 76.5762, description: 'Central fountain area' },
  { name: 'Front of B1',           type: 'pickup_point', latitude: 30.7718, longitude: 76.5768, description: 'Academic Block B1 entrance' },
  { name: 'Gate 1',                type: 'pickup_point', latitude: 30.7740, longitude: 76.5720, description: 'Main entrance Gate 1' },
  { name: 'Gate 2',                type: 'pickup_point', latitude: 30.7745, longitude: 76.5730, description: 'Gate 2 - NH05 side' },
  { name: 'Gate 3',                type: 'pickup_point', latitude: 30.7750, longitude: 76.5745, description: 'Gate 3 - North side' },
  { name: 'Gate 4',                type: 'pickup_point', latitude: 30.7735, longitude: 76.5800, description: 'Gate 4 - East side' },
  { name: 'Front of A3',           type: 'pickup_point', latitude: 30.7710, longitude: 76.5758, description: 'Academic Block A3 entrance' },
  { name: 'Near DSW',              type: 'pickup_point', latitude: 30.7705, longitude: 76.5762, description: 'Dean Student Welfare office area' },
  { name: 'Front of B3',           type: 'pickup_point', latitude: 30.7722, longitude: 76.5772, description: 'Academic Block B3 entrance' },
  { name: 'C3 Main Ground',        type: 'pickup_point', latitude: 30.7698, longitude: 76.5748, description: 'C3 block main ground' },
  { name: 'Front of Star Building',type: 'pickup_point', latitude: 30.7708, longitude: 76.5790, description: 'Star building main entrance' },
  { name: 'Near B4',               type: 'pickup_point', latitude: 30.7725, longitude: 76.5780, description: 'Academic Block B4 area' },
  { name: 'Near KCC',              type: 'pickup_point', latitude: 30.7715, longitude: 76.5792, description: 'Knowledge Commerce Centre' },
  { name: 'South Campus Parking',  type: 'pickup_point', latitude: 30.7685, longitude: 76.5762, description: 'South campus parking area' },
];

module.exports = { HOSTELS, PICKUP_POINTS };
