(()=>{var e={};e.id=2562,e.ids=[2562],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4571:(e,t,r)=>{"use strict";r.d(t,{Df:()=>p,Ep:()=>d,ft:()=>u});var n=r(37449);let s=process.env.GOOGLE_AI_API_KEY;if(!s)throw Error("GOOGLE_AI_API_KEY is not set in environment variables");let i=new n.ij(s),o={model:process.env.AI_MODEL_DEFAULT||"gemini-1.5-flash",temperature:.7,maxOutputTokens:2048,topP:.8,topK:40};function a(e={}){let t={...o,...e};return i.getGenerativeModel({model:t.model,generationConfig:{temperature:t.temperature,maxOutputTokens:t.maxOutputTokens,topP:t.topP,topK:t.topK}})}async function p(e,t={}){try{let r=a(t),n=await r.generateContent(e);return(await n.response).text()}catch(e){throw console.error("Error generating text:",e),Error("Failed to generate text")}}async function u(e,t,r,n={}){return p(`
Write a compelling and appetizing description for a restaurant called "${e}" that serves ${t} cuisine.

Key specialties: ${r.join(", ")}

Requirements:
- Keep it between 100-150 words
- Make it sound appetizing and inviting
- Highlight the unique aspects
- Use engaging, descriptive language
- Focus on the dining experience

Please write only the description without any additional text or formatting.
  `.trim(),n)}async function d(e,t,r,n={}){return p(`
Write an appetizing description for a ${r} dish called "${e}".

Main ingredients: ${t.join(", ")}

Requirements:
- Keep it between 30-50 words
- Make it sound delicious and appealing
- Mention key ingredients naturally
- Use descriptive, mouth-watering language
- Don't include price or availability information

Please write only the description without any additional text or formatting.
  `.trim(),n)}},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},91359:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>x,routeModule:()=>c,serverHooks:()=>m,workAsyncStorage:()=>l,workUnitAsyncStorage:()=>g});var n={};r.r(n),r.d(n,{GET:()=>d,POST:()=>u});var s=r(96559),i=r(48088),o=r(37719),a=r(32190),p=r(4571);async function u(e){try{if("true"!==process.env.ENABLE_AI_FEATURES)return a.NextResponse.json({error:"AI features are not enabled"},{status:503});let{prompt:t,config:r}=await e.json();if(!t||"string"!=typeof t)return a.NextResponse.json({error:"Prompt is required and must be a string"},{status:400});if(t.length>1e4)return a.NextResponse.json({error:"Prompt is too long (max 10,000 characters)"},{status:400});let n=await (0,p.Df)(t,r);return a.NextResponse.json({success:!0,result:n,model:r?.model||process.env.AI_MODEL_DEFAULT||"gemini-1.5-flash",timestamp:new Date().toISOString()})}catch(e){return console.error("Error in generate-text API:",e),a.NextResponse.json({error:"Failed to generate text",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}async function d(){return a.NextResponse.json({error:"Method not allowed. Use POST."},{status:405})}let c=new s.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/ai/generate-text/route",pathname:"/api/ai/generate-text",filename:"route",bundlePath:"app/api/ai/generate-text/route"},resolvedPagePath:"C:\\Users\\ACER\\Desktop\\tap2go\\apps\\web\\src\\app\\api\\ai\\generate-text\\route.ts",nextConfigOutput:"",userland:n}),{workAsyncStorage:l,workUnitAsyncStorage:g,serverHooks:m}=c;function x(){return(0,o.patchFetch)({workAsyncStorage:l,workUnitAsyncStorage:g})}},96487:()=>{}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[4447,580,7449],()=>r(91359));module.exports=n})();