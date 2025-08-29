import { Card, CardContent } from "@/components/ui/Cards"
import { Phone, Wifi } from "lucide-react"

export default function NewsReaderPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Phone Frames */}
        <div className="flex gap-4 justify-center overflow-x-auto">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex-shrink-0">
              {/* Mobile Phone Frame */}
              <div className="bg-gray-800 rounded-[2.5rem] p-2 shadow-2xl w-80">
                <div className="bg-white rounded-[2rem] overflow-hidden h-[600px] relative">
                  {/* Phone Screen Content */}
                  <div className="h-full overflow-y-auto">
                    {/* Press Pass Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Wifi className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg font-bold">Press Pass</h2>
                    </div>

                    {/* Number Badge */}
                    <div className="bg-gray-50 p-4 text-center">
                      <div className="text-4xl font-bold text-gray-800 mb-2">{num}</div>
                    </div>

                    {/* Contact Information Bar */}
                    <div className="bg-blue-500 text-white p-3">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <Wifi className="w-3 h-3" />
                        <span>Advertise Here</span>
                      </div>
                      <div className="text-center mt-1">
                        <div className="text-xs">📧 partners@presspass.africa</div>
                        <div className="text-xs flex items-center justify-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          <span>Phone: +27 87 XXX XXX</span>
                        </div>
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="p-4">
                      {/* Article Image Placeholder */}
                      <div className="bg-gray-300 h-32 flex items-center justify-center text-gray-600 font-medium text-sm mb-4 rounded">
                        Article Image Here
                      </div>

                      {/* Article Title */}
                      <h3 className="font-semibold text-base mb-3">The Future of Sustainable Mining</h3>

                      {/* Article Text */}
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        Mining companies worldwide are under growing pressure to reduce their environmental impact while
                        maintaining efficiency. Innovative practices such as renewable-powered operations, water
                        recycling, and digital monitoring systems are now reshaping the industry.
                      </p>

                      {num === 2 && (
                        <div className="bg-blue-500 text-white p-2 rounded mb-3">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <Wifi className="w-3 h-3" />
                            <span>Advertise Here</span>
                            <span>📧 partners@presspass.africa</span>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        At the heart of these changes is technology—AI-driven exploration tools, automated machinery,
                        and data analytics are making mining safer and more sustainable. Communities near mining
                        operations also stand to benefit, with companies investing in local infrastructure and green
                        initiatives.
                      </p>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        The future of mining is not just about extracting resources—it's about balancing growth with
                        responsibility.
                      </p>

                      {num === 3 && (
                        <div className="bg-blue-500 text-white p-2 rounded mt-4">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <Wifi className="w-3 h-3" />
                            <span>Advertise Here</span>
                            <span>📧 partners@presspass.africa</span>
                            <Phone className="w-3 h-3" />
                            <span>Phone: +27 87 XXX XXX</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Card className="bg-blue-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">🏠</div>
                <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">🔍</div>
                <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">📄</div>
                <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">📊</div>
                <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">📈</div>
                <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">⚙️</div>
                <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">📄</div>
                <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">📊</div>
                <div className="w-10 h-10 bg-white bg-opacity-90 rounded flex items-center justify-center text-blue-500 font-bold text-sm">
                  Ad
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
