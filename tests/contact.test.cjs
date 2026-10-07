const {test} = require("node:test");
const assert = require("node:assert/strict");
const handler = require("../api/contact.js");
let sequence=0;
const valid=()=>({name:"Prueba ESENCIA",email:"visitor@example.test",phone:"+34 600000000",topic:"General",
 message:"Consulta de prueba del formulario.",requestId:"12345678-1234-1234-1234-123456789012",website:""});
async function request(body=valid(),changes={}) {
 const req={method:"POST",headers:{origin:"https://esencia.example.test",host:"esencia.example.test",
 "content-type":"application/json","x-forwarded-for":"192.0.2."+ ++sequence},body,...changes};
 const res={headers:{},setHeader(key,value){this.headers[key]=value;},status(code){this.code=code;return this;},json(data){this.data=data;return this;}};
 await handler(req,res);return res;
}
test("Contacto: validación, configuración, entrega al proveedor y fallos",async()=>{
 const originalFetch=global.fetch;
 const originalKey=process.env.RESEND_API_KEY,originalFrom=process.env.RESEND_FROM_EMAIL;
 let calls=0, payload, headers;
 global.fetch=async(url,options)=>{calls++;assert.equal(url,"https://api.resend.com/emails");payload=JSON.parse(options.body);headers=options.headers;return{ok:true,json:async()=>({id:"test-provider-id"})};};
 try {
  delete process.env.RESEND_API_KEY;delete process.env.RESEND_FROM_EMAIL;
  assert.equal((await request()).code,503);
  assert.equal((await request(valid(),{method:"GET"})).code,405);
  assert.equal((await request(valid(),{headers:{origin:"https://other.example",host:"esencia.example.test","content-type":"application/json"}})).code,403);
  assert.equal((await request(valid(),{headers:{origin:"https://esencia.example.test",host:"esencia.example.test","content-type":"text/plain"}})).code,415);
  assert.equal((await request("{")).code,400);
  for(const invalid of [{email:"bad"},{name:""},{name:"x\r\nBcc: attacker"},{message:"corto"},{topic:"Injected"},{website:"spam"},{requestId:"bad"},{message:"x".repeat(3001)}]) {
   assert.equal((await request({...valid(),...invalid})).code,400);
  }
  assert.equal((await request({...valid(),extra:"x".repeat(14000)})).code,413);
  assert.equal(calls,0);
  process.env.RESEND_API_KEY="test-no-real-key";process.env.RESEND_FROM_EMAIL="sender@example.test";
  const success=await request({...valid(),to:"attacker@example.test",message:"<script>alert(1)</script> Consulta de prueba."});
  assert.equal(success.code,200);assert.equal(success.data.ok,true);
  assert.deepEqual(payload.to,["marcos.blayapicazo@gmail.com"]);
  assert.equal(payload.reply_to,"visitor@example.test");assert.equal(payload.from,"sender@example.test");
  assert.ok(payload.text.includes("<script>"));assert.equal(payload.html,undefined);
  assert.ok(headers["Idempotency-Key"].endsWith(valid().requestId));assert.equal(headers.Authorization,"Bearer test-no-real-key");
  global.fetch=async()=>({ok:false,json:async()=>({message:"Private provider detail"})});
  const failure=await request();assert.equal(failure.code,502);assert.equal(failure.data.ok,false);
  assert.ok(!failure.data.error.includes("Private"));
  global.fetch=async()=>{throw Error("Secret network failure");};assert.equal((await request()).code,502);
  global.fetch=async()=>({ok:true,json:async()=>({})});assert.equal((await request()).code,502);
  global.fetch=async()=>({ok:true,json:async()=>({id:"rate-test"})});
  const sameHeaders={origin:"https://esencia.example.test",host:"esencia.example.test","content-type":"application/json","x-forwarded-for":"198.51.100.15"};
  for(let i=0;i<6;i++)assert.equal((await request(valid(),{headers:sameHeaders})).code,200);
  const rate=await request(valid(),{headers:sameHeaders});assert.equal(rate.code,429);assert.equal(rate.headers["Retry-After"],"600");
 }finally{
  global.fetch=originalFetch;
  if(originalKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=originalKey;
  if(originalFrom===undefined)delete process.env.RESEND_FROM_EMAIL;else process.env.RESEND_FROM_EMAIL=originalFrom;
 }
});
