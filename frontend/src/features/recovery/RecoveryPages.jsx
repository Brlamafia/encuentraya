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

export function MatchesPage() {
  const { notify } = useNotices(); const { data: matches = [], loading, error, refresh } = useAsyncResource(async () => (await api.get('/matches/mine')).data, [])
  const dismiss = async (id) => { try { await api.patch(`/matches/${id}/dismiss`); notify('Coincidencia descartada.'); refresh() } catch (requestError) { notify(apiError(requestError), 'error') } }
  return <section className="page wrap"><PageHeader eyebrow="Cruce inteligente" title="Posibles coincidencias" description="Resultados almacenados que relacionan tus reportes con hallazgos de la comunidad."/>
{loading ? <LoadingState/> : error ? <ErrorState message={error} onRetry={refresh}/> : matches?.length ? <div className="matches-stack">{matches.map((match) => <div className="match-card" key={match.id}><div className="match-score"><Sparkles/><b>{match.matchScore}%</b><span>coincidencia</span></div><div className="match-columns"><div><small>Objeto perdido</small><img loading="lazy" decoding="async" src={assetUrl(imageFor(match.lost))} alt={match.lost.title}/><h3>{match.lost.title}</h3><p><MapPin/>{match.lost.location}</p></div><span className="vs">VS</span><div><small>Objeto encontrado</small><img loading="lazy" decoding="async" src={assetUrl(imageFor(match.found))} alt={match.found.title}/><h3>{match.found.title}</h3><p><MapPin/>{match.found.location}</p></div></div><div className="score-breakdown"><span><b>Categoría</b><em>35 pts</em></span><span><b>Palabras</b><em>30 pts</em></span><span><b>Ubicación</b><em>20 pts</em></span><span><b>Fecha</b><em>15 pts</em></span></div><div className="match-actions"><Link className="button outline" to={`/items/${match.found.id}`}><Eye/>Revisar</Link><button className="button ghost" onClick={() => dismiss(match.id)}><X/>Descartar</button><Link className="button primary" to={`/items/${match.found.id}`}><PackageCheck/>Reclamar</Link></div></div>)}</div> : <EmptyState title="Aún no hay coincidencias" message="Cuando publiques un reporte, compararemos automáticamente la información." action="Publicar reporte" to="/report"/>}
  </section>
}

export function ClaimsPage() {
  const { notify } = useNotices(); const { data: claims = [], loading, error, refresh } = useAsyncResource(async () => (await api.get('/claims')).data, [])
  const decide = async (id, action) => { try { await api.patch(`/claims/${id}/${action}`); notify(action === 'approve' ? 'Reclamación aprobada; la conversación ya está disponible.' : 'Reclamación rechazada.'); refresh() } catch (requestError) { notify(apiError(requestError), 'error') } }
  return <section className="page wrap"><PageHeader eyebrow="Trazabilidad" title="Reclamaciones" description="Solicitudes enviadas y recibidas, consultadas directamente desde tu historial."/>
{loading ? <LoadingState/> : error ? <ErrorState message={error} onRetry={refresh}/> : claims?.length ? <div className="claims-grid">{claims.map((claim) => <article className="claim-card" key={claim.id}><img loading="lazy" decoding="async" src={assetUrl(claim.itemImageUrl || categoryImages.Other)} alt={claim.itemTitle}/><div className="claim-main"><div><span>{claim.canManage ? 'Recibida de' : 'Solicitud sobre'} {claim.canManage && <b>{claim.claimantName}</b>}</span><StatusBadge status={claim.status}/></div><h3>{claim.itemTitle}</h3><p>{claim.message}</p>{claim.canManage && <div className="verification-answer"><ShieldCheck/><span><small>Respuesta privada</small><b>{claim.verificationAnswer}</b></span></div>}<time>{formatDate(claim.createdAt)}</time></div><div className="claim-actions">{claim.canManage && claim.status === 'Pending' ? <><button className="button primary" onClick={() => decide(claim.id, 'approve')}><Check/>Aprobar</button><button className="button ghost" onClick={() => decide(claim.id, 'reject')}><X/>Rechazar</button></> : claim.status === 'Approved' ? <Link className="button outline" to="/messages"><MessageCircle/>Ir a mensajes</Link> : <Link className="button ghost" to={`/items/${claim.itemReportId}`}>Ver reporte</Link>}</div></article>)}</div> : <EmptyState title="No tienes reclamaciones" message="Las solicitudes que envíes o recibas aparecerán aquí."/>}
  </section>
}
