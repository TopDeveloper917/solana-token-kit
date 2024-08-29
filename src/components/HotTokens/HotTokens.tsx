import React from 'react'
import HotTokensComp from './HotTokensComp'
import BigShadow from './BigShadow'
import RightDecor from './RightDecor'
import LeftShadow from './LeftShadow'
import { fetchHotCollections } from '../../utils/fetchData';
import { useWallet } from '@solana/wallet-adapter-react';

export default function HotTokens() {
    const wallet = useWallet()
    const [hottestData, setHottestData] = React.useState<any[]>();
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await fetchHotCollections(wallet.publicKey);
                setHottestData(data);
                setIsLoading(false);
                console.log(data, 'data>>><<<<>>><<<hottest')
                // Handle the data as needed
            } catch (error) {
                // Handle error
                console.error('Error fetching data in component:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className='w-full px-6 md:px-[100px] py-6 md:py-[50px] mt-[68px] md:mt-[80px] flex items-center justify-center' >
            {(!isLoading) && (hottestData?.length) && (
                <LeftShadow />
            )}
            {(!isLoading) && (hottestData?.length) && (
                <BigShadow />
            )}
            {(!isLoading) && (hottestData?.length) && (
                <RightDecor />
            )}

            <div className='w-full max-w-[1440px] flex flex-col gap-8 md:gap-[60px] z-10'>
                <div className=' capitalize font-semibold text-5xl md:text-[56px] text-white leading-[80px]'>
                    hot tokens 🔥<br />in the market
                </div>
                {
                    (!isLoading) && (hottestData?.length) && (
                        <div className=' grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6'>
                            {hottestData.slice(0, 12).map((item, index) => (
                                <div key={index}>
                                    <HotTokensComp no={index + 1} title={item.content.metadata.name} imgUrl={item.content.links.image} mintNumber={item.token_info.supply} key={index} />
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
    )
}
