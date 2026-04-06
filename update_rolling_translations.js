const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend', 'src', 'locales');

const injectRolling = (lang, r1, r2) => {
  const jsonPath = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    if (!data.landing) data.landing = {};
    if (!data.landing.hero) data.landing.hero = {};
    
    data.landing.hero.rolling1 = r1;
    data.landing.hero.rolling2 = r2;
    
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log(`Updated rolling translations for ${lang}`);
  }
};

injectRolling('en', 'Live Monitoring', 'Smart Workflows');
injectRolling('si', 'සජීවී අධීක්ෂණය', 'ස්මාර්ට් කාර්ය ප්‍රවාහයන්');
injectRolling('ta', 'நேரடி கண்காணிப்பு', 'ஸ்மார்ட் பணிப்பாய்வுகள்');
