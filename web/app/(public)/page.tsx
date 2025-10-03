import { Pointer, TruckElectric, Wrench, Github } from 'lucide-react';
import { ContainerTextFlip } from '@/components/aceternity/container-text-flip';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function Home() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  // If user is authenticated, redirect to stage
  if (session?.user) {
    redirect('/stage');
  }
  return (
    <>
      <section className='h-full w-screen overflow-hidden'>
        <div className='container border-b border-t border-dashed'>
          <div className='relative flex w-full max-w-5xl flex-col justify-start border border-t-0 border-dashed px-5 py-12 md:items-center md:justify-center lg:mx-auto'>
            <p className='text-muted-foreground flex items-center gap-2 text-sm'>
              <span className='inline-block size-2 rounded bg-green-500' />
              NEW CONCEPTS EVERY WEEK
            </p>
            <div className='mb-7 mt-3 w-full max-w-xl text-5xl font-semibold tracking-tighter md:mb-10 md:text-center md:text-6xl lg:relative lg:mb-0 lg:text-left lg:text-7xl'>
              <h1 className='relative z-10 inline md:mr-3'>
                Recompose helps <br className='block md:hidden' /> Build Better{' '}
                <br className='block md:hidden' />
              </h1>
              <ContainerTextFlip
                className='absolute text-4xl font-semibold tracking-tighter md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:text-5xl lg:-bottom-4 lg:left-auto lg:translate-x-0 lg:text-7xl'
                words={['MVPs', 'Concepts', 'Context', 'Projects', 'Revisions']}
              />
            </div>
          </div>
          <div className='mx-auto flex w-full max-w-5xl flex-col items-center justify-center border border-b-0 border-t-0 border-dashed py-20'>
            <div className='w-full max-w-2xl space-y-5 md:text-center'>
              <p className='text-muted-foreground px-5 lg:text-lg'>
                Recompose helps early-stage builders (vibecoders included) stick
                fullstack web development to memory by writing code not prompts,
                steal and resuse these snippets into your own projects or feed
                it as a context to AI, customize, build and extend your snippets
                library for next big thing.
              </p>
              <a
                href='https://github.com/recompose-ai/recompose'
                target='_blank'
                rel='noopener noreferrer'
                className='mx-5 inline-flex h-12 items-center rounded-lg px-4 py-2 bg-gray-800 text-white'
              >
                <Github className='size-4 mr-2' />
                Show me the Repo now!
              </a>
            </div>
          </div>
          <ul className='md:h-34 mx-auto grid h-44 w-full max-w-5xl grid-cols-1 border border-b-0 border-dashed md:grid-cols-2 lg:h-24 lg:grid-cols-3'>
            <li className='flex h-full items-center justify-between gap-10 px-5 md:gap-3 lg:justify-center'>
              <div className='bg-muted flex size-12 items-center justify-center rounded-lg'>
                <Pointer className='text-muted-foreground size-6' />
              </div>
              <p className='text-muted-foreground text-lg'>Learn by Doing</p>
            </li>
            <li className='flex h-full items-center justify-between gap-10 border-l border-t border-dashed px-5 md:gap-3 lg:justify-center lg:border-t-0'>
              <div className='bg-muted flex size-12 items-center justify-center rounded-lg'>
                <TruckElectric className='text-muted-foreground size-6' />
              </div>
              <p className='text-muted-foreground text-lg'>Reuse & Ship Fast</p>
            </li>
            <li className='col-span-1 flex h-full items-center justify-between gap-10 border-l border-t border-dashed px-5 md:col-span-2 md:justify-center md:gap-3 lg:col-span-1 lg:border-t-0'>
              <div className='bg-muted flex size-12 items-center justify-center rounded-lg'>
                <Wrench className='text-muted-foreground size-6' />
              </div>
              <p className='text-muted-foreground text-lg'>
                Extend & Customize
              </p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
