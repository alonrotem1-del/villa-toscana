/* Villa Toscana catalogue data.
   Every price, size and model code here comes from the current villa-toscana.co.il pages:
   plants-price-list.html, taracota.html and fountain.html.
   Size notation follows the shop's own convention: the LAST number is always the height in cm.
     "56/56"     -> diameter (or side) 56, height 56
     "80/23/40"  -> length 80, depth 23, height 40
   Prices are in NIS before VAT unless the size carries `vat: true`. */
window.VT = (function () {
  const finishes = {
    C:  { name: 'בטון',      color: '#b9ad97', dark: '#8f846f' },
    G:  { name: 'אפור בטון', color: '#9b9a95', dark: '#73726d' },
    DG: { name: 'אפור כהה',  color: '#55575a', dark: '#38393b' },
    B:  { name: 'שחור',      color: '#2a2a2b', dark: '#141415' },
    W:  { name: 'לבן',       color: '#efede7', dark: '#cfccc4' },
    TC: { name: 'טרקוטה אדומה', color: '#c56a43', dark: '#9b4b2a' },
    AT: { name: 'טרקוטה ענתיקה', color: '#c9b79a', dark: '#a08d70' },
    BR: { name: 'טרקוטה חומה', color: '#8a5a3c', dark: '#653f28' },
    TW: { name: 'טרקוטה לבנה', color: '#ece6da', dark: '#c8bfae' }
  };

  const cats = {
    sets:    'סטים משתלמים',
    round:   'עציצים עגולים',
    tall:    'מרובעים וגבוהים',
    trough:  'אדניות',
    low:     'קערות ונמוכים',
    access:  'מעמדים ואקססוריז'
  };

  // Pages in sub-folders (models/) set window.VT_BASE = '../' before loading this file.
  const BASE = (typeof window !== 'undefined' && window.VT_BASE) || '';
  const IMG = BASE + 'assets/img/';

  // shape: box | taper (square cone) | cyl | taperRound | egg | bowl | sphere | stand
  const products = [
    { id: 'p1', title: 'סט 3 עציצים מרובעים גבוהים', cats: ['sets', 'tall'], shape: 'box',
      img: 'set-tall-squares.webp', thumbs: ['p01.webp', 'lifestyle-deck-squares.webp'], finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 950, dims: ['40/80', '34/70', '26/60'] },
      sizes: [{ dim: '40/80', price: 330 }, { dim: '34/70', price: 195 }, { dim: '26/60', price: 145 }],
      featured: true },
    { id: 'p2', title: 'מרובע קונוס גבוה', cats: ['sets', 'tall'], shape: 'taper',
      img: 'p02.webp', finishes: ['C', 'B'],
      set: { label: 'סט 2 יחידות', price: 490, dims: ['44/93', '33/62'] },
      sizes: [{ dim: '44/93', price: 350 }, { dim: '36/66', price: 200 }] },
    { id: 'p3', title: 'מרובע קונוס', cats: ['tall'], shape: 'taper',
      img: 'p03.webp', finishes: ['C', 'DG'],
      sizes: [{ dim: '46/46/61', price: 280 }, { dim: '36/36/51', price: 145 }] },
    { id: 'p4', title: 'סט עגול גבוה', cats: ['sets', 'round', 'tall'], shape: 'cyl',
      img: 'p04.webp', finishes: ['C'],
      set: { label: 'סט 3 יחידות', price: 650, dims: ['46/81', '40/71', '34/61'] },
      sizes: [{ dim: '46/81', price: 400 }, { dim: '40/71', price: 240 }, { dim: '34/61', price: 170 }] },
    { id: 'p5', title: 'סט עגול 4 יחידות', cats: ['sets', 'round'], shape: 'cyl',
      img: 'p05.webp', thumbs: ['p05b.webp', 'composition-6.webp'], finishes: ['C', 'B'],
      set: { label: 'סט 4 יחידות', price: 770, dims: ['56/56', '48/48', '42/42', '36/36'] },
      sizes: [{ dim: '56/56', price: 380 }, { dim: '48/48', price: 280 }, { dim: '42/42', price: 210 }, { dim: '36/36', price: 130 }],
      featured: true },
    { id: 'p6', title: 'עציץ עגול גבוה מתחדד', cats: ['round', 'tall'], shape: 'taperRound',
      img: 'p06.webp', finishes: [],
      sizes: [{ dim: '60/81', price: 390 }, { dim: '51/72', price: 240 }, { dim: '41/61', price: 160 }] },
    { id: 'p7', title: 'סט 2 אדניות', cats: ['sets', 'trough'], shape: 'box',
      img: 'p07.webp', finishes: ['C', 'DG'],
      set: { label: 'סט 2 יחידות', price: 770, dims: ['110/40/50', '95/30/40'] },
      sizes: [{ dim: '110/40/50', price: 550 }, { dim: '95/30/40', price: 350 }] },
    { id: 'p8', title: 'סט 2 אדניות גבוהות', cats: ['sets', 'trough', 'tall'], shape: 'box',
      img: 'p08.webp', finishes: ['C', 'B'],
      set: { label: 'סט 2 יחידות', price: 1100, dims: ['80/31/92', '60/25/72'] },
      sizes: [{ dim: '80/31/92', price: 790 }, { dim: '60/25/72', price: 540 }] },
    { id: 'p8a', title: 'סט 3 אדניות גבוהות', cats: ['sets', 'trough', 'tall'], shape: 'box',
      img: 'p08a.webp', finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 1300, dims: ['100/35/79', '85/27/70', '75/19/59'] },
      sizes: [{ dim: '100/35/79', price: 790 }, { dim: '85/27/70', price: 540 }, { dim: '75/19/59', price: 320 }],
      featured: true },
    { id: 'p8b', title: 'אדניות רחבות ועמוקות', cats: ['trough'], shape: 'box',
      img: 'p08b.webp', finishes: ['C', 'B'],
      sizes: [{ dim: '100/70/90', price: 990 }, { dim: '80/50/70', price: 690 }, { dim: '70/40/60', price: 550 }] },
    { id: 'p9', title: 'סט 2 אדניות למרפסת', cats: ['sets', 'trough'], shape: 'box',
      img: 'p09.webp', finishes: ['C', 'B'],
      set: { label: 'סט 2 יחידות', price: 690, dims: ['100/31/50', '80/23/40'] },
      sizes: [{ dim: '100/31/50', price: 490 }, { dim: '80/23/40', price: 320 }],
      featured: true },
    { id: 'p10', title: 'סט 3 אדניות', cats: ['sets', 'trough'], shape: 'box',
      img: 'p10.webp', finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 800, dims: ['93/38/38', '83/30/30', '70/25/25'] },
      sizes: [{ dim: '93/38/38', price: 450 }, { dim: '83/30/30', price: 290 }, { dim: '70/25/25', price: 190 }] },
    { id: 'p11', title: 'סט 4 אדניות מרובעות (קוביות)', cats: ['sets', 'tall'], shape: 'box',
      img: 'lifestyle-cubes-wall.webp', thumbs: ['p11.webp'], finishes: ['C', 'B'],
      set: { label: 'סט 4 יחידות', price: 1800, dims: ['75/75', '60/60', '50/50', '40/40'] },
      sizes: [{ dim: '75/75', price: 1100 }, { dim: '60/60', price: 550 }, { dim: '50/50', price: 300 }, { dim: '40/40', price: 210 }] },
    { id: 'p12', title: 'סט 2 אדניות', cats: ['sets', 'trough'], shape: 'box',
      img: 'lifestyle-troughs.webp', thumbs: ['p12.webp'], finishes: ['C', 'B'],
      set: { label: 'סט 2 יחידות', price: 620, dims: ['100/45/45', '80/38/38'] },
      sizes: [{ dim: '100/45/45', price: 490 }, { dim: '80/38/38', price: 290, sale: true }] },
    { id: 'p12a', title: 'סט אדניות – 3 מידות', cats: ['sets', 'trough'], shape: 'box',
      img: 'p12.webp', finishes: ['C', 'DG'],
      set: { label: 'מחיר סט', price: 590, dims: ['100/45/45', '80/35/35', '60/28/28'], noSavings: true }, // the old site calls it 'סט 2' but lists 3 sizes
      sizes: [{ dim: '100/45/45', price: 490 }, { dim: '80/35/35', price: 250 }, { dim: '60/28/28', price: 180 }] },
    { id: 'p12b', title: 'אדנית צרה', cats: ['trough'], shape: 'box',
      img: 'p12.webp', finishes: ['C'],
      sizes: [{ dim: '75/20/20', price: 145 }] },
    { id: 'p13', title: 'סט 2 אדניות מרובעות נמוכות', cats: ['sets', 'low'], shape: 'box',
      img: 'p13.webp', finishes: ['B'],
      set: { label: 'סט 2 יחידות', price: 199, dims: ['52/24', '42/18'] },
      sizes: [] },
    { id: 'p14', title: 'אדניות ארוכות', cats: ['sets', 'trough'], shape: 'box',
      img: 'p14.webp', finishes: ['C', 'DG'],
      set: { label: 'סט 2 יחידות', price: 1400, dims: ['150/40/50', '132/30/40'] },
      sizes: [{ dim: '200/50/60', price: 1750 }, { dim: '150/40/50', price: 1100 }, { dim: '132/30/40', price: 650 }] },
    { id: 'p15', title: 'סט 3 עציצים עגולים', cats: ['sets', 'round'], shape: 'cyl',
      img: 'p15.webp', finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 480, dims: ['52/54', '37/48', '27/36'] },
      sizes: [{ dim: '52/54', price: 290 }, { dim: '37/48', price: 180 }, { dim: '27/36', price: 110 }],
      featured: true },
    { id: 'p16', title: 'סט 3 עציצים נמוכים', cats: ['sets', 'round', 'low'], shape: 'bowl',
      img: 'p16.webp', finishes: ['C'],
      set: { label: 'סט 3 יחידות', price: 420, dims: ['55/40', '41/30', '29/21'] },
      sizes: [{ dim: '55/40', price: 250 }, { dim: '41/30', price: 160 }, { dim: '29/21', price: 110 }] },
    { id: 'p17', title: 'קערה גדולה', cats: ['low', 'round'], shape: 'bowl',
      img: 'p17.webp', finishes: ['C', 'B'],
      sizes: [{ dim: '112/50', price: 1100 }] },
    { id: 'p18', title: 'סט 3 עציצים בטניים', cats: ['sets', 'round'], shape: 'egg',
      img: 'p18.webp', finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 1700, dims: ['80/77', '65/62', '51/50'] },
      sizes: [{ dim: '80/77', price: 990 }, { dim: '65/62', price: 590 }, { dim: '51/50', price: 320 }] },
    { id: 'p19', title: 'סט 3 עציצים רחבים', cats: ['sets', 'round', 'low'], shape: 'egg',
      img: 'p19.webp', finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 1700, dims: ['81/60', '71/55', '61/50'] },
      sizes: [{ dim: '81/60', price: 990 }, { dim: '71/55', price: 590 }, { dim: '61/50', price: 320 }] },
    { id: 'p20', title: 'סט 3 עציצים מתחדדים', cats: ['sets', 'round', 'tall'], shape: 'taperRound',
      img: 'p20.webp', thumbs: ['composition-2.webp'], finishes: ['C', 'DG'],
      set: { label: 'סט 3 יחידות', price: 790, dims: ['60/68', '42/48', '27/30'] },
      sizes: [{ dim: '60/68', price: 480 }, { dim: '42/48', price: 280 }, { dim: '27/30', price: 180 }],
      featured: true },
    { id: 'ga2813', code: 'GA30-2813', title: 'עציץ עגול מרקם', cats: ['round'], shape: 'egg',
      img: 'p-ga30-2813.webp', finishes: ['C', 'B'],
      sizes: [{ dim: '54/58', price: 590 }, { dim: '44/48', price: 320 }, { dim: '37/40', price: 210 }] },
    { id: 'ga247', code: 'GA30-247', title: 'קערה נמוכה', cats: ['low', 'round'], shape: 'bowl',
      img: 'p-ga30-247.webp', finishes: ['G'],
      sizes: [{ dim: '71/21', price: 320, vat: true }] },
    { id: 'ga986', code: 'GA30-986', title: 'קערה עמוקה', cats: ['low', 'round'], shape: 'bowl',
      img: 'p-ga30-986.webp', finishes: ['C', 'B'],
      sizes: [{ dim: '60/40', price: 390 }, { dim: '50/34', price: 230 }, { dim: '40/27', price: 150 }] },
    { id: 'ga1314', code: 'GA30-1314', title: 'עציץ עגול', cats: ['round'], shape: 'egg',
      img: 'p-ga30-1314.webp', finishes: ['C', 'B'],
      sizes: [{ dim: '44/42', price: 190 }] },
    { id: 'ga1325', code: 'GA30-1325', title: 'קערה בטקסטורת עץ', cats: ['low', 'round'], shape: 'bowl',
      img: 'p-ga30-1325.webp', finishes: ['C', 'B'],
      sizes: [{ dim: '55/25', price: 280 }, { dim: '43/20', price: 170 }, { dim: '36/17', price: 120 }] },
    { id: 'ga1474', code: 'GA30-1474', title: 'עציץ כדורי', cats: ['round'], shape: 'egg',
      img: 'p-ga30-1474.webp', finishes: ['C', 'B'],
      sizes: [{ dim: '55/40', price: 340 }, { dim: '43/31', price: 190 }, { dim: '32/25', price: 130 }] },
    { id: 'ga2630', code: 'GA30-2630', title: 'עציץ גבוה בחיתוך גאומטרי', cats: ['round', 'tall'], shape: 'taperRound',
      img: 'p-ga30-2630.webp', thumbs: ['composition-3.webp'], finishes: ['C', 'B'],
      sizes: [{ dim: '53/72', price: 340 }, { dim: '31/42', price: 190 }],
      featured: true },
    { id: 'p21', title: 'סט עציצים מרובעים קלאסיים', cats: ['sets', 'tall'], shape: 'taper',
      img: 'p21.webp', finishes: ['C'],
      set: { label: 'מחיר סט', price: 980, dims: ['53/53/74', '41/41/57'] },
      sizes: [{ dim: '53/53/74', price: 760 }, { dim: '41/41/57', price: 490 }] },
    { id: 'p22', title: 'עציץ כדור', cats: ['round'], shape: 'sphere',
      img: 'p22-spheres.webp', thumbs: ['composition-4.webp'], finishes: ['DG'],
      sizes: [{ dim: '60/47', price: 299, label: 'גדול (L)' }, { dim: '40/33', price: 180, label: 'קטן (S)' }] },
    { id: 'p23', title: 'סט 5 כדים גבוהים', cats: ['sets', 'round', 'tall'], shape: 'taperRound',
      img: 'set5-white-tall.webp', thumbs: ['p23-set5.webp'], finishes: [],
      set: { label: 'סט 5 יחידות', price: 5250, dims: ['86/140', '71/115', '61/98', '51/82', '41/65'] },
      sizes: [{ dim: '86/140', price: 2570 }, { dim: '71/115', price: 1650 }, { dim: '51/82', price: 990 }, { dim: '41/65', price: 450 }] },
    { id: 'ga1839', code: 'GA30-1839', title: 'אדנית רחבה לעץ', cats: ['sets', 'low', 'trough'], shape: 'box',
      img: 'lifestyle-olive-white.webp', thumbs: ['p-ga30-1839.webp'], finishes: ['W', 'G'],
      set: { label: 'סט 3 יחידות', price: 2400, dims: ['100/100/50', '75/75/38', '50/50/25'] },
      sizes: [{ dim: '100/100/50', price: 1600 }, { dim: '75/75/38', price: 850 }, { dim: '50/50/25', price: 290, vat: true }] },
    { id: 'eden', title: 'סט אדניות H', cats: ['trough'], shape: 'box',
      img: 'p-eden.webp', finishes: [],
      sizes: [{ dim: '100/45/50', price: null }, { dim: '80/28/40', price: null }] },
    { id: 'stand', title: 'מעמד (פדסטל)', cats: ['access'], shape: 'stand',
      img: 'p-stand.webp', finishes: [],
      sizes: [{ dim: '24/24/48', price: 230 }, { dim: '33/33/65', price: 370 }, { dim: '33/33/89', price: 480 }] },
    { id: 'pinecone', title: 'אצטרובל דקורטיבי', cats: ['access'], shape: 'stand',
      img: 'p-pinecone.webp', finishes: [], noViz: true,
      sizes: [{ dim: '25/25/50', price: 270 }] },
    { id: 'hen', title: 'עציץ תרנגולת', cats: ['access'], shape: 'bowl',
      img: 'p-hen.webp', finishes: [], noViz: true,
      sizes: [{ dim: '23/31', price: 290 }] }
  ];

  const compositions = [
    { img: 'composition-1.webp', title: 'שלישייה מרובעת', lines: ['מרובע 60/60', 'גבוה 40/40/80', 'גבוה 34/34/70'], price: 1075 },
    { img: 'composition-2.webp', title: 'שלישייה מתחדדת', lines: ['60/68 + 42/48 + 27/30'], price: 790 },
    { img: 'composition-3.webp', title: 'זוג גאומטרי', lines: ['53/72 + 31/42', 'סט 2 יחידות בלבד'], price: 530 },
    { img: 'composition-4.webp', title: 'כדור על עמוד', lines: ['2 × 40/40/80', '2 × כדור 60/47'], price: 1300, alt: 'במידה קטנה יותר: 2 × 34/70 + 2 × 40/33 – 750 ₪' },
    { img: 'composition-5.webp', title: 'מגדל לבן', lines: ['40/80 – 330 ₪', '34/70 – 195 ₪', '26/60 – 145 ₪'], price: null, perUnit: true },
    { img: 'composition-6.webp', title: 'עגולים, בוחרים מידה', lines: ['56/56 – 380 ₪', '48/48 – 280 ₪', '42/42 – 210 ₪', '36/36 – 130 ₪'], price: null, perUnit: true },
    { img: 'composition-7.webp', title: 'קומפוזיציה משוגעת', lines: ['מרובע + עגול', 'גבוה + נמוך', 'שמן + רזה', 'צבעים שונים'], price: null, crazy: true }
  ];

  const terracotta = [
    { id: 't1',  code: 'PH 7298/3',  finish: 'TC', img: 'tc-7298-tc.webp',  count: 3, price: 700,  dims: ['29/26', '42/38', '55/50'] },
    { id: 't2',  code: 'PH 7298/3',  finish: 'AT', img: 'tc-7298-at.webp',  count: 3, price: 890,  dims: ['29/26', '42/38', '55/50'] },
    { id: 't3',  code: 'PH 13402/3', finish: 'TC', img: 'tc-13402-tc.webp', count: 3, price: 550,  dims: ['30/19', '41/27', '53/36'] },
    { id: 't4',  code: 'PH 13402/3', finish: 'AT', img: 'tc-13402-at.webp', count: 3, price: 700,  dims: ['30/19', '41/27', '53/36'] },
    { id: 't5',  code: 'PH 7296/2',  finish: 'TC', img: 'tc-7296-tc.webp',  count: 2, price: 1200, dims: ['45/52', '64/68'] },
    { id: 't6',  code: 'PH 7025/2',  finish: 'TC', img: 'tc-7025-tc.webp',  count: 2, price: 950,  dims: ['30/47', '55/83'] },
    { id: 't7',  code: 'PH 7025/2',  finish: 'AT', img: 'tc-7025-at.webp',  count: 2, price: 1200, dims: ['30/47', '55/83'] },
    { id: 't8',  code: 'PH 7025/2',  finish: 'TW', img: 'tc-7025-white.webp', count: 2, price: 1300, was: 2600, dims: ['30/47', '55/83'] },
    { id: 't9',  code: 'PH 7321/3',  finish: 'BR', img: 'tc-7321-br.webp',  count: 3, price: 800,  dims: ['31/26', '41/32', '50/38'] },
    { id: 't10', code: 'PH 7257/2',  finish: 'BR', img: 'tc-7257-br.webp',  count: 2, price: 399,  dims: ['31/18', '43/26'] },
    { id: 't11', code: 'PH 7258/3',  finish: 'BR', img: 'tc-7258-br.webp',  count: 3, price: 600,  dims: ['22/22', '33/33', '43/44'] },
    { id: 't12', code: 'PH 13160/2', finish: 'TC', img: 'tc-13160-tc.webp', count: 2, price: 800,  dims: ['34/39', '53/62'] },
    { id: 't13', code: 'PH 13160/2', finish: 'AT', img: 'tc-13160-at.webp', count: 2, price: 1000, dims: ['34/39', '53/62'] },
    { id: 't14', code: 'PH 7295/4',  finish: 'TC', img: 'tc-7295-tc.webp',  count: 4, price: 800,  dims: ['27/20', '36/27', '46/34'] }
  ];

  const fountains = [
    { img: 'f-art003a.webp', title: 'מזרקה איטלקית', code: 'ART003 A', dims: 'קוטר 100 · גובה 170 ס״מ', price: 5900 },
    { img: 'f-120-157.webp', title: 'מזרקה איטלקית', code: '', dims: 'קוטר 120 · גובה 157 ס״מ', price: 6900 },
    { img: 'f-art078.webp', title: 'מזרקה איטלקית, 2 קערות', code: 'ART 078', dims: 'קוטר 90 · גובה 155 ס״מ', price: 3900 },
    { img: 'f-art932.webp', title: 'מזרקת קערה רחבה', code: 'ART932+144', dims: 'קוטר 105 · גובה 140 ס״מ', price: 3500 },
    { img: 'f-art098.webp', title: 'מזרקה דו־קומתית', code: 'ART098', dims: 'קוטר 83 · גובה 142 ס״מ', price: 3900 },
    { img: 'f-buddha.webp', title: 'מזרקת ראש בודהה עם תאורת LED', code: 'GA50-277', dims: '62 × 62 × 75 ס״מ', price: 1900, was: 3500 },
    { img: 'f-wall.webp', title: 'מזרקת קיר כולל משאבה', code: '', dims: '41/24/76 ס״מ', price: 950, note: 'התקנה קלה, כמו לתלות תמונה', sale: true },
    { img: 'f-giant.webp', title: 'מזרקה מונומנטלית עם מתזים ומשאבה פנימית', code: '', dims: 'קוטר 420 · גובה 250 ס״מ · 3,700 ק״ג', price: 159000, note: 'במחסן באבן יהודה. הובלה והתקנה: 18,000 ₪' }
  ];

  /* Home page collections rail. Photos come from villa-toscana-shop.co.il; `count` is the number of
     items in that shop category when the photos were collected (Nov 2026). */
  const SHOP = 'https://www.villa-toscana-shop.co.il/home-garden/';
  const collections = [
    { title: 'אדניות ועציצים', img: 'shop/troughs-concrete.webp', alt: 'שלוש אדניות בטון מלבניות עם צמחייה בחצר מרוצפת', href: 'price-list.html', note: 'המחירון המלא, עם מידות והדמיה' },
    { title: 'כדים לגינה', img: 'shop/white-urns-deck.webp', alt: 'שלושה כדים לבנים גבוהים עם עצי זית על דק עץ', href: SHOP + 'garden-pots/', count: 89 },
    { title: 'כדים איטלקיים מאבן', img: 'shop/urn-lion.webp', alt: 'כד אבן איטלקי עם ראש אריה בחצר עם בוגנוויליה', href: SHOP + 'garden-pots/%d7%9b%d7%93%d7%99%d7%9d-%d7%90%d7%99%d7%98%d7%9c%d7%a7%d7%99%d7%99%d7%9d-%d7%9e%d7%a9%d7%99%d7%a9-%d7%92%d7%a8%d7%95%d7%a1-%d7%a2%d7%9d-%d7%a6%d7%9e%d7%a0%d7%98/', count: 11 },
    { title: 'כדי טרקוטה', img: 'shop/terracotta-amphora.webp', alt: 'כד טרקוטה ענק בהיר ליד ספסל ברזל בחצר אבן', href: 'price-list.html#terracotta', note: 'סטים במחירון' },
    { title: 'מזרקות', img: 'shop/fountain-garden.webp', alt: 'מזרקה לבנה בת שלוש קומות בין שיחים ירוקים', href: 'price-list.html#fountains', note: 'מזרקות במחירון' },
    { title: 'פסלים', img: 'shop/lion-sculpture.webp', alt: 'פסל אריה איטלקי מאבן אפורה בכניסה לחצר', href: SHOP + 'home-garden-sculptures/', count: 75 },
    { title: 'קורטן חלודה', img: 'shop/corten-troughs.webp', alt: 'שלוש אדניות קורטן בגבהים שונים עם צמחייה על דק', href: SHOP + '%d7%9b%d7%93%d7%99%d7%9d-%d7%95%d7%90%d7%93%d7%a0%d7%99%d7%95%d7%aa-%d7%a7%d7%95%d7%a8%d7%98%d7%9f-%d7%97%d7%9c%d7%95%d7%93%d7%94/', count: 7 },
    { title: 'כדי גלזורה', img: 'shop/glazed-turquoise.webp', alt: 'שני עציצי גלזורה בצבע טורקיז על שולחן עץ', href: SHOP + 'garden-pots/%d7%9b%d7%93-%d7%92%d7%9c%d7%96%d7%95%d7%a8%d7%94/', count: 6 }
  ];

  /* Balcony Studio (studio.html and the home teaser).
     Scenes are AI-made backdrops, calibrated by hand in their own pixels:
       railTop / base = y of the railing top and of its foot on the floor, refCm = railing height,
       horizon = eye level. Floor scale at y: s0 * (y - horizon) / (base - horizon), s0 = (base - railTop) / refCm.
     Products are the shop's real photos with the background removed, never redrawn.
       cut: { img, w, h, px, at } -> in that file, the product at size `at` is `px` pixels tall;
       other sizes of the same model scale by height. */
  const studio = {
    scenes: [
      { id: 'telaviv', name: 'מרפסת מול העיר', img: 'studio/balcony-telaviv.webp', w: 1344, h: 752, railTop: 272, base: 521, refCm: 105, horizon: 318, rulerX: 1262 },
      { id: 'slats', name: 'מרפסת עם כיסא תלוי', img: 'studio/balcony-slats.webp', w: 1344, h: 752, railTop: 315, base: 572, refCm: 105, horizon: 325, rulerX: 420 },
      { id: 'patio', name: 'פטיו בין עצי זית', img: 'studio/patio-olive.webp', w: 1344, h: 752, railTop: 332, base: 510, refCm: 100, horizon: 243, rulerX: 1250 },
      { id: 'rooftop', name: 'גג בלילה', img: 'studio/rooftop-night.webp', w: 1344, h: 752, railTop: 327, base: 468, refCm: 105, horizon: 342, rulerX: 1215 }
    ],
    items: [
      { id: 'ga2630', pid: 'ga2630', finish: 'B',
        cuts: { '53/72': { img: 'studio/ga30-2630-l.webp', w: 585, h: 900, px: 900 }, '31/42': { img: 'studio/ga30-2630-s.webp', w: 459, h: 672, px: 672 } } },
      { id: 'urn262', code: 'GA30-262', title: 'כד בצבע ברונזה', shape: 'cyl', finishName: 'ברונזה',
        sizes: [{ dim: '46/76', price: 390, vat: true }],
        shop: 'https://www.villa-toscana-shop.co.il/product/%d7%9b%d7%93-%d7%91%d7%a6%d7%91%d7%a2-%d7%91%d7%a8%d7%95%d7%a0%d7%96%d7%94-ga30-262/',
        cut: { img: 'studio/urn-bronze-ga30-262.webp', w: 452, h: 833, px: 833, at: '46/76' } },
      { id: 'urn314', code: 'GA30-314', title: 'כד קלאסי מעוטר', shape: 'cyl', finishName: 'אפור בטון',
        sizes: [{ dim: '57/67', price: 590, vat: true }],
        shop: 'https://www.villa-toscana-shop.co.il/product/%d7%9b%d7%93-%d7%a4%d7%99%d7%99%d7%91%d7%a8%d7%a1%d7%98%d7%95%d7%9f-%d7%9e%d7%a2%d7%95%d7%a6%d7%91-%d7%9c%d7%92%d7%99%d7%a0%d7%94-%d7%93%d7%92%d7%9d/',
        cut: { img: 'studio/urn-classic-ga30-314.webp', w: 563, h: 692, px: 692, at: '57/67' } },
      { id: 'p7', pid: 'p7', set: true, finishName: 'לבן (מהחנות האונליין)',
        cut: { img: 'studio/troughs-81015.webp', w: 649, h: 600, px: 303, at: '110/40/50' } },
      { id: 'ga2813', pid: 'ga2813', finish: 'C',
        cut: { img: 'studio/ga30-2813.webp', w: 205, h: 236, px: 236, at: '37/40' } },
      { id: 'ga1474', pid: 'ga1474', finish: 'B',
        cut: { img: 'studio/ga30-1474.webp', w: 186, h: 161, px: 161, at: '32/25' } }
    ]
  };

  const contact = {
    phone: '09-8998646', fax: '09-8999392',
    people: [
      { name: 'איציק', phone: '050-5241830' },
      { name: 'לילי', phone: '050-5583744' },
      { name: 'הדס', phone: '051-5526881' }
    ],
    whatsapp: '972505241830',
    email: 'info@villa-toscana.co.il',
    address: 'רחוב בני בנימין 15, אבן יהודה',
    addressNote: 'מרכז אבן יהודה, מול הדואר',
    facebook: 'https://www.facebook.com/pages/%D7%95%D7%99%D7%9C%D7%94-%D7%98%D7%95%D7%A1%D7%A7%D7%A0%D7%94-%D7%A2%D7%99%D7%A6%D7%95%D7%91-%D7%90%D7%99%D7%98%D7%9C%D7%A7%D7%99-%D7%9C%D7%91%D7%99%D7%AA-%D7%95%D7%9C%D7%92%D7%99%D7%A0%D7%94/840737756019836',
    youtube: 'https://www.youtube.com/channel/UCtuTBCSHldPnD5quux6Oejw/videos',
    shop: 'https://www.villa-toscana-shop.co.il/'
  };

  /* "80/23/40" -> {w:80, d:23, h:40}; "56/56" -> {w:56, d:56, h:56} */
  function parseDim(s) {
    const n = String(s).split('/').map(x => parseFloat(x));
    if (n.length >= 3) return { w: n[0], d: n[1], h: n[2] };
    return { w: n[0], d: n[0], h: n[1] };
  }

  function waLink(text) {
    return 'https://api.whatsapp.com/send?phone=' + contact.whatsapp + '&text=' + encodeURIComponent(text);
  }

  function fmt(n) { return n == null ? '' : n.toLocaleString('he-IL'); }

  /* ---- dimensions, spelled out (Baymard: written, labelled dimensions are what shoppers need most) ---- */
  const ROUND = { cyl: 1, taperRound: 1, egg: 1, bowl: 1, sphere: 1 };
  function dimLabels(dim, shape) {
    const n = String(dim).split('/').length;
    if (n >= 3) return ['אורך', 'רוחב', 'גובה'];
    return ROUND[shape] ? ['קוטר', 'גובה'] : ['רוחב', 'גובה'];
  }
  /* "80/23/40" -> "80 × 23 × 40" */
  function dimShort(dim) { return String(dim).split('/').map(x => x.trim()).join(' × '); }
  /* "80/23/40" -> "אורך 80 · רוחב 23 · גובה 40 ס״מ" */
  function dimLong(dim, shape) {
    const v = String(dim).split('/'), l = dimLabels(dim, shape);
    return v.map((x, i) => l[i] + ' ' + x.trim()).join(' · ') + ' ס״מ';
  }
  function dimLegend(dim, shape) { return dimLabels(dim, shape).join(' × ') + ' (ס״מ)'; }

  function minPrice(p) {
    const all = (p.sizes || []).map(s => s.price).concat(p.set ? [p.set.price] : []).filter(x => x != null);
    return all.length ? Math.min(...all) : null;
  }
  /* saving when buying the whole set, only when every unit in the set has its own price */
  function setSavings(p) {
    if (!p.set || p.set.noSavings) return null;
    let sum = 0;
    for (const d of p.set.dims) {
      const s = (p.sizes || []).find(x => x.dim === d);
      if (!s || s.price == null) return null;
      sum += s.price;
    }
    const amount = sum - p.set.price;
    return amount > 0 ? { amount, pct: Math.round(amount / sum * 100), sum } : null;
  }
  function slug(p) { return p.slug || (p.code ? p.code.toLowerCase().replace(/[^a-z0-9]+/g, '-') : p.id); }
  function modelUrl(p) { return BASE + 'models/' + slug(p) + '.html'; }

  return { finishes, cats, products, compositions, terracotta, fountains, collections, studio, contact, parseDim, waLink, fmt, IMG, BASE,
    dimLabels, dimShort, dimLong, dimLegend, minPrice, setSavings, slug, modelUrl };
})();
