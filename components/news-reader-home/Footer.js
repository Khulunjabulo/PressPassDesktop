export default function Footer() {
  return (
    <footer className="bg-[#329ae1] py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to read smarter, local news?</h2>
        <p className="text-white/90 mb-8">Join thousands of South Africans switching to community-first media.</p>
        <div className="flex justify-center gap-4">
          <div className="w-10 h-10 bg-[#ffbd59] rounded flex items-center justify-center">
            <span className="text-white font-bold">in</span>
          </div>
          <div className="w-10 h-10 bg-[#ffbd59] rounded flex items-center justify-center">
            <span className="text-white font-bold">@</span>
          </div>
          <div className="w-10 h-10 bg-[#ffbd59] rounded flex items-center justify-center">
            <span className="text-white font-bold">f</span>
          </div>
        </div>
      </div>
    </footer>
  );
}