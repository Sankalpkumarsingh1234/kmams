export function calcPremium(base, nfi, seasonal, claimBonus) {
  const nfiAdd = Math.round((nfi / 100) * 12);
  const discount = claimBonus ? -Math.round(base * 0.12) : 0;
  return base + nfiAdd + seasonal + discount;
}