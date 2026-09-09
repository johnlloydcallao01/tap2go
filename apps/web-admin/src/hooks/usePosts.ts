'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@encreasl/client-services';
import type { Post } from '@encreasl/cms-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';

export type PostsResponse = {
  docs: Post[];
  totalPages: number;
  totalDocs: number;
};

async function fetchPosts(qs: string, signal?: AbortSignal): Promise<PostsResponse> {
  const res = await fetch(`${API_BASE_URL}/posts?${qs}`, { credentials: 'include', signal });
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      throw new Error(j.error || 'Failed to load posts');
    } catch {
      throw new Error(text || 'Failed to load posts');
    }
  }
  return res.json() as Promise<PostsResponse>;
}

/**
 * Blog posts list query (raw Payload REST) — 3-min instant-back.
 * Query key encodes page, limit, sort, and Payload where-filters.
 */
export function usePosts(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminPosts(qs),
    queryFn: ({ signal }) => fetchPosts(qs, signal),
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}