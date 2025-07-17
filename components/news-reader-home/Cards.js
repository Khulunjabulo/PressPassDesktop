import { Users, Megaphone, MessageSquare, User, BarChart3, Smartphone } from "lucide-react";

export function WhyUseCards() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-black mb-16">Why Use Press Pass?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border-2 border-[#ffbd59] bg-white">
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">Stay Connected</h3>
              <h4 className="text-lg font-semibold text-black mb-4">to your Community</h4>
              <p className="text-gray-600">
                Follow news that matters from community papers, regional newsletters, and grassroots outlets.
              </p>
            </div>
          </div>
          <div className="border-2 border-[#ffbd59] bg-white">
            <div className="p-8 text-center">
              <Megaphone className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">One Platform.</h3>
              <h4 className="text-lg font-semibold text-black mb-4">Hundreds of Voices.</h4>
              <p className="text-gray-600">
                Discover diverse perspectives from trusted local sources — all in one app.
              </p>
            </div>
          </div>
          <div className="border-2 border-[#ffbd59] bg-white">
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">Support Independent</h3>
              <h4 className="text-lg font-semibold text-black mb-4">Journalism</h4>
              <p className="text-gray-600">
                Your views and subscriptions empower community journalists across South Africa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksCards() {
  return (
    <section className="py-20 bg-[#e6e6e6]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-black mb-16">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border-2 border-[#ffbd59] bg-white">
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-4">Sign up for free.</h3>
              <p className="text-gray-600">Create your profile in seconds.</p>
            </div>
          </div>
          <div className="border-2 border-[#ffbd59] bg-white">
            <div className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-4">Choose your communities.</h3>
              <p className="text-gray-600">Follow publications that matter to you.</p>
            </div>
          </div>
          <div className="border-2 border-[#ffbd59] bg-white">
            <div className="p-8 text-center">
              <Smartphone className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-4">Get fresh local news.</h3>
              <p className="text-gray-600">Curated, relevant, and reliable updates daily.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
