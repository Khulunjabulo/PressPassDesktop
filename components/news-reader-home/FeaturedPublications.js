export default function FeaturedPublications() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-black mb-16">Featured publications</h2>

        <div className="flex justify-center items-center gap-12 flex-wrap">
          <div className="text-2xl font-serif text-[#329ae1] font-bold">The MERCURY</div>
          <div className="bg-[#329ae1] text-white px-4 py-2 font-bold">The Herald</div>
          <div className="text-2xl font-bold text-red-600">RISING SUN</div>
          <div className="text-2xl font-bold text-green-600 italic">isolezwe</div>
        </div>
      </div>
    </section>
  );
}
