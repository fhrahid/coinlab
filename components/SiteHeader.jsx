'use client';
import Link from 'next/link';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

const wings = [{ slug: 'ai-in-healthcare', name: 'Healthcare' }, { slug: 'financial-technology', name: 'FinTech' }, { slug: 'networking-and-security', name: 'Networking & Security' }, { slug: 'smart-agriculture', name: 'Smart Agriculture' }, { slug: 'natural-language-processing', name: 'NLP' }];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [wingsOpen, setWingsOpen] = useState(false);
  const closeMenus = () => { setOpen(false); setWingsOpen(false); };
  return <header className="site-header"><div className="nav-wrap"><Link className="brand" href="/" onClick={closeMenus}><img src="/coinlab-logo.jpg" alt="COiN Lab logo" /><span><b>COiN LAB</b><small>SOUTHEAST UNIVERSITY</small></span></Link><nav className={open ? 'nav-links open' : 'nav-links'}><Link href="/" onClick={closeMenus}>Home</Link><Link href="/#about" onClick={closeMenus}>About</Link><div className={wingsOpen ? 'nav-dropdown expanded' : 'nav-dropdown'}><button aria-expanded={wingsOpen} onClick={() => setWingsOpen(!wingsOpen)}>Research wings <span>⌄</span></button><div className="nav-menu">{wings.map((wing) => <Link href={`/wings/${wing.slug}`} key={wing.slug} onClick={closeMenus}>{wing.name}<ArrowUpRight size={14} /></Link>)}</div></div><Link href="/people" onClick={closeMenus}>People</Link><Link href="/papers" onClick={closeMenus}>Papers</Link><Link className="nav-cta" href="/#contact" onClick={closeMenus}>Get in touch <ArrowUpRight size={16} /></Link></nav><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>{open ? <X /> : <Menu />}</button></div></header>;
}
