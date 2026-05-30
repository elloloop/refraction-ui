const fs = require('fs');
const path = require('path');

// 1. Momento config
const momentoConfigPath = path.join(__dirname, '../src/app/examples/momento/config.tsx');
let mConfig = fs.readFileSync(momentoConfigPath, 'utf8');

mConfig = mConfig.replace(
  "avatar: 'You'", 
  "avatar: <img src=\"/assets/people/ea/ea-4-portrait.jpg\" className=\"w-full h-full object-cover rounded-full\" alt=\"You\" />"
).replace(
  "avatar: 'SA'", 
  "avatar: <img src=\"/assets/people/eu/eu-3-portrait.jpg\" className=\"w-full h-full object-cover rounded-full\" alt=\"SA\" />"
).replace(
  "avatar: 'MT'", 
  "avatar: <img src=\"/assets/people/af/af-1-portrait.jpg\" className=\"w-full h-full object-cover rounded-full\" alt=\"MT\" />"
).replace(
  "avatar: 'CJ'", 
  "avatar: <img src=\"/assets/people/am/am-2-portrait.jpg\" className=\"w-full h-full object-cover rounded-full\" alt=\"CJ\" />"
).replace(
  "avatar: 'FE'", 
  "avatar: <img src=\"/assets/people/ea/ea-2-portrait.jpg\" className=\"w-full h-full object-cover rounded-full\" alt=\"FE\" />"
).replace(
  "avatar: 'AD'", 
  "avatar: <img src=\"/assets/people/sa/sa-1-portrait.jpg\" className=\"w-full h-full object-cover rounded-full\" alt=\"AD\" />"
).replace(
  "avatar: 'NP'", 
  "avatar: <img src=\"/assets/people/me/me-1-portrait.jpg\" className=\"w-full h-full object-cover rounded-full\" alt=\"NP\" />"
).replace(
  "avatar: 'JM'", 
  "avatar: <img src=\"/assets/people/eu/eu-1-portrait.jpg\" className=\"w-full h-full object-cover rounded-full\" alt=\"JM\" />"
).replace(
  "avatar: 'AJ'", 
  "avatar: <img src=\"/assets/people/ea/ea-4-portrait.jpg\" className=\"w-full h-full object-cover rounded-full\" alt=\"AJ\" />"
);

mConfig = mConfig.replace(
  /imageColor: 'from-primary\/80 to-primary',/g, 
  "imageColor: 'from-primary/80 to-primary', imageNode: <img src=\"/assets/scenes/scene-cafe.jpg\" className=\"w-full h-full object-cover\" alt=\"Post\" />,"
).replace(
  /imageColor: 'from-accent to-primary\/60',/g, 
  "imageColor: 'from-accent to-primary/60', imageNode: <img src=\"/assets/scenes/scene-campus.jpg\" className=\"w-full h-full object-cover\" alt=\"Post\" />,"
).replace(
  /imageColor: 'from-primary to-accent',/g, 
  "imageColor: 'from-primary to-accent', imageNode: <img src=\"/assets/scenes/scene-kitchen.jpg\" className=\"w-full h-full object-cover\" alt=\"Post\" />,"
).replace(
  /imageColor: 'from-primary\/70 to-primary',/g, 
  "imageColor: 'from-primary/70 to-primary', imageNode: <img src=\"/assets/scenes/scene-office.jpg\" className=\"w-full h-full object-cover\" alt=\"Post\" />,"
).replace(
  /imageColor: 'from-accent to-primary',/g, 
  "imageColor: 'from-accent to-primary', imageNode: <img src=\"/assets/scenes/scene-park.jpg\" className=\"w-full h-full object-cover\" alt=\"Post\" />,"
).replace(
  /imageColor: 'from-primary to-primary\/60',/g, 
  "imageColor: 'from-primary to-primary/60', imageNode: <img src=\"/assets/scenes/scene-clinic.jpg\" className=\"w-full h-full object-cover\" alt=\"Post\" />,"
);
fs.writeFileSync(momentoConfigPath, mConfig);

// 2. Momento App Page
const mAppPagePath = path.join(__dirname, '../src/app/examples/momento/app/page.tsx');
let mAppPage = fs.readFileSync(mAppPagePath, 'utf8');
mAppPage = mAppPage.replace(
  /<svg className="h-12 w-12 text-white\/30"[\s\S]*?<\/svg>/,
  `{post.imageNode ? post.imageNode : (
                      <svg className="h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                    )}`
);
mAppPage = mAppPage.replace(
  /flex items-center justify-center`}/,
  `flex items-center justify-center overflow-hidden\`}`
);
fs.writeFileSync(mAppPagePath, mAppPage);

// 3. Momento Explore Page
const mExplorePath = path.join(__dirname, '../src/app/examples/momento/app/explore/page.tsx');
let mExplore = fs.readFileSync(mExplorePath, 'utf8');
mExplore = mExplore.replace(
  /className="\${item.span} bg-gradient-to-br \${item.color} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative group"/,
  `className="\${item.span} bg-gradient-to-br \${item.color} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative group overflow-hidden"
                >
                  <img src={\`/assets/scenes/scene-\${['cafe','campus','kitchen','office','park','clinic','hotel-lobby','store'][idx % 8]}.jpg\`} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80" />`
).replace('>\n                  <svg className="h-6 w-6', '>\n                  <svg className="h-6 w-6'); // noop to fix tag
fs.writeFileSync(mExplorePath, mExplore);

// 4. Momento Profile Page
const mProfilePath = path.join(__dirname, '../src/app/examples/momento/app/profile/page.tsx');
let mProfile = fs.readFileSync(mProfilePath, 'utf8');
mProfile = mProfile.replace(
  /className={`aspect-square bg-gradient-to-br \${color} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}/g,
  `className={\`aspect-square bg-gradient-to-br \${color} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative overflow-hidden\`}\n                  >\n                    <img src={\`/assets/scenes/scene-\${['cafe','campus','kitchen','office','park','clinic','hotel-lobby','store'][idx % 8]}.jpg\`} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80" />`
);
mProfile = mProfile.replace(
  /className={`aspect-\[9\/16\] bg-gradient-to-br \${color} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative`}/g,
  `className={\`aspect-[9/16] bg-gradient-to-br \${color} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative overflow-hidden\`}\n                  >\n                    <img src={\`/assets/people/\${['ea/ea-1','eu/eu-2','af/af-2','am/am-1','sa/sa-2','me/me-2','ea/ea-3','eu/eu-4','af/af-3'][idx % 9]}-portrait.jpg\`} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80" />`
);
fs.writeFileSync(mProfilePath, mProfile);


// 5. Teamspace config
const teamspaceConfigPath = path.join(__dirname, '../src/app/examples/teamspace/config.tsx');
let tConfig = fs.readFileSync(teamspaceConfigPath, 'utf8');

tConfig = tConfig.replace(
  "avatar: 'SK'", 
  "avatar: <img src=\"/assets/people/ea/ea-1-portrait.jpg\" className=\"w-full h-full object-cover rounded-[var(--radius)]\" alt=\"SK\" />"
).replace(
  "avatar: 'MR'", 
  "avatar: <img src=\"/assets/people/af/af-2-portrait.jpg\" className=\"w-full h-full object-cover rounded-[var(--radius)]\" alt=\"MR\" />"
).replace(
  "avatar: 'LM'", 
  "avatar: <img src=\"/assets/people/eu/eu-2-portrait.jpg\" className=\"w-full h-full object-cover rounded-[var(--radius)]\" alt=\"LM\" />"
).replace(
  "avatar: 'JC'", 
  "avatar: <img src=\"/assets/people/am/am-1-portrait.jpg\" className=\"w-full h-full object-cover rounded-[var(--radius)]\" alt=\"JC\" />"
).replace(
  "avatar: 'AP'", 
  "avatar: <img src=\"/assets/people/me/me-2-portrait.jpg\" className=\"w-full h-full object-cover rounded-[var(--radius)]\" alt=\"AP\" />"
).replace(
  /avatar: 'SK'/g, 
  "avatar: <img src=\"/assets/people/ea/ea-1-portrait.jpg\" className=\"w-full h-full object-cover rounded-[var(--radius)]\" alt=\"SK\" />"
).replace(
  /avatar: 'MR'/g, 
  "avatar: <img src=\"/assets/people/af/af-2-portrait.jpg\" className=\"w-full h-full object-cover rounded-[var(--radius)]\" alt=\"MR\" />"
).replace(
  /avatar: 'LM'/g, 
  "avatar: <img src=\"/assets/people/eu/eu-2-portrait.jpg\" className=\"w-full h-full object-cover rounded-[var(--radius)]\" alt=\"LM\" />"
).replace(
  /avatar: 'JC'/g, 
  "avatar: <img src=\"/assets/people/am/am-1-portrait.jpg\" className=\"w-full h-full object-cover rounded-[var(--radius)]\" alt=\"JC\" />"
).replace(
  /avatar: 'AP'/g, 
  "avatar: <img src=\"/assets/people/me/me-2-portrait.jpg\" className=\"w-full h-full object-cover rounded-[var(--radius)]\" alt=\"AP\" />"
);
fs.writeFileSync(teamspaceConfigPath, tConfig);

console.log('Patch completed successfully!');
