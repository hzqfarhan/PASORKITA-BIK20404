import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { root, sessionSecret } from './config.js';
import { rows, one, transaction, PostgreSQLSessionStore, useDatabase, getDatabase } from './db.js';
import { InputError, textValue, integer, idValue, priceValue, emailValue, campusValue, passwordValue, money, initials, token, equalToken, canTransition, reviewTarget } from './domain.js';
import { productSQL, getProduct, getCategories, listProducts } from './catalogue.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024, files: 1, fields: 20 } });
const validImages = ['nasi','headphones','matcha','camera','design','calculator','sneakers','books'];
const requireUser = (req, res, next) => req.user ? next() : res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
const requireAdmin = (req, res, next) => req.user?.role === 'admin' ? next() : next(new InputError('This page is available to administrators.', 403));
const csrfCheck = (req, res, next) => equalToken(req.body?._csrf, req.session.csrf) ? next() : next(new InputError('Your form expired. Reload the page and try again.', 403));
const safeNext = value => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !/[\\\r\n]/.test(value) ? value : '/account';
const flash = (req, message) => { req.session.flash = message; };
async function regenerate(req) { await new Promise((resolve,reject) => req.session.regenerate(error => error ? reject(error) : resolve())); }
async function productInput(req, existing) {
  const body = req.body;
  const data = {
    title: textValue(body.title,3,100,'the product title'), description: textValue(body.description,12,4000,'the description'),
    price: priceValue(body.price), stock: integer(body.stock,0,100000,'stock'), category_id: idValue(body.category_id),
    campus: campusValue(body.campus), pickup_location: textValue(body.pickup_location,3,160,'the pickup location'),
    item_condition: textValue(body.item_condition,2,60,'the condition'), business_id: body.business_id ? idValue(body.business_id) : null,
  };
  if (!await one('SELECT id FROM pasor_kita.categories WHERE id=$1',[data.category_id])) throw new InputError('Choose a current category.');
  if (data.business_id && !await one('SELECT id FROM pasor_kita.businesses WHERE id=$1 AND owner_id=$2',[data.business_id,req.user.id])) throw new InputError('Choose a business you own.',403);
  data.image_path = existing?.image_path || '/assets/nasi.jpg';
  if (body.image_choice && validImages.includes(body.image_choice)) data.image_path = '/assets/' + body.image_choice + '.jpg';
  if (req.file) {
    const b = req.file.buffer;
    const extension = b.length>12 && b[0]===0xff && b[1]===0xd8 && b[2]===0xff ? 'jpg' : b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png' : b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP' ? 'webp' : null;
    if (!extension || !['image/jpeg','image/png','image/webp'].includes(req.file.mimetype)) throw new InputError('Upload a JPEG, PNG or WebP image up to 4 MB.');
    await mkdir(path.join(root,'uploads'), {recursive:true});
    const name = randomUUID() + '.' + extension;
    await writeFile(path.join(root,'uploads',name),b,{flag:'wx'});
    data.image_path = '/uploads/' + name;
  }
  return data;
}

export async function createApp(options = {}) {
  if (options.database) useDatabase(options.database);
  const app = express();
  app.disable('x-powered-by');
  if(process.env.TRUST_PROXY==='1')app.set('trust proxy',1);
  app.set('view engine','ejs'); app.set('views',path.join(root,'views'));
  app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc:["'self'"], scriptSrc:["'self'"], styleSrc:["'self'","'unsafe-inline'"], imgSrc:["'self'",'data:'], fontSrc:["'self'"], connectSrc:["'self'"], objectSrc:["'none'"], upgradeInsecureRequests:null } }, crossOriginEmbedderPolicy:false }));
  app.get('/sw.js',(req,res)=>res.set('Cache-Control','no-store').sendFile(path.join(root,'public/sw.js')));
  app.use('/vendor/three', express.static(path.join(root,'node_modules/three/build'),{index:false}));
  app.use(express.static(path.join(root,'public'),{index:false, dotfiles:'deny'}));
  app.use('/uploads',express.static(path.join(root,'uploads'),{index:false, dotfiles:'deny',setHeaders:res=>res.set('Content-Security-Policy',"default-src 'none'; sandbox")}));
  app.get('/health',async(req,res)=>{ try { await one('SELECT 1 AS ok FROM pasor_kita.categories LIMIT 1');res.json({status:'ok',application:'pasor-kita-express',database:'postgresql'}); } catch { res.status(503).json({status:'setup-required',application:'pasor-kita-express'}); } });
  app.use((req,res,next)=>{try{getDatabase();next();}catch(error){next(error);}});
  app.use(express.urlencoded({extended:false,limit:'64kb'})); app.use(express.json({limit:'16kb'}));
  app.use((req,res,next)=>{req.body ||= {};next();});
  app.use(session({ name:'pasor.sid', secret:options.secret || await sessionSecret(), store:new PostgreSQLSessionStore(), resave:false, saveUninitialized:false, cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:86400000} }));
  app.use(async(req,res,next)=>{
    res.set('Cache-Control','private, no-store');
    req.user = req.session.userId ? await one('SELECT id,name,email,role,campus,card_color,email_verified FROM pasor_kita.users WHERE id=$1',[req.session.userId]) : null;
    res.locals = { ...res.locals, user:req.user, csrf:req.session.csrf || '', currentPath:req.path, query:req.query, money, initials,
      title:'Pasor Kita', page:'', notice:req.session.flash || '', error:'', categories:[], products:[] };
    delete req.session.flash;
    next();
  });
  app.use((req,res,next)=> {
    if (req.method==='GET' && !req.session.csrf) req.session.csrf=token();
    res.locals.csrf=req.session.csrf;
    if (!['GET','HEAD','OPTIONS'].includes(req.method) && !req.is('multipart/form-data')) return csrfCheck(req,res,next);
    next();
  });
  const render = (res,page,title,data={})=>res.render('layout',{page,title,...data});

  app.get('/',async(req,res)=> {
    const [categories,products,top] = await Promise.all([getCategories(),listProducts({},req.user?.id || 0),rows(`SELECT p.id,p.title,p.image_path,SUM(oi.quantity)::int AS sold FROM pasor_kita.order_items oi JOIN pasor_kita.orders o ON o.id=oi.order_id JOIN pasor_kita.products p ON p.id=oi.product_id WHERE o.status='completed' AND p.status='active' AND o.completed_at>=CURRENT_TIMESTAMP-INTERVAL '30 days' GROUP BY p.id ORDER BY sold DESC LIMIT 4`)]);
    render(res,'home','Good finds start here',{categories,products,top});
  });
  app.get('/products',async(req,res)=>render(res,'products',req.query.business==='1'?'Campus businesses':'The campus edit',{categories:await getCategories(),products:await listProducts(req.query,req.user?.id || 0)}));
  app.get('/saved',requireUser,async(req,res)=>render(res,'products','Your saved finds',{categories:await getCategories(),products:await listProducts({saved:true},req.user.id),savedPage:true}));
  app.get('/products/:id',async(req,res)=>{
    const product = await getProduct(req.params.id,req.user?.id || 0);
    if (!product) throw new InputError('This listing is no longer available.',404);
    const reviews=await rows("SELECT r.*,u.name FROM pasor_kita.reviews r JOIN pasor_kita.users u ON u.id=r.author_id WHERE r.product_id=$1 AND NOT r.hidden ORDER BY r.created_at DESC LIMIT 30",[product.id]);
    render(res,'product',product.title,{product,reviews});
  });
  const authLimit = rateLimit({windowMs:15*60*1000,limit:40,standardHeaders:'draft-8',legacyHeaders:false,message:'Too many sign-in attempts. Please try again in 15 minutes.'});
  app.get('/register',(req,res)=>render(res,'register','Your campus. Your account.'));
  app.post('/register',authLimit,async(req,res)=> {
    const name=textValue(req.body.name,2,80,'your name'), email=emailValue(req.body.email), password=passwordValue(req.body.password), campus=campusValue(req.body.campus);
    const hash=await bcrypt.hash(password,12);
    const user=await one('INSERT INTO pasor_kita.users (name,email,password_hash,campus) VALUES ($1,$2,$3,$4) RETURNING id',[name,email,hash,campus]);
    await regenerate(req);req.session.userId=user.id;req.session.csrf=token();flash(req,'Welcome to Pasor Kita. Your campus connection starts here.');res.redirect('/account');
  });
  app.get('/login',(req,res)=>render(res,'login','A little closer to campus'));
  app.post('/login',authLimit,async(req,res)=> {
    const email=emailValue(req.body.email), password=typeof req.body.password==='string'?req.body.password:'';
    const user=await one('SELECT * FROM pasor_kita.users WHERE email=$1',[email]);
    const valid=await bcrypt.compare(password,user?.password_hash || '$2b$12$XLF1NKgXqKJswjwq0hU1M.s/ZDAAm2/gYR9QSVJidNq2AJaJ.fM2u');
    if (!user || !valid) throw new InputError('The email and password do not match.',401);
    await regenerate(req);req.session.userId=user.id;req.session.csrf=token();res.redirect(safeNext(req.body.next));
  });
  app.post('/logout',(req,res,next)=>req.session.destroy(error=>{if(error)return next(error);res.clearCookie('pasor.sid',{path:'/'});res.redirect('/');}));
  app.get('/account',requireUser,async(req,res)=>{
    const businesses=await rows('SELECT b.*,COALESCE((SELECT STRING_AGG(v.type || \':\' || v.status,\',\') FROM pasor_kita.verification_requests v WHERE v.business_id=b.id),\'\') AS verifications FROM pasor_kita.businesses b WHERE b.owner_id=$1 ORDER BY b.id',[req.user.id]);
    const reputation=await rows('SELECT kind,AVG(rating) AS average,COUNT(*)::int AS count FROM pasor_kita.reviews WHERE target_user_id=$1 AND NOT hidden GROUP BY kind',[req.user.id]);
    render(res,'account','Your corner of campus',{businesses,reputation});
  });
  app.post('/account',requireUser,async(req,res)=>{
    const name=textValue(req.body.name,2,80,'your name'), campus=campusValue(req.body.campus), color=['burgundy','forest','navy'].includes(req.body.card_color)?req.body.card_color:'burgundy';
    await rows('UPDATE pasor_kita.users SET name=$1,campus=$2,card_color=$3 WHERE id=$4',[name,campus,color,req.user.id]);flash(req,'Your profile is up to date.');res.redirect('/account');
  });
  app.post('/account/businesses',requireUser,async(req,res)=>{await rows('INSERT INTO pasor_kita.businesses (owner_id,name) VALUES ($1,$2)',[req.user.id,textValue(req.body.name,2,80,'the business name')]);flash(req,'Business linked to your account.');res.redirect('/account');});
  app.post('/account/businesses/:id/verification',requireUser,async(req,res)=>{
    const business=await one('SELECT id FROM pasor_kita.businesses WHERE id=$1 AND owner_id=$2',[idValue(req.params.id),req.user.id]);
    if (!business) throw new InputError('Choose a business you own.',403);
    if (!['SSM','PTU'].includes(req.body.type)) throw new InputError('Choose SSM or PTU.');
    await rows("INSERT INTO pasor_kita.verification_requests (business_id,type,reference) VALUES ($1,$2,$3) ON CONFLICT (business_id,type) DO UPDATE SET reference=EXCLUDED.reference,status='pending',reviewed_by=NULL",[business.id,req.body.type,textValue(req.body.reference,3,100,'the registration reference')]);
    flash(req,'Your registration reference is pending administrator review.');res.redirect('/account');
  });
  app.get('/seller',requireUser,async(req,res)=>{
    const products=await rows(productSQL+' WHERE p.seller_id=$2 ORDER BY p.created_at DESC',[req.user.id,req.user.id]);
    const orders=await rows('SELECT o.*,oi.quantity,oi.product_title,oi.product_id,u.name AS counterpart FROM pasor_kita.orders o JOIN pasor_kita.order_items oi ON oi.order_id=o.id JOIN pasor_kita.users u ON u.id=o.buyer_id WHERE o.seller_id=$1 ORDER BY o.created_at DESC',[req.user.id]);
    render(res,'seller','Your seller studio',{products,orders});
  });
  async function editor(req,res) {
    const product=req.params.id?await one('SELECT * FROM pasor_kita.products WHERE id=$1 AND seller_id=$2',[idValue(req.params.id),req.user.id]):null;
    if (req.params.id && (!product || product.status==='removed')) throw new InputError('This listing is unavailable for editing.',403);
    render(res,'editor',product?'A little refresh':'Make room for something new',{product,categories:await getCategories(),businesses:await rows('SELECT * FROM pasor_kita.businesses WHERE owner_id=$1',[req.user.id])});
  }
  app.get('/seller/products/new',requireUser,editor);app.get('/seller/products/:id/edit',requireUser,editor);
  app.post('/seller/products',requireUser,upload.single('image'),csrfCheck,async(req,res)=>{
    const p=await productInput(req);
    const product=await one('INSERT INTO pasor_kita.products (seller_id,business_id,category_id,title,description,price,stock,campus,pickup_location,item_condition,image_path) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id',[req.user.id,p.business_id,p.category_id,p.title,p.description,p.price,p.stock,p.campus,p.pickup_location,p.item_condition,p.image_path]);
    flash(req,'Your listing is now part of the campus edit.');res.redirect('/products/'+product.id);
  });
  app.post('/seller/products/:id',requireUser,upload.single('image'),csrfCheck,async(req,res)=>{
    const current=await one('SELECT * FROM pasor_kita.products WHERE id=$1 AND seller_id=$2',[idValue(req.params.id),req.user.id]);
    if (!current || current.status==='removed') throw new InputError('You can only edit your own available listings.',403);
    const p=await productInput(req,current);
    await rows("UPDATE pasor_kita.products SET business_id=$1,category_id=$2,title=$3,description=$4,price=$5,stock=$6,campus=$7,pickup_location=$8,item_condition=$9,image_path=$10,status='active',updated_at=CURRENT_TIMESTAMP WHERE id=$11",[p.business_id,p.category_id,p.title,p.description,p.price,p.stock,p.campus,p.pickup_location,p.item_condition,p.image_path,current.id]);
    flash(req,'Listing updated.');res.redirect('/products/'+current.id);
  });
  app.post('/seller/products/:id/delete',requireUser,async(req,res)=>{
    await transaction(async db=>{
      const p=await one('SELECT id FROM pasor_kita.products WHERE id=$1 AND seller_id=$2 FOR UPDATE',[idValue(req.params.id),req.user.id],db);
      if (!p) throw new InputError('You can only remove your own listings.',403);
      const used=await one('SELECT id FROM pasor_kita.order_items WHERE product_id=$1 LIMIT 1',[p.id],db);
      if (used) await rows("UPDATE pasor_kita.products SET status='archived',updated_at=CURRENT_TIMESTAMP WHERE id=$1",[p.id],db);
      else { await rows('DELETE FROM pasor_kita.favorites WHERE product_id=$1',[p.id],db);await rows('DELETE FROM pasor_kita.messages WHERE product_id=$1',[p.id],db);await rows('DELETE FROM pasor_kita.products WHERE id=$1',[p.id],db); }
    });flash(req,'Listing removed from the marketplace. Order history stays available.');res.redirect('/seller');
  });
  app.post('/products/:id/save',requireUser,async(req,res)=>{
    const p=await getProduct(req.params.id,req.user.id);if(!p)throw new InputError('Listing unavailable.',404);
    if (p.saved) await rows('DELETE FROM pasor_kita.favorites WHERE user_id=$1 AND product_id=$2',[req.user.id,p.id]);
    else await rows('INSERT INTO pasor_kita.favorites (user_id,product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',[req.user.id,p.id]);
    if(req.headers.accept?.includes('application/json'))return res.json({saved:!p.saved});
    flash(req,p.saved?'Removed from your saved finds.':'Saved for later.');res.redirect(safeNext(req.body.next || '/saved'));
  });
  app.get('/checkout/:productId',requireUser,async(req,res)=>{
    const product=await getProduct(req.params.productId,req.user.id);if(!product)throw new InputError('Listing unavailable.',404);
    if(product.seller_id===req.user.id)throw new InputError('You cannot order your own listing.',400);
    if(!product.stock)throw new InputError('This item is currently sold out.',409);
    render(res,'checkout','Good find. Make it yours.',{product});
  });
  app.post('/checkout/:productId',requireUser,async(req,res)=>{
    const quantity=integer(req.body.quantity,1,1000,'quantity'), pickup=textValue(req.body.pickup_details,5,300,'pickup details');
    await transaction(async db=>{
      const p=await one("SELECT * FROM pasor_kita.products WHERE id=$1 AND status='active' FOR UPDATE",[idValue(req.params.productId)],db);
      if(!p)throw new InputError('Listing unavailable.',404);
      if(p.seller_id===req.user.id)throw new InputError('You cannot order your own listing.');
      if(p.stock<quantity)throw new InputError('There is not enough stock for this order.',409);
      const cents=Math.round(Number(p.price)*100)*quantity;
      const order=await one('INSERT INTO pasor_kita.orders (buyer_id,seller_id,pickup_details,total) VALUES ($1,$2,$3,$4) RETURNING id',[req.user.id,p.seller_id,pickup,(cents/100).toFixed(2)],db);
      await rows('INSERT INTO pasor_kita.order_items (order_id,product_id,product_title,quantity,unit_price) VALUES ($1,$2,$3,$4,$5)',[order.id,p.id,p.title,quantity,p.price],db);
      await rows('UPDATE pasor_kita.products SET stock=stock-$1 WHERE id=$2',[quantity,p.id],db);
    });flash(req,'Order placed. Your seller will confirm the pickup. Payment is due at pickup.');res.redirect('/orders');
  });
  app.get('/orders',requireUser,async(req,res)=>{
    const orders=await rows("SELECT o.*,oi.product_title,oi.product_id,oi.quantity,u.name AS counterpart,COALESCE((SELECT STRING_AGG(r.kind,',') FROM pasor_kita.reviews r WHERE r.order_id=o.id AND r.author_id=$1),'') AS reviewed FROM pasor_kita.orders o JOIN pasor_kita.order_items oi ON oi.order_id=o.id JOIN pasor_kita.users u ON u.id=o.seller_id WHERE o.buyer_id=$1 ORDER BY o.created_at DESC",[req.user.id]);
    render(res,'orders','Your campus connections',{orders});
  });
  app.post('/orders/:id/status',requireUser,async(req,res)=>{
    await transaction(async db=>{
      const order=await one('SELECT * FROM pasor_kita.orders WHERE id=$1 FOR UPDATE',[idValue(req.params.id)],db);
      if(!order || !canTransition(order,req.user.id,req.body.status))throw new InputError('This order cannot move to that status.',403);
      await rows("UPDATE pasor_kita.orders SET status=$1::varchar,completed_at=CASE WHEN $1::varchar='completed' THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id=$2",[req.body.status,order.id],db);
      if(req.body.status==='cancelled') await rows('UPDATE pasor_kita.products SET stock=stock+oi.quantity FROM pasor_kita.order_items oi WHERE oi.order_id=$1 AND pasor_kita.products.id=oi.product_id',[order.id],db);
    });flash(req,'Order status updated.');res.redirect(req.body.view==='seller'?'/seller':'/orders');
  });
  app.post('/orders/:id/reviews',requireUser,async(req,res)=>{
    const order=await one('SELECT o.*,oi.product_id FROM pasor_kita.orders o JOIN pasor_kita.order_items oi ON oi.order_id=o.id WHERE o.id=$1',[idValue(req.params.id)]);
    if(!order)throw new InputError('Order unavailable.',404);
    const kind=req.body.kind,target=reviewTarget(order,req.user.id,kind);
    await rows('INSERT INTO pasor_kita.reviews (order_id,author_id,kind,target_user_id,product_id,rating,comment) VALUES ($1,$2,$3,$4,$5,$6,$7)',[order.id,req.user.id,kind,target,order.product_id,integer(req.body.rating,1,5,'rating'),textValue(req.body.comment,8,600,'your review')]);
    flash(req,'Your review helps the next campus connection.');res.redirect(req.user.id===order.seller_id?'/seller':'/orders');
  });
  app.get('/messages',requireUser,async(req,res)=>{
    const inbox=await rows('SELECT m.*,p.title,u.name AS sender_name,v.name AS recipient_name FROM pasor_kita.messages m JOIN pasor_kita.products p ON p.id=m.product_id JOIN pasor_kita.users u ON u.id=m.sender_id JOIN pasor_kita.users v ON v.id=m.recipient_id WHERE m.sender_id=$1 OR m.recipient_id=$1 ORDER BY m.created_at DESC LIMIT 100',[req.user.id]);
    let product=null,recipient=null;
    if(req.query.product && req.query.with){product=await one('SELECT * FROM pasor_kita.products WHERE id=$1',[idValue(req.query.product)]);recipient=await one('SELECT id,name FROM pasor_kita.users WHERE id=$1',[idValue(req.query.with)]);
      if(!product || !recipient || recipient.id===req.user.id || product.seller_id!==recipient.id && product.seller_id!==req.user.id)throw new InputError('Choose a valid seller conversation.',403);
      if(product.seller_id===req.user.id && !await one('SELECT id FROM pasor_kita.messages WHERE product_id=$1 AND sender_id=$2 AND recipient_id=$3 LIMIT 1',[product.id,recipient.id,req.user.id]))throw new InputError('Reply to an existing buyer conversation.',403);
    }
    render(res,'messages','A conversation starts here',{inbox,product,recipient});
  });
  app.post('/messages',requireUser,rateLimit({windowMs:60000,limit:20,legacyHeaders:false}),async(req,res)=>{
    const product=await one('SELECT * FROM pasor_kita.products WHERE id=$1',[idValue(req.body.product_id)]),recipient=idValue(req.body.recipient_id);
    if(!product || recipient===req.user.id || product.seller_id!==recipient && product.seller_id!==req.user.id)throw new InputError('Choose a valid seller conversation.',403);
    if(product.seller_id===req.user.id && !await one('SELECT id FROM pasor_kita.messages WHERE product_id=$1 AND sender_id=$2 AND recipient_id=$3 LIMIT 1',[product.id,recipient,req.user.id]))throw new InputError('Reply to an existing buyer conversation.',403);
    await rows('INSERT INTO pasor_kita.messages (product_id,sender_id,recipient_id,body) VALUES ($1,$2,$3,$4)',[product.id,req.user.id,recipient,textValue(req.body.body,1,1000,'your message')]);
    flash(req,'Message sent.');res.redirect('/messages?product='+product.id+'&with='+recipient);
  });
  app.get('/admin',requireUser,requireAdmin,async(req,res)=>{
    const [categories,products,reviews,verifications]=await Promise.all([getCategories(),rows(productSQL+' ORDER BY p.created_at DESC LIMIT 100',[req.user.id]),rows('SELECT r.*,u.name FROM pasor_kita.reviews r JOIN pasor_kita.users u ON u.id=r.author_id ORDER BY r.created_at DESC LIMIT 50'),rows("SELECT v.*,b.name FROM pasor_kita.verification_requests v JOIN pasor_kita.businesses b ON b.id=v.business_id WHERE v.status='pending' ORDER BY v.created_at")]);
    render(res,'admin','Looking after our campus',{categories,products,reviews,verifications});
  });
  app.post('/admin/categories',requireUser,requireAdmin,async(req,res)=>{await rows('INSERT INTO pasor_kita.categories (name,description) VALUES ($1,$2)',[textValue(req.body.name,2,40,'the category name'),textValue(req.body.description,2,160,'the category description')]);flash(req,'Category created.');res.redirect('/admin');});
  app.post('/admin/categories/:id',requireUser,requireAdmin,async(req,res)=>{
    const id=idValue(req.params.id);
    if(req.body.action==='delete')await rows('DELETE FROM pasor_kita.categories WHERE id=$1',[id]);
    else await rows('UPDATE pasor_kita.categories SET name=$1,description=$2 WHERE id=$3',[textValue(req.body.name,2,40,'the category name'),textValue(req.body.description,2,160,'the category description'),id]);
    flash(req,'Category updated.');res.redirect('/admin');
  });
  app.post('/admin/products/:id',requireUser,requireAdmin,async(req,res)=>{if(!['active','removed'].includes(req.body.status))throw new InputError('Choose an available moderation action.');await rows('UPDATE pasor_kita.products SET status=$1 WHERE id=$2',[req.body.status,idValue(req.params.id)]);flash(req,'Listing moderation saved.');res.redirect('/admin');});
  app.post('/admin/reviews/:id',requireUser,requireAdmin,async(req,res)=>{await rows('UPDATE pasor_kita.reviews SET hidden=$1 WHERE id=$2',[req.body.hidden==='true',idValue(req.params.id)]);flash(req,'Review moderation saved.');res.redirect('/admin');});
  app.post('/admin/verifications/:id',requireUser,requireAdmin,async(req,res)=>{if(!['approved','rejected'].includes(req.body.status))throw new InputError('Choose approve or reject.');await rows("UPDATE pasor_kita.verification_requests SET status=$1,reviewed_by=$2 WHERE id=$3 AND status='pending'",[req.body.status,req.user.id,idValue(req.params.id)]);flash(req,'Registration review recorded.');res.redirect('/admin');});
  app.get('/help',(req,res)=>render(res,'help','A little guide to good finds'));
  app.use((req,res,next)=>next(new InputError('That page has wandered off campus.',404)));
  app.use((error,req,res,next)=>{
    if(res.headersSent)return next(error);
    const conflict=error.code==='23505', dependency=error.code==='23503';
    const unavailable=['DB_NOT_CONFIGURED','ECONNREFUSED','ENOTFOUND','ETIMEDOUT','28P01','42P01','3F000'].includes(error.code);
    const status=conflict||dependency?409:unavailable?503:error.code==='LIMIT_FILE_SIZE'?400:error.status||500;
    const message=conflict?'That account, category or review already exists.':dependency?'This record is still in use. Move its linked records before deleting it.':unavailable?'The marketplace is getting ready. Check the Supabase connection and run the database setup.':status===500?'Something interrupted this campus connection. Please try again.':error.message;
    if(status>=500)console.error('Request unavailable:',error.code || error.name);
    res.status(status).render('layout',{...res.locals,user:req.user||null,csrf:res.locals.csrf||'',currentPath:req.path,money,initials,query:{},notice:'',categories:[],products:[],page:'error',title:status===503?'A little preparation first':'Let’s find your way back',error:message,status});
  });
  return app;
}
