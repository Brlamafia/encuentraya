import { useCallback, useEffect, useState } from 'react'

export function useAsyncResource(loader, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const run = useCallback(async () => {
    setLoading(true); setError('')
    try { setData(await loader()) }
    catch (requestError) { setError(requestError?.response?.data?.message || requestError.message || 'No fue posible cargar la información.') }
    finally { setLoading(false) }
  }, dependencies)
  useEffect(() => { run() }, [run])
  return { data, setData, loading, error, refresh: run }
}
