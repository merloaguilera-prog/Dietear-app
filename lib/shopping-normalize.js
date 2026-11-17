// Normalización conservadora para productos escritos a mano en el plan.
// Nunca elimina calificadores como «sin lactosa» ni mezcla unidades diferentes.
const fold=value=>String(value||"").trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ");
const irregular=new Map([["yogures","yogur"],["huevos","huevo"],["tomates","tomate"],["patatas","patata"],["manzanas","manzana"],["platanos","platano"]]);
export function shoppingProductKey(name){
 const normalized=fold(name);
 return normalized.split(" ").map(word=>irregular.get(word)||word.replace(/(?<=[aeiou])s$/,"")).join(" ");
}
export function parseManualShoppingItem(meal){
 const match=String(meal||"").trim().match(/^(\d+(?:[.,]\d+)?)\s+(?:(kg|g|ml|l|uds?|unidades?)\s+(?:de\s+)?)?([\p{L}][\p{L}\s-]*)$/iu);
 if(!match)return null;
 const qty=Number(match[1].replace(",","."));
 const unit=(match[2]||"ud").toLowerCase().replace(/^uds?$|^unidades?$/,"ud");
 const name=match[3].trim();
 // Un nombre con conectores suele ser un plato, no un ingrediente cuantificado.
 if(!Number.isFinite(qty)||qty<=0||name.split(/\s+/).length>5||/\b(con|y|al|a la)\b/i.test(name))return null;
 return {name,qty,unit,key:shoppingProductKey(name)+"|"+unit};
}
