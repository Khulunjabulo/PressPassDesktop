export const checkPublisherApproval = (user) => {
  if (!user || user.role !== 'publisher') {
    return { canPublish: false, reason: 'Not a publisher account' };
  }
  
  if (!user.profileComplete) {
    return { 
      canPublish: false, 
      reason: 'Profile incomplete', 
      redirectTo: '/print-media/profile' 
    };
  }
  
  // CHANGE THIS LINE:
  if (!user.isVerified) {  // Changed from user.isApproved to user.isVerified
    return { 
      canPublish: false, 
      reason: 'Waiting for admin approval',
      status: user.approvalStatus || 'pending'
    };
  }
  
  return { canPublish: true };
};