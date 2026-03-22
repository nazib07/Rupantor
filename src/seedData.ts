export const SEED_DATA = [
  {
    category: { nameEn: 'Length', nameBn: 'দৈর্ঘ্য', iconName: 'Ruler', order: 1 },
    units: [
      { nameEn: 'Meter', nameBn: 'মিটার', symbol: 'm', multiplier: 1, isBase: true },
      { nameEn: 'Kilometer', nameBn: 'কিলোমিটার', symbol: 'km', multiplier: 1000, isBase: false },
      { nameEn: 'Centimeter', nameBn: 'সেন্টিমিটার', symbol: 'cm', multiplier: 0.01, isBase: false },
      { nameEn: 'Millimeter', nameBn: 'মিলিমিটার', symbol: 'mm', multiplier: 0.001, isBase: false },
      { nameEn: 'Micrometer', nameBn: 'মাইক্রোমিটার', symbol: 'μm', multiplier: 0.000001, isBase: false },
      { nameEn: 'Nanometer', nameBn: 'ন্যানোমিটার', symbol: 'nm', multiplier: 0.000000001, isBase: false },
      { nameEn: 'Mile', nameBn: 'মাইল', symbol: 'mi', multiplier: 1609.34, isBase: false },
      { nameEn: 'Nautical Mile', nameBn: 'নটিক্যাল মাইল', symbol: 'nmi', multiplier: 1852, isBase: false },
      { nameEn: 'Yard', nameBn: 'গজ', symbol: 'yd', multiplier: 0.9144, isBase: false },
      { nameEn: 'Foot', nameBn: 'ফুট', symbol: 'ft', multiplier: 0.3048, isBase: false },
      { nameEn: 'Inch', nameBn: 'ইঞ্চি', symbol: 'in', multiplier: 0.0254, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Weight', nameBn: 'ওজন', iconName: 'Weight', order: 2 },
    units: [
      { nameEn: 'Kilogram', nameBn: 'কিলোগ্রাম', symbol: 'kg', multiplier: 1, isBase: true },
      { nameEn: 'Gram', nameBn: 'গ্রাম', symbol: 'g', multiplier: 0.001, isBase: false },
      { nameEn: 'Milligram', nameBn: 'মিলিগ্রাম', symbol: 'mg', multiplier: 0.000001, isBase: false },
      { nameEn: 'Metric Ton', nameBn: 'মেট্রিক টন', symbol: 't', multiplier: 1000, isBase: false },
      { nameEn: 'Pound', nameBn: 'পাউন্ড', symbol: 'lb', multiplier: 0.453592, isBase: false },
      { nameEn: 'Ounce', nameBn: 'আউন্স', symbol: 'oz', multiplier: 0.0283495, isBase: false },
      { nameEn: 'Stone', nameBn: 'স্টোন', symbol: 'st', multiplier: 6.35029, isBase: false },
      { nameEn: 'Bhori (Gold)', nameBn: 'ভরি', symbol: 'bhori', multiplier: 0.0116638, isBase: false },
      { nameEn: 'Ana', nameBn: 'আনা', symbol: 'ana', multiplier: 0.0007289, isBase: false },
      { nameEn: 'Rati', nameBn: 'রতি', symbol: 'rati', multiplier: 0.0001215, isBase: false },
      { nameEn: 'Mon', nameBn: 'মণ', symbol: 'mon', multiplier: 37.3242, isBase: false },
      { nameEn: 'Ser', nameBn: 'সের', symbol: 'ser', multiplier: 0.9331, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Area', nameBn: 'ক্ষেত্রফল', iconName: 'Square', order: 3 },
    units: [
      { nameEn: 'Square Meter', nameBn: 'বর্গ মিটার', symbol: 'm²', multiplier: 1, isBase: true },
      { nameEn: 'Square Kilometer', nameBn: 'বর্গ কিলোমিটার', symbol: 'km²', multiplier: 1000000, isBase: false },
      { nameEn: 'Acre', nameBn: 'একর', symbol: 'ac', multiplier: 4046.86, isBase: false },
      { nameEn: 'Hectare', nameBn: 'হেক্টর', symbol: 'ha', multiplier: 10000, isBase: false },
      { nameEn: 'Square Foot', nameBn: 'বর্গ ফুট', symbol: 'ft²', multiplier: 0.092903, isBase: false },
      { nameEn: 'Square Yard', nameBn: 'বর্গ গজ', symbol: 'yd²', multiplier: 0.836127, isBase: false },
      { nameEn: 'Decimal (Shotok)', nameBn: 'শতক', symbol: 'dec', multiplier: 40.4686, isBase: false },
      { nameEn: 'Katha', nameBn: 'কাঠা', symbol: 'katha', multiplier: 66.89, isBase: false },
      { nameEn: 'Bigha', nameBn: 'বিঘা', symbol: 'bigha', multiplier: 1337.8, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Temperature', nameBn: 'তাপমাত্রা', iconName: 'Thermometer', order: 4 },
    units: [
      { nameEn: 'Celsius', nameBn: 'সেলসিয়াস', symbol: '°C', multiplier: 1, isBase: true },
      { nameEn: 'Fahrenheit', nameBn: 'ফারেনহাইট', symbol: '°F', multiplier: 1, isBase: false },
      { nameEn: 'Kelvin', nameBn: 'কেলভিন', symbol: 'K', multiplier: 1, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Volume', nameBn: 'আয়তন', iconName: 'Box', order: 5 },
    units: [
      { nameEn: 'Liter', nameBn: 'লিটার', symbol: 'L', multiplier: 1, isBase: true },
      { nameEn: 'Milliliter', nameBn: 'মিলিমিটার', symbol: 'ml', multiplier: 0.001, isBase: false },
      { nameEn: 'Cubic Meter', nameBn: 'ঘন মিটার', symbol: 'm³', multiplier: 1000, isBase: false },
      { nameEn: 'Gallon (US)', nameBn: 'গ্যালন (ইউএস)', symbol: 'gal', multiplier: 3.78541, isBase: false },
      { nameEn: 'Gallon (UK)', nameBn: 'গ্যালন (ইউকে)', symbol: 'gal', multiplier: 4.54609, isBase: false },
      { nameEn: 'Quart (US)', nameBn: 'কোয়ার্ট', symbol: 'qt', multiplier: 0.946353, isBase: false },
      { nameEn: 'Pint (US)', nameBn: 'পায়েন্ট', symbol: 'pt', multiplier: 0.473176, isBase: false },
      { nameEn: 'Cup (US)', nameBn: 'কাপ', symbol: 'cup', multiplier: 0.236588, isBase: false },
      { nameEn: 'Fluid Ounce (US)', nameBn: 'ফ্লুইড আউন্স', symbol: 'fl oz', multiplier: 0.0295735, isBase: false },
      { nameEn: 'Tablespoon', nameBn: 'টেবিল চামচ', symbol: 'tbsp', multiplier: 0.0147868, isBase: false },
      { nameEn: 'Teaspoon', nameBn: 'চা চামচ', symbol: 'tsp', multiplier: 0.00492892, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Time', nameBn: 'সময়', iconName: 'Clock', order: 6 },
    units: [
      { nameEn: 'Second', nameBn: 'সেকেন্ড', symbol: 's', multiplier: 1, isBase: true },
      { nameEn: 'Minute', nameBn: 'মিনিট', symbol: 'min', multiplier: 60, isBase: false },
      { nameEn: 'Hour', nameBn: 'ঘণ্টা', symbol: 'hr', multiplier: 3600, isBase: false },
      { nameEn: 'Day', nameBn: 'দিন', symbol: 'd', multiplier: 86400, isBase: false },
      { nameEn: 'Week', nameBn: 'সপ্তাহ', symbol: 'wk', multiplier: 604800, isBase: false },
      { nameEn: 'Month', nameBn: 'মাস', symbol: 'mo', multiplier: 2629746, isBase: false },
      { nameEn: 'Year', nameBn: 'বছর', symbol: 'yr', multiplier: 31556952, isBase: false },
      { nameEn: 'Decade', nameBn: 'দশক', symbol: 'decade', multiplier: 315569520, isBase: false },
      { nameEn: 'Century', nameBn: 'শতাব্দী', symbol: 'century', multiplier: 3155695200, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Digital Storage', nameBn: 'ডিজিটাল স্টোরেজ', iconName: 'HardDrive', order: 7 },
    units: [
      { nameEn: 'Byte', nameBn: 'বাইট', symbol: 'B', multiplier: 1, isBase: true },
      { nameEn: 'Bit', nameBn: 'বিট', symbol: 'bit', multiplier: 0.125, isBase: false },
      { nameEn: 'Kilobyte', nameBn: 'কিলোবাইট', symbol: 'KB', multiplier: 1024, isBase: false },
      { nameEn: 'Megabyte', nameBn: 'মেগাবাইট', symbol: 'MB', multiplier: 1048576, isBase: false },
      { nameEn: 'Gigabyte', nameBn: 'গিগাবাইট', symbol: 'GB', multiplier: 1073741824, isBase: false },
      { nameEn: 'Terabyte', nameBn: 'টেরাবাইট', symbol: 'TB', multiplier: 1099511627776, isBase: false },
      { nameEn: 'Petabyte', nameBn: 'পেটাবাইট', symbol: 'PB', multiplier: 1125899906842624, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Speed', nameBn: 'গতি', iconName: 'Zap', order: 8 },
    units: [
      { nameEn: 'Meter/Second', nameBn: 'মিটার/সেকেন্ড', symbol: 'm/s', multiplier: 1, isBase: true },
      { nameEn: 'Kilometer/Hour', nameBn: 'কিলোমিটার/ঘণ্টা', symbol: 'km/h', multiplier: 0.277778, isBase: false },
      { nameEn: 'Mile/Hour', nameBn: 'মাইল/ঘণ্টা', symbol: 'mph', multiplier: 0.44704, isBase: false },
      { nameEn: 'Knot', nameBn: 'নট', symbol: 'kn', multiplier: 0.514444, isBase: false },
      { nameEn: 'Foot/Second', nameBn: 'ফুট/সেকেন্ড', symbol: 'ft/s', multiplier: 0.3048, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Pressure', nameBn: 'চাপ', iconName: 'CircleDashed', order: 9 },
    units: [
      { nameEn: 'Pascal', nameBn: 'প্যাসকেল', symbol: 'Pa', multiplier: 1, isBase: true },
      { nameEn: 'Kilopascal', nameBn: 'কিলোপ্যাসকেল', symbol: 'kPa', multiplier: 1000, isBase: false },
      { nameEn: 'Bar', nameBn: 'বার', symbol: 'bar', multiplier: 100000, isBase: false },
      { nameEn: 'PSI', nameBn: 'পিএসআই', symbol: 'psi', multiplier: 6894.76, isBase: false },
      { nameEn: 'Atmosphere', nameBn: 'অ্যাটমোস্ফিয়ার', symbol: 'atm', multiplier: 101325, isBase: false },
      { nameEn: 'Torr', nameBn: 'টর', symbol: 'Torr', multiplier: 133.322, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Energy', nameBn: 'শক্তি', iconName: 'Zap', order: 10 },
    units: [
      { nameEn: 'Joule', nameBn: 'জুল', symbol: 'J', multiplier: 1, isBase: true },
      { nameEn: 'Kilojoule', nameBn: 'কিলোজুল', symbol: 'kJ', multiplier: 1000, isBase: false },
      { nameEn: 'Calorie', nameBn: 'ক্যালোরি', symbol: 'cal', multiplier: 4.184, isBase: false },
      { nameEn: 'Kilocalorie', nameBn: 'কিলোক্যালোরি', symbol: 'kcal', multiplier: 4184, isBase: false },
      { nameEn: 'Watt Hour', nameBn: 'ওয়াট ঘণ্টা', symbol: 'Wh', multiplier: 3600, isBase: false },
      { nameEn: 'Kilowatt Hour', nameBn: 'কিলোওয়াট ঘণ্টা', symbol: 'kWh', multiplier: 3600000, isBase: false },
      { nameEn: 'Electronvolt', nameBn: 'ইলেক্ট্রনভোল্ট', symbol: 'eV', multiplier: 1.60218e-19, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Power', nameBn: 'ক্ষমতা', iconName: 'Zap', order: 11 },
    units: [
      { nameEn: 'Watt', nameBn: 'ওয়াট', symbol: 'W', multiplier: 1, isBase: true },
      { nameEn: 'Kilowatt', nameBn: 'কিলোওয়াট', symbol: 'kW', multiplier: 1000, isBase: false },
      { nameEn: 'Megawatt', nameBn: 'মেগাওয়াট', symbol: 'MW', multiplier: 1000000, isBase: false },
      { nameEn: 'Horsepower', nameBn: 'হর্সপাওয়ার', symbol: 'hp', multiplier: 745.7, isBase: false },
      { nameEn: 'Foot-Pound/Minute', nameBn: 'ফুট-পাউন্ড/মিনিট', symbol: 'ft-lb/min', multiplier: 0.022597, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Plane Angle', nameBn: 'কোণ', iconName: 'Compass', order: 12 },
    units: [
      { nameEn: 'Degree', nameBn: 'ডিগ্রি', symbol: '°', multiplier: 1, isBase: true },
      { nameEn: 'Radian', nameBn: 'রেডিয়ান', symbol: 'rad', multiplier: 57.2958, isBase: false },
      { nameEn: 'Gradian', nameBn: 'গ্রেডিয়ান', symbol: 'grad', multiplier: 0.9, isBase: false },
      { nameEn: 'Minute of Arc', nameBn: 'আর্ক মিনিট', symbol: '′', multiplier: 0.0166667, isBase: false },
      { nameEn: 'Second of Arc', nameBn: 'আর্ক সেকেন্ড', symbol: '″', multiplier: 0.000277778, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Frequency', nameBn: 'কম্পাঙ্ক', iconName: 'Activity', order: 13 },
    units: [
      { nameEn: 'Hertz', nameBn: 'হার্টজ', symbol: 'Hz', multiplier: 1, isBase: true },
      { nameEn: 'Kilohertz', nameBn: 'কিলোহর্টজ', symbol: 'kHz', multiplier: 1000, isBase: false },
      { nameEn: 'Megahertz', nameBn: 'মেগাহর্টজ', symbol: 'MHz', multiplier: 1000000, isBase: false },
      { nameEn: 'Gigahertz', nameBn: 'গিগাহর্টজ', symbol: 'GHz', multiplier: 1000000000, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Fuel Economy', nameBn: 'জ্বালানি খরচ', iconName: 'Flame', order: 14 },
    units: [
      { nameEn: 'Kilometer/Liter', nameBn: 'কিলোমিটার/লিটার', symbol: 'km/L', multiplier: 1, isBase: true },
      { nameEn: 'Mile/Gallon (US)', nameBn: 'মাইল/গ্যালন (ইউএস)', symbol: 'mpg', multiplier: 0.425144, isBase: false },
      { nameEn: 'Mile/Gallon (UK)', nameBn: 'মাইল/গ্যালন (ইউকে)', symbol: 'mpg', multiplier: 0.354006, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Torque', nameBn: 'টর্ক', iconName: 'RotateCw', order: 15 },
    units: [
      { nameEn: 'Newton Meter', nameBn: 'নিউটন মিটার', symbol: 'N·m', multiplier: 1, isBase: true },
      { nameEn: 'Pound Foot', nameBn: 'পাউন্ড ফুট', symbol: 'lb·ft', multiplier: 1.35582, isBase: false },
      { nameEn: 'Kilogram Meter', nameBn: 'কিলোগ্রাম মিটার', symbol: 'kg·m', multiplier: 9.80665, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Typography', nameBn: 'টাইপোগ্রাফি', iconName: 'Type', order: 16 },
    units: [
      { nameEn: 'Pixel', nameBn: 'পিক্সেল', symbol: 'px', multiplier: 1, isBase: true },
      { nameEn: 'Point', nameBn: 'পয়েন্ট', symbol: 'pt', multiplier: 1.33333, isBase: false },
      { nameEn: 'Pica', nameBn: 'পাইকা', symbol: 'pc', multiplier: 16, isBase: false },
      { nameEn: 'Inch', nameBn: 'ইঞ্চি', symbol: 'in', multiplier: 96, isBase: false }
    ]
  },
  {
    category: { nameEn: 'Illumination', nameBn: 'আলোর উজ্জ্বলতা', iconName: 'Sun', order: 17 },
    units: [
      { nameEn: 'Lux', nameBn: 'লাক্স', symbol: 'lx', multiplier: 1, isBase: true },
      { nameEn: 'Foot-candle', nameBn: 'ফুট-ক্যান্ডেল', symbol: 'fc', multiplier: 10.7639, isBase: false }
    ]
  }
];
