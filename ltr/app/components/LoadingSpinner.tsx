export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          <i className="bi bi-train-front text-blue-500 text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
        </div>
        <p className="text-gray-400 text-sm mt-4 font-medium">Loading...</p>
      </div>
    </div>
  );
}
