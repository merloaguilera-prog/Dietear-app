"""Build the DIETEAR catalogue from the public-domain USDA SR Legacy download.

Run from the repo root. The download is cached outside the repo. Nutrient values
are never generated: every entry keeps its FDC id and original description.
Portions are editable examples in grams of edible food, not recommendations.
"""
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import re
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path(os.environ.get("DIETEAR_DATA_CACHE", str(ROOT.parent / "points-research")))
URL = "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip"

# Spanish label | exact description prefix (or FDC id) | category | example g |
# preparation/edible state | English Wikipedia topic (photo discovery only).
SPEC = """
Manzana|171688|Fruta|150|Cruda, con piel, sin corazón|Apple
Plátano|173944|Fruta|120|Crudo, sin piel|Banana
Naranja|169097|Fruta|150|Cruda, sin piel|Orange (fruit)
Mandarina|Tangerines, (mandarin oranges), raw|Fruta|100|Cruda, sin piel|Mandarin orange
Pera|169118|Fruta|150|Cruda, parte comestible|Pear
Fresas|167762|Fruta|150|Crudas, sin pedúnculo|Strawberry
Uvas|174683|Fruta|100|Crudas, sin ramas|Grape
Kiwi|168153|Fruta|100|Crudo, sin piel|Kiwifruit
Piña|Pineapple, raw, all varieties|Fruta|150|Cruda, sin piel|Pineapple
Mango|Mangos, raw|Fruta|150|Crudo, sin piel ni hueso|Mango
Melocotón|Peaches, yellow, raw|Fruta|150|Crudo, sin hueso|Peach
Nectarina|169914|Fruta|150|Cruda, sin hueso|Nectarine
Albaricoque|171697|Fruta|100|Crudo, sin hueso|Apricot
Ciruela|169949|Fruta|100|Cruda, sin hueso|Plum
Sandía|Watermelon, raw|Fruta|200|Cruda, sin corteza|Watermelon
Melón|169092|Fruta|200|Crudo, sin corteza ni semillas|Cantaloupe
Cerezas|Cherries, sweet, raw|Fruta|100|Crudas, sin hueso|Cherry
Arándanos|Blueberries, raw|Fruta|100|Crudos|Blueberry
Frambuesas|Raspberries, raw|Fruta|100|Crudas|Raspberry
Moras|Blackberries, raw|Fruta|100|Crudas|Blackberry
Papaya|Papayas, raw|Fruta|150|Cruda, sin piel ni semillas|Papaya
Lichi|Litchis, raw|Fruta|100|Crudo, sin piel ni hueso|Lychee
Higos|Figs, raw|Fruta|100|Frescos, parte comestible|Fig
Granada|Pomegranates, raw|Fruta|100|Granos, sin corteza|Pomegranate
Caqui|Persimmons, japanese, raw|Fruta|150|Crudo, parte comestible|Persimmon
Dátiles|Dates, medjool|Fruta|30|Secos, sin hueso|Date palm
Pasas|168165|Fruta|30|Secas, sin semillas|Raisin
Coco|Nuts, coconut meat, raw|Fruta|30|Pulpa cruda|Coconut
Aguacate|171705|Fruta|50|Crudo, sin piel ni hueso|Avocado
Limón|Lemons, raw, without peel|Fruta|30|Pulpa cruda, sin piel|Lemon
Lima|Limes, raw|Fruta|30|Parte comestible cruda|Lime (fruit)
Pomelo|Grapefruit, raw, pink and red, all areas|Fruta|150|Crudo, sin piel|Grapefruit
Tomate|170457|Verduras y hortalizas|150|Crudo|Tomato
Calabacín|169291|Verduras y hortalizas|200|Crudo, con piel|Zucchini
Zanahoria|Carrots, raw|Verduras y hortalizas|100|Cruda|Carrot
Brócoli|Broccoli, raw|Verduras y hortalizas|150|Crudo, parte comestible|Broccoli
Coliflor|Cauliflower, raw|Verduras y hortalizas|150|Cruda, parte comestible|Cauliflower
Espinacas|Spinach, raw|Verduras y hortalizas|100|Crudas|Spinach
Acelga|169991|Verduras y hortalizas|150|Cruda|Chard
Lechuga|Lettuce, green leaf, raw|Verduras y hortalizas|100|Cruda|Lettuce
Pepino|Cucumber, with peel, raw|Verduras y hortalizas|150|Crudo, con piel|Cucumber
Pimiento rojo|Peppers, sweet, red, raw|Verduras y hortalizas|100|Crudo, sin semillas|Bell pepper
Pimiento verde|Peppers, sweet, green, raw|Verduras y hortalizas|100|Crudo, sin semillas|Green pepper
Berenjena|Eggplant, raw|Verduras y hortalizas|150|Cruda|Eggplant
Calabaza|Pumpkin, raw|Verduras y hortalizas|200|Cruda, sin piel ni semillas|Pumpkin
Cebolla|Onions, raw|Verduras y hortalizas|100|Cruda, pelada|Onion
Puerro|Leeks, (bulb and lower leaf-portion), raw|Verduras y hortalizas|100|Crudo, parte comestible|Leek
Ajo|Garlic, raw|Verduras y hortalizas|5|Crudo, pelado|Garlic
Champiñón|Mushrooms, white, raw|Verduras y hortalizas|150|Crudo|Agaricus bisporus
Espárragos|Asparagus, raw|Verduras y hortalizas|150|Crudos|Asparagus
Alcachofa|Artichokes, (globe or french), raw|Verduras y hortalizas|100|Cruda, parte comestible|Artichoke
Apio|Celery, raw|Verduras y hortalizas|100|Crudo|Celery
Rábano|Radishes, raw|Verduras y hortalizas|50|Crudo|Radish
Remolacha cocida|Beets, cooked, boiled, drained|Verduras y hortalizas|100|Cocida y escurrida|Beetroot
Repollo|Cabbage, raw|Verduras y hortalizas|150|Crudo|Cabbage
Col lombarda|Cabbage, red, raw|Verduras y hortalizas|100|Cruda|Red cabbage
Coles de Bruselas|Brussels sprouts, raw|Verduras y hortalizas|150|Crudas|Brussels sprout
Col rizada|168421|Verduras y hortalizas|100|Cruda|Kale
Endibia|Endive, raw|Verduras y hortalizas|100|Cruda|Endive
Hinojo|Fennel, bulb, raw|Verduras y hortalizas|100|Bulbo crudo|Florence fennel
Judías verdes|Beans, snap, green, raw|Verduras y hortalizas|150|Crudas|Green bean
Guisantes|Peas, green, raw|Verduras y hortalizas|100|Crudos, sin vaina|Pea
Maíz dulce|Corn, sweet, yellow, raw|Verduras y hortalizas|100|Granos crudos|Sweet corn
Perejil|Parsley, fresh|Verduras y hortalizas|5|Fresco|Parsley
Albahaca|172232|Verduras y hortalizas|5|Fresca|Basil
Garbanzos cocidos|173757|Legumbres y proteína vegetal|150|Cocidos, sin sal, escurridos|Chickpea
Lentejas cocidas|172421|Legumbres y proteína vegetal|150|Cocidas, sin sal, escurridas|Lentil
Alubias blancas cocidas|175203|Legumbres y proteína vegetal|150|Cocidas, sin sal, escurridas|Navy bean
Alubias rojas cocidas|173740|Legumbres y proteína vegetal|150|Cocidas, sin sal, escurridas|Kidney bean
Alubias negras cocidas|Beans, black, mature seeds, cooked, boiled, without salt|Legumbres y proteína vegetal|150|Cocidas, sin sal, escurridas|Black turtle bean
Soja cocida|Soybeans, mature cooked, boiled, without salt|Legumbres y proteína vegetal|100|Cocida, sin sal, escurrida|Soybean
Edamame|169283|Legumbres y proteína vegetal|100|Soja verde cocida, sin vaina|Edamame
Tofu firme|Tofu, raw, firm, prepared with calcium sulfate|Legumbres y proteína vegetal|100|Listo para cocinar, escurrido|Tofu
Tempeh|Tempeh, cooked|Legumbres y proteína vegetal|100|Cocinado, sin aceite añadido|Tempeh
Hummus|172454|Legumbres y proteína vegetal|40|Preparado, receta de referencia USDA|Hummus
Pan integral|172688|Cereales y tubérculos|40|Listo para comer|Whole wheat bread
Pan blanco|Bread, white, commercially prepared|Cereales y tubérculos|40|Listo para comer|White bread
Avena|Cereals, oats, regular and quick, not fortified, dry|Cereales y tubérculos|40|Copos secos, antes de hidratar|Rolled oats
Arroz blanco seco|169756|Cereales y tubérculos|60|Peso en seco, antes de cocer|Rice
Arroz blanco cocido|169757|Cereales y tubérculos|150|Cocido en agua, sin aceite|Cooked rice
Arroz integral seco|169703|Cereales y tubérculos|60|Peso en seco, antes de cocer|Brown rice
Arroz integral cocido|169704|Cereales y tubérculos|150|Cocido en agua, sin aceite|Cooked brown rice
Pasta seca|Pasta, dry, unenriched|Cereales y tubérculos|60|Peso en seco|Pasta
Pasta integral seca|169738|Cereales y tubérculos|60|Peso en seco|Whole-wheat pasta
Pasta cocida|Pasta, cooked, unenriched, without added salt|Cereales y tubérculos|150|Cocida, sin salsa ni aceite|Spaghetti
Cuscús seco|169699|Cereales y tubérculos|60|Peso en seco|Couscous
Quinoa seca|Quinoa, uncooked|Cereales y tubérculos|60|Peso en seco|Quinoa
Bulgur seco|Bulgur, dry|Cereales y tubérculos|60|Peso en seco|Bulgur
Trigo sarraceno|Buckwheat|Cereales y tubérculos|60|Grano seco|Buckwheat
Harina integral de trigo|168893|Cereales y tubérculos|30|Seca|Whole-wheat flour
Patata|Potatoes, flesh and skin, raw|Cereales y tubérculos|150|Cruda; aceite aparte al cocinar|Potato
Boniato|Sweet potato, raw, unprepared|Cereales y tubérculos|150|Crudo; aceite aparte al cocinar|Sweet potato
Yuca|Cassava, raw|Cereales y tubérculos|100|Peso crudo; requiere cocinado adecuado|Cassava
Tortilla integral de trigo|174081|Cereales y tubérculos|40|Lista para cocinar|Flour tortilla
Polenta|Cornmeal, whole-grain, yellow|Cereales y tubérculos|40|Harina de maíz seca|Polenta
Huevo|Egg, whole, raw, fresh|Lácteos y huevos|50|Peso sin cáscara; antes de cocinar|Egg as food
Clara de huevo|Egg, white, raw, fresh|Lácteos y huevos|30|Peso sin cáscara; antes de cocinar|Egg white
Leche entera|Milk, whole, 3.25% milkfat, with added vitamin D|Lácteos y huevos|200|Leche de vaca, peso en gramos|Milk
Leche semidesnatada|Milk, reduced fat, fluid, 2% milkfat, with added vitamin A and vitamin D|Lácteos y huevos|200|Leche de vaca al 2%, peso en gramos|Low-fat milk
Leche desnatada|Milk, nonfat, fluid, with added vitamin A and vitamin D (fat free or skim)|Lácteos y huevos|200|Leche de vaca, peso en gramos|Skimmed milk
Yogur natural|171284|Lácteos y huevos|125|Entero, natural, sin azúcar añadido|Yogurt
Yogur griego natural|Yogurt, Greek, plain, whole milk|Lácteos y huevos|125|Entero, sin azúcar añadido|Strained yogurt
Queso fresco|172223|Lácteos y huevos|60|Queso fresco de referencia USDA|Queso fresco
Ricota|Cheese, ricotta, whole milk|Lácteos y huevos|60|De leche entera|Ricotta
Mozzarella|Cheese, mozzarella, whole milk|Lácteos y huevos|40|De leche entera|Mozzarella
Queso feta|Cheese, feta|Lácteos y huevos|30|Listo para comer|Feta
Parmesano|Cheese, parmesan, hard|Lácteos y huevos|15|Queso duro|Parmigiano Reggiano
Queso cheddar|Cheese, cheddar|Lácteos y huevos|30|Listo para comer|Cheddar cheese
Kéfir natural|Kefir, lowfat, plain, LIFEWAY|Lácteos y huevos|125|Referencia comercial USDA, revisar etiqueta|Kefir
Pollo, pechuga cruda|Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw|Carnes y pescados|150|Sin piel ni hueso, antes de cocinar|Chicken as food
Pollo, pechuga asada|171477|Carnes y pescados|150|Ya cocinada, sin piel ni aceite añadido|Roast chicken
Pavo, pechuga cruda|Turkey, retail parts, breast, meat only, raw|Carnes y pescados|150|Sin piel, antes de cocinar|Turkey as food
Pavo, pechuga asada|Turkey, retail parts, breast, meat only, cooked, roasted|Carnes y pescados|100|Ya cocinada, sin piel|Roast turkey
Solomillo de cerdo|Pork, fresh, loin, tenderloin, separable lean only, raw|Carnes y pescados|150|Carne magra cruda|Pork tenderloin
Ternera picada magra|Beef, ground, 95% lean meat / 5% fat, raw|Carnes y pescados|150|Carne cruda al 5% de grasa|Ground beef
Conejo|Game meat, rabbit, domesticated, composite of cuts, raw|Carnes y pescados|150|Carne cruda, sin huesos|Rabbit as food
Salmón|175167|Carnes y pescados|150|Atlántico de cría, crudo|Salmon as food
Bacalao fresco|171955|Carnes y pescados|150|Atlántico, crudo, sin salar|Cod as food
Atún al natural|171986|Carnes y pescados|80|Conserva en agua, escurrida, sin sal añadida|Canned tuna
Sardinas en aceite|175139|Carnes y pescados|80|Conserva escurrida, con espina comestible|Sardines as food
Trucha|Fish, trout, rainbow, farmed, raw|Carnes y pescados|150|Arcoíris, cruda|Rainbow trout
Caballa|Fish, mackerel, Atlantic, raw|Carnes y pescados|150|Atlántica, cruda|Mackerel as food
Lenguado y platija|Fish, flatfish (flounder and sole species), raw|Carnes y pescados|150|Referencia conjunta USDA, cruda|Sole (fish)
Anchoa en aceite|Fish, anchovy, european, canned in oil, drained solids|Carnes y pescados|20|Conserva escurrida|Anchovies as food
Gambas cocidas|Crustaceans, shrimp, mixed species, cooked, moist heat|Carnes y pescados|100|Cocidas, peladas, sin aceite|Shrimp and prawn as food
Mejillón|Mollusks, mussel, blue, raw|Carnes y pescados|100|Carne cruda, sin concha|Mussel
Almejas|Mollusks, clam, mixed species, raw|Carnes y pescados|100|Carne cruda, sin concha|Clam
Pulpo|Mollusks, octopus, common, raw|Carnes y pescados|100|Crudo, parte comestible|Octopus as food
Calamar|Mollusks, squid, mixed species, raw|Carnes y pescados|100|Crudo, limpio|Squid as food
Almendras|Nuts, almonds|Frutos secos y semillas|30|Naturales, sin sal|Almond
Nueces|Nuts, walnuts, english|Frutos secos y semillas|30|Sin cáscara ni sal|Walnut
Avellanas|Nuts, hazelnuts or filberts|Frutos secos y semillas|30|Sin cáscara ni sal|Hazelnut
Pistachos|Nuts, pistachio nuts, raw|Frutos secos y semillas|30|Sin cáscara ni sal|Pistachio
Anacardos|Nuts, cashew nuts, raw|Frutos secos y semillas|30|Sin sal|Cashew
Cacahuetes|Peanuts, all types, raw|Frutos secos y semillas|30|Naturales, sin cáscara|Peanut
Piñones|Nuts, pine nuts, dried|Frutos secos y semillas|20|Sin cáscara|Pine nut
Castañas|Nuts, chestnuts, european, raw, peeled|Frutos secos y semillas|50|Crudas, peladas|Chestnut
Semillas de chía|Seeds, chia seeds, dried|Frutos secos y semillas|10|Secas|Chia seed
Semillas de lino|Seeds, flaxseed|Frutos secos y semillas|10|Secas|Flaxseed
Semillas de sésamo|Seeds, sesame seeds, whole, dried|Frutos secos y semillas|10|Secas|Sesame
Pipas de girasol|Seeds, sunflower seed kernels, dried|Frutos secos y semillas|20|Peladas, sin sal|Sunflower seed
Pipas de calabaza|Seeds, pumpkin and squash seed kernels, dried|Frutos secos y semillas|20|Peladas, sin sal|Pumpkin seed
Aceite de oliva|171413|Aceites y condimentos|5|Peso en gramos; 10 ml son aprox. 9,1 g|Olive oil
Aceite de girasol|171017|Aceites y condimentos|5|Peso en gramos|Sunflower oil
Mantequilla|Butter, without salt|Aceites y condimentos|10|Sin sal|Butter
Crema de cacahuete|Peanut butter, smooth style, without salt|Aceites y condimentos|15|Referencia USDA, revisar azúcares en etiqueta|Peanut butter
Tahini|Seeds, sesame butter, tahini, from roasted and toasted kernels (most common type)|Aceites y condimentos|15|Pasta de sésamo tostado|Tahini
Aceitunas|Olives, pickled, canned or bottled, green|Aceites y condimentos|30|Verdes, sin hueso|Olive
Mayonesa|Salad dressing, mayonnaise, regular|Aceites y condimentos|15|Preparada, referencia USDA|Mayonnaise
Mostaza|Mustard, prepared, yellow|Aceites y condimentos|10|Preparada|Mustard (condiment)
Vinagre|Vinegar, distilled|Aceites y condimentos|10|Destilado, peso en gramos|Vinegar
Tomate triturado|Tomatoes, crushed, canned|Aceites y condimentos|100|Conserva de referencia USDA|Tomato purée
Canela|171320|Aceites y condimentos|2|Molida|Cinnamon
Orégano|Spices, oregano, dried|Aceites y condimentos|2|Seco|Oregano
Pimentón|Spices, paprika|Aceites y condimentos|2|Seco, molido|Paprika
Comino|Spices, cumin seed|Aceites y condimentos|2|Seco|Cumin
Agua|173647|Bebidas y otros|200|Agua potable, sin añadidos|Drinking water
Café solo|Beverages, coffee, brewed, prepared with tap water|Bebidas y otros|150|Infusión, sin leche ni azúcar|Coffee
Té negro|Beverages, tea, black, brewed, prepared with tap water|Bebidas y otros|200|Infusión, sin leche ni azúcar|Black tea
Zumo de naranja|Orange juice, raw|Bebidas y otros|150|Recién exprimido, peso en gramos|Orange juice
Bebida de soja|Soymilk, original and vanilla, unfortified|Bebidas y otros|200|Referencia USDA; consultar marca y azúcar|Soy milk
Bebida de almendra|Beverages, almond milk, unsweetened, shelf stable|Bebidas y otros|200|Sin azúcar, referencia USDA|Almond milk
Chocolate negro|Chocolate, dark, 70-85% cacao solids|Bebidas y otros|20|70–85 % cacao|Dark chocolate
Miel|Honey|Bebidas y otros|10|Peso en gramos|Honey
Azúcar|Sugars, granulated|Bebidas y otros|5|Azúcar blanco|Sugar
Mermelada|Jams and preserves|Bebidas y otros|20|Referencia genérica, revisar etiqueta|Jam
Helado de vainilla|Ice creams, vanilla|Bebidas y otros|60|Referencia genérica, revisar etiqueta|Vanilla ice cream
Cruasán|Croissants, butter|Bebidas y otros|50|De mantequilla, referencia genérica|Croissant
Galletas de avena|Cookies, oatmeal, commercially prepared, regular|Bebidas y otros|30|Referencia genérica, revisar etiqueta|Oatmeal cookie
Palomitas|Snacks, popcorn, air-popped|Bebidas y otros|20|Sin aceite, mantequilla ni azúcar|Popcorn
Patatas fritas|170698|Bebidas y otros|100|Preparadas con aceite, referencia USDA|French fries
Arroz con leche|168782|Bebidas y otros|125|Preparado, referencia genérica|Rice pudding
"""


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    archive = CACHE / "usda-sr-legacy-2018.zip"
    if not archive.exists():
        with urllib.request.urlopen(URL, timeout=60) as response:
            archive.write_bytes(response.read())
    with zipfile.ZipFile(archive) as z:
        def rows(filename):
            name = next(n for n in z.namelist() if n.rsplit("/", 1)[-1] == filename)
            return csv.DictReader(io.TextIOWrapper(z.open(name), encoding="utf-8-sig"))
        foods = list(rows("food.csv"))
        energy = {r["fdc_id"]: float(r["amount"]) for r in rows("food_nutrient.csv") if r["nutrient_id"] == "1008"}
    output = []
    missing = []
    for line in SPEC.strip().splitlines():
        name, match, category, grams, preparation, topic = line.split("|")
        candidates = [f for f in foods if f["fdc_id"] == match or f["description"].casefold() == match.casefold()]
        if not candidates:
            candidates = [f for f in foods if f["description"].casefold().startswith(match.casefold())]
        if not candidates:
            missing.append((name, match))
            continue
        source = candidates[0]
        fdc_id = source["fdc_id"]
        if fdc_id not in energy:
            missing.append((name, "No kcal energy value: " + fdc_id))
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", __import__("unicodedata").normalize("NFKD", name).encode("ascii", "ignore").decode().lower()).strip("-")
        output.append(dict(id=slug, name=name, category=category, grams=int(grams), preparation=preparation,
                           kcalPer100g=energy[fdc_id], fdcId=int(fdc_id), sourceDescription=source["description"], photoTopic=topic))
    if missing:
        raise SystemExit("Resolve missing source records before generating: " + json.dumps(missing, ensure_ascii=False))
    result = dict(source="USDA FoodData Central · SR Legacy (April 2018)", sourceUrl=URL,
                  archiveSha256=hashlib.sha256(archive.read_bytes()).hexdigest(), nutrientId=1008,
                  basis="Energy in kcal per 100 g edible portion. Portions are editable examples.", foods=output)
    target = ROOT / "lib/points-foods.json"
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(f"Generated {len(output)} sourced foods in {target.relative_to(ROOT)}")
    for f in output:
        print(f'{f["name"]}: {f["kcalPer100g"]:g} kcal/100g · {f["fdcId"]} · {f["sourceDescription"]}')


if __name__ == "__main__":
    main()
