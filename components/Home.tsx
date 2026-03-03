import Navbar from './Navbar';
import Hero from './Hero';
import ResourceSection from './ResourceSection';
import CategorySection from './CategorySection';
import Footer from './Footer';
import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main>
                <Hero />
                <ResourceSection />
                <CategorySection />
            </main>
            <Footer />
        </div>
    );
};

export default Home;
