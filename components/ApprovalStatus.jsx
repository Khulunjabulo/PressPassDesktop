const ApprovalStatus = ({ user, className = "" }) => {
  if (user?.role !== 'publisher') return null;

  if (!user.profileComplete) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
          <div>
            <h3 className="font-semibold text-yellow-800">Profile Incomplete</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Please complete your publisher profile to proceed with approval.
            </p>
            <button
              onClick={() => router.push('/print-media/profile')}
              className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700"
            >
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user.approvalStatus === 'pending') {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
          <div>
            <h3 className="font-semibold text-blue-800">Approval Pending</h3>
            <p className="text-blue-700 text-sm mt-1">
              Your publisher account is under review. You can browse content but cannot publish articles yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (user.approvalStatus === 'rejected') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <X className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <h3 className="font-semibold text-red-800">Application Rejected</h3>
            <p className="text-red-700 text-sm mt-1">
              {user.rejectedReason || 'Please contact support for more information.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null; // Approved users don't need status message
};