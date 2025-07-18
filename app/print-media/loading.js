export default function PrintMediaLoading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary"></div>
      <p className="ml-4 text-lg text-muted-foreground">Loading print media...</p>
    </div>
  )
}