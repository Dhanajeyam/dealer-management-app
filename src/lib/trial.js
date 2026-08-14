/**
 * Utility functions for evaluating and formatting dealer trial status.
 */

export function getTrialInfo(profile) {
  if (!profile || profile.role !== 'dealer') {
    return {
      isTrial: false,
      isExpired: false,
      daysLeft: 0,
      text: 'Paid Account',
      badgeText: 'Paid Account',
      badgeColor: 'var(--primary)',
      badgeBg: 'var(--primary-light)'
    }
  }

  // If is_trial is explicitly false, it is a paid/permanent account
  const isTrial = profile.is_trial === true

  if (!isTrial) {
    return {
      isTrial: false,
      isExpired: false,
      daysLeft: 0,
      text: 'Paid Account',
      badgeText: 'Paid Account',
      badgeColor: 'var(--primary)',
      badgeBg: 'var(--primary-light)'
    }
  }

  // If is_trial is true, check expiration date
  let trialEndsAtDate
  if (profile.trial_ends_at) {
    trialEndsAtDate = new Date(profile.trial_ends_at)
  } else if (profile.created_at) {
    trialEndsAtDate = new Date(new Date(profile.created_at).getTime() + 7 * 24 * 60 * 60 * 1000)
  } else {
    trialEndsAtDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }

  const now = new Date()
  const diffMs = trialEndsAtDate.getTime() - now.getTime()
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const isExpired = diffMs <= 0

  let text = ''
  let badgeText = ''
  let badgeColor = 'var(--warning)'
  let badgeBg = 'var(--warning-bg)'

  if (isExpired) {
    text = 'Your 7-day free trial has ended'
    badgeText = 'Trial Expired'
    badgeColor = 'var(--danger)'
    badgeBg = 'var(--danger-bg)'
  } else if (daysLeft === 0 || diffMs < 24 * 60 * 60 * 1000) {
    text = 'Trial expires today'
    badgeText = 'Expires Today'
    badgeColor = 'var(--danger)'
    badgeBg = 'var(--danger-bg)'
  } else {
    text = `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in free trial`
    badgeText = `${daysLeft}d Trial Left`
    badgeColor = 'var(--warning)'
    badgeBg = 'var(--warning-bg)'
  }

  return {
    isTrial: true,
    isExpired,
    daysLeft: Math.max(0, daysLeft),
    trialEndsAt: trialEndsAtDate.toISOString(),
    text,
    badgeText,
    badgeColor,
    badgeBg
  }
}

export function isTrialExpired(profile) {
  const info = getTrialInfo(profile)
  return info.isTrial && info.isExpired
}
