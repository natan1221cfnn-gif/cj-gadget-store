import fs from 'fs';

try {
  const raw = fs.readFileSync('./products.json', 'utf8');
  const products = JSON.parse(raw);
  console.log('Number of products in products.json:', products.length);
  products.forEach((p, idx) => {
    console.log(`Product ${idx + 1}: pid=${p.pid}, name=${p.productName}`);
  });
} catch (e) {
  console.error(e);
}
