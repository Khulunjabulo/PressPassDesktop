import React from "react";

// Custom SVG Icons
const GlobeIcon = () => (
  <svg fill="#000000" width="80px" height="80px" viewBox="-1 0 19 19" xmlns="http://www.w3.org/2000/svg" class="cf-icon-svg"><path d="M16.417 9.57a7.917 7.917 0 1 1-8.144-7.908 1.758 1.758 0 0 1 .451 0 7.913 7.913 0 0 1 7.693 7.907zM5.85 15.838q.254.107.515.193a11.772 11.772 0 0 1-1.572-5.92h-3.08a6.816 6.816 0 0 0 4.137 5.727zM2.226 6.922a6.727 6.727 0 0 0-.511 2.082h3.078a11.83 11.83 0 0 1 1.55-5.89q-.249.083-.493.186a6.834 6.834 0 0 0-3.624 3.622zm8.87 2.082a14.405 14.405 0 0 0-.261-2.31 9.847 9.847 0 0 0-.713-2.26c-.447-.952-1.009-1.573-1.497-1.667a8.468 8.468 0 0 0-.253 0c-.488.094-1.05.715-1.497 1.668a9.847 9.847 0 0 0-.712 2.26 14.404 14.404 0 0 0-.261 2.309zm-.974 5.676a9.844 9.844 0 0 0 .713-2.26 14.413 14.413 0 0 0 .26-2.309H5.903a14.412 14.412 0 0 0 .261 2.31 9.844 9.844 0 0 0 .712 2.259c.487 1.036 1.109 1.68 1.624 1.68s1.137-.644 1.623-1.68zm4.652-2.462a6.737 6.737 0 0 0 .513-2.107h-3.082a11.77 11.77 0 0 1-1.572 5.922q.261-.086.517-.194a6.834 6.834 0 0 0 3.624-3.621zM11.15 3.3a6.82 6.82 0 0 0-.496-.187 11.828 11.828 0 0 1 1.55 5.89h3.081A6.815 6.815 0 0 0 11.15 3.3z"/></svg>
);

const MoneyBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" />
  </svg>
);

const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-18c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M19 20H5a2 2 0 0 1-2-2V6c0-1.103.897-2 2-2h14c1.103 0 2 .897 2 2v12a2 2 0 0 1-2 2zM5 6h14V4H5v2zm0 14h14v-2H5v2z" />
  </svg>
);

const MonitorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
  </svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M19 13H5v-2h14v2zm0-6H5v2h14V7zm0 10H5v-2h14v2z" />
  </svg>
);

const App = () => {
  return (
    <div className="bg-white text-black min-h-screen font-sans">
      {/* Header */}
      <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <img src="/public/" alt="Logo" className="h-10" />
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
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
            </svg>
            Favorite
          </button>
          <button className="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
            </svg>
            Classified
          </button>
          <button className="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
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
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300">
              LOGIN
            </button>
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0">
            <img src="https://placehold.co/600x400 " alt="Hero Image" className="w-full rounded-lg" />
          </div>
        </section>

        {/* Why Use Digital Advertising */}
        <section className="mb-8">
          <h2 className="text-3xl text-center font-bold mb-4">Why Use Digital Advertising?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <img src="https://placehold.co/600x400 " alt="Device Mockup 1" className="w-full md:w-1/3 rounded-lg" />
            {/* <img src="https://placehold.co/600x400 " alt="Device Mockup 2" className="w-full md:w-1/3 rounded-lg" /> */}
            {/* <img src="https://placehold.co/600x400 " alt="Device Mockup 3" className="w-full md:w-1/3 rounded-lg" /> */}
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
          <img src="https://placehold.co/600x400 " alt="Workflow Image" className="w-full rounded-lg mb-4" />
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
    <img src="https://placehold.co/100x50 " alt="Press-Pass Logo" className="mx-auto mb-4" />
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

export default App;