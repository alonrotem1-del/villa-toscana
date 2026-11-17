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

  const IMG = 'assets/img/';

  // shape: box | taper (square cone) | cyl | taperRound | egg | bowl | sphere | stand
  const products = [
    { id: 'p1', title: 'סט 3 עציצים מרובעים גבוהים', cats: ['sets', 'tall'], shape: 'box',
      img: 'set-tall-squares.jpg', thumbs: ['p01.jpg', 'lifestyle-deck-squares.jpg'], finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 950, dims: ['40/80', '34/70', '26/60'] },
      sizes: [{ dim: '40/80', price: 330 }, { dim: '34/70', price: 195 }, { dim: '26/60', price: 145 }],
      featured: true },
    { id: 'p2', title: 'מרובע קונוס גבוה', cats: ['sets', 'tall'], shape: 'taper',
      img: 'p02.jpg', finishes: ['C', 'B'],
      set: { label: 'סט 2 יחידות', price: 490, dims: ['44/93', '33/62'] },
      sizes: [{ dim: '44/93', price: 350 }, { dim: '36/66', price: 200 }] },
    { id: 'p3', title: 'מרובע קונוס', cats: ['tall'], shape: 'taper',
      img: 'p03.jpg', finishes: ['C', 'DG'],
      sizes: [{ dim: '46/46/61', price: 280 }, { dim: '36/36/51', price: 145 }] },
    { id: 'p4', title: 'סט עגול גבוה', cats: ['sets', 'round', 'tall'], shape: 'cyl',
      img: 'p04.jpg', finishes: ['C'],
      set: { label: 'סט 3 יחידות', price: 650, dims: ['46/81', '40/71', '34/61'] },
      sizes: [{ dim: '46/81', price: 400 }, { dim: '40/71', price: 240 }, { dim: '34/61', price: 170 }] },
    { id: 'p5', title: 'סט עגול 4 יחידות', cats: ['sets', 'round'], shape: 'cyl',
      img: 'p05.jpg', thumbs: ['p05b.jpg', 'composition-6.jpg'], finishes: ['C', 'B'],
      set: { label: 'סט 4 יחידות', price: 770, dims: ['56/56', '48/48', '42/42', '36/36'] },
      sizes: [{ dim: '56/56', price: 380 }, { dim: '48/48', price: 280 }, { dim: '42/42', price: 210 }, { dim: '36/36', price: 130 }],
      featured: true },
    { id: 'p6', title: 'עציץ עגול גבוה מתחדד', cats: ['round', 'tall'], shape: 'taperRound',
      img: 'p06.jpg', finishes: [],
      sizes: [{ dim: '60/81', price: 390 }, { dim: '51/72', price: 240 }, { dim: '41/61', price: 160 }] },
    { id: 'p7', title: 'סט 2 אדניות', cats: ['sets', 'trough'], shape: 'box',
      img: 'p07.jpg', finishes: ['C', 'DG'],
      set: { label: 'סט 2 יחידות', price: 770, dims: ['110/40/50', '95/30/40'] },
      sizes: [{ dim: '110/40/50', price: 550 }, { dim: '95/30/40', price: 350 }] },
    { id: 'p8', title: 'סט 2 אדניות גבוהות', cats: ['sets', 'trough', 'tall'], shape: 'box',
      img: 'p08.jpg', finishes: ['C', 'B'],
      set: { label: 'סט 2 יחידות', price: 1100, dims: ['80/31/92', '60/25/72'] },
      sizes: [{ dim: '80/31/92', price: 790 }, { dim: '60/25/72', price: 540 }] },
    { id: 'p8a', title: 'סט 3 אדניות גבוהות', cats: ['sets', 'trough', 'tall'], shape: 'box',
      img: 'p08a.jpg', finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 1300, dims: ['100/35/79', '85/27/70', '75/19/59'] },
      sizes: [{ dim: '100/35/79', price: 790 }, { dim: '85/27/70', price: 540 }, { dim: '75/19/59', price: 320 }],
      featured: true },
    { id: 'p8b', title: 'אדניות רחבות ועמוקות', cats: ['trough'], shape: 'box',
      img: 'p08b.jpg', finishes: ['C', 'B'],
      sizes: [{ dim: '100/70/90', price: 990 }, { dim: '80/50/70', price: 690 }, { dim: '70/40/60', price: 550 }] },
    { id: 'p9', title: 'סט 2 אדניות למרפסת', cats: ['sets', 'trough'], shape: 'box',
      img: 'p09.jpg', finishes: ['C', 'B'],
      set: { label: 'סט 2 יחידות', price: 690, dims: ['100/31/50', '80/23/40'] },
      sizes: [{ dim: '100/31/50', price: 490 }, { dim: '80/23/40', price: 320 }],
      featured: true },
    { id: 'p10', title: 'סט 3 אדניות', cats: ['sets', 'trough'], shape: 'box',
      img: 'p10.jpg', finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 800, dims: ['93/38/38', '83/30/30', '70/25/25'] },
      sizes: [{ dim: '93/38/38', price: 450 }, { dim: '83/30/30', price: 290 }, { dim: '70/25/25', price: 190 }] },
    { id: 'p11', title: 'סט 4 אדניות מרובעות (קוביות)', cats: ['sets', 'tall'], shape: 'box',
      img: 'lifestyle-cubes-wall.jpg', thumbs: ['p11.jpg'], finishes: ['C', 'B'],
      set: { label: 'סט 4 יחידות', price: 1800, dims: ['75/75', '60/60', '50/50', '40/40'] },
      sizes: [{ dim: '75/75', price: 1100 }, { dim: '60/60', price: 550 }, { dim: '50/50', price: 300 }, { dim: '40/40', price: 210 }] },
    { id: 'p12', title: 'סט 2 אדניות', cats: ['sets', 'trough'], shape: 'box',
      img: 'lifestyle-troughs.jpg', thumbs: ['p12.jpg'], finishes: ['C', 'B'],
      set: { label: 'סט 2 יחידות', price: 620, dims: ['100/45/45', '80/38/38'] },
      sizes: [{ dim: '100/45/45', price: 490 }, { dim: '80/38/38', price: 290, sale: true }] },
    { id: 'p12a', title: 'סט אדניות – 3 מידות', cats: ['sets', 'trough'], shape: 'box',
      img: 'p12.jpg', finishes: ['C', 'DG'],
      set: { label: 'מחיר סט', price: 590, dims: ['100/45/45', '80/35/35', '60/28/28'] },
      sizes: [{ dim: '100/45/45', price: 490 }, { dim: '80/35/35', price: 250 }, { dim: '60/28/28', price: 180 }] },
    { id: 'p12b', title: 'אדנית צרה', cats: ['trough'], shape: 'box',
      img: 'p12.jpg', finishes: ['C'],
      sizes: [{ dim: '75/20/20', price: 145 }] },
    { id: 'p13', title: 'סט 2 אדניות מרובעות נמוכות', cats: ['sets', 'low'], shape: 'box',
      img: 'p13.jpg', finishes: ['B'],
      set: { label: 'סט 2 יחידות', price: 199, dims: ['52/24', '42/18'] },
      sizes: [] },
    { id: 'p14', title: 'אדניות ארוכות', cats: ['sets', 'trough'], shape: 'box',
      img: 'p14.jpg', finishes: ['C', 'DG'],
      set: { label: 'סט 2 יחידות', price: 1400, dims: ['150/40/50', '132/30/40'] },
      sizes: [{ dim: '200/50/60', price: 1750 }, { dim: '150/40/50', price: 1100 }, { dim: '132/30/40', price: 650 }] },
    { id: 'p15', title: 'סט 3 עציצים עגולים', cats: ['sets', 'round'], shape: 'cyl',
      img: 'p15.jpg', finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 480, dims: ['52/54', '37/48', '27/36'] },
      sizes: [{ dim: '52/54', price: 290 }, { dim: '37/48', price: 180 }, { dim: '27/36', price: 110 }],
      featured: true },
    { id: 'p16', title: 'סט 3 עציצים נמוכים', cats: ['sets', 'round', 'low'], shape: 'bowl',
      img: 'p16.jpg', finishes: ['C'],
      set: { label: 'סט 3 יחידות', price: 420, dims: ['55/40', '41/30', '29/21'] },
      sizes: [{ dim: '55/40', price: 250 }, { dim: '41/30', price: 160 }, { dim: '29/21', price: 110 }] },
    { id: 'p17', title: 'קערה גדולה', cats: ['low', 'round'], shape: 'bowl',
      img: 'p17.jpg', finishes: ['C', 'B'],
      sizes: [{ dim: '112/50', price: 1100 }] },
    { id: 'p18', title: 'סט 3 עציצים בטניים', cats: ['sets', 'round'], shape: 'egg',
      img: 'p18.jpg', finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 1700, dims: ['80/77', '65/62', '51/50'] },
      sizes: [{ dim: '80/77', price: 990 }, { dim: '65/62', price: 590 }, { dim: '51/50', price: 320 }] },
    { id: 'p19', title: 'סט 3 עציצים רחבים', cats: ['sets', 'round', 'low'], shape: 'egg',
      img: 'p19.jpg', finishes: ['C', 'B'],
      set: { label: 'סט 3 יחידות', price: 1700, dims: ['81/60', '71/55', '61/50'] },
      sizes: [{ dim: '81/60', price: 990 }, { dim: '71/55', price: 590 }, { dim: '61/50', price: 320 }] },
    { id: 'p20', title: 'סט 3 עציצים מתחדדים', cats: ['sets', 'round', 'tall'], shape: 'taperRound',
      img: 'p20.jpg', thumbs: ['composition-2.jpg'], finishes: ['C', 'DG'],
      set: { label: 'סט 3 יחידות', price: 790, dims: ['60/68', '42/48', '27/30'] },
      sizes: [{ dim: '60/68', price: 480 }, { dim: '42/48', price: 280 }, { dim: '27/30', price: 180 }],
      featured: true },
    { id: 'ga2813', code: 'GA30-2813', title: 'עציץ עגול מרקם', cats: ['round'], shape: 'egg',
      img: 'p-ga30-2813.jpg', finishes: ['C', 'B'],
      sizes: [{ dim: '54/58', price: 590 }, { dim: '44/48', price: 320 }, { dim: '37/40', price: 210 }] },
    { id: 'ga247', code: 'GA30-247', title: 'קערה נמוכה', cats: ['low', 'round'], shape: 'bowl',
      img: 'p-ga30-247.jpg', finishes: ['G'],
      sizes: [{ dim: '71/21', price: 320, vat: true }] },
    { id: 'ga986', code: 'GA30-986', title: 'קערה עמוקה', cats: ['low', 'round'], shape: 'bowl',
      img: 'p-ga30-986.jpg', finishes: ['C', 'B'],
      sizes: [{ dim: '60/40', price: 390 }, { dim: '50/34', price: 230 }, { dim: '40/27', price: 150 }] },
    { id: 'ga1314', code: 'GA30-1314', title: 'עציץ עגול', cats: ['round'], shape: 'egg',
      img: 'p-ga30-1314.jpg', finishes: ['C', 'B'],
      sizes: [{ dim: '44/42', price: 190 }] },
    { id: 'ga1325', code: 'GA30-1325', title: 'קערה בטקסטורת עץ', cats: ['low', 'round'], shape: 'bowl',
      img: 'p-ga30-1325.jpg', finishes: ['C', 'B'],
      sizes: [{ dim: '55/25', price: 280 }, { dim: '43/20', price: 170 }, { dim: '36/17', price: 120 }] },
    { id: 'ga1474', code: 'GA30-1474', title: 'עציץ כדורי', cats: ['round'], shape: 'egg',
      img: 'p-ga30-1474.jpg', finishes: ['C', 'B'],
      sizes: [{ dim: '55/40', price: 340 }, { dim: '43/31', price: 190 }, { dim: '32/25', price: 130 }] },
    { id: 'ga2630', code: 'GA30-2630', title: 'עציץ גבוה בחיתוך גאומטרי', cats: ['round', 'tall'], shape: 'taperRound',
      img: 'p-ga30-2630.jpg', thumbs: ['composition-3.jpg'], finishes: ['C', 'B'],
      sizes: [{ dim: '53/72', price: 340 }, { dim: '31/42', price: 190 }],
      featured: true },
    { id: 'p21', title: 'סט עציצים מרובעים קלאסיים', cats: ['sets', 'tall'], shape: 'taper',
      img: 'p21.jpg', finishes: ['C'],
      set: { label: 'מחיר סט', price: 980, dims: ['53/53/74', '41/41/57'] },
      sizes: [{ dim: '53/53/74', price: 760 }, { dim: '41/41/57', price: 490 }] },
    { id: 'p22', title: 'עציץ כדור', cats: ['round'], shape: 'sphere',
      img: 'p22-spheres.jpg', thumbs: ['composition-4.jpg'], finishes: ['DG'],
      sizes: [{ dim: '60/47', price: 299, label: 'גדול (L)' }, { dim: '40/33', price: 180, label: 'קטן (S)' }] },
    { id: 'p23', title: 'סט 5 כדים גבוהים', cats: ['sets', 'round', 'tall'], shape: 'taperRound',
      img: 'set5-white-tall.jpg', thumbs: ['p23-set5.jpg'], finishes: [],
      set: { label: 'סט 5 יחידות', price: 5250, dims: ['86/140', '71/115', '61/98', '51/82', '41/65'] },
      sizes: [{ dim: '86/140', price: 2570 }, { dim: '71/115', price: 1650 }, { dim: '51/82', price: 990 }, { dim: '41/65', price: 450 }] },
    { id: 'ga1839', code: 'GA30-1839', title: 'אדנית רחבה לעץ', cats: ['sets', 'low', 'trough'], shape: 'box',
      img: 'lifestyle-olive-white.jpg', thumbs: ['p-ga30-1839.jpg'], finishes: ['W', 'G'],
      set: { label: 'סט 3 יחידות', price: 2400, dims: ['100/100/50', '75/75/38', '50/50/25'] },
      sizes: [{ dim: '100/100/50', price: 1600 }, { dim: '75/75/38', price: 850 }, { dim: '50/50/25', price: 290, vat: true }] },
    { id: 'eden', title: 'סט אדניות H', cats: ['trough'], shape: 'box',
      img: 'p-eden.jpg', finishes: [],
      sizes: [{ dim: '100/45/50', price: null }, { dim: '80/28/40', price: null }] },
    { id: 'stand', title: 'מעמד (פדסטל)', cats: ['access'], shape: 'stand',
      img: 'p-stand.jpg', finishes: [],
      sizes: [{ dim: '24/24/48', price: 230 }, { dim: '33/33/65', price: 370 }, { dim: '33/33/89', price: 480 }] },
    { id: 'pinecone', title: 'אצטרובל דקורטיבי', cats: ['access'], shape: 'stand',
      img: 'p-pinecone.jpg', finishes: [], noViz: true,
      sizes: [{ dim: '25/25/50', price: 270 }] },
    { id: 'hen', title: 'עציץ תרנגולת', cats: ['access'], shape: 'bowl',
      img: 'p-hen.jpg', finishes: [], noViz: true,
      sizes: [{ dim: '23/31', price: 290 }] }
  ];

  const compositions = [
    { img: 'composition-1.jpg', title: 'שלישייה מרובעת', lines: ['מרובע 60/60', 'גבוה 40/40/80', 'גבוה 34/34/70'], price: 1075 },
    { img: 'composition-2.jpg', title: 'שלישייה מתחדדת', lines: ['60/68 + 42/48 + 27/30'], price: 790 },
    { img: 'composition-3.jpg', title: 'זוג גאומטרי', lines: ['53/72 + 31/42', 'סט 2 יחידות בלבד'], price: 530 },
    { img: 'composition-4.jpg', title: 'כדור על עמוד', lines: ['2 × 40/40/80', '2 × כדור 60/47'], price: 1300, alt: 'במידה קטנה יותר: 2 × 34/70 + 2 × 40/33 – 750 ₪' },
    { img: 'composition-5.jpg', title: 'מגדל לבן', lines: ['40/80 – 330 ₪', '34/70 – 195 ₪', '26/60 – 145 ₪'], price: null, perUnit: true },
    { img: 'composition-6.jpg', title: 'עגולים, בוחרים מידה', lines: ['56/56 – 380 ₪', '48/48 – 280 ₪', '42/42 – 210 ₪', '36/36 – 130 ₪'], price: null, perUnit: true },
    { img: 'composition-7.jpg', title: 'קומפוזיציה משוגעת', lines: ['מרובע + עגול', 'גבוה + נמוך', 'שמן + רזה', 'צבעים שונים'], price: null, crazy: true }
  ];

  const terracotta = [
    { id: 't1',  code: 'PH 7298/3',  finish: 'TC', img: 'tc-7298-tc.jpg',  count: 3, price: 700,  dims: ['29/26', '42/38', '55/50'] },
    { id: 't2',  code: 'PH 7298/3',  finish: 'AT', img: 'tc-7298-at.jpg',  count: 3, price: 890,  dims: ['29/26', '42/38', '55/50'] },
    { id: 't3',  code: 'PH 13402/3', finish: 'TC', img: 'tc-13402-tc.jpg', count: 3, price: 550,  dims: ['30/19', '41/27', '53/36'] },
    { id: 't4',  code: 'PH 13402/3', finish: 'AT', img: 'tc-13402-at.jpg', count: 3, price: 700,  dims: ['30/19', '41/27', '53/36'] },
    { id: 't5',  code: 'PH 7296/2',  finish: 'TC', img: 'tc-7296-tc.jpg',  count: 2, price: 1200, dims: ['45/52', '64/68'] },
    { id: 't6',  code: 'PH 7025/2',  finish: 'TC', img: 'tc-7025-tc.jpg',  count: 2, price: 950,  dims: ['30/47', '55/83'] },
    { id: 't7',  code: 'PH 7025/2',  finish: 'AT', img: 'tc-7025-at.jpg',  count: 2, price: 1200, dims: ['30/47', '55/83'] },
    { id: 't8',  code: 'PH 7025/2',  finish: 'TW', img: 'tc-7025-white.jpg', count: 2, price: 1300, was: 2600, dims: ['30/47', '55/83'] },
    { id: 't9',  code: 'PH 7321/3',  finish: 'BR', img: 'tc-7321-br.jpg',  count: 3, price: 800,  dims: ['31/26', '41/32', '50/38'] },
    { id: 't10', code: 'PH 7257/2',  finish: 'BR', img: 'tc-7257-br.jpg',  count: 2, price: 399,  dims: ['31/18', '43/26'] },
    { id: 't11', code: 'PH 7258/3',  finish: 'BR', img: 'tc-7258-br.jpg',  count: 3, price: 600,  dims: ['22/22', '33/33', '43/44'] },
    { id: 't12', code: 'PH 13160/2', finish: 'TC', img: 'tc-13160-tc.jpg', count: 2, price: 800,  dims: ['34/39', '53/62'] },
    { id: 't13', code: 'PH 13160/2', finish: 'AT', img: 'tc-13160-at.jpg', count: 2, price: 1000, dims: ['34/39', '53/62'] },
    { id: 't14', code: 'PH 7295/4',  finish: 'TC', img: 'tc-7295-tc.jpg',  count: 4, price: 800,  dims: ['27/20', '36/27', '46/34'] }
  ];

  const fountains = [
    { img: 'f-art003a.jpg', title: 'מזרקה איטלקית', code: 'ART003 A', dims: 'קוטר 100 · גובה 170 ס״מ', price: 5900 },
    { img: 'f-120-157.jpg', title: 'מזרקה איטלקית', code: '', dims: 'קוטר 120 · גובה 157 ס״מ', price: 6900 },
    { img: 'f-art078.jpg', title: 'מזרקה איטלקית, 2 קערות', code: 'ART 078', dims: 'קוטר 90 · גובה 155 ס״מ', price: 3900 },
    { img: 'f-art932.jpg', title: 'מזרקת קערה רחבה', code: 'ART932+144', dims: 'קוטר 105 · גובה 140 ס״מ', price: 3500 },
    { img: 'f-art098.jpg', title: 'מזרקה דו־קומתית', code: 'ART098', dims: 'קוטר 83 · גובה 142 ס״מ', price: 3900 },
    { img: 'f-buddha.jpg', title: 'מזרקת ראש בודהה עם תאורת LED', code: 'GA50-277', dims: '62 × 62 × 75 ס״מ', price: 1900, was: 3500 },
    { img: 'f-wall.jpg', title: 'מזרקת קיר כולל משאבה', code: '', dims: '41/24/76 ס״מ', price: 950, note: 'התקנה קלה, כמו לתלות תמונה', sale: true },
    { img: 'f-giant.jpg', title: 'מזרקה מונומנטלית עם מתזים ומשאבה פנימית', code: '', dims: 'קוטר 420 · גובה 250 ס״מ · 3,700 ק״ג', price: 159000, note: 'במחסן באבן יהודה. הובלה והתקנה: 18,000 ₪' }
  ];

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

  return { finishes, cats, products, compositions, terracotta, fountains, contact, parseDim, waLink, fmt, IMG };
})();
