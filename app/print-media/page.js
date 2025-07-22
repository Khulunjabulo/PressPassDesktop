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
import { useRouter } from 'next/navigation';
import React from "react";



// Custom SVG Icons
const GlobeIcon = () => (
  <svg fill="#000000" width="80px" height="80px" viewBox="-1 0 19 19" xmlns="http://www.w3.org/2000/svg" class="cf-icon-svg"><path d="M16.417 9.57a7.917 7.917 0 1 1-8.144-7.908 1.758 1.758 0 0 1 .451 0 7.913 7.913 0 0 1 7.693 7.907zM5.85 15.838q.254.107.515.193a11.772 11.772 0 0 1-1.572-5.92h-3.08a6.816 6.816 0 0 0 4.137 5.727zM2.226 6.922a6.727 6.727 0 0 0-.511 2.082h3.078a11.83 11.83 0 0 1 1.55-5.89q-.249.083-.493.186a6.834 6.834 0 0 0-3.624 3.622zm8.87 2.082a14.405 14.405 0 0 0-.261-2.31 9.847 9.847 0 0 0-.713-2.26c-.447-.952-1.009-1.573-1.497-1.667a8.468 8.468 0 0 0-.253 0c-.488.094-1.05.715-1.497 1.668a9.847 9.847 0 0 0-.712 2.26 14.404 14.404 0 0 0-.261 2.309zm-.974 5.676a9.844 9.844 0 0 0 .713-2.26 14.413 14.413 0 0 0 .26-2.309H5.903a14.412 14.412 0 0 0 .261 2.31 9.844 9.844 0 0 0 .712 2.259c.487 1.036 1.109 1.68 1.624 1.68s1.137-.644 1.623-1.68zm4.652-2.462a6.737 6.737 0 0 0 .513-2.107h-3.082a11.77 11.77 0 0 1-1.572 5.922q.261-.086.517-.194a6.834 6.834 0 0 0 3.624-3.621zM11.15 3.3a6.82 6.82 0 0 0-.496-.187 11.828 11.828 0 0 1 1.55 5.89h3.081A6.815 6.815 0 0 0 11.15 3.3z"/></svg>
);

const MoneyBagIcon = () => (
      <svg
      fill="#000000"
      height="80px"
      width="80px"
      viewBox="0 0 512.091 512.091"
    >
      <g>
        <g>
          <path d="M464.581,386.355c-7.848-46.924-24.896-100.708-45.6-143.884c-29.168-60.824-64.588-101.616-105.276-121.228
            c-2-0.968-4.384-0.124-5.34,1.864c-0.96,1.992-0.124,4.384,1.864,5.34c88.704,42.764,134.592,188.268,146.464,259.228
            c5.348,31.984-2.74,63.508-22.192,86.48c-16.104,19.024-38.016,29.936-60.104,29.936H137.725
            c-22.128,0-44.076-10.94-60.2-30.016c-19.428-22.98-27.488-54.472-22.104-86.4
            c12.796-75.984,57.908-216.044,145.824-259.032c1.984-0.972,2.804-3.368,1.836-5.352c-0.972-1.984-3.364-2.812-5.352-1.836
            c-40.648,19.876-75.792,60.128-104.448,119.636c-29.548,61.364-41.836,122.024-45.752,145.256
            c-5.772,34.256,2.936,68.116,23.888,92.896c17.652,20.876,41.82,32.848,66.308,32.848h236.672
            c24.448,0,48.58-11.94,66.208-32.768C461.581,454.551,470.321,420.663,464.581,386.355z" />
        </g>
      </g>
      <g>
        <g>
          <path d="M304.053,96.091h-96.016c-8.816,0-15.992,7.176-15.992,15.992v4.016c0,8.816,7.176,15.992,15.992,15.992h96.016
            c8.816,0,15.992-7.176,15.992-15.992v-4.016C320.045,103.267,312.869,96.091,304.053,96.091z M312.045,116.099
            c0,4.408-3.584,7.992-7.992,7.992h-96.016c-4.408,0-7.992-3.584-7.992-7.992v-4.016c0-4.408,3.584-7.992,7.992-7.992h96.016
            c4.408,0,7.992,3.584,7.992,7.992V116.099z" />
        </g>
      </g>
      <g>
        <g>
          <path d="M328.693,3.391c-3.092-3.164-8.012-4.164-13.704-2.66c-0.332,0.108-33.336,10.64-44.34,13.796
            c-7.768,2.232-20.924,2.252-28.728,0.028c-11.12-3.168-44.472-13.748-45.008-13.912c-5.492-1.44-10.404-0.432-13.492,2.736
            c-3.092,3.172-3.968,8.112-2.42,13.5l22.768,84.436c0.48,1.78,2.1,2.956,3.86,2.956c0.344,0,0.692-0.044,1.036-0.136
            c2.132-0.58,3.396-2.776,2.82-4.908l-22.784-84.496c-0.74-2.568-0.576-4.724,0.44-5.764c1.016-1.04,3.168-1.256,5.544-0.636
            c1.376,0.436,33.804,10.716,45.04,13.92c9.156,2.604,24.024,2.584,33.124-0.036c11.12-3.184,43.208-13.428,44.368-13.804
            c2.576-0.684,4.728-0.468,5.744,0.572c1.012,1.032,1.172,3.18,0.412,5.816l-22.756,84.432c-0.576,2.136,0.688,4.328,2.824,4.904
            c2.1,0.564,4.328-0.688,4.904-2.824l22.74-84.364C332.653,11.499,331.781,6.559,328.693,3.391z" />
        </g>
      </g>
      <g>
        <g>
          <path d="M388.045,476.091h-264c-2.212,0-4,1.788-4,4c0,2.212,1.788,4,4,4h264c2.212,0,4-1.788,4-4
            C392.045,477.879,390.257,476.091,388.045,476.091z" />
        </g>
      </g>
    </svg>
);

const ShieldIcon = () => (
    <svg width="80px" height="80px" viewBox="0 0 20 20">
      <g id="layer1">
        <path
          d="M 10 0 L 9.4375 0.40234375 L 8.8613281 0.77539062 L 8.2636719 1.1230469 L 7.6542969 1.4433594 L 7.0292969 1.734375 L 6.390625 1.9960938 L 5.7421875 2.2304688 L 5.0839844 2.4335938 L 4.4179688 2.6054688 L 3.7421875 2.7480469 L 3.0605469 2.8574219 L 2.3769531 2.9355469 L 1.6894531 2.984375 L 1 3 L 1.015625 3.8339844 L 1.0664062 4.6660156 L 1.1503906 5.4960938 L 1.2695312 6.3222656 L 1.421875 7.1425781 L 1.6054688 7.9550781 L 1.8222656 8.7597656 L 2.0722656 9.5546875 L 2.3535156 10.339844 L 2.6679688 11.113281 L 3.0136719 11.873047 L 3.3886719 12.617188 L 3.7929688 13.347656 L 4.2265625 14.058594 L 4.6894531 14.751953 L 5.1816406 15.427734 L 5.6992188 16.082031 L 6.2421875 16.712891 L 6.8105469 17.322266 L 7.4042969 17.910156 L 8.0214844 18.470703 L 8.6601562 19.007812 L 9.3203125 19.517578 L 10 20 L 10.679688 19.517578 L 11.339844 19.007812 L 11.978516 18.470703 L 12.595703 17.910156 L 13.189453 17.322266 L 13.757812 16.712891 L 14.300781 16.082031 L 14.818359 15.427734 L 15.308594 14.751953 L 15.771484 14.058594 L 16.207031 13.347656 L 16.611328 12.617188 L 16.986328 11.873047 L 17.332031 11.113281 L 17.644531 10.339844 L 17.925781 9.5546875 L 18.175781 8.7597656 L 18.394531 7.9550781 L 18.580078 7.1425781 L 18.730469 6.3222656 L 18.849609 5.4960938 L 18.933594 4.6660156 L 18.984375 3.8339844 L 19 3 L 18.310547 2.984375 L 17.623047 2.9355469 L 16.939453 2.8574219 L 16.257812 2.7480469 L 15.582031 2.6054688 L 14.916016 2.4335938 L 14.257812 2.2304688 L 13.607422 1.9960938 L 12.970703 1.734375 L 12.345703 1.4433594 L 11.734375 1.1230469 L 11.138672 0.77539062 L 10.560547 0.40234375 L 10 0 z M 10 1.2285156 L 10.597656 1.6152344 L 11.210938 1.9746094 L 11.837891 2.3085938 L 12.482422 2.6132812 L 13.136719 2.8867188 L 13.804688 3.1328125 L 14.482422 3.3496094 L 15.169922 3.5332031 L 15.863281 3.6894531 L 16.5625 3.8125 L 17.267578 3.90625 L 17.976562 3.96875 L 17.921875 4.7558594 L 17.833984 5.5410156 L 17.716797 6.3242188 L 17.566406 7.0996094 L 17.384766 7.8691406 L 17.171875 8.6308594 L 16.929688 9.3808594 L 16.658203 10.123047 L 16.353516 10.853516 L 16.023438 11.570312 L 15.662109 12.273438 L 15.273438 12.960938 L 14.855469 13.632812 L 14.414062 14.289062 L 13.945312 14.923828 L 13.451172 15.541016 L 12.931641 16.136719 L 12.388672 16.710938 L 11.824219 17.263672 L 11.236328 17.791016 L 10.626953 18.296875 L 10 18.777344 L 9.3730469 18.296875 L 8.7636719 17.791016 L 8.1777344 17.263672 L 7.6113281 16.710938 L 7.0683594 16.136719 L 6.5488281 15.541016 L 6.0566406 14.923828 L 5.5859375 14.289062 L 5.1445312 13.632812 L 4.7265625 12.960938 L 4.3378906 12.273438 L 3.9785156 11.570312 L 3.6445312 10.853516 L 3.34375 10.123047 L 3.0703125 9.3808594 L 2.828125 8.6308594 L 2.6152344 7.8691406 L 2.4335938 7.0996094 L 2.2832031 6.3242188 L 2.1660156 5.5410156 L 2.078125 4.7558594 L 2.0234375 3.96875 L 2.7304688 3.90625 L 3.4355469 3.8125 L 4.1367188 3.6894531 L 4.8320312 3.5332031 L 5.5175781 3.3496094 L 6.1953125 3.1328125 L 6.8632812 2.8867188 L 7.5175781 2.6132812 L 8.1621094 2.3085938 L 8.7910156 1.9746094 L 9.4023438 1.6152344 L 10 1.2285156 z"
          style={{
            fill: '#222222',
            fillOpacity: 1,
            stroke: 'none',
            strokeWidth: 0
          }}
        />
      </g>
    </svg>
);

const GearIcon = () => (
  <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M11.0175 19C10.6601 19 10.3552 18.7347 10.297 18.373C10.2434 18.0804 10.038 17.8413 9.76171 17.75C9.53658 17.6707 9.31645 17.5772 9.10261 17.47C8.84815 17.3365 8.54289 17.3565 8.30701 17.522C8.02156 17.7325 7.62943 17.6999 7.38076 17.445L6.41356 16.453C6.15326 16.186 6.11944 15.7651 6.33361 15.458C6.49878 15.2105 6.52257 14.8914 6.39601 14.621C6.31262 14.4332 6.23906 14.2409 6.17566 14.045C6.08485 13.7363 5.8342 13.5051 5.52533 13.445C5.15287 13.384 4.8779 13.0559 4.87501 12.669V11.428C4.87303 10.9821 5.18705 10.6007 5.61601 10.528C5.94143 10.4645 6.21316 10.2359 6.33751 9.921C6.37456 9.83233 6.41356 9.74433 6.45451 9.657C6.61989 9.33044 6.59705 8.93711 6.39503 8.633C6.1424 8.27288 6.18119 7.77809 6.48668 7.464L7.19746 6.735C7.54802 6.37532 8.1009 6.32877 8.50396 6.625L8.52638 6.641C8.82735 6.84876 9.21033 6.88639 9.54428 6.741C9.90155 6.60911 10.1649 6.29424 10.2375 5.912L10.2473 5.878C10.3275 5.37197 10.7536 5.00021 11.2535 5H12.1115C12.6248 4.99976 13.0629 5.38057 13.1469 5.9L13.1625 5.97C13.2314 6.33617 13.4811 6.63922 13.8216 6.77C14.1498 6.91447 14.5272 6.87674 14.822 6.67L14.8707 6.634C15.2842 6.32834 15.8528 6.37535 16.2133 6.745L16.8675 7.417C17.1954 7.75516 17.2366 8.28693 16.965 8.674C16.7522 8.99752 16.7251 9.41325 16.8938 9.763L16.9358 9.863C17.0724 10.2045 17.3681 10.452 17.7216 10.521C18.1837 10.5983 18.5235 11.0069 18.525 11.487V12.6C18.5249 13.0234 18.2263 13.3846 17.8191 13.454C17.4842 13.5199 17.2114 13.7686 17.1083 14.102C17.0628 14.2353 17.0121 14.3687 16.9562 14.502C16.8261 14.795 16.855 15.1364 17.0323 15.402C17.2662 15.7358 17.2299 16.1943 16.9465 16.485L16.0388 17.417C15.7792 17.6832 15.3698 17.7175 15.0716 17.498C14.8226 17.3235 14.5001 17.3043 14.2331 17.448C14.0428 17.5447 13.8475 17.6305 13.6481 17.705C13.3692 17.8037 13.1636 18.0485 13.1099 18.346C13.053 18.7203 12.7401 18.9972 12.3708 19H11.0175Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9747 12C13.9747 13.2885 12.9563 14.333 11.7 14.333C10.4437 14.333 9.42533 13.2885 9.42533 12C9.42533 10.7115 10.4437 9.66699 11.7 9.66699C12.9563 9.66699 13.9747 10.7115 13.9747 12Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

const DocumentIcon = () => (
   <svg
      width="80px"
      height="80px"
      viewBox="-2 0 32 32"
    >
      <title>clipboard</title>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(-466, -99)" fill="#000000">
          <path d="M487,113 L473,113 C472.447,113 472,113.448 472,114 C472,114.553 472.447,115 473,115 L487,115 C487.553,115 488,114.553 488,114 C488,113.448 487.553,113 487,113 Z M492,127 C492,128.104 491.104,129 490,129 L470,129 C468.896,129 468,128.104 468,127 L468,107 C468,105.896 468.896,105 470,105 L473,105 L473,109 L487,109 L487,105 L490,105 C491.104,105 492,105.896 492,107 L492,127 Z M475,103 L477.223,103 C477.223,101.896 478.466,101 480,101 C481.534,101 482.777,101.896 482.777,103 L485,103 L485,107 L475,107 L475,103 Z M490,103 L487,103 L487,101 L484.307,101 C483.44,99.81 481.846,99 480,99 C478.154,99 476.56,99.81 475.693,101 L473,101 L473,103 L470,103 C467.791,103 466,104.791 466,107 L466,127 C466,129.209 467.791,131 470,131 L490,131 C492.209,131 494,129.209 494,127 L494,107 C494,104.791 492.209,103 490,103 Z M487,123 L473,123 C472.447,123 472,123.448 472,124 C472,124.553 472.447,125 473,125 L487,125 C487.553,125 488,124.553 488,124 C488,123.448 487.553,123 487,123 Z M487,118 L473,118 C472.447,118 472,118.448 472,119 C472,119.553 472.447,120 473,120 L487,120 C487.553,120 488,119.553 488,119 C488,118.448 487.553,118 487,118 Z" />
        </g>
      </g>
    </svg>
);

const MonitorIcon = () => (
  <svg fill="#000000" width="80px" height="80px" viewBox="0 -3 32 32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
    <path d="M30.000,21.000 L17.000,21.000 L17.000,24.000 L22.047,24.000 C22.600,24.000 23.047,24.448 23.047,25.000 C23.047,25.552 22.600,26.000 22.047,26.000 L10.047,26.000 C9.494,26.000 9.047,25.552 9.047,25.000 C9.047,24.448 9.494,24.000 10.047,24.000 L15.000,24.000 L15.000,21.000 L2.000,21.000 C0.898,21.000 0.000,20.103 0.000,19.000 L0.000,2.000 C0.000,0.897 0.898,0.000 2.000,0.000 L30.000,0.000 C31.103,0.000 32.000,0.897 32.000,2.000 L32.000,19.000 C32.000,20.103 31.103,21.000 30.000,21.000 ZM2.000,2.000 L2.000,19.000 L29.997,19.000 L30.000,2.000 L2.000,2.000 Z"/>
</svg>
);

const BarChartIcon = () => (
 <svg width="80px" height="80px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="m 13 1 c -0.554688 0 -1 0.445312 -1 1 v 12 c 0 0.554688 0.445312 1 1 1 h 1 c 0.554688 0 1 -0.445312 1 -1 v -12 c 0 -0.554688 -0.445312 -1 -1 -1 z m -4 3 c -0.554688 0 -1 0.445312 -1 1 v 9 c 0 0.554688 0.445312 1 1 1 h 1 c 0.554688 0 1 -0.445312 1 -1 v -9 c 0 -0.554688 -0.445312 -1 -1 -1 z m -4 3 c -0.554688 0 -1 0.445312 -1 1 v 6 c 0 0.554688 0.445312 1 1 1 h 1 c 0.554688 0 1 -0.445312 1 -1 v -6 c 0 -0.554688 -0.445312 -1 -1 -1 z m -4 3 c -0.554688 0 -1 0.445312 -1 1 v 3 c 0 0.554688 0.445312 1 1 1 h 1 c 0.554688 0 1 -0.445312 1 -1 v -3 c 0 -0.554688 -0.445312 -1 -1 -1 z m 0 0" fill="#2e3436"/>
</svg>
);

const App = () => {
 const router = useRouter();

  return (
    <div className="bg-white text-black min-h-screen font-sans">
      {/* Header */}
      <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <img src="/isolezwe.png" alt="Logo" className="h-10" />
        <nav className="flex space-x-6">
          <button className="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            Home
          </button>
          <button className="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 0 1 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.5 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            Search
          </button>
          <button className="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
    2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 
    2.09C13.09 4.01 14.76 3 16.5 3 
    19.58 3 22 5.42 22 8.5c0 
    3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
            Favorite
          </button>
          <button className="text-white hover:text-gray-300">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M20.59 13.41L12 4.83 3.41 
    13.41 5.83 15.83 12 9.66l6.17 
    6.17z" />
  </svg>
            Classified
          </button>
          <button className="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
    1.79-4 4 1.79 4 4 4zm0 
    2c-2.67 0-8 1.34-8 
    4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
            Profile
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <div className=" ml-[55.5px] mr-[55.5px]">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="md:w-1/2">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Grow Your Reach.<br />
              Keep Your Voice.<br />
              Get Paid Fairly.
            </h1>
           <button 
                onClick={() => router.push('/PressPass/signIn')} 
                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300">
                LOGIN
              </button>
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0">
            <img src="/image1.jpg" alt="Hero Image" className="w-full rounded-lg" />
          </div>
        </section>

        {/* Why Use Digital Advertising */}
        <section className="mb-8">
          <h2 className="text-3xl text-center font-bold mb-4">Why Use Digital Advertising?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <img src="/image2.jpg" alt="Device Mockup 1" className="w-full md:w-1/3 rounded-lg" />
          
          </div>
        </section>

       {/* Benefits */}
<section className="mb-8">
  <div className="flex flex-col gap-4">
    <div className="flex items-center space-x-4">
      <GlobeIcon />
      <p className="font-semibold">Reach a wider Audience</p>
    </div>
    <div className="flex items-center space-x-4">
      <MoneyBagIcon />
      <p className="font-semibold">Monetize Your Work</p>
    </div>
    <div className="flex items-center space-x-4">
      <ShieldIcon />
      <p className="font-semibold">Stay Independent</p>
    </div>
    <div className="flex items-center space-x-4">
      <GearIcon />
      <p className="font-semibold">Digital Infrastructure, Simplified</p>
    </div>
  </div>
</section>


        {/* How it Works */}
        <section className="mb-8">
          <h2 className="text-3xl text-center font-bold mb-4">How it Works</h2>
          <img src="/image3.jpg" alt="Workflow Image" className="w-full rounded-lg mb-4" />
          <div className="flex flex-col gap-4">
  <div className="flex items-center space-x-4">
    <DocumentIcon />
    <p className="font-semibold">Apply or Get Invited</p>
  </div>
  <div className="flex items-center space-x-4">
    <MonitorIcon />
    <p className="font-semibold">Connect Your Feed or Upload Stories</p>
  </div>
  <div className="flex items-center space-x-4">
    <BarChartIcon />
    <p className="font-semibold">Start Growing & Earning</p>
  </div>
</div>

        </section>
      </main>
    </div>

   
<section className="bg-blue-100 p-8 text-center my-8">
  <div className="max-w-md mx-auto">
    <img src="/Presspass.png" alt="Press-Pass Logo" className="mx-auto mb-4" />
    <h2 className="text-2xl font-bold mb-2">GENERATE MAXIMUM EXPOSURE FOR YOUR BRAND IN FRONT OF OUR PRESS-PASS AUDIENCE</h2>
    <p className="mb-4">VIEW PRINT AND DIGITAL ADVERTISING OPPORTUNITIES HERE:</p>
    <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300">
      View Upcoming Advertising Opportunities
    </button>
  </div>
</section>


<section className="my-8">
  <h2 className="text-3xl font-bold text-center mb-8">Ready to Take Your Business from Great to Awesome?</h2>
  <p className="text-lg text-center mb-8">
    Level-up your marketing efforts by partnering with Press-Pass, South African news media and services group.
    Get in touch today to see how we can be awesome together.
  </p>

  
  {/* Form */}
<form className="max-w-4xl mx-auto space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* First Name */}
    <div>
      <label htmlFor="firstName" className="block text-xs font-semibold tracking-wider text-black uppercase mb-2">
        FIRST NAME<span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="firstName"
        name="firstName"
        className="w-full px-4 py-3 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
    </div>

    {/* Last Name */}
    <div>
      <label htmlFor="lastName" className="block text-xs font-semibold tracking-wider text-black uppercase mb-2">
        LAST NAME<span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="lastName"
        name="lastName"
        className="w-full px-4 py-3 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
    </div>

    {/* Company Name */}
    <div>
      <label htmlFor="companyName" className="block text-xs font-semibold tracking-wider text-black uppercase mb-2">
        COMPANY NAME<span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="companyName"
        name="companyName"
        className="w-full px-4 py-3 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
    </div>

    {/* Job Title */}
    <div>
      <label htmlFor="jobTitle" className="block text-xs font-semibold tracking-wider text-black uppercase mb-2">
        JOB TITLE<span className="text-red-500">*</span>
      </label>
      <select
        id="jobTitle"
        name="jobTitle"
        className="w-full px-4 py-3 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="">Please Select</option>
        <option value="CEO">CEO</option>
        <option value="Marketing Manager">Marketing Manager</option>
        <option value="Sales Director">Sales Director</option>
        <option value="Other">Other</option>
      </select>
    </div>

    {/* Work Email */}
    <div>
      <label htmlFor="workEmail" className="block text-xs font-semibold tracking-wider text-black uppercase mb-2">
        WORK EMAIL<span className="text-red-500">*</span>
      </label>
      <input
        type="email"
        id="workEmail"
        name="workEmail"
        className="w-full px-4 py-3 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
    </div>

    {/* Phone Number */}
    <div>
      <label htmlFor="phoneNumber" className="block text-xs font-semibold tracking-wider text-black uppercase mb-2">
        PHONE NUMBER<span className="text-red-500">*</span>
      </label>
      <input
        type="tel"
        id="phoneNumber"
        name="phoneNumber"
        className="w-full px-4 py-3 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
    </div>
  </div>

  {/* Newsletter Checkbox */}
  <div className="flex items-start mt-4">
    <input
      type="checkbox"
      id="newsletter"
      name="newsletter"
      className="mr-2 mt-1"
    />
    <label htmlFor="newsletter" className="text-sm">
      Subscribe me to the Marketing Matters Newsletter (we promise you’ll love it!)
    </label>
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    className="mt-6 bg-blue-200 text-black px-6 py-3 w-full rounded hover:bg-blue-300 transition duration-300"
  >
    SUBMIT
  </button>
</form>

</section>

<footer className="bg-white p-4 text-center mt-8">
  <div className="flex justify-center space-x-4">
    <a href="#" className="text-blue-500 hover:text-blue-700">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 12c-2.76 0-8-1.24-8-4s5.24-4 8-4 8 1.24 8 4-5.24 4-8 4z" />
      </svg>
    </a>
    <a href="#" className="text-red-500 hover:text-red-700">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </a>
    <a href="#" className="text-blue-500 hover:text-blue-700">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" />
      </svg>
    </a>
  </div>
</footer>
    </div>

  );
};


export default function Home() {
  return (
    <div className="bg-white text-gray-800">
      {/* Header */}
      <header className="bg-blue-600 text-white flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-bold">PressPass</h1>
        <a href="#" className="text-sm underline">Login</a>
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


