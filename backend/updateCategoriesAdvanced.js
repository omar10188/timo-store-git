const mongoose = require('mongoose');

const categories = [
  { name: '🌞 صيفي', description: 'عطور صيفية', slug: 'summer', isActive: true, image: '' },
  { name: '❄️ شتوي', description: 'عطور شتوية', slug: 'winter', isActive: true, image: '' },
  { name: '🌊 منعش', description: 'عطور منعشة', slug: 'fresh', isActive: true, image: '' },
  { name: '🍦 فانيليا', description: 'عطور الفانيليا', slug: 'vanilla', isActive: true, image: '' },
  { name: '🌹 زهري', description: 'عطور زهرية', slug: 'floral', isActive: true, image: '' },
  { name: '🌳 خشبي', description: 'عطور خشبية', slug: 'woody', isActive: true, image: '' },
  { name: '🧴 بودري', description: 'عطور بودرية', slug: 'powdery', isActive: true, image: '' },
  { name: '🍬 حلو', description: 'عطور حلوة', slug: 'sweet', isActive: true, image: '' },
  { name: '🍋 حمضي', description: 'عطور حمضية', slug: 'citrus', isActive: true, image: '' },
  { name: '🌿 أخضر', description: 'عطور خضراء', slug: 'green', isActive: true, image: '' },
  { name: '🍂 شرقي', description: 'عطور شرقية', slug: 'oriental', isActive: true, image: '' },
  { name: '🍇 فاكهي', description: 'عطور فاكهية', slug: 'fruity', isActive: true, image: '' },
  { name: '🍯 عنبري', description: 'عطور عنبرية', slug: 'ambery', isActive: true, image: '' },
  { name: '🪵 جلدي', description: 'عطور جلدية', slug: 'leather', isActive: true, image: '' },
  { name: '💎 فاخر', description: 'عطور فاخرة', slug: 'luxury', isActive: true, image: '' },
  { name: '🔥 سكسي', description: 'عطور جذابة ومثيرة', slug: 'sexy', isActive: true, image: '' }
];

async function updateCategories() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/timo-store');
    const db = mongoose.connection.db;
    
    console.log('Clearing old categories...');
    await db.collection('categories').deleteMany({});
    
    console.log('Inserting new comprehensive categories...');
    await db.collection('categories').insertMany(categories);
    
    console.log('Categories updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating categories:', error);
    process.exit(1);
  }
}

updateCategories();
