const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node create-component.js <path/to/component> <component-name>');
  console.error('Example: node create-component.js admin/users user-list');
  process.exit(1);
}

const componentName = args[args.length - 1];
const componentPath = args.slice(0, -1).join('/');

const fullComponentPath = path.join('src', 'app', componentPath, componentName);

if (fs.existsSync(fullComponentPath)) {
  console.error(`Le composant "${componentName}" existe déjà dans ${fullComponentPath}`);
  process.exit(1);
}

const command = `ng g c ${componentPath}/${componentName} --style=none`;

console.log(`Exécution: ${command}`);
execSync(command, { stdio: 'inherit' });

console.log(`Composant "${componentName}" créé avec succès dans ${componentPath}/${componentName} ✅`);