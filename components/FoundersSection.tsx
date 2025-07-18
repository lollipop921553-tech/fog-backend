import React from 'react';
import { TwitterIcon, LinkedInIcon } from './Icons';

const FoundersSection: React.FC = () => {
  return (
    <section>
      <h2 className="text-3xl font-bold text-center text-fog-dark dark:text-fog-light">Meet the Founders</h2>
      <p className="text-center mt-2 text-fog-mid dark:text-slate-400 max-w-2xl mx-auto">The visionaries behind the FOG platform.</p>
      <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Founder - Ruh Ul Hassnain */}
        <div className="bg-fog-white dark:bg-fog-mid-dark p-8 rounded-xl shadow-lg dark:shadow-lg-dark text-center transition-all duration-300 hover:shadow-xl dark:hover:shadow-xl-dark hover:-translate-y-1">
          <img
            className="h-24 w-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-fog-accent/20"
            src="https://img.freepik.com/premium-photo/3d-cartoon-avatar_113255-5627.jpg"
            alt="Avatar of Ruh Ul Hassnain"
          />
          <h3 className="font-semibold text-xl text-fog-dark dark:text-fog-light">Ruh Ul Hassnain</h3>
          <p className="text-fog-accent text-sm font-bold uppercase tracking-wider">Founder & Visionary</p>
          <p className="text-gray-600 dark:text-gray-400 mt-4 italic">
            "We're building more than a platform; we're building a new paradigm for productivity and opportunity. My vision is to break down barriers, one task at a time."
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-fog-accent"><TwitterIcon /></a>
            <a href="#" className="text-gray-400 hover:text-fog-accent"><LinkedInIcon /></a>
          </div>
        </div>

        {/* Co-Founder - Alishba Sundas */}
        <div className="bg-fog-white dark:bg-fog-mid-dark p-8 rounded-xl shadow-lg dark:shadow-lg-dark text-center transition-all duration-300 hover:shadow-xl dark:hover:shadow-xl-dark hover:-translate-y-1">
          <img
            className="h-24 w-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-fog-secondary/20"
            src="https://tse3.mm.bing.net/th/id/OIP.vWfqvQec842YOXUdCocW-QHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
            alt="Avatar of Alishba Sundas"
          />
          <h3 className="font-semibold text-xl text-fog-dark dark:text-fog-light">Alishba Sundas</h3>
          <p className="text-fog-secondary text-sm font-bold uppercase tracking-wider">Co-founder & CTO</p>
          <p className="text-gray-600 dark:text-gray-400 mt-4 italic">
            "Our focus is on leveraging technology to create a seamless, efficient, and trustworthy experience for every user."
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-fog-secondary"><TwitterIcon /></a>
            <a href="#" className="text-gray-400 hover:text-fog-secondary"><LinkedInIcon /></a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundersSection;
