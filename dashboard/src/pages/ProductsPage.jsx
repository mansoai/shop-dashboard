import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const emptyForm = { id: null, name: '', price: '', description: '', image_url: '', available: true };

export default function ProductsPage({ merchant }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null = form closed, emptyForm = adding, else editing

  useEffect(() => { loadProducts(); }, [merchant]);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = {
      merchant_id: merchant.id,
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      image_url: form.image_url.trim() || null,
      available: form.available
    };

    if (form.id) {
      await supabase.from('products').update(payload).eq('id', form.id);
    } else {
      await supabase.from('products').insert(payload);
    }
    setForm(null);
    loadProducts();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  }

  async function toggleAvailable(product) {
    await supabase.from('products').update({ available: !product.available }).eq('id', product.id);
    loadProducts();
  }

  if (loading) return <p className="card-sub">Loading products…</p>;

  return (
    <div>
      {!form && (
        <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => setForm(emptyForm)}>
          + Add product
        </button>
      )}

      {form && (
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>{form.id ? 'Edit product' : 'New product'}</h3>
          <form className="stack" onSubmit={handleSave}>
            <div>
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label>Price (GH₵)</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe it well - this is what customers and photo matching see" />
            </div>
            <div>
              <label>Photo URL</label>
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="card-actions" style={{ marginTop: 4 }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 && !form && (
        <div className="empty-state">
          <h3>No products yet</h3>
          <p>Add your first item so customers can ask about it on WhatsApp.</p>
        </div>
      )}

      {products.map((p) => (
        <div className="card" key={p.id}>
          <div className="card-row">
            <div>
              <div className="card-title">{p.name} {!p.available && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(hidden)</span>}</div>
              <div className="card-sub">{p.description}</div>
            </div>
            <span className="price-tag">GH₵{p.price}</span>
          </div>
          <div className="card-actions">
            <button className="btn btn-secondary" onClick={() => setForm({ ...p, price: String(p.price) })}>Edit</button>
            <button className="btn btn-secondary" onClick={() => toggleAvailable(p)}>{p.available ? 'Hide' : 'Show'}</button>
            <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
