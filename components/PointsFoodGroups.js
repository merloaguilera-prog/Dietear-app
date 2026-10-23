import { foodEnergy, pointsFromKcal } from "../lib/points-diet.mjs";
import { getImageProps } from "next/image";

const colors = ["#efb75e", "#82b579", "#b5c777", "#ccad7b", "#aacadd", "#e6a095", "#d3bf78", "#a4b786", "#c8acd5"];
const format = value => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value);
const artwork = getImageProps({ src: "/dietear-visuals/points-food-groups.png", alt: "", width: 600, height: 600 }).props.src;

export default function PointsFoodGroups({ foods, categories, onFood, onCategory }) {
  return <div className="pointsFoodGroups" aria-label="Guía visual por grupos de alimentos">
    {categories.map((category, index) => {
      const items = foods.filter(food => food.category === category);
      return <article key={category} style={{ "--group-accent": colors[index] }}>
        <div className="pointsGroupHead"><h4>{category}</h4><span>{items.length} alimentos</span></div>
        <div className="pointsGroupIntro"><span className="pointsCategoryArt" aria-hidden="true" style={{ backgroundImage: `url("${artwork}")`, backgroundPosition: (index % 3) * 50 + "% " + Math.floor(index / 3) * 50 + "%" }} /><p>Toca un alimento para ajustar su cantidad.<br /><b>Ración de consulta · puntos</b></p></div>
        <ul>{items.slice(0, 10).map(food => <li key={food.id}><button type="button" onClick={() => onFood(food)}><b>{food.name}</b><span>{food.grams} g</span><strong>{format(pointsFromKcal(foodEnergy(food, food.grams)))} pt</strong></button></li>)}</ul>
        <button className="pointsGroupMore" type="button" onClick={() => onCategory(category)}>Ver los {items.length} alimentos del grupo →</button>
      </article>;
    })}
  </div>;
}
