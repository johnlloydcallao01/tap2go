"use client";

import React from "react";
import Image from "@/components/ui/ImageWrapper";
import SearchField from "@/components/ui/SearchField";
import MerchantProductCategoriesCarousel from "@/components/merchant/MerchantProductCategoriesCarousel";

type ProductCardItem = {
  id: string | number;
  name: string;
  productType: string;
  basePrice: number | null;
  compareAtPrice: number | null;
  shortDescription: string | null;
  imageUrl: string | null;
  categoryIds?: number[];
};

type MerchantCategoryDisplay = {
  id: number;
  name: string;
  slug: string;
  media?: { icon?: any | null };
};

export default function MerchantProductGrid({ products, categories }: { products: ProductCardItem[]; categories?: MerchantCategoryDisplay[] }) {
  const [query, setQuery] = React.useState("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(null);
  const sectionRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const sentinelRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const [visibleCounts, setVisibleCounts] = React.useState<Record<number, number>>({});
  const handleAddToCart = React.useCallback((p: ProductCardItem) => {
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:add", { detail: { id: p.id, name: p.name, price: p.basePrice } }));
      }
      console.log("Add to cart", p.id);
    } catch {}
  }, []);

  const formatPrice = (value: number | null) => {
    if (value == null) return null;
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(Number(value));
  };

  const filteredProducts = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const n = (p.name || "").toLowerCase();
      const d = (p.shortDescription || "").toLowerCase();
      return !q || n.includes(q) || d.includes(q);
    });
  }, [products, query]);

  const categoryMap = React.useMemo(() => {
    const m = new Map<number, MerchantCategoryDisplay>();
    (categories || []).forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const groups = React.useMemo(() => {
    const orderedIds = Array.isArray(categories) ? categories.map((c) => c.id) : [];
    const result: { id: number; name: string; items: ProductCardItem[] }[] = [];
    orderedIds.forEach((cid) => {
      const items = cid === 0 ? filteredProducts : filteredProducts.filter((p) => (p.categoryIds || []).includes(cid));
      const name = cid === 0 ? "All" : categoryMap.get(cid)?.name || "Category";
      result.push({ id: cid, name, items });
    });
    const others = filteredProducts.filter((p) => !p.categoryIds || p.categoryIds.length === 0);
    if (others.length > 0 && orderedIds.length === 0) {
      result.push({ id: -1, name: "Items", items: others });
    }
    return result;
  }, [filteredProducts, categories, categoryMap]);

  React.useEffect(() => {
    setVisibleCounts((prev) => {
      const next: Record<number, number> = { ...prev };
      groups.forEach((g) => {
        if (g.id === -1) return;
        const current = next[g.id];
        if (current == null) {
          next[g.id] = Math.min(12, g.items.length);
        } else {
          next[g.id] = Math.min(current, g.items.length);
        }
      });
      return next;
    });
  }, [groups]);

  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];
    groups.forEach((g) => {
      if (g.id === -1) return;
      const sentinel = sentinelRefs.current.get(g.id);
      if (!sentinel) return;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisibleCounts((prev) => {
              const current = prev[g.id] ?? 12;
              const next = Math.min(current + 12, g.items.length);
              if (next === current) return prev;
              return { ...prev, [g.id]: next };
            });
          }
        });
      }, { root: null, threshold: 1, rootMargin: "200px 0px 200px 0px" });
      obs.observe(sentinel);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [groups]);

  React.useEffect(() => {
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
    const offset = isDesktop ? 105 : 45;
    const io = new IntersectionObserver((entries) => {
      let candidate: number | null = selectedCategoryId;
      let best = Infinity;
      entries.forEach((e) => {
        const el = e.target as HTMLDivElement;
        const attr = el.getAttribute("data-category-id");
        const id = attr ? Number(attr) : null;
        const top = e.boundingClientRect.top;
        const delta = Math.abs(top - offset);
        if (e.isIntersecting && id != null && delta < best) {
          best = delta;
          candidate = id;
        }
      });
      if (candidate != null && candidate !== selectedCategoryId) {
        setSelectedCategoryId(candidate);
      }
    }, { root: null, threshold: [0, 0.5, 1], rootMargin: `-${offset}px 0px -60% 0px` });
    groups.forEach((g) => {
      if (g.id === -1) return;
      const el = sectionRefs.current.get(g.id);
      if (el) {
        el.setAttribute("data-category-id", String(g.id));
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, [groups, selectedCategoryId]);

  const scrollToCategory = (id: number) => {
    setSelectedCategoryId(id);
    const el = sectionRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      <div className="mb-4 px-2.5">
        <SearchField placeholder="Search menu" value={query} onChange={setQuery} />
      </div>

      {Array.isArray(categories) && categories.length > 0 && (
        <div className="mb-4 px-2.5 sticky top-[45px] lg:top-[105px] z-40 bg-white">
          <MerchantProductCategoriesCarousel
            categories={categories}
            activeCategoryId={selectedCategoryId}
            onSelect={(id) => scrollToCategory(id)}
          />
        </div>
      )}

      {groups.length > 0 ? (
        <div className="px-2.5 scroll-smooth">
          {groups.map((g, idx) => {
            const visible = g.id === -1 ? g.items.length : (visibleCounts[g.id] ?? 12);
            const slice = g.items.slice(0, visible);
            return (
              <section key={g.id} ref={(el) => { if (el) sectionRefs.current.set(g.id, el); }} className="scroll-mt-[100px]">
                <h3 className={`text-base md:text-lg font-semibold text-gray-900 mb-3 ${idx === 0 ? '' : 'pt-5'}`}>{g.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-x-4 gap-y-6">
                  {slice.map((p) => (
                    <div key={p.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="relative aspect-square bg-gray-100">
                        {p.imageUrl ? (
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">No image</div>
                        )}
                        <button
                          type="button"
                          aria-label="Add to cart"
                          onClick={() => handleAddToCart(p)}
                          className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <i className="fas fa-plus text-[12px]" style={{ color: "#333" }} />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{p.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          {p.productType === "simple" ? (
                            <>
                              {formatPrice(p.basePrice) && (
                                <span className="text-base font-bold text-gray-900">{formatPrice(p.basePrice)}</span>
                              )}
                              {formatPrice(p.compareAtPrice) && (p.compareAtPrice as number) > (p.basePrice ?? 0) && (
                                <span className="text-sm text-gray-500 line-through">{formatPrice(p.compareAtPrice)}</span>
                              )}
                            </>
                          ) : p.productType === "variable" ? (
                            <span className="text-sm font-medium text-[#eba236]">Show Variations</span>
                          ) : p.productType === "grouped" ? (
                            <span className="text-sm font-medium text-[#eba236]">Show Grouped Items</span>
                          ) : null}
                        </div>
                        {p.shortDescription && (
                          <p className="mt-2 text-xs text-gray-600 line-clamp-3">{p.shortDescription}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={(el) => { if (el) sentinelRefs.current.set(g.id, el); }} />
              </section>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500">No products available</div>
      )}
    </div>
  );
}
