(()=>{var e={};e.id=4492,e.ids=[4492],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4571:(e,t,n)=>{"use strict";n.d(t,{Df:()=>p,Ep:()=>u,ft:()=>l});var r=n(37449);let s=process.env.GOOGLE_AI_API_KEY;if(!s)throw Error("GOOGLE_AI_API_KEY is not set in environment variables");let o=new r.ij(s),a={model:process.env.AI_MODEL_DEFAULT||"gemini-1.5-flash",temperature:.7,maxOutputTokens:2048,topP:.8,topK:40};function i(e={}){let t={...a,...e};return o.getGenerativeModel({model:t.model,generationConfig:{temperature:t.temperature,maxOutputTokens:t.maxOutputTokens,topP:t.topP,topK:t.topK}})}async function p(e,t={}){try{let n=i(t),r=await n.generateContent(e);return(await r.response).text()}catch(e){throw console.error("Error generating text:",e),Error("Failed to generate text")}}async function l(e,t,n,r={}){return p(`
Write a compelling and appetizing description for a restaurant called "${e}" that serves ${t} cuisine.

Key specialties: ${n.join(", ")}

Requirements:
- Keep it between 100-150 words
- Make it sound appetizing and inviting
- Highlight the unique aspects
- Use engaging, descriptive language
- Focus on the dining experience

Please write only the description without any additional text or formatting.
  `.trim(),r)}async function u(e,t,n,r={}){return p(`
Write an appetizing description for a ${n} dish called "${e}".

Main ingredients: ${t.join(", ")}

Requirements:
- Keep it between 30-50 words
- Make it sound delicious and appealing
- Mention key ingredients naturally
- Use descriptive, mouth-watering language
- Don't include price or availability information

Please write only the description without any additional text or formatting.
  `.trim(),r)}},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},26311:(e,t,n)=>{"use strict";n.r(t),n.d(t,{patchFetch:()=>v,routeModule:()=>g,serverHooks:()=>f,workAsyncStorage:()=>h,workUnitAsyncStorage:()=>m});var r={};n.r(r),n.d(r,{GET:()=>c,POST:()=>d});var s=n(96559),o=n(48088),a=n(37719),i=n(32190),p=n(4571);let l=`
## AI RESPONSE GUIDELINES

### PERSONALITY & TONE
- Be friendly, warm, and approachable
- Sound natural and human-like, not robotic
- Use a conversational tone like talking to a friend
- Be helpful and genuinely interested in assisting
- Show empathy when appropriate

### RESPONSE LENGTH & STYLE
- Keep responses medium length (2-4 sentences for simple questions, 1-2 paragraphs for complex topics)
- Avoid overly long explanations unless specifically requested
- Don't be too brief - provide enough context to be helpful
- Use clear, easy-to-understand language
- Break up long responses with line breaks for readability

### COMMUNICATION STYLE
- Use contractions (I'm, you're, it's) to sound more natural
- Ask follow-up questions when appropriate to keep conversation flowing
- Use examples to explain complex concepts
- Acknowledge when you don't know something
- Be encouraging and positive

### FORMATTING
- Use bullet points or numbered lists for multiple items
- Use **bold** for emphasis when needed
- Keep paragraphs short and scannable
- Use emojis sparingly and only when they add value

### CONVERSATION FLOW
- Remember context from previous messages in the conversation
- Reference earlier parts of the conversation when relevant
- Ask clarifying questions if the user's request is unclear
- Offer to elaborate or provide more details if needed
- End responses with an invitation for further questions when appropriate

### WHAT TO AVOID
- Don't be overly formal or stiff
- Avoid jargon unless explaining technical topics
- Don't give extremely long responses unless requested
- Don't be repetitive or redundant
- Avoid being pushy or overly enthusiastic
`,u=`
You are a helpful AI assistant with a friendly, natural personality. 

${l}

## INSTRUCTIONS
1. Follow the response guidelines above in all your interactions
2. Be genuinely helpful and aim to provide value in every response
3. Adapt your communication style to match the user's tone and needs
4. If you don't know something, say so honestly rather than guessing
5. Keep the conversation engaging and natural

Please respond to all messages following these guidelines.
`.trim();async function d(e){try{if("true"!==process.env.ENABLE_AI_FEATURES)return i.NextResponse.json({error:"Chatbot service is not available"},{status:503});let{message:t,conversationHistory:n}=await e.json();if(!t||"string"!=typeof t)return i.NextResponse.json({error:"Message is required and must be a string"},{status:400});if(t.length>1e3)return i.NextResponse.json({error:"Message is too long (max 1,000 characters)"},{status:400});let r="";n&&Array.isArray(n)&&(r=n.slice(-6).map(e=>`${e.role}: ${e.content}`).join("\n"));let s=`
${u}

## CONVERSATION HISTORY
${r}

## CURRENT USER MESSAGE
User: ${t}

Please respond following the guidelines above:
    `.trim(),o=await (0,p.Df)(s,{temperature:.7,maxOutputTokens:1024}),a={id:`msg_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,role:"assistant",content:o.trim(),timestamp:new Date().toISOString()};return i.NextResponse.json({success:!0,message:a,timestamp:new Date().toISOString()})}catch(e){return console.error("Error processing chat message:",e),i.NextResponse.json({error:"Failed to process message",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}async function c(){return i.NextResponse.json({error:"Method not allowed. Use POST to send messages."},{status:405})}let g=new s.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/chatbot/chat/route",pathname:"/api/chatbot/chat",filename:"route",bundlePath:"app/api/chatbot/chat/route"},resolvedPagePath:"C:\\Users\\ACER\\Desktop\\tap2go\\apps\\web\\src\\app\\api\\chatbot\\chat\\route.ts",nextConfigOutput:"",userland:r}),{workAsyncStorage:h,workUnitAsyncStorage:m,serverHooks:f}=g;function v(){return(0,a.patchFetch)({workAsyncStorage:h,workUnitAsyncStorage:m})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},96487:()=>{}};var t=require("../../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),r=t.X(0,[4447,580,7449],()=>n(26311));module.exports=r})();