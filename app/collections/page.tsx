import Link from "next/link";
import { YouTubeCollections } from "@/components/youtube-collections";

export default function CollectionsPage() {
  return (
    <main className="min-h-screen p-4">
      <YouTubeCollections />
      <Link href="/saved-collections" className="text-blue-500 hover:underline mb-4 block">
        View Saved Collections
      </Link>
    </main>
  );
}
