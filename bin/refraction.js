#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const diff = require('diff');

const program = new Command();

program
  .name('refraction')
  .description('Refraction UI CLI')
  .version('0.1.0');

program
  .command('add <component>')
  .option('-v, --variant <variant>', 'component variant', 'primary')
  .option('--dry-run', 'preview files without writing')
  .option('--diff', 'show differences with existing files')
  .option('-f, --force', 'overwrite existing files')
  .action((component, options) => {
    const templateDir = path.join(__dirname, '..', 'templates', 'components', component);
    if (!fs.existsSync(templateDir)) {
      console.error(`Component template not found: ${component}`);
      process.exit(1);
    }
    const files = fs.readdirSync(templateDir);
    files.forEach(file => {
      const tplPath = path.join(templateDir, file);
      const destName = file.replace('.hbs', '').replace('{{name}}', capitalize(component));
      const destPath = path.join(process.cwd(), destName);
      const content = fs.readFileSync(tplPath, 'utf8');
      const rendered = ejs.render(content, { name: capitalize(component), variant: options.variant });
      if (options.diff && fs.existsSync(destPath)) {
        const existing = fs.readFileSync(destPath, 'utf8');
        const patch = diff.createPatch(destName, existing, rendered);
        console.log(patch);
      }
      if (!options.dryRun) {
        if (fs.existsSync(destPath) && !options.force) {
          console.error(`File exists: ${destPath}. Use --force to overwrite.`);
        } else {
          fs.writeFileSync(destPath, rendered, 'utf8');
          console.log(`Created ${destPath}`);
        }
      } else {
        console.log(`[dry-run] Write ${destPath}`);
      }
    });
  });

program.parse(process.argv);

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
