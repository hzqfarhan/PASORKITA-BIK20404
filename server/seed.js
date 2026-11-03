import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import { emailValue, passwordValue } from './domain.js';

export async function seedDatabase(db,{password,adminEmail='admin@uthm.edu.my'}={}) {
  passwordValue(password);emailValue(adminEmail);
  const hash=await bcrypt.hash(password,12);
  const categories=[['Food','Good mood food','food'],['Preloved','New to you','preloved'],['Services','A helping hand','services'],['Rentals','Borrow the good stuff','rentals'],['Others','Something unexpected','others']];
  for(const [name,description,icon] of categories)await db.query('INSERT INTO pasor_kita.categories (name,description,icon) VALUES ($1,$2,$3) ON CONFLICT (name) DO NOTHING',[name,description,icon]);
  await db.query("INSERT INTO pasor_kita.users (name,email,password_hash,role,campus) VALUES ($1,$2,$3,'admin','Parit Raja') ON CONFLICT (email) DO NOTHING",['Campus Administrator',adminEmail,hash]);
  const samples=JSON.parse(await readFile(new URL('../database/sample-products.json',import.meta.url),'utf8'));
  for(const sample of samples){
    const email='sample.'+sample.id+'@student.uthm.edu.my';
    await db.query('INSERT INTO pasor_kita.users (name,email,password_hash,campus) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING',[sample.business?'Campus owner · '+sample.initials:sample.seller,email,hash,sample.campus]);
    const seller=(await db.query('SELECT id FROM pasor_kita.users WHERE email=$1',[email])).rows[0];
    const exists=(await db.query('SELECT id FROM pasor_kita.products WHERE seller_id=$1 AND is_sample',[seller.id])).rows[0];if(exists)continue;
    let businessId=null;
    if(sample.business){businessId=(await db.query('INSERT INTO pasor_kita.businesses (owner_id,name) VALUES ($1,$2) RETURNING id',[seller.id,sample.seller])).rows[0].id;}
    const category=(await db.query('SELECT id FROM pasor_kita.categories WHERE name=$1',[sample.category])).rows[0];
    await db.query('INSERT INTO pasor_kita.products (seller_id,business_id,category_id,title,description,price,stock,campus,pickup_location,item_condition,image_path,is_sample) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true)',[seller.id,businessId,category.id,sample.title,sample.description,sample.price,sample.category==='Food'?30:3,sample.campus,sample.pickup,sample.condition,'/'+sample.image]);
  }
}
