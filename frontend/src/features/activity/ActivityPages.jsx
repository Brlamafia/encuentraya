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

export function NotificationsPage() {
  const { notices, markRead } = useNotices()
  return <section className="page medium"><PageHeader eyebrow="Centro de actividad" title="Notificaciones" description="Coincidencias, reclamaciones y cambios guardados en tu cuenta."/>
    {notices.length ? <div className="notice-list">{notices.map((notice) => <button key={notice.id} className={notice.isRead ? 'read' : ''} onClick={() => markRead(notice.id)}><span className={`notice-icon ${notice.type}`}><Bell/></span><div><b>{notice.title}</b><p>{notice.message}</p><small>{timeAgo(notice.createdAt)}</small></div>{!notice.isRead && <i/>}</button>)}</div> : <EmptyState title="Todo está al día" message="No tienes notificaciones todavía."/>}
  </section>
}

export function MessagesPage() {
  const { id } = useParams(); const navigate = useNavigate(); const { user } = useAuth(); const { notify } = useNotices(); const [active, setActive] = useState(null); const [loadingChat, setLoadingChat] = useState(false)
  const { data: conversations = [], loading, error, refresh } = useAsyncResource(async () => (await api.get('/conversations')).data, [])
  useEffect(() => {
    if (!id) { setActive(null); return }
    setLoadingChat(true); api.get(`/conversations/${id}`).then(({ data }) => setActive(data)).catch((requestError) => notify(apiError(requestError), 'error')).finally(() => setLoadingChat(false))
  }, [id])
  const send = async (event) => { event.preventDefault(); const input = event.currentTarget.elements.message; const content = input.value.trim(); if (!content || !id) return; input.value = ''; try { const { data } = await api.post(`/conversations/${id}/messages`, { content }); setActive((current) => ({ ...current, messages: [...current.messages, data] })); refresh() } catch (requestError) { notify(apiError(requestError), 'error') } }
  return <section className="page wrap"><PageHeader eyebrow="Mensajería contextual" title="Conversaciones" description="Los mensajes se guardan en PostgreSQL y permanecen vinculados a cada reporte."/>
{loading ? <LoadingState/> : error ? <ErrorState message={error} onRetry={refresh}/> : conversations?.length ? <div className="messages-layout"><aside><h3>Conversaciones</h3>{conversations.map((conversation) => <Link className={`conversation ${id === conversation.id ? 'active' : ''}`} key={conversation.id} to={`/messages/${conversation.id}`}><img loading="lazy" decoding="async" src={assetUrl(conversation.itemImageUrl || categoryImages.Other)} alt="Objeto del caso"/><div><b>{conversation.otherUserName}</b><span>{conversation.itemTitle}</span><small>{conversation.lastMessage || 'Inicia la conversación'}</small></div><time>{timeAgo(conversation.lastMessageAt || conversation.createdAt)}</time></Link>)}</aside>
      {loadingChat ? <LoadingState/> : active ? <section className="chat"><header><div><b>{active.otherUserName}</b><span>Sobre: {active.itemTitle}</span></div><span className="online-dot">Caso activo</span></header><div className="chat-body"><div className="chat-safety"><ShieldCheck/>No compartas contraseñas ni información financiera.</div>{active.messages.map((message) => <div key={message.id} className={`bubble ${message.senderId === user.id ? 'mine' : ''}`}><b>{message.senderId === user.id ? 'Tú' : message.senderName}</b><p>{message.content}</p><small>{timeAgo(message.createdAt)}</small></div>)}</div><form onSubmit={send}><input name="message" maxLength="2000" placeholder="Escribe un mensaje..." aria-label="Mensaje"/><button aria-label="Enviar"><Send/></button></form></section> : <div className="chat-placeholder"><MessageCircle/><h3>Selecciona una conversación</h3><p>Tu historial aparecerá aquí y seguirá disponible al volver.</p></div>}
    </div> : <EmptyState title="Aún no hay conversaciones" message="Contacta al publicador desde el detalle de un objeto o espera la aprobación de una reclamación." action="Explorar objetos" to="/explore"/>}
  </section>
}
