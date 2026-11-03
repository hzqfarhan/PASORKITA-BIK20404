import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createApp } from '../server/app.js';
import { seedDatabase } from '../server/seed.js';

test('Express marketplace against isolated PostgreSQL',async t=>{
  const db=new PGlite();await db.waitReady;
  await db.exec(await readFile(new URL('../database/schema.sql',import.meta.url),'utf8'));
  await seedDatabase(db,{password:'TestCampus!2026'});
  const app=await createApp({database:db,secret:'test-only-session-secret-at-least-32-characters'});
  let server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  let base='http://127.0.0.1:'+server.address().port;
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));await db.close();});
  function client(){let cookie='',csrf='';return {
    async request(url,method='GET',data,skipCsrf=false){
      const headers={Cookie:cookie};let body;
      if(data){headers['Content-Type']='application/x-www-form-urlencoded';body=new URLSearchParams({...(!skipCsrf?{_csrf:csrf}:{}),...data});}
      const response=await fetch(base+url,{method,headers,body,redirect:'manual'});
      const cookies=response.headers.getSetCookie();if(cookies.length)cookie=cookies.map(value=>value.split(';')[0]).join('; ');
      const text=await response.text();const match=text.match(/name="_csrf" value="([a-f0-9]+)"/);if(match)csrf=match[1];
      return {status:response.status,text,location:response.headers.get('location'),headers:response.headers};
    },
    async upload(url,data,file){
      const body=new FormData();for(const [key,value] of Object.entries({_csrf:csrf,...data}))body.set(key,value);body.set('image',file,'campus-photo.jpg');
      const response=await fetch(base+url,{method:'POST',headers:{Cookie:cookie},body,redirect:'manual'});return {status:response.status,text:await response.text(),location:response.headers.get('location')};
    },
    async login(email){await this.request('/login');assert.equal((await this.request('/login','POST',{email,password:'TestCampus!2026'})).status,302);await this.request('/account');}
  };}
  const guest=client(),seller=client(),buyer=client(),admin=client();let productId,orderId;
  await t.test('retained design, navigable pages and local Three.js assets render',async()=>{
    const r=await guest.request('/');assert.equal(r.status,200);assert.match(r.text,/Big finds/);assert.match(r.text,/id="hero-three"/);assert.doesNotMatch(r.text,/_next\/|__next/);
    for(const asset of ['/scene.js','/vendor/three/three.module.js','/vendor/three/three.core.js','/styles.css','/refinements.css','/sw.js','/assets/nasi.jpg','/assets/books.jpg','/assets/matcha.jpg','/assets/headphones.jpg','/assets/calculator.jpg'])assert.equal((await guest.request(asset)).status,200,asset);
  });
  await t.test('registration hashes passwords and cannot assign an admin role',async()=>{
    for(const [c,name,email] of [[seller,'Test Seller','test.seller@student.uthm.edu.my'],[buyer,'Test Buyer','test.buyer@student.uthm.edu.my']]){
      await c.request('/register');assert.equal((await c.request('/register','POST',{name,email,password:'TestCampus!2026',campus:'Parit Raja',role:'admin'})).status,302);assert.equal((await c.request('/account')).status,200);
    }
    const stored=(await db.query("SELECT * FROM pasor_kita.users WHERE email='test.seller@student.uthm.edu.my'")).rows[0];assert.equal(stored.role,'member');assert.match(stored.password_hash,/^\$2/);assert.equal((await buyer.request('/admin')).status,403);assert.match((await guest.request('/seller')).location,/^\/login/);
  });
  const listing={title:'Test <script>alert(1)</script> product',description:'A safe description of a real campus product.',price:'12.50',stock:'2',category_id:'1',campus:'Parit Raja',pickup_location:'Student Centre',item_condition:'Like new',image_choice:'books'};
  await t.test('listing CRUD persists, escapes text and enforces ownership and CSRF',async()=>{
    await seller.request('/seller/products/new');assert.equal((await seller.request('/seller/products','POST',listing,true)).status,403);
    const created=await seller.request('/seller/products','POST',listing);assert.equal(created.status,302);productId=Number(created.location.split('/').pop());
    const page=await buyer.request('/products/'+productId);assert.equal(page.status,200);assert.match(page.text,/&lt;script&gt;/);assert.doesNotMatch(page.text,/<script>alert/);
    assert.equal((await buyer.request('/seller/products/'+productId,'POST',listing)).status,403);
    assert.equal((await seller.request('/seller/products/'+productId,'POST',{...listing,stock:'-1'})).status,400);
    assert.equal((await seller.request('/seller/products/'+productId,'POST',{...listing,title:'Updated campus product'})).status,302);
    assert.equal((await db.query('SELECT title FROM pasor_kita.products WHERE id=$1',[productId])).rows[0].title,'Updated campus product');
    assert.equal((await buyer.request('/products/'+productId+'/save','POST',{})).status,302);assert.match((await buyer.request('/saved')).text,/Updated campus product/);
    const disposable=await seller.request('/seller/products','POST',{...listing,title:'Disposable listing'}),id=disposable.location.split('/').pop();assert.equal((await seller.request('/seller/products/'+id+'/delete','POST',{})).status,302);assert.equal((await db.query('SELECT id FROM pasor_kita.products WHERE id=$1',[id])).rows.length,0);
  });
  await t.test('checkout calculates totals, reserves stock and restores cancellation once',async()=>{
    await buyer.request('/checkout/'+productId);assert.equal((await buyer.request('/checkout/'+productId,'POST',{quantity:'2',pickup_details:'Tomorrow at the Student Centre',price:'0.01',total:'0.02'})).status,302);
    const order=(await db.query('SELECT * FROM pasor_kita.orders ORDER BY id DESC LIMIT 1')).rows[0];orderId=order.id;assert.equal(Number(order.total),25);assert.equal((await db.query('SELECT stock FROM pasor_kita.products WHERE id=$1',[productId])).rows[0].stock,0);
    assert.equal((await buyer.request('/checkout/'+productId,'POST',{quantity:'1',pickup_details:'Another pickup attempt'})).status,409);
    assert.equal((await buyer.request('/orders/'+orderId+'/status','POST',{status:'completed'})).status,403);
    assert.equal((await buyer.request('/orders/'+orderId+'/status','POST',{status:'cancelled'})).status,302);assert.equal((await buyer.request('/orders/'+orderId+'/status','POST',{status:'cancelled'})).status,403);assert.equal((await db.query('SELECT stock FROM pasor_kita.products WHERE id=$1',[productId])).rows[0].stock,2);
  });
  await t.test('completed exchanges permit separate item, seller and buyer reviews',async()=>{
    assert.equal((await buyer.request('/checkout/'+productId,'POST',{quantity:'1',pickup_details:'Friday at noon, Student Centre'})).status,302);orderId=(await db.query('SELECT id FROM pasor_kita.orders ORDER BY id DESC LIMIT 1')).rows[0].id;
    assert.equal((await buyer.request('/orders/'+orderId+'/reviews','POST',{kind:'item',rating:'5',comment:'An excellent campus find.'})).status,403);
    for(const status of ['accepted','ready','completed'])assert.equal((await seller.request('/orders/'+orderId+'/status','POST',{status,view:'seller'})).status,302);
    for(const kind of ['item','seller'])assert.equal((await buyer.request('/orders/'+orderId+'/reviews','POST',{kind,rating:'5',comment:'An excellent campus connection.'})).status,302);
    assert.equal((await buyer.request('/orders/'+orderId+'/reviews','POST',{kind:'item',rating:'5',comment:'Duplicate feedback is blocked.'})).status,409);
    assert.equal((await buyer.request('/orders/'+orderId+'/reviews','POST',{kind:'buyer',rating:'5',comment:'Self feedback is blocked.'})).status,403);
    assert.equal((await seller.request('/orders/'+orderId+'/reviews','POST',{kind:'buyer',rating:'4',comment:'A friendly campus buyer.'})).status,302);
    assert.equal((await seller.request('/seller/products/'+productId+'/delete','POST',{})).status,302);assert.equal((await db.query('SELECT status FROM pasor_kita.products WHERE id=$1',[productId])).rows[0].status,'archived');assert.equal((await buyer.request('/orders')).status,200);
  });
  await t.test('messages persist and unrelated recipients are rejected',async()=>{
    const sample=(await db.query('SELECT id,seller_id FROM pasor_kita.products WHERE is_sample LIMIT 1')).rows[0];await buyer.request('/messages');assert.equal((await buyer.request('/messages','POST',{product_id:String(sample.id),recipient_id:String(sample.seller_id),body:'Is this item available for campus pickup?'})).status,302);assert.match((await buyer.request('/messages')).text,/available for campus pickup/);
    const sellerId=(await db.query("SELECT id FROM pasor_kita.users WHERE email='test.seller@student.uthm.edu.my'")).rows[0].id;assert.equal((await buyer.request('/messages','POST',{product_id:String(sample.id),recipient_id:String(sellerId),body:'Spoofed recipient'})).status,403);
  });
  await t.test('upload validation and business ownership prevent forged records',async()=>{
    await seller.request('/seller/products/new');
    assert.equal((await seller.upload('/seller/products',listing,new Blob(['not a JPEG'],{type:'image/jpeg'}))).status,400);
    assert.equal((await seller.upload('/seller/products',listing,new Blob([new Uint8Array(4*1024*1024+1)],{type:'image/jpeg'}))).status,400);
    await seller.request('/account');
    assert.equal((await seller.request('/account/businesses','POST',{name:'Test campus business'})).status,302);
    const business=(await db.query("SELECT id FROM pasor_kita.businesses WHERE name='Test campus business'")).rows[0];
    await buyer.request('/seller/products/new');
    assert.equal((await buyer.request('/seller/products','POST',{...listing,business_id:String(business.id)})).status,403);
    assert.equal((await buyer.request('/account/businesses/'+business.id+'/verification','POST',{type:'SSM',reference:'UNAUTHORISED'})).status,403);
    assert.equal((await seller.request('/account/businesses/'+business.id+'/verification','POST',{type:'SSM',reference:'TEST-REFERENCE-123'})).status,302);
    assert.equal((await db.query('SELECT status FROM pasor_kita.verification_requests WHERE business_id=$1',[business.id])).rows[0].status,'pending');
    assert.equal((await buyer.request('/admin/verifications/1','POST',{status:'approved'})).status,403);
  });
  await t.test('admin category CRUD and all fourteen page purposes work',async()=>{
    await admin.login('admin@uthm.edu.my');assert.equal((await admin.request('/admin')).status,200);assert.equal((await admin.request('/admin/categories','POST',{name:'Test category',description:'A useful test category'})).status,302);
    const category=(await db.query("SELECT id FROM pasor_kita.categories WHERE name='Test category'")).rows[0];assert.equal((await admin.request('/admin/categories/'+category.id,'POST',{name:'Updated category',description:'A revised category',action:'update'})).status,302);assert.equal((await admin.request('/admin/categories/'+category.id,'POST',{action:'delete'})).status,302);
    const sample=(await db.query('SELECT id FROM pasor_kita.products WHERE is_sample LIMIT 1')).rows[0];for(const route of ['/','/products','/products/'+sample.id,'/register','/login','/account','/seller','/seller/products/new','/saved','/checkout/'+sample.id,'/orders','/admin','/help','/messages'])assert.equal((await admin.request(route)).status,200,route);
    for(const route of ['/products?q=nasi','/products?campus=Pagoh','/products?category=1&sort=price-low&maxPrice=10','/products?business=1','/products?page=2'])assert.equal((await buyer.request(route)).status,200,route);
    assert.equal((await buyer.request('/products?category=1%20OR%201=1')).status,400);
    assert.equal((await guest.request('/products/2147483648')).status,400);
  });
  await t.test('database-backed sessions and saved orders survive an Express restart',async()=>{
    await new Promise(resolve=>server.close(resolve));
    const restarted=await createApp({database:db,secret:'test-only-session-secret-at-least-32-characters'});
    server=await new Promise(resolve=>{const s=restarted.listen(0,'127.0.0.1',()=>resolve(s));});
    base='http://127.0.0.1:'+server.address().port;
    assert.match((await buyer.request('/account')).text,/Test Buyer/);
    assert.match((await buyer.request('/orders')).text,/Updated campus product/);
  });
  await t.test('offline support never caches personalised HTML',async()=>{const sw=(await guest.request('/sw.js')).text;assert.doesNotMatch(sw,/cache\.put\('\/'/);assert.match(sw,/offline\.html/);});
});
