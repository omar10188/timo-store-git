const mongoose = require('mongoose');

const categories = [
  { name: 'صيفي', description: 'عطور صيفية مميزة', slug: 'summer', isActive: true, image: '' },
  { name: 'شتوي', description: 'عطور شتوية دافئة', slug: 'winter', isActive: true, image: '' },
  { name: 'سكسي', description: 'عطور جذابة ومثيرة', slug: 'sexy', isActive: true, image: '' },
  { name: 'منعش', description: 'عطور منعشة وحيوية', slug: 'fresh', isActive: true, image: '' },
  { name: 'فانيليا', description: 'عطور برائحة الفانيليا الفاخرة', slug: 'vanilla', isActive: true, image: '' }
];

async function updateCategories() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/timo-store');
    const db = mongoose.connection.db;
    
    console.log('Clearing old categories...');
    await db.collection('categories').deleteMany({});
    
    console.log('Inserting new categories...');
    await db.collection('categories').insertMany(categories);
    
    console.log('Categories updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating categories:', error);
    process.exit(1);
  }
}

updateCategories();
