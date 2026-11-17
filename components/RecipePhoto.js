const sheets=[{x:[0,314,627,940,1254],y:[0,298,593,889,1254]},{x:[0,314,627,940,1254],y:[0,298,594,881,1254]},{x:[0,314,628,940,1254],y:[0,299,609,903,1254]},{x:[0,314,627,940,1254],y:[0,281,574,881,1254]}];
export default function RecipePhoto({recipe}){
 const sheetIndex=Number(recipe?.imageSheet),cellIndex=Number(recipe?.imageCell);
 const valid=Number.isInteger(sheetIndex)&&sheetIndex>=0&&sheetIndex<sheets.length&&Number.isInteger(cellIndex)&&cellIndex>=0&&cellIndex<16;
 if(!valid)return <span className="recipePhoto recipePhotoFallback" role="img" aria-label={"Imagen pendiente de "+(recipe?.name||"la receta")} style={{display:"grid",placeItems:"center",background:"#e8f5e4",color:"#285b37",fontSize:"2.5rem"}}>{recipe?.emoji||"🥗"}</span>;
 const sheet=sheets[sheetIndex],col=cellIndex%4,row=Math.floor(cellIndex/4);
 const x=sheet.x[col]+2,y=sheet.y[row]+2,w=sheet.x[col+1]-x-2,h=sheet.y[row+1]-y-2;
 return <span className="recipePhoto" role="img" aria-label={"Fotografía ilustrativa de "+recipe.name} style={{aspectRatio:`${w}/${h}`,backgroundImage:`url(/dietear-visuals/recipe-sheet-${sheetIndex+1}.jpg)`,backgroundSize:`${1254/w*100}% ${1254/h*100}%`,backgroundPosition:`${x/(1254-w)*100}% ${y/(1254-h)*100}%`}}/>;
}
