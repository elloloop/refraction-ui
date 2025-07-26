#!/usr/bin/env node

const { program } = require('commander');
const axe = require('axe-core');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runAxe(url, options) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  // Inject axe
  await page.addScriptTag({ path: require.resolve('axe-core') });
  const results = await page.evaluate(async (opts) => {
    return await axe.run(document, opts);
  }, options);
  await browser.close();
  return results;
}

function formatConsole(results) {
  results.violations.forEach((v) => {
    console.log(`\n${v.help} (${v.id})`);
    console.log(v.description);
    v.nodes.forEach((n) => {
      console.log(`  ${n.target.join(' ')} - ${n.failureSummary}`);
    });
  });
  console.log(`\n${results.violations.length} violations`);
}

async function main() {
  program
    .argument('[patterns...]', 'component globs or URLs')
    .option('--storybook', 'treat patterns as Storybook stories')
    .option('--url', 'treat patterns as live URLs')
    .option('--json', 'output JSON to file')
    .option('--html', 'output HTML report to file')
    .option('--strict', 'exit with non-zero code on violations')
    .option('--rules <file>', 'path to custom axe rules module');

  program.parse();
  const opts = program.opts();
  const patterns = program.args.length ? program.args : ['http://localhost:6006'];

  const axeOptions = { runOnly: ['wcag2aa'] };
  if (opts.rules) {
    try {
      const custom = require(path.resolve(opts.rules));
      axe.configure(custom);
    } catch (e) {
      console.error('Failed to load custom rules:', e);
    }
  }

  let allViolations = [];

  for (const p of patterns) {
    const url = opts.url || opts.storybook || p.startsWith('http') ? p : `file://${path.resolve(p)}`;
    const results = await runAxe(url, axeOptions);
    const report = { url, ...results };
    allViolations.push(...results.violations);

    if (!opts.json && !opts.html) {
      console.log(`\nResults for ${url}`);
      formatConsole(results);
    }

    if (opts.json) {
      const out = path.resolve(typeof opts.json === 'string' ? opts.json : 'a11y-report.json');
      fs.writeFileSync(out, JSON.stringify(report, null, 2));
      console.log('JSON report written to', out);
    }

    if (opts.html) {
      const out = path.resolve(typeof opts.html === 'string' ? opts.html : 'a11y-report.html');
      const html = `<!doctype html><html><head><meta charset='utf-8'><title>A11y Report</title></head><body><pre>${JSON.stringify(report, null, 2)}</pre></body></html>`;
      fs.writeFileSync(out, html);
      console.log('HTML report written to', out);
    }
  }

  if (opts.strict && allViolations.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
