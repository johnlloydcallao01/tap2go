'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@encreasl/client-services'
import { useMerchantProducts } from '@/hooks/useMerchantProducts'
import {
  Package, Search, X, Plus, RefreshCw, AlertCircle,
  Store, ChevronRight, Layers, Tag, Building, ShieldCheck, CheckCircle
} from 'lucide-react'

const APPROVAL_STATUS_OPTS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'disapproved', label: 'Disapproved' },
] as const

function approvalBadge(status: string) {
  if (status === 'approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
  if (status === 'disapproved') return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
  return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
}

function initials(n: string){ return n.split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('')||'O' }

function KpiCard({ title, value, sub, icon, iconBg }: { title: string; value: string; sub?: string; icon: React.ReactNode; iconBg: string }){
  return (
    <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-[#a1a1aa] truncate">{title}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate">{value}</p>
          {sub && <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-1 truncate">{sub}</p>}
        </div>
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      </div>
    </div>
  )
}

export function ProductsSkeleton(){
  return (
    <div className="space-y-6 py-5 px-2.5">
      <div className="h-8 w-48 bg-gray-200 dark:bg-[#262626] rounded animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
        {Array.from({length:4}).map((_,i)=><div key={i} className="h-[86px] bg-gray-100 dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]" />)}
      </div>
      <div className="p-4 space-y-3 animate-pulse">{Array.from({length:6}).map((_,i)=><div key={i} className="h-16 bg-gray-100 dark:bg-[#0a0a0a] rounded-lg" />)}</div>
    </div>
  )
}

export function ProductsPageContent(){
  const router=useRouter()
  const searchParams=useSearchParams()
  const isAllView=searchParams.get('view')==='all'
  const [q,setQ]=useState('')
  const [debouncedQ,setDebouncedQ]=useState('')
  const [page,setPage]=useState(1)
  const [openApprovalProductId,setOpenApprovalProductId]=useState<number|null>(null)
  const [updatingApprovalProductId,setUpdatingApprovalProductId]=useState<number|null>(null)
  const limit=10

  useEffect(()=>{ const t=setTimeout(()=>setDebouncedQ(q.trim().toLowerCase()),400); return()=>clearTimeout(t)},[q])

  const qs=useMemo(()=>{
    const p=new URLSearchParams()
    p.set('page',String(page)); p.set('limit',String(limit))
    if(isAllView) p.set('view','all')
    if(debouncedQ) p.set('search',debouncedQ)
    return p.toString()
  },[page,limit,debouncedQ,isAllView])

  const queryClient=useQueryClient()
  const [hardRefreshing,setHardRefreshing]=useState(false)
  const { data, isPending, isFetching, isError, error: queryError, refetch } = useMerchantProducts(qs)

  const merchants=data?.merchants||[]
  const assignments=data?.docs||[]
  const pagination=data?.pagination||null
  const stats=data?.stats||null
  const allViewStats=data?.allViewStats||null

  const isInitialLoading=(isPending&&!data)||hardRefreshing
  const loading=isFetching||hardRefreshing
  const error=isError&&!data&&!hardRefreshing?(queryError instanceof Error?queryError.message:'Failed to load merchant products'):null

  const handleHardRefresh=()=>{
    if(hardRefreshing) return
    setHardRefreshing(true)
    void (async()=>{
      try{
        queryClient.removeQueries({ queryKey: QUERY_KEYS.adminMerchantProducts(qs) })
        await refetch({ cancelRefetch: true })
      }finally{ setHardRefreshing(false) }
    })()
  }

  const updateProductApprovalStatus=async(productId:number,currentStatus:string,nextStatus:string,productName:string)=>{
    if(updatingApprovalProductId!==null||currentStatus===nextStatus) return
    setUpdatingApprovalProductId(productId)
    try{
      const res=await fetch(`/api/products/${productId}`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({approvalStatus:nextStatus}),
      })
      const result=await res.json().catch(()=>({}))
      if(!res.ok) throw new Error(result.error||'Failed to update product approval status')
      setOpenApprovalProductId(null)
      await queryClient.invalidateQueries({queryKey:QUERY_KEYS.adminMerchantProducts().slice(0,2)})
      await refetch()
    }catch(cause){
      alert(cause instanceof Error?cause.message:`Failed to update approval status for ${productName}`)
    }finally{
      setUpdatingApprovalProductId(null)
    }
  }

  const avgPerOutlet = stats && stats.totalMerchants ? Math.round(stats.totalMerchantProducts / stats.totalMerchants) : 0
  const switchView=(nextView:'merchants'|'all')=>{
    setPage(1)
    router.push(nextView==='all'?'/products?view=all':'/products',{scroll:false})
  }

  return (
    <div className="space-y-6 py-5 px-2.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-[#eba236] text-white flex items-center justify-center"><Package className="w-4 h-4" /></span>
            Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">{isAllView?'Browse product assignments across all merchant outlets.':'Outlets → Merchant Products. Select an outlet to view its products.'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 dark:border-[#262626] dark:bg-[#171717]" role="group" aria-label="Product browsing scope">
            <button type="button" onClick={()=>switchView('merchants')} aria-pressed={!isAllView} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${!isAllView?'bg-[#eba236] text-white':'text-gray-600 hover:bg-gray-100 dark:text-[#a1a1aa] dark:hover:bg-[#262626]'}`}>Merchants</button>
            <button type="button" onClick={()=>switchView('all')} aria-pressed={isAllView} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${isAllView?'bg-[#eba236] text-white':'text-gray-600 hover:bg-gray-100 dark:text-[#a1a1aa] dark:hover:bg-[#262626]'}`}>All Merchants</button>
          </div>
          <button onClick={handleHardRefresh} disabled={loading} aria-label="Refresh" className="h-9 w-9 inline-flex items-center justify-center bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-xl hover:bg-gray-50 dark:hover:bg-[#262626] disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-[#a1a1aa] ${loading?'animate-spin':''}`} />
          </button>
          <Link href="/products/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#eba236] hover:bg-[#c88a20] text-white rounded-xl text-sm font-semibold shadow-sm transition">
            <Plus className="w-4 h-4" /> New Merchant Product
          </Link>
        </div>
      </div>

      {isAllView&&allViewStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <KpiCard title="Product assignments" value={String(allViewStats.totalAssignments)} sub="Across all merchant outlets" icon={<Layers className="w-5 h-5 text-white" />} iconBg="bg-blue-500" />
          <KpiCard title="Active assignments" value={String(allViewStats.activeAssignments)} sub="Active and available" icon={<Store className="w-5 h-5 text-white" />} iconBg="bg-emerald-500" />
          <KpiCard title="Filtered results" value={String(allViewStats.filteredAssignments)} sub="Matching current search" icon={<Search className="w-5 h-5 text-white" />} iconBg="bg-[#eba236]" />
        </div>
      ) : !isAllView&&stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard title="Outlets" value={String(stats.totalMerchants)} sub={`${stats.filteredMerchants} filtered`} icon={<Store className="w-5 h-5 text-white" />} iconBg="bg-emerald-500" />
          <KpiCard title="Active" value={String(stats.activeMerchants)} sub="isActive outlets" icon={<Building className="w-5 h-5 text-white" />} iconBg="bg-[#eba236]" />
          <KpiCard title="Merchant Products" value={String(stats.totalMerchantProducts)} sub="assigned outlet products" icon={<Layers className="w-5 h-5 text-white" />} iconBg="bg-blue-500" />
          <KpiCard title="Avg per Outlet" value={String(avgPerOutlet)} sub="products / outlet" icon={<Tag className="w-5 h-5 text-white" />} iconBg="bg-zinc-600" />
        </div>
      ) : isInitialLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
          {Array.from({length:4}).map((_,i)=><div key={i} className="h-[86px] bg-gray-100 dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]" />)}
        </div>
      ) : null}

      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e)=>{setQ(e.target.value); setPage(1)}} placeholder={isAllView?'Search product, SKU, merchant, vendor…':'Search outlet, code, product…'} className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eba236]/20 focus:border-[#eba236] text-gray-900 dark:text-white placeholder:text-gray-400" />
            {q && <button onClick={()=>setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-4 h-4 text-gray-400" /></button>}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-[#a1a1aa]">10 {isAllView?'products':'outlets'} / page</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm overflow-hidden">
        {error && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="h-14 w-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4"><AlertCircle className="h-7 w-7 text-red-500" /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Failed to load {isAllView?'products':'outlets'}</h3><p className="text-sm text-gray-500 mt-1 mb-4">{error}</p>
            <button onClick={handleHardRefresh} className="inline-flex items-center px-4 py-2 bg-[#eba236] text-white rounded-lg text-sm font-medium"><RefreshCw className="w-4 h-4 mr-2" />Retry</button>
          </div>
        )}
        {isInitialLoading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {Array.from({length:6}).map((_,i)=><div key={i} className="h-16 bg-gray-100 dark:bg-[#0a0a0a] rounded-lg" />)}
          </div>
        ) : !error && (isAllView?assignments.length===0:merchants.length===0) ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-16 w-16 bg-gray-100 dark:bg-[#262626] rounded-2xl flex items-center justify-center mb-4">{isAllView?<Package className="w-8 h-8 text-gray-400" />:<Store className="w-8 h-8 text-gray-400" />}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">No {isAllView?'products':'outlets'} found</h3>
            <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1 max-w-md">No {isAllView?'product assignments':'outlets'} match your search. Try adjusting your search.</p>
          </div>
        ) : !error && (
          <>
            {isAllView?(
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 dark:border-[#262626] dark:bg-[#0a0a0a] dark:text-[#a1a1aa]">
                    <tr><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Vendor</th><th className="px-4 py-3 font-medium">Merchant outlet</th><th className="px-4 py-3 text-right font-medium">Price</th><th className="px-4 py-3 text-right font-medium">Stock</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                    {assignments.map(row=>(
                      <tr key={row.merchantProductId} className="hover:bg-gray-50 dark:hover:bg-[#0a0a0a]/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {row.product?.primaryImage?.url?<Image src={row.product.primaryImage.thumbUrl||row.product.primaryImage.url} alt="" width={40} height={40} sizes="40px" className="h-10 w-10 rounded-lg object-cover" />:<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-[#262626]"><Package className="h-5 w-5" /></div>}
                            <div>
                              {row.product?<Link href={`/products/${row.product.id}`} className="font-semibold text-gray-900 hover:text-[#eba236] dark:text-white">{row.product.name}</Link>:<p className="font-semibold text-gray-900 dark:text-white">Product unavailable</p>}
                              <p className="text-xs text-gray-500">{row.product?.sku||`Product #${row.product?.id??'—'}`} · {row.product?.productType||'—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.vendor?.businessName||'—'}</td>
                        <td className="px-4 py-3">{row.merchant?<Link href={`/products/merchants/${row.merchant.id}`} className="font-medium text-gray-900 hover:text-[#eba236] dark:text-white">{row.merchant.outletName}<p className="text-xs text-gray-500">{row.merchant.outletCode||'—'}</p></Link>:'—'}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{(row.priceOverride??row.product?.basePrice)==null?'—':`₱${(row.priceOverride??row.product?.basePrice??0).toLocaleString('en-PH',{minimumFractionDigits:2})}`}</td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{row.stockQuantity??'—'}</td>
                        <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.isActive&&row.isAvailable?'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300':'bg-gray-100 text-gray-600 dark:bg-[#262626] dark:text-[#a1a1aa]'}`}>{row.isActive&&row.isAvailable?'Active':'Inactive'}</span><p className="mt-1 text-xs text-gray-500">Catalog: {row.product?.approvalStatus||'pending'}</p></td>
                        <td className="px-4 py-3 text-right">
                          {row.product?(
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={()=>setOpenApprovalProductId(current=>current===row.product!.id?null:row.product!.id)}
                                disabled={updatingApprovalProductId!==null}
                                aria-label={`Change ${row.product.name} approval status`}
                                aria-haspopup="menu"
                                aria-expanded={openApprovalProductId===row.product.id}
                                title={`Change approval status (${row.product.approvalStatus||'pending'})`}
                                className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border disabled:cursor-wait disabled:opacity-50 ${approvalBadge(row.product.approvalStatus||'pending')}`}
                              >
                                {updatingApprovalProductId===row.product.id
                                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                                  : <ShieldCheck className="h-4 w-4" />}
                              </button>
                              {openApprovalProductId===row.product.id&&(
                                <div role="menu" aria-label={`${row.product.name} approval status`} className="absolute right-0 top-full z-30 mt-1 min-w-36 rounded-lg border border-gray-200 bg-white p-1 text-left shadow-lg dark:border-[#333] dark:bg-[#171717]">
                                  {APPROVAL_STATUS_OPTS.map(option=>(
                                    <button
                                      key={option.value}
                                      type="button"
                                      role="menuitemradio"
                                      aria-checked={(row.product!.approvalStatus||'pending')===option.value}
                                      disabled={updatingApprovalProductId!==null||(row.product!.approvalStatus||'pending')===option.value}
                                      onClick={()=>void updateProductApprovalStatus(row.product!.id,row.product!.approvalStatus||'pending',option.value,row.product!.name)}
                                      className={`flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-xs font-medium hover:bg-gray-50 disabled:cursor-default disabled:opacity-60 dark:hover:bg-[#262626] ${
                                        option.value==='approved'
                                          ? 'text-emerald-700 dark:text-emerald-300'
                                          : option.value==='pending'
                                            ? 'text-amber-700 dark:text-amber-300'
                                            : 'text-red-700 dark:text-red-300'
                                      }`}
                                    >
                                      <span>{option.label}</span>
                                      {(row.product!.approvalStatus||'pending')===option.value&&<CheckCircle className="h-3.5 w-3.5" />}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ):<span className="text-xs text-gray-400">Unavailable</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ):<div className="divide-y divide-gray-100 dark:divide-[#262626]">
              {merchants.map(m=>(
                <Link key={m.id} href={`/products/merchants/${m.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#262626] dark:hover:bg-[#0a0a0a] transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#eba236] to-[#c88a20] text-white flex items-center justify-center font-bold shrink-0 overflow-hidden">
                      {m.vendor?.logo?.url ? <Image src={m.vendor.logo.thumbUrl || m.vendor.logo.url} alt={m.vendor.businessName || m.outletName} width={40} height={40} sizes="40px" loading="lazy" className="h-10 w-10 object-cover" /> : initials(m.vendor?.businessName || m.outletName)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{m.outletName}</div>
                      <div className="text-xs text-gray-500 dark:text-[#a1a1aa] truncate">{m.vendor?.businessName || '—'} • {m.vendor?.legalName || ''}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{m.outletCode} • {m.operationalStatus} • {m.isActive?'Active':'Inactive'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-[#a1a1aa] border border-gray-200 dark:border-[#333]"><Store className="w-3 h-3" />{m.isAcceptingOrders?'Accepting':'Closed'}</span>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eba236]/10 text-[#8a5f17] dark:text-[#eba236] border border-[#eba236]/20">{m.totalProducts} products</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>}
            {pagination && pagination.totalDocs>0 && !loading && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="text-gray-600 dark:text-[#a1a1aa]">Page {pagination.page} of {pagination.totalPages} • {pagination.totalDocs} {isAllView?'assignments':'outlets'} • 10 per page</div>
                <div className="flex items-center gap-1">
                  <button disabled={loading || !pagination.hasPrevPage} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] disabled:opacity-50 text-sm">Prev</button>
                  {Array.from({length:Math.min(5,pagination.totalPages)}).map((_,i)=>{
                    const n=Math.max(1,Math.min(pagination.totalPages-4,page-2))+i; if(n>pagination.totalPages) return null
                    return <button key={n} onClick={()=>setPage(n)} className={`h-8 w-8 rounded-lg text-sm font-medium border ${n===page?'bg-[#eba236] text-white border-[#eba236]':'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#262626] text-gray-700 dark:text-white'}`}>{n}</button>
                  })}
                  <button disabled={loading || !pagination.hasNextPage} onClick={()=>setPage(p=>Math.min(pagination.totalPages,p+1))} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] disabled:opacity-50 text-sm">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// NOTE: route entry moved to page.tsx (server wrapper prefetching default qs).
// ClientOnly gating lives there; content stays mount-gated via parents.