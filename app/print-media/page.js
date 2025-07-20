import Image from 'next/image'
import {
  Globe,
  Wallet,
  ShieldCheck,
  Settings,
  Inbox,
  Link as LinkIcon,
  DollarSign,
  Monitor,
  BarChart2,
} from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-white text-gray-800">
      {/* Header */}
      <header className="bg-blue-600 text-white flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-bold">PressPass</h1>
        <a href="#" className="text-sm underline">Download App</a>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Grow Your Reach. <br />
            Keep Your Voice. <br />
            Get Paid Fairly.
          </h2>
          <p className="text-gray-700 mb-6">
            Press Pass helps South African online community publications reach their audience,
            earn recurring income, and stay independent — without extra work.
          </p>
          <Link href="/signup">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
            Join as a Publisher
          </button>
        </Link>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <img src="/hero section.png" 
          alt="Hero"
           className="rounded-lg w-full max-w-md" />
        </div>
      </section>

      {/* Why Use Press Pass */}
      <section className="bg-gray-50 py-12 border-t">
        <h3 className="text-2xl font-bold text-center mb-10">Why Use Press Pass?</h3>
        <div className="grid md:grid-cols-4 gap-8 px-6 max-w-6xl mx-auto text-center">
        {[
  { icon: <Globe size={32} />, title: 'Reach a wider Audience', text: 'Your stories get access to our publishing platform and mobile app.' },
  { icon: <Wallet size={32} />, title: 'Monetize Your Work', text: 'Earn revenue through subscriptions and incentives.' },
  { icon: <ShieldCheck size={32} />, title: 'Stay Independent', text: 'Keep full editorial control and build your brand.' },
  { icon: <Settings size={32} />, title: 'Simplified Tech', text: 'We handle the infrastructure so you can focus on content.' }
].map((item, index) => (
  <div key={index} className="p-4 border-l-4 border-yellow-400 bg-white shadow-sm rounded">
    <div className="text-blue-600 mb-2 flex justify-center">{item.icon}</div>
    <h4 className="font-bold mb-1">{item.title}</h4>
    <p className="text-sm text-gray-600">{item.text}</p>
  </div>
))}

        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-10">How it works</h3>
        <div className="grid md:grid-cols-3 gap-8 mb-10 text-center">
         {[
  { icon: <Inbox size={32} />, title: 'Apply or Get Invited', text: "We'll onboard you according to your needs." },
  { icon: <LinkIcon size={32} />, title: 'Connect Your Feed or Post', text: 'Post stories and grow traffic.' },
  { icon: <DollarSign size={32} />, title: 'Start Earning & Growing', text: 'Get paid monthly with full analytics.' }
].map((step, i) => (
  <div key={i} className="p-4 border-l-4 border-yellow-400 bg-gray-50 rounded shadow-sm text-center">
    <div className="text-blue-600 mb-2 flex justify-center">{step.icon}</div>
    <h4 className="font-bold mb-1">{step.title}</h4>
    <p className="text-sm text-gray-600">{step.text}</p>
  </div>
))}

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-center shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 font-bold">
              <tr>
                <th className="p-3">Publications</th>
                <th className="p-3">Views</th>
                <th className="p-3">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['News24', '121', '112'],
                ['The Herald', '114', '106'],
                ['NEWS SUD', '108', '105'],
                ['The Mercury', '103', '100']
              ].map(([name, views, earnings], idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3 font-semibold">{name}</td>
                  <td className="p-3">{views}</td>
                  <td className="p-3">{earnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quote */}
        <p className="text-center mt-10 text-blue-600 font-semibold">
          Trusted by Publishers Across South Africa
        </p>
        <p className="text-center text-gray-500 italic">
          "PressPass gave our paper digital reach we never thought possible"
        </p>
      </section>

      {/* Tools and Support */}
      <section className="bg-gray-50 py-12">
        <h3 className="text-xl font-bold text-center mb-6">Tools and Support you Get</h3>
        <div className="flex justify-center gap-12 text-center">
  <div>
    <Monitor size={32} className="mx-auto text-blue-600 mb-1" />
    <p>Publish Dashboard</p>
  </div>
  <div>
    <BarChart2 size={32} className="mx-auto text-blue-600 mb-1" />
    <p>Analytics & Engagement Reports</p>
  </div>
</div>

      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-4 text-center">
        <p className="mb-2">Ready to read smarter, local news?</p>
        <div className="flex justify-center gap-4">
          <a href="#" className="hover:underline">LinkedIn</a>
          <a href="#" className="hover:underline">Twitter</a>
          <a href="#" className="hover:underline">Facebook</a>
        </div>
      </footer>
    </div>
  )
}

