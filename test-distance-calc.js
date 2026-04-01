// Test Haversine distance calculation
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const coords = {
  'san-jose': [37.3382, -121.8863],
  'san-francisco': [37.7749, -122.4194],
  'oakland': [37.8044, -122.2712],
  'sacramento': [38.5816, -121.4944],
  'fresno': [36.7378, -119.7871],
  'concord': [37.9780, -122.0311],
};

// Test case 1: User in Concord (should select Concord)
const concordLat = 37.9780;
const concordLng = -122.0311;

console.log('\n=== Test Case 1: User in Concord ===');
console.log('User coords:', concordLat, concordLng);

let nearest = 'san-jose';
let minDist = Infinity;

Object.entries(coords).forEach(([city, [clat, clng]]) => {
  const distance = getDistance(concordLat, concordLng, clat, clng);
  console.log(`Distance to ${city}: ${distance.toFixed(2)} km`);
  if (distance < minDist) {
    minDist = distance;
    nearest = city;
  }
});

console.log('Nearest city:', nearest);
console.log('Expected: concord');
console.log('PASS:', nearest === 'concord' ? '✓' : '✗');

// Test case 2: User in Oakland (should select Oakland)
const oaklandLat = 37.8044;
const oaklandLng = -122.2712;

console.log('\n=== Test Case 2: User in Oakland ===');
console.log('User coords:', oaklandLat, oaklandLng);

nearest = 'san-jose';
minDist = Infinity;

Object.entries(coords).forEach(([city, [clat, clng]]) => {
  const distance = getDistance(oaklandLat, oaklandLng, clat, clng);
  console.log(`Distance to ${city}: ${distance.toFixed(2)} km`);
  if (distance < minDist) {
    minDist = distance;
    nearest = city;
  }
});

console.log('Nearest city:', nearest);
console.log('Expected: oakland');
console.log('PASS:', nearest === 'oakland' ? '✓' : '✗');

// Test case 3: User in San Jose (should select San Jose)
const sjLat = 37.3382;
const sjLng = -121.8863;

console.log('\n=== Test Case 3: User in San Jose ===');
console.log('User coords:', sjLat, sjLng);

nearest = 'san-jose';
minDist = Infinity;

Object.entries(coords).forEach(([city, [clat, clng]]) => {
  const distance = getDistance(sjLat, sjLng, clat, clng);
  console.log(`Distance to ${city}: ${distance.toFixed(2)} km`);
  if (distance < minDist) {
    minDist = distance;
    nearest = city;
  }
});

console.log('Nearest city:', nearest);
console.log('Expected: san-jose');
console.log('PASS:', nearest === 'san-jose' ? '✓' : '✗');
