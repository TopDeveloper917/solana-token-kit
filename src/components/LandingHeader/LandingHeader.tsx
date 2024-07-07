import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import ConnectButton from './ConnectButton'
import { usePathname } from 'next/navigation'
export default function LandingHeader() {
    const pathname = usePathname()
    const [pathName, setPathName] = React.useState('');
    React.useEffect(() => {
      if (pathname) {
        setPathName(pathname);
      }
    }, [pathname])
    return (
        <div className='w-full fixed top-0 z-20'>
            <div className='px-5 md:px-[100px] py-4 md:py-6 bg-secondary-200 flex flex-col items-center justify-center w-full '>
                <div className='max-w-[1440px] w-full flex justify-between items-center'>
                    <Link href='/'>
                    <Image
                        src='/icons/logo.svg'
                        alt='Logo Icon'
                        width={300}
                        height={30}
                    />
                    </Link>
                    <div className='hidden md:flex text-xs lg:text-sm xl:text-base items-center text-[white] font-semibold'>
                        <Link href='/create-token' className={` ${pathName == '/create-token' && 'text-primary-200'} py-2 px-2 xl:px-4 hover:text-primary-200`}>
                            Create Token
                        </Link>
                        <Link href='my-token' className={` ${pathName == '/my-token' && 'text-primary-200'} py-2 px-2 xl:px-4 hover:text-primary-200`}>
                            My Tokens
                        </Link>
                        <Link href='/' className={` ${pathName == '/hot-token' && 'text-primary-200'} py-2 px-2 xl:px-4 hover:text-primary-200`}>
                            Hot Tokens
                        </Link>
                        <Link href='/#contact' className={` ${pathName == '/contact' && 'text-primary-200'} py-2 px-2 xl:px-4 hover:text-primary-200`}>
                            Contact
                        </Link>
                    </div>
                    <div className='flex items-center gap-2 lg:gap-4'>
                        <div className='hidden lg:flex items-center gap-2 lg:gap-4'>
                            <Link href='https://x.com/'>
                                <Image
                                    src='/icons/twitter.svg'
                                    alt='twitter'
                                    width={22}
                                    height={22}
                                />
                            </Link>
                            <Link href='https://t.me/swordmaster917'>
                                <Image
                                    src='/icons/Telegram.svg'
                                    alt='telegram'
                                    width={24}
                                    height={24}
                                />
                            </Link>
                            <Link href='https://discord.gg/'>
                                <Image
                                    src='/icons/discord.svg'
                                    alt='discord'
                                    width={24}
                                    height={24}
                                />
                            </Link>
                        </div>
                        <ConnectButton />
                    </div >
                </div >
            </div >
        </div>
    )
}
