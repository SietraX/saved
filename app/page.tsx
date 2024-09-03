import { Navigation } from '@/components/navigation';
import { Playlists } from '@/components/playlists';

const Home = () => {
  return (
    <main>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Welcome to YouTube Collections
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Playlists />
          {/* We'll add more components here later */}
        </div>
      </div>
    </main>
  )
}

export default Home