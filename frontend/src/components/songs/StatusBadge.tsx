export const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "completed":
      return (
        <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
          Completed
        </div>
      );
    case "processing":
      return (
        <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
          Processing
        </div>
      );
    case "pending":
      return (
        <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span>
          Pending
        </div>
      );
    case "error":
      return (
        <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
          Error
        </div>
      );
    default:
      return (
        <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"></span>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      );
  }
};
