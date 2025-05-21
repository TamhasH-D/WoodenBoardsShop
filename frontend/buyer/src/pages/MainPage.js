import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion from framer-motion

const MainPage = () => {
  return (
    <div className="px-4 md:px-10 lg:px-20 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
        <div className="@container">
          <div className="@[480px]:p-4">
            {/* Add animation to the main hero section */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex min-h-[500px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-6 md:p-10 lg:p-16"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAePzpge8WfokyOKoaXIelzaRq22c36reLuRHDyVEWUm6xbaAHn3MpfgVkrCeUpGV_z3v7e0wAV4HcYdH5D15iGOHAcxvqIRJe-TRtG9JNuDlhEX8RX1MM_gOAa074BFk1vZe0FhSDt5pI2cm7_5cuzJP7Wdz1AiWc4-GJ9h_stuyTB8l8ivZQjnGVBNgmePB3SXy0BJ516zIF62Ckmins3yQ1wQq6P9oDCmCezhQqoTFoDbyXcYnDVB4QCTJ5DZSMTCFPoQ2aRDKQ")',
              }}
            >
              <div className="flex flex-col gap-4 text-center max-w-3xl">
                {/* Add animation to the main heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                  className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-[-0.03em]"
                >
                  Quality Wood Products for Every Project
                </motion.h1>
                {/* Add animation to the subheading */}
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                  className="text-gray-200 text-base md:text-lg font-light leading-relaxed"
                >
                  Explore our extensive selection of pallets and boards, perfect for construction, DIY projects, and more. We offer durable, sustainable wood solutions to meet your needs.
                </motion.h2>
              </div>
              {/* Add animation to the button */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
              >
                <Link to="/products" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-amber-400 hover:bg-amber-500 transition duration-300 ease-in-out shadow-lg">
                  <span className="truncate">Browse Products</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        {/* Add animation to the Featured Products section heading */}
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
          className="text-white text-3xl font-bold leading-tight tracking-[-0.015em] px-4 md:px-0 pb-3 pt-10"
        >
          Featured Products
        </motion.h2>
        <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&amp;::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch p-4 gap-6">
            {/* Add animation to each featured product item */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
              className="flex h-full flex-col gap-4 rounded-lg min-w-[280px] bg-gray-800 shadow-lg overflow-hidden"
            >
              <div
                className="w-full bg-center bg-no-repeat aspect-video bg-cover flex flex-col"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuArRFz35APORjoHQqSXJ3cQk9guq8ShuzSQ-YTmWXj75dBCCJg8QekBk7ZruaQ-W_e7AvKwfuYGoDXA VEpLDPGZ27kYPSz2sKw3wiOQ9D2WfNCAzIk6HbUTHblR8_R61KIxbntiJyUw9vnOjA22r49bG01YEgpH5yQJxI0xGcoD9sJrVvkmUI1xayrzorEd08SPf1EP5ivk-ydZeeh7UQW91HKgJuukthNX2Avz7Hd5mQtv3R0XKDJfbRzDF89hyfjNdr4fBsOASE")',
                }}
              ></div>
              <div className="p-4">
                <p className="text-white text-lg font-semibold leading-tight">Standard Pallets</p>
                <p className="text-gray-400 text-sm font-normal leading-normal mt-1">Durable and versatile pallets for various applications.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
              className="flex h-full flex-col gap-4 rounded-lg min-w-[280px] bg-gray-800 shadow-lg overflow-hidden"
            >
              <div
                className="w-full bg-center bg-no-repeat aspect-video bg-cover flex flex-col"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDx_uWSlmVjWOxAQr7HZvFl5YdnEY17GMM4OdJPtMqsyTT4pcn8WfGCRl2BDHldPCsK9puQjDeb_mggyjDMNuAoEDeiUc93PYc2IH_-4GHlpXml9JCIR28jzbznXaEt33FfEWw1-MB4qfmb6D0Vx7slOSySM_KttWAPoO8gfliTbb75GVnotfqRXaWl4go20YzYF4XW90tVAZKCdS0AbY0cVk6DLs_zFi9VNjA_HFXOBaRHlg2jGA9wXyoPfA-us1XkiJ-4UXss49M")',
                }}
              ></div>
              <div className="p-4">
                <p className="text-white text-lg font-semibold leading-tight">Premium Boards</p>
                <p className="text-gray-400 text-sm font-normal leading-normal mt-1">High-quality boards for furniture, flooring, and more.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 1.4 }}
              className="flex h-full flex-col gap-4 rounded-lg min-w-[280px] bg-gray-800 shadow-lg overflow-hidden"
            >
              <div
                className="w-full bg-center bg-no-repeat aspect-video bg-cover flex flex-col"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAHf_11g6Rq5aIdBMHp4JJXdCO9_FE1jI2YvDNheoMYHdSGE8-FH9jD8x7RsdhD6hLrr4CXod03bs7OEF4Je4lESlpv-tl5MVBOFKzUONDeCUUB4mYvHErj9diY-qJ6medbcqiea4sDskvKS9AFEBu7I")',
                }}
              ></div>
              <div className="p-4">
                <p className="text-white text-lg font-semibold leading-tight">Structural Beams</p>
                <p className="text-gray-400 text-sm font-normal leading-normal mt-1">Strong and reliable beams for construction projects.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 1.6 }}
              className="flex h-full flex-col gap-4 rounded-lg min-w-[280px] bg-gray-800 shadow-lg overflow-hidden"
            >
              <div
                className="w-full bg-center bg-no-repeat aspect-video bg-cover flex flex-col"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAHf_11g6Rq5aIdBMHp4JJXdCO9_FE1jI2YvDNheoMYHdSGE8-FH9jD8x7RsdhD6hLrr4CXod03bs7OEF4Je4lESlpv-tl5MVBOFKzUONDeCUUB4mYvHErj9diY-qJ6medbcqiea4sDskvKS9AFEBu7I")',
                }}
              ></div>
              <div className="p-4">
                <p className="text-white text-lg font-semibold leading-tight">Custom Cuts</p>
                <p className="text-gray-400 text-sm font-normal leading-normal mt-1">Tailored wood cuts to meet your specific project requirements.</p>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Add animation to the Why Choose WoodCraft section heading */}
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.8 }}
          className="text-white text-3xl font-bold leading-tight tracking-[-0.015em] px-4 md:px-0 pb-3 pt-10"
        >
          Why Choose WoodCraft?
        </motion.h2>
        <div className="flex flex-col gap-10 px-4 md:px-0 py-10 @container">
          <div className="flex flex-col gap-4">
            {/* Add animation to the commitment heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 2, ease: "easeOut" }}
              className="text-white tracking-light text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-[-0.03em] max-w-[800px]"
            >
              Our Commitment to Quality and Service
            </motion.h1>
            {/* Add animation to the commitment text */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 2.2, ease: "easeOut" }}
              className="text-gray-300 text-base md:text-lg font-light leading-relaxed max-w-[800px]"
            >
              At WoodCraft, we are dedicated to providing top-quality wood products and exceptional customer service. Our sustainable practices, fast delivery, and custom solutions make us the ideal choice for all your wood needs.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-0">
            {/* Add animation to each commitment item */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 2.4 }}
              className="flex flex-col gap-4 rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg"
            >
              <div className="text-amber-400" data-icon="Leaf" data-size="32px" data-weight="regular">
                <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M223.45,40.07a8,8,0,0,0-7.52-7.52C139.8,28.08,78.82,51,52.82,94a87.09,87.09,0,0,0-12.76,49c.57,15.92,5.21,32,13.79,47.85l-19.51,19.5a8,8,0,0,0,11.32,11.32l19.5-19.51C81,210.73,97.09,215.37,113,215.94q1.67.06,3.33.06A86.93,86.93,0,0,0,162,203.18C205,177.18,227.93,116.21,223.45,40.07ZM153.75,189.5c-22.75,13.78-49.68,14-76.71.77l88.63-88.62a8,8,0,0,0-11.32-11.32L65.73,179c-13.19-27-13-54,.77-76.71,22.09-36.47,74.6-56.44,141.31-54.06C210.2,114.89,190.22,167.41,153.75,189.5Z"></path>
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-white text-lg font-bold leading-tight">Sustainable Practices</h2>
                <p className="text-gray-400 text-base font-normal leading-normal">We source our wood responsibly, ensuring minimal environmental impact.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 2.6 }}
              className="flex flex-col gap-4 rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg"
            >
              <div className="text-amber-400" data-icon="Truck" data-size="32px" data-weight="regular">
                <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M247.42,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,247.42,117ZM184,88h34.58l9.6,24H184ZM24,72H168v64H24ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm81-24H103a32,32,0,0,0-62,0H24V152H168v12.31A32.11,32.11,0,0,0,153,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,184,208Zm48-24H215a32.06,32.06,0,0,0-31-24V128h48Z"></path>
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-white text-lg font-bold leading-tight">Fast Delivery</h2>
                <p className="text-gray-400 text-base font-normal leading-normal">Get your products quickly with our efficient delivery service.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 2.8 }}
              className="flex flex-col gap-4 rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg"
            >
              <div className="text-amber-400" data-icon="Ruler" data-size="32px" data-weight="regular">
                <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M235.32,73.37,182.63,20.69a16,16,0,0,0-22.63,0L20.68,160a16,16,0,0,0,0,22.63l52.69,52.68a16,16,0,0,0,22.63,0L235.32,96A16,16,0,0,0,235.32,73.37ZM84.68,224,32,171.31l32-32,26.34,26.35a8,8,0,0,0,11.32-11.32L75.31,128,96,107.31l26.34,26.35a8,8,0,0,0,11.32-11.32L107.31,96,128,75.31l26.34,26.35a8,8,0,0,0,11.32-11.32L139.31,64l32-32L224,84.69Z"></path>
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-white text-lg font-bold leading-tight">Custom Solutions</h2>
                <p className="text-gray-400 text-base font-normal leading-normal">Need something specific? We offer custom cuts and sizes to fit your project.</p>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Add animation to the Ready to Start section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 3 }}
          className="@container"
        >
          <div className="flex flex-col justify-end gap-6 px-4 md:px-10 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20 bg-gray-800 rounded-xl shadow-lg">
            <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
              {/* Add animation to the heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 3.2, ease: "easeOut" }}
                className="text-white tracking-light text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-[-0.03em]"
              >
                Ready to Start Your Project?
              </motion.h1>
              {/* Add animation to the text */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 3.4, ease: "easeOut" }}
                className="text-gray-300 text-base md:text-lg font-light leading-relaxed"
              >
                Contact us today for a personalized quote and expert advice on selecting the right wood products for your needs.
              </motion.p>
            </div>
            {/* Add animation to the button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 3.6, ease: "easeOut" }}
              className="flex flex-1 justify-center"
            >
              <div className="flex justify-center">
                <button className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-amber-400 hover:bg-amber-500 transition duration-300 ease-in-out shadow-lg">
                  <span className="truncate">Get a Quote</span>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
    </div>
  );
};

export default MainPage;