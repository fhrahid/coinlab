'use client';
import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setStatus('sent');
    else { setStatus('idle'); setError(data.error || 'Could not send your message.'); }
  };
  if (status === 'sent') return <div className="contact-form contact-sent"><span className="contact-sent-icon"><Check size={22} /></span><strong>Message received.</strong><p>Thank you, {form.name.split(' ')[0]}. The COiN Lab team will reply to <b>{form.email}</b> soon.</p></div>;
  return (
    <form className="contact-form" onSubmit={submit}>
      <label>Name<input onChange={set('name')} placeholder="Your full name" required type="text" value={form.name} /></label>
      <label>Email<input onChange={set('email')} placeholder="you@university.edu" required type="email" value={form.email} /></label>
      <label>Subject<input onChange={set('subject')} placeholder="Collaboration, research, visit…" type="text" value={form.subject} /></label>
      <label>Message<textarea onChange={set('message')} placeholder="Tell us what you are thinking about." required rows={5} value={form.message} /></label>
      <input aria-hidden="true" autoComplete="off" name="website" onChange={set('website')} style={{ position: 'absolute', left: '-5000px', tabindIndex: '-1' }} tabIndex={-1} type="text" value={form.website} />
      {error && <span className="contact-error">{error}</span>}
      <button className="button button-primary contact-send" disabled={status === 'sending'} type="submit">{status === 'sending' ? 'Sending…' : <>Send message <ArrowUpRight size={16} /></>}</button>
    </form>
  );
}
