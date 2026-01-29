const { execSync } = require('child_process'); //afaka miexecuter commande systeme ( ng g c)
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const componentName = args[0];

if (!componentName) {
      console.error('Usage: node create-component.js <component-name>');
      process.exit(1);
}

const componentPath = `src/app/${componentName}`;

if (fs.existsSync(componentPath)) {
      console.error(`Le composant "${componentName}" existe déjà dans ${componentPath}`);
      process.exit(1);
}

const command = `ng g c ${componentName} --path=${componentPath} --style=none --flat`;

console.log(`Exécution: ${command}`);
execSync(command, { stdio: 'inherit' });
console.log(`Composant "${componentName}" créé avec succès ✅ `);
