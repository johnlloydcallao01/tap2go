import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  getWishlistMerchantId,
  getWishlistMerchantIds,
  addMerchantToWishlist,
  removeMerchantFromWishlist,
  getWishlistDocs,
} from '../services/wishlist';
import type { AccountOverview } from '../services/account';
import { useCallback, useMemo } from 'react';

export function useWishlist(options?: { includeDocs?: boolean }) {
  // Home/list cards only need IDs for heart state; the 200-doc depth=3
  // payload is only required by the Wishlist screen itself.
  const includeDocs = options?.includeDocs ?? true;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const {
    data: queriedWishlistIds = [],
    isLoading: isLoadingIds,
    isRefetching: isRefetchingIds,
    refetch: refetchIds
  } = useQuery({
    queryKey: ['wishlist-ids', userId],
    queryFn: () => userId ? getWishlistMerchantIds(userId) : Promise.resolve([]),
    enabled: !!userId && !includeDocs,
  });

  const {
    data: wishlistDocs = [],
    isLoading: isLoadingDocs,
    isRefetching: isRefetchingDocs,
    isError: isErrorDocs,
    error: docsError,
    refetch: refetchDocs
  } = useQuery({
    queryKey: ['wishlist-docs', userId],
    queryFn: () => userId ? getWishlistDocs(userId) : Promise.resolve([]),
    enabled: !!userId && includeDocs,
  });

  const wishlistIds = useMemo(() => (
    includeDocs
      ? Array.from(new Set(wishlistDocs.map(getWishlistMerchantId).filter((id): id is string => !!id)))
      : queriedWishlistIds
  ), [includeDocs, wishlistDocs, queriedWishlistIds]);

  const refetch = useCallback(async () => {
    await (includeDocs ? refetchDocs() : refetchIds());
  }, [refetchIds, refetchDocs, includeDocs]);

  const addMutation = useMutation({
    mutationFn: (merchantId: string | number) => {
      if (!userId) throw new Error('User not logged in');
      return addMerchantToWishlist(userId, merchantId);
    },
    onMutate: async (merchantId) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['wishlist-ids', userId] });
      // Snapshot the previous value for rollback
      const previousIds = queryClient.getQueryData<string[]>(['wishlist-ids', userId]);
      // Optimistically add the merchant id to the cache immediately
      queryClient.setQueryData<string[]>(['wishlist-ids', userId], (old = []) => [
        ...old,
        String(merchantId),
      ]);
      return { previousIds };
    },
    onError: (_err, _merchantId, context) => {
      // Roll back to the snapshot on failure
      if (context?.previousIds !== undefined) {
        queryClient.setQueryData(['wishlist-ids', userId], context.previousIds);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-ids', userId] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-docs', userId] });
      if (result === 'added' && userId != null) {
        queryClient.setQueryData<AccountOverview>(
          ['account-overview', String(userId)],
          (overview) => overview
            ? {
                ...overview,
                stats: { ...overview.stats, favoriteCount: overview.stats.favoriteCount + 1 },
              }
            : overview,
        );
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: (merchantId: string | number) => {
      if (!userId) throw new Error('User not logged in');
      return removeMerchantFromWishlist(userId, merchantId);
    },
    onMutate: async (merchantId) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['wishlist-ids', userId] }),
        queryClient.cancelQueries({ queryKey: ['wishlist-docs', userId] }),
      ]);
      // Snapshot the previous value for rollback
      const previousIds = queryClient.getQueryData<string[]>(['wishlist-ids', userId]);
      const previousDocs = queryClient.getQueryData<Awaited<ReturnType<typeof getWishlistDocs>>>(['wishlist-docs', userId]);
      // Optimistically remove the merchant id from the cache immediately
      queryClient.setQueryData<string[]>(['wishlist-ids', userId], (old = []) =>
        old.filter((id) => id !== String(merchantId))
      );
      if (previousDocs !== undefined) {
        queryClient.setQueryData(['wishlist-docs', userId], previousDocs.filter(
          (doc) => getWishlistMerchantId(doc) !== String(merchantId)
        ));
      }
      return { previousIds, previousDocs };
    },
    onError: (_err, _merchantId, context) => {
      // Roll back to the snapshot on failure
      if (context?.previousIds !== undefined) {
        queryClient.setQueryData(['wishlist-ids', userId], context.previousIds);
      }
      if (context?.previousDocs !== undefined) {
        queryClient.setQueryData(['wishlist-docs', userId], context.previousDocs);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-ids', userId] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-docs', userId] });
      if (result === 'removed' && userId != null) {
        queryClient.setQueryData<AccountOverview>(
          ['account-overview', String(userId)],
          (overview) => overview
            ? {
                ...overview,
                stats: {
                  ...overview.stats,
                  favoriteCount: Math.max(0, overview.stats.favoriteCount - 1),
                },
              }
            : overview,
        );
      }
    },
  });

  const toggleWishlist = useCallback((merchantId: string | number) => {
    if (!userId) return; // TODO: Show login prompt if needed, handled by caller usually
    const idStr = String(merchantId);
    const isPresent = wishlistIds.includes(idStr);

    if (isPresent) {
      removeMutation.mutate(merchantId);
    } else {
      addMutation.mutate(merchantId);
    }
  }, [userId, wishlistIds, addMutation, removeMutation]);

  const isWishlisted = useCallback((merchantId: string | number) => {
    return wishlistIds.includes(String(merchantId));
  }, [wishlistIds]);

  return {
    wishlistIds,
    wishlistDocs,
    isLoading: includeDocs ? isLoadingDocs : isLoadingIds,
    isRefetching: includeDocs ? isRefetchingDocs : isRefetchingIds,
    isError: includeDocs ? isErrorDocs : false,
    error: includeDocs ? docsError : null,
    toggleWishlist,
    isWishlisted,
    isToggling: addMutation.isPending || removeMutation.isPending,
    refetch,
  };
}
