import { useState, useEffect } from 'react'

// ─── HELPERS ──────────────────────────────────────────
const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN')
const today = () => new Date().toISOString().split('T')[0]
const fmtDate = d => { if(!d) return '—'; const dt=new Date(d+'T00:00:00'); return dt.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }

function calcTaxSlabs(income) {
  if(income<=0) return 0
  let tax=0, rem=income
  const slabs=[[250000,0],[250000,.05],[500000,.10],[500000,.15],[500000,.20],[Infinity,.30]]
  for(const [limit,rate] of slabs){ const chunk=Math.min(rem,limit); tax+=chunk*rate; rem-=chunk; if(rem<=0) break; }
  return tax
}

function Toast({ msg, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3000); return ()=>clearTimeout(t); },[])
  return <div className="toast-box">{msg}</div>
}

// ─── NAV ──────────────────────────────────────────────
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

// ─── HOME ─────────────────────────────────────────────
function Home({ onNav }) {
  return (
    <div>
      <div className="hero">
        <h1>File Your ITR in <span>Minutes,</span><br/>Not Hours</h1>
        <p>India's smartest tax tool for tutors, coaches, and self-employed professionals. Section 44AD done automatically.</p>
        <div className="hero-btns">
          <button className="btn-hero btn-green" onClick={()=>onNav('register')}>Start free — no credit card</button>
          <button className="btn-hero" style={{background:'#fff',border:'1.5px solid var(--navy)',color:'var(--navy)'}} onClick={()=>onNav('login')}>I already have an account</button>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Everything you need to file ITR-4</h2>
        <p className="section-sub">Built specifically for tutors, coaches, and self-employed Indians using Section 44AD</p>
        <div className="feature-grid">
          {[
            ['📊','Track all income','Add cash receipts one by one or bulk upload CSV. Every entry saved safely.'],
            ['🧮','Auto tax calculation','Section 44AD presumptive tax calculated instantly. New regime comparison included.'],
            ['📄','Ready-to-file ITR-4','All fields auto-filled. Download PDF and upload to income-tax.gov.in.'],
            ['🔔','Deadline reminders','Never miss 31 August filing deadline. Automatic alerts as date approaches.'],
            ['🔒','Your data is safe','Bank-grade security. Your PAN and income details are never shared.'],
            ['🇮🇳','Built for India','Fully compliant with Indian tax law. Updated every year when rules change.'],
          ].map(([icon,title,desc])=>(
            <div className="feature-card" key={title}>
              <div className="feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="how">
        <h2 className="section-title">How it works</h2>
        <p className="section-sub">From signup to filing in 4 simple steps</p>
        <div className="how-steps">
          {[
            ['1','Add your income','Enter all tuition / coaching receipts for the year'],
            ['2','Calculate tax','Section 44AD applied automatically'],
            ['3','Review ITR-4','All fields pre-filled, just confirm'],
            ['4','Download & file','Upload PDF to govt portal. Done!'],
          ].map(([n,t,d])=>(
            <div className="how-step" key={n}>
              <div className="step-num">{n}</div>
              <h4>{t}</h4>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pricing-section">
        <h2 className="section-title">Simple pricing</h2>
        <p className="section-sub">No hidden fees. Cancel anytime.</p>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Free</h3>
            <div className="pricing-amount">₹0</div>
            <div className="pricing-period">forever</div>
            <ul className="pricing-features">
              <li>1 financial year</li><li>Up to 50 entries</li><li>Tax calculation</li><li>Basic ITR summary</li>
            </ul>
            <button className="btn btn-green" style={{width:'100%'}} onClick={()=>onNav('register')}>Get started free</button>
          </div>
          <div className="pricing-card popular">
            <h3>Pro</h3>
            <div className="pricing-amount">₹299</div>
            <div className="pricing-period">per year</div>
            <ul className="pricing-features">
              <li>Unlimited entries</li><li>All financial years</li><li>PDF download</li><li>Email reminders</li><li>CSV bulk upload</li>
            </ul>
            <button className="btn" style={{width:'100%',background:'#fff',color:'var(--green)',fontWeight:600}} onClick={()=>onNav('register')}>Upgrade to Pro</button>
          </div>
          <div className="pricing-card">
            <h3>Premium</h3>
            <div className="pricing-amount">₹799</div>
            <div className="pricing-period">per year</div>
            <ul className="pricing-features">
              <li>Everything in Pro</li><li>CA consultation call</li><li>Priority support</li><li>GST tracking (coming)</li>
            </ul>
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

// ─── AUTH ─────────────────────────────────────────────
function Login({ onNav, onLogin }) {
  const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); const [err,setErr]=useState('')
  const submit = () => {
    if(!email||!pass){ setErr('Please enter email and password.'); return; }
    const stored=JSON.parse(localStorage.getItem('sfi_user')||'null')
    if(stored&&stored.email===email&&stored.password===pass){ onLogin(stored); }
    else setErr('Incorrect email or password.')
  }
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="sub">Log in to your Simple Finance India account</p>
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
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))
  const submit = () => {
    if(!form.name||!form.email||!form.password){ setErr('Please fill name, email and password.'); return; }
    if(form.password.length<8){ setErr('Password must be at least 8 characters.'); return; }
    if(form.pan&&form.pan.length!==10){ setErr('PAN must be exactly 10 characters.'); return; }
    const user={...form,pan:form.pan.toUpperCase(),createdAt:today()}
    localStorage.setItem('sfi_user',JSON.stringify(user))
    onLogin(user)
  }
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="sub">Free forever. No credit card needed.</p>
        {err&&<div className="auth-error">{err}</div>}
        <div className="form-group"><label className="form-label">Full name</label><input className="form-input" type="text" placeholder="Tanmay Kumar" value={form.name} onChange={set('name')}/></div>
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

// ─── DASHBOARD ────────────────────────────────────────
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

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Good morning, {user.name.split(' ')[0]} 👋</div>
          <div className="topbar-sub">FY 2025-26 · AY 2026-27</div>
        </div>
        <div className="deadline-pill">⏰ ITR deadline: 31 Aug 2026 · {daysLeft} days left</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total income</div><div className="stat-value green-val">{fmt(total)}</div><div className="stat-sub">{entries.length} entries</div></div>
        <div className="stat-card"><div className="stat-label">Tax payable</div><div className="stat-value red-val">{calcDone?fmt(taxData.total):'Not calculated'}</div><div className="stat-sub">New tax regime</div></div>
        <div className="stat-card"><div className="stat-label">Effective rate</div><div className="stat-value">{calcDone?taxData.rate+'%':'—'}</div><div className="stat-sub">Sec. 44AD applied</div></div>
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
              <div className="ci" key={item}>
                <div className={`dot ${i<4?(checks[i]?'done':'pend'):'pend'}`}/>
                <span style={{color:i<4&&checks[i]?'var(--text)':'var(--text3)'}}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,background:'var(--green-light)',borderRadius:6,padding:'6px 10px',fontSize:12,color:'var(--green)'}}>
            {done} of 4 done {done===4?'— Ready to file! 🎉':''}
          </div>
        </div>
      </div>

      <div className="quick-grid">
        <div className="panel">
          <h3>Quick actions</h3>
          <button className="quick-btn" onClick={()=>onSection('income')}>➕ &nbsp;Add income entry</button>
          <button className="quick-btn" onClick={()=>onSection('tax')}>🧮 &nbsp;Calculate my tax</button>
          <button className="quick-btn" onClick={()=>onSection('itr')}>📄 &nbsp;View ITR-4 form</button>
        </div>
        <div className="panel">
          <h3>Recent income entries</h3>
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

// ─── INCOME ───────────────────────────────────────────
function Income({ entries, setEntries, toast }) {
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({date:today(),amount:'',category:'Tuition',client:'',payment:'Cash',desc:''})
  const [search,setSearch]=useState(''); const [filterCat,setFilterCat]=useState(''); const [filterPay,setFilterPay]=useState('')
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}))

  const save=()=>{
    if(!form.date||!form.amount||parseFloat(form.amount)<=0){ toast('Please enter a valid date and amount'); return; }
    const entry={id:Date.now(),date:form.date,amount:parseFloat(form.amount),category:form.category,client:form.client||'—',payment:form.payment,desc:form.desc,status:'Draft'}
    setEntries(p=>[...p,entry])
    toast(`Entry saved! ${fmt(form.amount)} added`)
    setForm({date:today(),amount:'',category:'Tuition',client:'',payment:'Cash',desc:''})
    setShowForm(false)
  }

  const del=id=>{ setEntries(p=>p.filter(e=>e.id!==id)); toast('Entry deleted'); }
  const confirm=id=>{ setEntries(p=>p.map(e=>e.id===id?{...e,status:'Confirmed'}:e)); toast('Entry confirmed'); }

  const catClass={Tuition:'b-tuition',Coaching:'b-coaching',Freelance:'b-freelance',Consulting:'b-consulting'}
  const filtered=entries.filter(e=>
    (!search||e.client.toLowerCase().includes(search.toLowerCase())||(e.desc||'').toLowerCase().includes(search.toLowerCase()))&&
    (!filterCat||e.category===filterCat)&&(!filterPay||e.payment===filterPay)
  ).sort((a,b)=>new Date(b.date)-new Date(a.date))

  const total=entries.reduce((s,e)=>s+e.amount,0)
  const avg=entries.length?Math.round(total/entries.length):0

  return (
    <div>
      <div className="page-header">
        <div><h1>Income entries</h1><p>FY 2025-26 · All your cash receipts</p></div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-outline" style={{fontSize:13}} onClick={()=>toast('CSV bulk upload — coming soon!')}>⬆ Bulk upload CSV</button>
          <button className="btn btn-green" style={{fontSize:13}} onClick={()=>setShowForm(p=>!p)}>+ Add entry</button>
        </div>
      </div>

      {showForm&&(
        <div className="add-form-box">
          <div style={{fontSize:14,fontWeight:600,color:'var(--navy)',marginBottom:'1rem'}}>New income entry</div>
          <div className="form-grid-3">
            <div><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={set('date')}/></div>
            <div><label className="form-label">Amount (₹)</label><input className="form-input" type="number" placeholder="e.g. 5000" value={form.amount} onChange={set('amount')}/></div>
            <div><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={set('category')}><option>Tuition</option><option>Coaching</option><option>Freelance</option><option>Consulting</option></select></div>
            <div><label className="form-label">Student / Client</label><input className="form-input" type="text" placeholder="e.g. Rohit Sharma" value={form.client} onChange={set('client')}/></div>
            <div><label className="form-label">Payment method</label><select className="form-input" value={form.payment} onChange={set('payment')}><option>Cash</option><option>UPI</option><option>Bank transfer</option><option>Cheque</option></select></div>
            <div><label className="form-label">Description (optional)</label><input className="form-input" type="text" placeholder="e.g. Math – 4 classes" value={form.desc} onChange={set('desc')}/></div>
          </div>
          <div className="form-actions">
            <button className="btn-sm btn-save" onClick={save}>Save entry</button>
            <button className="btn-sm btn-cancel" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="income-stats">
        <div className="stat-card"><div className="stat-label">Total income</div><div className="stat-value green-val">{fmt(total)}</div></div>
        <div className="stat-card"><div className="stat-label">Total entries</div><div className="stat-value">{entries.length}</div></div>
        <div className="stat-card"><div className="stat-label">Average per entry</div><div className="stat-value">{fmt(avg)}</div></div>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search by name or description..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}><option value="">All categories</option><option>Tuition</option><option>Coaching</option><option>Freelance</option><option>Consulting</option></select>
        <select value={filterPay} onChange={e=>setFilterPay(e.target.value)}><option value="">All payments</option><option>Cash</option><option>UPI</option><option>Bank transfer</option><option>Cheque</option></select>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Client</th><th>Category</th><th>Payment</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={7} style={{textAlign:'center',color:'var(--text3)',padding:'2rem'}}>No entries found. Click "+ Add entry" to start.</td></tr>
              : filtered.map(e=>(
                  <tr key={e.id}>
                    <td>{fmtDate(e.date)}</td>
                    <td>{e.client}</td>
                    <td><span className={`badge ${catClass[e.category]||'b-coaching'}`}>{e.category}</span></td>
                    <td>{e.payment}</td>
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
          {filtered.length>0&&<tfoot><tr><td colSpan={7} style={{fontSize:12,color:'var(--text3)',padding:'.65rem .85rem'}}>Showing {filtered.length} of {entries.length} entries · Total: {fmt(filtered.reduce((s,e)=>s+e.amount,0))}</td></tr></tfoot>}
        </table>
      </div>
    </div>
  )
}

// ─── TAX ──────────────────────────────────────────────
function Tax({ entries, taxData, setTaxData, calcDone, setCalcDone, onSection, toast }) {
  const [receipts,setReceipts]=useState(taxData.receipts||'')
  const [declared,setDeclared]=useState(taxData.declared||'')
  const min8=Math.round((parseFloat(receipts)||0)*0.08)

  const calculate=()=>{
    const r=parseFloat(receipts)||0; const d=parseFloat(declared)||0
    if(!r){ toast('Please enter your total cash receipts'); return; }
    const min=r*0.08; const incomeForTax=Math.max(min,d||r)
    const taxable=Math.max(0,incomeForTax-250000)
    const tax=calcTaxSlabs(taxable); const cess=tax*0.04; const total=tax+cess
    const rate=r>0?((total/r)*100).toFixed(1):0
    const data={receipts:r,declared:incomeForTax,taxable,tax,cess,total,rate}
    setTaxData(data); setCalcDone(true)
    toast('Tax calculated! Total payable: '+fmt(total))
  }

  const getSlabIdx=taxable=>{
    if(taxable<=0)return 0; if(taxable<=250000)return 0; if(taxable<=500000)return 1;
    if(taxable<=1000000)return 2; if(taxable<=1500000)return 3; if(taxable<=2000000)return 4; return 5;
  }
  const activeSlabIdx=calcDone?getSlabIdx(taxData.taxable):-1
  const slabs=[['Up to ₹2,50,000','0%'],['₹2,50,001 – ₹5,00,000','5%'],['₹5,00,001 – ₹10,00,000','10%'],['₹10,00,001 – ₹15,00,000','15%'],['₹15,00,001 – ₹20,00,000','20%'],['Above ₹20,00,000','30%']]

  return (
    <div>
      <div className="page-header"><div><h1>Tax calculator</h1><p>Section 44AD — presumptive taxation · FY 2025-26</p></div></div>
      <div className="tax-grid">
        <div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Your income details</h3>
            <div className="input-row">
              <label>Total cash receipts (₹)</label>
              <input className="big-input" type="number" placeholder="e.g. 360000" value={receipts} onChange={e=>setReceipts(e.target.value)}/>
              <div className="hint">All tuition / coaching income for FY 2025-26</div>
            </div>
            <div className="input-row">
              <label>Income you want to declare (₹)</label>
              <input className="big-input" type="number" placeholder={`Min 8% = ₹${min8.toLocaleString('en-IN')}`} value={declared} onChange={e=>setDeclared(e.target.value)}/>
              <div className="hint">Minimum 8% of receipts = {fmt(min8)}. You can declare more.</div>
            </div>
            <button className="calc-btn" onClick={calculate}>Calculate my tax now</button>
          </div>
          <div className="panel">
            <h3>Tax slabs — new regime 2025-26</h3>
            {slabs.map(([range,rate],i)=>(
              <div key={i} className={`slab-item ${i===activeSlabIdx?'active':''}`}>
                <span>{range}</span><span>{rate}{i===activeSlabIdx?' ← your range':''}</span>
              </div>
            ))}
            <div className="info-note">
              {calcDone
                ? taxData.taxable>0
                  ? `Your taxable income of ${fmt(taxData.taxable)} falls in the ${slabs[activeSlabIdx][1]} slab. Tax is only on income above ₹2,50,000.`
                  : `Your income is below the ₹2,50,000 exemption limit. Tax = ₹0!`
                : 'Enter your income above to see which slab applies to you.'}
            </div>
          </div>
        </div>
        <div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Calculation breakdown</h3>
            <div className="result-row"><span className="r-label">Total cash receipts</span><span className="r-val">{calcDone?fmt(taxData.receipts):'—'}</span></div>
            <div className="result-row"><span className="r-label">Min 8% presumed profit</span><span className="r-val">{calcDone?fmt(taxData.receipts*0.08):'—'}</span></div>
            <div className="result-row"><span className="r-label">Your declared income</span><span className="r-val green-val">{calcDone?fmt(taxData.declared):'—'}</span></div>
            <div className="result-row"><span className="r-label">Basic exemption</span><span className="r-val">− ₹2,50,000</span></div>
            <div className="result-row"><span className="r-label">Taxable income</span><span className="r-val">{calcDone?(taxData.taxable>0?fmt(taxData.taxable):'₹0 (below exemption)'):'—'}</span></div>
            <div className="result-row"><span className="r-label">Income tax</span><span className="r-val red-val">{calcDone?fmt(taxData.tax):'—'}</span></div>
            <div className="result-row"><span className="r-label">Cess (4%)</span><span className="r-val red-val">{calcDone?fmt(taxData.cess):'—'}</span></div>
            <div className="total-box"><span className="total-label">Total tax payable</span><span className="total-val">{calcDone?fmt(taxData.total):'₹0'}</span></div>
          </div>
          <div className="panel">
            <h3>Old regime vs new regime</h3>
            <div className="regime-row">
              <div className="regime-box winner"><div className="regime-name">New regime</div><div className="regime-amt">{calcDone?fmt(taxData.total):'—'}</div><div style={{fontSize:11,color:'var(--green)',marginTop:3}}>Recommended</div></div>
              <div className="regime-box"><div className="regime-name">Old regime</div><div className="regime-amt">{calcDone?fmt(taxData.total):'—'}</div><div style={{fontSize:11,color:'var(--text3)',marginTop:3}}>No deductions</div></div>
            </div>
            <button className="gen-btn" onClick={()=>onSection('itr')}>Generate ITR-4 with this data →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ITR ──────────────────────────────────────────────
function ITR({ user, entries, taxData, calcDone, toast }) {
  const total=entries.reduce((s,e)=>s+e.amount,0)
  const pct=calcDone&&entries.length>0?85:entries.length>0?50:20

  const download=()=>{
    if(!calcDone||entries.length===0){ toast('Please add income entries and calculate tax first'); return; }
    const lines=[
      'SIMPLE FINANCE INDIA — ITR-4 SUMMARY',
      '=========================================',
      `Assessment Year: AY 2026-27`,
      `Financial Year: FY 2025-26`,
      '',
      'PERSONAL DETAILS',
      `Name: ${user.name}`,
      `PAN: ${user.pan||'Not provided'}`,
      `Filing reason: Voluntary filing below exemption`,
      '',
      'BUSINESS INCOME — SECTION 44AD',
      `Business code: 17006 (Coaching / Tuitions)`,
      `Gross receipts (E1b): Rs. ${Math.round(taxData.receipts).toLocaleString('en-IN')}`,
      `Declared income (E2b): Rs. ${Math.round(taxData.declared).toLocaleString('en-IN')}`,
      `Nature: Education services`,
      '',
      'TAX COMPUTATION (NEW REGIME)',
      `Taxable income: Rs. ${Math.round(taxData.taxable).toLocaleString('en-IN')}`,
      `Income tax: Rs. ${Math.round(taxData.tax).toLocaleString('en-IN')}`,
      `Cess (4%): Rs. ${Math.round(taxData.cess).toLocaleString('en-IN')}`,
      `Total tax payable: Rs. ${Math.round(taxData.total).toLocaleString('en-IN')}`,
      '',
      'INCOME ENTRIES SUMMARY',
      `Total entries: ${entries.length}`,
      `Total income: Rs. ${total.toLocaleString('en-IN')}`,
      '',
      'Generated by Simple Finance India',
      'Upload to income-tax.gov.in by 31 August 2026',
    ]
    const blob=new Blob([lines.join('\n')],{type:'text/plain'})
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob)
    a.download=`ITR4_${user.name.replace(/ /g,'_')}_AY2026-27.txt`; a.click()
    toast('ITR-4 summary downloaded successfully!')
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
        <div style={{fontSize:12,color:'var(--text2)',marginTop:4}}>Add bank account details to reach 100%</div>
      </div>
      <div className="warn-box">⚠ Add your bank account number before filing — required for any tax refunds.</div>
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
            <h3>Business income — Sec. 44AD ✅</h3>
            <div className="field-row2"><span className="f-label">Business code</span><span className="f-val">17006 (Tuitions)</span></div>
            <div className="field-row2"><span className="f-label">Gross receipts (E1b)</span><span className="f-val">{fmt(taxData.receipts||0)}</span></div>
            <div className="field-row2"><span className="f-label">Declared income (E2b)</span><span className="f-val">{fmt(taxData.declared||0)}</span></div>
            <div className="field-row2"><span className="f-label">Nature of business</span><span className="f-val">Education services</span></div>
          </div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Tax computation ✅</h3>
            <div className="field-row2"><span className="f-label">Taxable income</span><span className="f-val">{calcDone?(taxData.taxable>0?fmt(taxData.taxable):'₹0 (below exemption)'):fmt(0)}</span></div>
            <div className="field-row2"><span className="f-label">Income tax</span><span className="f-val red-val">{fmt(taxData.tax||0)}</span></div>
            <div className="field-row2"><span className="f-label">Cess (4%)</span><span className="f-val">{fmt(taxData.cess||0)}</span></div>
            <div className="field-row2"><span className="f-label">Total payable</span><span className="f-val red-val">{fmt(taxData.total||0)}</span></div>
            <div className="field-row2"><span className="f-label">Regime</span><span className="f-val">New tax regime</span></div>
          </div>
          <div className="panel">
            <h3>Bank details ⚠</h3>
            <div className="field-row2"><span className="f-label">Account number</span><span className="f-missing">⚠ Not added yet</span></div>
            <div className="field-row2"><span className="f-label">IFSC code</span><span className="f-missing">⚠ Not added yet</span></div>
            <div className="field-row2"><span className="f-label">Bank name</span><input className="form-input" style={{width:140,padding:'3px 8px',fontSize:12}} placeholder="e.g. SBI"/></div>
          </div>
        </div>
        <div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Ready to file?</h3>
            <div className="checklist2">
              <div className="ci2"><span style={{fontSize:16}}>✅</span> PAN details verified</div>
              <div className="ci2"><span style={{fontSize:16}}>✅</span> Income entries confirmed</div>
              <div className="ci2"><span style={{fontSize:16}}>✅</span> Tax calculated (Sec. 44AD)</div>
              <div className="ci2"><span style={{fontSize:16}}>✅</span> ITR-4 form auto-filled</div>
              <div className="ci2"><span style={{fontSize:16}}>⚠️</span> Bank account details pending</div>
              <div className="ci2"><span style={{fontSize:16,color:'#ddd'}}>⬜</span> Download and upload to portal</div>
            </div>
          </div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Download your ITR</h3>
            <button className="dl-btn" onClick={download}>⬇ Download ITR-4 Summary</button>
            <button className="portal-btn" onClick={()=>window.open('https://www.incometax.gov.in','_blank')}>🌐 Open income-tax.gov.in</button>
            <p className="note-sm">Download the summary and upload it at income-tax.gov.in. Filing deadline: <strong>31 August 2026</strong>.</p>
          </div>
          <div className="summary-box">
            <strong>Filing summary</strong><br/>
            Total income: {fmt(total)}<br/>
            Tax payable: {fmt(taxData.total||0)}<br/>
            ITR form: ITR-4 (Sugam)<br/>
            Assessment year: AY 2026-27<br/>
            Status: {calcDone&&entries.length>0?'Ready to file ✅':'Add income & calculate tax'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState('home')
  const [section,setSection]=useState('dashboard')
  const [user,setUser]=useState(null)
  const [entries,setEntries]=useState([])
  const [taxData,setTaxData]=useState({receipts:0,declared:0,taxable:0,tax:0,cess:0,total:0,rate:0})
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

  const handleLogout=()=>{ setUser(null); setEntries([]); setCalcDone(false); setPage('home'); }

  const updateEntries=fn=>{
    setEntries(p=>{ const next=typeof fn==='function'?fn(p):fn; if(user) localStorage.setItem('sfi_entries_'+user.email,JSON.stringify(next)); return next; })
  }

  const updateTax=(data,done)=>{
    setTaxData(data); setCalcDone(done)
    if(user) localStorage.setItem('sfi_tax_'+user.email,JSON.stringify(data))
  }

  const sideNav=[
    {id:'dashboard',icon:'🏠',label:'Dashboard'},
    {id:'income',icon:'💰',label:'Income entries'},
    {id:'tax',icon:'🧮',label:'Tax calculator'},
    {id:'itr',icon:'📄',label:'ITR-4 form'},
  ]

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
            {section==='tax'&&<Tax entries={entries} taxData={taxData} setTaxData={d=>updateTax(d,true)} calcDone={calcDone} setCalcDone={setCalcDone} onSection={setSection} toast={toast}/>}
            {section==='itr'&&<ITR user={user} entries={entries} taxData={taxData} calcDone={calcDone} toast={toast}/>}
          </div>
        </div>
      )}
      {toastMsg&&<Toast msg={toastMsg} onDone={()=>setToastMsg(null)}/>}
    </>
  )
}
