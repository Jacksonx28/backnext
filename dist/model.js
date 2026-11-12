export const initialRequests = () => [
  {
    "id": "website",
    "title": "A portfolio that helps you land your next client.",
    "description": "Build a fast, one-page portfolio with a project gallery and contact form. You get a full walkthrough, editable starter files, and a launch checklist.",
    "category": "Tutorial",
    "goal": 1000,
    "art": "< / >",
    "color": "",
    "outcome": "Video + portfolio starter kit",
    "audience": "For freelancers & first-time builders",
    "total": 0,
    "contributions": [],
    "delivered": null
  },
  {
    "id": "assistant",
    "title": "Turn one video into a week of content.",
    "description": "Build a practical AI workflow that turns your own transcript into short-video scripts, captions, and a posting plan. Includes reusable prompts and an editable planner.",
    "category": "Experiment",
    "goal": 1500,
    "art": "1 → 7",
    "color": "purple",
    "outcome": "Walkthrough + prompts + planner",
    "audience": "For creators short on time",
    "total": 0,
    "contributions": [],
    "delivered": null
  },
  {
    "id": "workflow",
    "title": "Make your phone videos look more polished.",
    "description": "A hands-on filming and editing session using a phone and free tools. Get the shot list, lighting setup, and a repeatable editing checklist.",
    "category": "Behind the scenes",
    "goal": 800,
    "art": "▶ REC",
    "color": "peach",
    "outcome": "Filming lesson + shot-list template",
    "audience": "For new video creators",
    "total": 0,
    "contributions": [],
    "delivered": null
  },
  {
    "id": "invoice",
    "title": "A simple client tracker that follows up for you.",
    "description": "Build a small tracker for projects, invoices, and payment reminders. Includes an editable spreadsheet and a walkthrough of the reminder workflow.",
    "category": "Tutorial",
    "goal": 1200,
    "art": "✓ PAID",
    "color": "",
    "outcome": "Tracker template + setup lesson",
    "audience": "For freelancers juggling clients",
    "total": 0,
    "contributions": [],
    "delivered": null
  },
  {
    "id": "wallet-guide",
    "title": "Your first onchain app, explained without jargon.",
    "description": "Follow a beginner-friendly build on a test network: connect a wallet, read a balance, and understand a transaction receipt. Includes source code and setup notes.",
    "category": "Tutorial",
    "goal": 1400,
    "art": "0x →",
    "color": "purple",
    "outcome": "Working starter app + video guide",
    "audience": "For curious first-time Web3 builders",
    "total": 0,
    "contributions": [],
    "delivered": null
  },
  {
    "id": "launch-kit",
    "title": "A launch kit for your first digital product.",
    "description": "Turn a small skill into a clear offer. Work through a product brief, landing-page copy, pricing worksheet, and a practical seven-day launch checklist.",
    "category": "Workshop",
    "goal": 1000,
    "art": "DAY 01",
    "color": "peach",
    "outcome": "Guided workshop + editable launch kit",
    "audience": "For independent makers",
    "total": 0,
    "contributions": [],
    "delivered": null
  }
];
export function amountOf(value){const n=Number(value);if(!Number.isSafeInteger(n)||n<1||n>1e9)throw new Error('Enter a whole amount between 1 and 1,000,000,000.');return n;}
export function safeUrl(value){let url;try{url=new URL(value);}catch{throw new Error('Enter a full https:// link to the finished work.');}if(url.protocol!=='https:')throw new Error('Use a secure https:// link.');return url.href;}
export function contribute(request,amount,id){if(request.delivered)throw new Error('This request has already been delivered.');amount=amountOf(amount);if(!Number.isSafeInteger(request.total+amount))throw new Error('The total is too large.');return {...request,total:request.total+amount,contributions:[...request.contributions,{id,amount,at:new Date().toISOString()}]};}
export function deliver(request,url){if(request.delivered)throw new Error('This request has already been delivered.');return {...request,delivered:safeUrl(url)};}

// Add the curated collection without discarding existing backing or creator requests.
export function mergeCuratedRequests(saved) {
 const seeds=initialRequests();
 const merged=saved.map(r=>{
  const seed=seeds.find(s=>s.id===r.id);
  return seed && r.total===0 && !r.delivered ? {...seed,...r,title:seed.title,description:seed.description,category:seed.category,art:seed.art,outcome:seed.outcome,audience:seed.audience} : r;
 });
 return [...merged,...seeds.filter(s=>!merged.some(r=>r.id===s.id))];
}
