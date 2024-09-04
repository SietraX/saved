import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const WatchLater = () => {
  const { data: session } = useSession();

  if (!session) {
    return <div>Please sign in to view your Watch Later list.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Watch Later</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Watch Later List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Due to YouTube API limitations, we can't display your Watch Later
            videos here. However, you can access them directly on YouTube.
          </p>
          <Button
            onClick={() =>
              window.open("https://www.youtube.com/playlist?list=WL", "_blank")
            }
          >
            View on YouTube
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
