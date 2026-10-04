#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const {pathToFileURL} = require('node:url');

function argsOf(argv) {
  if (argv.length < 2) throw new Error('Usage: node check_page.cjs <html> <output-dir> [--playwright-module <path>] [--browser-path <path>]');
  const result = {file: path.resolve(argv[0]), output: path.resolve(argv[1])};
  for (let i = 2; i < argv.length; i += 2) {
    if (!argv[i + 1]) throw new Error('Missing value for ' + argv[i]);
    if (argv[i] === '--playwright-module') result.module = path.resolve(argv[i + 1]);
    else if (argv[i] === '--browser-path') result.browser = path.resolve(argv[i + 1]);
    else throw new Error('Unknown option: ' + argv[i]);
  }
  return result;
}

async function check(args) {
  await fs.access(args.file);
  if (path.extname(args.file).toLowerCase() !== '.html') throw new Error('Input must be a local .html file');
  const {chromium} = require(args.module || 'playwright');
  await fs.mkdir(args.output, {recursive: true});
  let browser;
  try {
    browser = await chromium.launch({headless: true, ...(args.browser ? {executablePath: args.browser} : {})});
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400) errors.push('HTTP ' + response.status() + ': ' + response.url());
    });
    page.on('requestfailed', request => errors.push('Request failed: ' + request.url()));
    const checks = [];
    for (const width of [1280, 768, 390, 320]) {
      await page.setViewportSize({width, height: 1000});
      await page.goto(pathToFileURL(args.file).href, {waitUntil: 'load'});
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => {
        await Promise.all([...document.images].map(img => img.decode().catch(() => null)));
      });
      const check = await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
        const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
        const links = [...document.querySelectorAll('a[href^="#"]')];
        const missingAnchors = links.map(el => el.getAttribute('href')).filter(href => {
          if (href === '#') return true;
          try {return !document.getElementById(decodeURIComponent(href.slice(1)));}
          catch {return true;}
        });
        const overflow = [...document.querySelectorAll('body *')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
        }).map(el => el.tagName + (el.id ? '#' + el.id : '') + '.' + String(el.className));
        const brokenImages = [...document.images].filter(img => !img.complete || img.naturalWidth === 0)
          .map(img => img.getAttribute('src'));
        const paragraphs = [...document.querySelectorAll('main p')];
        return {
          viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          duplicateIds: duplicates, missingAnchors, overflow, brokenImages,
          visibleCharacters: (document.querySelector('main')?.innerText || document.body.innerText).replace(/\s/g, '').length,
          longParagraphs: paragraphs.filter(el => el.innerText.replace(/\s/g, '').length > 80)
            .map(el => el.innerText.slice(0, 100))
        };
      });
      check.width = width;
      check.passed = !check.overflow.length && check.scrollWidth <= width + 1 &&
        !check.duplicateIds.length && !check.missingAnchors.length && !check.brokenImages.length;
      checks.push(check);
      await page.screenshot({path: path.join(args.output, String(width) + '_full.png'), fullPage: true});
    }
    const passed = checks.every(item => item.passed) && !errors.length;
    const report = {passed, checks, browserErrors: [...new Set(errors)]};
    await fs.writeFile(path.join(args.output, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    return passed ? 0 : 1;
  } finally {
    if (browser) await browser.close();
  }
}

(async () => {
  let args;
  try {args = argsOf(process.argv.slice(2));}
  catch (error) {process.stderr.write(error.message + '\n');process.exitCode = 2;return;}
  try {process.exitCode = await check(args);}
  catch (error) {process.stderr.write('Page check failed: ' + error.message + '\n');process.exitCode = 2;}
})();
