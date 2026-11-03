import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import { useDatabase } from '../server/db.js';

test('missing Supabase configuration returns a useful 503 without exposing secrets',async()=>{
  useDatabase(null);
  const app=await createApp({secret:'test-session-secret-for-an-unconfigured-database'});
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  try{
    const base='http://127.0.0.1:'+server.address().port;
    const response=await fetch(base+'/');assert.equal(response.status,503);
    const html=await response.text();assert.match(html,/Supabase connection/);assert.doesNotMatch(html,/password_hash|postgresql:\/\/|ReferenceError/);
    const health=await fetch(base+'/health');assert.equal(health.status,503);assert.equal((await health.json()).status,'setup-required');
  }finally{await new Promise(resolve=>server.close(resolve));}
});
