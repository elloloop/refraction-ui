import { spawn } from 'child_process';

async function waitForServer(url) {
  while (true) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        try {
          JSON.parse(text);
          console.log(`[READY] ${url} is up and serving valid JSON!`);
          return;
        } catch (e) {
          // not json
        }
      }
    } catch (e) {
      // connection refused
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

(async () => {
  console.log("Starting React Storybook...");
  const react = spawn('pnpm', ['run', 'storybook'], { stdio: 'ignore', detached: true });
  react.unref();
  
  console.log("Starting Astro Storybook...");
  const astro = spawn('pnpm', ['run', 'storybook:astro'], { stdio: 'ignore', detached: true });
  astro.unref();

  console.log("Waiting for Storybooks to finish building...");
  await Promise.all([
    waitForServer('http://localhost:6006/index.json'),
    waitForServer('http://localhost:6008/index.json')
  ]);

  console.log("Both dev servers are ready! Running DOM analysis script...");
  const analysis = spawn('node', ['scripts/analyze-stories-dom.mjs'], { stdio: 'inherit' });
  
  analysis.on('close', (code) => {
    console.log("Analysis finished with code", code);
    try { process.kill(-react.pid); } catch(e){}
    try { process.kill(-astro.pid); } catch(e){}
    process.exit(code);
  });
})();
