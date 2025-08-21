import React from "react";
import { Facebook, Twitter, Linkedin } from "lucide-react";

export default function PrintMediaFooter() {
  return (
    <footer className="w-full bg-gradient-to-r bg-[#329ae1] text-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
        {/* Corporate Info Section */}
        <div className="flex flex-col md:flex-row items-center md:items-center gap-4">
          <img
            src="/Presspass.png"
            alt="PressPass Logo"
            className="w-56 h-24 object-contain flex-shrink-0"
          />
          <div className="flex flex-col items-center md:items-start mt-2 md:mt-0">
            <h3 className="text-sm font-medium mb-1">Corporate Info</h3>
            <a
              href="#"
              className="text-sm text-blue-100 hover:text-white transition-colors"
            >
              ABOUT PRESS PASS
            </a>
          </div>
        </div>

        {/* Center Legal Links */}
        <div className="flex flex-col items-center text-center mt-4 md:mt-0">
          <div className="flex items-center gap-2 text-sm text-blue-100 mb-2">
            <a href="#" className="hover:text-white transition-colors">
              Terms of Use
            </a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
          </div>
          <p className="text-xs text-blue-100">
            © 2023 Press Pass. All rights reserved.
          </p>
        </div>

        {/* Social Media Icons */}
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <a
            href="#"
            className="w-8 h-8 bg-white/20 rounded-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="w-8 h-8 bg-white/20 rounded-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="w-8 h-8 bg-white/20 rounded-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
