const fs = require('fs');

const servicesFile = 'src/lib/services.ts';
const catalogFile = 'parsed_whatsapp_catalog.txt';

let servicesContent = fs.readFileSync(servicesFile, 'utf8');
let catalogContent = fs.readFileSync(catalogFile, 'utf8');

// Parse catalog
const catalogItems = [];
const blocks = catalogContent.split('---------------------------------------------');
for (const block of blocks) {
  const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l !== '');
  if (lines.length >= 3) {
    let name = lines[0].replace(/\*/g, '').replace(/[🚁🛳️✨]/g, '').trim();
    let price = parseInt(lines[1], 10);
    let descLines = lines.slice(2);
    let description = descLines.join('\\n'); // save newlines as \n literal to inject in template string
    catalogItems.push({ name, price, description });
  }
}

// Extract existing services
const regex = /export const SERVICES: ServiceItem\[\] = \[([\s\S]*?)\]/;
const match = servicesContent.match(regex);
if (!match) {
  console.error("Could not find SERVICES array");
  process.exit(1);
}

const existingServicesStr = match[1];
// simple parser for existing services
const itemsMatches = [...existingServicesStr.matchAll(/\{\s*name:\s*['"]([^'"]+)['"]\s*,\s*price:\s*(\d+)\s*,\s*cost:\s*(\d+)(?:\s*,\s*description:\s*`([\s\S]*?)`)?\s*}/g)];

const existingServices = itemsMatches.map(m => ({
  name: m[1],
  price: parseInt(m[2], 10),
  cost: parseInt(m[3], 10),
  description: m[4] || ''
}));

// Normalize helper
function normalize(s) {
  return (s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Update or add
for (const catItem of catalogItems) {
  const normCat = normalize(catItem.name);
  let found = false;
  for (const exItem of existingServices) {
    const normEx = normalize(exItem.name);
    // fuzzy match check: if significant part matches
    if (normCat.length > 5 && normEx.length > 5 && (normCat.includes(normEx) || normEx.includes(normCat))) {
      exItem.description = catItem.description;
      if (catItem.price > 0 && catItem.price !== exItem.price) {
        exItem.price = catItem.price;
      }
      found = true;
      break;
    }
  }
  if (!found && catItem.name && catItem.price > 0) {
    existingServices.push({
      name: catItem.name,
      price: catItem.price,
      cost: Math.floor(catItem.price * 0.7), // rough estimate
      description: catItem.description
    });
  }
}

// Sort alphabetically
existingServices.sort((a, b) => a.name.localeCompare(b.name));

// Rebuild SERVICES string
const newItemsStr = existingServices.map(item => {
  if (item.description) {
    return `  { name: '${item.name}', price: ${item.price}, cost: ${item.cost}, description: \`${item.description.replace(/`/g, "\\`")}\` }`;
  }
  return `  { name: '${item.name}', price: ${item.price}, cost: ${item.cost} }`;
}).join(',\n');

const newServicesContent = servicesContent.replace(regex, `export const SERVICES: ServiceItem[] = [\n${newItemsStr}\n]`);

fs.writeFileSync(servicesFile, newServicesContent);
console.log(`Updated ${servicesFile} with ${catalogItems.length} products from catalog.`);
