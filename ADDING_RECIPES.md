# Adding recipes

New recipes go at the **end of `data/weekly.js`**, one `W(...)` call per recipe. Nothing else needs to change: the page loads `weekly.js` automatically, and recipes without a saved photo get one from Wikimedia Commons in the visitor's browser (using the photo search query).

## Format

```js
W("Pork Belly with Preserved Mustard Greens", "梅干扣肉", "Hakka",   // cuisine must be a key of CUISINE_ZH in data/i18n.js
  "rice comfort festive protein",   // tags, space separated (see list below)
  2,                                 // difficulty: 1 easy, 2 medium, 3 hard
  4,                                 // servings
  560,                               // kcal per serving (estimate)
  "p:pork belly=1.5 lb;v:preserved mustard greens=4 oz;v:garlic=4 cloves;s:soy sauce=3 tbsp;s:sugar=1 tbsp",
  "10=Boil the pork belly whole for 10 minutes.|15=Rinse and soak the mustard greens.|90=Steam until tender.",
  "整塊五花肉水煮10分鐘。|梅干菜洗淨泡軟。|蒸至軟爛。",   // SAME number of steps, same order
  "梅干扣肉");                        // photo search query (Chinese or English dish name works best)
```

- **Ingredients**: `type:name=amount`, separated by `;`. Types: `p` protein, `v` vegetable/herb/fruit, `o` other main items (rice, noodles, flour, dairy, wrappers), `s` seasonings & pantry staples.
  - Reuse existing ingredient names whenever possible (lowercase, e.g. `chicken thigh`, `ground pork`, `napa cabbage`, `wheat noodles`), so the "what's in my fridge" matcher works.
  - Amounts start with a number then an English unit: `lb, oz, cup, cups, tbsp, tsp, cloves, in, heads, slices, sheets, pieces, can, cans, bunch, handful, pinch, stalks, block, pack, whole`.
  - If you use a new ingredient name, add its Chinese name above your recipes: `ZING({"preserved mustard greens":"梅干菜"});`
- **Steps**: `minutes=instruction`, separated by `|`. Every step needs a realistic time. Long waits (soak, marinate, rest, chill, long simmer) are detected as hands-off time.
- **Tags**: `healthy dessert kids protein breakfast soup noodle pasta rice dumpling street seafood spicy comfort onepot mealprep festive snack`. Vegetarian, vegan, quick, low-calorie and few-ingredient tags are worked out automatically.
- **No beverage recipes.**
- No duplicate English names (check existing ones first).

## Before you push

```sh
node scripts/validate.js
```

It must print `OK`.
