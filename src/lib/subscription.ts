import { prisma } from './prisma';

export async function checkSubscriptionStatus(companyId: number) {
  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
  });

  if (!subscription) {
    return {
      isActive: false,
      status: 'no_subscription',
      plan: null,
      userLimit: 0,
    };
  }

  const now = new Date();
  const isActive = subscription.status === 'active' && 
                  subscription.currentPeriodEnd > now &&
                  !subscription.cancelAtPeriodEnd;

  const userLimits = {
    starter: 5,
    professional: 50,
    enterprise: 999999, // Illimité
  };

  return {
    isActive,
    status: subscription.status,
    plan: subscription.plan,
    userLimit: userLimits[subscription.plan as keyof typeof userLimits] || 0,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

export async function checkUserLimit(companyId: number) {
  const subscription = await checkSubscriptionStatus(companyId);
  
  if (!subscription.isActive) {
    return { canAddUser: false, reason: 'subscription_inactive' };
  }

  const userCount = await prisma.user.count({
    where: { companyId },
  });

  const canAddUser = userCount < subscription.userLimit;

  return {
    canAddUser,
    currentUsers: userCount,
    userLimit: subscription.userLimit,
    reason: canAddUser ? null : 'user_limit_reached',
  };
}
