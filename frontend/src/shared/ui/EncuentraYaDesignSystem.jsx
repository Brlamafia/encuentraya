import { Bell, CircleUserRound, Home, MapPin, Menu, MessageCircle, Plus, Search, ShieldCheck, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { assetUrl } from '../api/httpClient'
import { categoryNames, formatDate, imageFor } from '../config/itemCatalog'
import { useAuth, useNotices } from '../../app/providers/EncuentraYaProviders'

export function Brand({ compact = false }) {
  return <Link className="brand" to="/" aria-label="EncuentraYA, inicio">
    <span className="brand-mark"><Search size={compact ? 18 : 22}/><MapPin size={compact ? 10 : 12}/></span>
    <span>Encuentra<span>YA</span></span>
  </Link>
}

const navLinks = [['/', 'Inicio'], ['/explore', 'Explorar'], ['/report', 'Publicar'], ['/profile', 'Mis reportes'], ['/messages', 'Mensajes']]

export function Navbar() {
  const { user } = useAuth(); const { unread } = useNotices(); const navigate = useNavigate(); const [open, setOpen] = useState(false)
  return <header className="navbar"><div className="nav-inner"><Brand/>
    <nav className="desktop-links" aria-label="Navegación principal">{navLinks.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}</nav>
    <div className="nav-actions">
      <button className="nav-search" onClick={() => navigate('/explore')} aria-label="Buscar objetos"><Search size={18}/><span>Buscar</span></button>
      {user && <Link className="icon-button" to="/notifications" aria-label={`${unread} notificaciones sin leer`}><Bell size={20}/>{unread > 0 && <b>{unread}</b>}</Link>}
      {user ? <Link className="avatar" to="/profile" aria-label="Perfil">{user.firstName?.[0] || 'U'}</Link> : <Link className="button small ghost" to="/login">Ingresar</Link>}
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Abrir menú">{open ? <X/> : <Menu/>}</button>
    </div>
  </div>{open && <nav className="mobile-menu">{navLinks.map(([to, label]) => <NavLink onClick={() => setOpen(false)} key={to} to={to}>{label}</NavLink>)}</nav>}</header>
}

export function MobileNav() {
  return <nav className="bottom-nav" aria-label="Navegación móvil">
    <NavLink to="/"><Home/><span>Inicio</span></NavLink><NavLink to="/explore"><Search/><span>Buscar</span></NavLink>
    <NavLink className="publish" to="/report"><Plus/><span>Publicar</span></NavLink><NavLink to="/messages"><MessageCircle/><span>Mensajes</span></NavLink>
    <NavLink to="/profile"><CircleUserRound/><span>Perfil</span></NavLink>
  </nav>
}

export function Layout({ children }) {
  return <><Navbar/><main>{children}</main><footer><div><Brand compact/><p>La red segura de objetos perdidos de la comunidad ITLA.</p></div><div><Link to="/explore">Explorar</Link><Link to="/report">Publicar</Link><Link to="/profile">Mi cuenta</Link></div><p>© 2026 EncuentraYA</p></footer><MobileNav/></>
}

export function TypeBadge({ type }) { return <span className={`badge type ${type?.toLowerCase()}`}>{type === 'Found' ? 'Encontrado' : 'Perdido'}</span> }
export function StatusBadge({ status }) {
  const names = { Active: 'Activo', PotentialMatch: 'Posible coincidencia', ClaimInProgress: 'Reclamación en curso', Resolved: 'Recuperado', Closed: 'Cerrado', Pending: 'Pendiente', Approved: 'Aprobada', Rejected: 'Rechazada', Cancelled: 'Cancelada' }
  return <span className={`badge status ${status?.toLowerCase()}`}>{names[status] || status}</span>
}

export function MediaImage({ src, alt, className, eager = false }) {
  const fallback = assetUrl(imageFor({ category: 'Other' }))
  return <img
    className={className}
    src={src || fallback}
    alt={alt}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    onError={(event) => {
      if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback
    }}
  />
}

export function ItemCard({ item, actions }) {
  const src = assetUrl(imageFor(item))
  return <article className="item-card">
    <Link to={`/items/${item.id}`} className="item-image"><MediaImage src={src} alt={`Fotografía del reporte: ${item.title}`}/><TypeBadge type={item.reportType}/><span className="image-sheen"/></Link>
    <div className="item-content"><div className="item-heading"><span>{categoryNames[item.category] || item.category}</span><StatusBadge status={item.status}/></div>
      <Link to={`/items/${item.id}`}><h3>{item.title}</h3></Link><p><MapPin size={15}/>{item.location}</p><small>{formatDate(item.eventDate, { day: 'numeric', month: 'short' })}</small>{actions && <div className="card-actions">{actions}</div>}
    </div>
  </article>
}

export function EmptyState({ title = 'Todavía no hay contenido', message, action, to }) {
  return <div className="empty"><span><Search/></span><h3>{title}</h3><p>{message}</p>{action && <Link className="button primary" to={to}>{action}</Link>}</div>
}

export function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={onClose} aria-label="Cerrar"><X/></button><h2 id="modal-title">{title}</h2>{children}</section></div>
}

export function ProtectedRoute({ children, admin = false }) {
  const { user, checking } = useAuth()
  if (checking) return <LoadingState label="Validando tu sesión..."/>
  if (!user) return <div className="auth-required"><ShieldCheck/><h2>Inicia sesión para continuar</h2><p>Protegemos la información de cada caso y sus participantes.</p><Link className="button primary" to="/login">Iniciar sesión</Link></div>
  if (admin && user.role !== 'Administrator') return <div className="auth-required"><ShieldCheck/><h2>Acceso reservado</h2><p>Esta sección está disponible solo para administradores.</p></div>
  return children
}

export function PageHeader({ eyebrow, title, description, action }) { return <div className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div> }
export function FormField({ label, error, children, hint }) { return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}{error && <em>{error}</em>}</label> }
export function QuickContact() { return <div className="safe-note"><ShieldCheck/><div><strong>Contacto protegido</strong><p>Esta conversación queda vinculada al reporte y solo es visible para sus participantes.</p></div></div> }
export function LoadingState({ label = 'Cargando información...' }) { return <div className="loading-state" role="status"><span/><p>{label}</p></div> }
export function ErrorState({ message, onRetry }) { return <div className="error-state"><ShieldCheck/><h3>No pudimos cargar esta sección</h3><p>{message}</p>{onRetry && <button className="button outline" onClick={onRetry}>Intentar de nuevo</button>}</div> }
