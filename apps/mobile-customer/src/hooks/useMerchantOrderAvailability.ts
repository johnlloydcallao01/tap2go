import { useQuery } from '@tanstack/react-query';
import { getMerchantByIdClient } from '@encreasl/client-services';
import { getMerchantOrderUnavailableMessage, isMerchantVacationActive } from '../utils/merchantAvailability';

export function useMerchantOrderAvailability(merchantId: string | number | null | undefined) {
  const normalizedId = merchantId == null ? '' : String(merchantId);
  const query = useQuery({
    queryKey: ['merchant-order-availability', normalizedId],
    queryFn: ({ signal }) => getMerchantByIdClient(normalizedId, signal, true),
    enabled: normalizedId.length > 0,
    staleTime: 10_000,
    refetchOnMount: 'always',
  });
  const merchant = query.data ?? null;
  const unavailableMessage = getMerchantOrderUnavailableMessage(merchant);

  return {
    ...query,
    merchant,
    isOnVacation: isMerchantVacationActive(merchant),
    unavailableMessage: merchant
      ? unavailableMessage
      : query.isError
        ? 'Could not verify this merchant’s availability. Refresh and try again.'
        : 'Checking merchant availability…',
    isUnavailable: query.isLoading || !merchant || unavailableMessage !== null,
  };
}