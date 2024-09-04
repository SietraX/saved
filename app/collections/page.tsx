import Link from "next/link";
import { YouTubeCollections } from "@/components/youtube-collections";

export default function CollectionsPage() {
  return (
    <main className="min-h-screen p-4">
      <YouTubeCollections />
    </main>
  );
}
