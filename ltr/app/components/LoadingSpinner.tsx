export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
