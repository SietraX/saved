'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'

export const Navigation = () => {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  return (
    <nav className="bg-gray-800 text-white p-4 mb-8">
      <ul className="flex items-center justify-between">
        <div className="flex space-x-4">
          <li>
            <Link href="/" className={pathname === '/' ? 'text-blue-500' : ''}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/playlists" className={pathname === '/playlists' ? 'text-blue-500' : ''}>
              Playlists
            </Link>
          </li>
          <li>
            <Link href="/liked-videos" className={pathname === '/liked-videos' ? 'text-blue-500' : ''}>
              Liked Videos
            </Link>
          </li>
        </div>
        <li className="flex items-center space-x-4">
          {status === 'loading' ? (
            <span>Loading...</span>
          ) : session ? (
            <>
              <span className="text-sm">{session.user?.name}</span>
              <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm">
                Sign out
              </button>
            </>
          ) : (
            <button onClick={() => signIn('google')} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-sm">
              Sign in
            </button>
          )}
        </li>
      </ul>
    </nav>
  )
}
