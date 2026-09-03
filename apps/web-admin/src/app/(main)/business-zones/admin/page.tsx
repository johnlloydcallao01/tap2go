'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Globe, MapPin, Store, Search, X, SlidersHorizontal, ChevronDown, Plus, RefreshCw, AlertCircle,
  Building, Clock, CheckCircle, Eye, Pencil, Trash2, Activity, Layers
} from '@/components/ui/IconWrapper'
import { BusinessZoneOverviewMap } from '../_components/ZoneMaps'
import { BusinessZoneFormModal } from '../_components/BusinessZoneFormModal'
import type { BusinessZoneDoc, MerchantZoneDoc, Pagination, Stats } from '../_components/types'
import { initials, fmtDate } from '../_components/types'

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

export default function AdminBusinessZonesPage(){
  const [q,setQ]=useState('')
  const [debouncedQ,setDebouncedQ]=useState('')
  const [isActiveFilter,setIsActiveFilter]=useState<boolean|null>(null)
  const [showFilters,setShowFilters]=useState(false)
  const [page,setPage]=useState(1)
  const limit=10
  const [sort,setSort]=useState('-createdAt')
  const [docs,setDocs]=useState<BusinessZoneDoc[]>([])
  const [pagination,setPagination]=useState<Pagination|null>(null)
  const [stats,setStats]=useState<Stats|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState<string|null>(null)
  const [deleting,setDeleting]=useState<BusinessZoneDoc|null>(null)
  const [editing,setEditing]=useState<BusinessZoneDoc|null>(null)
  const [showForm,setShowForm]=useState(false)
  const [formMode,setFormMode]=useState<'create'|'edit'>('create')
  const [mapZone,setMapZone]=useState<BusinessZoneDoc|null>(null)
  const [merchantZones,setMerchantZones]=useState<MerchantZoneDoc[]>([])
  const [overviewLoading,setOverviewLoading]=useState(false)

  useEffect(()=>{ const t=setTimeout(()=>setDebouncedQ(q.trim().toLowerCase()),400); return()=>clearTimeout(t)},[q])

  const buildQuery=useCallback(()=>{
    const p=new URLSearchParams()
    p.set('page',String(page)); p.set('limit',String(limit)); p.set('sort',sort)
    if(debouncedQ) p.set('search',debouncedQ)
    if(isActiveFilter!==null) p.set('isActive',String(isActiveFilter))
    return p.toString()
  },[page,limit,sort,debouncedQ,isActiveFilter])

  const load=useCallback(async (opts?:{hard?:boolean})=>{
    if(opts?.hard){ setPagination(null); setDocs([]) }
    setLoading(true); setError(null)
    try{
      const qs=buildQuery()
      const bust=`${qs}${qs?'&':''}_t=${Date.now()}`
      const res=await fetch(`/api/business-zones?${bust}`,{cache:'no-store'})
      if(!res.ok){ const t=await res.text(); try{const j=JSON.parse(t); throw new Error(j.error||'Failed')}catch{throw new Error(t||'Failed')} }
      const j=await res.json()
      setDocs(j.docs||[]); setPagination(j.pagination||null); setStats(j.stats||null)
    }catch(e:any){ setError(e.message||'Failed') } finally{ setLoading(false) }
  },[buildQuery])

  const loadOverview=useCallback(async()=>{
    setOverviewLoading(true)
    try{
      const res=await fetch(`/api/business-zones/overview`,{cache:'no-store'})
      if(!res.ok){ const t=await res.text(); throw new Error(t)}
      const j=await res.json()
      setMerchantZones(j.merchantZones||[])
      if(!stats) setStats(j.stats)
    }catch(e:any){ console.error(e)} finally{ setOverviewLoading(false)}
  },[stats])

  useEffect(()=>{void load()},[load])
  useEffect(()=>{void loadOverview()},[loadOverview])
  useEffect(()=>{setPage(1)},[debouncedQ,isActiveFilter,sort])
  useEffect(()=>{
    const isOpen=!!deleting || !!mapZone || showForm
    if(isOpen){ const prev=document.body.style.overflow; document.body.style.overflow='hidden'; return()=>{document.body.style.overflow=prev} }
    document.body.style.overflow=''; return()=>{document.body.style.overflow=''}
  },[deleting,mapZone,showForm])

  const handleDelete=async()=>{
    if(!deleting) return
    try{
      const res=await fetch(`/api/business-zones/${deleting.id}`,{method:'DELETE'})
      const j=await res.json().catch(()=>({}))
      if(!res.ok) throw new Error(j.error||'Failed to delete')
      setDeleting(null); await load(); await loadOverview()
    }catch(e:any){ alert(e.message||'Delete failed') }
  }

  const handleToggleActive=async(zone: BusinessZoneDoc)=>{
    try{
      const res=await fetch(`/api/business-zones/${zone.id}`,{method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ isActive: !zone.isActive, disabledReason: !zone.isActive ? null : zone.disabledReason || 'Disabled via toggle' })})
      if(!res.ok){ const j=await res.json().catch(()=>({})); throw new Error(j.error||'Failed')}
      await load(); await loadOverview()
    }catch(e:any){ alert(e.message)}
  }

  const openCreate=()=>{ setEditing(null); setFormMode('create'); setShowForm(true)}
  const openEdit=(z: BusinessZoneDoc)=>{ setEditing(z); setFormMode('edit'); setShowForm(true)}

  return (
    <div className="space-y-6 py-5 px-2.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-[#eba236] text-white flex items-center justify-center"><Globe className="w-4 h-4" /></span>
            Business Zones — Admin
            <span className="text-sm font-normal text-gray-500 dark:text-[#a1a1aa] hidden sm:inline">Platform polygons</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">Admin-drawn operational areas — draw the polygon on Google Maps, toggle kill-switch, and track merchant assignment.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>{void load({hard:true}); void loadOverview()}} disabled={loading||overviewLoading} aria-label="Refresh zones" className="h-9 w-9 inline-flex items-center justify-center bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-xl hover:bg-gray-50 dark:hover:bg-[#262626] disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-[#a1a1aa] ${loading||overviewLoading?'animate-spin':''}`} />
          </button>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#eba236] hover:bg-[#c88a20] text-white rounded-xl text-sm font-semibold shadow-sm transition">
            <Plus className="w-4 h-4" /> New Zone
          </button>
        </div>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard title="Total Zones" value={String(stats.totalZones)} sub={`${stats.activeZones} active • ${stats.inactiveZones} inactive`} icon={<Layers className="w-5 h-5 text-white" />} iconBg="bg-[#eba236]" />
          <KpiCard title="Active Zones" value={String(stats.activeZones)} sub={stats.inactiveZones>0 ? `${stats.inactiveZones} disabled (kill-switch)` : 'All operational'} icon={<Activity className="w-5 h-5 text-white" />} iconBg="bg-emerald-500" />
          <KpiCard title="Assigned Merchants" value={String(stats.assignedMerchants)} sub={`${stats.totalMerchants} total • ${stats.unassignedMerchants} unassigned`} icon={<Store className="w-5 h-5 text-white" />} iconBg="bg-blue-500" />
          <KpiCard title="Coverage" value={stats.totalMerchants? `${Math.round((stats.assignedMerchants/stats.totalMerchants)*100)}%` : '—'} sub={`${stats.unassignedMerchants} outlets need zone`} icon={<Building className="w-5 h-5 text-white" />} iconBg="bg-zinc-600" />
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
          {Array.from({length:4}).map((_,i)=><div key={i} className="h-[86px] bg-gray-100 dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]" />)}
        </div>
      ) : null}

      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Globe className="w-4 h-4 text-[#eba236]" /> Zone Map — Real Google Maps</h3>
          <span className="text-xs text-gray-500 dark:text-[#a1a1aa]">{docs.length} zones • {merchantZones.length} merchant zones • <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"/> active <span className="h-2 w-2 rounded-full bg-red-500 inline-block ml-2"/> disabled</span></span>
        </div>
        <BusinessZoneOverviewMap zones={docs} merchantZones={merchantZones} height={380} onZoneClick={(z)=>setMapZone(z as any)} />
        <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] max-h-[140px] overflow-auto">
          <div className="text-xs font-semibold text-gray-700 dark:text-[#a1a1aa] mb-2 flex items-center gap-2"><MapPin className="w-3 h-3"/> Business Zones (tap polygon on map to view)</div>
          <div className="space-y-2 text-xs">
            {docs.length===0 ? <p className="text-gray-500">No zones — create one and draw its boundary on the map in the form.</p> : docs.map(z=>(
              <div key={z.id} className="flex items-center justify-between p-2 bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-[#262626]">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">{z.name} <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${z.isActive?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-red-50 text-red-700 border-red-200'}`}>{z.isActive?'ACTIVE':'DISABLED'}</span></div>
                  <div className="text-[11px] text-gray-500 truncate">{z.slug} • {z.merchantCount||0} merchants • {z.boundary? (z.boundary as any).type || 'Polygon' :'No boundary'}</div>
                </div>
                <button onClick={()=>setMapZone(z)} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-[#171717] border text-xs">View</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search zone name, slug, description…" className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eba236]/20 focus:border-[#eba236] text-gray-900 dark:text-white placeholder:text-gray-400" />
            {q && <button onClick={()=>setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-4 h-4 text-gray-400" /></button>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#0a0a0a] rounded-full border border-gray-200 dark:border-[#262626]">
              <select value={sort} onChange={(e)=>setSort(e.target.value)} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-white">
                <option value="-createdAt">Newest</option>
                <option value="createdAt">Oldest</option>
                <option value="name">Name A–Z</option>
                <option value="-name">Name Z–A</option>
                <option value="displayOrder">Order</option>
              </select>
            </div>
            <span className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-[#a1a1aa]">10 / page</span>
            <button onClick={()=>setShowFilters(v=>!v)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border ${isActiveFilter!==null?'bg-[#eba236] hover:bg-[#c88a20] text-white border-[#eba236]':'bg-white dark:bg-[#171717] text-gray-700 dark:text-[#a1a1aa] border-gray-200 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626]'}`}>
              <SlidersHorizontal className="w-4 h-4" /> Filters {isActiveFilter!==null && <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-white text-[#eba236]">1</span>} <ChevronDown className={`w-4 h-4 transition ${showFilters?'rotate-180':''}`} />
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#262626] flex flex-wrap gap-2">
            <button onClick={()=>setIsActiveFilter(null)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${isActiveFilter===null?'bg-[#eba236] text-white border-[#eba236]':'bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-[#a1a1aa] border-gray-200 dark:border-[#262626]'}`}>All</button>
            <button onClick={()=>setIsActiveFilter(true)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${isActiveFilter===true?'bg-emerald-500 text-white border-emerald-500':'bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-[#a1a1aa] border-gray-200 dark:border-[#262626]'}`}>Active only</button>
            <button onClick={()=>setIsActiveFilter(false)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${isActiveFilter===false?'bg-red-500 text-white border-red-500':'bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-[#a1a1aa] border-gray-200 dark:border-[#262626]'}`}>Disabled only</button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm overflow-hidden">
        {error && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="h-14 w-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4"><AlertCircle className="h-7 w-7 text-red-500" /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Failed to load zones</h3><p className="text-sm text-gray-500 mt-1 mb-4">{error}</p>
            <button onClick={()=>void load({hard:true})} className="inline-flex items-center px-4 py-2 bg-[#eba236] text-white rounded-lg text-sm font-medium"><RefreshCw className="w-4 h-4 mr-2" />Retry</button>
          </div>
        )}
        {loading ? (
          <div className="p-4 space-y-3 animate-pulse">{Array.from({length:6}).map((_,i)=><div key={i} className="h-16 bg-gray-100 dark:bg-[#0a0a0a] rounded-lg" />)}</div>
        ) : !error && docs.length===0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-16 w-16 bg-[#eba236]/10 dark:bg-[#eba236]/15 rounded-2xl flex items-center justify-center mb-4"><Globe className="w-8 h-8 text-[#eba236]" /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">No zones yet</h3>
            <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1 max-w-md">Create your first Business Zone. Draw a boundary polygon on Google Maps to define where you operate — then assign merchant outlets to it.</p>
            <button onClick={openCreate} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#eba236] text-white rounded-lg text-sm font-semibold"><Plus className="w-4 h-4"/> New Zone</button>
          </div>
        ) : !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#0a0a0a] text-xs text-gray-500 dark:text-[#a1a1aa] border-b border-gray-200 dark:border-[#262626]">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Zone</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Boundary</th>
                    <th className="text-left px-4 py-3 font-medium">Merchants</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Timezone</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                  {docs.map(z=>(
                    <tr key={z.id} className="hover:bg-gray-50 dark:hover:bg-[#0a0a0a]/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#eba236] to-[#c88a20] text-white flex items-center justify-center text-xs font-bold shrink-0">{initials(z.name)}</div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">{z.name}</div>
                            <div className="text-xs text-gray-500 dark:text-[#a1a1aa] font-mono truncate max-w-[180px]">{z.slug} • order {z.displayOrder} • {fmtDate(z.createdAt)}</div>
                            {z.description && <div className="text-[11px] text-gray-400 truncate max-w-[200px]">{z.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {z.boundary ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300"><CheckCircle className="w-3 h-3"/> {(z.boundary as any).type || 'Polygon'}</span> : <span className="text-xs text-gray-400">No boundary</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300"><Store className="w-3 h-3"/>{z.merchantCount||0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border w-fit ${z.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300'}`}>
                            <Activity className="w-3 h-3"/>{z.isActive ? 'Active' : 'Disabled'}</span>
                          {!z.isActive && z.disabledReason && <span className="text-[11px] text-red-500 truncate max-w-[140px]">{z.disabledReason}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-gray-700 dark:text-[#a1a1aa] font-mono">{z.timezone}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button onClick={()=>setMapZone(z)} className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] text-gray-500 dark:text-[#a1a1aa]" title="Map"><Eye className="w-4 h-4"/></button>
                          <button onClick={()=>openEdit(z)} className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 hover:text-blue-600" title="Edit"><Pencil className="w-4 h-4"/></button>
                          <button onClick={()=>handleToggleActive(z)} className={`h-7 w-7 inline-flex items-center justify-center rounded-lg border ${z.isActive?'hover:bg-amber-50 text-amber-600 border-amber-200':'hover:bg-emerald-50 text-emerald-600 border-emerald-200'} `} title={z.isActive?'Disable zone':'Enable zone'}><Activity className="w-4 h-4"/></button>
                          <button onClick={()=>setDeleting(z)} className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && pagination.totalDocs>0 && !loading && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="text-gray-600 dark:text-[#a1a1aa]">Page {pagination.page} of {pagination.totalPages} • {pagination.totalDocs} zones • 10 per page</div>
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

      {deleting &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDeleting(null)}>
            <div className="relative bg-white dark:bg-[#171717] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262626] w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>
              <h3 className="font-bold text-gray-900 dark:text-white">Delete zone?</h3>
              <p className="text-sm text-gray-600 dark:text-[#a1a1aa] mt-1">Delete <span className="font-semibold text-gray-900 dark:text-white">{deleting.name}</span> ({deleting.slug})? Merchants must be unassigned first.</p>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setDeleting(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] text-sm font-medium bg-white dark:bg-[#171717]">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">Confirm delete</button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {mapZone &&
        createPortal(
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={()=>setMapZone(null)}>
            <div className="relative bg-white dark:bg-[#171717] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262626] w-full max-w-2xl max-h-[80vh] overflow-auto p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Globe className="w-5 h-5 text-[#eba236]"/> {mapZone.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{mapZone.slug} • {mapZone.timezone} • {mapZone.isActive?'Active':'Disabled'}</p>
                </div>
                <button onClick={()=>setMapZone(null)} className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626] flex items-center justify-center"><X className="w-4 h-4"/></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-[#262626]">
                  <BusinessZoneOverviewMap zones={[mapZone]} merchantZones={[]} height={220} />
                </div>
                <div><span className="font-semibold">Boundary (GeoJSON):</span><pre className="mt-1 p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border overflow-auto text-xs max-h-[140px]">{mapZone.boundary ? JSON.stringify(mapZone.boundary, null, 2) : 'No boundary — draw a Polygon on Google Maps in the form.'}</pre></div>
                <div className="text-xs text-gray-500">Merchants in zone: <span className="font-semibold text-gray-900 dark:text-white">{mapZone.merchantCount||0}</span> • Kill-switch: {mapZone.isActive ? 'ON (visible)' : `OFF — ${mapZone.disabledReason||'disabled'}`}</div>
                <div className="flex gap-2">
                  <button onClick={()=>{setMapZone(null); openEdit(mapZone)}} className="px-3 py-2 rounded-lg bg-[#eba236] text-white text-xs font-semibold">Edit boundary</button>
                  <button onClick={()=>setMapZone(null)} className="px-3 py-2 rounded-lg border text-xs">Close</button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {showForm &&
        createPortal(
          <BusinessZoneFormModal
            mode={formMode}
            initial={editing}
            onClose={()=>setShowForm(false)}
            onSuccess={async()=>{ setShowForm(false); await load(); await loadOverview()}}
          />,
          document.body
        )}
    </div>
  )
}
