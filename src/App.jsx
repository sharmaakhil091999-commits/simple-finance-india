import { useState, useRef } from 'react'

const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN')
const today = () => new Date().toISOString().split('T')[0]
const fmtDate = d => { if(!d) return '—'; const dt=new Date(d+'T00:00:00'); return dt.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }

// ─── TAX ENGINE (Income Tax Act 2025, amended by Finance Act 2026) ──────────

// NEW REGIME — Section 202(1) | Finance Act 2026
// Basic exemption: ₹4,00,000
// 87A Rebate (Section 156(2)): 100% rebate if income ≤ ₹12,00,000 (max ₹60,000)
function calcNewRegime(income) {
  if(income<=0) return { tax:0, cess:0, total:0, taxable:0, rebate:0 }
  let tax=0, rem=income
  const slabs=[[400000,0],[400000,.05],[400000,.10],[400000,.15],[400000,.20],[400000,.25],[Infinity,.30]]
  for(const [limit,rate] of slabs){ const chunk=Math.min(rem,limit); tax+=chunk*rate; rem-=chunk; if(rem<=0) break; }
  const rebate = income<=1200000 ? Math.min(tax, 60000) : 0
  tax = Math.max(0, tax - rebate)
  const cess = tax * 0.04
  return { tax, cess, total: tax+cess, taxable: income, rebate }
}

// OLD REGIME — Section 115BAC not opted
// Basic exemption: ₹2,50,000
// 87A Rebate (Section 156(1)): 100% rebate if taxable income ≤ ₹5,00,000 (max ₹12,500)
function calcOldRegime(income, deductions) {
  if(income<=0) return { tax:0, cess:0, total:0, taxable:0, rebate:0, deductions:0 }
  const taxable = Math.max(0, income - deductions)
  let tax=0, rem=taxable
  const slabs=[[250000,0],[250000,.05],[500000,.20],[Infinity,.30]]
  for(const [limit,rate] of slabs){ const chunk=Math.min(rem,limit); tax+=chunk*rate; rem-=chunk; if(rem<=0) break; }
  const rebate = taxable<=500000 ? Math.min(tax, 12500) : 0
  tax = Math.max(0, tax - rebate)
  const cess = tax * 0.04
  return { tax, cess, total: tax+cess, taxable, rebate, deductions }
}

function isDigital(m) { return ['UPI','Cheque/DD','Bank Transfer/NEFT/RTGS','Any Electronic Mode'].includes(m) }

function Toast({ msg, onDone }) {
  const [visible, setVisible] = useState(true)
  if(!visible) return null
  setTimeout(()=>{ setVisible(false); onDone(); }, 3500)
  return <div className="toast-box">{msg}</div>
}

// ─── NAV ────────────────────────────────────────────────────────────────────
function Nav({ user, onNav, onLogout }) {
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

// ─── HOME ───────────────────────────────────────────────────────────────────
function Home({ onNav }) {
  return (
    <div>
      <div className="hero">
        <h1>File Your ITR in <span>Minutes,</span><br/>Not Hours</h1>
        <p>India's smartest tax tool — for tutors, coaches, freelancers, and self-employed professionals. No finance knowledge needed.</p>
        <div className="hero-btns">
          <button className="btn-hero btn-green" onClick={()=>onNav('register')}>Start free — no credit card</button>
          <button className="btn-hero" style={{background:'#fff',border:'1.5px solid var(--navy)',color:'var(--navy)'}} onClick={()=>onNav('login')}>I already have an account</button>
        </div>
      </div>
      <div className="features-section">
        <h2 className="section-title">Everything you need — zero jargon</h2>
        <p className="section-sub">You don't need to know what "presumptive income" or "Section 44AD" means. Just enter your transactions. We handle the rest.</p>
        <div className="feature-grid">
          {[
            ['📱','Just enter transactions','Add income entries in plain language. We auto-detect whether it is cash or digital and apply the correct tax rule.'],
            ['🧮','Both regimes compared','We calculate old regime and new regime side by side. You choose which one to file under.'],
            ['📁','Upload Tally or Excel','Export from Tally, QuickBooks, or any accounting software. Upload and we auto-fill everything.'],
            ['🏦','Verify against bank records','Cross-check your income entries with bank statements or UPI history before filing. Zero surprises.'],
            ['📄','ITR-4 auto-filled','All fields filled correctly: Section 58 (44AD), business code 17006, 6%/8% rates applied correctly.'],
            ['✅','Act-accurate calculations','Built directly from the Income Tax Act 2025 as amended by Finance Act 2026. Turnover limits: ₹2 Cr / ₹3 Cr.'],
          ].map(([icon,title,desc])=>(
            <div className="feature-card" key={title}>
              <div className="feature-icon">{icon}</div>
              <h3>{title}</h3><p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="how">
        <h2 className="section-title">Works for non-finance people too</h2>
        <p className="section-sub">You don't need to understand tax. Just answer simple questions.</p>
        <div className="how-steps">
          {[['1','Tell us what you earned','Enter each payment you received — who paid, how much, cash or UPI'],['2','We figure out the tax','Section 44AD, 6%/8% rules, old vs new regime — all handled automatically'],['3','Verify your income','Cross-check against your bank statement before filing'],['4','Download and file','One PDF. Upload to income-tax.gov.in. Done.']].map(([n,t,d])=>(
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
            <ul className="pricing-features"><li>1 financial year</li><li>Up to 50 entries</li><li>Tax calculation</li><li>Old and new regime</li></ul>
            <button className="btn btn-green" style={{width:'100%'}} onClick={()=>onNav('register')}>Get started free</button>
          </div>
          <div className="pricing-card popular">
            <h3>Pro</h3><div className="pricing-amount">₹299</div><div className="pricing-period">per year</div>
            <ul className="pricing-features"><li>Unlimited entries</li><li>All financial years</li><li>PDF download</li><li>Tally / Excel upload</li><li>Bank statement verify</li></ul>
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
      <footer>© 2026 Simple Finance India · Built on Income Tax Act 2025 (as amended by Finance Act 2026)</footer>
    </div>
  )
}

// ─── AUTH ───────────────────────────────────────────────────────────────────
function Login({ onNav, onLogin }) {
  const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); const [err,setErr]=useState('')
  const submit=()=>{
    if(!email||!pass){setErr('Please enter email and password.');return;}
    const stored=JSON.parse(localStorage.getItem('sfi_user')||'null')
    if(stored&&stored.email===email&&stored.password===pass){onLogin(stored)}
    else setErr('Incorrect email or password.')
  }
  return (
    <div className="auth-wrap"><div className="auth-card">
      <h2>Welcome back</h2><p className="sub">Log in to Simple Finance India</p>
      {err&&<div className="auth-error">{err}</div>}
      <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
      <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Your password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
      <button className="form-btn" onClick={submit}>Log in</button>
      <div className="auth-switch">No account? <a onClick={()=>onNav('register')}>Create one free</a></div>
      <div className="auth-switch" style={{marginTop:'0.5rem'}}><a onClick={()=>onNav('home')} style={{color:'var(--text3)'}}>← Back to home</a></div>
    </div></div>
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
    localStorage.setItem('sfi_user',JSON.stringify(user)); onLogin(user)
  }
  return (
    <div className="auth-wrap"><div className="auth-card">
      <h2>Create your account</h2><p className="sub">Free forever. No credit card needed.</p>
      {err&&<div className="auth-error">{err}</div>}
      <div className="form-group"><label className="form-label">Full name</label><input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={set('name')}/></div>
      <div className="form-group"><label className="form-label">Email address</label><input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')}/></div>
      <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')}/></div>
      <div className="form-group"><label className="form-label">PAN number (optional)</label><input className="form-input" type="text" placeholder="ABCDE1234F" maxLength={10} value={form.pan} onChange={set('pan')} style={{textTransform:'uppercase'}}/></div>
      <button className="form-btn" onClick={submit}>Create free account</button>
      <div className="auth-switch">Already have an account? <a onClick={()=>onNav('login')}>Log in</a></div>
      <div className="auth-switch" style={{marginTop:'0.5rem'}}><a onClick={()=>onNav('home')} style={{color:'var(--text3)'}}>← Back to home</a></div>
    </div></div>
  )
}

// ─── INCOME ─────────────────────────────────────────────────────────────────
function Income({ entries, setEntries, toast }) {
  const [showForm,setShowForm]=useState(false)
  const [editingId,setEditingId]=useState(null)
  const [mode,setMode]=useState('simple') // simple | advanced
  const [form,setForm]=useState({date:today(),amount:'',category:'Tuition',client:'',paymentMode:'Cash',desc:''})
  const [search,setSearch]=useState(''); const [filterCat,setFilterCat]=useState(''); const [filterPay,setFilterPay]=useState('')
  const fileRef=useRef()
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}))

  const save=()=>{
    if(!form.date||!form.amount||parseFloat(form.amount)<=0){toast('Please enter a valid date and amount');return;}
    if(editingId){
      setEntries(p=>p.map(e=>e.id===editingId?{...e,...form,amount:parseFloat(form.amount),status:'Draft'}:e))
      toast(`Entry updated — ${fmt(form.amount)} from ${form.client||'client'}`)
      setEditingId(null)
    } else {
      const entry={id:Date.now(),date:form.date,amount:parseFloat(form.amount),category:form.category,client:form.client||'—',paymentMode:form.paymentMode,desc:form.desc,status:'Draft'}
      setEntries(p=>[...p,entry])
      toast(`Entry saved — ${fmt(form.amount)} from ${form.client||'client'}`)
    }
    setForm({date:today(),amount:'',category:'Tuition',client:'',paymentMode:'Cash',desc:''})
    setShowForm(false)
  }

  const startEdit=entry=>{
    setForm({date:entry.date,amount:String(entry.amount),category:entry.category,client:entry.client==='—'?'':entry.client,paymentMode:entry.paymentMode,desc:entry.desc||''})
    setEditingId(entry.id)
    setShowForm(true)
    window.scrollTo({top:0,behavior:'smooth'})
  }

  const del=id=>{setEntries(p=>p.filter(e=>e.id!==id));toast('Entry deleted');}
  const confirm=id=>{setEntries(p=>p.map(e=>e.id===id?{...e,status:'Confirmed'}:e));toast('Entry confirmed');}

  // CSV Upload handler
  const handleCSV=e=>{
    const file=e.target.files[0]; if(!file) return
    const reader=new FileReader()
    reader.onload=ev=>{
      const lines=ev.target.result.split('\n').filter(l=>l.trim())
      let added=0, skipped=0
      lines.slice(1).forEach(line=>{
        const cols=line.split(',').map(c=>c.trim().replace(/^"|"$/g,''))
        const [date,amount,category,client,paymentMode,desc]=cols
        const amt=parseFloat(amount)
        if(date&&amt>0){
          setEntries(p=>[...p,{id:Date.now()+Math.random(),date,amount:amt,category:category||'Tuition',client:client||'—',paymentMode:paymentMode||'Cash',desc:desc||'',status:'Draft'}])
          added++
        } else skipped++
      })
      toast(`${added} entries imported${skipped>0?`, ${skipped} skipped (invalid)`:''}`);
      e.target.value=''
    }
    reader.readAsText(file)
  }

  const catClass={Tuition:'b-tuition',Coaching:'b-coaching',Freelance:'b-freelance',Consulting:'b-consulting'}
  const filtered=entries.filter(e=>
    (!search||e.client.toLowerCase().includes(search.toLowerCase())||(e.desc||'').toLowerCase().includes(search.toLowerCase()))&&
    (!filterCat||e.category===filterCat)&&(!filterPay||e.paymentMode===filterPay)
  ).sort((a,b)=>new Date(b.date)-new Date(a.date))

  const total=entries.reduce((s,e)=>s+e.amount,0)
  const cashTotal=entries.filter(e=>e.paymentMode==='Cash').reduce((s,e)=>s+e.amount,0)
  const digitalTotal=entries.filter(e=>isDigital(e.paymentMode)).reduce((s,e)=>s+e.amount,0)
  const cashPct=total>0?((cashTotal/total)*100).toFixed(1):0
  const digitalPct=total>0?((digitalTotal/total)*100).toFixed(1):0

  // 44AD eligibility check
  const eligible44AD = cashPct<=5 ? total<=30000000 : total<=20000000
  const limitText = cashPct<=5 ? '₹3 crore (95%+ digital)' : '₹2 crore (cash > 5%)'

  return (
    <div>
      <div className="page-header">
        <div><h1>Income entries</h1><p>FY 2025-26 · Add what you received — cash and digital tracked separately</p></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button className="btn btn-outline" style={{fontSize:13}} onClick={()=>fileRef.current.click()}>⬆ Import CSV / Tally export</button>
          <input ref={fileRef} type="file" accept=".csv" style={{display:'none'}} onChange={handleCSV}/>
          <button className="btn btn-green" style={{fontSize:13}} onClick={()=>{setEditingId(null);setForm({date:today(),amount:'',category:'Tuition',client:'',paymentMode:'Cash',desc:''});setShowForm(p=>!p)}}>+ Add entry</button>
        </div>
      </div>

      {/* ELIGIBILITY STATUS */}
      <div style={{background:eligible44AD?'var(--green-light)':'var(--red-light)',border:`1px solid ${eligible44AD?'#a8d5b5':'#f5c6cb'}`,borderRadius:10,padding:'0.85rem 1.25rem',marginBottom:'1.25rem',fontSize:13,color:eligible44AD?'var(--green)':'var(--red)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span>{eligible44AD?`✅ Eligible for Section 44AD (limit: ${limitText})`:`⛔ Turnover exceeds 44AD limit (${limitText}). Please use Normal filing.`}</span>
        <span style={{fontSize:12,opacity:.8}}>Cash: {cashPct}% · Digital: {digitalPct}%</span>
      </div>

      {/* CSV FORMAT HINT */}
      <div style={{background:'var(--blue-light)',border:'1px solid #b3cff9',borderRadius:10,padding:'0.85rem 1.25rem',marginBottom:'1.25rem',fontSize:12,color:'var(--blue)'}}>
        <strong>CSV / Tally import format:</strong> date, amount, category, client_name, payment_mode, description<br/>
        Example: 2026-01-15, 5000, Tuition, Rohit Sharma, UPI, Math classes Jan<br/>
        <strong>Payment modes accepted:</strong> Cash · UPI · Cheque/DD · Bank Transfer/NEFT/RTGS · Any Electronic Mode
      </div>

      {showForm&&(
        <div className="add-form-box">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
            <div style={{fontSize:14,fontWeight:600,color:'var(--navy)'}}>{editingId?'Edit income entry':'New income entry'}</div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setMode('simple')} style={{padding:'4px 12px',borderRadius:6,border:`1px solid ${mode==='simple'?'var(--green)':'var(--border)'}`,background:mode==='simple'?'var(--green-light)':'transparent',color:mode==='simple'?'var(--green)':'var(--text2)',fontSize:12,cursor:'pointer'}}>Simple</button>
              <button onClick={()=>setMode('advanced')} style={{padding:'4px 12px',borderRadius:6,border:`1px solid ${mode==='advanced'?'var(--green)':'var(--border)'}`,background:mode==='advanced'?'var(--green-light)':'transparent',color:mode==='advanced'?'var(--green)':'var(--text2)',fontSize:12,cursor:'pointer'}}>Advanced</button>
            </div>
          </div>

          {mode==='simple'
            ? (
              /* SIMPLE MODE — for non-finance users */
              <div>
                <div style={{background:'var(--blue-light)',border:'1px solid #b3cff9',borderRadius:8,padding:'0.75rem 1rem',marginBottom:'1rem',fontSize:12,color:'var(--blue)'}}>
                  Just tell us what happened. We handle the tax rules automatically.
                </div>
                <div className="form-grid-3">
                  <div><label className="form-label">When did you receive this payment?</label><input className="form-input" type="date" value={form.date} onChange={set('date')}/></div>
                  <div><label className="form-label">How much did you receive? (₹)</label><input className="form-input" type="number" placeholder="e.g. 5000" value={form.amount} onChange={set('amount')}/></div>
                  <div><label className="form-label">What type of work was this for?</label><select className="form-input" value={form.category} onChange={set('category')}><option>Tuition</option><option>Coaching</option><option>Freelance</option><option>Consulting</option></select></div>
                  <div><label className="form-label">Who paid you? (student/client name)</label><input className="form-input" type="text" placeholder="e.g. Rohit Sharma" value={form.client} onChange={set('client')}/></div>
                  <div>
                    <label className="form-label">How did they pay?</label>
                    <select className="form-input" value={form.paymentMode} onChange={set('paymentMode')}>
                      <option value="Cash">Cash (notes / coins)</option>
                      <option value="UPI">UPI (Google Pay, PhonePe, etc.)</option>
                      <option value="Cheque/DD">Cheque or Demand Draft</option>
                      <option value="Bank Transfer/NEFT/RTGS">Bank transfer / NEFT / RTGS</option>
                      <option value="Any Electronic Mode">Other online payment</option>
                    </select>
                    <div style={{fontSize:11,color:isDigital(form.paymentMode)?'var(--green)':'var(--amber)',marginTop:4}}>
                      {isDigital(form.paymentMode)?'✅ Digital payment — 6% minimum profit rate applies':'⚠ Cash payment — 8% minimum profit rate applies'}
                    </div>
                  </div>
                  <div><label className="form-label">Any notes? (optional)</label><input className="form-input" type="text" placeholder="e.g. March tuition fees" value={form.desc} onChange={set('desc')}/></div>
                </div>
              </div>
            )
            : (
              /* ADVANCED MODE — for finance-aware users */
              <div>
                <div className="form-grid-3">
                  <div><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={set('date')}/></div>
                  <div><label className="form-label">Amount (₹)</label><input className="form-input" type="number" placeholder="e.g. 5000" value={form.amount} onChange={set('amount')}/></div>
                  <div><label className="form-label">Income category</label><select className="form-input" value={form.category} onChange={set('category')}><option>Tuition</option><option>Coaching</option><option>Freelance</option><option>Consulting</option></select></div>
                  <div><label className="form-label">Client / student name</label><input className="form-input" type="text" placeholder="e.g. Rohit Sharma" value={form.client} onChange={set('client')}/></div>
                  <div>
                    <label className="form-label">Mode of receipt <span style={{color:'var(--red)',fontSize:11}}>★ determines 6% or 8% rate</span></label>
                    <select className="form-input" value={form.paymentMode} onChange={set('paymentMode')}>
                      <option value="Cash">Cash (8% presumptive rate)</option>
                      <option value="UPI">UPI (6% presumptive rate)</option>
                      <option value="Cheque/DD">A/c payee Cheque / DD (6% rate)</option>
                      <option value="Bank Transfer/NEFT/RTGS">NEFT / RTGS / Bank transfer (6% rate)</option>
                      <option value="Any Electronic Mode">Any other electronic mode (6% rate)</option>
                    </select>
                  </div>
                  <div><label className="form-label">Description / invoice reference</label><input className="form-input" type="text" placeholder="e.g. INV-001 / March fees" value={form.desc} onChange={set('desc')}/></div>
                </div>
              </div>
            )
          }
          <div className="form-actions" style={{marginTop:'1rem'}}>
            <button className="btn-sm btn-save" onClick={save}>{editingId?'Update entry':'Save entry'}</button>
            <button className="btn-sm btn-cancel" onClick={()=>{setShowForm(false);setEditingId(null);setForm({date:today(),amount:'',category:'Tuition',client:'',paymentMode:'Cash',desc:''})}}>Cancel</button>
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
          <thead><tr><th>Date</th><th>Client</th><th>Category</th><th>How paid</th><th>Rate</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text3)',padding:'2rem'}}>No entries yet. Click "+ Add entry" to begin.</td></tr>
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
                      <button className="tbl-btn" onClick={()=>startEdit(e)}>Edit</button>
                      {e.status==='Draft'&&<button className="tbl-btn" onClick={()=>confirm(e.id)}>Confirm</button>}
                      <button className="tbl-btn del" onClick={()=>del(e.id)}>Delete</button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
          {filtered.length>0&&<tfoot><tr><td colSpan={8} style={{fontSize:12,color:'var(--text3)',padding:'.65rem .85rem'}}>Showing {filtered.length} of {entries.length} · Total: {fmt(filtered.reduce((s,e)=>s+e.amount,0))}</td></tr></tfoot>}
        </table>
      </div>
    </div>
  )
}

// ─── TAX CALCULATOR ─────────────────────────────────────────────────────────
function Tax({ entries, taxData, setTaxData, calcDone, onSection, toast }) {
  const cashReceipts=entries.filter(e=>e.paymentMode==='Cash').reduce((s,e)=>s+e.amount,0)
  const digitalReceipts=entries.filter(e=>isDigital(e.paymentMode)).reduce((s,e)=>s+e.amount,0)
  const totalFromEntries=cashReceipts+digitalReceipts
  const useEntries=entries.length>0

  const [filingMethod,setFilingMethod]=useState(taxData.filingMethod||'44AD')
  const [manualCash,setManualCash]=useState('')
  const [manualDigital,setManualDigital]=useState('')
  const [normalIncome,setNormalIncome]=useState('')
  const [declaredIncome,setDeclaredIncome]=useState('')
  // Regime choice — user explicitly picks
  const [regimeChoice,setRegimeChoice]=useState(taxData.regimeChoice||'') // '' = not chosen yet
  // Old regime deductions
  const [ded80C,setDed80C]=useState(taxData.ded80C||'')
  const [ded80D,setDed80D]=useState(taxData.ded80D||'')
  const [dedHRA,setDedHRA]=useState(taxData.dedHRA||'')
  const [dedNPS,setDedNPS]=useState(taxData.dedNPS||'')
  const [dedOther,setDedOther]=useState(taxData.dedOther||'')
  const [step,setStep]=useState(1) // 1=method, 2=income, 3=regime, 4=result

  const cashAmt=useEntries?cashReceipts:parseFloat(manualCash)||0
  const digitalAmt=useEntries?digitalReceipts:parseFloat(manualDigital)||0
  const totalAmt=cashAmt+digitalAmt||(parseFloat(normalIncome)||0)
  const minPresumptive=cashAmt*0.08+digitalAmt*0.06
  const totalDeductions=Math.min(parseFloat(ded80C)||0,150000)+(parseFloat(ded80D)||0)+(parseFloat(dedHRA)||0)+Math.min(parseFloat(dedNPS)||0,50000)+(parseFloat(dedOther)||0)
  const cashPct=totalAmt>0?((cashAmt/totalAmt)*100):0

  const calculate=()=>{
    if(!regimeChoice){toast('Please choose old regime or new regime in Step 3 first');return;}
    let grossIncome=0
    if(filingMethod==='44AD'){
      if(!cashAmt&&!digitalAmt&&!totalAmt){toast('Please enter your receipts or add income entries first');return;}
      const limit=cashPct<=5?30000000:20000000
      if(totalAmt>limit){toast(`Turnover of ${fmt(totalAmt)} exceeds the 44AD limit. Please use Normal filing.`);return;}
      const declared=parseFloat(declaredIncome)||0
      grossIncome=Math.max(minPresumptive,declared||totalAmt)
    } else if(filingMethod==='44ADA'){
      const adaTotal=useEntries?totalFromEntries:parseFloat(manualCash)||0
      if(!adaTotal){toast('Please enter your gross receipts or add income entries first');return;}
      const adaCashPct=adaTotal>0?((cashReceipts/adaTotal)*100):0
      const limit=adaCashPct<=5?7500000:5000000
      if(adaTotal>limit){toast(`Receipts of ${fmt(adaTotal)} exceed 44ADA limit of ${adaCashPct<=5?'₹75 lakh':'₹50 lakh'}. Please use Normal filing.`);return;}
      const declared=parseFloat(declaredIncome)||0
      grossIncome=Math.max(adaTotal*0.5,declared||adaTotal*0.5)
      const totalAmt=adaTotal
    } else {
      grossIncome=parseFloat(normalIncome)||0
      if(!grossIncome){toast('Please enter your net income after expenses');return;}
    }

    const newResult=calcNewRegime(grossIncome)
    const oldResult=calcOldRegime(grossIncome,totalDeductions)
    const chosenResult=regimeChoice==='new'?newResult:oldResult
    const betterRegime=newResult.total<=oldResult.total?'new':'old'
    const savings=Math.abs(newResult.total-oldResult.total)

    const data={
      filingMethod,cashReceipts:cashAmt,digitalReceipts:digitalAmt,totalReceipts:totalAmt,
      minPresumptive,grossIncome,declaredIncome:parseFloat(declaredIncome)||0,
      newResult,oldResult,
      regimeChoice,chosenResult,betterRegime,savings,
      ded80C:parseFloat(ded80C)||0,ded80D:parseFloat(ded80D)||0,dedHRA:parseFloat(dedHRA)||0,dedNPS:parseFloat(dedNPS)||0,dedOther:parseFloat(dedOther)||0,
      totalDeductions
    }
    setTaxData(data)
    setStep(4)
    const isOptimal=regimeChoice===betterRegime
    toast(isOptimal?`Tax calculated — ${fmt(chosenResult.total)} payable under ${regimeChoice==='new'?'new':'old'} regime (your best option)`:`Tax calculated — ${fmt(chosenResult.total)} payable. Note: ${regimeChoice==='old'?'new':'old'} regime saves ${fmt(savings)} more.`)
  }

  const newSlabs=[['Up to ₹4,00,000','Nil'],['₹4,00,001 – ₹8,00,000','5%'],['₹8,00,001 – ₹12,00,000','10%'],['₹12,00,001 – ₹16,00,000','15%'],['₹16,00,001 – ₹20,00,000','20%'],['₹20,00,001 – ₹24,00,000','25%'],['Above ₹24,00,000','30%']]
  const oldSlabs=[['Up to ₹2,50,000','Nil'],['₹2,50,001 – ₹5,00,000','5%'],['₹5,00,001 – ₹10,00,000','20%'],['Above ₹10,00,000','30%']]

  return (
    <div>
      <div className="page-header"><div><h1>Tax calculator</h1><p>Income Tax Act 2025 · Finance Act 2026 · FY 2025-26 / AY 2026-27</p></div></div>

      {/* STEP INDICATOR */}
      <div style={{display:'flex',gap:0,marginBottom:'1.5rem',background:'var(--bg)',borderRadius:10,padding:4}}>
        {['1. Filing method','2. Income details','3. Choose regime','4. Your tax'].map((s,i)=>(
          <div key={i} onClick={()=>setStep(i+1)} style={{flex:1,textAlign:'center',padding:'0.6rem',fontSize:12,borderRadius:8,cursor:'pointer',background:step===i+1?'#fff':'transparent',color:step===i+1?'var(--navy)':'var(--text3)',fontWeight:step===i+1?600:400,border:step===i+1?'1px solid var(--border)':'none'}}>{s}</div>
        ))}
      </div>

      {/* STEP 1 — FILING METHOD */}
      {step===1&&(
        <div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3 style={{marginBottom:'1rem'}}>Which category applies to you?</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              {[
                ['44AD','Section 44AD','Tutors, coaches, traders, shopkeepers','Turnover ≤ ₹2 Cr (or ₹3 Cr if 95%+ digital)','Profit assumed at 8% cash / 6% digital'],
                ['44ADA','Section 44ADA','Doctors, lawyers, CAs, architects, engineers','Gross receipts ≤ ₹50L (or ₹75L if 95%+ digital)','Profit assumed at 50% of gross receipts'],
                ['Normal','Normal filing','Any business with proper books of accounts','No turnover limit','Declare actual income minus actual expenses'],
              ].map(([val,label,who,limit,rule])=>(
                <div key={val} onClick={()=>{setFilingMethod(val);setStep(2)}} style={{border:`2px solid ${filingMethod===val?'var(--green)':'var(--border)'}`,borderRadius:12,padding:'1.1rem',cursor:'pointer',background:filingMethod===val?'var(--green-light)':'var(--white)'}}>
                  <div style={{fontWeight:600,color:filingMethod===val?'var(--green)':'var(--navy)',marginBottom:6,fontSize:14}}>{label}</div>
                  <div style={{fontSize:12,color:'var(--text2)',marginBottom:8,fontWeight:500}}>{who}</div>
                  <div style={{fontSize:11,color:'var(--text3)',lineHeight:1.6}}>{limit}<br/>{rule}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:'var(--blue-light)',border:'1px solid #b3cff9',borderRadius:10,padding:'0.85rem 1rem',fontSize:12,color:'var(--blue)'}}>
            <strong>Not sure?</strong> If you're a tutor, coaching centre, or any small service/business provider, choose Section 44AD. If you're a doctor, lawyer, or CA, choose 44ADA. For everyone else, Normal filing.
          </div>
        </div>
      )}

      {/* STEP 2 — INCOME */}
      {step===2&&(
        <div className="tax-grid">
          <div>
            <div className="panel" style={{marginBottom:'1.25rem'}}>
              <h3 style={{marginBottom:'1rem'}}>Your income for FY 2025-26</h3>
              {filingMethod==='44AD'&&(
                <>
                  {useEntries
                    ? <div style={{background:'var(--green-light)',borderRadius:8,padding:'0.75rem 1rem',marginBottom:'1rem',fontSize:13,color:'var(--green)'}}>✅ Auto-filled from your income entries:<br/>Cash: {fmt(cashReceipts)} · Digital: {fmt(digitalReceipts)}</div>
                    : <>
                        <div className="input-row"><label>Cash receipts (₹) — received in cash notes/coins</label><input className="big-input" type="number" placeholder="e.g. 120000" value={manualCash} onChange={e=>setManualCash(e.target.value)}/><div className="hint">8% minimum presumptive profit applies to this</div></div>
                        <div className="input-row"><label>Digital receipts (₹) — UPI, cheque, bank transfer, NEFT/RTGS</label><input className="big-input" type="number" placeholder="e.g. 240000" value={manualDigital} onChange={e=>setManualDigital(e.target.value)}/><div className="hint">6% minimum presumptive profit applies to this</div></div>
                      </>
                  }
                  <div style={{background:'var(--amber-light)',border:'1px solid #ffc107',borderRadius:8,padding:'0.75rem 1rem',fontSize:12,color:'var(--amber)',marginBottom:'1rem'}}>
                    Minimum profit you must declare: Cash ({fmt(cashAmt)}) × 8% + Digital ({fmt(digitalAmt)}) × 6% = <strong>{fmt(minPresumptive)}</strong>
                  </div>
                  <div className="input-row"><label>Income you want to declare (₹) — leave blank to use minimum</label><input className="big-input" type="number" placeholder={`Minimum = ${fmt(minPresumptive)}`} value={declaredIncome} onChange={e=>setDeclaredIncome(e.target.value)}/><div className="hint">You can declare more than the minimum if your actual profit is higher</div></div>
                </>
              )}
              {filingMethod==='44ADA'&&(
                <>
                  {useEntries
                    ? <div style={{background:'var(--green-light)',borderRadius:8,padding:'0.75rem 1rem',marginBottom:'1rem',fontSize:13,color:'var(--green)'}}>
                        ✅ Auto-filled from your income entries: Total receipts = {fmt(totalFromEntries)}<br/>
                        <span style={{fontSize:11,opacity:.85}}>Cash: {fmt(cashReceipts)} · Digital: {fmt(digitalReceipts)}</span>
                      </div>
                    : <div className="input-row">
                        <label>Gross receipts (₹) — must be ≤ ₹50L (or ₹75L if 95%+ digital)</label>
                        <input className="big-input" type="number" placeholder="e.g. 600000" value={manualCash} onChange={e=>setManualCash(e.target.value)}/>
                        <div className="hint">Total professional fees / receipts for the year. Add income entries first to auto-fill this.</div>
                      </div>
                  }
                  <div style={{background:'var(--amber-light)',border:'1px solid #ffc107',borderRadius:8,padding:'0.75rem 1rem',fontSize:12,color:'var(--amber)',marginBottom:'1rem'}}>
                    Minimum profit you must declare: <strong>{fmt((useEntries?totalFromEntries:parseFloat(manualCash)||0)*0.5)}</strong> (50% of gross receipts of {fmt(useEntries?totalFromEntries:parseFloat(manualCash)||0)})
                  </div>
                  <div className="input-row">
                    <label>Income you want to declare (₹) — leave blank to use 50%</label>
                    <input className="big-input" type="number" placeholder={`Minimum = ${fmt((useEntries?totalFromEntries:parseFloat(manualCash)||0)*0.5)}`} value={declaredIncome} onChange={e=>setDeclaredIncome(e.target.value)}/>
                    <div className="hint">You can declare more than 50% if your actual profit is higher. Leave blank to use the minimum.</div>
                  </div>
                </>
              )}
              {filingMethod==='Normal'&&(
                <div className="input-row"><label>Net income after all business expenses (₹)</label><input className="big-input" type="number" placeholder="e.g. 280000" value={normalIncome} onChange={e=>setNormalIncome(e.target.value)}/><div className="hint">Total receipts minus all allowable business expenses (rent, salary, purchases, etc.)</div></div>
              )}
              <div style={{display:'flex',gap:8,marginTop:'1rem'}}>
                <button className="btn btn-outline" style={{fontSize:13}} onClick={()=>setStep(1)}>← Back</button>
                <button className="calc-btn" style={{flex:1,marginTop:0}} onClick={()=>setStep(3)}>Next: Choose regime →</button>
              </div>
            </div>
          </div>
          {/* LIVE PREVIEW */}
          <div className="panel">
            <h3>Live preview</h3>
            <div className="result-row"><span className="r-label">{filingMethod==='Normal'?'Net income':'Total receipts'}</span><span className="r-val">{fmt(filingMethod==='44ADA'?(useEntries?totalFromEntries:parseFloat(manualCash)||0):totalAmt)}</span></div>
            {filingMethod==='44AD'&&<><div className="result-row"><span className="r-label">Min 8% on cash ({fmt(cashAmt)})</span><span className="r-val">{fmt(cashAmt*0.08)}</span></div><div className="result-row"><span className="r-label">Min 6% on digital ({fmt(digitalAmt)})</span><span className="r-val">{fmt(digitalAmt*0.06)}</span></div><div className="result-row"><span className="r-label">Combined minimum profit</span><span className="r-val green-val">{fmt(minPresumptive)}</span></div></>}
            {filingMethod==='44ADA'&&<div className="result-row"><span className="r-label">Min profit (50%)</span><span className="r-val green-val">{fmt((useEntries?totalFromEntries:parseFloat(manualCash)||0)*0.5)}</span></div>}
            <div style={{background:'var(--blue-light)',borderRadius:8,padding:'0.75rem',marginTop:'1rem',fontSize:12,color:'var(--blue)'}}>Complete income details and proceed to choose your tax regime in Step 3.</div>
          </div>
        </div>
      )}

      {/* STEP 3 — REGIME CHOICE (user explicitly picks) */}
      {step===3&&(
        <div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3 style={{marginBottom:'0.5rem'}}>Choose your tax regime</h3>
            <p style={{fontSize:12,color:'var(--text2)',marginBottom:'1.25rem',lineHeight:1.6}}>This is a very important decision. Under the <strong>new regime</strong> you get lower slab rates but cannot claim deductions (LIC, PPF, health insurance, etc.). Under the <strong>old regime</strong> you get higher slab rates but can claim all deductions. Once you choose a regime for a year, you stay in it.</p>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:'1.5rem'}}>
              {/* NEW REGIME */}
              <div onClick={()=>setRegimeChoice('new')} style={{border:`2px solid ${regimeChoice==='new'?'var(--green)':'var(--border)'}`,borderRadius:12,padding:'1.25rem',cursor:'pointer',background:regimeChoice==='new'?'var(--green-light)':'var(--white)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <div style={{fontWeight:600,color:regimeChoice==='new'?'var(--green)':'var(--navy)',fontSize:15}}>New regime</div>
                  <div style={{fontSize:11,background:'var(--green-light)',color:'var(--green)',padding:'2px 8px',borderRadius:8}}>Default from FY 2024-25</div>
                </div>
                <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.8}}>
                  Basic exemption: ₹4,00,000<br/>
                  Rebate u/s 87A: Zero tax if income ≤ ₹12,00,000<br/>
                  Standard deduction: ₹75,000 (salary only)<br/>
                  No deductions (80C, 80D, HRA etc.)
                </div>
                <div style={{marginTop:'0.75rem',fontSize:12,fontWeight:600,color:'var(--green)'}}>Lower slab rates · Less paperwork</div>
                <table style={{width:'100%',marginTop:'0.75rem',fontSize:11,borderCollapse:'collapse'}}>
                  {newSlabs.map(([r,t])=><tr key={r}><td style={{padding:'2px 0',color:'var(--text2)'}}>{r}</td><td style={{textAlign:'right',fontWeight:500,color:'var(--navy)'}}>{t}</td></tr>)}
                </table>
              </div>

              {/* OLD REGIME */}
              <div onClick={()=>setRegimeChoice('old')} style={{border:`2px solid ${regimeChoice==='old'?'var(--blue)':'var(--border)'}`,borderRadius:12,padding:'1.25rem',cursor:'pointer',background:regimeChoice==='old'?'var(--blue-light)':'var(--white)'}}>
                <div style={{fontWeight:600,color:regimeChoice==='old'?'var(--blue)':'var(--navy)',fontSize:15,marginBottom:8}}>Old regime</div>
                <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.8}}>
                  Basic exemption: ₹2,50,000<br/>
                  Rebate u/s 87A: Zero tax if income ≤ ₹5,00,000<br/>
                  Standard deduction: ₹50,000 (salary only)<br/>
                  All deductions available (80C, 80D, HRA, NPS etc.)
                </div>
                <div style={{marginTop:'0.75rem',fontSize:12,fontWeight:600,color:'var(--blue)'}}>Higher slabs · More deductions</div>
                <table style={{width:'100%',marginTop:'0.75rem',fontSize:11,borderCollapse:'collapse'}}>
                  {oldSlabs.map(([r,t])=><tr key={r}><td style={{padding:'2px 0',color:'var(--text2)'}}>{r}</td><td style={{textAlign:'right',fontWeight:500,color:'var(--navy)'}}>{t}</td></tr>)}
                </table>
              </div>
            </div>

            {/* OLD REGIME DEDUCTIONS (only shown if old regime selected) */}
            {regimeChoice==='old'&&(
              <div style={{background:'var(--bg)',borderRadius:10,padding:'1.25rem',marginBottom:'1.25rem'}}>
                <div style={{fontSize:13,fontWeight:600,color:'var(--navy)',marginBottom:4}}>Enter your deductions — old regime</div>
                <div style={{fontSize:12,color:'var(--text2)',marginBottom:'1rem',lineHeight:1.6}}>Under the old regime, these deductions reduce your taxable income. Enter only what you have actually invested or paid.</div>

                {/* SECTION 80C GROUP */}
                <div style={{marginBottom:'1rem'}}>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--navy)',padding:'4px 10px',background:'var(--navy-light)',borderRadius:6,marginBottom:8}}>Section 80C — max ₹1,50,000 combined</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <div>
                      <label className="form-label">LIC / life insurance premium paid</label>
                      <input className="form-input" type="number" placeholder="e.g. 12000" value={ded80C} onChange={e=>setDed80C(e.target.value)}/>
                      <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>Also includes: PPF, ELSS mutual funds, 5-yr bank FD, tuition fees of children, home loan principal, NSC, ULIP, Sukanya Samriddhi</div>
                    </div>
                    <div style={{background:'var(--green-light)',borderRadius:8,padding:'0.75rem',fontSize:12,color:'var(--green)'}}>
                      <strong>80C includes:</strong><br/>
                      • LIC / life insurance<br/>
                      • PPF (Public Provident Fund)<br/>
                      • ELSS mutual funds<br/>
                      • 5-year bank fixed deposit<br/>
                      • Children tuition fees<br/>
                      • Home loan principal<br/>
                      • NSC / Sukanya Samriddhi<br/>
                      • ULIP premiums<br/>
                      Enter the <strong>total</strong> of all above (max ₹1.5L)
                    </div>
                  </div>
                </div>

                {/* HEALTH INSURANCE */}
                <div style={{marginBottom:'1rem'}}>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--navy)',padding:'4px 10px',background:'var(--navy-light)',borderRadius:6,marginBottom:8}}>Section 80D — health insurance</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <div>
                      <label className="form-label">Health insurance premium — self, spouse, children (max ₹25,000)</label>
                      <input className="form-input" type="number" placeholder="e.g. 25000" value={ded80D} onChange={e=>setDed80D(e.target.value)}/>
                    </div>
                    <div style={{background:'var(--blue-light)',borderRadius:8,padding:'0.75rem',fontSize:12,color:'var(--blue)'}}>
                      <strong>80D limits:</strong><br/>
                      • Self + family (below 60): max ₹25,000<br/>
                      • Self or family (senior citizen): max ₹50,000<br/>
                      • Parents (below 60): max ₹25,000 extra<br/>
                      • Parents (senior citizens): max ₹50,000 extra<br/>
                      Preventive health checkup up to ₹5,000 included in above limits.
                    </div>
                  </div>
                </div>

                {/* NPS */}
                <div style={{marginBottom:'1rem'}}>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--navy)',padding:'4px 10px',background:'var(--navy-light)',borderRadius:6,marginBottom:8}}>Section 80CCD(1B) — NPS additional deduction</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <div>
                      <label className="form-label">NPS contribution (over and above 80C, max ₹50,000)</label>
                      <input className="form-input" type="number" placeholder="e.g. 50000" value={dedNPS} onChange={e=>setDedNPS(e.target.value)}/>
                    </div>
                    <div style={{background:'var(--blue-light)',borderRadius:8,padding:'0.75rem',fontSize:12,color:'var(--blue)'}}>
                      This is an <strong>additional</strong> deduction of up to ₹50,000 for National Pension System (NPS) contributions — over and above the ₹1.5L 80C limit. So total 80C+NPS can be up to ₹2 lakh.
                    </div>
                  </div>
                </div>

                {/* HRA */}
                <div style={{marginBottom:'1rem'}}>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--navy)',padding:'4px 10px',background:'var(--navy-light)',borderRadius:6,marginBottom:8}}>HRA exemption (for salaried — if applicable)</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <div>
                      <label className="form-label">HRA exemption amount (enter 0 if self-employed / no HRA)</label>
                      <input className="form-input" type="number" placeholder="0" value={dedHRA} onChange={e=>setDedHRA(e.target.value)}/>
                    </div>
                    <div style={{background:'var(--amber-light)',borderRadius:8,padding:'0.75rem',fontSize:12,color:'var(--amber)'}}>
                      ⚠ HRA exemption applies mainly to salaried employees. If you are a tutor/freelancer filing under 44AD, HRA does not apply. Enter 0 unless you also have salary income.
                    </div>
                  </div>
                </div>

                {/* OTHER DEDUCTIONS */}
                <div style={{marginBottom:'0.75rem'}}>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--navy)',padding:'4px 10px',background:'var(--navy-light)',borderRadius:6,marginBottom:8}}>Other deductions</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <div>
                      <label className="form-label">Total of other deductions (80G, 80TTA, 80TTB, 80U, etc.)</label>
                      <input className="form-input" type="number" placeholder="e.g. 10000" value={dedOther} onChange={e=>setDedOther(e.target.value)}/>
                    </div>
                    <div style={{background:'var(--green-light)',borderRadius:8,padding:'0.75rem',fontSize:12,color:'var(--green)'}}>
                      <strong>Common others:</strong><br/>
                      • 80G — donations to approved funds<br/>
                      • 80TTA — interest on savings account (max ₹10,000)<br/>
                      • 80TTB — interest for senior citizens (max ₹50,000)<br/>
                      • 80U — disability deduction (₹75,000 or ₹1.25L)<br/>
                      • 80E — education loan interest (no limit)
                    </div>
                  </div>
                </div>

                {/* DEDUCTION SUMMARY */}
                <div style={{background:totalDeductions>0?'var(--green-light)':'var(--bg)',borderRadius:8,padding:'0.75rem 1rem',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:13}}>
                  <span style={{color:'var(--text2)'}}>Total deductions claimed</span>
                  <span style={{fontWeight:700,color:totalDeductions>0?'var(--green)':'var(--text3)',fontSize:16}}>{fmt(totalDeductions)}</span>
                </div>
              </div>
            )}

            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-outline" style={{fontSize:13}} onClick={()=>setStep(2)}>← Back</button>
              <button className="calc-btn" style={{flex:1,marginTop:0,opacity:regimeChoice?1:0.5}} onClick={calculate}>Calculate my tax under {regimeChoice?`${regimeChoice==='new'?'new':'old'} regime`:'chosen regime'} →</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 — RESULTS */}
      {step===4&&calcDone&&(
        <div className="tax-grid">
          <div>
            {/* CHOSEN REGIME RESULT */}
            <div className="panel" style={{marginBottom:'1.25rem',border:`2px solid ${taxData.regimeChoice==='new'?'var(--green)':'var(--blue)'}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                <h3 style={{color:taxData.regimeChoice==='new'?'var(--green)':'var(--blue)'}}>Your tax — {taxData.regimeChoice==='new'?'New regime':'Old regime'} (your choice)</h3>
                {taxData.regimeChoice===taxData.betterRegime
                  ? <span style={{fontSize:11,background:'var(--green-light)',color:'var(--green)',padding:'2px 8px',borderRadius:8}}>✅ Optimal choice</span>
                  : <span style={{fontSize:11,background:'var(--amber-light)',color:'var(--amber)',padding:'2px 8px',borderRadius:8}}>⚠ Other regime saves {fmt(taxData.savings)}</span>
                }
              </div>
              <div className="result-row"><span className="r-label">Gross income declared</span><span className="r-val">{fmt(taxData.grossIncome)}</span></div>
              {taxData.regimeChoice==='old'&&taxData.totalDeductions>0&&<div className="result-row"><span className="r-label">Deductions (80C/80D/HRA etc.)</span><span className="r-val">− {fmt(taxData.totalDeductions)}</span></div>}
              <div className="result-row"><span className="r-label">Taxable income</span><span className="r-val">{fmt(taxData.chosenResult.taxable)}</span></div>
              {taxData.chosenResult.rebate>0&&<div className="result-row"><span className="r-label">Rebate u/s 87A</span><span className="r-val green-val">− {fmt(taxData.chosenResult.rebate)}</span></div>}
              <div className="result-row"><span className="r-label">Income tax (after rebate)</span><span className="r-val red-val">{fmt(taxData.chosenResult.tax)}</span></div>
              <div className="result-row"><span className="r-label">Health and education cess (4%)</span><span className="r-val red-val">{fmt(taxData.chosenResult.cess)}</span></div>
              <div className="total-box" style={{background:taxData.regimeChoice==='new'?'var(--green-light)':'var(--blue-light)'}}><span className="total-label" style={{color:taxData.regimeChoice==='new'?'var(--green)':'var(--blue)'}}>Total tax payable</span><span className="total-val" style={{color:taxData.regimeChoice==='new'?'var(--green)':'var(--blue)'}}>{fmt(taxData.chosenResult.total)}</span></div>
            </div>

            {/* COMPARISON */}
            <div className="panel" style={{marginBottom:'1.25rem'}}>
              <h3 style={{marginBottom:'0.75rem'}}>Comparison — both regimes</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div style={{background:taxData.betterRegime==='new'?'var(--green-light)':'var(--bg)',border:`1.5px solid ${taxData.betterRegime==='new'?'var(--green)':'var(--border)'}`,borderRadius:10,padding:'1rem',textAlign:'center'}}>
                  <div style={{fontSize:11,color:'var(--text3)',marginBottom:4}}>New regime</div>
                  <div style={{fontSize:20,fontWeight:700,color:taxData.betterRegime==='new'?'var(--green)':'var(--text-primary)'}}>{fmt(taxData.newResult.total)}</div>
                  {taxData.betterRegime==='new'&&<div style={{fontSize:11,color:'var(--green)',marginTop:4}}>Lower by {fmt(taxData.savings)}</div>}
                  {taxData.regimeChoice==='new'&&<div style={{fontSize:11,background:'var(--green)',color:'#fff',padding:'2px 8px',borderRadius:8,display:'inline-block',marginTop:4}}>Your choice</div>}
                </div>
                <div style={{background:taxData.betterRegime==='old'?'var(--blue-light)':'var(--bg)',border:`1.5px solid ${taxData.betterRegime==='old'?'var(--blue)':'var(--border)'}`,borderRadius:10,padding:'1rem',textAlign:'center'}}>
                  <div style={{fontSize:11,color:'var(--text3)',marginBottom:4}}>Old regime</div>
                  <div style={{fontSize:20,fontWeight:700,color:taxData.betterRegime==='old'?'var(--blue)':'var(--text-primary)'}}>{fmt(taxData.oldResult.total)}</div>
                  {taxData.betterRegime==='old'&&<div style={{fontSize:11,color:'var(--blue)',marginTop:4}}>Lower by {fmt(taxData.savings)}</div>}
                  {taxData.regimeChoice==='old'&&<div style={{fontSize:11,background:'var(--blue)',color:'#fff',padding:'2px 8px',borderRadius:8,display:'inline-block',marginTop:4}}>Your choice</div>}
                </div>
              </div>
              {taxData.regimeChoice!==taxData.betterRegime&&(
                <div style={{background:'var(--amber-light)',border:'1px solid #ffc107',borderRadius:8,padding:'0.75rem',marginTop:'0.75rem',fontSize:12,color:'var(--amber)'}}>
                  ⚠ You chose the {taxData.regimeChoice} regime, but the {taxData.betterRegime} regime would save you {fmt(taxData.savings)}. You can change your regime before filing your ITR.
                </div>
              )}
              <button className="btn btn-outline" style={{width:'100%',marginTop:'0.75rem',fontSize:13}} onClick={()=>setStep(3)}>← Change regime choice</button>
            </div>

            <div className="panel">
              <h3 style={{marginBottom:'0.75rem'}}>Filing details — Section 58 (44AD)</h3>
              <div className="result-row"><span className="r-label">Cash receipts × 8%</span><span className="r-val">{fmt(taxData.cashReceipts)} → {fmt(taxData.cashReceipts*0.08)}</span></div>
              <div className="result-row"><span className="r-label">Digital receipts × 6%</span><span className="r-val">{fmt(taxData.digitalReceipts)} → {fmt(taxData.digitalReceipts*0.06)}</span></div>
              <div className="result-row"><span className="r-label">Minimum presumptive income</span><span className="r-val">{fmt(taxData.minPresumptive)}</span></div>
              <div className="result-row"><span className="r-label">Declared income (E2b)</span><span className="r-val green-val">{fmt(taxData.grossIncome)}</span></div>
              <button className="gen-btn" onClick={()=>onSection('itr')}>Generate ITR-4 with this data →</button>
            </div>
          </div>
          {/* RIGHT: slabs */}
          <div>
            <div className="panel" style={{marginBottom:'1.25rem'}}>
              <h3 style={{color:'var(--green)',marginBottom:'0.75rem'}}>New regime slabs (FY 2025-26)</h3>
              {newSlabs.map(([r,t])=><div key={r} className="slab-item"><span>{r}</span><span>{t}</span></div>)}
              <div style={{fontSize:11,color:'var(--text3)',marginTop:8}}>Basic exemption: ₹4 lakh · Rebate u/s 87A: Zero tax if income ≤ ₹12 lakh</div>
            </div>
            <div className="panel">
              <h3 style={{color:'var(--blue)',marginBottom:'0.75rem'}}>Old regime slabs (FY 2025-26)</h3>
              {oldSlabs.map(([r,t])=><div key={r} className="slab-item"><span>{r}</span><span>{t}</span></div>)}
              <div style={{fontSize:11,color:'var(--text3)',marginTop:8}}>Basic exemption: ₹2.5 lakh · Rebate u/s 87A: Zero tax if income ≤ ₹5 lakh</div>
              <div style={{fontSize:11,color:'var(--text3)',marginTop:4}}>Deductions available: 80C (max ₹1.5L), 80D, HRA, 80CCD NPS (max ₹50K)</div>
            </div>
          </div>
        </div>
      )}

      {step===4&&!calcDone&&(
        <div className="panel" style={{textAlign:'center',padding:'3rem'}}><div style={{fontSize:40,marginBottom:'1rem'}}>🧮</div><h3 style={{marginBottom:'0.5rem'}}>Go through all steps to calculate</h3><button className="btn btn-green" onClick={()=>setStep(1)}>Start from Step 1</button></div>
      )}
    </div>
  )
}

// ─── VERIFY ─────────────────────────────────────────────────────────────────
function Verify({ entries, toast }) {
  const [bankFile,setBankFile]=useState(null)
  const [bankEntries,setBankEntries]=useState([])
  const [matched,setMatched]=useState([])
  const [unmatched,setUnmatched]=useState([])
  const [unmatchedBank,setUnmatchedBank]=useState([])
  const fileRef=useRef()

  const parseBank=e=>{
    const file=e.target.files[0]; if(!file) return; setBankFile(file.name)
    const reader=new FileReader()
    reader.onload=ev=>{
      const lines=ev.target.result.split('\n').filter(l=>l.trim())
      const parsed=lines.slice(1).map(line=>{
        const cols=line.split(',').map(c=>c.trim().replace(/^"|"$/g,''))
        return { date:cols[0], description:cols[1], amount:parseFloat(cols[2])||parseFloat(cols[3])||0 }
      }).filter(r=>r.amount>0)
      setBankEntries(parsed)
      // Match against income entries
      const matchedArr=[], unmatchedIncome=[], unmatchedBankArr=[]
      const bankPool=[...parsed]
      entries.forEach(entry=>{
        const idx=bankPool.findIndex(b=>Math.abs(b.amount-entry.amount)<1)
        if(idx>=0){ matchedArr.push({entry,bank:bankPool[idx]}); bankPool.splice(idx,1); }
        else unmatchedIncome.push(entry)
      })
      setMatched(matchedArr); setUnmatched(unmatchedIncome); setUnmatchedBank(bankPool)
      toast(`Bank statement processed: ${matchedArr.length} matched, ${unmatchedIncome.length} unverified`)
    }
    reader.readAsText(file)
  }

  const total=entries.reduce((s,e)=>s+e.amount,0)
  const matchedTotal=matched.reduce((s,m)=>s+m.entry.amount,0)
  const matchPct=total>0?Math.round((matchedTotal/total)*100):0

  return (
    <div>
      <div className="page-header"><div><h1>Verify income</h1><p>Cross-check your income entries against bank records before filing ITR</p></div></div>

      <div style={{background:'var(--blue-light)',border:'1px solid #b3cff9',borderRadius:10,padding:'1rem 1.25rem',marginBottom:'1.5rem',fontSize:13,color:'var(--blue)',lineHeight:1.7}}>
        <strong>Why verify?</strong> Before filing your ITR, it is good practice to ensure your income entries match your bank records. This protects you if the tax department ever questions your return. Upload your bank statement and we will automatically match entries.
      </div>

      {entries.length===0
        ? <div className="panel" style={{textAlign:'center',padding:'3rem',color:'var(--text3)'}}>Add income entries first before verifying.</div>
        : (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:'1.5rem'}}>
              <div className="stat-card"><div className="stat-label">Total income entries</div><div className="stat-value">{entries.length}</div><div className="stat-sub">{fmt(total)}</div></div>
              <div className="stat-card"><div className="stat-label">Verified against bank</div><div className="stat-value green-val">{matched.length}</div><div className="stat-sub">{fmt(matchedTotal)} ({matchPct}%)</div></div>
              <div className="stat-card"><div className="stat-label">Needs verification</div><div className="stat-value red-val">{unmatched.length}</div><div className="stat-sub">{fmt(unmatched.reduce((s,e)=>s+e.amount,0))}</div></div>
            </div>

            {/* BANK UPLOAD */}
            <div className="panel" style={{marginBottom:'1.25rem'}}>
              <h3 style={{marginBottom:'0.75rem'}}>Step 1 — Upload your bank statement</h3>
              <div style={{fontSize:12,color:'var(--text2)',marginBottom:'1rem',lineHeight:1.7}}>
                Export your bank statement as CSV. Most banks (SBI, HDFC, ICICI, Axis, etc.) let you download this from net banking.<br/>
                <strong>CSV format needed:</strong> date, description, credit_amount (or debit in separate column)
              </div>
              <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                <button className="btn btn-green" style={{fontSize:13}} onClick={()=>fileRef.current.click()}>📁 Upload bank statement (CSV)</button>
                <input ref={fileRef} type="file" accept=".csv" style={{display:'none'}} onChange={parseBank}/>
                {bankFile&&<span style={{fontSize:13,color:'var(--green)'}}>✅ {bankFile} loaded ({bankEntries.length} transactions found)</span>}
              </div>
            </div>

            {/* RESULTS */}
            {matched.length>0&&(
              <div className="panel" style={{marginBottom:'1.25rem'}}>
                <h3 style={{color:'var(--green)',marginBottom:'0.75rem'}}>✅ Matched entries ({matched.length})</h3>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Client</th><th>Amount</th><th>Bank description</th><th>Status</th></tr></thead>
                    <tbody>
                      {matched.slice(0,10).map((m,i)=>(
                        <tr key={i}>
                          <td>{fmtDate(m.entry.date)}</td><td>{m.entry.client}</td>
                          <td style={{fontWeight:600,color:'var(--green)'}}>{fmt(m.entry.amount)}</td>
                          <td style={{fontSize:12,color:'var(--text3)'}}>{m.bank.description?.slice(0,40)}</td>
                          <td><span className="badge b-confirmed">Verified</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {unmatched.length>0&&(
              <div className="panel" style={{marginBottom:'1.25rem',border:'1px solid #f5c6cb'}}>
                <h3 style={{color:'var(--red)',marginBottom:'0.75rem'}}>⚠ Not found in bank statement ({unmatched.length})</h3>
                <div style={{fontSize:12,color:'var(--text2)',marginBottom:'0.75rem'}}>These entries could not be matched to your bank statement. They may be cash receipts (which won't appear in bank) or the description may differ. Review these carefully.</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Client</th><th>Amount</th><th>Payment mode</th><th>Action</th></tr></thead>
                    <tbody>
                      {unmatched.map((e,i)=>(
                        <tr key={i}>
                          <td>{fmtDate(e.date)}</td><td>{e.client}</td>
                          <td style={{fontWeight:600,color:'var(--red)'}}>{fmt(e.amount)}</td>
                          <td>{e.paymentMode}</td>
                          <td><span style={{fontSize:11,color:'var(--text3)'}}>{e.paymentMode==='Cash'?'Cash — no bank record expected':'Check bank statement'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MANUAL VERIFICATION NOTE */}
            <div className="panel">
              <h3 style={{marginBottom:'0.75rem'}}>Alternatively — verify manually</h3>
              <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.7}}>
                You can also verify each entry manually by uploading receipts, photographs of fee registers, or WhatsApp payment confirmations. While this cannot be done automatically yet, keep these documents safe — they are your source documents if the tax department ever queries your return.
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

// ─── ITR FORM ───────────────────────────────────────────────────────────────
function ITR({ user, entries, taxData, calcDone, toast }) {
  const total=entries.reduce((s,e)=>s+e.amount,0)
  const pct=calcDone&&entries.length>0?90:entries.length>0?50:20
  const chosenResult=taxData.chosenResult||{}
  const regimeName=taxData.regimeChoice==='new'?'New tax regime':'Old tax regime'

  const download=()=>{
    if(!calcDone||entries.length===0){toast('Please add income entries and calculate tax first');return;}
    const lines=[
      'SIMPLE FINANCE INDIA — ITR-4 SUMMARY',
      '========================================',
      `Assessment Year: AY 2026-27`,
      `Financial Year: FY 2025-26`,
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      '',
      'PERSONAL DETAILS',
      `Name: ${user.name}`,
      `PAN: ${user.pan||'Not provided'}`,
      `Filing category: Self-employed / Presumptive taxation`,
      `Filing reason: Voluntary filing`,
      '',
      'BUSINESS INCOME — SECTION 58 (44AD)',
      `[Income Tax Act 2025 as amended by Finance Act 2026]`,
      `Business code: 17006 (Coaching / Tuition centres)`,
      `Nature: Education services`,
      ``,
      `Cash receipts (E1b - cash): Rs. ${Math.round(taxData.cashReceipts||0).toLocaleString('en-IN')}`,
      `Digital receipts (E1b - banking/online): Rs. ${Math.round(taxData.digitalReceipts||0).toLocaleString('en-IN')}`,
      `Total gross receipts: Rs. ${Math.round((taxData.cashReceipts||0)+(taxData.digitalReceipts||0)).toLocaleString('en-IN')}`,
      ``,
      `Minimum presumptive income:`,
      `  Cash × 8%: Rs. ${Math.round((taxData.cashReceipts||0)*0.08).toLocaleString('en-IN')}`,
      `  Digital × 6%: Rs. ${Math.round((taxData.digitalReceipts||0)*0.06).toLocaleString('en-IN')}`,
      `  Combined minimum: Rs. ${Math.round(taxData.minPresumptive||0).toLocaleString('en-IN')}`,
      ``,
      `Declared income (E2b): Rs. ${Math.round(taxData.grossIncome||0).toLocaleString('en-IN')}`,
      '',
      `TAX COMPUTATION — ${regimeName.toUpperCase()}`,
      `[User's explicit regime choice]`,
      ``,
      `Gross income declared: Rs. ${Math.round(taxData.grossIncome||0).toLocaleString('en-IN')}`,
      taxData.regimeChoice==='old'&&taxData.totalDeductions>0?`Deductions (80C/80D/HRA/NPS): Rs. ${Math.round(taxData.totalDeductions).toLocaleString('en-IN')}`:'',
      `Taxable income: Rs. ${Math.round(chosenResult.taxable||0).toLocaleString('en-IN')}`,
      chosenResult.rebate>0?`Rebate u/s 87A: Rs. ${Math.round(chosenResult.rebate).toLocaleString('en-IN')}`:'',
      `Income tax (after rebate): Rs. ${Math.round(chosenResult.tax||0).toLocaleString('en-IN')}`,
      `Health and education cess (4%): Rs. ${Math.round(chosenResult.cess||0).toLocaleString('en-IN')}`,
      `TOTAL TAX PAYABLE: Rs. ${Math.round(chosenResult.total||0).toLocaleString('en-IN')}`,
      '',
      `REGIME COMPARISON`,
      `New regime tax: Rs. ${Math.round(taxData.newResult?.total||0).toLocaleString('en-IN')}`,
      `Old regime tax: Rs. ${Math.round(taxData.oldResult?.total||0).toLocaleString('en-IN')}`,
      `You chose: ${regimeName} | Recommended: ${taxData.betterRegime==='new'?'New':'Old'} regime`,
      '',
      `INCOME ENTRIES SUMMARY`,
      `Total entries: ${entries.length}`,
      `Total income: Rs. ${total.toLocaleString('en-IN')}`,
      `Cash entries: ${entries.filter(e=>e.paymentMode==='Cash').length} entries`,
      `Digital entries: ${entries.filter(e=>e.paymentMode!=='Cash').length} entries`,
      '',
      'LEGAL REFERENCE',
      'Income Tax Act, 2025 (as amended by Finance Act, 2026)',
      'Section 58: Presumptive taxation — businesses (formerly Section 44AD)',
      'Section 156: Rebate of income-tax',
      'Business code 17006: Coaching centres and tuition',
      '',
      '────────────────────────────────',
      'Generated by Simple Finance India',
      'Upload to: www.incometax.gov.in',
      'ITR due date: 31 July 2026',
      '(Extension to 31 August if announced by government)',
    ].filter(l=>l!==false&&l!==undefined).join('\n')

    const blob=new Blob([lines],{type:'text/plain'})
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob)
    a.download=`ITR4_${user.name.replace(/ /g,'_')}_AY2026-27.txt`; a.click()
    toast('ITR-4 summary downloaded!')
  }

  return (
    <div>
      <div className="page-header"><div><h1>ITR-4 form</h1><p>Auto-filled from your income entries and tax calculation</p></div></div>
      <div className="steps-row">
        <div className="itr-step done">✓ Personal details</div>
        <div className="itr-step done">✓ Income details</div>
        <div className="itr-step done">✓ Tax computation</div>
        <div className="itr-step active">Review and download</div>
      </div>
      <div className="progress-wrap">
        <div className="progress-label"><span>Form completion</span><span style={{color:'var(--green)',fontWeight:600}}>{pct}%</span></div>
        <div className="progress-track"><div className="progress-bar" style={{width:pct+'%'}}/></div>
      </div>
      {!calcDone&&<div className="warn-box">⚠ Please complete the Tax Calculator (all 4 steps) before downloading ITR.</div>}

      <div className="itr-grid">
        <div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Personal details ✅</h3>
            <div className="field-row2"><span className="f-label">Full name</span><span className="f-val">{user.name}</span></div>
            <div className="field-row2"><span className="f-label">PAN number</span><span className="f-val">{user.pan||<span className="f-missing">Not added — add in Profile</span>}</span></div>
            <div className="field-row2"><span className="f-label">Assessment year</span><span className="f-val">AY 2026-27</span></div>
            <div className="field-row2"><span className="f-label">Filing reason</span><span className="f-val">Voluntary filing</span></div>
          </div>

          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Business income — Sec. 58 (44AD) {calcDone?'✅':'⏳'}</h3>
            <div className="field-row2"><span className="f-label">Business code</span><span className="f-val">17006 (Coaching / Tuitions)</span></div>
            <div className="field-row2"><span className="f-label">Nature of business</span><span className="f-val">Education services</span></div>
            <div className="field-row2"><span className="f-label">Cash receipts (E1b — cash)</span><span className="f-val">{fmt(taxData.cashReceipts||0)}</span></div>
            <div className="field-row2"><span className="f-label">Digital receipts (E1b — banking)</span><span className="f-val">{fmt(taxData.digitalReceipts||0)}</span></div>
            <div className="field-row2"><span className="f-label">Declared income (E2b)</span><span className="f-val green-val">{fmt(taxData.grossIncome||0)}</span></div>
          </div>

          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Tax computation {calcDone?'✅':'⏳'}</h3>
            <div className="field-row2"><span className="f-label">Chosen regime</span><span className="f-val" style={{color:taxData.regimeChoice==='new'?'var(--green)':'var(--blue)'}}>{calcDone?regimeName:'—'}</span></div>
            <div className="field-row2"><span className="f-label">Taxable income</span><span className="f-val">{calcDone?fmt(chosenResult.taxable||0):'—'}</span></div>
            {(chosenResult.rebate||0)>0&&<div className="field-row2"><span className="f-label">Rebate u/s 87A</span><span className="f-val green-val">− {fmt(chosenResult.rebate)}</span></div>}
            <div className="field-row2"><span className="f-label">Income tax</span><span className="f-val red-val">{calcDone?fmt(chosenResult.tax||0):'—'}</span></div>
            <div className="field-row2"><span className="f-label">Cess (4%)</span><span className="f-val">{calcDone?fmt(chosenResult.cess||0):'—'}</span></div>
            <div className="field-row2"><span className="f-label">Total payable</span><span className="f-val red-val" style={{fontSize:16}}>{calcDone?fmt(chosenResult.total||0):'—'}</span></div>
          </div>

          <div className="panel">
            <h3>Bank details ⚠</h3>
            <div className="field-row2"><span className="f-label">Account number</span><span className="f-missing">⚠ Add before filing</span></div>
            <div className="field-row2"><span className="f-label">IFSC code</span><span className="f-missing">⚠ Add before filing</span></div>
            <div style={{fontSize:11,color:'var(--text3)',marginTop:8}}>Required for tax refunds. Add these details directly on the income-tax.gov.in portal.</div>
          </div>
        </div>

        <div>
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Filing checklist</h3>
            <div className="checklist2">
              <div className="ci2"><span style={{fontSize:16}}>{user.pan?'✅':'⚠️'}</span> PAN number {user.pan?'added':'not added'}</div>
              <div className="ci2"><span style={{fontSize:16}}>{entries.length>0?'✅':'⬜'}</span> Income entries added ({entries.length})</div>
              <div className="ci2"><span style={{fontSize:16}}>{calcDone?'✅':'⬜'}</span> Tax calculated (both regimes)</div>
              <div className="ci2"><span style={{fontSize:16}}>{calcDone&&taxData.regimeChoice?'✅':'⬜'}</span> Regime chosen ({taxData.regimeChoice||'not chosen'})</div>
              <div className="ci2"><span style={{fontSize:16}}>⚠️</span> Bank account details (add on portal)</div>
              <div className="ci2"><span style={{fontSize:16}}>⬜</span> Download and upload to portal</div>
            </div>
          </div>

          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h3>Download ITR</h3>
            <button className="dl-btn" onClick={download}>⬇ Download ITR-4 summary</button>
            <button className="portal-btn" onClick={()=>window.open('https://www.incometax.gov.in','_blank')}>🌐 Open income-tax.gov.in</button>
            <p className="note-sm">Download the summary, then upload it at income-tax.gov.in. Original ITR-4 due date: <strong>31 July 2026</strong>. Government may extend to 31 August — check the portal for latest.</p>
          </div>

          <div className="summary-box">
            <strong>Filing summary</strong><br/>
            Total income: {fmt(total)}<br/>
            Filing method: {taxData.filingMethod||'—'}<br/>
            Chosen regime: {calcDone?regimeName:'—'}<br/>
            Final tax payable: {fmt(chosenResult.total||0)}<br/>
            Savings vs other regime: {calcDone?fmt(taxData.savings||0):'—'}<br/>
            ITR form: ITR-4 (Sugam)<br/>
            AY: 2026-27
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
function Dashboard({ user, entries, taxData, calcDone, onSection }) {
  const total=entries.reduce((s,e)=>s+e.amount,0)
  const months=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']
  const byMonth={}; months.forEach(m=>byMonth[m]=0)
  entries.forEach(e=>{ const d=new Date(e.date); const idx=d.getMonth()>=3?d.getMonth()-3:d.getMonth()+9; byMonth[months[idx]]=(byMonth[months[idx]]||0)+e.amount; })
  const maxM=Math.max(...Object.values(byMonth),1)
  const hasPAN=user.pan&&user.pan.length===10
  const checks=[hasPAN,entries.length>0,calcDone,calcDone&&!!taxData.regimeChoice]
  const done=checks.filter(Boolean).length
  const recent=[...entries].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,4)
  const daysLeft=Math.max(0,Math.ceil((new Date('2026-07-31')-new Date())/(1000*60*60*24)))
  const chosenTax=calcDone&&taxData.chosenResult?taxData.chosenResult.total:0

  return (
    <div>
      <div className="topbar">
        <div><div className="topbar-title">Good morning, {user.name.split(' ')[0]} 👋</div><div className="topbar-sub">FY 2025-26 · AY 2026-27 · Income Tax Act 2025</div></div>
        <div className="deadline-pill">⏰ ITR due: 31 Jul 2026 · {daysLeft} days left</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total income</div><div className="stat-value green-val">{fmt(total)}</div><div className="stat-sub">{entries.length} entries</div></div>
        <div className="stat-card"><div className="stat-label">Tax payable</div><div className="stat-value red-val">{calcDone?fmt(chosenTax):'Not calculated'}</div><div className="stat-sub">{calcDone?`${taxData.regimeChoice==='new'?'New':'Old'} regime (your choice)`:''}</div></div>
        <div className="stat-card"><div className="stat-label">Filing method</div><div className="stat-value" style={{fontSize:15}}>{calcDone?<span style={{background:'var(--blue-light)',color:'var(--blue)',padding:'3px 10px',borderRadius:10,fontSize:13}}>{taxData.filingMethod}</span>:'—'}</div></div>
        <div className="stat-card"><div className="stat-label">Progress</div><div className="stat-value" style={{fontSize:14,marginTop:4}}><span style={{background:done===4?'var(--green-light)':'var(--amber-light)',color:done===4?'var(--green)':'var(--amber)',padding:'4px 10px',borderRadius:12,fontSize:13}}>{done===4?'Ready to file':`${done}/4 steps done`}</span></div></div>
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
          <h3>Checklist</h3>
          <div className="check-list">
            {['PAN number added','Income entries added','Tax calculated','Regime chosen','File on portal'].map((item,i)=>(
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
          <button className="quick-btn" onClick={()=>onSection('verify')}>🏦 &nbsp;Verify against bank statement</button>
          <button className="quick-btn" onClick={()=>onSection('itr')}>📄 &nbsp;View ITR-4 form</button>
        </div>
        <div className="panel"><h3>Recent income entries</h3>
          {recent.length===0
            ? <p style={{color:'var(--text3)',fontSize:13}}>No entries yet. <a onClick={()=>onSection('income')} style={{color:'var(--green)',cursor:'pointer'}}>Add your first →</a></p>
            : recent.map(e=>(
                <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.5rem 0',borderBottom:'1px solid var(--bg)',fontSize:12}}>
                  <div><div style={{fontSize:13}}>{e.client}</div><div style={{color:'var(--text3)',fontSize:11}}>{fmtDate(e.date)} · {e.paymentMode}</div></div>
                  <div style={{textAlign:'right'}}><div style={{fontWeight:600}}>{fmt(e.amount)}</div><span style={{fontSize:10,background:e.paymentMode==='Cash'?'var(--amber-light)':'var(--green-light)',color:e.paymentMode==='Cash'?'var(--amber)':'var(--green)',padding:'1px 6px',borderRadius:6}}>{e.paymentMode==='Cash'?'8%':'6%'}</span></div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
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

  const sideNav=[
    {id:'dashboard',icon:'🏠',label:'Dashboard'},
    {id:'income',icon:'💰',label:'Income entries'},
    {id:'tax',icon:'🧮',label:'Tax calculator'},
    {id:'verify',icon:'🏦',label:'Verify income'},
    {id:'itr',icon:'📄',label:'ITR-4 form'},
  ]

  return (
    <>
      <Nav user={user} onNav={setPage} onLogout={handleLogout}/>
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
            {section==='tax'&&<Tax entries={entries} taxData={taxData} setTaxData={updateTax} calcDone={calcDone} onSection={setSection} toast={toast}/>}
            {section==='verify'&&<Verify entries={entries} toast={toast}/>}
            {section==='itr'&&<ITR user={user} entries={entries} taxData={taxData} calcDone={calcDone} toast={toast}/>}
          </div>
        </div>
      )}
      {toastMsg&&<Toast msg={toastMsg} onDone={()=>setToastMsg(null)}/>}
    </>
  )
}
