import {test,expect} from '@playwright/test'
test('diagnostic compositor overflow',async({page})=>{
 test.setTimeout(180000)
 await page.goto('/components/composer');await page.waitForLoadState('networkidle')
 await page.waitForFunction(()=>document.fonts.status==='loaded'&&document.querySelectorAll('[data-highlighted="pending"]').length===0&&document.querySelectorAll('[data-highlighted="true"]').length>0)
 const metrics=()=>page.evaluate(()=>{
  const b=document.body,h=document.documentElement
  return {body:[b.scrollHeight,b.offsetHeight,b.clientHeight],html:[h.scrollHeight,h.offsetHeight,h.clientHeight],main:document.querySelector('main')?.getBoundingClientRect().toJSON(),nodes:[...document.querySelectorAll('script[data-nextjs-dev-overlay],nextjs-portal')].map(e=>({tag:e.tagName,rect:e.getBoundingClientRect().toJSON(),position:getComputedStyle(e).position,top:getComputedStyle(e).top,height:getComputedStyle(e).height,lineHeight:getComputedStyle(e).lineHeight,loading:e.shadowRoot?.querySelector('[data-next-mark-loading]')?.getAttribute('data-next-mark-loading')}))}
 })
 for(const phase of ['baseline','idle','anchored','overflow-probe']){
  if(phase==='idle'){await page.locator('nextjs-portal [data-next-mark-loading="false"]').first().waitFor();await expect(page.locator('nextjs-portal [data-next-badge][data-error="true"]')).toHaveCount(0)}
  if(phase==='anchored')await page.addStyleTag({content:'script[data-nextjs-dev-overlay] { top:0; left:0; }'})
  if(phase==='overflow-probe')await page.evaluate(()=>{(document.querySelector('script[data-nextjs-dev-overlay]') as HTMLElement).style.height='5px'})
  for(let i=0;i<6;i++){
   const before=await metrics(),png=await page.screenshot({fullPage:true,animations:'disabled',caret:'hide',scale:'css'})
   console.log(JSON.stringify({phase,i,before,pngHeight:png.readUInt32BE(20),after:await metrics()}))
  }
 }
})
