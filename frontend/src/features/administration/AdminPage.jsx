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

export function AdminPage() {
  const { data, loading, error, refresh } = useAsyncResource(async () => { const [dashboard, items, users] = await Promise.all([api.get('/admin/dashboard'), api.get('/admin/items'), api.get('/admin/users')]); return { dashboard: dashboard.data, items: items.data, users: users.data } }, [])
  if (loading) return <LoadingState/>; if (error) return <section className="page wrap"><ErrorState message={error} onRetry={refresh}/></section>
  const stats = data.dashboard
  return <section className="page wrap"><PageHeader eyebrow="Operación y confianza" title="Panel administrativo" description="Métricas y actividad consultadas directamente desde la base de datos."/>
    <div className="admin-stats"><Stat icon={<UsersRound/>} label="Usuarios" value={stats.users}/><Stat icon={<Search/>} label="Objetos perdidos" value={stats.lost}/><Stat icon={<PackageCheck/>} label="Objetos encontrados" value={stats.found}/><Stat icon={<CircleCheck/>} label="Casos resueltos" value={stats.resolved}/><Stat icon={<Clock3/>} label="Reclamaciones pendientes" value={stats.pendingClaims}/></div>
<div className="admin-panels"><section><h2>Actividad reciente</h2>{data.items.slice(0, 8).map((item) => <div className="admin-item" key={item.id}><img loading="lazy" decoding="async" src={assetUrl(imageFor(item))} alt={item.title}/><div><b>{item.title}</b><span>{item.publisherName} · {item.location}</span></div><TypeBadge type={item.reportType}/><Link to={`/items/${item.id}`}>Revisar</Link></div>)}</section><aside><h2>Comunidad</h2><div className="admin-users">{data.users.slice(0, 8).map((member) => <div key={member.id}><span>{member.firstName[0]}{member.lastName[0]}</span><div><b>{member.firstName} {member.lastName}</b><small>{member.email}</small></div><i className={member.isActive ? 'active' : ''}/></div>)}</div></aside></div>
  </section>
}

function Stat({ icon, label, value }) { return <div><span>{icon}</span><p>{label}</p><b>{value}</b><small>Dato actualizado</small></div> }
