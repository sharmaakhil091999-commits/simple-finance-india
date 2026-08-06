import { useState, useEffect } from 'react'

const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN')
const today = () => new Date().toISOString().split('T')[0]
const fmtDate = d => { if(!d) return '—'; const dt=new Date(d+'T00:00:00'); return dt.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }

// NEW REGIME TAX SLABS (FY 2025-26)
function calcNewRegimeTax(income) {
  if(income<=0) return 0
  let tax=0, rem=income
  const slabs=[[300000,0],[400000,.05],[300000,.10],[300000,.15],[300000,.20],[Infinity,.30]]
  for(const [limit,rate] of slabs){ const chunk=Math.min(rem,limit); tax+=chunk*rate; rem-=chunk; if(rem<=0) break; }
  // Rebate u/s 87A: if income <= 7 lakh, tax = 0
  if(income<=700000) tax=0
  return tax
}

// OLD REGIME TAX SLABS (FY 2025-26)
function calcOldRegimeTax(income, deductions) {
  const taxable = Math.max(0, income - deductions)
  if(taxable<=0) return { tax:0, taxable:0 }
  let tax=0, rem=taxable
  const slabs=[[250000,0],[250000,.05],[500000,.20],[Infinity,.30]]
  for(const [limit,rate] of slabs){ const chunk=Math.min(rem,limit); tax+=chunk*rate; rem-=chunk; if(rem<=0) break; }
  // Rebate u/s 87A: if taxable income <= 5 lakh, tax = 0
  if(taxable<=500000) tax=0
  return { tax, taxable }
}

function Toast({ msg, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3500); return ()=>clearTimeout(t); },[])
  return <div className="toast-box">{msg}</div>
}

function Nav({ page, user, onNav, onLogout }) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={()=>onNav('home')}>Simple Finance <span>India</span></div>
      {!user ? (
        <div className="nav-links">
          <button className="btn btn-outline" onClick={()=>onNav('login')}>Login</button>
          <button className="btn btn-green" onClick={()=>onNav('register')}>Get started free</button>
        </div>
      ) : (
        <div className="nav-links">
          <span style={{fontSize:13,color:'var(--text2)'}}>Hi, {user.name.split(' ')[0]}</span>
          <button className="btn btn-outline" onClick={onLogout}>Logout</button>
        </div>
      )}
    </nav>
  )
}

function Home({ onNav }) {
  return (
    <div>
      <div className="hero">
        <h1>File Your ITR in <span>Minutes,</span><br/>Not Hours</h1>
        <p>India's smartest tax tool for tutors, coaches, and self-employed professionals. Section 44AD, 44ADA, and normal filing — all covered.</p>
        <div className="hero-btns">
          <button className="btn-hero btn-green" onClick={()=>onNav('register')}>Start free — no credit card</button>
          <button className="btn-hero" style={{background:'#fff',border:'1.5px solid var(--navy)',color:'var(--navy)'}} onClick={()=>onNav('login')}>I already have an account</button>
        </div>
      </div>
      <div className="features-section">
        <h2 className="section-title">Everything you need to file ITR-4</h2>
        <p className="section-sub">Covers cash receipts, digital payments, Section 44AD, 44ADA, old & new tax regime</p>
        <div className="feature-grid">
          {[
            ['📊','Track all income','Cash, UPI, cheque, bank transfer — each tracked separately for correct tax calculation.'],
            ['🧮','Both tax regimes','Old regime with all deductions (80C, 80D, HRA) vs new regime — compare and choose.'],
            ['📄','Ready-to-file ITR-4','All fields auto-filled. Download PDF and upload to income-tax.gov.in.'],
            ['⚡','6% or 8% rule','Digital payments get 6% presumptive rate. Cash gets 8%. Applied automatically.'],
            ['🏥','Deductions covered','80C, 80D, HRA, NPS, home loan and more — enter once, applied to old regime.'],
            ['🇮🇳','All filing methods','Section 44AD, Section 44ADA (professionals), or normal books of accounts.'],
          ].map(([icon,title,desc])=>(
            <div className="feature-card" key={title}>
              <div className="feature-icon">{icon}</div>
              <h3>{title}</h3><p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="how">
        <h2 className="section-title">How it works</h2>
        <p className="section-sub">From signup to filing in 4 simple steps</p>
        <div className="how-steps">
          {[['1','Add your income','Enter receipts — cash and digital separately'],['2','Choose filing method','44AD, 44ADA, or normal filing'],['3','Compare regimes','See old vs new regime side by side'],['4','Download & file','Upload PDF to govt portal. Done!']].map(([n,t,d])=>(
            <div className="how-step" key={n}><div className="step-num">{n}</div><h4>{t}</h4><p>{d}</p></div>
          ))}
        </div>
      </div>
      <div className="pricing-section">
        <h2 className="section-title">Simple pricing</h2>
        <p className="section-sub">No hidden fees. Cancel anytime.</p>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Free</h3><div className="pricing-amount">₹0</div><div className="pricing-period">forever</div>
            <ul className="pricing-features"><li>1 financial year</li><li>Up to 50 entries</li><li>Tax calculation</li><li>Old & new regime</li></ul>
            <button className="btn btn-green" style={{width:'100%'}} onClick={()=>onNav('register')}>Get started free</button>
          </div>
          <div className="pricing-card popular">
            <h3>Pro</h3><div className="pricing-amount">₹299</div><div className="pricing-period">per year</div>
            <ul className="pricing-features"><li>Unlimited entries</li><li>All financial years</li><li>PDF download</li><li>All deductions</li><li>44AD + 44ADA</li></ul>
            <button className="btn" style={{width:'100%',background:'#fff',color:'var(--green)',fontWeight:600}} onClick={()=>onNav('register')}>Upgrade to Pro</button>
          </div>
          <div className="pricing-card">
            <h3>Premium</h3><div className="pricing-amount">₹799</div><div className="pricing-period">per year</div>
            <ul className="pricing-features"><li>Everything in Pro</li><li>CA consultation call</li><li>Priority support</li><li>GST tracking (coming)</li></ul>
            <button className="btn btn-green" style={{width:'100%'}} onClick={()=>onNav('register')}>Get Premium</button>
          </div>
        </div>
      </div>
      <div className="cta-section">
        <h2>Ready to file the easy way?</h2>
        <p>Join thousands of self-employed Indians who file stress-free</p>
        <button className="btn-hero btn-green" onClick={()=>onNav('register')}>Create free account</button>
      </div>
      <footer>© 2026 Simple Finance India · Made with ❤️ for self-employed Indians</footer>
    </div>
  )
}

function Login({ onNav, onLogin }) {
  const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); const [err,setErr]=useState('')
  const submit=()=>{
    if(!email||!pass){setErr('Please enter email and password.');return;}
    const stored=JSON.parse(localStorage.getItem('sfi_user')||'null')
    if(stored&&stored.email===email&&stored.password===pass){onLogin(stored);}
    else setErr('Incorrect email or password.')
  }
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Welcome back</h2><p className="sub">Log in to your Simple Finance India account</p>
        {err&&<div className="auth-error">{err}</div>}
        <div className="form-group"><label className="form-label">Email address</label><input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
        <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Your password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
        <button className="form-btn" onClick={submit}>Log in</button>
        <div className="auth-switch">Don't have an account? <a onClick={()=>onNav('register')}>Create one free</a></div>
        <div className="auth-switch" style={{marginTop:'0.5rem'}}><a onClick={()=>onNav('home')} style={{color:'var(--text3)'}}>← Back to home</a></div>
      </div>
    </div>
  )
}

function Register({ onNav, onLogin }) {
  const [form,setForm]=useState({name:'',email:'',password:'',pan:''}); const [err,setErr]=useState('')
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}))
  const submit=()=>{
    if(!form.name||!form.email||!form.password){setErr('Please fill name, email and password.');return;}
    if(form.password.length<8){setErr('Password must be at least 8 characters.');return;}
    if(form.pan&&form.pan.length!==10){setErr('PAN must be exactly 10 characters.');return;}
    const user={...form,pan:form.pan.toUpperCase(),createdAt:today()}
    localStorage.setItem('sfi_user',JSON.stringify(user))
    onLogin(user)
  }
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Create your account</h2><p className="sub">Free forever. No credit card needed.</p>
        {err&&<div className="auth-error">{err}</div>}
        <div className="form-group"><label className="form-label">Full name</label><input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={set('name')}/></div>
        <div className="form-group"><label className="form-label">Email address</label><input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')}/></div>
        <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')}/></div>
        <div className="form-group"><label className="form-label">PAN number (optional)</label><input className="form-input" type="text" placeholder="ABCDE1234F" maxLength={10} value={form.pan} onChange={set('pan')} style={{textTransform:'uppercase'}}/></div>
        <button className="form-btn" onClick={submit}>Create free account</button>
        <div className="auth-switch">Already have an account? <a onClick={()=>onNav('login')}>Log in</a></div>
        <div className="auth-switch" style={{marginTop:'0.5rem'}}><a onClick={()=>onNav('home')} style={{color:'var(--text3)'}}>← Back to home</a></div>
      </div>
    </div>
  )
}

function Dashboard({ user, entries, taxData, calcDone, onSection }) {
  const total=entries.reduce((s,e)=>s+e.amount,0)
  const months=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']
  const byMonth={}; months.forEach(m=>byMonth[m]=0)
  entries.forEach(e=>{ const d=new Date(e.date); const idx=d.getMonth()>=3?d.getMonth()-3:d.getMonth()+9; byMonth[months[idx]]=(byMonth[months[idx]]||0)+e.amount; })
  const maxM=Math.max(...Object.values(byMonth),1)
  const hasPAN=user.pan&&user.pan.length===10
  const checks=[hasPAN,entries.length>0,calcDone,calcDone&&entries.length>0]
  const done=checks.filter(Boolean).length
  const recent=[...entries].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,4)
  const daysLeft=Math.max(0,Math.ceil((new Date('2026-08-31')-new Date())/(1000*60*60*24)))
  const bestTax=calcDone?Math.min(taxData.newTotal,taxData.oldTotal):0

  return (
    <div>
      <div className="topbar">
        <div><div className="topbar-title">Good morning, {user.name.split(' ')[0]} 👋</div><div className="topbar-sub">FY 2025-26 · AY 2026-27</div></div>
        <div className="deadline-pill">⏰ ITR deadline: 31 Aug 2026 · {daysLeft} days left</div>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total income</div><div className="stat-value green-val">{fmt(total)}</div><div className="stat-sub">{entries.length} entries</div></div>
        <div className="stat-card"><div className="stat-label">Best tax option</div><div className="stat-value red-val">{calcDone?fmt(bestTax):'Not calculated'}</div><div className="stat-sub">{calcDone?(taxData.newTotal<=taxData.oldTotal?'New regime wins':'Old regime wins'):''}</div></div>
        <div className="stat-card"><div className="stat-label">Filing method</div><div className="stat-value" style={{fontSize:15}}>{calcDone?<span style={{background:'var(--blue-light)',color:'var(--blue)',padding:'3px 10px',borderRadius:10,fontSize:13}}>{taxData.filingMethod}</span>:'—'}</div></div>
        <div className="stat-card"><div className="stat-label">ITR-4 status</div><div className="stat-value" style={{fontSize:14,marginTop:4}}><span style={{background:calcDone?'var(--amber-light)':'#f5f5f5',color:calcDone?'var(--amber)':'#666',padding:'4px 10px',borderRadius:12,fontSize:13}}>{calcDone&&entries.length?'Draft ready':'Not started'}</span></div><div className="stat-sub">{Math.round((done/4)*100)}% complete</div></div>
      </div>
      <div className="panel-grid">
        <div className="panel">
          <h3>Monthly income — FY 2025-26</h3>
          {months.slice(0,9).map(m=>(
            <div className="bar-row" key={m}>
              <span className="bar-lbl">{m}</span>
              <div className="bar-track"><div className="bar-fill" style={{width:Math.round((byMonth[m]/maxM)*100)+'%'}}/></div>
              <span className="bar-amt">{byMonth[m]>0?fmt(byMonth[m]):'₹0'}</span>
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>Compliance checklist</h3>
          <div className="check-list">
            {['PAN number added','Income entries added','Tax calculated','ITR form ready','File on portal'].map((item,i)=>(
              <div className="ci" key={item}><div className={`dot ${i<4?(checks[i]?'done':'pend'):'pend'}`}/><span style={{color:i<4&&checks[i]?'var(--text)':'var(--text3)'}}>{item}</span></div>
            ))}
          </div>
          <div style={{marginTop:10,background:'var(--green-light)',borderRadius:6,padding:'6px 10px',fontSize:12,color:'var(--green)'}}>{done} of 4 done {done===4?'— Ready to file! 🎉':''}</div>
        </div>
      </div>
      <div className="quick-grid">
        <div className="panel"><h3>Quick actions</h3>
          <button className="quick-btn" onClick={()=>onSection('income')}>➕ &nbsp;Add income entry</button>
          <button className="quick-btn" onClick={()=>onSection('tax')}>🧮 &nbsp;Calculate my tax</button>
          <button className="quick-btn" onClick={()=>onSection('itr')}>📄 &nbsp;View ITR-4 form</button>
        </div>
        <div className="panel"><h3>Recent income entries</h3>
          {recent.length===0
            ? <p style={{color:'var(--text3)',fontSize:13}}>No entries yet. <a onClick={()=>onSection('income')} style={{color:'var(--green)',cursor:'pointer'}}>Add your first →</a></p>
            : recent.map(e=>(
                <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.5rem 0',borderBottom:'1px solid var(--bg)',fontSize:12}}>
                  <div><div style={{fontSize:13}}>{e.client}</div><div style={{color:'var(--text3)',fontSize:11}}>{fmtDate(e.date)}</div></div>
                  <div style={{textAlign:'right'}}><div style={{fontWeight:600}}>{fmt(e.amount)}</div><span className={`badge b-${e.category.toLowerCase()}`} style={{fontSize:10}}>{e.category}</span></div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}

function Income({ entries, setEntries, toast }) {
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({date:today(),amount:'',category:'Tuition',client:'',paymentMode:'Cash',desc:''})
  const [search,setSearch]=useState(''); const [filterCat,setFilterCat]=useState(''); const [filterPay,setFilterPay]=useState('')
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}))
  const save=()=>{
    if(!form.date||!form.amount||parseFloat(form.amount)<=0){toast('Please enter a valid date and amount');return;}
    const entry={id:Date.now(),date:form.date,amount:parseFloat(form.amount),category:form.category,client:form.client||'—',paymentMode:form.paymentMode,desc:form.desc,status:'Draft'}
    setEntries(p=>[...p,entry])
    toast(`Entry saved! ${fmt(form.amount)} added`)
    setForm({date:today(),amount:'',category:'Tuition',client:'',paymentMode:'Cash',desc:''})
    setShowForm(false)
  }
  const del=id=>{setEntries(p=>p.filter(e=>e.id!==id));toast('Entry deleted');}
  const confirm=id=>{setEntries(p=>p.map(e=>e.id===id?{...e,status:'Confirmed'}:e));toast('Entry confirmed');}
  const catClass={Tuition:'b-tuition',Coaching:'b-coaching',Freelance:'b-freelance',Consulting:'b-consulting'}
  const isDigital=m=>['UPI','Cheque/DD','Bank Transfer/NEFT/RTGS','Any Electronic Mode'].includes(m)
  const filtered=entries.filter(e=>
    (!search||e.client.toLowerCase().includes(search.toLowerCase())||(e.desc||'').toLowerCase().includes(search.toLowerCase()))&&
    (!filterCat||e.category===filterCat)&&(!filterPay||e.paymentMode===filterPay)
  ).sort((a,b)=>new Date(b.date)-new Date(a.date))
  const total=entries.reduce((s,e)=>s+e.amount,0)
  const cashTotal=entries.filter(e=>e.paymentMode==='Cash').reduce((s,e)=>s+e.amount,0)
  const digitalTotal=entries.filter(e=>isDigital(e.paymentMode)).reduce((s,e)=>s+e.amount,0)
  const avg=entries.length?Math.round(total/entries.length):0

  return (
    <div>
      <div className="page-header">
        <div><h1>Income entries</h1><p>FY 2025-26 · Cash and digital receipts tracked separately</p></div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-outline" style={{fontSize:13}} onClick={()=>toast('CSV bulk upload — coming soon!')}>⬆ Bulk upload CSV</button>
          <button className="btn btn-green" style={{fontSize:13}} onClick={()=>setShowForm(p=>!p)}>+ Add entry</button>
        </div>
      </div>

      {/* IMPORTANT NOTE */}
      <div style={{background:'var(--blue-light)',border:'1px solid #b3cff9',borderRadius:10,padding:'0.85rem 1rem',marginBottom:'1.25rem',fontSize:13,color:'var(--blue)'}}>
        <strong>Important:</strong> Under Section 44AD, cash receipts attract <strong>8% minimum profit</strong>, while digital payments (UPI, cheque, bank transfer, NEFT/RTGS) attract only <strong>6% minimum profit</strong>. Track them separately for correct tax calculation.
      </div>

      {showForm&&(
        <div className="add-form-box">
          <div style={{fontSize:14,fontWeight:600,color:'var(--navy)',marginBottom:'1rem'}}>New income entry</div>
          <div className="form-grid-3">
            <div><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={set('date')}/></div>
            <div><label className="form-label">Amount (₹)</label><input className="form-input" type="number" placeholder="e.g. 5000" value={form.amount} onChange={set('amount')}/></div>
            <div><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={set('category')}><option>Tuition</option><option>Coaching</option><option>Freelance</option><option>Consulting</option></select></div>
            <div><label className="form-label">Student / Client</label><input className="form-input" type="text" placeholder="e.g. Rohit Sharma" value={form.client} onChange={set('client')}/></div>
            <div>
              <label className="form-label">Payment mode <span style={{color:'var(--red)',fontSize:11}}>★ affects tax rate</span></label>
              <select className="form-input" value={form.paymentMode} onChange={set('paymentMode')}>
                <option value="Cash">Cash (8% rule)</option>
                <option value="UPI">UPI (6% rule)</option>
                <option value="Cheque/DD">Cheque / DD (6% rule)</option>
                <option value="Bank Transfer/NEFT/RTGS">Bank Transfer / NEFT / RTGS (6% rule)</option>
                <option value="Any Electronic Mode">Any other electronic mode (6% rule)</option>
              </select>
            </div>
            <div><label className="form-label">Description (optional)</label><input className="form-input" type="text" placeholder="e.g. Math – 4 classes" value={form.desc} onChange={set('desc')}/></div>
          </div>
          <div className="form-actions">
            <button className="btn-sm btn-save" onClick={save}>Save entry</button>
            <button className="btn-sm btn-cancel" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="income-stats">
        <div className="stat-card"><div className="stat-label">Total income</div><div className="stat-value green-val">{fmt(total)}</div><div className="stat-sub">{entries.length} entries</div></div>
        <div className="stat-card"><div className="stat-label">Cash receipts (8% rule)</div><div className="stat-value">{fmt(cashTotal)}</div><div className="stat-sub">Min profit: {fmt(cashTotal*0.08)}</div></div>
        <div className="stat-card"><div className="stat-label">Digital receipts (6% rule)</div><div className="stat-value">{fmt(digitalTotal)}</div><div className="stat-sub">Min profit: {fmt(digitalTotal*0.06)}</div></div>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search by name or description..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}><option value="">All categories</option><option>Tuition</option><option>Coaching</option><option>Freelance</option><option>Consulting</option></select>
        <select value={filterPay} onChange={e=>setFilterPay(e.target.value)}><option value="">All payment modes</option><option>Cash</option><option>UPI</option><option>Cheque/DD</option><option>Bank Transfer/NEFT/RTGS</option><option>Any Electronic Mode</option></select>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Client</th><th>Category</th><th>Payment mode</th><th>Rate</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text3)',padding:'2rem'}}>No entries found. Click "+ Add entry" to start.</td></tr>
              : filtered.map(e=>(
                  <tr key={e.id}>
                    <td>{fmtDate(e.date)}</td>
                    <td>{e.client}</td>
                    <td><span className={`badge ${catClass[e.category]||'b-coaching'}`}>{e.category}</span></td>
                    <td style={{fontSize:12}}>{e.paymentMode}</td>
                    <td><span style={{fontSize:11,background:isDigital(e.paymentMode)?'var(--green-light)':'var(--amber-light)',color:isDigital(e.paymentMode)?'var(--green)':'var(--amber)',padding:'2px 7px',borderRadius:8,fontWeight:600}}>{isDigital(e.paymentMode)?'6%':'8%'}</span></td>
                    <td style={{fontWeight:600}}>{fmt(e.amount)}</td>
                    <td><span className={`badge ${e.status==='Confirmed'?'b-confirmed':'b-draft'}`}>{e.status}</span></td>
                    <td>
                      {e.status==='Draft'&&<button className="tbl-btn" onClick={()=>confirm(e.id)}>Confirm</button>}
                      <button className="tbl-btn del" onClick={()=>del(e.id)}>Delete</button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
          {filtered.length>0&&<tfoot><tr><td colSpan={8} style={{fontSize:12,color:'var(--text3)',padding:'.65rem .85rem'}}>Showing {filtered.length} of {entries.length} entries · Total: {fmt(filtered.reduce((s,e)=>s+e.amount,0))}</td></tr></tfoot>}
        </table>
      </div>
    </div>
  )
}

function Tax({ entries, taxData, setTaxData, calcDone, setCalcDone, onSection, toast }) {
  const isDigital=m=>['UPI','Cheque/DD','Bank Transfer/NEFT/RTGS','Any Electronic Mode'].includes(m)
  const cashReceipts=entries.filter(e=>e.paymentMode==='Cash').reduce((s,e)=>s+e.amount,0)
  const digitalReceipts=entries.filter(e=>isDigital(e.paymentMode)).reduce((s,e)=>s+e.amount,0)
  const totalReceipts=cashReceipts+digitalReceipts

  // Filing method state
  const [filingMethod,setFilingMethod]=useState(taxData.filingMethod||'44AD')
  const [manualReceipts,setManualReceipts]=useState(taxData.receipts||'')
  const [manualCash,setManualCash]=useState(taxData.cashReceipts||'')
  const [manualDigital,setManualDigital]=useState(taxData.digitalReceipts||'')
  const [declaredIncome,setDeclaredIncome]=useState(taxData.declaredIncome||'')
  const [normalIncome,setNormalIncome]=useState(taxData.normalIncome||'')
  // Old regime deductions
  const [ded80C,setDed80C]=useState(taxData.ded80C||'')
  const [ded80D,setDed80D]=useState(taxData.ded80D||'')
  const [dedHRA,setDedHRA]=useState(taxData.dedHRA||'')
  const [dedNPS,setDedNPS]=useState(taxData.dedNPS||'')
  const [dedOther,setDedOther]=useState(taxData.dedOther||'')

  const useEntries=entries.length>0
  const cashAmt=useEntries?cashReceipts:parseFloat(manualCash)||0
  const digitalAmt=useEntries?digitalReceipts:parseFloat(manualDigital)||0
  const totalAmt=useEntries?totalReceipts:parseFloat(manualReceipts)||0

  const minPresumptive=cashAmt*0.08+digitalAmt*0.06
  const totalDeductions=Math.min(parseFloat(ded80C)||0,150000)+(parseFloat(ded80D)||0)+(parseFloat(dedHRA)||0)+Math.min(parseFloat(dedNPS)||0,50000)+(parseFloat(dedOther)||0)

  const calculate=()=>{
    let grossIncome=0
    if(filingMethod==='44AD'){
      const cash=cashAmt; const digital=digitalAmt
      if(!cash&&!digital&&!totalAmt){toast('Please enter your receipts or add income entries first');return;}
      const minProfit=cash*0.08+digital*0.06
      const declared=parseFloat(declaredIncome)||0
      grossIncome=Math.max(minProfit,declared||totalAmt)
    } else if(filingMethod==='44ADA'){
      const total=totalAmt; if(!total){toast('Please enter your gross receipts');return;}
      const minProfit=total*0.50
      const declared=parseFloat(declaredIncome)||0
      grossIncome=Math.max(minProfit,declared||total)
    } else {
      grossIncome=parseFloat(normalIncome)||0
      if(!grossIncome){toast('Please enter your net income (after expenses)');return;}
    }

    // New regime
    const newTaxable=Math.max(0,grossIncome-75000) // std deduction ₹75k for new regime
    const newTax=calcNewRegimeTax(newTaxable)
    const newCess=newTax*0.04
    const newTotal=newTax+newCess

    // Old regime (with deductions)
    const {tax:oldTax,taxable:oldTaxable}=calcOldRegimeTax(grossIncome,totalDeductions+50000) // 50k std deduction old regime
    const oldCess=oldTax*0.04
    const oldTotal=oldTax+oldCess

    const data={
      filingMethod,cashReceipts:cashAmt,digitalReceipts:digitalAmt,receipts:totalAmt,
      minPresumptive,declaredIncome:grossIncome,normalIncome:parseFloat(normalIncome)||0,
      newTaxable,newTax,newCess,newTotal,
      oldTaxable,oldTax,oldCess,oldTotal,
      ded80C:parseFloat(ded80C)||0,ded80D:parseFloat(ded80D)||0,dedHRA:parseFloat(dedHRA)||0,dedNPS:parseFloat(dedNPS)||0,dedOther:parseFloat(dedOther)||0,
      totalDeductions,grossIncome,
      betterRegime:newTotal<=oldTotal?'New regime':'Old regime',
      savings:Math.abs(newTotal-oldTotal)
    }
    setTaxData(data); setCalcDone(true)
    const better=newTotal<=oldTotal?'New regime':'Old regime'
    toast(`Tax calculated! ${better} saves you ${fmt(Math.abs(newTotal-oldTotal))}`)
  }

  const newSlabs=[['Up to ₹3,00,000','0%'],['₹3,00,001 – ₹7,00,000','5%'],['₹7,00,001 – ₹10,00,000','10%'],['₹10,00,001 – ₹12,00,000','15%'],['₹12,00,001 – ₹15,00,000','20%'],['Above ₹15,00,000','30%']]
  const oldSlabs=[['Up to ₹2,50,000','0%'],['₹2,50,001 – ₹5,00,000','5%'],['₹5,00,001 – ₹10,00,000','20%'],['Above ₹10,00,000','30%']]

  return (
    <div>
      <div className="page-header"><div><h1>Tax calculator</h1><p>Old regime vs new regime · All filing methods · FY 2025-26</p></div></div>

      {/* FILING METHOD SELECTOR */}
      <div className="panel" style={{marginBottom:'1.25rem'}}>
        <h3>Step 1 — Choose your filing method</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:'0.5rem'}}>
          {[
            ['44AD','Section 44AD','For traders, tutors, coaches (turnover ≤ ₹50 lakhs). Presumptive: 8% cash, 6% digital.'],
            ['44ADA','Section 44ADA','For professionals: doctors, lawyers, engineers, architects (receipts ≤ ₹75 lakhs). 50% presumptive.'],
            ['Normal','Normal filing','Maintain books of accounts. Declare actual income minus actual expenses.'],
          ].map(([val,label,desc])=>(
            <div key={val} onClick={()=>setFilingMethod(val)} style={{border:`2px solid ${filingMethod===val?'var(--green)':'var(--border)'}`,borderRadius:10,padding:'1rem',cursor:'pointer',background:filingMethod===val?'var(--green-light)':'var(--white)'}}>
              <div style={{fontWeight:600,color:filingMethod===val?'var(--green)':'var(--navy)',marginBottom:4}}>{label}</div>
              <div style={{fontSize:11,color:'var(--text2)',lineHeight:1.5}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="tax-grid">
        <div>
          {/* INCOME INPUT */}
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Step 2 — Enter your income details</h3>

            {filingMethod==='44AD'&&(
              <>
                {useEntries
                  ? <div style={{background:'var(--green-light)',borderRadius:8,padding:'0.75rem 1rem',marginBottom:'1rem',fontSize:13,color:'var(--green)'}}>
                      ✅ Auto-filled from your income entries: Cash: {fmt(cashReceipts)} · Digital: {fmt(digitalReceipts)}
                    </div>
                  : <>
                      <div className="input-row"><label>Cash receipts (₹) <span style={{fontSize:11,color:'var(--amber)'}}>8% rule</span></label><input className="big-input" type="number" placeholder="e.g. 200000" value={manualCash} onChange={e=>setManualCash(e.target.value)}/><div className="hint">Income received in cash</div></div>
                      <div className="input-row"><label>Digital receipts (₹) <span style={{fontSize:11,color:'var(--green)'}}>6% rule — UPI, cheque, bank transfer, NEFT/RTGS</span></label><input className="big-input" type="number" placeholder="e.g. 160000" value={manualDigital} onChange={e=>setManualDigital(e.target.value)}/><div className="hint">Cheque, DD, UPI, bank transfer, NEFT, RTGS, or any electronic mode</div></div>
                    </>
                }
                <div style={{background:'var(--amber-light)',border:'1px solid #ffc107',borderRadius:8,padding:'0.75rem 1rem',fontSize:12,color:'var(--amber)',marginBottom:'1rem'}}>
                  Minimum presumptive income = <strong>Cash × 8% + Digital × 6% = {fmt(minPresumptive)}</strong>
                </div>
                <div className="input-row"><label>Income you want to declare (₹) — optional</label><input className="big-input" type="number" placeholder={`Min = ${fmt(minPresumptive)}`} value={declaredIncome} onChange={e=>setDeclaredIncome(e.target.value)}/><div className="hint">Leave blank to use minimum presumptive income. You can declare more if you wish.</div></div>
              </>
            )}

            {filingMethod==='44ADA'&&(
              <>
                <div className="input-row"><label>Gross receipts (₹)</label><input className="big-input" type="number" placeholder="e.g. 600000" value={manualReceipts} onChange={e=>setManualReceipts(e.target.value)}/><div className="hint">Total professional receipts for the year (must be ≤ ₹75 lakhs)</div></div>
                <div style={{background:'var(--amber-light)',border:'1px solid #ffc107',borderRadius:8,padding:'0.75rem 1rem',fontSize:12,color:'var(--amber)',marginBottom:'1rem'}}>
                  Minimum presumptive income = <strong>Gross receipts × 50% = {fmt((parseFloat(manualReceipts)||0)*0.5)}</strong>
                </div>
                <div className="input-row"><label>Income you want to declare (₹) — optional</label><input className="big-input" type="number" placeholder={`Min = ${fmt((parseFloat(manualReceipts)||0)*0.5)}`} value={declaredIncome} onChange={e=>setDeclaredIncome(e.target.value)}/><div className="hint">Must be at least 50% of gross receipts</div></div>
              </>
            )}

            {filingMethod==='Normal'&&(
              <>
                <div className="input-row"><label>Net income after all expenses (₹)</label><input className="big-input" type="number" placeholder="e.g. 280000" value={normalIncome} onChange={e=>setNormalIncome(e.target.value)}/><div className="hint">Total income minus all allowable business expenses from your books of accounts</div></div>
                <div style={{background:'var(--blue-light)',border:'1px solid #b3cff9',borderRadius:8,padding:'0.75rem 1rem',fontSize:12,color:'var(--blue)'}}>Note: If you choose normal filing, you must maintain proper books of accounts and may be subject to tax audit if income exceeds prescribed limits.</div>
              </>
            )}

            {/* OLD REGIME DEDUCTIONS */}
            <div style={{marginTop:'1.25rem',borderTop:'1px solid var(--border)',paddingTop:'1rem'}}>
              <h3 style={{marginBottom:'0.75rem'}}>Old regime deductions (for comparison)</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <div><label className="form-label">80C — LIC, PPF, ELSS (max ₹1.5L)</label><input className="form-input" type="number" placeholder="e.g. 150000" value={ded80C} onChange={e=>setDed80C(e.target.value)}/></div>
                <div><label className="form-label">80D — Health insurance</label><input className="form-input" type="number" placeholder="e.g. 25000" value={ded80D} onChange={e=>setDed80D(e.target.value)}/></div>
                <div><label className="form-label">HRA exemption</label><input className="form-input" type="number" placeholder="e.g. 0" value={dedHRA} onChange={e=>setDedHRA(e.target.value)}/></div>
                <div><label className="form-label">80CCD(1B) — NPS (max ₹50k)</label><input className="form-input" type="number" placeholder="e.g. 50000" value={dedNPS} onChange={e=>setDedNPS(e.target.value)}/></div>
                <div style={{gridColumn:'1/-1'}}><label className="form-label">Other deductions (80G, 80TTA, etc.)</label><input className="form-input" type="number" placeholder="e.g. 0" value={dedOther} onChange={e=>setDedOther(e.target.value)}/></div>
              </div>
              {totalDeductions>0&&<div style={{marginTop:8,fontSize:12,color:'var(--green)'}}>Total deductions (old regime): {fmt(totalDeductions)} + ₹50,000 standard deduction</div>}
            </div>

            <button className="calc-btn" style={{marginTop:'1rem'}} onClick={calculate}>Calculate & compare both regimes</button>
          </div>

          {/* SLAB TABLES */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div className="panel">
              <h3 style={{color:'var(--green)'}}>New regime slabs</h3>
              {newSlabs.map(([r,t],i)=><div key={i} className="slab-item"><span>{r}</span><span>{t}</span></div>)}
              <div style={{fontSize:11,color:'var(--text3)',marginTop:8}}>Rebate u/s 87A: Zero tax if income ≤ ₹7 lakh</div>
            </div>
            <div className="panel">
              <h3 style={{color:'var(--blue)'}}>Old regime slabs</h3>
              {oldSlabs.map(([r,t],i)=><div key={i} className="slab-item"><span>{r}</span><span>{t}</span></div>)}
              <div style={{fontSize:11,color:'var(--text3)',marginTop:8}}>Rebate u/s 87A: Zero tax if income ≤ ₹5 lakh</div>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div>
          {calcDone?(
            <>
              {/* WINNER BANNER */}
              <div style={{background:taxData.betterRegime==='New regime'?'var(--green)':'var(--blue)',color:'#fff',borderRadius:12,padding:'1rem 1.25rem',marginBottom:'1.25rem',textAlign:'center'}}>
                <div style={{fontSize:13,opacity:.85,marginBottom:4}}>Recommended for you</div>
                <div style={{fontSize:20,fontWeight:700}}>{taxData.betterRegime}</div>
                <div style={{fontSize:13,marginTop:4}}>Saves you {fmt(taxData.savings)} vs the other regime</div>
              </div>

              {/* NEW REGIME */}
              <div className="panel" style={{marginBottom:'1.25rem',border:'2px solid var(--green)'}}>
                <h3 style={{color:'var(--green)'}}>New regime {taxData.betterRegime==='New regime'?'✅ (Better)':''}</h3>
                <div className="result-row"><span className="r-label">Gross income</span><span className="r-val">{fmt(taxData.grossIncome)}</span></div>
                <div className="result-row"><span className="r-label">Standard deduction</span><span className="r-val">− ₹75,000</span></div>
                <div className="result-row"><span className="r-label">Taxable income</span><span className="r-val">{fmt(taxData.newTaxable)}</span></div>
                <div className="result-row"><span className="r-label">Income tax</span><span className="r-val red-val">{fmt(taxData.newTax)}</span></div>
                <div className="result-row"><span className="r-label">Health & education cess (4%)</span><span className="r-val red-val">{fmt(taxData.newCess)}</span></div>
                <div className="total-box"><span className="total-label">Total payable</span><span className="total-val">{fmt(taxData.newTotal)}</span></div>
              </div>

              {/* OLD REGIME */}
              <div className="panel" style={{marginBottom:'1.25rem',border:`2px solid ${taxData.betterRegime==='Old regime'?'var(--blue)':'var(--border)'}`}}>
                <h3 style={{color:'var(--blue)'}}>Old regime {taxData.betterRegime==='Old regime'?'✅ (Better)':''}</h3>
                <div className="result-row"><span className="r-label">Gross income</span><span className="r-val">{fmt(taxData.grossIncome)}</span></div>
                <div className="result-row"><span className="r-label">Standard deduction</span><span className="r-val">− ₹50,000</span></div>
                <div className="result-row"><span className="r-label">Section 80C / 80D / HRA etc.</span><span className="r-val">− {fmt(taxData.totalDeductions)}</span></div>
                <div className="result-row"><span className="r-label">Taxable income</span><span className="r-val">{fmt(taxData.oldTaxable)}</span></div>
                <div className="result-row"><span className="r-label">Income tax</span><span className="r-val red-val">{fmt(taxData.oldTax)}</span></div>
                <div className="result-row"><span className="r-label">Health & education cess (4%)</span><span className="r-val red-val">{fmt(taxData.oldCess)}</span></div>
                <div className="total-box" style={{background:'var(--blue-light)'}}><span className="total-label" style={{color:'var(--blue)'}}>Total payable</span><span className="total-val" style={{color:'var(--blue)'}}>{fmt(taxData.oldTotal)}</span></div>
              </div>

              <div className="panel">
                <h3>Filing method used</h3>
                <div className="result-row"><span className="r-label">Method</span><span className="r-val">{taxData.filingMethod}</span></div>
                {taxData.filingMethod==='44AD'&&<>
                  <div className="result-row"><span className="r-label">Cash receipts (8%)</span><span className="r-val">{fmt(taxData.cashReceipts)} → min {fmt(taxData.cashReceipts*0.08)}</span></div>
                  <div className="result-row"><span className="r-label">Digital receipts (6%)</span><span className="r-val">{fmt(taxData.digitalReceipts)} → min {fmt(taxData.digitalReceipts*0.06)}</span></div>
                </>}
                <button className="gen-btn" onClick={()=>onSection('itr')}>Generate ITR-4 with this data →</button>
              </div>
            </>
          ):(
            <div className="panel" style={{textAlign:'center',padding:'3rem'}}>
              <div style={{fontSize:40,marginBottom:'1rem'}}>🧮</div>
              <h3 style={{marginBottom:'0.5rem'}}>Calculate your tax</h3>
              <p style={{color:'var(--text2)',fontSize:13}}>Fill in your income details on the left and click "Calculate" to see old regime vs new regime side by side.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ITR({ user, entries, taxData, calcDone, toast }) {
  const total=entries.reduce((s,e)=>s+e.amount,0)
  const pct=calcDone&&entries.length>0?85:entries.length>0?50:20
  const bestTax=calcDone?Math.min(taxData.newTotal,taxData.oldTotal):0
  const bestRegime=calcDone?taxData.betterRegime:'—'

  const download=()=>{
    if(!calcDone||entries.length===0){toast('Please add income entries and calculate tax first');return;}
    const lines=[
      'SIMPLE FINANCE INDIA — ITR-4 SUMMARY',
      '=========================================',
      `Assessment Year: AY 2026-27 | Financial Year: FY 2025-26`,
      '',
      'PERSONAL DETAILS',
      `Name: ${user.name}`,
      `PAN: ${user.pan||'Not provided'}`,
      `Filing reason: Voluntary filing`,
      '',
      `FILING METHOD: ${taxData.filingMethod}`,
      '',
      taxData.filingMethod==='44AD'?[
        'SECTION 44AD — PRESUMPTIVE TAXATION',
        `Business code: 17006 (Coaching / Tuitions)`,
        `Cash receipts (E1b): Rs. ${Math.round(taxData.cashReceipts||0).toLocaleString('en-IN')} @ 8% = Rs. ${Math.round((taxData.cashReceipts||0)*0.08).toLocaleString('en-IN')}`,
        `Digital receipts (E1b): Rs. ${Math.round(taxData.digitalReceipts||0).toLocaleString('en-IN')} @ 6% = Rs. ${Math.round((taxData.digitalReceipts||0)*0.06).toLocaleString('en-IN')}`,
        `Declared income (E2b): Rs. ${Math.round(taxData.declaredIncome||0).toLocaleString('en-IN')}`,
      ].join('\n'):'',
      '',
      'TAX COMPUTATION',
      `Gross income: Rs. ${Math.round(taxData.grossIncome||0).toLocaleString('en-IN')}`,
      '',
      `NEW REGIME:`,
      `  Taxable income: Rs. ${Math.round(taxData.newTaxable||0).toLocaleString('en-IN')}`,
      `  Tax: Rs. ${Math.round(taxData.newTax||0).toLocaleString('en-IN')}`,
      `  Cess: Rs. ${Math.round(taxData.newCess||0).toLocaleString('en-IN')}`,
      `  TOTAL: Rs. ${Math.round(taxData.newTotal||0).toLocaleString('en-IN')}`,
      '',
      `OLD REGIME (deductions: Rs. ${Math.round(taxData.totalDeductions||0).toLocaleString('en-IN')}):`,
      `  Taxable income: Rs. ${Math.round(taxData.oldTaxable||0).toLocaleString('en-IN')}`,
      `  Tax: Rs. ${Math.round(taxData.oldTax||0).toLocaleString('en-IN')}`,
      `  Cess: Rs. ${Math.round(taxData.oldCess||0).toLocaleString('en-IN')}`,
      `  TOTAL: Rs. ${Math.round(taxData.oldTotal||0).toLocaleString('en-IN')}`,
      '',
      `RECOMMENDED: ${bestRegime} (saves Rs. ${Math.round(taxData.savings||0).toLocaleString('en-IN')})`,
      `FINAL TAX PAYABLE: Rs. ${Math.round(bestTax).toLocaleString('en-IN')}`,
      '',
      `INCOME ENTRIES: ${entries.length} entries | Total: Rs. ${total.toLocaleString('en-IN')}`,
      '',
      'Generated by Simple Finance India | Deadline: 31 August 2026',
      'Upload to: www.incometax.gov.in',
    ].join('\n')
    const blob=new Blob([lines],{type:'text/plain'})
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob)
    a.download=`ITR4_${user.name.replace(/ /g,'_')}_AY2026-27.txt`; a.click()
    toast('ITR-4 summary downloaded!')
  }

  return (
    <div>
      <div className="page-header"><div><h1>ITR-4 form</h1><p>Auto-filled from your income and tax data</p></div></div>
      <div className="steps-row">
        <div className="itr-step done">✓ Personal details</div>
        <div className="itr-step done">✓ Income details</div>
        <div className="itr-step done">✓ Tax computation</div>
        <div className="itr-step active">Review & download</div>
      </div>
      <div className="progress-wrap">
        <div className="progress-label"><span>Form completion</span><span style={{color:'var(--green)',fontWeight:600}}>{pct}%</span></div>
        <div className="progress-track"><div className="progress-bar" style={{width:pct+'%'}}/></div>
      </div>
      {!calcDone&&<div className="warn-box">⚠ Please go to Tax Calculator and calculate your tax first before downloading ITR.</div>}
      <div className="itr-grid">
        <div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Personal details ✅</h3>
            <div className="field-row2"><span className="f-label">Full name</span><span className="f-val">{user.name}</span></div>
            <div className="field-row2"><span className="f-label">PAN number</span><span className="f-val">{user.pan||<span className="f-missing">Not added</span>}</span></div>
            <div className="field-row2"><span className="f-label">Assessment year</span><span className="f-val">AY 2026-27</span></div>
            <div className="field-row2"><span className="f-label">Filing reason</span><span className="f-val">Voluntary filing</span></div>
          </div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Business income — {calcDone?taxData.filingMethod:'Section 44AD'}</h3>
            {calcDone&&taxData.filingMethod==='44AD'&&<>
              <div className="field-row2"><span className="f-label">Business code</span><span className="f-val">17006 (Tuitions)</span></div>
              <div className="field-row2"><span className="f-label">Cash receipts @ 8%</span><span className="f-val">{fmt(taxData.cashReceipts||0)} → {fmt((taxData.cashReceipts||0)*0.08)}</span></div>
              <div className="field-row2"><span className="f-label">Digital receipts @ 6%</span><span className="f-val">{fmt(taxData.digitalReceipts||0)} → {fmt((taxData.digitalReceipts||0)*0.06)}</span></div>
              <div className="field-row2"><span className="f-label">Declared income (E2b)</span><span className="f-val">{fmt(taxData.declaredIncome||0)}</span></div>
            </>}
            {calcDone&&taxData.filingMethod==='44ADA'&&<>
              <div className="field-row2"><span className="f-label">Gross receipts</span><span className="f-val">{fmt(taxData.receipts||0)}</span></div>
              <div className="field-row2"><span className="f-label">Declared income (50%)</span><span className="f-val">{fmt(taxData.grossIncome||0)}</span></div>
            </>}
            {calcDone&&taxData.filingMethod==='Normal'&&<>
              <div className="field-row2"><span className="f-label">Net income (after expenses)</span><span className="f-val">{fmt(taxData.grossIncome||0)}</span></div>
            </>}
            {!calcDone&&<div style={{color:'var(--text3)',fontSize:13}}>Complete tax calculation first</div>}
          </div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Tax computation</h3>
            <div className="field-row2"><span className="f-label">Recommended regime</span><span className="f-val" style={{color:'var(--green)'}}>{calcDone?bestRegime:'—'}</span></div>
            <div className="field-row2"><span className="f-label">New regime tax</span><span className="f-val red-val">{calcDone?fmt(taxData.newTotal):'—'}</span></div>
            <div className="field-row2"><span className="f-label">Old regime tax</span><span className="f-val" style={{color:'var(--blue)'}}>{calcDone?fmt(taxData.oldTotal):'—'}</span></div>
            <div className="field-row2"><span className="f-label">You save</span><span className="f-val green-val">{calcDone?fmt(taxData.savings):'—'}</span></div>
            <div className="field-row2"><span className="f-label">Final tax payable</span><span className="f-val red-val" style={{fontSize:16}}>{calcDone?fmt(bestTax):'—'}</span></div>
          </div>
          <div className="panel">
            <h3>Bank details ⚠</h3>
            <div className="field-row2"><span className="f-label">Account number</span><span className="f-missing">⚠ Add before filing</span></div>
            <div className="field-row2"><span className="f-label">IFSC code</span><span className="f-missing">⚠ Add before filing</span></div>
          </div>
        </div>
        <div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Ready to file?</h3>
            <div className="checklist2">
              <div className="ci2"><span style={{fontSize:16}}>✅</span> PAN details verified</div>
              <div className="ci2"><span style={{fontSize:16}}>✅</span> Income entries confirmed</div>
              <div className="ci2"><span style={{fontSize:16}}>{calcDone?'✅':'⬜'}</span> Tax calculated (both regimes)</div>
              <div className="ci2"><span style={{fontSize:16}}>{calcDone?'✅':'⬜'}</span> Best regime identified</div>
              <div className="ci2"><span style={{fontSize:16}}>⚠️</span> Bank account details pending</div>
              <div className="ci2"><span style={{fontSize:16}}>⬜</span> Download and upload to portal</div>
            </div>
          </div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Download your ITR</h3>
            <button className="dl-btn" onClick={download}>⬇ Download ITR-4 Summary</button>
            <button className="portal-btn" onClick={()=>window.open('https://www.incometax.gov.in','_blank')}>🌐 Open income-tax.gov.in portal</button>
            <p className="note-sm">Download the summary and upload at income-tax.gov.in. Deadline: <strong>31 August 2026</strong>.</p>
          </div>
          <div className="summary-box">
            <strong>Filing summary</strong><br/>
            Total income: {fmt(total)}<br/>
            Filing method: {calcDone?taxData.filingMethod:'—'}<br/>
            Recommended regime: {calcDone?bestRegime:'—'}<br/>
            Tax payable: {fmt(bestTax)}<br/>
            You saved: {calcDone?fmt(taxData.savings):'—'}<br/>
            ITR form: ITR-4 (Sugam)<br/>
            AY: 2026-27
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [page,setPage]=useState('home')
  const [section,setSection]=useState('dashboard')
  const [user,setUser]=useState(null)
  const [entries,setEntries]=useState([])
  const [taxData,setTaxData]=useState({})
  const [calcDone,setCalcDone]=useState(false)
  const [toastMsg,setToastMsg]=useState(null)
  const toast=msg=>setToastMsg(msg)

  const handleLogin=u=>{
    setUser(u)
    const saved=JSON.parse(localStorage.getItem('sfi_entries_'+u.email)||'[]')
    const savedTax=JSON.parse(localStorage.getItem('sfi_tax_'+u.email)||'null')
    setEntries(saved)
    if(savedTax){setTaxData(savedTax);setCalcDone(true)}
    setPage('app'); setSection('dashboard')
    toast('Welcome back, '+u.name.split(' ')[0]+'!')
  }
  const handleLogout=()=>{setUser(null);setEntries([]);setCalcDone(false);setTaxData({});setPage('home');}
  const updateEntries=fn=>{
    setEntries(p=>{const next=typeof fn==='function'?fn(p):fn; if(user) localStorage.setItem('sfi_entries_'+user.email,JSON.stringify(next)); return next;})
  }
  const updateTax=data=>{
    setTaxData(data); setCalcDone(true)
    if(user) localStorage.setItem('sfi_tax_'+user.email,JSON.stringify(data))
  }
  const sideNav=[{id:'dashboard',icon:'🏠',label:'Dashboard'},{id:'income',icon:'💰',label:'Income entries'},{id:'tax',icon:'🧮',label:'Tax calculator'},{id:'itr',icon:'📄',label:'ITR-4 form'}]

  return (
    <>
      <Nav page={page} user={user} onNav={setPage} onLogout={handleLogout}/>
      {page==='home'&&<Home onNav={setPage}/>}
      {page==='login'&&<Login onNav={setPage} onLogin={handleLogin}/>}
      {page==='register'&&<Register onNav={setPage} onLogin={handleLogin}/>}
      {page==='app'&&(
        <div className="app-layout">
          <div className="sidebar">
            <div className="sidebar-logo">Simple Finance <span>India</span></div>
            {sideNav.map(s=>(
              <div key={s.id} className={`sidebar-item ${section===s.id?'active':''}`} onClick={()=>setSection(s.id)}>
                <span>{s.icon}</span>{s.label}
              </div>
            ))}
          </div>
          <div className="app-main">
            {section==='dashboard'&&<Dashboard user={user} entries={entries} taxData={taxData} calcDone={calcDone} onSection={setSection}/>}
            {section==='income'&&<Income entries={entries} setEntries={updateEntries} toast={toast}/>}
            {section==='tax'&&<Tax entries={entries} taxData={taxData} setTaxData={updateTax} calcDone={calcDone} setCalcDone={setCalcDone} onSection={setSection} toast={toast}/>}
            {section==='itr'&&<ITR user={user} entries={entries} taxData={taxData} calcDone={calcDone} toast={toast}/>}
          </div>
        </div>
      )}
      {toastMsg&&<Toast msg={toastMsg} onDone={()=>setToastMsg(null)}/>}
    </>
  )
}
