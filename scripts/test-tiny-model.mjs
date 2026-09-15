import assert from 'node:assert/strict';
import { train, distribution, sample, START, END } from '../src/lib/tiny-model.ts';
const model = train([6,3,1]);
assert.deepEqual(model, { START:{c:10}, c:{a:10}, a:{t:6,r:3,n:1}, t:{END:6}, r:{END:3}, n:{END:1} });
assert.deepEqual(distribution(model,'a').map(x=>x.probability), [.6,.3,.1]);
for (const token of Object.keys(model)) assert(Math.abs(distribution(model,token).reduce((s,x)=>s+x.probability,0)-1)<1e-12);
for (const [draw, expected] of [[0,'cat'],[.5999,'cat'],[.6,'car'],[.8999,'car'],[.9001,'can'],[.999999,'can']]) {
 let token=START, text=''; for(let i=0;i<8 && token!==END;i++){token=sample(model,token,draw);if(token!==END)text+=token;}
 assert.equal(text,expected); assert.equal(token,END);
}
assert.deepEqual(distribution(train([0,0,0]),START),[]);
assert.equal(sample(train([0,0,1]),'a',0),'n');
assert.throws(()=>sample({},START,.5));
assert.throws(()=>train([-1,0,1]));assert.throws(()=>train([.5,1,1]));assert.throws(()=>train([NaN,1,1]));assert.throws(()=>sample(model,'a',1));
console.log('Tiny model: counts, normalization, sampling boundaries, termination, and invalid inputs verified.');
