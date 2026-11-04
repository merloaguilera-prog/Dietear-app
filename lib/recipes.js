import expandedRecipes from "./recipes-expanded.json";
const baseRecipes=[
{id:"legumbre",mealTypes:["lunch","dinner"],name:"Ensalada templada con legumbres",emoji:"🥗",minutes:15,ingredients:[["Garbanzos cocidos",120,"g"],["Tomate",100,"g"],["Pimiento",60,"g"],["Aceite de oliva",10,"ml"]],steps:["Aclara y escurre los garbanzos cocidos.","Lava y corta el tomate y el pimiento.","Templa los garbanzos en una sartén con un poco de agua, si los prefieres calientes.","Mezcla todo y aliña con el aceite de oliva."]},
{id:"pescado",mealTypes:["lunch","dinner"],name:"Pescado con verduras y patata",emoji:"🐟",minutes:25,ingredients:[["Pescado",150,"g"],["Patata",180,"g"],["Verduras variadas",180,"g"],["Aceite de oliva",10,"ml"]],steps:["Lava y corta la patata y las verduras en trozos pequeños.","Cocina la patata y las verduras hasta que estén tiernas.","Cocina el pescado por ambos lados hasta que esté bien hecho.","Sirve junto a las verduras y añade el aceite de oliva."]},
{id:"arroz",mealTypes:["lunch","dinner"],name:"Arroz con verduras y huevo",emoji:"🍚",minutes:20,ingredients:[["Arroz",70,"g"],["Verduras variadas",180,"g"],["Huevo",1,"ud"],["Aceite de oliva",10,"ml"]],steps:["Cuece el arroz según las indicaciones del envase.","Cocina las verduras hasta que estén tiernas.","Prepara el huevo completamente y mézclalo con el arroz y las verduras.","Añade el aceite de oliva al servir."]},
{id:"pollo",mealTypes:["lunch","dinner"],name:"Pollo con verduras y arroz",emoji:"🍗",minutes:25,ingredients:[["Pollo",150,"g"],["Arroz",65,"g"],["Verduras variadas",180,"g"],["Aceite de oliva",10,"ml"]],steps:["Cuece el arroz según las indicaciones del envase.","Cocina el pollo por completo y corta las verduras.","Saltea las verduras hasta que estén tiernas.","Mezcla con el arroz y añade el aceite de oliva."]}
];
// Selección editorial orientativa por temporada; las recetas sin marca se disfrutan todo el año.
const seasonalNames={
 invierno:["Lentejas con verduras","Crema de calabacín y patata","Garbanzos salteados con espinacas","Crema de zanahoria y lentejas","Sopa de verduras con garbanzos","Porridge de avena con leche y plátano","Boniato al microondas con pavo","Pasta con brócoli y ajo"],
 primavera:["Tostada de ricota y fresas","Yogur griego natural con frutos rojos","Arroz con guisantes y zanahoria","Merluza con tomate y guisantes","Tortilla de verduras con ensalada","Ensalada de remolacha y queso fresco"],
 verano:["Gazpacho sencillo con tostada","Ensalada tropical con frutas","Ensalada de quinoa, mango y pepino","Ensalada de lentejas y pepino","Ensalada de atún y patata","Tostada de aguacate y tomate","Yogur con mango y avena","Ensalada variada con huevo y garbanzos"],
 otono:["Mandarina con almendras","Pavo con champiñones y arroz","Revuelto de champiñones y espinacas","Avena con yogur, manzana y canela","Garbanzos con calabacín y tomate","Pollo al limón con calabacín"]
};
const seasonalByName=new Map(Object.entries(seasonalNames).flatMap(([season,names])=>names.map(name=>[name,season])));
export const recipes=[...baseRecipes,...expandedRecipes].map((recipe,index)=>({...recipe,seasons:seasonalByName.has(recipe.name)?[seasonalByName.get(recipe.name)]:["invierno","primavera","verano","otono"],imageSheet:Math.floor(index/16),imageCell:index%16}));
export const recipeByName=name=>recipes.find(r=>r.name===name);
// Agrupa la compra de toda la semana, sin separar el mismo producto por día.
const shoppingName=value=>String(value||"").trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ");
const shoppingUnit=value=>String(value||"ud").trim().toLocaleLowerCase("es");
export function shoppingFromPlan(planner,mealFields,fridge=[]){
 const available=new Set(fridge.map(x=>shoppingName(x.name||x.text)));
 const grouped=new Map(),manual=new Map();
 for(const day of planner||[])for(const [field] of mealFields||[]){
  const meal=String(day[field]||"").trim();
  if(!meal||meal==="Comida especial")continue;
  const recipe=recipeByName(meal);
  if(!recipe){
   // Sin receta estructurada no inventamos cantidades ni ingredientes.
   // Ej.: «1 yogur» el lunes + «2 yogures» el jueves = «3 yogures».
   // Solo sumamos unidades claras; platos completos siguen pendientes de revisión.
   const match=meal.match(/^(\d+(?:[.,]\d+)?)\s+(?:(ud|unidades?)\s+(?:de\s+)?)?([\p{L}][\p{L}\s-]*)$/iu);
   const rawName=match?.[3]?.trim();
   const simpleProduct=rawName&&rawName.split(/\s+/).length<=2&&!/\b(con|sin|y|de|al|a la)\b/i.test(rawName);
   const singular=rawName?.replace(/yogures$/i,"yogur").replace(/s$/i,"");
   const key=simpleProduct?shoppingName(singular):shoppingName(meal);
   const old=manual.get(key);
   const qty=simpleProduct?Number(match[1].replace(",",".")):null;
   manual.set(key,{text:old?.text||(simpleProduct?rawName:meal),day:day.day,days:[...new Set([...(old?.days||[]),day.day])],people:day.people,occurrences:(old?.occurrences||0)+1,qty:qty===null?undefined:Number(((old?.qty||0)+qty).toFixed(2)),unit:qty===null?undefined:"ud",done:false,review:true});
   continue;
  }
  const factor=Math.max(0.5,Number(day.portionFactor||day.people||1));
  for(const [name,qty,unit] of recipe.ingredients){
   const key=shoppingName(name)+"|"+shoppingUnit(unit);
   const old=grouped.get(key);
   grouped.set(key,{
    text:old?.text||name,
    qty:Number(((old?.qty||0)+Number(qty)*factor).toFixed(2)),
    unit:unit||"ud",
    days:[...new Set([...(old?.days||[]),day.day])],
    done:false,review:false,
    inFridge:available.has(shoppingName(name))
   });
  }
 }
 return [...grouped.values(),...manual.values()];
}
