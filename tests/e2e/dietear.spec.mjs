import {test,expect} from '@playwright/test';
const nav=(page,name)=>page.locator('nav').getByRole('button',{name,exact:true});
async function openFeature(page,tab,feature){await nav(page,tab).click();await page.locator('.featureGrid').getByRole('button',{name:new RegExp(feature.replace(/[?]/g,'\\?'))}).click();}
async function closeEntryHelp(page){const close=page.getByRole('button',{name:'Cerrar ayuda de datos'});if(await close.isVisible())await close.click();}
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('dietear-state-v2'))?.data);
async function mockSpeech(page){await page.addInitScript(()=>{
 window.__spoken=[];window.__recognitions=[];
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(utterance){window.__spoken.push({text:utterance.text,rate:utterance.rate});queueMicrotask(()=>utterance.onstart?.());},cancel(){},getVoices(){return [{lang:'es-ES',name:'Prueba'}];}}});
 window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 window.SpeechRecognition=class{constructor(){window.__recognitions.push(this);}start(){queueMicrotask(()=>this.onstart?.());}abort(){}};
});}
async function openRecipes(page){await openFeature(page,'Alimentación','Recetas rápidas');await page.locator('.recipeIdea').first().getByRole('button',{name:'Ver cómo se hace',exact:true}).click();}

async function expectNoOverflow(page){
 const layout=await page.evaluate(()=>({
  overflow:Math.max(document.documentElement.scrollWidth,window.innerWidth)-document.documentElement.clientWidth,
  offenders:[...document.querySelectorAll('main *')].filter(node=>{const r=node.getBoundingClientRect();return r.width>0&&(r.right>document.documentElement.clientWidth+1||r.left < -1);}).slice(0,8).map(node=>({tag:node.tagName,className:node.className,text:node.textContent?.slice(0,70),width:node.getBoundingClientRect().width}))
 }));
 expect(layout.overflow,JSON.stringify(layout)).toBeLessThanOrEqual(1);
}
async function expectNavTarget(page,label){
 const hit=await nav(page,label).evaluate(button=>{const r=button.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,top=document.elementFromPoint(x,y);return {label:button.innerText,width:r.width,height:r.height,withinViewport:r.left>=0&&r.right<=window.innerWidth&&r.top>=0&&r.bottom<=window.innerHeight,withinButton:button===top||button.contains(top)}});
 expect(hit.withinViewport,JSON.stringify(hit)).toBe(true);
 expect(hit.width,JSON.stringify(hit)).toBeGreaterThanOrEqual(44);
 expect(hit.height,JSON.stringify(hit)).toBeGreaterThanOrEqual(44);
 expect(hit.withinButton,JSON.stringify(hit)).toBe(true);
}
test('opens and visits the five areas without runtime errors or mobile overflow',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/?source=android');
 await expect(page).toHaveTitle(/DIETEAR/);
 for(const label of ['Alimentación','Mi plan','Progreso','Para mí','Hoy']){
  await expectNavTarget(page,label);
  await nav(page,label).click({timeout:8000});
  await expect(nav(page,label)).toHaveClass(/active/);
  await expect(page.locator('main')).toBeVisible();
  await expectNoOverflow(page);
 }
 expect(errors).toEqual([]);
});

for(const width of [320,393])test(`profile health controls fit at ${width}px and bottom navigation remains reachable after scrolling`,async({page,isMobile})=>{
 await page.setViewportSize({width,height:727});await page.goto('/');await nav(page,'Para mí').click();
 await expect(page.locator('.healthJournal')).toBeVisible();await expectNoOverflow(page);
 const metric=page.locator('.healthJournalFields select').first();
 await metric.selectOption('hba1c');await expectNoOverflow(page);
 await metric.selectOption('systolic');await expectNoOverflow(page);
 await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
 await expectNavTarget(page,'Hoy');
 if(isMobile)await nav(page,'Hoy').tap({timeout:8000});else await nav(page,'Hoy').click({timeout:8000});
 await expect(nav(page,'Hoy')).toHaveClass(/active/);await expectNoOverflow(page);
});

test('damaged local data opens with recovery while preserving its original bytes',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('dietear-state-v2','{"broken":'));
 await page.goto('/');await expect(page.getByText(/Hemos recuperado los datos/)).toBeVisible();
 expect(await page.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith('dietear-state-v2-recovery-')).map(key=>localStorage.getItem(key)))).toEqual(['{"broken":']);
 await nav(page,'Para mí').click();await expect(page.getByLabel('Edad',{exact:true})).toBeVisible();
});

test('dictation is editable, requires confirmation and persists through reopening',async({page})=>{
 await mockSpeech(page);await page.goto('/');await nav(page,'Para mí').click();
 const age=page.getByLabel('Edad',{exact:true});await age.click();await page.getByRole('button',{name:'🎙️ Dictar este dato',exact:true}).click();
 await page.evaluate(()=>window.__recognitions.at(-1).onresult({results:[Object.assign([{transcript:'cuarenta y siete'}],{isFinal:true})]}));
 await expect(age).toHaveValue('');await expect(page.getByLabel('Transcripción del dictado')).toHaveValue('cuarenta y siete');
 await page.getByLabel('Transcripción del dictado').fill('cuarenta y ocho');await page.getByRole('button',{name:'Usar este dato',exact:true}).click();
 await expect(age).toHaveValue('48');await closeEntryHelp(page);
 await expect.poll(async()=>(await saved(page)).profile.age).toBe('48');
 await page.reload();await nav(page,'Para mí').click();await expect(page.getByLabel('Edad',{exact:true})).toHaveValue('48');
});

test('diet books filter ingredients, hide dislikes and persist favorites',async({page})=>{
 await openFeatureAfterLoad();
 async function openFeatureAfterLoad(){await page.goto('/');await openFeature(page,'Alimentación','Todo Dietas');}
 await page.locator('.dietVisualGrid').getByRole('button',{name:/Vegana/}).click();
 await expect(page.getByRole('heading',{name:'Tu libro: Vegana'})).toBeVisible();
 const cards=page.locator('.recipeIdea'), count=await cards.count(), first=cards.first();expect(count).toBeGreaterThan(5);
 const name=await first.getByRole('heading').innerText();await first.getByRole('button',{name:'No me gusta',exact:true}).click();await expect(cards).toHaveCount(count-1);
 const next=cards.first(), favorite=await next.getByRole('heading').innerText();await next.getByRole('button',{name:'Guardar favorita: '+favorite,exact:true}).click();
 await page.reload();await openFeature(page,'Alimentación','Todo Dietas');
 await expect(page.getByRole('heading',{name:'Tu libro: Vegana'})).toBeVisible();
 await expect(page.locator('.recipeIdea').filter({has:page.getByRole('heading',{name,exact:true})})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Quitar de favoritas: '+favorite,exact:true})).toBeVisible();
});

test('recipe portions reach the plan and the shopping quantities without changing other meals',async({page})=>{
 await page.goto('/');await openRecipes(page);
 const recipe=page.locator('#recipe-legumbre');await recipe.getByLabel(/Raciones de/).fill('2');await closeEntryHelp(page);
 await recipe.getByRole('button',{name:'Añadir al plan de hoy →',exact:true}).click();
 const index=(new Date().getDay()+6)%7;
 await expect.poll(async()=>(await saved(page)).planner[index]?.mealServings?.lunch).toBe(2);
 expect((await saved(page)).planner[index].people).toBe(1);
 await page.getByRole('button',{name:'🛒 Ver mi lista de la compra →',exact:true}).click();
 await expect.poll(async()=>(await saved(page)).shopping.find(item=>item.text==='Garbanzos cocidos')?.qty).toBe(240);
 await page.reload();await nav(page,'Mi plan').click();await expect(page.getByLabel('Almuerzo del día elegido')).toHaveValue('Ensalada templada con legumbres');
});

test('reading selects ×1 ×2 ×3, follows steps and remembers the preference',async({page})=>{
 await mockSpeech(page);await page.goto('/');await openRecipes(page);
 const reading=page.locator('#recipe-legumbre .readingControls');await reading.getByRole('button',{name:'Paso a paso',exact:true}).click();
 for(const rate of ['1','2','3']){await reading.getByLabel(/Velocidad de lectura/).selectOption(rate);await closeEntryHelp(page);await reading.getByRole('button',{name:'Escuchar',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.__spoken.at(-1)?.rate)).toBe(Number(rate));await reading.getByRole('button',{name:'Detener',exact:true}).click();}
 await reading.getByRole('button',{name:'Paso siguiente',exact:true}).click();await expect(reading.getByText('Paso 2 de 4.',{exact:false})).toBeVisible();
 await expect.poll(async()=>(await saved(page)).profile.readingRate).toBe(3);
 await page.reload();await openRecipes(page);await expect(page.locator('#recipe-legumbre .readingControls select')).toHaveValue('3');
});

test('exercise guides expose levels and record activity only after explicit saving',async({page})=>{
 await page.goto('/');await openFeature(page,'Progreso','Pasos y actividad');
 await page.getByRole('button',{name:'Intermedio',exact:true}).click();
 const strength=page.locator('.exercisePhotoCard').filter({has:page.getByRole('heading',{name:'Fuerza en casa',exact:true})});
 await strength.getByText('Ver 4 movimientos',{exact:true}).click();
 await expect(strength.getByRole('heading',{name:'Sentadilla con peso corporal'})).toBeVisible();
 await strength.getByRole('button',{name:'Registrar minutos realizados →',exact:true}).click();
 expect((await saved(page)).history.filter(item=>item.type==='actividad')).toHaveLength(0);
 await page.getByRole('button',{name:'Guardar actividad →',exact:true}).click();
 await expect.poll(async()=>(await saved(page)).history.filter(item=>item.type==='actividad').length).toBe(1);
 await page.reload();await expect.poll(async()=>(await saved(page)).history.find(item=>item.type==='actividad')?.value).toBe(20);
});

test('a photo stays local until consent, produces an editable draft and registers only once confirmed',async({page})=>{
 let requests=0;
 await page.route('**/api/meal-photo',async route=>{requests++;await route.fulfill({json:{draft:{name:'Plato de prueba',ingredients:['Arroz','Verduras'],notes:['Cantidad estimada'],nutrients:{energyKcal:200,proteinG:8,carbsG:30,fatG:null,fiberG:null}}}});});
 await page.goto('/');await openFeature(page,'Alimentación','Analizar alimento');
 await page.getByLabel('Foto del plato',{exact:true}).setInputFiles({name:'plato.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64')});
 expect(requests).toBe(0);await expect(page.getByRole('button',{name:'Analizar foto',exact:true})).toBeDisabled();
 await page.getByLabel(/Permito enviar esta foto/).check();await page.getByRole('button',{name:'Analizar foto',exact:true}).click();
 await page.getByRole('button',{name:'Usar este borrador',exact:true}).click();expect(requests).toBe(1);
 expect((await saved(page)).history.filter(item=>item.type==='comida')).toHaveLength(0);
 await page.getByLabel('Calorías por ración',{exact:true}).fill('139');await page.getByLabel('Raciones consumidas',{exact:true}).fill('0.5');await closeEntryHelp(page);
 await expect(page.getByRole('button',{name:'Confirmar y guardar comida',exact:true})).toBeDisabled();
 await page.getByLabel('He revisado la comida y las cantidades',{exact:true}).check();await page.getByRole('button',{name:'Confirmar y guardar comida',exact:true}).click();
 await expect.poll(async()=>(await saved(page)).history.filter(item=>item.type==='comida').length).toBe(1);
 const data=await saved(page);expect(data.history.find(item=>item.type==='comida').value).toBe(69.5);expect(JSON.stringify(data)).not.toContain('data:image');
 await page.reload();await openFeature(page,'Alimentación','Analizar alimento');await expect(page.locator('.diaryEntries').getByText('Plato de prueba',{exact:true})).toBeVisible();
 await openFeature(page,'Progreso','Mis gráficas');await expect(page.locator('.evolutionCharts:visible'),JSON.stringify(await page.locator('.evolutionCharts').evaluateAll(nodes=>nodes.map(node=>({display:getComputedStyle(node).display,visibility:getComputedStyle(node).visibility,rect:node.getBoundingClientRect().toJSON(),parent:node.parentElement?.className,tab:document.querySelector('nav button.active')?.innerText}))))).toHaveCount(1);await page.locator('.evolutionCharts:visible').getByRole('button',{name:'🥗 Energía registrada',exact:true}).click();await expect(page.locator('.chartSummary').first()).toContainText('69.5');
});
