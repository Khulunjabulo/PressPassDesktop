
export default function Hero() {
  return (
    <section className="relative bg-[#e6e6e6] py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="text-6xl font-bold text-gray-400 transform rotate-12 absolute top-10 left-10">
          COAST TO COAST
        </div>
        <div className="text-4xl font-bold text-gray-400 transform -rotate-12 absolute bottom-20 right-20">
          LOCAL NEWS
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-black mb-4">
              STAY INFORMED.
              <br />
              STAY LOCAL.
            </h1>
            <div className="text-xl text-gray-600 mb-2">
              YOUR COMMUNITY NEWS IN ONE <span className="text-[#329ae1] font-bold">APP</span>.
            </div>
            <p className="text-gray-600 mb-8 max-w-lg">
              Press Pass brings South Africa's diverse community media together — empowering you with credible,
              hyper-local news at your fingertips.
            </p>
            <div className="flex items-center gap-4 mb-8">
              <div className="text-sm text-gray-500">
                <div>START</div>
                <div>READING</div>
                <div>FREE</div>
              </div>
              <button className="bg-[#329ae1] hover:bg-[#3997d6] text-white px-8 py-3 rounded-full">
                Start to read
              </button>
              
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-black">18.5M+</div>
                <div className="text-sm text-gray-600">Total news readers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">5.5M+</div>
                <div className="text-sm text-gray-600">Daily news readers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">22+</div>
                <div className="text-sm text-gray-600">Major daily newspapers</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-64 h-96 bg-[#329ae1] rounded-3xl shadow-2xl transform rotate-6"></div>
              <div className="absolute -top-4 -left-4 w-64 h-96 bg-[#3997d6] rounded-3xl shadow-2xl">
                <div className="p-4 text-white">
                  <div className="bg-white/20 rounded-lg p-3 mb-3">
                    <div className="h-2 bg-white/60 rounded mb-2"></div>
                    <div className="h-2 bg-white/40 rounded w-3/4"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1 bg-white/40 rounded"></div>
                    <div className="h-1 bg-white/40 rounded w-5/6"></div>
                    <div className="h-1 bg-white/40 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}