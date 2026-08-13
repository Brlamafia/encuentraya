import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Bell, CalendarDays, Check, ChevronRight, CircleCheck, Clock3, Eye, FileCheck2, Filter, Handshake, ImagePlus, KeyRound, MapPin, MessageCircle, PackageCheck, Search, Send, ShieldCheck, Sparkles, Upload, UserRoundCheck, UsersRound, X } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api, { apiError, assetUrl } from '../../shared/api/httpClient'
import { categories, categoryImages, categoryNames, formatDate, imageFor, timeAgo } from '../../shared/config/itemCatalog'
import { useAuth, useNotices } from '../../app/providers/EncuentraYaProviders'
import { useAsyncResource } from '../../shared/hooks/useAsyncResource'
import { EmptyState, ErrorState, FormField, ItemCard, LoadingState, MediaImage, Modal, PageHeader, QuickContact, StatusBadge, TypeBadge } from '../../shared/ui/EncuentraYaDesignSystem'

const fallbackLost = { title: 'Tu objeto perdido', category: 'Headphones', location: 'Campus ITLA', reportType: 'Lost' }
const fallbackFound = { title: 'Una posible coincidencia', category: 'Keys', location: 'Campus ITLA', reportType: 'Found' }

export function HomePage() {
  const navigate = useNavigate(); const [query, setQuery] = useState('')
  const { data: items = [], loading } = useAsyncResource(async () => (await api.get('/items')).data, [])
  const lost = items?.find((item) => item.reportType === 'Lost') || fallbackLost
  const found = items?.find((item) => item.reportType === 'Found') || fallbackFound
  return <>
    <section className="hero modern-hero"><div className="hero-orbit one"/><div className="hero-orbit two"/>
      <div className="hero-copy"><span className="hero-kicker"><span/>Red de confianza · Comunidad ITLA</span>
        <h1>Lo importante<br/><em>siempre encuentra el camino.</em></h1>
        <p>Publica lo que perdiste o encontraste. EncuentraYA conecta reportes reales, protege los detalles sensibles y facilita una devolución segura.</p>
        <div className="hero-actions"><Link className="button primary large" to="/report?type=Lost"><Search/>Reportar pérdida</Link><Link className="button light large" to="/report?type=Found"><PackageCheck/>Reportar hallazgo</Link></div>
        <form className="hero-search" onSubmit={(event) => { event.preventDefault(); navigate(`/explore?q=${encodeURIComponent(query)}`) }}><Search/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Audífonos, carnet, mochila..." aria-label="Buscar objeto"/><button>Buscar</button></form>
        <div className="trust-row"><span><ShieldCheck/>Datos protegidos</span><span><UsersRound/>Personas verificadas</span><span><Clock3/>Seguimiento en tiempo real</span></div>
      </div>
      <div className="hero-visual new-visual" aria-label="Ejemplo de coincidencia entre reportes"><div className="visual-label"><Sparkles/>Coincidencia detectada</div>
        <div className="visual-card"><MediaImage eager src={assetUrl(imageFor(lost))} alt="Reporte perdido"/><div><TypeBadge type="Lost"/><h3>{lost.title}</h3><p><MapPin/>{lost.location}</p></div></div>
        <div className="match-line"><span/><b>78%<small>match</small></b><span/></div>
        <div className="visual-card found"><MediaImage eager src={assetUrl(imageFor(found))} alt="Reporte encontrado"/><div><TypeBadge type="Found"/><h3>{found.title}</h3><p><MapPin/>{found.location}</p></div></div>
        <div className="float-chip two"><span><CircleCheck/></span><div><b>Proceso protegido</b><small>Validación antes de entregar</small></div></div>
      </div>
    </section>

    <section className="section wrap"><div className="section-heading"><div><span className="eyebrow">Actividad en el campus</span><h2>Publicaciones recientes</h2><p>Reportes reales ordenados por fecha de publicación.</p></div><Link to="/explore">Explorar todo <ArrowRight/></Link></div>
      {loading ? <LoadingState/> : items?.length ? <div className="cards-grid">{items.slice(0, 4).map((item) => <ItemCard key={item.id} item={item}/>)}</div> : <EmptyState title="Sé la primera persona en publicar" action="Crear reporte" to="/report"/>}
    </section>

    <section className="categories-section"><div className="wrap"><div className="section-heading"><div><span className="eyebrow">Atajos visuales</span><h2>Busca por categoría</h2></div></div>
      <div className="category-grid modern-categories">{categories.slice(0, 8).map((category, index) => <Link key={category} to={`/explore?category=${category}`} style={{ '--category-image': `url(${categoryImages[category]})` }}><span>{[<MessageCircle/>, <FileCheck2/>, <PackageCheck/>, <KeyRound/>, <FileCheck2/>, <Sparkles/>, <Search/>, <UserRoundCheck/>][index]}</span><b>{categoryNames[category]}</b><ChevronRight/></Link>)}</div>
    </div></section>

    <section className="how-section wrap"><div className="how-copy"><span className="eyebrow">Del reporte a la devolución</span><h2>Un flujo claro, sin exponer tu información</h2><p>Cada paso queda registrado para que ambas personas sepan qué sigue.</p>
      <ol><li><b>01</b><div><strong>Publica con contexto</strong><span>Fotografía, ubicación, fecha y detalles útiles.</span></div></li><li><b>02</b><div><strong>Compara coincidencias</strong><span>El sistema cruza categoría, palabras, lugar y fecha.</span></div></li><li><b>03</b><div><strong>Valida y coordina</strong><span>Reclamación privada y mensajería vinculada al caso.</span></div></li></ol>
    </div><div className="community-card"><span><Handshake/></span><h3>La confianza también se diseña</h3><p>Los detalles privados nunca aparecen en la publicación y cada conversación nace desde un caso real.</p><div><b>{items?.filter((item) => item.status === 'Resolved').length || 0}</b><small>casos resueltos visibles ahora</small></div><Link className="button light" to="/report">Aportar a la comunidad <ArrowRight/></Link></div></section>
  </>
}

export function ExplorePage() {
  const [searchParams] = useSearchParams(); const [query, setQuery] = useState(searchParams.get('q') || ''); const [type, setType] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || ''); const [status, setStatus] = useState(''); const [location, setLocation] = useState(''); const [filtersOpen, setFiltersOpen] = useState(false)
  const { data: items = [], loading, error, refresh } = useAsyncResource(async () => {
    const params = Object.fromEntries(Object.entries({ search: query, type, category, status, location }).filter(([, value]) => value))
    return (await api.get('/items', { params })).data
  }, [query, type, category, status, location])
  const clear = () => { setQuery(''); setType(''); setCategory(''); setStatus(''); setLocation('') }
  return <section className="page wrap"><PageHeader eyebrow="Radar del campus" title="Explora objetos publicados" description="Filtra información almacenada en tiempo real. Cada resultado abre su caso original." action={<Link className="button primary" to="/report"><Upload/>Nuevo reporte</Link>}/>
    <div className="explore-toolbar"><label className="search-box"><Search/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nombre, marca o característica..."/></label><button className="filter-button" aria-expanded={filtersOpen} aria-controls="explore-filters" onClick={() => setFiltersOpen((value) => !value)}><Filter/>Filtros</button></div>
    <div id="explore-filters" className={`filter-row ${filtersOpen ? 'open' : ''}`}><select value={type} onChange={(event) => setType(event.target.value)}><option value="">Todos</option><option value="Lost">Perdidos</option><option value="Found">Encontrados</option></select>
      <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas las categorías</option>{categories.map((value) => <option key={value} value={value}>{categoryNames[value]}</option>)}</select>
      <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Cualquier estado</option><option value="Active">Activo</option><option value="PotentialMatch">Posible coincidencia</option><option value="ClaimInProgress">Reclamación en curso</option><option value="Resolved">Recuperado</option></select>
      <input className="location-filter" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ubicación"/>
      {(query || type || category || status || location) && <button className="clear-filter" onClick={clear}><X/>Limpiar</button>}
    </div>
    {loading ? <LoadingState/> : error ? <ErrorState message={error} onRetry={refresh}/> : <><div className="result-count"><b>{items?.length || 0}</b> resultados guardados</div>{items?.length ? <div className="cards-grid">{items.map((item) => <ItemCard key={item.id} item={item}/>)}</div> : <EmptyState title="No encontramos resultados" message="Prueba con otra palabra o elimina algunos filtros."/>}</>}
  </section>
}

export function ItemDetailPage() {
  const { id } = useParams(); const navigate = useNavigate(); const { user } = useAuth(); const { notify } = useNotices(); const [claimOpen, setClaimOpen] = useState(false); const [busy, setBusy] = useState(false)
  const { data: item, loading, error, refresh } = useAsyncResource(async () => (await api.get(`/items/${id}`)).data, [id])
  if (loading) return <LoadingState/>; if (error || !item) return <section className="page wrap"><ErrorState message={error || 'La publicación no existe.'} onRetry={refresh}/></section>
  const submitClaim = async (event) => {
    event.preventDefault(); setBusy(true); const fields = new FormData(event.currentTarget)
    try { await api.post('/claims', { itemReportId: item.id, message: fields.get('message'), verificationAnswer: fields.get('verificationAnswer'), additionalDetail: fields.get('additionalDetail') }); setClaimOpen(false); notify('Tu reclamación fue guardada y el publicador recibió una notificación.') }
    catch (requestError) { notify(apiError(requestError), 'error') } finally { setBusy(false) }
  }
  const contact = async () => {
    if (!user) { navigate('/login'); return }
    if (user.id === item.userId) { navigate('/profile'); return }
    setBusy(true)
    try { const { data } = await api.post('/conversations', { itemReportId: item.id, recipientUserId: item.userId }); navigate(`/messages/${data.id}`) }
    catch (requestError) { notify(apiError(requestError), 'error') } finally { setBusy(false) }
  }
  const resolve = async () => { try { await api.patch(`/items/${item.id}/resolve`); notify('Caso marcado como recuperado.'); refresh() } catch (requestError) { notify(apiError(requestError), 'error') } }
  return <section className="page wrap"><Link className="back-link" to="/explore">← Volver a explorar</Link><div className="detail-layout">
    <div className="detail-image"><MediaImage eager src={assetUrl(imageFor(item))} alt={item.title}/><TypeBadge type={item.reportType}/><div className="detail-image-caption"><span>Reporte #{item.id.slice(0, 8)}</span><span>{formatDate(item.createdAt)}</span></div></div>
    <div className="detail-info"><div className="detail-badges"><StatusBadge status={item.status}/><span>{categoryNames[item.category]}</span></div><h1>{item.title}</h1><p className="detail-description">{item.description}</p>
      <dl><div><dt><MapPin/>Ubicación</dt><dd>{item.location}</dd></div><div><dt><CalendarDays/>Fecha aproximada</dt><dd>{formatDate(item.eventDate, { dateStyle: 'long' })}</dd></div><div><dt><UserRoundCheck/>Publicado por</dt><dd>{item.publisherName}</dd></div></dl>
      {user?.id === item.userId ? <button className="button primary full" onClick={resolve} disabled={item.status === 'Resolved'}><Check/>{item.status === 'Resolved' ? 'Caso resuelto' : 'Marcar como recuperado'}</button> : item.reportType === 'Found' ? <button className="button primary full" onClick={() => user ? setClaimOpen(true) : navigate('/login')}><PackageCheck/>Creo que este objeto es mío</button> : <Link className="button primary full" to="/report?type=Found"><PackageCheck/>Encontré uno similar</Link>}
      {user?.id !== item.userId && <button className="button outline full" onClick={contact} disabled={busy}><MessageCircle/>Contactar al publicador</button>}<QuickContact/>
    </div></div>
    {claimOpen && <Modal title="Validar reclamación" onClose={() => setClaimOpen(false)}><form className="stack-form" onSubmit={submitClaim}><p>Describe información que solo la persona propietaria debería conocer. La respuesta queda almacenada de forma privada.</p><FormField label="¿Por qué crees que te pertenece?"><textarea name="message" required minLength="10" placeholder="Cuándo lo perdiste, dónde estabas y qué recuerdas..."/></FormField><FormField label="Característica privada de verificación"><input name="verificationAnswer" required placeholder="Color, marca, contenido o detalle no visible"/></FormField><FormField label="Detalle adicional (opcional)"><textarea name="additionalDetail" placeholder="Número de serie u otra referencia..."/></FormField><button disabled={busy} className="button primary full"><Send/>{busy ? 'Guardando...' : 'Enviar reclamación'}</button></form></Modal>}
  </section>
}
