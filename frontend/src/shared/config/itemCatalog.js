export const categories = ['Phone', 'Wallet', 'Backpack', 'Keys', 'Documents', 'Headphones', 'Electronics', 'Clothing', 'Accessories', 'Other']

export const categoryNames = {
  Phone: 'Celulares', Wallet: 'Carteras', Backpack: 'Mochilas', Keys: 'Llaves', Documents: 'Documentos',
  Headphones: 'Audífonos', Electronics: 'Electrónica', Clothing: 'Ropa', Accessories: 'Accesorios', Other: 'Otros'
}

export const categoryImages = {
  Phone: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=88',
  Wallet: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=88',
  Backpack: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=88',
  Keys: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=88',
  Documents: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=88',
  Headphones: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=1200&q=88',
  Electronics: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=1200&q=88',
  Clothing: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=88',
  Accessories: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=88',
  Other: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=88'
}

export const imageFor = (item) => item?.imageUrl || categoryImages[item?.category] || categoryImages.Other

export const formatDate = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  value ? new Date(value).toLocaleDateString('es-DO', options) : 'Sin fecha'

export const timeAgo = (value) => {
  if (!value) return ''
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000))
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)} h`
  return formatDate(value)
}
