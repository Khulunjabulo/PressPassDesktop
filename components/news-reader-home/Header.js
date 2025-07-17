//import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-[#329ae1] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-[#329ae1] rounded-full relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="text-white">
            <div className="font-bold text-lg">Press Pass</div>
            <div className="text-xs opacity-90">STAY INFORMED</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button variant="outline" className="bg-white text-[#329ae1] border-white hover:bg-gray-50">
            Download App
          </button>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-[#329ae1]" />
          </div>
        </div>
      </div>
    </header>
  );
}