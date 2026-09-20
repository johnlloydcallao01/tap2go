'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@encreasl/client-services'
import { ClientOnly } from '@/components/ClientOnly'
import { Package, ArrowLeft, Search, X, Plus, RefreshCw, AlertCircle, Eye, Pencil, Trash2, Store } from 'lucide-react'

type MerchantProduct = {
  merchantProductId: number
  merchantId: number
  product: { id: number; name: string; slug: string; sku: string | null; productType: string; basePrice: number | null; primaryImage: { id: number; url: string | null } | null } | null
  price_override: number | null
  stock_quantity: number | null
  is_active: boolean
  is_available: boolean
}

type MerchantGroup = {
  id: number
  outletName: string
  outletCode: string
  isActive: boolean
  isAcceptingOrders: boolean
  operationalStatus: string
  vendor: { id: number; businessName: string; legalName: string; businessType: string; verificationStatus: string; logo: { url: string | null; thumbUrl?: string | null } | null } | null
  media: { thumbnail: { url: string | null; thumbUrl?: string | null } | null }
  products: MerchantProduct[]
}

function fmtPHP(n: number | null){ if(n==null) return '—'; return `₱${Number(n).toLocaleString('en-PH',{minimumFractionDigits:2})}` }

function MerchantProductsSkeleton(){
  return <div className="space-y-6 py-5 px-2.5"><div className="h-8 w-32 bg-gray-200 dark:bg-[#262626] rounded animate-pulse" /><div className="h-64 bg-gray-100 dark:bg-[#171717] rounded-xl animate-pulse" /></div>
}

function MerchantProductsListPageContent(){
  const params=useParams()
  const router=useRouter()
  const queryClient=useQueryClient()
  const merchantId=params.merchantId as string
  const [merchant,setMerchant]=useState<MerchantGroup|null>(null)
  const [products,setProducts]=useState<MerchantProduct[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState<string|null>(null)
  const [q,setQ]=useState('')
  const [page,setPage]=useState(1)
  const limit=10
  const [deleting,setDeleting]=useState<{id:number;name:string}|null>(null)
  const [isDeleting,setIsDeleting]=useState(false)

  const load=useCallback(async ()=>{
    setLoading(true); setError(null)
    try{
      const res=await fetch(`/api/merchant-products?merchant=${merchantId}&limit=500`,{cache:'no-store'})
      const j=await res.json()
      const g=(j.merchants||[])[0]
      if(g){ setMerchant(g); setProducts(g.products||[]) }
      else setProducts([])
    }catch(e:any){ setError(e.message||'Failed') } finally{ setLoading(false) }
  },[merchantId])

  useEffect(()=>{void load()},[load])
  useEffect(()=>{ setPage(1) },[q])

  const filtered = products.filter(p=>{
    if(!q) return true
    const hay = `${p.product?.name||''} ${p.product?.slug||''} ${p.product?.sku||''}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
  const paged = filtered.slice((page-1)*limit, page*limit)

  const handleDelete=async()=>{
    if(!deleting||isDeleting) return
    setIsDeleting(true)
    try{
      const res=await fetch(`/api/merchant-products/${deleting.id}`,{method:'DELETE'})
      const j=await res.json().catch(()=>({}))
      if(!res.ok) throw new Error(j.error||'Failed')
      setDeleting(null)
      // Bust the /products aggregates so counts refresh when navigating back up
      // instead of waiting out the 3-min staleTime.
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminMerchantProducts().slice(0, 2) })
      await load()
    }catch(e:any){ alert(e.message||'Delete failed') }
    finally{ setIsDeleting(false) }
  }

  const handleBack = () => {
    if(typeof window!=='undefined' && window.history.length>1) router.back()
    else router.push('/products')
  }

  if(loading){
    return <div className="space-y-6 py-5 px-2.5"><div className="h-8 w-32 bg-gray-200 dark:bg-[#262626] rounded animate-pulse" /><div className="h-64 bg-gray-100 dark:bg-[#171717] rounded-xl animate-pulse" /></div>
  }
  if(error){
    return (
      <div className="space-y-6 py-5 px-2.5">
        <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-[#a1a1aa] hover:text-gray-900 dark:hover:text-white"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]">
          <div className="h-14 w-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4"><AlertCircle className="h-7 w-7 text-red-500" /></div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Failed to load products</h3><p className="text-sm text-gray-500 mt-1">{error}</p>
          <button onClick={()=>void load()} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#eba236] text-white rounded-lg text-sm font-medium"><RefreshCw className="w-4 h-4" /> Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-5 px-2.5">
      <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#a1a1aa] hover:text-gray-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to outlets
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#eba236] to-[#c88a20] text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
            {merchant?.media?.thumbnail?.url ? (
              <Image src={merchant.media.thumbnail.thumbUrl || merchant.media.thumbnail.url} alt={merchant.outletName} width={40} height={40} sizes="40px" className="h-10 w-10 object-cover" />
            ) : merchant?.vendor?.logo?.url ? (
              <Image src={merchant.vendor.logo.thumbUrl || merchant.vendor.logo.url} alt={merchant.vendor.businessName} width={40} height={40} sizes="40px" className="h-10 w-10 object-cover" />
            ) : (
              <Store className="w-5 h-5" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{merchant?.outletName || `Outlet #${merchantId}`}</h1>
            <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">{merchant?.outletCode || ''} • {merchant?.vendor?.businessName ? `Vendor: ${merchant.vendor.businessName}` : `Outlet #${merchantId}`} • {filtered.length} product{filtered.length!==1?'s':''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/products/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#eba236] hover:bg-[#c88a20] text-white rounded-xl text-sm font-semibold shadow-sm transition">
            <Plus className="w-4 h-4" /> Assign Product
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-3 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search product, SKU, slug…" className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eba236]/20 focus:border-[#eba236] text-gray-900 dark:text-white placeholder:text-gray-400" />
          {q && <button onClick={()=>setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-4 h-4 text-gray-400" /></button>}
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm overflow-hidden">
        {paged.length===0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-16 w-16 bg-gray-100 dark:bg-[#262626] rounded-2xl flex items-center justify-center mb-4"><Package className="w-8 h-8 text-gray-400" /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">No products for this outlet</h3>
            <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">Assign a product to this outlet to get started.</p>
            <Link href="/products/new" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#eba236] text-white rounded-lg text-sm font-semibold"><Plus className="w-4 h-4" /> Assign Product</Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#0a0a0a] text-xs text-gray-500 dark:text-[#a1a1aa] border-b border-gray-200 dark:border-[#262626]">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Product</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">SKU</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-right px-4 py-3 font-medium">Price</th>
                    <th className="text-right px-4 py-3 font-medium">Stock</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                  {paged.map(p=>(
                    <tr key={p.merchantProductId} className="hover:bg-gray-50 dark:hover:bg-[#262626] dark:hover:bg-[#0a0a0a]/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[180px]">
                          <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-[#262626] flex items-center justify-center overflow-hidden shrink-0">
                            {p.product?.primaryImage?.url ? <img src={p.product.primaryImage.url} alt={p.product.name} className="h-8 w-8 object-cover" /> : <Package className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{p.product?.name || '—'}</div>
                            <div className="text-xs text-gray-500 dark:text-[#a1a1aa] truncate">/{p.product?.slug || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell"><span className="font-mono text-xs bg-gray-100 dark:bg-[#262626] border border-gray-200 dark:border-[#333] px-2 py-0.5 rounded-full">{p.product?.sku || '—'}</span></td>
                      <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-[#a1a1aa] border-gray-200 dark:border-[#333]">{p.product?.productType || '—'}</span></td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{p.price_override != null ? fmtPHP(p.price_override) : p.product?.basePrice != null ? fmtPHP(p.product.basePrice) : '—'}</div>
                        {p.price_override != null && p.product?.basePrice != null && p.price_override !== p.product.basePrice && <div className="text-xs text-gray-400 line-through">{fmtPHP(p.product.basePrice)}</div>}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-[#a1a1aa]">{p.stock_quantity ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link href={`/products/${p.product?.id || p.merchantProductId}`} className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-[#262626] text-gray-500 hover:text-gray-900 dark:hover:text-white" title="View product"><Eye className="w-3.5 h-3.5" /></Link>
                          <Link href={`/products/${p.product?.id || p.merchantProductId}/edit`} className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 hover:text-blue-600" title="Edit"><Pencil className="w-3.5 h-3.5" /></Link>
                          <button onClick={()=>setDeleting({id:p.merchantProductId, name:p.product?.name || 'Merchant product'})} className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages>1 || filtered.length>10 ? (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="text-gray-600 dark:text-[#a1a1aa]">Page {page} of {totalPages} • {filtered.length} products</div>
                <div className="flex items-center gap-1">
                  <button disabled={loading || page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] disabled:opacity-50 text-sm">Prev</button>
                  {Array.from({length:Math.min(5,totalPages)}).map((_,i)=>{
                    const n=Math.max(1,Math.min(totalPages-4,page-2))+i; if(n>totalPages) return null
                    return <button key={n} onClick={()=>setPage(n)} className={`h-8 w-8 rounded-lg text-sm font-medium border ${n===page?'bg-[#eba236] text-white border-[#eba236]':'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#262626] text-gray-700 dark:text-white'}`}>{n}</button>
                  })}
                  <button disabled={loading || page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] disabled:opacity-50 text-sm">Next</button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {deleting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={()=>{ if(!isDeleting) setDeleting(null) }}>
          <div className="relative bg-white dark:bg-[#171717] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262626] w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>
            <h3 className="font-bold text-gray-900 dark:text-white">Remove product from outlet?</h3>
            <p className="text-sm text-gray-600 dark:text-[#a1a1aa] mt-1">This will remove <span className="font-semibold text-gray-900 dark:text-white">{deleting.name}</span> from this outlet. Master product remains.</p>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>setDeleting(null)} disabled={isDeleting} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] text-sm font-medium bg-white dark:bg-[#171717] disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                {isDeleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                {isDeleting ? 'Removing…' : 'Confirm remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MerchantProductsListPage(){
  return (
    <ClientOnly fallback={<MerchantProductsSkeleton />}>
      <MerchantProductsListPageContent />
    </ClientOnly>
  )
}