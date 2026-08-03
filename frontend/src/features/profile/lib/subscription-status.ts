import type { SubscriptionItem } from '../api/profile-api'

export type SubscriptionStatus = 'active' | 'expiring' | 'expired'

/** Style guide §6 "Профиль": expiring soon = paid through within a week. */
const EXPIRING_SOON_DAYS = 7

export function getSubscriptionStatus(subscription: SubscriptionItem): SubscriptionStatus {
  if (!subscription.active) return 'expired'

  const msPerDay = 1000 * 60 * 60 * 24
  const daysLeft = (new Date(subscription.paidUntil).getTime() - Date.now()) / msPerDay

  return daysLeft <= EXPIRING_SOON_DAYS ? 'expiring' : 'active'
}
