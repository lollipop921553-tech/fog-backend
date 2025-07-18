import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon, CheckBadgeIcon } from '../components/Icons';
import BackButton from '../components/BackButton';
import FoundersSection from '../components/FoundersSection';

const AboutPage: React.FC = () => {
  const values = [
    { name: 'Productivity', description: 'We are laser-focused on creating a platform that enables efficient, meaningful work without distractions.' },
    { name: 'Opportunity', description: 'We believe talent is universal, and we are committed to breaking down geographical and economic barriers.' },
    { name: 'Trust', description: 'We build our community on a foundation of security, transparency, and verified professionals.' },
    { name: 'Innovation', description: 'We continuously leverage technology to create a seamless and powerful user experience.' },
  ];

  return (
    <div className="animate-fade-in space-y-20">
      <BackButton />
      {/* Hero Section */}
      <section className="text-center py-16 bg-fog-white dark:bg-fog-mid-dark rounded-2xl shadow-lg dark:shadow-2xl-dark">
        <h1 className="text-4xl md:text-5xl font-extrabold text-fog-dark dark:text-fog-light tracking-tight">
          Building the Future of Work.
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-fog-mid dark:text-slate-400">
          FOG was born from a simple idea: to create a single, serious platform that empowers professionals to connect, collaborate, and achieve their goals, whether they're digital nomads or local experts.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="p-8 bg-gradient-to-br from-fog-accent to-blue-700 rounded-xl text-white">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="mt-4 text-lg text-blue-100">
            To create a global ecosystem where productivity is seamless and opportunity is accessible to every professional, regardless of their location or specialty. We connect digital talent with global needs and local experts with community tasks.
          </p>
        </div>
        <div className="p-8">
          <h2 className="text-3xl font-bold text-fog-dark dark:text-fog-light">Our Vision</h2>
          <p className="mt-4 text-lg text-fog-mid dark:text-slate-400">
            To be the world's most trusted and efficient platform for freelance and on-demand work, fostering a community built on skill, reliability, and mutual success.
          </p>
        </div>
      </section>

       {/* Values Section */}
      <section>
        <h2 className="text-3xl font-bold text-center text-fog-dark dark:text-fog-light">Our Core Values</h2>
        <p className="text-center mt-2 text-fog-mid dark:text-slate-400 max-w-2xl mx-auto">The principles that guide every decision we make.</p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value) => (
            <div key={value.name} className="bg-fog-white dark:bg-fog-mid-dark p-6 rounded-lg shadow-md dark:shadow-lg-dark text-center">
              <h3 className="text-xl font-bold text-fog-accent mb-2">{value.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <FoundersSection />

      {/* Join Us CTA */}
      <section className="text-center">
        <h2 className="text-3xl font-bold text-fog-dark dark:text-fog-light">Join Our Community</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-fog-mid dark:text-slate-400">
          Ready to be part of the future of work? Whether you're looking to hire, work, or earn, your journey starts here.
        </p>
        <div className="mt-8 flex justify-center flex-wrap gap-4">
          <Link to="/post-job" className="px-8 py-3 bg-fog-accent text-white font-semibold rounded-lg shadow-md hover:bg-fog-accent-hover transition-transform transform hover:scale-105">
            Become a Client
          </Link>
          <Link to="/freelance" className="px-8 py-3 bg-fog-secondary text-white font-semibold rounded-lg shadow-md hover:bg-fog-secondary-hover transition-transform transform hover:scale-105">
            Become a Professional
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;