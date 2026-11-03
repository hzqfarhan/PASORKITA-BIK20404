(() => {
  'use strict';
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const menu=document.querySelector('[data-menu]');
  const closeMenu=()=>{document.body.classList.remove('nav-open');menu?.setAttribute('aria-expanded','false');};
  menu?.addEventListener('click',()=>{const open=document.body.classList.toggle('nav-open');menu.setAttribute('aria-expanded',String(open));});
  document.addEventListener('click',event=>{if(document.body.classList.contains('nav-open') && !event.target.closest('.sidebar,[data-menu]'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();if(event.key==='/' && !event.target.closest('input,textarea,select')){event.preventDefault();document.querySelector('.global-search input')?.focus();}});
  document.querySelectorAll('[data-go-back]').forEach(button=>button.addEventListener('click',()=>history.length>1?history.back():location.assign('/products')));
  const dialog=document.querySelector('#card-dialog');
  document.querySelectorAll('[data-open-card]').forEach(button=>button.addEventListener('click',()=>dialog?.showModal()));
  document.querySelector('[data-close-dialog]')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)dialog.close();}});
  document.querySelectorAll('[data-flip-card]').forEach(button=>button.addEventListener('click',()=>{
    const card=button.previousElementSibling?.querySelector('[data-campus-card]');if(!card)return;
    const flipped=card.classList.toggle('is-flipped');button.setAttribute('aria-pressed',String(flipped));
    card.querySelector('.card-front').setAttribute('aria-hidden',String(flipped));card.querySelector('.card-back').setAttribute('aria-hidden',String(!flipped));
  }));
  document.querySelectorAll('[data-campus-card]').forEach(card=>{
    card.addEventListener('pointermove',event=>{if(reducedMotion.matches || event.pointerType==='touch')return;const r=card.getBoundingClientRect();const x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;card.style.setProperty('--tilt-x',(-y*13)+'deg');card.style.setProperty('--tilt-y',(x*17)+'deg');});
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');});
  });
  const toast=message=>{const root=document.querySelector('#toast-root');if(!root)return;const node=document.createElement('div');node.className='toast';node.textContent=message;root.replaceChildren(node);setTimeout(()=>node.remove(),4000);};
  document.querySelectorAll('[data-save-form]').forEach(form=>form.addEventListener('submit',async event=>{
    event.preventDefault();const button=form.querySelector('button');button.disabled=true;
    try{
      const response=await fetch(form.action,{method:'POST',body:new URLSearchParams(new FormData(form)),headers:{Accept:'application/json'},credentials:'same-origin'});
      if(response.redirected){location.assign(response.url);return;}
      if(!response.ok)throw new Error('Reload the page and try saving this find again.');
      const {saved}=await response.json();button.classList.toggle('is-saved',saved);button.setAttribute('aria-pressed',String(saved));
      if(!button.querySelector('svg'))button.textContent=saved?'Saved to your finds':'Save for later';
      else button.setAttribute('aria-label',(saved?'Unsave':'Save')+' product');
      toast(saved?'A good find, saved for later.':'Removed from your saved finds.');
      if(location.pathname==='/saved' && !saved)form.closest('.product-card')?.remove();
    }catch(error){toast(error.message);}finally{button.disabled=false;}
  }));
  const checkout=document.querySelector('[data-checkout]');
  checkout?.querySelector('[name=quantity]')?.addEventListener('input',event=>{
    const quantity=Number(event.target.value),price=Number(checkout.dataset.unitPrice);
    checkout.querySelector('[data-order-total]').textContent=new Intl.NumberFormat('en-MY',{style:'currency',currency:'MYR'}).format(Number.isFinite(quantity)?quantity*price:0);
  });
  document.querySelectorAll('form:not([data-save-form])').forEach(form=>form.addEventListener('submit',event=>{
    if(form.dataset.confirm && !confirm(form.dataset.confirm)){event.preventDefault();return;}
    document.body.classList.add('is-navigating');
    // Keep the submitter's name/value enabled so moderation and order actions arrive.
    const button=event.submitter;if(button){button.setAttribute('aria-busy','true');setTimeout(()=>{button.disabled=true;},0);}
  }));
  window.addEventListener('pageshow',()=>{document.body.classList.remove('is-navigating');document.querySelectorAll('[aria-busy=true]').forEach(button=>{button.disabled=false;button.removeAttribute('aria-busy');});});
  const walkthrough=document.querySelector('[data-walkthrough]');
  if(walkthrough){
    const steps=[...walkthrough.querySelectorAll('li')],button=walkthrough.querySelector('[data-pause-animation]');let index=0,paused=reducedMotion.matches;
    const sync=()=>{button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Play animation':'Pause animation';};sync();steps[0]?.classList.add('is-current');
    const interval=setInterval(()=>{if(paused || document.hidden)return;steps[index]?.classList.remove('is-current');index=(index+1)%steps.length;steps[index]?.classList.add('is-current');},4000);
    button.addEventListener('click',()=>{paused=!paused;sync();});reducedMotion.addEventListener('change',()=>{paused=reducedMotion.matches;sync();});window.addEventListener('pagehide',()=>clearInterval(interval),{once:true});
  }
  let installPrompt;
  const installButton=document.querySelector('.install-app');
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;if(installButton)installButton.hidden=false;});
  installButton?.addEventListener('click',async()=>{if(!installPrompt)return;await installPrompt.prompt();installPrompt=null;installButton.hidden=true;});
  window.addEventListener('appinstalled',()=>{if(installButton)installButton.hidden=true;});
  window.addEventListener('offline',()=>toast('You’re offline. Reconnect to manage your finds and orders.'));
  if('serviceWorker' in navigator && window.isSecureContext)navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{});
})();
