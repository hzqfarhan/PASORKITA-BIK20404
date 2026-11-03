(() => {
  'use strict';

  const STORAGE_KEY = 'pasor-campus-preview-v1';
  const categories = ['All', 'Food', 'Preloved', 'Services', 'Rentals', 'Others'];
  const paths = {
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    star: '<path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2-4.5-4.4 6.3-.9Z"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    shield: '<path d="M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7Z"/><path d="m8 12 3 3 5-6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0Z"/><path d="M7 10h10M7 14h6"/>',
    bag: '<path d="M5 7h14l2 14H3L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
    spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    flip: '<path d="M3 10a9 9 0 0 1 15-6l3 3m0-5v5h-5M21 14A9 9 0 0 1 6 20l-3-3m0 5v-5h5"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const money = value => `RM ${Number(value).toFixed(2)}`;
  const seed = [
    {id:'nasi', title:'Nasi lemak ayam berempah', category:'Food', price:7.5, unit:' / set', image:'assets/nasi.jpg', seller:'Dapur Kak Ain', initials:'DA', avatar:'#e8cfb5', business:true, registration:'PTU', campus:'Parit Raja', pickup:'Kolej Kediaman Tun Dr. Ismail', condition:'Made fresh', rating:'4.9', time:'15 min ago', description:'Your lunch break, sorted. Fragrant coconut rice, crispy spiced chicken, sambal, egg and all the good things. Prepared fresh for campus pickup. Ask the seller about ingredients and availability.', tag:'Campus favourite', rank:1},
    {id:'headphones', title:'Wireless over-ear headphones', category:'Preloved', price:450, image:'assets/headphones.jpg', seller:'Amir Hakim', initials:'AH', avatar:'#d8d3e8', business:false, campus:'Parit Raja', pickup:'Perpustakaan Tunku Tun Aminah', condition:'Like new', rating:'4.9', time:'32 min ago', description:'A little peace for your study sessions. Well cared for wireless over-ear headphones, with a charging cable. You are welcome to inspect them at pickup.', tag:'Great find', rank:2},
    {id:'matcha', title:'Iced matcha latte', category:'Food', price:9, unit:' / cup', image:'assets/matcha.jpg', seller:'Matcha & Co.', initials:'MC', avatar:'#d7e2ca', business:true, registration:'SSM', campus:'Parit Raja', pickup:'Student Centre, Parit Raja', condition:'Freshly made', rating:'4.9', time:'40 min ago', description:'A matcha moment between classes. Japanese matcha layered over fresh milk, served iced. Message us to arrange your pickup and let us know your milk preference.', tag:'Campus pick', rank:3},
    {id:'camera', title:'Sony Alpha camera · weekend rental', category:'Rentals', price:45, unit:' / day', image:'assets/camera.jpg', seller:'Faris Frames', initials:'FF', avatar:'#ecd7c4', business:false, campus:'Pagoh', pickup:'Pagoh Campus Hub', condition:'Deposit required', rating:'4.8', time:'1 hour ago', description:'Make your next campus event memorable. A compact mirrorless camera with a kit lens and spare battery. Arrange rental dates, deposit and return details directly with the owner.', tag:'For your next project', rank:4},
    {id:'design', title:'Posters that get noticed', category:'Services', price:25, unit:' / design', image:'assets/design.jpg', seller:'Studio Siswa', initials:'SS', avatar:'#d8cde9', business:true, registration:'PTU', campus:'Parit Raja', pickup:'Online · both campuses', condition:'2–3 day delivery', rating:'5.0', time:'2 hours ago', description:'Event poster? Club announcement? A fresh social media look? Student-made graphic design with one concept and two revisions. Message with your brief and deadline before ordering.', tag:'Student talent', rank:5},
    {id:'calculator', title:'Casio fx-82MS scientific calculator', category:'Preloved', price:55, image:'assets/calculator.jpg', seller:'Nur Aisyah', initials:'NA', avatar:'#ead9d1', business:false, campus:'Parit Raja', pickup:'Fakulti Kejuruteraan Awam', condition:'Good condition', rating:'4.8', time:'3 hours ago', description:'Ready for the next engineering student. Fully working scientific calculator with its protective cover. Minor signs of use. Check that this model meets your course and exam requirements.', tag:'Study essential', rank:6},
    {id:'sneakers', title:'Nike Air sneakers · UK 8', category:'Preloved', price:120, image:'assets/sneakers.jpg', seller:'Danish Azmi', initials:'DZ', avatar:'#d4e1dc', business:false, campus:'Pagoh', pickup:'Pagoh Residential College', condition:'Gently used', rating:'4.9', time:'4 hours ago', description:'Classic everyday sneakers looking for a new campus adventure. Size UK 8, cleaned and cared for. Original box included. Meet up to check the fit and condition.', tag:'Second life, new story', rank:7},
    {id:'books', title:'A little stack of good reads', category:'Others', price:18, unit:' / bundle', image:'assets/books.jpg', seller:'Sofia Reads', initials:'SR', avatar:'#e5d7be', business:false, campus:'Parit Raja', pickup:'Kolej Kediaman Tun Fatimah', condition:'Well loved', rating:'4.9', time:'5 hours ago', description:'Three pre-loved reads for slow afternoons and study breaks. A lovely little bundle at a student-friendly price. Message for the current titles before arranging pickup.', tag:'For your downtime', rank:8},
  ];

  seed.forEach(item => {
    item.sample = true;
    item.identityType = item.business ? 'business' : 'personal';
    item.verificationTypes = ({nasi:['PTU'],matcha:['SSM'],design:['SSM','PTU']})[item.id] || [];
    delete item.registration;
  });

  function classifyEmail(email) {
    const match=String(email).trim().match(/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@(student\.uthm\.edu\.my|uthm\.edu\.my)$/i);
    return !match ? null : match[1].toLowerCase()==='student.uthm.edu.my' ? 'Student' : 'Staff / Lecturer';
  }
  function normalizeAccount(raw) {
    if(!raw || typeof raw!=='object') return null;
    const email=String(raw.email || '').trim().toLowerCase();
    const role=classifyEmail(email);
    const name=String(raw.name || '').trim().slice(0,80);
    return role && name ? {id:'preview:'+email,email,name,role} : null;
  }

  const SAMPLE_BUYER={accountId:'sample-buyer:dina',identityId:'sample-buyer:dina',name:'Dina Rahman',role:'Sample campus buyer'};
  const sampleItemMetrics={
    nasi:{rating:4.8,count:24,week:86,month:314,profileCount:37},
    headphones:{rating:4.6,count:8,week:8,month:31,profileCount:21},
    matcha:{rating:4.7,count:19,week:72,month:268,profileCount:29},
    camera:{rating:4.8,count:11,week:14,month:46,profileCount:18},
    design:{rating:4.9,count:16,week:31,month:112,profileCount:26},
    calculator:{rating:4.5,count:6,week:11,month:39,profileCount:14},
    sneakers:{rating:4.6,count:9,week:9,month:28,profileCount:17},
    books:{rating:4.7,count:13,week:23,month:79,profileCount:23}
  };
  function sellerSubject(item) {
    const accountId=item.ownerAccountId || 'sample-seller:'+item.id;
    return {accountId,identityId:item.business ? item.businessId || 'sample-business:'+item.id : accountId,name:item.seller,business:!!item.business,role:item.sellerRole || 'Student',sample:!!item.sample};
  }
  function exchangeTargets(exchange,authorId) {
    if(!exchange || exchange.status!=='completed' || exchange.demo!==true || exchange.buyerAccountId===exchange.sellerAccountId)return [];
    if(authorId===exchange.buyerAccountId)return [
      {kind:'seller-profile',targetType:'profile',targetRole:'seller',targetAccountId:exchange.sellerAccountId,targetIdentityId:exchange.sellerIdentityId,name:exchange.sellerName,ratingField:'sellerRating',textField:'sellerText',label:'Seller profile'},
      {kind:'item',targetType:'item',targetRole:'item',targetAccountId:exchange.sellerAccountId,targetIdentityId:exchange.listingId,name:exchange.listingTitle,ratingField:'itemRating',textField:'itemText',label:'This item'}
    ];
    if(authorId===exchange.sellerAccountId)return [{kind:'buyer-profile',targetType:'profile',targetRole:'buyer',targetAccountId:exchange.buyerAccountId,targetIdentityId:exchange.buyerAccountId,name:exchange.buyerName,ratingField:'buyerRating',textField:'buyerText',label:'Buyer profile'}];
    return [];
  }
  function normalizeReviewData(value) {
    const seenExchanges=new Set(),exchanges=[];
    for(const raw of Array.isArray(value.demoExchanges)?value.demoExchanges:[]){
      if(!raw || typeof raw.id!=='string' || !raw.id.startsWith('exchange-') || !['buyer','seller'].includes(raw.mode) || raw.demo!==true || raw.status!=='completed' || typeof raw.listingId!=='string' || typeof raw.actorAccountId!=='string' || typeof raw.buyerAccountId!=='string' || typeof raw.sellerAccountId!=='string' || typeof raw.sellerIdentityId!=='string' || raw.buyerAccountId===raw.sellerAccountId)continue;
      if(raw.mode==='buyer' && (raw.actorAccountId!==raw.buyerAccountId || !raw.actorAccountId.startsWith('preview:')))continue;
      if(raw.mode==='seller' && (raw.actorAccountId!==raw.sellerAccountId || raw.buyerAccountId!==SAMPLE_BUYER.accountId))continue;
      const unique=raw.actorAccountId+'|'+raw.listingId+'|'+raw.mode;
      if(seenExchanges.has(unique))continue;seenExchanges.add(unique);
      exchanges.push({id:raw.id,listingId:raw.listingId,listingTitle:String(raw.listingTitle||'Campus find').slice(0,80),mode:raw.mode,actorAccountId:raw.actorAccountId,buyerAccountId:raw.buyerAccountId,buyerName:String(raw.buyerName||'Campus buyer').slice(0,80),buyerRole:String(raw.buyerRole||'Campus member').slice(0,30),sellerAccountId:raw.sellerAccountId,sellerIdentityId:raw.sellerIdentityId,sellerName:String(raw.sellerName||'Campus seller').slice(0,80),sellerType:raw.sellerType==='business'?'business':'personal',sellerRole:String(raw.sellerRole||'Campus member').slice(0,30),status:'completed',demo:true,created:Number(raw.created)||0});
    }
    const seenReviews=new Set(),reviews=[];
    for(const raw of Array.isArray(value.reviews)?value.reviews:[]){
      if(!raw || !Number.isInteger(raw.rating) || raw.rating<1 || raw.rating>5 || typeof raw.text!=='string' || raw.text.trim().length<8 || typeof raw.authorAccountId!=='string')continue;
      const exchange=exchanges.find(entry=>entry.id===raw.exchangeId);
      const target=exchangeTargets(exchange,raw.authorAccountId).find(entry=>entry.kind===raw.kind);
      if(!target || target.targetAccountId===raw.authorAccountId)continue;
      const unique=raw.exchangeId+'|'+raw.authorAccountId+'|'+raw.kind;if(seenReviews.has(unique))continue;seenReviews.add(unique);
      reviews.push({id:String(raw.id||unique),exchangeId:exchange.id,listingId:exchange.listingId,kind:target.kind,targetType:target.targetType,targetRole:target.targetRole,targetAccountId:target.targetAccountId,targetIdentityId:target.targetIdentityId,authorAccountId:raw.authorAccountId,authorName:String(raw.authorName||'Campus member').slice(0,80),rating:raw.rating,text:raw.text.trim().slice(0,600),created:Number(raw.created)||0,demo:true});
    }
    return {demoExchanges:exchanges,reviews};
  }

  const emptyStorage=()=>({saved:[],listings:[],cardColor:'burgundy',account:null,businesses:[],postingByAccount:{},conversationsByAccount:{},demoExchanges:[],reviews:[]});
  function readStorage() {
    try {
      const raw=JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const value=raw && typeof raw==='object' ? raw : {};
      const businesses=(Array.isArray(value.businesses) ? value.businesses : []).filter(b=>b && typeof b.id==='string' && b.id.startsWith('business-') && typeof b.ownerAccountId==='string' && typeof b.name==='string').map(b=>{
        const requests={};
        ['ssm','ptu'].forEach(type=>{const reference=String(b.requests?.[type]?.reference || '').trim().slice(0,100);if(reference) requests[type]={reference,status:'pending'};});
        return {id:b.id,ownerAccountId:b.ownerAccountId,name:b.name.slice(0,80),requests,created:Number(b.created)||0};
      });
      const listings=(Array.isArray(value.listings) ? value.listings : []).filter(item=>item && typeof item.id==='string' && item.id.startsWith('local-') && typeof item.title==='string' && categories.includes(item.category) && item.category!=='All' && Number.isFinite(Number(item.price)) && Number(item.price)>=0 && typeof item.image==='string' && (/^data:image\/(?:jpeg|png|webp);base64,/.test(item.image) || /^assets\/[a-z]+\.jpg$/.test(item.image))).map(item=>{
        const business=businesses.find(b=>b.id===item.businessId && b.ownerAccountId===item.ownerAccountId);
        return {...item,sample:false,verificationTypes:[],business:!!business,identityType:business?'business':'personal',businessId:business?.id||null,ownerAccountId:typeof item.ownerAccountId==='string'?item.ownerAccountId:null,sellerRole:['Student','Staff / Lecturer'].includes(item.sellerRole)?item.sellerRole:classifyEmail(String(item.ownerAccountId||'').replace(/^preview:/,''))||'Campus member',price:Number(item.price),seller:String(item.seller || 'Earlier preview member').slice(0,80),initials:String(item.initials || 'P').slice(0,2),avatar:'#e6d6d3',rank:0};
      });
      return {...normalizeReviewData(value),saved:Array.isArray(value.saved)?[...new Set(value.saved.filter(x=>typeof x==='string'))]:[],listings,cardColor:['burgundy','forest','navy'].includes(value.cardColor)?value.cardColor:'burgundy',account:normalizeAccount(value.account),businesses,postingByAccount:value.postingByAccount && typeof value.postingByAccount==='object' && !Array.isArray(value.postingByAccount)?value.postingByAccount:{},conversationsByAccount:value.conversationsByAccount && typeof value.conversationsByAccount==='object' && !Array.isArray(value.conversationsByAccount)?value.conversationsByAccount:{}};
    } catch {return emptyStorage();}
  }
  const state={...readStorage(),category:'All',view:'marketplace',search:'',campus:'All campuses',sort:'recommended',maxPrice:0,badgeFilter:'all',activeChat:null,topSellingPeriod:'week'};
  let previousFocus=null,toastTimer,validationTimer,invalidBurst=false,pendingIntent=null,loginCandidate=null;
  const $=id=>document.getElementById(id);
  const allProducts=()=>[...state.listings,...seed];
  const product=id=>allProducts().find(item=>item.id===id);
  const initials=name=>String(name).trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();
  const ownedBusinesses=()=>state.account?state.businesses.filter(b=>b.ownerAccountId===state.account.id):[];
  const ownsListing=item=>!!state.account && item?.ownerAccountId===state.account.id;
  function identityFor(value) {
    if(!state.account) return null;
    if(value==='personal') return {id:'personal',name:state.account.name,type:'personal',initials:initials(state.account.name),role:state.account.role};
    const business=ownedBusinesses().find(b=>b.id===value);
    return business ? {id:business.id,name:business.name,type:'business',initials:initials(business.name),requests:business.requests} : null;
  }
  const currentIdentity=()=>identityFor(state.postingByAccount[state.account?.id]) || identityFor('personal');
  function badgeTypes(item) {
    const sample=seed.find(entry=>entry.id===item?.id && item.sample===true);
    return sample?.verificationTypes || [];
  }
  function badges(item,extra='') {
    return badgeTypes(item).map(type=>`<span class="verification-badge badge-${type.toLowerCase()} ${extra}">${icon('shield')}Verified ${type}</span>`).join('');
  }
  function pendingBadges(business) {
    return ['ssm','ptu'].filter(type=>business.requests?.[type]).map(type=>`<span class="linked-status pending">Pending ${type.toUpperCase()} review</span>`).join('');
  }
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY,JSON.stringify({version:2,saved:state.saved,listings:state.listings,cardColor:state.cardColor,account:state.account,businesses:state.businesses,postingByAccount:state.postingByAccount,conversationsByAccount:state.conversationsByAccount,demoExchanges:state.demoExchanges,reviews:state.reviews}));
      return true;
    } catch {feedback('error','Device storage is full','Your latest change could not be saved. Remove a photo or an older preview listing and try again.');return false;}
  }
  function toast(message) {
    const root=$('toast-root');if(!root)return;
    clearTimeout(toastTimer);root.innerHTML=`<div class="toast" role="status">${icon('check')}<span>${esc(message)}</span></div>`;
    toastTimer=setTimeout(()=>{root.innerHTML='';},3800);
  }
  function feedback(kind,title,copy) {
    const root=$('validation-root');
    if(!root){toast(copy || title);return;}
    clearTimeout(validationTimer);
    const safeKind=['error','success','info'].includes(kind)?kind:'info';
    root.innerHTML=`<div class="validation-popup is-${safeKind}" role="${safeKind==='error'?'alert':'status'}"><span class="validation-popup-icon">${icon(safeKind==='error'?'close':safeKind==='success'?'check':'shield')}</span><div><strong class="validation-popup-title">${esc(title)}</strong><p class="validation-popup-copy">${esc(copy)}</p></div><button class="validation-popup-close" data-action="dismiss-validation" aria-label="Dismiss feedback">${icon('close')}</button><span class="validation-spark"></span><span class="validation-spark"></span><span class="validation-progress"></span></div>`;
    validationTimer=setTimeout(()=>{root.innerHTML='';},6000);
  }
  function formError(form,statusId,message,field) {
    const status=$(statusId);if(status){status.className='status-message error';status.textContent=message;}
    const control=field?form.elements?.[field]:null;
    const input=typeof control?.setAttribute==='function'?control:control?.[0];
    input?.setAttribute('aria-invalid','true');if(status)input?.setAttribute('aria-describedby',statusId);input?.focus();
    feedback('error','A little detail needs attention',message);
  }
  function updateAccountLabels() {
    const identity=currentIdentity();
    if($('account-label'))$('account-label').textContent=state.account?state.account.name:'University sign-in';
    if($('account-role-label'))$('account-role-label').textContent=state.account?state.account.role:'Guest preview';
    if($('identity-label'))$('identity-label').textContent=identity?identity.name:'Choose who you post as';
    if($('linked-business-count'))$('linked-business-count').textContent=ownedBusinesses().length;
    document.querySelectorAll('.mini-card-name').forEach(el=>{el.textContent=identity?.name || 'Aiman Hakimi';});
    document.querySelectorAll('.mini-card-role').forEach(el=>{el.textContent=identity?identity.type==='business'?'LINKED BUSINESS · PREVIEW':state.account.role.toUpperCase()+' · PERSONAL':'STUDENT · SAMPLE PROFILE';});
    document.querySelectorAll('.mini-avatar').forEach(el=>{el.textContent=identity?.initials || 'a.';});
    document.querySelectorAll('.sample-label').forEach(el=>{el.textContent=state.account?'Your 3D identity · Local account preview':'Meet your 3D campus card · Sample profile';});
  }

  function summariseRatings(reviews,fixture=null) {
    const sampleCount=fixture?.count || 0,localCount=reviews.length,count=sampleCount+localCount;
    const sum=(fixture?.rating || 0)*sampleCount+reviews.reduce((total,review)=>total+review.rating,0);
    return {average:count?sum/count:0,count,sampleCount,localCount};
  }
  function itemRating(item) {
    return summariseRatings(state.reviews.filter(review=>review.kind==='item'&&review.listingId===item.id),item.sample?sampleItemMetrics[item.id]:null);
  }
  function profileReviews(subject,role) {
    return state.reviews.filter(review=>review.targetType==='profile'&&(!role||review.targetRole===role)&&(subject.business?review.targetIdentityId===subject.identityId:review.targetAccountId===subject.accountId));
  }
  function profileRating(subject,role) {
    const sample=seed.find(item=>{const seller=sellerSubject(item);return subject.business?seller.identityId===subject.identityId:seller.accountId===subject.accountId;});
    let fixture=null;
    if(sample&&role!=='buyer')fixture={rating:Number(sample.rating),count:sampleItemMetrics[sample.id]?.profileCount||0};
    if(subject.accountId===SAMPLE_BUYER.accountId&&role!=='seller')fixture={rating:4.8,count:6};
    return summariseRatings(profileReviews(subject,role),fixture);
  }
  function ratingInline(metrics,label='Item') {
    return `<span class="rating-inline" title="${esc(label)} rating">${icon('star')}<strong>${metrics.count?metrics.average.toFixed(1):'—'}</strong><span>${esc(label)} · ${metrics.count?metrics.count+' reviews':'No reviews yet'}</span></span>`;
  }
  function starsHTML(value) {
    const filled=Math.max(0,Math.min(5,Math.round(value||0)));
    return [1,2,3,4,5].map(star=>icon('star','rating-star '+(star<=filled?'is-filled':'is-empty'))).join('');
  }
  function ratingSummary(metrics,label) {
    return `<div class="rating-summary"><div class="rating-value">${metrics.count?metrics.average.toFixed(1):'—'}<span>/ 5</span></div><div><strong>${esc(label)}</strong><div class="rating-stars" aria-hidden="true">${starsHTML(metrics.average)}</div><small>${metrics.count?`${metrics.count} reviews · ${metrics.sampleCount?metrics.sampleCount+' sample + ':''}${metrics.localCount} local demo`:'No reviews yet'}</small></div></div>`;
  }
  function reviewsHTML(reviews) {
    return reviews.length?`<div class="review-list">${[...reviews].sort((a,b)=>b.created-a.created).slice(0,6).map(review=>`<article class="review-card"><div class="review-author"><span class="seller-avatar">${esc(initials(review.authorName))}</span><div><strong>${esc(review.authorName)}</strong><small>${review.kind==='item'?'Item review':review.kind==='seller-profile'?'Buyer to seller':'Seller to buyer'} · Demo exchange</small></div><span class="rating-stars" aria-label="${review.rating} out of 5">${starsHTML(review.rating)}</span></div><p>${esc(review.text)}</p></article>`).join('')}</div>`:'<p class="rating-empty">No written local reviews yet. Sample averages, where shown, are illustrative.</p>';
  }
  function profileReputationHTML(subject) {
    const overall=profileRating(subject),seller=profileRating(subject,'seller'),buyer=profileRating(subject,'buyer');
    return `<section class="review-section"><h3>Profile reputation</h3>${ratingSummary(overall,subject.business?'Business profile rating':'Personal profile rating')}<div class="rating-breakdown"><div><strong>${seller.count?seller.average.toFixed(1):'—'}</strong><span>As a seller</span><small>${seller.count} reviews</small></div><div><strong>${buyer.count?buyer.average.toFixed(1):'—'}</strong><span>As a buyer</span><small>${buyer.count} reviews</small></div></div><p class="review-demo-note">Profile feedback is separate from item ratings. All feedback in this preview is sample or local demo data on this device.</p>${reviewsHTML(profileReviews(subject))}</section>`;
  }
  function productReviewsHTML(item) {
    const reviews=state.reviews.filter(review=>review.kind==='item'&&review.listingId===item.id);
    return `<section class="review-section"><h3>This item, in its own right.</h3>${ratingSummary(itemRating(item),'Item rating')}<p class="review-demo-note">This score belongs to the listing. Seller and buyer reputations are rated separately.</p>${reviewsHTML(reviews)}</section>`;
  }
  function topSellingEntries() {
    const duration=(state.topSellingPeriod==='month'?30:7)*24*60*60*1000,cutoff=Date.now()-duration;
    return allProducts().map(item=>{
      const sampleUnits=item.sample?(sampleItemMetrics[item.id]?.[state.topSellingPeriod]||0):0;
      const demoUnits=state.demoExchanges.filter(exchange=>exchange.listingId===item.id&&exchange.status==='completed'&&exchange.demo&&exchange.created>=cutoff).length;
      return {item,units:sampleUnits+demoUnits,sampleUnits,demoUnits};
    }).sort((a,b)=>b.units-a.units||(a.item.rank||99)-(b.item.rank||99)).slice(0,4);
  }
  function renderTopSelling() {
    if($('top-selling-description'))$('top-selling-description').textContent=`Sample campus chart · illustrative ${state.topSellingPeriod==='month'?'30-day':'7-day'} counts plus local demo exchanges. No live sales data.`;
    if($('top-selling-period'))$('top-selling-period').value=state.topSellingPeriod;
    const grid=$('top-selling-grid');if(!grid)return;
    grid.innerHTML=topSellingEntries().map((entry,index)=>`<button class="top-selling-card" data-action="open-product" data-id="${esc(entry.item.id)}"><span class="top-selling-rank">0${index+1}</span><img class="top-selling-image" src="${esc(entry.item.image)}" alt="" loading="lazy"><span class="top-selling-copy"><strong>${esc(entry.item.title)}</strong>${ratingInline(itemRating(entry.item),'Item')}<span class="top-selling-sales">${entry.units} illustrative sales · ${entry.demoUnits} local demo</span><small>${money(entry.item.price)}</small></span>${icon('arrow')}</button>`).join('');
  }
  function showDemoExchange(id) {
    if(!requireAccount('demo-exchange',id))return;
    const item=product(id);if(!item)return;
    const seller=ownsListing(item),counterpart=seller?SAMPLE_BUYER.name:item.seller;
    openModal('Try both sides of a campus exchange.',`<div class="review-counterpart"><img src="${esc(item.image)}" alt=""><div><strong>${esc(item.title)}</strong><small>${seller?'You are the seller':'You are the buyer'} · Counterpart: ${esc(counterpart)}${seller?' (sample buyer)':''}</small></div></div><div class="preview-callout"><strong>A completed demo exchange.</strong><p>This explicitly simulates a completed exchange so you can try reviews. No purchase, payment, delivery or verified transaction is recorded.</p></div><div class="review-role-picker"><button class="primary-button full-width" data-action="complete-demo-exchange" data-id="${esc(id)}" data-role="${seller?'seller':'buyer'}">${seller?'As seller · review the sample buyer':'As buyer · review this seller & item'} ${icon('arrow')}</button>${seller?'':'<button class="text-button" data-action="review-demo-buyer">Want to review a buyer? Choose one of your own listings.</button>'}</div><p class="review-demo-note">One demo exchange per account, listing and role. Returning here reuses it, so it cannot create extra sales or duplicate reviews.</p>`,'demo-exchange');
  }
  function completeDemoExchange(id,mode) {
    if(!requireAccount('demo-exchange',id))return;
    const item=product(id);if(!item)return;
    const own=ownsListing(item);
    if((mode==='seller'&&!own)||(mode==='buyer'&&own)||!['buyer','seller'].includes(mode)){feedback('error','Choose the right side of this exchange','You can review a buyer only on your own listing, and cannot review yourself as a seller.');return;}
    let exchange=state.demoExchanges.find(entry=>entry.actorAccountId===state.account.id&&entry.listingId===id&&entry.mode===mode);
    if(!exchange){
      const subject=sellerSubject(item),buyer=mode==='buyer'?{accountId:state.account.id,name:state.account.name,role:state.account.role}:SAMPLE_BUYER;
      if(buyer.accountId===subject.accountId){feedback('error','Self-reviews are not available','Your personal and linked business identities belong to the same university account.');return;}
      exchange={id:`exchange-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,listingId:id,listingTitle:item.title,mode,actorAccountId:state.account.id,buyerAccountId:buyer.accountId,buyerName:buyer.name,buyerRole:buyer.role,sellerAccountId:subject.accountId,sellerIdentityId:subject.identityId,sellerName:subject.name,sellerType:subject.business?'business':'personal',sellerRole:subject.role,status:'completed',demo:true,created:Date.now()};
      const old=state.demoExchanges;state.demoExchanges=[...old,exchange];if(!persist()){state.demoExchanges=old;return;}
      renderTopSelling();
    }
    showReviewForm(exchange.id);
  }
  function reviewFields(target) {
    return `<section class="review-form-section"><h3>${esc(target.label)} · ${esc(target.name)}</h3><fieldset class="review-stars"><legend>${esc(target.label)} rating</legend><div class="rating-star-picker">${[1,2,3,4,5].map(value=>`<label><input type="radio" name="${target.ratingField}" value="${value}" aria-label="${value} out of 5 for ${esc(target.label)}"><span aria-hidden="true">${icon('star','rating-star')}</span><small>${value}</small></label>`).join('')}</div></fieldset><label class="form-field">Your ${target.kind==='item'?'item':target.targetRole} review<textarea name="${target.textField}" rows="3" maxlength="600" placeholder="A little detail helps the next campus connection…" required></textarea></label></section>`;
  }
  function exchangeForCurrentAccount(id) {
    const exchange=state.demoExchanges.find(entry=>entry.id===id);
    return exchange&&state.account&&[exchange.buyerAccountId,exchange.sellerAccountId].includes(state.account.id)?exchange:null;
  }
  function showReviewForm(id) {
    if(!requireAccount('account'))return;
    const exchange=exchangeForCurrentAccount(id);
    if(!exchange){feedback('error','This demo exchange is unavailable','Only the participants in this completed demo exchange can leave its reviews.');return;}
    const targets=exchangeTargets(exchange,state.account.id),existing=state.reviews.filter(review=>review.exchangeId===id&&review.authorAccountId===state.account.id);
    const missing=targets.filter(target=>!existing.some(review=>review.kind===target.kind));
    const role=state.account.id===exchange.buyerAccountId?'Buyer':'Seller';
    openModal(missing.length?'A little feedback goes a long way.':'Your feedback is already saved.',`<div class="review-demo-note"><strong>Completed demo exchange · ${role} view</strong><p>${esc(exchange.listingTitle)}<br>Buyer: ${esc(exchange.buyerName)} · Seller: ${esc(exchange.sellerName)}</p>Only your role’s review targets are available. This is not a verified purchase.</div>${missing.length?`<form id="review-form" class="review-form" novalidate><input type="hidden" name="exchangeId" value="${esc(id)}">${missing.map(reviewFields).join('')}<div id="review-status" class="status-message" role="status"></div><button class="primary-button full-width" type="submit">Save local demo review${missing.length>1?'s':''} ${icon('check')}</button></form>`:'<p class="muted">One review for each target, for each demo exchange. Returning here does not add another review.</p>'}${existing.length?reviewsHTML(existing):''}<div class="account-actions"><button class="secondary-button" data-action="open-product" data-id="${esc(exchange.listingId)}">View item</button><button class="text-button" data-action="buyer-profile" data-id="${esc(id)}">View buyer profile ${icon('arrow')}</button></div>`,'reviews');
  }
  function submitReview(form,data) {
    if(!requireAccount('account'))return;
    const exchange=exchangeForCurrentAccount(String(data.get('exchangeId')||''));
    if(!exchange||exchange.status!=='completed'||exchange.demo!==true){formError(form,'review-status','Only participants in a completed demo exchange can leave a review.');return;}
    const allTargets=exchangeTargets(exchange,state.account.id),targets=allTargets.filter(target=>!state.reviews.some(review=>review.exchangeId===exchange.id&&review.authorAccountId===state.account.id&&review.kind===target.kind));
    if(!targets.length){feedback('info','Your feedback is already saved','This completed demo exchange already has your reviews. No duplicates were added.');showReviewForm(exchange.id);return;}
    const entries=[];
    for(const target of targets){
      if(target.targetAccountId===state.account.id){formError(form,'review-status','You cannot review your own personal or linked-business identity.');return;}
      const value=String(data.get(target.ratingField)||''),text=String(data.get(target.textField)||'').trim();
      if(!/^[1-5]$/.test(value)){formError(form,'review-status',`Choose 1 to 5 stars for the ${target.label.toLowerCase()}.`,target.ratingField);return;}
      if(text.length<8){formError(form,'review-status',`Add at least 8 characters about the ${target.kind==='item'?'item':target.targetRole}.`,target.textField);return;}
      entries.push({id:`review-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,exchangeId:exchange.id,listingId:exchange.listingId,kind:target.kind,targetType:target.targetType,targetRole:target.targetRole,targetAccountId:target.targetAccountId,targetIdentityId:target.targetIdentityId,authorAccountId:state.account.id,authorName:state.account.name,rating:Number(value),text:text.slice(0,600),created:Date.now(),demo:true});
    }
    const old=state.reviews;state.reviews=[...old,...entries];if(!persist()){state.reviews=old;return;}
    render();showReviewForm(exchange.id);feedback('success','Your demo feedback is saved','Profile reputation and item ratings were updated separately on this device. No real purchase or verified review is implied.');
  }
  function showReviewBuyerPicker() {
    if(!requireAccount('review-demo-buyer'))return;
    const listings=state.listings.filter(ownsListing);
    openModal('A buyer deserves feedback, too.',`<p class="muted">Choose one of your own listings. We’ll simulate a completed exchange with <strong>${SAMPLE_BUYER.name}</strong>, an explicit sample buyer.</p>${listings.length?`<div class="linked-business-list">${listings.map(item=>`<button class="seller-profile-link" data-action="demo-exchange" data-id="${esc(item.id)}"><span class="seller-avatar">${icon('bag')}</span><span><strong>${esc(item.title)}</strong><small>Posted as ${esc(item.seller)}</small></span>${icon('arrow')}</button>`).join('')}</div>`:'<div class="empty-state compact"><h3>Start with a listing of your own.</h3><p>Seller-to-buyer feedback belongs to a listing you own.</p><button class="primary-button" data-action="sell">Create a preview listing</button></div>'}<p class="review-demo-note">No reciprocal feedback is fabricated. You leave the seller-to-buyer review yourself.</p>`,'review-buyer');
  }
  function showBuyerProfile(id) {
    if(!requireAccount('account'))return;
    const exchange=exchangeForCurrentAccount(id);
    if(!exchange){feedback('error','Buyer profile unavailable','Open a demo exchange that belongs to your current account.');return;}
    showProfile(null,false,{accountId:exchange.buyerAccountId,identityId:exchange.buyerAccountId,name:exchange.buyerName,role:exchange.buyerRole,business:false,sample:exchange.buyerAccountId===SAMPLE_BUYER.accountId});
  }

  function filteredProducts() {
    const list=allProducts().filter(item=>{
      if(state.view==='saved'&&!state.saved.includes(item.id))return false;
      if(state.view==='businesses'&&!item.business)return false;
      if(state.view==='my-listings'&&!ownsListing(item))return false;
      if(state.category!=='All'&&item.category!==state.category)return false;
      if(state.campus!=='All campuses'&&item.campus!==state.campus)return false;
      if(state.maxPrice&&item.price>state.maxPrice)return false;
      const verified=badgeTypes(item);
      if(state.badgeFilter==='any'&&!verified.length)return false;
      if(['SSM','PTU'].includes(state.badgeFilter)&&!verified.includes(state.badgeFilter))return false;
      return `${item.title} ${item.seller} ${item.category} ${item.pickup}`.toLowerCase().includes(state.search.toLowerCase());
    });
    if(state.sort==='price-low')list.sort((a,b)=>a.price-b.price);
    else if(state.sort==='price-high')list.sort((a,b)=>b.price-a.price);
    else if(state.sort==='newest')list.sort((a,b)=>(b.created||0)-(a.created||0)||a.rank-b.rank);
    return list;
  }
  function render() {
    updateAccountLabels();
    renderTopSelling();
    const grid=$('product-grid');if(!grid)return;
    const titles={marketplace:['Fresh finds, just for you','A good deal. A new connection. Something for you.'],businesses:['Made on campus. Backed by ambition.','Meet campus businesses with separate SSM and PTU badge examples.'],saved:['Your little collection','Good things to come back to. Saved on this device.'],'my-listings':['Your corner of the marketplace','Your personal and linked-business listings, under one university account.']};
    const [title,description]=titles[state.view]||titles.marketplace;
    if($('section-title')){const heading=state.search?`Finds for “${state.search}”`:state.category!=='All'?`${state.category}, made for campus`:title;$('section-title').innerHTML=`${esc(heading)}<span class="heading-spark" aria-hidden="true">${icon('spark')}</span>`;}
    if($('section-description'))$('section-description').textContent=description;
    const list=filteredProducts();
    if($('result-count'))$('result-count').textContent=`${list.length} ${list.length===1?'find':'finds'}`;
    if($('saved-count'))$('saved-count').textContent=state.saved.filter(id=>product(id)).length;
    if($('active-filter-label'))$('active-filter-label').textContent=[state.category==='All'?state.view==='businesses'?'Campus businesses':'All finds':state.category==='Food'?'Food & drinks':state.category,state.maxPrice?`Up to RM ${state.maxPrice}`:'',state.badgeFilter==='all'?'':state.badgeFilter==='any'?'Verified business':`Verified ${state.badgeFilter}`].filter(Boolean).join(' · ');
    document.querySelectorAll('.category-card').forEach(el=>{const active=el.dataset.category===state.category;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
    document.querySelectorAll('.nav-item').forEach(el=>{const active=el.dataset.action===`nav-${state.view}`;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    if($('campus-select'))$('campus-select').value=state.campus;
    if($('sort-select'))$('sort-select').value=state.sort;
    grid.innerHTML=list.length?list.map(item=>{
      const saved=state.saved.includes(item.id),verified=badges(item),sellerMetrics=profileRating(sellerSubject(item));
      return `<article class="product-card" data-action="open-product" data-id="${esc(item.id)}" tabindex="0" role="button" aria-label="View ${esc(item.title)}"><div class="product-image-wrap"><img class="product-image" src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy" decoding="async"><span class="product-tag tag-${item.category.toLowerCase()}">${esc(item.category)}</span><button class="save-button ${saved?'is-saved':''}" data-action="save" data-id="${esc(item.id)}" aria-label="${saved?'Unsave':'Save'} ${esc(item.title)}" aria-pressed="${saved}">${icon('heart')}</button>${verified?`<div class="badge-row badge-row-card">${verified}</div>`:''}</div><div class="product-body"><div class="product-seller"><span class="seller-avatar" style="background:${esc(item.avatar||'#e8dace')}">${esc(item.initials)}</span><span>${esc(item.seller)}</span><span class="seller-rating" title="Seller profile rating · sample and local demo data">${icon('star')}${sellerMetrics.count?sellerMetrics.average.toFixed(1):'—'}</span></div><h3 class="product-title">${esc(item.title)}</h3>${ratingInline(itemRating(item),'Item')}<p class="product-meta">${icon('pin')}<span>${esc(item.pickup)}</span></p><div class="product-bottom"><span class="product-price">${money(item.price)}<small>${esc(item.unit||'')}</small></span><span class="product-condition">${esc(item.condition)}</span></div><span class="identity-type-label">${item.business?'Business seller':'Individual seller'}${!item.sample?' · Local preview':''}</span></div></article>`;
    }).join(''):`<div class="empty-state">${icon(state.view==='saved'?'heart':'bag')}<h3>${state.view==='saved'?'Good finds deserve a little heart.':state.view==='my-listings'?'Your first listing starts here.':'No finds just yet.'}</h3><p>${state.view==='saved'?'Tap the heart on a listing to keep it here.':state.view==='my-listings'?'Post as yourself or a business linked to your university account.':'Try a different search, category, campus or badge filter.'}</p><button class="primary-button" data-action="${state.view==='my-listings'?'sell':'clear-filters'}">${state.view==='my-listings'?'Create a listing':'Explore all finds'} ${icon('arrow')}</button></div>`;
  }
  function closeModal(restore=true) {
    if($('modal-root'))$('modal-root').innerHTML='';
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.sidebar, .app-shell').forEach(surface=>{surface.inert=false;});
    if(restore&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  }
  function openModal(title,content,type='',wide=false) {
    const root=$('modal-root');if(!root)return;
    if(!root.children.length)previousFocus=document.activeElement;
    document.body.classList.remove('nav-open');
    document.querySelectorAll('[data-action="toggle-mobile-nav"]').forEach(button=>button.setAttribute('aria-expanded','false'));
    document.querySelectorAll('.sidebar, .app-shell').forEach(surface=>{surface.inert=true;});
    root.innerHTML=`<div class="modal-overlay" data-action="close-overlay"><section class="modal-panel ${wide?'modal-wide':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><header class="modal-header"><h2 id="modal-title">${esc(title)}</h2><button class="modal-close" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></header><div class="modal-content">${content}</div></section></div>`;
    document.body.classList.add('modal-open');
    if(type==='profile')syncCardFaceAccessibility();
    requestAnimationFrame(()=>{const first=root.querySelector('[autofocus]')||root.querySelector('.modal-content input:not([type="hidden"]), .modal-content select, .modal-content textarea')||root.querySelector('.modal-content button')||root.querySelector('.modal-close');first?.focus({preventScroll:true});});
  }
  function syncCardFaceAccessibility() {
    const card=$('campus-card');if(!card)return;
    const flipped=card.classList.contains('is-flipped');
    card.querySelector('.card-front')?.setAttribute('aria-hidden',String(flipped));
    card.querySelector('.card-back')?.setAttribute('aria-hidden',String(!flipped));
    const button=$('modal-root')?.querySelector('[data-action="flip-card"]');
    button?.setAttribute('aria-pressed',String(flipped));button?.setAttribute('aria-label',flipped?'Show front of campus card':'Show back of campus card');
  }
  function requireAccount(action,id) {
    if(state.account)return true;
    pendingIntent={action,id};showLogin();
    feedback('info','Your university account comes first','Enter a local account preview to try personal and business features. Real university authentication is not connected.');
    return false;
  }
  function showLogin() {
    loginCandidate=null;
    openModal('One university account. Your whole campus.',`<div class="login-intro"><span class="modal-feature-icon">${icon('shield')}</span><p>Students and staff use their own university email. Link your businesses after entering your personal account preview.</p></div><form id="login-form" novalidate><label class="form-field">Your name<input name="name" maxlength="80" placeholder="How should the campus know you?" autocomplete="name" required autofocus></label><label class="form-field">University email<input name="email" type="email" placeholder="you@student.uthm.edu.my" autocomplete="email" required></label><div class="email-domains"><span>Students<strong>@student.uthm.edu.my</strong></span><span>Staff & lecturers<strong>@uthm.edu.my</strong></span></div><div id="login-status" class="status-message" role="status"></div><button class="secondary-button full-width" type="submit">Check campus email ${icon('arrow')}</button><button class="primary-button full-width" id="enter-account-preview" data-action="enter-account-preview" type="button" hidden>Enter account preview ${icon('arrow')}</button></form><div class="preview-callout"><strong>A local preview, with your own identity.</strong><p>University sign-in is not connected. Your name and email stay in this browser. No email is sent, and no university account is verified or created.</p><button class="text-button" data-action="sample-profile">Explore the sample 3D card ${icon('arrow')}</button></div>`,'login');
  }
  function loginValues(form) {
    const data=new FormData(form),name=String(data.get('name')||'').trim(),email=String(data.get('email')||'').trim().toLowerCase(),role=classifyEmail(email);
    if(!name){formError(form,'login-status','Add your name to enter your personal account preview.','name');return null;}
    if(!role){formError(form,'login-status','Use your exact @student.uthm.edu.my or @uthm.edu.my university email.','email');return null;}
    form.elements?.name?.removeAttribute('aria-invalid');form.elements?.email?.removeAttribute('aria-invalid');
    return {id:'preview:'+email,email,name:name.slice(0,80),role};
  }
  function enterAccountPreview() {
    const form=$('login-form');if(!form)return;
    const candidate=loginValues(form);if(!candidate)return;
    if(!loginCandidate||candidate.email!==loginCandidate.email||candidate.name!==loginCandidate.name){formError(form,'login-status','Check your campus email first, then enter the account preview.','email');return;}
    const previous=state.account;state.account=candidate;
    if(!persist()){state.account=previous;return;}
    loginCandidate=null;state.activeChat=null;render();
    feedback('success','Your account preview is ready',`Welcome, ${candidate.name}. You’re exploring a local ${candidate.role.toLowerCase()} identity; real authentication is still pending.`);
    const intent=pendingIntent;pendingIntent=null;
    if(intent)onAction(intent.action,{dataset:{id:intent.id}},{});else showAccount();
  }
  function accountExchangeControlsHTML() {
    if(!state.account)return '';
    const exchanges=state.demoExchanges.filter(exchange=>[exchange.buyerAccountId,exchange.sellerAccountId].includes(state.account.id));
    return `<section class="review-section"><h3>Your demo exchanges</h3>${exchanges.length?`<div class="linked-business-list">${[...exchanges].reverse().map(exchange=>{const buyer=exchange.buyerAccountId===state.account.id;return `<button class="seller-profile-link" data-action="review-exchange" data-id="${esc(exchange.id)}"><span class="seller-avatar">${icon('star')}</span><span><strong>${esc(exchange.listingTitle)}</strong><small>${buyer?'Buyer':'Seller'} view · ${esc(buyer?exchange.sellerName:exchange.buyerName)} · Completed demo</small></span>${icon('arrow')}</button>`;}).join('')}</div>`:'<p class="rating-empty">Try a completed demo exchange from a listing to explore feedback in either role.</p>'}<p class="review-demo-note">Only exchanges involving this university account appear here. Participants can leave their own role’s reviews, including feedback to another local preview account.</p></section>`;
  }
  function showAccount() {
    if(!requireAccount('account'))return;
    const account=state.account,identity=currentIdentity(),businesses=ownedBusinesses();
    const unassigned=state.listings.filter(item=>!item.ownerAccountId).length;
    openModal('One account. Every side of you.',`<div class="account-intro"><span class="account-avatar">${esc(initials(account.name))}</span><div class="account-details"><h3>${esc(account.name)}</h3><span class="pill">${esc(account.role)} · Personal account</span><p class="account-email">${esc(account.email)}</p></div></div>${profileReputationHTML({accountId:account.id,identityId:account.id,name:account.name,business:false})}<div class="preview-callout compact"><strong>Local account preview</strong><br>Email format is recognised; university authentication is not connected. Nothing has been sent or verified.</div><div class="identity-summary"><span class="identity-kind">CURRENT POSTING IDENTITY</span><strong>${esc(identity.name)}</strong><small>${identity.type==='business'?'Linked business':'Personal · '+esc(account.role)}</small><button class="text-button" data-action="switch-identity">Switch identity ${icon('flip')}</button></div><div class="account-section-heading"><h3>Linked businesses <span>${businesses.length}</span></h3><button class="text-button" data-action="link-business">${icon('bag')} Link a business</button></div><div class="linked-business-list">${businesses.length?businesses.map(business=>`<article class="linked-business-card"><div class="linked-business-title"><span class="seller-avatar">${esc(initials(business.name))}</span><div><strong>${esc(business.name)}</strong><small>Linked to your university account</small></div></div><div class="linked-status-row">${pendingBadges(business)}</div><button class="text-button" data-action="select-identity" data-id="${esc(business.id)}">${identity.id===business.id?'Currently selected':'Post as this business'} ${icon('arrow')}</button></article>`).join(''):'<div class="empty-state compact"><p>Your personal account can link multiple businesses. Keep one login and choose who you post as.</p></div>'}</div>${unassigned?`<p class="preview-note">${unassigned} earlier device preview listing(s) have been retained without assigning account ownership or verification.</p>`:''}${accountExchangeControlsHTML()}<div class="account-actions"><button class="secondary-button" data-action="review-demo-buyer">${icon('star')} Review a demo buyer</button><button class="secondary-button" data-action="profile">${icon('spark')} My 3D card</button><button class="primary-button" data-action="sell">Create a listing ${icon('arrow')}</button></div><button class="text-button danger" data-action="signout-preview">Sign out of this preview</button>`,'account');
  }
  function showIdentitySwitcher() {
    if(!requireAccount('switch-identity'))return;
    const selected=currentIdentity(),personal=identityFor('personal'),businesses=ownedBusinesses();
    const choices=[personal,...businesses.map(b=>identityFor(b.id))];
    openModal('Who are you posting as?',`<p class="muted">One university account. Choose your personal identity or one of your linked businesses. Existing listings keep the identity they were posted with.</p><form id="identity-form"><div id="identity-status" class="status-message" role="status"></div><div class="linked-business-list">${choices.map(identity=>`<label class="identity-option ${selected.id===identity.id?'is-selected':''}"><input type="radio" name="identity" value="${esc(identity.id)}" ${selected.id===identity.id?'checked':''}><span class="seller-avatar">${esc(identity.initials)}</span><span class="identity-option-copy"><strong>${esc(identity.name)}</strong><small>${identity.type==='personal'?esc(state.account.role)+' · Personal account':'Linked business'}</small>${identity.type==='business'?`<span class="linked-status-row">${pendingBadges(ownedBusinesses().find(b=>b.id===identity.id))}</span>`:''}</span></label>`).join('')}</div><button class="primary-button full-width" type="submit">Use this posting identity ${icon('check')}</button></form><button class="text-button" data-action="link-business">${icon('bag')} Link another business</button>`,'identity');
  }
  function selectIdentity(value) {
    if(!state.account)return false;
    const identity=identityFor(value);if(!identity){feedback('error','That posting identity is unavailable','Choose your personal identity or a business linked to this university account.');return false;}
    const old=state.postingByAccount[state.account.id];state.postingByAccount[state.account.id]=identity.id;
    if(!persist()){state.postingByAccount[state.account.id]=old;return false;}
    render();feedback('success','Posting identity updated',`Your next listing will use ${identity.name}. Existing listings keep their original seller identity.`);return true;
  }
  function showBusinessForm() {
    if(!requireAccount('link-business'))return;
    openModal('Your businesses. One university account.',`<p class="muted">Link a business to <strong>${esc(state.account.name)}</strong>. Choose the registrations you want reviewed independently.</p><div class="preview-callout compact">Local preview only. Linking saves a pending request on this device; it does not verify a registration or submit documents anywhere.</div><form id="business-form" novalidate><label class="form-field">Business name<input name="businessName" maxlength="80" placeholder="Your campus business" required autofocus></label><div class="linked-registration-option"><label class="checkbox-field"><input name="requestSSM" type="checkbox"><span>Request an SSM badge<small>A separate review for the Verified SSM badge.</small></span></label><label class="form-field linked-reference">SSM registration reference<input name="ssmReference" maxlength="100" placeholder="Required if requesting SSM review"></label></div><div class="linked-registration-option"><label class="checkbox-field"><input name="requestPTU" type="checkbox"><span>Request a PTU badge<small>A separate review for the Verified PTU badge.</small></span></label><label class="form-field linked-reference">PTU registration reference<input name="ptuReference" maxlength="100" placeholder="Required if requesting PTU review"></label></div><label class="checkbox-field"><input name="useIdentity" type="checkbox" checked><span>Use this business for my next listing</span></label><div id="business-status" class="status-message" role="status"></div><button class="primary-button full-width" type="submit">Link business in preview ${icon('arrow')}</button></form>`,'business');
  }
  function showSell() {
    if(!requireAccount('sell'))return;
    const selected=currentIdentity(),choices=[identityFor('personal'),...ownedBusinesses().map(b=>identityFor(b.id))];
    openModal('Got something good?',`<p class="muted">Make room, share a skill, or feed a hungry campus.</p><div class="preview-callout compact">Local preview · your listing stays on this device. Choose a seller identity below; your university account owns every linked listing.</div><form id="listing-form"><label class="form-field">Post as<select name="postingIdentity" id="posting-identity">${choices.map(identity=>`<option value="${esc(identity.id)}" ${selected.id===identity.id?'selected':''}>${esc(identity.name)} — ${identity.type==='personal'?'Personal':'Business'}</option>`).join('')}</select></label><p class="preview-note">Businesses awaiting review can be previewed here, but receive no verified badges.</p><label class="form-field">Listing title<input name="title" maxlength="80" placeholder="e.g. Homemade brownies, fresh from the oven" required></label><div class="form-grid"><label class="form-field">Category<select name="category">${categories.filter(x=>x!=='All').map(x=>`<option>${x}</option>`).join('')}</select></label><label class="form-field">Price (RM)<input name="price" type="number" step="0.01" min="0" max="100000" placeholder="0.00" required></label><label class="form-field">Campus<select name="campus"><option>Parit Raja</option><option>Pagoh</option></select></label><label class="form-field">Condition / availability<input name="condition" maxlength="35" placeholder="e.g. Like new, made fresh" required></label></div><label class="form-field">Pickup or delivery location<input name="pickup" maxlength="80" placeholder="A convenient spot on campus" required></label><label class="form-field">A little more about it<textarea name="description" rows="3" minlength="12" maxlength="1200" placeholder="Tell the campus what makes your find special…" required></textarea></label><label class="form-field">Photo <span class="muted">optional · JPG, PNG or WebP, up to 2 MB</span><input name="photo" type="file" accept="image/jpeg,image/png,image/webp"></label><div id="listing-status" class="status-message" role="status"></div><button class="primary-button full-width" type="submit">Save preview listing ${icon('arrow')}</button></form>`,'sell');
  }
  function showDetail(id) {
    const item=product(id);if(!item)return;
    const saved=state.saved.includes(id),verified=badges(item),business=state.businesses.find(b=>b.id===item.businessId),sellerMetrics=profileRating(sellerSubject(item));
    openModal(item.title,`<div class="detail-layout"><img class="detail-image" src="${esc(item.image)}" alt="${esc(item.title)}"><div class="detail-copy"><span class="pill tag-${item.category.toLowerCase()}">${esc(item.category)}</span><p class="detail-price">${money(item.price)}<small>${esc(item.unit||'')}</small></p>${ratingInline(itemRating(item),'Item')}<div class="badge-row">${verified}</div>${business?`<div class="linked-status-row">${pendingBadges(business)}</div>`:''}<p class="detail-description">${esc(item.description)}</p><div class="detail-facts"><p>${icon('pin')} ${esc(item.pickup)}</p><p>${icon('check')} ${esc(item.condition)}</p></div><button class="seller-profile-link" data-action="seller-profile" data-id="${esc(id)}"><span class="seller-avatar" style="background:${esc(item.avatar||'#e8dace')}">${esc(item.initials)}</span><span><strong>${esc(item.seller)}</strong><small>${item.business?'Business seller':'Individual seller'} · Profile ${sellerMetrics.count?sellerMetrics.average.toFixed(1)+' / 5':'has no reviews yet'} · ${item.sample?'Sample profile':'Local preview'}</small></span>${icon('arrow')}</button><div class="detail-actions"><button class="primary-button" data-action="message-seller" data-id="${esc(id)}">${icon('chat')} Message seller</button><button class="secondary-button ${saved?'is-saved':''}" data-action="save-detail" data-id="${esc(id)}" aria-pressed="${saved}">${icon('heart')} ${saved?'Saved':'Save'}</button></div><button class="text-button" data-action="demo-exchange" data-id="${esc(id)}">${icon('star')} ${ownsListing(item)?'Try a completed demo exchange · review a buyer':'Try a completed demo exchange · review item & seller'}</button>${ownsListing(item)?`<button class="text-button danger" data-action="delete-listing" data-id="${esc(id)}">${icon('trash')} Remove my preview listing</button>`:''}<p class="preview-note">${item.sample?'Sample listing, ratings and badge examples · no live registration or purchase is implied.':'Local preview listing · seller identity is retained from when this listing was posted.'}</p></div></div>${productReviewsHTML(item)}`,'detail',true);
  }
  function showProfile(sellerId,forceSample=false,buyerSubject=null) {
    const item=sellerId?product(sellerId):null;
    const identity=!item&&!forceSample&&!buyerSubject?currentIdentity():null;
    const guest=!item&&!identity&&!buyerSubject;
    const isSample=guest||!!item?.sample||!!buyerSubject?.sample;
    const business=!!item?.business||identity?.type==='business';
    const name=buyerSubject?.name||item?.seller||identity?.name||'Aiman Hakimi';
    const letters=buyerSubject?initials(buyerSubject.name):item?.initials||identity?.initials||'AH';
    const personalRole=buyerSubject?.role|| (identity?state.account.role:item?.sample?'Student':item?.sellerRole||'Student');
    const role=business?'LINKED BUSINESS':guest?'SAMPLE STUDENT':personalRole.toUpperCase()+(item?.sample?' · SAMPLE':'');
    const subtitle=buyerSubject?'Campus buyer · local demo':business?'Business identity · same university account':identity?state.account.email:item?'UTHM community · '+personalRole:'Faculty of Computer Science & IT';
    const businessRecord=business&&identity?ownedBusinesses().find(b=>b.id===identity.id):null;
    const cardBadges=item?badges(item):'';
    const subject=buyerSubject||(item?sellerSubject(item):identity?{accountId:state.account.id,identityId:identity.type==='business'?identity.id:state.account.id,name:identity.name,business:identity.type==='business',role:state.account.role}:{accountId:'sample-profile:aiman',identityId:'sample-profile:aiman',name,business:false});
    const reputation=profileRating(subject);
    openModal(buyerSubject?'A little trust, both ways.':item?'Meet your campus neighbour':'Your campus identity, with dimension.',`<div class="profile-preview"><span class="pill preview-pill">${item?item.sample?'Sample seller profile':'Local seller preview':buyerSubject?buyerSubject.sample?'Sample buyer profile':'Buyer profile':guest?'Sample campus card':business?'Your linked business card':'Your personal campus card'}</span><p class="muted">Move your cursor over the card and give it a flip.<br>${identity?'One university account. Your personal and business identities.':'A little personality. A real sense of belonging.'}</p><div class="campus-card-stage"><div class="campus-card card-${state.cardColor}" id="campus-card"><div class="card-front" aria-hidden="false"><div class="campus-card-top"><span class="card-logo">p<span>${icon('spark')}</span></span><span class="card-campus">UTHM<br>COMMUNITY</span></div><div class="card-orb"></div><span class="card-role">${icon(business?'bag':'spark')}${esc(role)}</span><div class="card-person"><span class="card-avatar">${esc(letters)}</span><div><h3>${esc(name)}</h3><p>${esc(subtitle)}</p></div></div><div class="campus-card-bottom"><span>PASOR / ${business?'BUSINESS':'PERSONAL'} CARD</span><span>${isSample?'SAMPLE':'LOCAL PREVIEW'}</span></div></div><div class="card-back" aria-hidden="true"><span class="card-logo">p<span>${icon('spark')}</span></span><h3>Your campus.<br>Your next connection.</h3><p>${business?'A business identity linked to a personal university account. SSM and PTU badges are reviewed separately.':'A place for what you make, what you know, and what comes next.'}</p><span class="card-back-label">${isSample?'SAMPLE CARD':'LOCAL PREVIEW'} · NOT A VERIFIED ID</span></div></div></div><div class="card-controls"><div class="color-options" aria-label="Card colour">${['burgundy','forest','navy'].map(color=>`<button class="color-swatch ${color} ${state.cardColor===color?'selected':''}" data-action="card-color" data-color="${color}" aria-label="${color} card" aria-pressed="${state.cardColor===color}"></button>`).join('')}</div><button class="text-button" data-action="flip-card" aria-pressed="false">${icon('flip')} Flip card</button></div>${cardBadges?`<div class="badge-row">${cardBadges}</div>`:''}${businessRecord?`<div class="linked-status-row">${pendingBadges(businessRecord)}</div>`:''}<div class="profile-stats"><div><strong>${business?'Business':esc(personalRole)}</strong><span>${guest?'Sample identity':business?'Linked identity':'Personal account'}</span></div><div><strong>${esc(item?.campus||'UTHM')}</strong><span>Community</span></div><div><strong>${reputation.count?reputation.average.toFixed(1):'—'}</strong><span>Profile rating</span></div></div>${profileReputationHTML(subject)}<p class="preview-note">${isSample?'This is a sample identity.':'This is your local preview identity.'} Real authentication and registration reviews are not connected.</p>${identity?'<div class="account-actions"><button class="secondary-button" data-action="switch-identity">Switch identity</button><button class="primary-button" data-action="account">Manage account '+icon('arrow')+'</button></div>':'<button class="primary-button full-width" data-action="account">Explore your own account '+icon('arrow')+'</button>'}</div>`,'profile');
  }
  function showPerks() {
    openModal('Two badges. One connected business.',`<div class="perks-intro"><span class="business-badge-large">${icon('shield')}</span><span class="pill">SSM + PTU · SEPARATE REVIEWS</span><h3>Campus roots.<br>Business ambitions.</h3><p class="muted">Keep your personal university login. Link your businesses and request each registration badge independently.</p></div><div class="perk-list"><div>${icon('shield')}<span><strong><span class="verification-badge badge-ssm">Verified SSM</span></strong><small>An SSM registration badge after its own review. It does not grant a PTU badge.</small></span></div><div>${icon('shield')}<span><strong><span class="verification-badge badge-ptu">Verified PTU</span></strong><small>A PTU registration badge after its own review. It does not grant an SSM badge.</small></span></div><div>${icon('bag')}<span><strong>Your businesses, under one account</strong><small>Link more than one business and choose your identity when posting.</small></span></div><div>${icon('spark')}<span><strong>Proposed business perks</strong><small>A dedicated storefront, relevant featured placements and seller insights after the programme is connected.</small></span></div></div><p class="preview-note">Badge examples above describe the proposed experience. Local requests remain pending; this preview does not verify registrations or award real perks.</p><button class="primary-button full-width" data-action="link-business">Link a business ${icon('arrow')}</button>`,'perks');
  }
  function showFilters() {
    openModal('Find your kind of good.',`<form id="filters-form"><label class="form-field">Campus<select name="campus">${['All campuses','Parit Raja','Pagoh'].map(x=>`<option ${state.campus===x?'selected':''}>${x}</option>`).join('')}</select></label><label class="form-field">Budget<select name="maxPrice"><option value="0">Any price</option>${[20,50,100,500].map(x=>`<option value="${x}" ${state.maxPrice===x?'selected':''}>Up to RM ${x}</option>`).join('')}</select></label><label class="form-field">Business badge<select name="badgeFilter"><option value="all">All sellers</option><option value="any" ${state.badgeFilter==='any'?'selected':''}>Any verified business badge</option><option value="SSM" ${state.badgeFilter==='SSM'?'selected':''}>Verified SSM</option><option value="PTU" ${state.badgeFilter==='PTU'?'selected':''}>Verified PTU</option></select></label><p class="preview-note">Sample inventory illustrates each badge independently. Pending linked businesses have no verified badges.</p><div class="modal-actions"><button class="secondary-button" type="button" data-action="reset-filter-modal">Reset</button><button class="primary-button" type="submit">Show matching finds ${icon('arrow')}</button></div></form>`,'filters');
  }
  function conversations() {
    if(!state.account)return {};
    const current=state.conversationsByAccount[state.account.id];
    if(!current||typeof current!=='object'||Array.isArray(current))state.conversationsByAccount[state.account.id]={};
    return state.conversationsByAccount[state.account.id];
  }
  function showMessages(id) {
    if(!requireAccount(id?'message-seller':'nav-messages',id))return;
    const selected=id?product(id):null,threads=conversations();
    if(!selected){
      const ids=Object.keys(threads).filter(key=>product(key));
      openModal('Good things start with hello.',`<div class="messages-intro">${icon('chat')}<p class="muted">Your personal university account keeps conversations together.</p></div>${ids.length?`<div class="conversation-list">${ids.map(key=>{const item=product(key);return `<button class="seller-profile-link" data-action="message-seller" data-id="${esc(key)}"><span class="seller-avatar">${esc(item.initials)}</span><span><strong>${esc(item.seller)}</strong><small>${esc(item.title)}</small></span>${icon('arrow')}</button>`;}).join('')}</div>`:'<div class="empty-state compact"><h3>Your inbox is a fresh start.</h3><p>Open a listing and choose Message seller to try a conversation.</p><button class="primary-button" data-action="explore-from-modal">Explore marketplace '+icon('arrow')+'</button></div>'}<p class="preview-note">Local demo conversations for ${esc(state.account.name)}. No messages are delivered.</p>`,'messages');return;
    }
    state.activeChat=selected.id;
    const messages=Array.isArray(threads[selected.id])?threads[selected.id]:[];
    openModal(`Chat with ${selected.seller}`,`<button class="text-button" data-action="nav-messages">All messages</button><div class="chat-listing"><img src="${esc(selected.image)}" alt=""><span><strong>${esc(selected.title)}</strong><small>${money(selected.price)}${esc(selected.unit||'')}</small></span></div><p class="chat-demo-label">Demo conversation · stays on this device · not delivered</p><div class="chat-messages" id="chat-messages" aria-live="polite">${messages.length?messages.map(message=>`<div class="chat-bubble outgoing">${esc(message.text)}<small>Local preview · ${esc(message.time)}</small></div>`).join(''):'<div class="chat-start">Say hello! Ask a question about this find or suggest a pickup time.</div>'}</div><div id="message-status" class="status-message" role="status"></div><form id="message-form" class="message-form"><input name="message" aria-label="Message" placeholder="Say hello to your campus neighbour…" maxlength="1000" autocomplete="off" required><button class="primary-button" aria-label="Save demo message" type="submit">${icon('arrow')}</button></form>`,'chat');
    requestAnimationFrame(()=>{if($('chat-messages'))$('chat-messages').scrollTop=$('chat-messages').scrollHeight;});
  }
  function showHow() {
    openModal('Your campus, a little closer.',`<div class="how-steps"><div><span>01</span><h3>One university account.</h3><p>Students use @student.uthm.edu.my; staff and lecturers use @uthm.edu.my. Real sign-in will be connected after this preview.</p></div><div><span>02</span><h3>Choose who you post as.</h3><p>Sell as yourself or link businesses to the same personal account. Each listing remembers the seller identity you chose.</p></div><div><span>03</span><h3>Make a campus connection.</h3><p>Find food, preloved treasures, services and rentals. Message, arrange a campus pickup and give a good find its next chapter.</p></div></div><div class="preview-callout"><strong>Two independent business badges.</strong><p>Verified SSM and Verified PTU have separate review requests. A pending request never awards a badge.</p></div><button class="primary-button full-width" data-action="explore-from-modal">Find something good ${icon('arrow')}</button>`,'how');
  }
  function showNotifications() {
    openModal('A little campus catch-up.',`<span class="pill preview-pill">Sample updates</span><div class="notification-list"><div>${icon('spark')}<span><strong>One campus. One personal account.</strong><p>Your university email brings your personal and linked-business identities together.</p></span></div><div>${icon('shield')}<span><strong>Two badges, reviewed separately</strong><p>Explore independent Verified SSM and Verified PTU badge examples.</p></span></div><div>${icon('heart')}<span><strong>Your next good find is waiting</strong><p>Save a listing to build your own little collection.</p></span></div></div><p class="preview-note">Illustrative preview updates. No live account or registration activity is implied.</p>`,'notifications');
  }
  function setView(view) {
    if(view==='my-listings'&&!requireAccount('nav-my-listings'))return;
    state.view=view;state.category='All';state.search='';state.maxPrice=0;state.badgeFilter='all';
    if($('search-input'))$('search-input').value='';
    document.body.classList.remove('nav-open');document.querySelectorAll('[data-action="toggle-mobile-nav"]').forEach(button=>button.setAttribute('aria-expanded','false'));
    render();if(view!=='marketplace')$('section-title')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function saveItem(id) {
    if(!product(id))return;
    const old=state.saved;state.saved=old.includes(id)?old.filter(x=>x!==id):[...old,id];
    if(!persist()){state.saved=old;return;}
    render();toast(state.saved.includes(id)?'A good find, kept for later.':'Removed from your saved finds.');
  }
  function signOut() {
    state.account=null;state.activeChat=null;pendingIntent=null;loginCandidate=null;
    persist();closeModal(false);state.campus='All campuses';setView('marketplace');
    feedback('info','Signed out of the account preview','Your device keeps its local listings and linked-business drafts. Personal actions need an account preview again.');
  }
  function onAction(action,el,event) {
    const id=el.dataset.id;
    if(action==='dismiss-validation'){clearTimeout(validationTimer);if($('validation-root'))$('validation-root').innerHTML='';return;}
    if(action==='close-overlay'){if(event.target===el)closeModal();return;}
    if(action==='close-modal')return closeModal();
    if(action==='open-product')return showDetail(id);
    if(action==='save'||action==='save-detail'){saveItem(id);if(action==='save-detail')showDetail(id);return;}
    if(action==='demo-exchange')return showDemoExchange(id);
    if(action==='complete-demo-exchange')return completeDemoExchange(id,el.dataset.role);
    if(action==='review-demo-buyer')return showReviewBuyerPicker();
    if(action==='buyer-profile')return showBuyerProfile(id);
    if(action==='review-exchange')return showReviewForm(id);
    if(action==='sell')return showSell();
    if(action==='login'){pendingIntent=null;return state.account?showAccount():showLogin();}
    if(action==='enter-account-preview')return enterAccountPreview();
    if(['account','nav-account','manage-businesses'].includes(action))return showAccount();
    if(action==='switch-identity')return showIdentitySwitcher();
    if(action==='select-identity'){if(!requireAccount('switch-identity'))return;if(selectIdentity(id))showAccount();return;}
    if(action==='signout-preview')return signOut();
    if(action==='profile')return showProfile();
    if(action==='sample-profile')return showProfile(null,true);
    if(action==='seller-profile')return showProfile(id);
    if(action==='perks')return showPerks();
    if(['business-apply','link-business'].includes(action))return showBusinessForm();
    if(action==='how-it-works')return showHow();
    if(action==='notifications')return showNotifications();
    if(action==='nav-messages')return showMessages();
    if(action==='message-seller')return showMessages(id);
    if(action==='filters')return showFilters();
    if(action==='toggle-mobile-nav'){document.body.classList.toggle('nav-open');el.setAttribute('aria-expanded',String(document.body.classList.contains('nav-open')));return;}
    if(action==='flip-card'){$('campus-card')?.classList.toggle('is-flipped');syncCardFaceAccessibility();return;}
    if(action==='card-color'){
      if(!requireAccount('profile'))return;
      if(!['burgundy','forest','navy'].includes(el.dataset.color))return;
      state.cardColor=el.dataset.color;if(!persist())return;
      const card=$('campus-card');if(card){card.classList.remove('card-burgundy','card-forest','card-navy');card.classList.add(`card-${state.cardColor}`);}
      document.querySelectorAll('.color-swatch').forEach(swatch=>{const selected=swatch.dataset.color===state.cardColor;swatch.classList.toggle('selected',selected);swatch.setAttribute('aria-pressed',String(selected));});return;
    }
    if(action==='reset-filter-modal'){state.campus='All campuses';state.maxPrice=0;state.badgeFilter='all';render();showFilters();return;}
    if(action==='clear-filters'||action==='explore-from-modal'){closeModal();state.campus='All campuses';setView('marketplace');return;}
    if(action==='delete-listing'){
      if(!requireAccount('nav-my-listings'))return;const item=product(id);if(!ownsListing(item))return;
      const old=state.listings,oldSaved=state.saved;state.listings=old.filter(x=>x.id!==id);state.saved=oldSaved.filter(x=>x!==id);
      if(!persist()){state.listings=old;state.saved=oldSaved;return;}
      closeModal();render();feedback('success','Preview listing removed','The listing was removed from this device.');return;
    }
    if(['nav-marketplace','nav-businesses','nav-saved','nav-my-listings'].includes(action))return setView(action.slice(4));
  }
  function fileAsDataURL(file) {
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('The photo could not be read. Please choose another.'));reader.readAsDataURL(file);});
  }
  async function submitForm(event) {
    const form=event.target;
    if(!['login-form','identity-form','listing-form','business-form','filters-form','message-form','review-form'].includes(form.id))return;
    event.preventDefault();
    const data=new FormData(form);
    if(form.id==='review-form'){submitReview(form,data);return;}
    if(form.id==='login-form'){
      const candidate=loginValues(form);if(!candidate)return;
      loginCandidate=candidate;const status=$('login-status');if(status){status.className='status-message success';status.textContent=`${candidate.role} email format recognised. Continue explicitly into the local preview below. This is not university authentication.`;}
      if($('enter-account-preview'))$('enter-account-preview').hidden=false;
      feedback('success','Campus email recognised',`The address matches the ${candidate.role.toLowerCase()} domain. Enter the local preview to continue; no verification email was sent.`);return;
    }
    if(!form.reportValidity())return;
    if(form.id==='filters-form'){
      state.campus=['All campuses','Parit Raja','Pagoh'].includes(String(data.get('campus')))?String(data.get('campus')):'All campuses';
      state.maxPrice=[0,20,50,100,500].includes(Number(data.get('maxPrice')))?Number(data.get('maxPrice')):0;
      state.badgeFilter=['all','any','SSM','PTU'].includes(String(data.get('badgeFilter')))?String(data.get('badgeFilter')):'all';closeModal();render();return;
    }
    if(!requireAccount(form.id==='listing-form'?'sell':form.id==='business-form'?'link-business':form.id==='message-form'?'nav-messages':'switch-identity'))return;
    if(form.id==='identity-form'){if(selectIdentity(String(data.get('identity'))))showAccount();else formError(form,'identity-status','Choose one of your own linked identities.','identity');return;}
    if(form.id==='business-form'){
      const name=String(data.get('businessName')||'').trim(),ssm=data.get('requestSSM')==='on',ptu=data.get('requestPTU')==='on',ssmReference=String(data.get('ssmReference')||'').trim(),ptuReference=String(data.get('ptuReference')||'').trim();
      if(!name){formError(form,'business-status','Add a business name.','businessName');return;}
      if(!ssm&&!ptu){formError(form,'business-status','Choose SSM review, PTU review, or both. Each badge is independent.','requestSSM');return;}
      if(ssm&&!ssmReference){formError(form,'business-status','Add the SSM registration reference for your SSM review request.','ssmReference');return;}
      if(ptu&&!ptuReference){formError(form,'business-status','Add the PTU registration reference for your PTU review request.','ptuReference');return;}
      if(ownedBusinesses().some(b=>b.name.toLowerCase()===name.toLowerCase())){formError(form,'business-status','You already linked a business with this name. Choose it from your identity switcher.','businessName');return;}
      const requests={};if(ssm)requests.ssm={reference:ssmReference.slice(0,100),status:'pending'};if(ptu)requests.ptu={reference:ptuReference.slice(0,100),status:'pending'};
      const business={id:`business-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,ownerAccountId:state.account.id,name:name.slice(0,80),requests,created:Date.now()};
      const old=state.businesses,oldIdentity=state.postingByAccount[state.account.id];state.businesses=[...old,business];
      if(data.get('useIdentity')==='on')state.postingByAccount[state.account.id]=business.id;
      if(!persist()){state.businesses=old;state.postingByAccount[state.account.id]=oldIdentity;return;}
      render();showAccount();feedback('info','Business linked. Reviews are pending.',`${business.name} is linked to your local account. ${ssm&&ptu?'SSM and PTU reviews are':ssm?'SSM review is':'PTU review is'} pending; no verified badge has been awarded.`);return;
    }
    if(form.id==='message-form'){
      const text=String(data.get('message')||'').trim();if(!text){formError(form,'message-status','Write a message before saving the local conversation.','message');return;}
      if(!state.activeChat||!product(state.activeChat))return;
      const threads=conversations(),old=threads[state.activeChat],messages=Array.isArray(old)?old:[];
      threads[state.activeChat]=[...messages,{text:text.slice(0,1000),time:new Date().toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'})}].slice(-100);
      if(!persist()){if(old)threads[state.activeChat]=old;else delete threads[state.activeChat];return;}
      showMessages(state.activeChat);feedback('success','Demo message saved','Your message stays in this account preview on this device. It was not delivered to a seller.');return;
    }
    if(form.id==='listing-form'){
      const status=$('listing-status'),submit=form.querySelector('[type="submit"]');
      const title=String(data.get('title')||'').trim(),description=String(data.get('description')||'').trim(),price=Number(data.get('price')),category=String(data.get('category')),pickup=String(data.get('pickup')||'').trim(),condition=String(data.get('condition')||'').trim(),identity=identityFor(String(data.get('postingIdentity')));
      if(!identity){formError(form,'listing-status','Choose your personal identity or one of your own linked businesses.','postingIdentity');return;}
      if(!title){formError(form,'listing-status','Give your listing a title.','title');return;}
      if(!Number.isFinite(price)||price<0||price>100000||String(data.get('price')||'').trim()===''){formError(form,'listing-status','Use a price from RM 0 to RM 100,000.','price');return;}
      if(!categories.includes(category)||category==='All'){formError(form,'listing-status','Choose a marketplace category.','category');return;}
      if(!condition){formError(form,'listing-status','Add a condition or availability note.','condition');return;}
      if(!pickup){formError(form,'listing-status','Add a campus pickup or delivery location.','pickup');return;}
      if(description.length<12){formError(form,'listing-status','Add a description of at least 12 characters.','description');return;}
      const photo=data.get('photo');let image=`assets/${({Food:'nasi',Preloved:'headphones',Services:'design',Rentals:'camera',Others:'books'})[category]}.jpg`;
      const ownerAccountId=state.account.id;
      try{
        if(photo&&photo.size){if(!['image/jpeg','image/png','image/webp'].includes(photo.type))throw new Error('Choose a JPG, PNG or WebP photo.');if(photo.size>2*1024*1024)throw new Error('Choose a photo smaller than 2 MB.');submit.disabled=true;submit.textContent='Preparing your photo…';image=await fileAsDataURL(photo);}
        if($('listing-form')!==form||state.account?.id!==ownerAccountId)return;
        const item={id:`local-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,title:title.slice(0,80),description:description.slice(0,1200),category,price,image,seller:identity.name,initials:identity.initials,avatar:'#e6d6d3',business:identity.type==='business',identityType:identity.type,businessId:identity.type==='business'?identity.id:null,ownerAccountId,sellerRole:state.account.role,verificationTypes:[],sample:false,campus:['Parit Raja','Pagoh'].includes(String(data.get('campus')))?String(data.get('campus')):'Parit Raja',pickup:pickup.slice(0,80),condition:condition.slice(0,35),rating:'New',time:'Just now',rank:0,created:Date.now()};
        const old=state.listings,oldIdentity=state.postingByAccount[ownerAccountId];state.listings=[item,...old];state.postingByAccount[ownerAccountId]=identity.id;
        if(!persist()){state.listings=old;state.postingByAccount[ownerAccountId]=oldIdentity;submit.disabled=false;submit.textContent='Save preview listing';return;}
        closeModal();state.campus='All campuses';setView('my-listings');feedback('success','Your preview listing is ready',`Saved as ${identity.name} (${identity.type==='business'?'business':'personal'}). It stays on this device and keeps this seller identity.`);
      }catch(error){if(status){status.className='status-message error';status.textContent=error.message;}form.elements?.photo?.focus();feedback('error','Let’s try another photo',error.message);submit.disabled=false;submit.innerHTML=`Save preview listing ${icon('arrow')}`;}
    }
  }
  function init() {
    render();
    document.addEventListener('click',event=>{
      const category=event.target.closest('[data-category]');if(category){state.category=categories.includes(category.dataset.category)?category.dataset.category:'All';render();return;}
      const action=event.target.closest('[data-action]');if(action){if(action.dataset.action==='close-overlay'&&event.target!==action)return;event.preventDefault();onAction(action.dataset.action,action,event);}
    });
    document.addEventListener('submit',submitForm);
    document.addEventListener('invalid',event=>{
      if(!event.target.closest('#modal-root'))return;
      event.preventDefault();event.target.setAttribute('aria-invalid','true');
      if(invalidBurst)return;invalidBurst=true;
      const field=event.target;const label=field.labels?.[0]?.textContent.trim()||'this field';
      const message=field.validity?.valueMissing?`Please complete ${label.toLowerCase()}.`:field.validationMessage||'Please check this field.';
      const statusId=({'listing-form':'listing-status','business-form':'business-status','message-form':'message-status','identity-form':'identity-status'})[field.form?.id];
      const status=statusId?$(statusId):null;
      if(status){status.className='status-message error';status.textContent=message;field.setAttribute('aria-describedby',statusId);}
      feedback('error','Check this detail',message);
      requestAnimationFrame(()=>{field.focus();invalidBurst=false;});
    },true);
    document.addEventListener('input',event=>{
      if(event.target.closest('#login-form')){loginCandidate=null;if($('enter-account-preview'))$('enter-account-preview').hidden=true;if($('login-status'))$('login-status').textContent='';}
      if(event.target.validity?.valid)event.target.removeAttribute('aria-invalid');
    });
    $('search-input')?.addEventListener('input',event=>{state.search=event.target.value.trim().slice(0,200);render();});
    $('campus-select')?.addEventListener('change',event=>{state.campus=event.target.value;render();});
    $('sort-select')?.addEventListener('change',event=>{state.sort=event.target.value;render();});
    $('top-selling-period')?.addEventListener('change',event=>{state.topSellingPeriod=event.target.value==='month'?'month':'week';renderTopSelling();});
    document.addEventListener('keydown',event=>{
      const modal=$('modal-root')?.querySelector('.modal-panel');
      if(modal){if(event.key==='Escape'){event.preventDefault();closeModal();return;}if(event.key==='Tab'){const focusables=[...modal.querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex="0"]')].filter(el=>el.offsetParent!==null);const first=focusables[0],last=focusables[focusables.length-1];if(!focusables.length){event.preventDefault();modal.focus();}else if(event.shiftKey&&(document.activeElement===first||document.activeElement===modal)){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}
      else if((event.key==='Enter'||event.key===' ')&&event.target.matches('.product-card')){event.preventDefault();showDetail(event.target.dataset.id);}
      else if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.matches('input,textarea,select,[contenteditable="true"]')){event.preventDefault();$('search-input')?.focus();}
      else if(event.key==='Escape'){document.body.classList.remove('nav-open');document.querySelectorAll('[data-action="toggle-mobile-nav"]').forEach(button=>button.setAttribute('aria-expanded','false'));}
    });
    let pointerFrame=0,pointerX=0,pointerY=0;
    document.addEventListener('pointermove',event=>{
      const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const stage=event.target.closest('.campus-card-stage');
      if(stage&&!reduce){const rect=stage.getBoundingClientRect(),card=$('campus-card');if(card){card.style.setProperty('--tilt-y',`${((event.clientX-rect.left)/rect.width-.5)*16}deg`);card.style.setProperty('--tilt-x',`${-((event.clientY-rect.top)/rect.height-.5)*12}deg`);}}
      if(reduce||!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
      pointerX=(event.clientX/window.innerWidth-.5)*2;pointerY=(event.clientY/window.innerHeight-.5)*2;
      if(pointerFrame)return;
      pointerFrame=requestAnimationFrame(()=>{pointerFrame=0;const atmosphere=document.querySelector('.campus-atmosphere');if(atmosphere){atmosphere.style.setProperty('--pointer-x',String(Math.max(-1,Math.min(1,pointerX))));atmosphere.style.setProperty('--pointer-y',String(Math.max(-1,Math.min(1,pointerY))));}});
    });
    document.addEventListener('pointerout',event=>{const stage=event.target.closest('.campus-card-stage');if(stage&&!stage.contains(event.relatedTarget)){const card=$('campus-card');card?.style.setProperty('--tilt-x','0deg');card?.style.setProperty('--tilt-y','0deg');}});
    window.PasorPreview={classifyEmail,version:'3.0.0'};
    window.dispatchEvent(new Event('pasor:ready'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
