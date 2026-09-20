'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight } from 'lucide-react';
export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Líder, inicio">
        LÍDER<span>ESPECIALISTAS EN VOLANTES</span>
      </Link>
      <button
        className="menu-toggle"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? 'nav open' : 'nav'} aria-label="Navegación principal">
        <Link onClick={() => setOpen(false)} href="/#servicios">
          Servicios
        </Link>
        <Link onClick={() => setOpen(false)} href="/trabajos">
          Nuestros trabajos
        </Link>
        <Link onClick={() => setOpen(false)} href="/concesionarias">
          Concesionarias
        </Link>
        <Link onClick={() => setOpen(false)} href="/#nosotros">
          El taller
        </Link>
        <Link onClick={() => setOpen(false)} href="/contacto" className="button small">
          Pedí tu presupuesto <ArrowUpRight size={16} />
        </Link>
      </nav>
    </header>
  );
}
