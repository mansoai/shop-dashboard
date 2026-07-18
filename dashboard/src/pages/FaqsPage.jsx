import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const emptyForm = { id: null, question: '', answer: '' };

export default function FaqsPage({ merchant }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);

  useEffect(() => { loadFaqs(); }, [merchant]);

  async function loadFaqs() {
    setLoading(true);
    const { data } = await supabase
      .from('faqs')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false });
    setFaqs(data || []);
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = {
      merchant_id: merchant.id,
      question: form.question.trim(),
      answer: form.answer.trim()
    };
    if (form.id) {
      await supabase.from('faqs').update(payload).eq('id', form.id);
    } else {
      await supabase.from('faqs').insert(payload);
    }
    setForm(null);
    loadFaqs();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this FAQ?')) return;
    await supabase.from('faqs').delete().eq('id', id);
    loadFaqs();
  }

  if (loading) return <p className="card-sub">Loading FAQs…</p>;

  return (
    <div>
      {!form && (
        <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => setForm(emptyForm)}>
          + Add FAQ
        </button>
      )}

      {form && (
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>{form.id ? 'Edit FAQ' : 'New FAQ'}</h3>
          <form className="stack" onSubmit={handleSave}>
            <div>
              <label>Question</label>
              <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="e.g. Do you deliver?" required />
            </div>
            <div>
              <label>Answer</label>
              <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
            </div>
            <div className="card-actions" style={{ marginTop: 4 }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {faqs.length === 0 && !form && (
        <div className="empty-state">
          <h3>No FAQs yet</h3>
          <p>Add common questions so the bot can answer instantly.</p>
        </div>
      )}

      {faqs.map((f) => (
        <div className="card" key={f.id}>
          <div className="card-title">{f.question}</div>
          <div className="card-sub">{f.answer}</div>
          <div className="card-actions">
            <button className="btn btn-secondary" onClick={() => setForm(f)}>Edit</button>
            <button className="btn btn-danger" onClick={() => handleDelete(f.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
