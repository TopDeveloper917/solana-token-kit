'use client';

import LandingHeader from '@/components/LandingHeader/LandingHeader';
import HotTokens from '@/components/HotTokens/HotTokens';
import DiscoverTokens from '@/components/DiscoverTokens/DiscoverTokens';


export default function Home() {
  
  return (
    <main className='w-full min-w-[100vw] h-full min-h-screen bg-secondary-300'>
      <LandingHeader />
      <HotTokens />
      <DiscoverTokens />
    </main>
  );
}
