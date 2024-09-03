'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export const Navigation = () => {
  const { data: session } = useSession()

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/playlists">Playlists</Link></li>
        <li><Link href="/liked-videos">Liked Videos</Link></li>
        <li><Link href="/watch-later">Watch Later</Link></li>
        {session ? (
          <li><button onClick={() => signOut()}>Sign Out</button></li>
        ) : (
          <li><button onClick={() => signIn('google')}>Sign In</button></li>
        )}
      </ul>
    </nav>
  )
}
