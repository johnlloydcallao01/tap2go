(()=>{var e={};e.id=5483,e.ids=[5483],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4571:(e,t,r)=>{"use strict";r.d(t,{Df:()=>u,Ep:()=>d,ft:()=>p});var n=r(37449);let s=process.env.GOOGLE_AI_API_KEY;if(!s)throw Error("GOOGLE_AI_API_KEY is not set in environment variables");let i=new n.ij(s),a={model:process.env.AI_MODEL_DEFAULT||"gemini-1.5-flash",temperature:.7,maxOutputTokens:2048,topP:.8,topK:40};function o(e={}){let t={...a,...e};return i.getGenerativeModel({model:t.model,generationConfig:{temperature:t.temperature,maxOutputTokens:t.maxOutputTokens,topP:t.topP,topK:t.topK}})}async function u(e,t={}){try{let r=o(t),n=await r.generateContent(e);return(await n.response).text()}catch(e){throw console.error("Error generating text:",e),Error("Failed to generate text")}}async function p(e,t,r,n={}){return u(`
Write a compelling and appetizing description for a restaurant called "${e}" that serves ${t} cuisine.

Key specialties: ${r.join(", ")}

Requirements:
- Keep it between 100-150 words
- Make it sound appetizing and inviting
- Highlight the unique aspects
- Use engaging, descriptive language
- Focus on the dining experience

Please write only the description without any additional text or formatting.
  `.trim(),n)}async function d(e,t,r,n={}){return u(`
Write an appetizing description for a ${r} dish called "${e}".

Main ingredients: ${t.join(", ")}

Requirements:
- Keep it between 30-50 words
- Make it sound delicious and appealing
- Mention key ingredients naturally
- Use descriptive, mouth-watering language
- Don't include price or availability information

Please write only the description without any additional text or formatting.
  `.trim(),n)}},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},50059:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>x,routeModule:()=>c,serverHooks:()=>m,workAsyncStorage:()=>l,workUnitAsyncStorage:()=>g});var n={};r.r(n),r.d(n,{GET:()=>d,POST:()=>p});var s=r(96559),i=r(48088),a=r(37719),o=r(32190),u=r(4571);async function p(e){try{if("true"!==process.env.ENABLE_AI_FEATURES)return o.NextResponse.json({error:"AI features are not enabled"},{status:503});let{restaurantName:t,cuisine:r,specialties:n,config:s}=await e.json();if(!t||"string"!=typeof t)return o.NextResponse.json({error:"Restaurant name is required and must be a string"},{status:400});if(!r||"string"!=typeof r)return o.NextResponse.json({error:"Cuisine type is required and must be a string"},{status:400});if(!n||!Array.isArray(n))return o.NextResponse.json({error:"Specialties are required and must be an array"},{status:400});let i=await (0,u.ft)(t,r,n,s);return o.NextResponse.json({success:!0,description:i,restaurantName:t,cuisine:r,specialties:n,model:s?.model||process.env.AI_MODEL_DEFAULT||"gemini-1.5-flash",timestamp:new Date().toISOString()})}catch(e){return console.error("Error in restaurant-description API:",e),o.NextResponse.json({error:"Failed to generate restaurant description",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}async function d(){return o.NextResponse.json({error:"Method not allowed. Use POST."},{status:405})}let c=new s.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/ai/restaurant-description/route",pathname:"/api/ai/restaurant-description",filename:"route",bundlePath:"app/api/ai/restaurant-description/route"},resolvedPagePath:"C:\\Users\\ACER\\Desktop\\tap2go\\apps\\web\\src\\app\\api\\ai\\restaurant-description\\route.ts",nextConfigOutput:"",userland:n}),{workAsyncStorage:l,workUnitAsyncStorage:g,serverHooks:m}=c;function x(){return(0,a.patchFetch)({workAsyncStorage:l,workUnitAsyncStorage:g})}},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},96487:()=>{}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[4447,580,7449],()=>r(50059));module.exports=n})();