export const formatNairaPrice = (naira: number) => {
  return naira.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  });
};
