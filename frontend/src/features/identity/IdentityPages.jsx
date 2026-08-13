import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Bell, CalendarDays, Check, ChevronRight, CircleCheck, Clock3, Eye, FileCheck2, Filter, Handshake, ImagePlus, KeyRound, MapPin, MessageCircle, PackageCheck, Search, Send, ShieldCheck, Sparkles, Upload, UserRoundCheck, UsersRound, X } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api, { apiError, assetUrl } from '../../shared/api/httpClient'
import { categories, categoryImages, categoryNames, formatDate, imageFor, timeAgo } from '../../shared/config/itemCatalog'
import { useAuth, useNotices } from '../../app/providers/EncuentraYaProviders'
import { useAsyncResource } from '../../shared/hooks/useAsyncResource'
import { EmptyState, ErrorState, FormField, ItemCard, LoadingState, Modal, PageHeader, QuickContact, StatusBadge, TypeBadge } from '../../shared/ui/EncuentraYaDesignSystem'

const fallbackLost = { title: 'Tu objeto perdido', category: 'Headphones', location: 'Campus ITLA', reportType: 'Lost' }
const fallbackFound = { title: 'Una posible coincidencia', category: 'Keys', location: 'Campus ITLA', reportType: 'Found' }

export function LoginPage() {
  const { login } = useAuth(); const navigate = useNavigate(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); const fields = new FormData(event.currentTarget); try { await login(fields.get('email'), fields.get('password')); navigate('/profile') } catch (requestError) { setError(requestError.message) } finally { setBusy(false) } }
  return <section className="auth-page"><div className="auth-aside"><span className="eyebrow">Bienvenido de vuelta</span><h2>Tu historial sigue aquí.</h2><p>Reportes, reclamaciones y mensajes permanecen vinculados a tu cuenta.</p><div><ShieldCheck/><span><b>Sesión protegida</b><small>Autenticación JWT y permisos por rol</small></span></div></div><div className="auth-card"><span className="auth-icon"><ShieldCheck/></span><h1>Iniciar sesión</h1><p>Continúa donde lo dejaste.</p>{error && <div className="form-error">{error}</div>}<form className="stack-form" onSubmit={submit}><FormField label="Correo electrónico"><input name="email" type="email" required defaultValue="user@encuentraya.local"/></FormField><FormField label="Contraseña"><input name="password" type="password" required defaultValue="Usuario123!"/></FormField><button disabled={busy} className="button primary full">{busy ? 'Validando...' : 'Entrar a mi cuenta'}</button></form><div className="demo-note"><b>Cuenta de prueba</b><span>user@encuentraya.local · Usuario123!</span></div><p>¿Aún no tienes cuenta? <Link to="/register">Crear cuenta</Link></p></div></section>
}

export function RegisterPage() {
  const { register } = useAuth(); const navigate = useNavigate(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); const fields = new FormData(event.currentTarget); try { await register({ firstName: fields.get('firstName'), lastName: fields.get('lastName'), email: fields.get('email'), password: fields.get('password'), confirmPassword: fields.get('confirmPassword') }); navigate('/profile') } catch (requestError) { setError(requestError.message) } finally { setBusy(false) } }
  return <section className="auth-page"><div className="auth-aside"><span className="eyebrow">Únete a la red</span><h2>Una cuenta. Todo tu seguimiento.</h2><p>Cada acción queda guardada para que puedas volver en cualquier momento.</p><div><UsersRound/><span><b>Comunidad responsable</b><small>Publica, valida y coordina de forma segura</small></span></div></div><div className="auth-card wide"><span className="auth-icon"><UsersRound/></span><h1>Crear cuenta</h1><p>Empieza a ayudar y recuperar.</p>{error && <div className="form-error">{error}</div>}<form className="stack-form" onSubmit={submit}><div className="two-cols"><FormField label="Nombre"><input name="firstName" required/></FormField><FormField label="Apellido"><input name="lastName" required/></FormField></div><FormField label="Correo electrónico"><input name="email" type="email" required placeholder="nombre@itla.edu.do"/></FormField><FormField label="Contraseña"><input name="password" type="password" minLength="8" required/></FormField><FormField label="Confirmar contraseña"><input name="confirmPassword" type="password" minLength="8" required/></FormField><label className="check-line"><input type="checkbox" required/>Acepto las normas de convivencia y privacidad.</label><button disabled={busy} className="button primary full">{busy ? 'Creando cuenta...' : 'Crear mi cuenta'}</button></form><p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p></div></section>
}

export function ProfilePage() {
  const { user, logout } = useAuth(); const { notify } = useNotices(); const navigate = useNavigate()
  const { data, loading, error, refresh } = useAsyncResource(async () => { const [items, claims, conversations] = await Promise.all([api.get('/items/mine'), api.get('/claims'), api.get('/conversations')]); return { items: items.data, claims: claims.data, conversations: conversations.data } }, [])
  const resolve = async (id) => { try { await api.patch(`/items/${id}/resolve`); notify('Caso marcado como recuperado.'); refresh() } catch (requestError) { notify(apiError(requestError), 'error') } }
  const close = async (id) => { if (!confirm('¿Quieres cerrar esta publicación? Dejará de aparecer en Explorar.')) return; try { await api.delete(`/items/${id}`); notify('Publicación cerrada.'); refresh() } catch (requestError) { notify(apiError(requestError), 'error') } }
  const signOut = () => { logout(); navigate('/') }
  const items = data?.items || []; const claims = data?.claims || []; const conversations = data?.conversations || []
  return <section className="page wrap"><div className="profile-hero"><div className="profile-avatar">{user.firstName?.[0] || 'U'}</div><div><span className="eyebrow">Espacio personal</span><h1>{user.firstName} {user.lastName}</h1><p>{user.email} · Miembro desde {formatDate(user.createdAt, { month: 'long', year: 'numeric' })}</p></div><button className="button ghost" onClick={signOut}>Cerrar sesión</button></div>
    <div className="profile-stats"><div><b>{items.length}</b><span>Publicaciones</span></div><div><b>{claims.length}</b><span>Reclamaciones</span></div><div><b>{items.filter((item) => item.status === 'Resolved').length}</b><span>Recuperados</span></div><div><b>{conversations.length}</b><span>Conversaciones</span></div></div>
    <div className="profile-tabs"><Link className="active">Mis publicaciones</Link><Link to="/claims">Reclamaciones</Link><Link to="/matches">Coincidencias</Link><Link to="/messages">Conversaciones</Link>{user.role === 'Administrator' && <Link to="/admin">Administración</Link>}</div>
    <div className="section-heading"><div><h2>Mis publicaciones</h2><p>Cualquier cambio se guarda inmediatamente.</p></div><Link className="button primary" to="/report"><Upload/>Nuevo reporte</Link></div>
    {loading ? <LoadingState/> : error ? <ErrorState message={error} onRetry={refresh}/> : items.length ? <div className="cards-grid">{items.map((item) => <ItemCard key={item.id} item={item} actions={<><button onClick={() => resolve(item.id)} disabled={item.status === 'Resolved'}>{item.status === 'Resolved' ? 'Recuperado' : 'Resolver'}</button><button className="danger-link" onClick={() => close(item.id)}>Cerrar</button></>}/>)}</div> : <EmptyState title="Todavía no tienes objetos reportados" action="Publicar mi primer reporte" to="/report"/>}
  </section>
}

