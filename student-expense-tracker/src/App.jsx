import { useEffect, useMemo, useState } from 'react';

const starterExpenses = [
  { id: 1, title: 'Lunch', category: 'Food', amount: 90, date: '2026-11-10' },
  { id: 2, title: 'Bus pass', category: 'Travel', amount: 450, date: '2026-11-09' },
  { id: 3, title: 'Notebook', category: 'Study', amount: 120, date: '2026-11-08' },
  { id: 4, title: 'Coffee', category: 'Food', amount: 60, date: '2026-11-07' }
];

const icons = { Food: '🍱', Travel: '🚌', Study: '📚', Shopping: '🛍️', Other: '✨' };
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export default function App() {
  const [budget, setBudget] = useState(() => Number(localStorage.getItem('spend-budget')) || 5000);
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('spend-expenses');
      return saved ? JSON.parse(saved) : starterExpenses;
    } catch { return starterExpenses; }
  });
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10) });
  const [showBudget, setShowBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(budget));
  const [message, setMessage] = useState('');

  useEffect(() => localStorage.setItem('spend-expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('spend-budget', String(budget)), [budget]);

  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const remaining = budget - total;
  const percent = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;
  const visibleExpenses = useMemo(() => filter === 'All' ? expenses : expenses.filter(item => item.category === filter), [expenses, filter]);

  function addExpense(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0) {
      setMessage('Please enter a description and a valid amount.');
      return;
    }
    setExpenses([{ ...form, id: Date.now(), amount: Number(form.amount) }, ...expenses]);
    setForm({ title: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10) });
    setMessage('Expense added successfully!');
  }

  function saveBudget(event) {
    event.preventDefault();
    const value = Number(budgetInput);
    if (value > 0) {
      setBudget(value);
      setShowBudget(false);
      setMessage('Monthly budget updated.');
    }
  }

  function deleteExpense(id) {
    setExpenses(expenses.filter(item => item.id !== id));
    setMessage('Expense deleted.');
  }

  return <div className="page">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-icon">S</span><span>Spend<span>Smart</span></span></a>
      <div className="top-note"><span className="online-dot"></span> Student personal finance</div>
      <div className="profile">ST</div>
    </header>

    <main className="container">
      <section className="intro">
        <div><p className="eyebrow">YOUR MONEY, IN CONTROL</p><h1>Student Expense Tracker</h1><p className="sub">A simple way to keep an eye on your everyday spending.</p></div>
        <button className="outline-btn" onClick={() => { setBudgetInput(String(budget)); setShowBudget(!showBudget); }}>✎ &nbsp; Edit budget</button>
      </section>

      {showBudget && <form className="budget-editor" onSubmit={saveBudget}><label>Monthly budget (₹)</label><input type="number" min="1" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} required/><button className="primary-btn">Save budget</button></form>}
      {message && <div className="message"><span>✓</span>{message}<button onClick={() => setMessage('')}>×</button></div>}

      <section className="summary-grid">
        <article className="summary-card budget-card"><div className="summary-head"><span>Monthly budget</span><span className="summary-symbol">◎</span></div><strong>{money(budget)}</strong><small>Your spending limit</small></article>
        <article className="summary-card"><div className="summary-head"><span>Total spent</span><span className="summary-symbol coral">↗</span></div><strong>{money(total)}</strong><small>Across {expenses.length} expenses</small></article>
        <article className="summary-card"><div className="summary-head"><span>Remaining balance</span><span className="summary-symbol green">✓</span></div><strong className={remaining < 0 ? 'over' : ''}>{money(remaining)}</strong><small>{remaining < 0 ? 'You are over budget' : 'You are within budget'}</small></article>
      </section>

      <section className="progress-card">
        <div className="progress-top"><div><h2>Monthly budget overview</h2><p>You've used <b>{Math.round(percent)}%</b> of your budget</p></div><span>{money(total)} <small>/ {money(budget)}</small></span></div>
        <div className="progress-track"><div className={percent > 85 ? 'progress-fill warning' : 'progress-fill'} style={{ width: `${percent}%` }}></div></div>
        <div className="progress-foot"><span>₹0</span><span>{money(budget)}</span></div>
      </section>

      <div className="content-grid">
        <section className="panel add-panel">
          <div className="panel-title"><div><p className="eyebrow">NEW RECORD</p><h2>Add an expense</h2></div><span className="plus">＋</span></div>
          <form onSubmit={addExpense} className="expense-form">
            <label>Expense description</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Lunch, bus ticket..." required/>
            <div className="two-fields"><div><label>Amount (₹)</label><input type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" required/></div><div><label>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{Object.keys(icons).map(category => <option key={category}>{category}</option>)}</select></div></div>
            <label>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required/>
            <button className="primary-btn full-btn">＋ Add expense</button>
          </form>
        </section>

        <section className="panel history-panel">
          <div className="history-heading"><div><p className="eyebrow">WHERE IT GOES</p><h2>Recent expenses</h2></div><span className="count">{expenses.length} records</span></div>
          <div className="filters">{['All', ...Object.keys(icons)].map(category => <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{category}</button>)}</div>
          <div className="expense-list">
            {visibleExpenses.length ? visibleExpenses.map(item => <article className="expense-row" key={item.id}><div className={`expense-icon ${item.category.toLowerCase()}`}>{icons[item.category]}</div><div className="expense-info"><strong>{item.title}</strong><small>{item.category} · {new Date(`${item.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div><b className="amount">− {money(item.amount)}</b><button className="delete-btn" title="Delete expense" onClick={() => deleteExpense(item.id)}>×</button></article>) : <div className="empty">No expenses in this category yet.</div>}
          </div>
        </section>
      </div>
      <footer>SpendSmart <span>Simple habits. Smarter spending.</span></footer>
    </main>
  </div>;
}
