# Refraction UI — Image Generation Prompts

## Strategy

**Generate SUBJECTS first → then place them in SETTINGS**

Each person/animal/object is generated as a standalone portrait, then used as a seed/reference to generate contextual images. This ensures consistency (same person across multiple scenes) and genuine diversity.

**Monochrome/Brand-tinted variants via CSS — no separate images needed:**
```css
.rfr-mono { filter: grayscale(1); }
.rfr-tint-warm { filter: grayscale(1) sepia(0.3) hue-rotate(15deg) saturate(1.5); }
.rfr-tint-cool { filter: grayscale(1) sepia(0.2) hue-rotate(180deg) saturate(1.2); }
.rfr-tint-brand { filter: grayscale(1) sepia(0.25) hue-rotate(var(--primary-hue, 250deg)) saturate(1.3); }
```

---

## Phase 1: PEOPLE — Portraits by Geography

Balanced across all geographies, ages (toddler → elderly), genders, body types, styles.

### SOUTH ASIA (India, Pakistan, Bangladesh, Sri Lanka, Nepal)

```
SA-1: "Portrait of a South Asian man in his early 20s, dark brown skin, black curly hair, slim build, wearing a plain white t-shirt, relaxed natural smile, soft daylight, clean warm background — portrait photography, square 1:1"

SA-2: "Portrait of a South Asian woman in her mid-50s, medium brown skin, gray-streaked hair in a braid, reading glasses, wearing a maroon cotton kurta, warm wise smile, soft indoor light, neutral background — portrait, square 1:1"

SA-3: "Portrait of a South Asian woman in her late 20s, light brown skin, long black hair loose, minimal jewelry, wearing a denim jacket over white top, confident direct gaze, golden hour outdoor light — lifestyle portrait, square 1:1"

SA-4: "Portrait of a South Asian man in his early 40s, brown skin, neatly trimmed black beard with gray, wearing a steel-blue linen shirt, composed friendly expression, window light, light background — professional portrait, square 1:1"

SA-5: "Portrait of a South Asian teenage girl, 16-17 years old, dark skin, hair in a high ponytail, wearing a yellow hoodie, bright genuine laugh, outdoor natural light, blurred campus background — youth portrait, square 1:1"

SA-6: "Portrait of a South Asian man in his late 60s, deep brown weathered skin, white mustache, wearing a beige nehru jacket, gentle dignified expression, warm ambient light, dark background — elder portrait, square 1:1"

SA-CHILD-1: "Portrait of a South Asian toddler, about 2 years old, chubby cheeks, big dark curious eyes, wispy black hair, wearing a soft yellow cotton onesie, sitting and looking up with wonder, warm natural light, clean light background — baby portrait photography, square 1:1"

SA-CHILD-2: "Portrait of a South Asian girl, about 6 years old, dark hair in two braids with ribbons, bright gap-toothed smile, wearing a pink floral dress, outdoor garden light — child portrait, square 1:1"

SA-CHILD-3: "Portrait of a South Asian boy, about 10 years old, wearing a cricket jersey, holding a ball, mischievous grin, outdoor playground light — child portrait, square 1:1"
```

### EAST ASIA (China, Japan, Korea, Taiwan, Mongolia)

```
EA-1: "Portrait of a Chinese man in his early 30s, light skin, short neat black hair, clean-shaven, wearing a black mock-neck sweater, calm composed expression, cool-toned studio light, gray background — portrait, square 1:1"

EA-2: "Portrait of a Japanese woman in her early 70s, short silver-white hair, gentle wrinkles, wearing an indigo linen blouse, serene warm smile, soft natural light, pale background — elder portrait, square 1:1"

EA-3: "Portrait of a Korean man in his late teens, medium build, black hair with slight wave, wearing an oversized olive bomber jacket, playful half-smile, outdoor urban light, blurred city background — youth portrait, square 1:1"

EA-4: "Portrait of a Chinese woman in her mid-40s, hair in a professional low chignon, minimal pearl earrings, wearing a tailored charcoal blazer, confident poised expression, studio lighting — executive portrait, square 1:1"

EA-5: "Portrait of a Taiwanese non-binary person in their mid-20s, short textured hair dyed dark brown, wearing a cream oversized cardigan, thoughtful gentle expression, warm café-style lighting — lifestyle portrait, square 1:1"

EA-6: "Portrait of a Mongolian man in his early 50s, broad weathered face, short graying hair, wearing a dark wool jacket, strong steady gaze, dramatic side lighting, dark background — character portrait, square 1:1"

EA-CHILD-1: "Portrait of a Chinese baby, about 8 months old, round face, sparse black hair, wearing a white knit romper, reaching towards camera with tiny hands, soft warm light, cream background — baby portrait, square 1:1"

EA-CHILD-2: "Portrait of a Japanese girl, about 5 years old, short bob haircut with bangs, wearing a navy pinafore dress, shy sweet smile, soft indoor light — child portrait, square 1:1"

EA-CHILD-3: "Portrait of a Korean boy, about 8 years old, wearing a striped t-shirt, big toothy grin, holding a stack of books, bright classroom light — child portrait, square 1:1"
```

### SOUTHEAST ASIA (Thailand, Vietnam, Philippines, Indonesia, Malaysia)

```
SEA-1: "Portrait of a Filipino woman in her early 30s, warm tan skin, long dark hair, wearing a white linen blouse, bright cheerful smile, soft natural light, green foliage background — portrait, square 1:1"

SEA-2: "Portrait of a Vietnamese man in his mid-60s, thin build, silver hair, wearing a simple gray polo shirt, kind knowing smile, warm indoor light, neutral background — elder portrait, square 1:1"

SEA-3: "Portrait of a Thai woman in her early 20s, petite, straight black hair with bangs, wearing a pastel blue top, fresh youthful expression, bright even lighting, white background — portrait, square 1:1"

SEA-4: "Portrait of an Indonesian man in his late 30s, brown skin, short black hair, trimmed goatee, wearing a batik-patterned collar shirt, warm friendly expression, natural light, soft background — professional portrait, square 1:1"

SEA-5: "Portrait of a Malaysian woman in her mid-40s, wearing a modern hijab in dusty rose, warm brown skin, elegant minimal makeup, confident composed expression, studio lighting, clean background — portrait, square 1:1"

SEA-6: "Portrait of a Filipino teenage boy, 15-16, dark tan skin, slightly messy hair, wearing a red athletic jersey, wide energetic grin, outdoor sports field light — youth portrait, square 1:1"

SEA-CHILD-1: "Portrait of a Thai toddler, about 18 months old, round face, tiny wispy hair, wearing a mint green cotton outfit, clapping hands with delight, bright natural light, white background — baby portrait, square 1:1"

SEA-CHILD-2: "Portrait of a Vietnamese girl, about 7 years old, long straight black hair with a red hairclip, wearing a white ao dai top, gentle smile, soft natural light — child portrait, square 1:1"

SEA-CHILD-3: "Portrait of an Indonesian boy, about 4 years old, curly black hair, big brown eyes, wearing a blue polo shirt, curious wide-eyed expression, outdoor light — child portrait, square 1:1"
```

### AFRICA (West, East, South, North)

```
AF-1: "Portrait of a Nigerian woman in her early 30s, rich dark skin, natural coily hair in a TWA, wearing gold stud earrings and an emerald green top, radiant confident smile, warm studio light, earth-toned background — portrait, square 1:1"

AF-2: "Portrait of a Kenyan man in his mid-20s, very dark skin, short hair, lean athletic build, wearing a plain gray crew-neck tee, calm focused expression, natural outdoor light, savanna-toned background — portrait, square 1:1"

AF-3: "Portrait of a South African woman in her late 50s, medium brown skin, graying locs, wearing a colorful headwrap and navy blouse, wise warm expression, soft indoor light — elder portrait, square 1:1"

AF-4: "Portrait of an Ethiopian man in his early 40s, brown skin, short beard, wearing a white cotton shirt, thoughtful dignified expression, golden hour side light, warm background — portrait, square 1:1"

AF-5: "Portrait of a Moroccan woman in her late 20s, olive-brown skin, long dark wavy hair, wearing a cream knit sweater, soft natural smile, warm daylight, neutral background — lifestyle portrait, square 1:1"

AF-6: "Portrait of a Ghanaian teenage girl, 17-18, dark skin, braids with beads, wearing a bright yellow blouse, joyful laughing expression, outdoor light, blurred green background — youth portrait, square 1:1"

AF-CHILD-1: "Portrait of a Nigerian toddler, about 2 years old, rich dark skin, tiny curly hair, wearing a bright orange romper, wide-eyed curious expression looking at something off-camera, warm natural light — baby portrait, square 1:1"

AF-CHILD-2: "Portrait of a Kenyan boy, about 5 years old, dark skin, short hair, wearing a green t-shirt, beaming smile with dimples, outdoor sunny light — child portrait, square 1:1"

AF-CHILD-3: "Portrait of an Ethiopian girl, about 9 years old, brown skin, hair in neat cornrows, wearing a white school shirt, studious focused expression, classroom natural light — child portrait, square 1:1"
```

### MIDDLE EAST (Gulf, Levant, Iran, Turkey)

```
ME-1: "Portrait of a Lebanese man in his early 30s, olive skin, dark stubble, slicked-back dark hair, wearing a white button-down, confident charming expression, warm ambient light, dark background — portrait, square 1:1"

ME-2: "Portrait of an Iranian woman in her mid-40s, fair-olive skin, dark hair pulled back, wearing a teal silk scarf loosely, elegant composed expression, soft studio light, gray background — portrait, square 1:1"

ME-3: "Portrait of an Emirati man in his early 60s, wearing a white kandura and ghutra, trimmed gray beard, dignified warm expression, clean bright background, studio lighting — portrait, square 1:1"

ME-4: "Portrait of a Turkish woman in her early 20s, light olive skin, dark curly hair, wearing a rust-colored sweater, open friendly smile, outdoor café light, warm tones — lifestyle portrait, square 1:1"

ME-5: "Portrait of a Palestinian teenage boy, 16-17, olive skin, dark wavy hair, wearing a dark green hoodie, determined thoughtful expression, natural daylight, neutral background — youth portrait, square 1:1"

ME-6: "Portrait of a Saudi woman in her late 30s, wearing a modern black abaya with subtle embroidery, hair showing, warm brown skin, poised confident smile, elegant lighting — portrait, square 1:1"

ME-CHILD-1: "Portrait of a Turkish toddler, about 18 months old, light olive skin, dark curly hair, wearing a cream knit sweater, reaching out with both arms, warm indoor light — baby portrait, square 1:1"

ME-CHILD-2: "Portrait of an Emirati boy, about 6 years old, wearing a small white kandura, holding a toy, shy smile, bright clean background — child portrait, square 1:1"

ME-CHILD-3: "Portrait of a Lebanese girl, about 11 years old, olive skin, long dark hair, wearing a denim vest over white t-shirt, animated talking expression, outdoor light — child portrait, square 1:1"
```

### EUROPE (Western, Eastern, Nordic, Mediterranean)

```
EU-1: "Portrait of a French woman in her mid-30s, fair skin, light brown shoulder-length hair, wearing a striped Breton top, effortless natural expression, soft Parisian daylight, muted background — portrait, square 1:1"

EU-2: "Portrait of a Polish man in his early 50s, fair skin, short salt-and-pepper hair, square jaw, wearing a dark olive field jacket, steady calm expression, cool-toned light, gray background — portrait, square 1:1"

EU-3: "Portrait of a Greek woman in her late 60s, olive skin, short silver curly hair, wearing a white linen shirt, warm deep smile with laugh lines, Mediterranean sunlight, warm background — elder portrait, square 1:1"

EU-4: "Portrait of a Swedish non-binary person in their early 20s, very fair skin, platinum blonde short hair, wearing a black turtleneck, composed neutral expression, clean minimal studio lighting, white background — editorial portrait, square 1:1"

EU-5: "Portrait of a Romanian man in his late 20s, light skin, dark thick eyebrows, short dark hair, wearing a burgundy knit sweater, easy genuine smile, warm indoor light — lifestyle portrait, square 1:1"

EU-6: "Portrait of an Italian man in his early 70s, tanned olive skin, full head of white hair, neatly trimmed white beard, wearing a navy linen blazer, charismatic warm gaze, golden light — character portrait, square 1:1"

EU-CHILD-1: "Portrait of a Swedish baby, about 10 months old, very fair skin, wispy blonde hair, wearing a soft gray romper, bright blue eyes looking at camera, soft natural light — baby portrait, square 1:1"

EU-CHILD-2: "Portrait of a Spanish girl, about 4 years old, olive skin, dark curly pigtails, wearing a red polka-dot dress, huge joyful smile, sunny outdoor light — child portrait, square 1:1"

EU-CHILD-3: "Portrait of a German boy, about 7 years old, fair skin, light brown hair, wearing a blue rain jacket, curious adventurous expression, outdoor forest light — child portrait, square 1:1"
```

### AMERICAS (North, Central, South, Caribbean)

```
AM-1: "Portrait of a Black American woman in her mid-40s, medium-dark skin, natural curly hair shoulder length, wearing a camel-colored blazer, warm professional smile, studio lighting, neutral background — portrait, square 1:1"

AM-2: "Portrait of a Mexican man in his early 30s, warm brown skin, short dark hair, neatly groomed mustache, wearing an olive green henley, relaxed friendly gaze, golden outdoor light — portrait, square 1:1"

AM-3: "Portrait of a Brazilian woman in her early 20s, light brown skin, long dark curly hair, wearing a white crop top, vibrant joyful smile, bright natural light, tropical green background — lifestyle portrait, square 1:1"

AM-4: "Portrait of a Canadian Indigenous man in his late 50s, medium skin, long silver-black hair in a low tie, wearing a denim shirt, wise grounded expression, warm natural light, earth-toned background — portrait, square 1:1"

AM-5: "Portrait of a Colombian teenage girl, 17-18, tan skin, dark hair in a messy bun, wearing a bright coral sweatshirt, animated laughing expression, outdoor light, urban background — youth portrait, square 1:1"

AM-6: "Portrait of a Jamaican man in his early 40s, dark skin, short dreadlocs, wearing a light blue linen shirt, easy charismatic smile, warm Caribbean light, blurred palm background — portrait, square 1:1"

AM-CHILD-1: "Portrait of a mixed-race American toddler, about 2 years old, light brown skin, soft curly brown hair, wearing denim overalls over a striped shirt, giggling with eyes squeezed shut, warm light — baby portrait, square 1:1"

AM-CHILD-2: "Portrait of a Mexican girl, about 5 years old, brown skin, dark hair in braids, wearing a white embroidered blouse, gentle smile holding a flower, outdoor golden light — child portrait, square 1:1"

AM-CHILD-3: "Portrait of a Brazilian boy, about 8 years old, light brown skin, curly dark hair, wearing a green soccer jersey, kicking motion, outdoor field light — child portrait, square 1:1"
```

### PACIFIC / OCEANIA

```
OC-1: "Portrait of an Australian Aboriginal man in his mid-30s, dark skin, short black hair and beard, wearing a dark gray t-shirt, calm strong expression, warm natural outdoor light, red earth-toned background — portrait, square 1:1"

OC-2: "Portrait of a New Zealand Māori woman in her late 20s, brown skin, long dark hair, wearing a black top, confident warm smile, soft natural light, green background — portrait, square 1:1"

OC-3: "Portrait of a Samoan man in his early 50s, large build, brown skin, short graying hair, wearing a navy polo, gentle warm expression, outdoor light — portrait, square 1:1"

OC-4: "Portrait of an Australian woman in her early 30s, fair skin with freckles, red-auburn hair, wearing a khaki linen shirt, bright open smile, golden outdoor light — lifestyle portrait, square 1:1"

OC-CHILD-1: "Portrait of a Māori toddler, about 18 months old, brown skin, curly dark hair, wearing a small red hoodie, wide curious eyes, warm indoor light — baby portrait, square 1:1"

OC-CHILD-2: "Portrait of an Aboriginal Australian girl, about 6 years old, dark skin, hair with a colorful headband, wearing a bright purple t-shirt, shy dimpled smile, outdoor light — child portrait, square 1:1"
```

---

## Phase 2: PLACE people in SETTINGS (use portraits as seed/reference)

### Workplace Settings
```
"[Use SA-3 as reference] Same woman, working at laptop in modern co-working space, natural light, candid — workplace photography"
"[Use EA-1, AF-2, EU-1, AM-1 as reference] Four people in a glass-walled meeting room, discussing around a whiteboard, modern office — team meeting photography"
"[Use SA-4 as reference] Same man, presenting on a screen to colleagues in a conference room — business presentation photography"
```

### Hospitality Settings
```
"[Use EU-6 as reference] Same man, checking in at a luxury hotel reception, marble lobby, warm lighting — hospitality photography"
"[Use EA-2, OC-4 as reference] Two women having afternoon tea on a hotel terrace, ocean view, golden light — resort lifestyle"
"[Use ME-3, SA-CHILD-1 as reference] Grandfather walking with toddler through hotel garden, warm afternoon light — family hospitality"
```

### Education Settings
```
"[Use EA-3, SEA-6, AM-5 as reference] Three teenagers studying together in a modern university library — education photography"
"[Use AF-6 as reference] Teenage girl in a science lab, safety goggles on forehead, examining a beaker — STEM education"
"[Use SA-CHILD-2, EU-CHILD-3 as reference] Two children painting at an art table, colorful classroom — primary education"
```

### Healthcare Settings
```
"[Use SEA-5 as reference] Same woman in doctor's white coat with stethoscope, consulting with patient [EU-2] in modern clinic — healthcare photography"
"[Use AM-1 as reference] Same woman as patient, sitting in bright modern clinic waiting area with magazine — healthcare"
"[Use AF-4 as reference] Same man as doctor, examining a child [EA-CHILD-2], parent [EA-4] watching, pediatric office — healthcare"
```

### Restaurant/Dining Settings
```
"[Use ME-1 as reference] Same man in chef's whites, plating a dish in professional kitchen — culinary photography"
"[Use EU-1, AM-6 as reference] Couple dining at elegant restaurant, candlelit, exposed brick — dining photography"
"[Use SA-CHILD-2, SA-4 as reference] Father and daughter sharing dessert at a family restaurant, warm cozy light — family dining"
```

### E-commerce / Shopping Settings
```
"[Use SEA-1 as reference] Same woman browsing clothing in a bright modern boutique — retail photography"
"[Use AM-3 as reference] Same woman opening a delivery package at home, excited expression — e-commerce unboxing"
"[Use EA-5 as reference] Person trying on sunglasses, looking in a store mirror — retail lifestyle"
```

### Family / Lifestyle Settings
```
"[Use AF-1, AF-2, AF-CHILD-1 as reference] Young parents with toddler in a sunny park, playing on grass — family lifestyle photography"
"[Use EU-3, EU-CHILD-2 as reference] Grandmother reading to granddaughter on a living room sofa — family warmth"
"[Use AM-2, AM-CHILD-2 as reference] Father and daughter cooking together in a home kitchen — family lifestyle"
"[Use OC-2, OC-CHILD-1 as reference] Mother carrying toddler on a beach at golden hour — family lifestyle"
```

### Finance / Professional Settings
```
"[Use SA-4 as reference] Same man reviewing charts on a tablet at a glass desk, modern financial office — fintech photography"
"[Use EU-2 as reference] Same man in a serious meeting with two colleagues, conference table, documents — business photography"
```

---

## Phase 3: ANIMALS (generate subject first → then settings)

```
DOG-1: "Portrait of a Golden Retriever, warm amber fur, tongue slightly out, happy expression, soft outdoor light, blurred green background — pet portrait, square 1:1"
→ Setting: "[Same dog] running on sandy beach at sunset, dynamic motion — pet lifestyle"
→ Setting: "[Same dog] sitting beside a child [EU-CHILD-3] on a living room floor — family pet"

DOG-2: "Portrait of a German Shepherd, alert ears, noble expression, outdoor autumn foliage light — dog portrait, square 1:1"
→ Setting: "[Same dog] walking on leash with owner [OC-1] in a park — active lifestyle"

DOG-3: "Portrait of a Shiba Inu, orange/cream coat, alert squinting happy expression, outdoor light — dog portrait, square 1:1"

DOG-4: "Portrait of a chocolate Labrador puppy, floppy ears, big brown eyes, playful expression, wooden floor — puppy portrait, square 1:1"
→ Setting: "[Same puppy] playing with toddler [AM-CHILD-1] on a carpeted living room — family pet"

DOG-5: "Portrait of a Border Collie, black and white, intelligent alert eyes, outdoor field — dog portrait, square 1:1"

DOG-6: "Portrait of a Beagle, tri-color, nose up sniffing, garden background — dog portrait, square 1:1"

CAT-1: "Portrait of an orange tabby cat, green eyes, sitting upright, alert curious expression, window light — cat portrait, square 1:1"
→ Setting: "[Same cat] curled on a cream sofa cushion, afternoon sunlight — cozy lifestyle"

CAT-2: "Portrait of a Siamese cat, striking blue eyes, cream and seal point, elegant pose — cat portrait, square 1:1"

CAT-3: "Portrait of a Bengal cat, spotted coat, golden eyes, alert sitting — cat portrait, square 1:1"
→ Setting: "[Same cat] lounging on a sunlit windowsill, modern apartment — lifestyle"

CAT-4: "Portrait of a gray British Shorthair, copper eyes, plush round face, regal pose — cat portrait, square 1:1"

CAT-5: "Portrait of a Maine Coon, large fluffy tabby, green eyes, majestic sitting — cat portrait, square 1:1"

CAT-6: "Portrait of a black cat, sleek fur, bright yellow-green eyes, mysterious elegant pose, dark background — cat portrait, square 1:1"
```

---

## Phase 4: OBJECTS (generate subject first → then contexts)

```
OBJ-1: "Minimalist white ceramic coffee cup with latte art, clean surface, soft directional light — product photography, square 1:1"
→ Context: "[Same cup] on marble café table next to croissant, morning light — food lifestyle"
→ Context: "[Same cup] on rustic wooden desk beside notebook, warm afternoon — workspace"

OBJ-2: "Tan leather messenger bag, minimal design, brass buckle, white surface, soft shadow — product photography"

OBJ-3: "Minimalist wristwatch, black leather strap, white dial, rose gold case, dark slate surface — luxury product photography"

OBJ-4: "Monstera deliciosa in matte black ceramic pot, healthy green leaves, white background — plant product photography"

OBJ-5: "Clean white leather minimalist sneakers, concrete surface, soft lighting — footwear product photography"

OBJ-6: "Modern slim silver laptop slightly open, clean white desk, soft reflection — tech product photography, no visible brand logos"

OBJ-7: "Luxury soy candle in amber glass jar, wooden wick, dark moody background — lifestyle product photography"

OBJ-8: "Red wine bottle with elegant blank label, two glasses, rustic wood, warm moody lighting — wine photography"

OBJ-9: "Over-ear headphones, matte black, premium build, light wood surface — tech product photography, no visible brand"

OBJ-10: "Premium leather-bound notebook, closed, quality pen on top, dark wood desk, warm directional light — stationery photography"

OBJ-11: "Artisan ceramic bowl set, earth-toned glazes, stacked on linen cloth, natural light — homeware product photography"

OBJ-12: "Fresh bouquet of wildflowers in a clear glass vase, white table, bright natural light — floral lifestyle photography"
```

---

## Phase 5: SCENES (composite, using generated subjects)

```
SCENE-OFFICE: "Modern open-plan office, concrete floors, warm wood desks, plants, large windows with city view, [SA-3, EA-1, AF-2, EU-5] working at desks, natural daylight — workplace photography, wide angle"

SCENE-CAFE: "Cozy modern café, exposed brick, pendant lights, [ME-4, AM-3] chatting at a wooden table with coffee, barista in background — interior lifestyle photography"

SCENE-CLINIC: "Bright modern medical clinic, white and wood, [SEA-5] as doctor speaking with [EU-2] patient, calming green plants — healthcare photography"

SCENE-CAMPUS: "University commons, [EA-3, SEA-6, AM-5, AF-6] studying at tables with laptops, large windows, natural light — education photography"

SCENE-STORE: "Minimalist retail interior, [EU-1] browsing displayed products, warm spotlighting, marble floor — retail photography"

SCENE-PARK: "City park, [AM-2, AM-CHILD-2] on a bench, [DOG-1] at their feet, autumn afternoon, golden leaves — family lifestyle photography"

SCENE-KITCHEN: "Modern restaurant kitchen, [ME-1] as chef plating, [AF-4] tasting a sauce, steam and action — culinary photography"

SCENE-CLASSROOM: "Primary school classroom, [SA-CHILD-2, EU-CHILD-2, AF-CHILD-2, EA-CHILD-2] at a round table with art supplies, teacher [AM-1] helping — education photography"

SCENE-HOTEL-LOBBY: "Luxury hotel lobby, marble and brass, [EU-6] at reception desk being greeted by [SEA-1] as concierge, chandelier, warm ambient — hospitality photography"
```

---

## Image Naming Convention

```
people/sa/sa-1-portrait.jpg          # South Asian man 20s portrait
people/sa/sa-1-workplace.jpg         # Same person in workplace
people/sa/sa-child-1-portrait.jpg    # South Asian toddler

animals/dogs/dog-1-portrait.jpg      # Golden Retriever portrait
animals/dogs/dog-1-beach.jpg         # Same dog on beach

objects/obj-1-product.jpg            # Coffee cup product shot
objects/obj-1-cafe.jpg               # Same cup in café

scenes/scene-office.jpg              # Office composite
```

---

## CSS Filter Utilities (built into @refraction-ui/assets)

```css
/* Monochrome */
.rfr-mono { filter: grayscale(1); }

/* Brand-tinted monochrome (auto-matches theme primary) */
.rfr-tint-brand {
  filter: grayscale(1) sepia(0.25) hue-rotate(var(--primary-hue, 250deg)) saturate(1.3);
}

/* Preset tints */
.rfr-tint-warm { filter: grayscale(1) sepia(0.3) hue-rotate(15deg) saturate(1.5); }
.rfr-tint-cool { filter: grayscale(1) sepia(0.2) hue-rotate(180deg) saturate(1.2); }
.rfr-tint-sepia { filter: grayscale(1) sepia(0.6); }

/* Adjustable opacity overlay for text-on-image */
.rfr-img-overlay {
  position: relative;
}
.rfr-img-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: hsl(var(--background) / var(--overlay-opacity, 0.5));
}
```
