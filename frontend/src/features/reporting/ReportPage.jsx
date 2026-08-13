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

export function ReportPage() {
  const navigate = useNavigate(); const { notify } = useNotices(); const [params] = useSearchParams(); const [type, setType] = useState(params.get('type') || 'Lost'); const [preview, setPreview] = useState(null); const [file, setFile] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const chooseImage = (event) => { const selected = event.target.files?.[0]; if (!selected) return; if (selected.size > 5_000_000) { setError('La imagen no puede superar 5 MB.'); return } setFile(selected); setPreview(URL.createObjectURL(selected)); setError('') }
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); const fields = new FormData(event.currentTarget)
    const date = fields.get('eventDate'); const time = fields.get('eventTime') || '12:00';
    try {
      const { data: created } = await api.post('/items', { title: fields.get('title'), category: fields.get('category'), description: fields.get('description'), location: fields.get('location'), eventDate: new Date(`${date}T${time}:00`).toISOString(), reportType: type, privateVerificationDetail: type === 'Found' ? fields.get('verification') : null })
      if (file) { const upload = new FormData(); upload.append('file', file); await api.post(`/items/${created.id}/image`, upload) }
      notify('Reporte publicado y guardado correctamente.'); navigate(`/items/${created.id}`)
    } catch (requestError) { setError(apiError(requestError, 'No pudimos guardar el reporte.')) } finally { setBusy(false) }
  }
  return <section className="page narrow"><PageHeader eyebrow="Nuevo caso" title={type === 'Lost' ? 'Reportar un objeto perdido' : 'Registrar un objeto encontrado'} description="La información se guardará en tu cuenta y aparecerá inmediatamente en Explorar."/>
    <form className="report-form" onSubmit={submit}>{error && <div className="form-error">{error}</div>}
      <fieldset className="type-choice"><legend>Tipo de reporte</legend><button type="button" className={type === 'Lost' ? 'active' : ''} onClick={() => setType('Lost')}><Search/><span><b>Lo perdí</b><small>Quiero encontrarlo</small></span></button><button type="button" className={type === 'Found' ? 'active found' : ''} onClick={() => setType('Found')}><PackageCheck/><span><b>Lo encontré</b><small>Quiero devolverlo</small></span></button></fieldset>
      <div className="form-section"><div className="form-section-title"><span>01</span><div><h2>Información esencial</h2><p>Ayuda a reconocer el objeto sin revelar detalles sensibles.</p></div></div><FormField label="Título"><input name="title" required minLength="4" maxLength="140" placeholder="Ej. Audífonos inalámbricos negros"/></FormField><div className="two-cols"><FormField label="Categoría"><select name="category" required defaultValue=""><option value="" disabled>Seleccionar</option>{categories.map((category) => <option key={category} value={category}>{categoryNames[category]}</option>)}</select></FormField><FormField label="Fecha aproximada"><input name="eventDate" required type="date" max={new Date().toISOString().slice(0, 10)}/></FormField></div><FormField label="Descripción"><textarea name="description" required minLength="10" placeholder="Marca, color, tamaño y características visibles..."/></FormField><div className="two-cols"><FormField label="Ubicación"><input name="location" required placeholder="Ej. Edificio 4 · Laboratorio 2"/></FormField><FormField label="Hora aproximada"><input name="eventTime" type="time"/></FormField></div></div>
      <div className="form-section"><div className="form-section-title"><span>02</span><div><h2>Fotografía</h2><p>Una imagen clara acelera el reconocimiento.</p></div></div><label className="image-upload"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage}/>{preview ? <img src={preview} alt="Vista previa del objeto"/> : <><ImagePlus/><b>Selecciona una fotografía</b><span>JPG, PNG o WebP · máximo 5 MB</span></>}</label></div>
      {type === 'Found' && <div className="form-section private-section"><div className="form-section-title"><span><ShieldCheck/></span><div><h2>Verificación privada</h2><p>Esta pregunta nunca se muestra en la tarjeta pública.</p></div></div><FormField label="Pregunta de verificación"><input name="verification" required placeholder="Ej. ¿Qué texto tiene el llavero?"/></FormField></div>}
      <label className="check-line"><input required type="checkbox"/>Confirmo que la información es correcta y no expone documentos o datos personales.</label><button disabled={busy} className="button primary large full"><Upload/>{busy ? 'Guardando reporte...' : 'Publicar y guardar'}</button>
    </form>
  </section>
}
