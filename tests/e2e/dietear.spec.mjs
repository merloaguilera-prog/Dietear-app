import {test,expect} from '@playwright/test';
const nav=(page,name)=>page.locator('nav').getByRole('button',{name,exact:true});
async function openFeature(page,tab,feature){await nav(page,tab).click();await page.locator('.featureGrid').getByRole('button',{name:new RegExp(feature.replace(/[?]/g,'\\?'))}).click();}
async function closeEntryHelp(page){const close=page.getByRole('button',{name:'Cerrar ayuda de datos'});if(await close.isVisible())await close.click();}
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('dietear-state-v2'))?.data);

test('PRO weekly report exports actual records without private profile details or invented missing nutrients',async({page})=>{
 await page.addInitScript(()=>{
  const meal=(id,kcal)=>({id,date:'2026-11-25T12:00:00',type:'comida',label:'Comida privada',food:{version:1,confirmed:true,name:'Comida privada',mealType:'lunch',servings:2,nutrients:{energyKcal:kcal,proteinG:5}}});
  localStorage.setItem('dietear-state-v2',JSON.stringify({version:2,data:{profile:{name:'Nombre privado'},history:[meal('a',100),meal('b',null)]}}));
 });
 await page.goto('/');await openFeature(page,'Para mí','Premium');
 const report=page.getByRole('region',{name:'Informe semanal DIETEAR PRO',exact:true});
 await report.getByLabel('Último día del informe').fill('2026-11-25');
 await expect(report).toContainText('2 comidas confirmadas en 1 de 7 días');
 await expect(report).toContainText('subtotal conocido: 200 kcal');
 await expect(report.getByRole('row')).toHaveCount(8);
 const downloaded=page.waitForEvent('download');await report.getByRole('button',{name:'Descargar informe JSON',exact:true}).click();
 const download=await downloaded,stream=await download.createReadStream(),chunks=[];
 for await(const chunk of stream)chunks.push(chunk);
 const text=Buffer.concat(chunks).toString('utf8'),data=JSON.parse(text);
 expect(data.entries).toBe(2);expect(data.nutrients.energyKcal).toBeNull();expect(data.partialTotals.energyKcal).toBe(200);
 expect(text).not.toContain('Nombre privado');expect(text).not.toContain('Comida privada');
 await expectNoOverflow(page);
});
async function mockSpeech(page){await page.addInitScript(()=>{
 window.__spoken=[];window.__recognitions=[];
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(utterance){window.__spoken.push({text:utterance.text,rate:utterance.rate});queueMicrotask(()=>utterance.onstart?.());},cancel(){},getVoices(){return [{lang:'es-ES',name:'Prueba'}];}}});
 window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 window.SpeechRecognition=class{constructor(){window.__recognitions.push(this);}start(){queueMicrotask(()=>this.onstart?.());}abort(){}};
});}
async function openRecipes(page){await openFeature(page,'Alimentación','Recetas rápidas');await page.locator('.recipeIdea').first().getByRole('button',{name:'Ver cómo se hace',exact:true}).click();}

test('home photographs fill at least half of every access card on phone and desktop',async({page},testInfo)=>{
 for(const width of [320,393,1100,1280,1920]){
  await page.setViewportSize({width,height:900});await page.goto('/');
  const cards=page.locator('.designedHome .homeBubble');await expect(cards).toHaveCount(8);
  await expect.poll(()=>cards.evaluateAll(buttons=>buttons.every(button=>{
   const image=button.querySelector('.bubbleSymbol img');return image?.complete&&image.naturalWidth>0;
  }))).toBe(true);
  const sizes=await cards.evaluateAll(buttons=>buttons.map(button=>{
   const card=button.getBoundingClientRect(),image=button.querySelector('.bubbleSymbol img').getBoundingClientRect(),label=button.querySelector('b');
   return {name:button.innerText,labelFits:label.scrollWidth<=label.clientWidth+1,coverage:image.width*image.height/(card.width*card.height),within: image.left>=card.left&&image.right<=card.right&&image.top>=card.top&&image.bottom<=card.bottom};
  }));
  for(const size of sizes){expect(size.coverage,JSON.stringify(size)).toBeGreaterThanOrEqual(.5);expect(size.within,JSON.stringify(size)).toBe(true);expect(size.labelFits,JSON.stringify(size)).toBe(true);}
  await expectNoOverflow(page);
  if(width===393||width===1920){await page.locator('.homeButtons').scrollIntoViewIfNeeded();await testInfo.attach(`inicio-${width}px`,{body:await page.screenshot(),contentType:'image/png'});}
 }
});

test('choosing a diet in the builder reveals its matching book immediately and offers a return',async({page})=>{
 await page.goto('/');await openFeature(page,'Alimentación','Crear mi dieta');
 await page.locator('.createDietChoices').getByRole('button',{name:/Vegana/}).click();
 const book=page.getByRole('region',{name:'Libro de recetas: Vegana',exact:true});
 await expect(book).toBeFocused();await expect(book.getByRole('heading',{name:'Tu libro: Vegana',exact:true})).toBeInViewport({ratio:1});
 await expect.poll(async()=>(await saved(page)).profile.dietStyle).toBe('Vegana');
 await expect(book.locator('.recipeIdea').first()).toBeVisible();
 await book.getByRole('button',{name:'← Cambiar estilo de alimentación',exact:true}).click();
 const choice=page.locator('.createDietChoices').getByRole('button',{name:/Vegana/});await expect(choice).toBeFocused();await expect(choice).toBeInViewport();
 await page.locator('.createDietChoices').getByRole('button',{name:/Vegetariana/}).click();
 await expect(page.getByRole('region',{name:'Libro de recetas: Vegetariana',exact:true})).toBeFocused();
 await expect(page.getByRole('heading',{name:'Tu libro: Vegetariana',exact:true})).toBeInViewport({ratio:1});
});

async function expectNoOverflow(page){
 const layout=await page.evaluate(()=>({
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
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

test('diet books differ, offer the full catalogue separately and reset when switching styles',async({page})=>{
 await page.goto('/');await openFeature(page,'Alimentación','Todo Dietas');
 await page.locator('.dietVisualGrid').getByRole('button',{name:/Equilibrada/}).click();
 const ids=()=>page.locator('.recipeIdea').evaluateAll(cards=>cards.map(card=>card.id));
 await expect(page.locator('.recipeIdea')).toHaveCount(16);const balanced=await ids();
 await page.locator('#recipe-legumbre').getByRole('button',{name:'Guardar favorita: Ensalada templada con legumbres',exact:true}).click();
 await page.getByRole('button',{name:'← Cambiar estilo de alimentación',exact:true}).click();
 await page.locator('.dietVisualGrid').getByRole('button',{name:/Mediterránea/}).click();
 await expect(page.locator('.recipeIdea')).toHaveCount(16);const mediterranean=await ids();
 expect(balanced.filter(id=>mediterranean.includes(id)).length).toBeLessThanOrEqual(5);
 expect(balanced.slice(0,3).filter(id=>mediterranean.slice(0,3).includes(id))).toHaveLength(0);
 await page.getByRole('button',{name:'♡ Mis favoritas',exact:true}).click();
 await expect(page.locator('.recipeIdea')).toHaveCount(1);await expect(page.locator('#recipe-legumbre')).toBeVisible();
 await page.getByRole('button',{name:'Todas las recetas',exact:true}).click();await expect(page.locator('.recipeIdea')).toHaveCount(16);
 await page.getByRole('button',{name:'Ver más recetas compatibles',exact:true}).click();
 await expect(page.locator('.recipeIdea')).toHaveCount(64);
 await page.getByRole('button',{name:'← Cambiar estilo de alimentación',exact:true}).click();
 await page.locator('.dietVisualGrid').getByRole('button',{name:/Vegana/}).click();
 await expect(page.locator('.recipeIdea')).toHaveCount(16);
 await expect(page.getByRole('button',{name:'Ver más recetas compatibles',exact:true})).toHaveAttribute('aria-pressed','false');
});

test('an unreviewed style keeps general dishes separate from its pending book',async({page})=>{
 await page.goto('/');await openFeature(page,'Alimentación','Todo Dietas');
 await page.locator('.dietVisualGrid').getByRole('button',{name:/Hiposódica/}).click();
 await expect(page.getByRole('heading',{name:'Recetario específico pendiente: Hiposódica',exact:true})).toBeInViewport();
 await expect(page.locator('.recipeIdea')).toHaveCount(0);
 await page.getByRole('button',{name:'Consultar recetas generales',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Ideas generales · Hiposódica',exact:true})).toBeVisible();
 await expect(page.locator('.recipeIdea')).toHaveCount(64);
});

test('personal objectives allow selecting all, persist independently and stay consistent with the primary goal',async({page})=>{
 await page.goto('/');await openFeature(page,'Para mí','Mis objetivos');
 const choices=page.locator('.personalGoalChoices input[type=checkbox]');
 await expect(choices).toHaveCount(9);
 await expect(choices.first()).toBeInViewport();
 const banner=page.locator('.personalGoalsModule>.moduleBanner');
 expect((await banner.boundingBox()).height).toBeLessThanOrEqual(161);
 await page.getByRole('button',{name:'Marcar todos',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'9 objetivos elegidos'})).toBeVisible();
 await expect.poll(async()=>(await saved(page)).profile.personalGoals.length).toBe(9);
 expect((await saved(page)).goals).toHaveLength(4);
 await page.getByLabel('Mi prioridad ahora',{exact:true}).selectOption('Ganar fuerza');await closeEntryHelp(page);
 await expect.poll(async()=>(await saved(page)).profile.goal).toBe('Ganar fuerza');
 await choices.first().uncheck();await expect.poll(async()=>(await saved(page)).profile.personalGoals.length).toBe(8);
 await page.reload();await openFeature(page,'Para mí','Mis objetivos');
 await expect(page.getByRole('status').filter({hasText:'8 objetivos elegidos'})).toBeVisible();
 await expect(choices.first()).not.toBeChecked();await expect(choices.last()).toBeChecked();
 await page.getByRole('button',{name:'Desmarcar todos',exact:true}).click();
 await expect.poll(async()=>(await saved(page)).profile.personalGoals).toEqual([]);
 await page.reload();await openFeature(page,'Para mí','Mis objetivos');
 await expect(page.getByRole('status').filter({hasText:'0 objetivos elegidos'})).toBeVisible();
 await expectNoOverflow(page);
});

test('goal steps persist as explicit daily marks and their links open the related tools',async({page})=>{
 await page.goto('/');await openFeature(page,'Para mí','Mis objetivos');
 await page.getByRole('button',{name:'Desmarcar todos',exact:true}).click();
 const choices=page.locator('.personalGoalChoices');
 await choices.getByRole('checkbox',{name:/Comer un poco mejor/}).check();
 await choices.getByRole('checkbox',{name:/Moverme un poco más/}).check();
 const mark=page.getByRole('checkbox',{name:'Hecho hoy: Comer un poco mejor',exact:true});
 await mark.check();await expect(page.getByText('1 de 2 pasos marcados hoy',{exact:true})).toBeVisible();
 await expect.poll(async()=>Object.values((await saved(page)).profile.goalCheckins||{}).flat()).toEqual(['food']);
 expect((await saved(page)).history).toHaveLength(0);
 await page.getByRole('button',{name:'Elegir una receta →',exact:true}).click();
 await expect(page.locator('.dietGallery')).toBeVisible();expect((await saved(page)).history).toHaveLength(0);
 await page.reload();await openFeature(page,'Para mí','Mis objetivos');await expect(mark).toBeChecked();
 await page.getByRole('button',{name:'Ver mis actividades →',exact:true}).click();
 await expect(page.getByRole('button',{name:'Intermedio',exact:true})).toBeVisible();
 await nav(page,'Hoy').click();
 await expect(page.getByRole('button',{name:/Objetivos → 2 objetivos elegidos/})).toBeVisible();
 await expectNoOverflow(page);
});

test('the profile primary-goal selector retains the other personal objectives',async({page})=>{
 await page.goto('/');await openFeature(page,'Para mí','Mis objetivos');
 await page.getByRole('button',{name:'Desmarcar todos',exact:true}).click();
 const choices=page.locator('.personalGoalChoices');
 await choices.getByRole('checkbox',{name:/Comer un poco mejor/}).check();
 await choices.getByRole('checkbox',{name:/Moverme un poco más/}).check();
 await nav(page,'Para mí').click();
 await page.getByLabel('Mi objetivo principal',{exact:true}).selectOption('Dormir y descansar mejor');await closeEntryHelp(page);
 await expect.poll(async()=>(await saved(page)).profile.personalGoals).toEqual(['food','movement','rest']);
 await page.getByRole('button',{name:'Elegir varios objetivos →',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'3 objetivos elegidos'})).toBeVisible();
 await expect(page.getByLabel('Mi prioridad ahora',{exact:true})).toHaveValue('Dormir y descansar mejor');
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
