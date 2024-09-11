"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useYoutubePlaylists } from "@/hooks/useYoutubePlaylists";
import { useCollections } from "@/hooks/useCollections";
import { useNewCollectionInput } from "@/hooks/useNewCollectionInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Globe, Eye } from "lucide-react";
import Image from 'next/image';
import { Playlist, PrivacyStatus } from "@/types/index";

export const Playlists = () => {
	const { data: session, status } = useSession();
	const [searchTerm, setSearchTerm] = useState("");
	const router = useRouter();

	const { playlists, isLoading, error } = useYoutubePlaylists();
	const { createCollection } = useCollections();
	const {
		newCollectionName,
		updateNewCollectionName,
		handleCreateCollection,
		handleKeyDown,
	} = useNewCollectionInput(createCollection);

	const filteredPlaylists = playlists?.filter((playlist) =>
		playlist.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
	) || [];

	const handlePlaylistClick = (playlistId: string) => {
		router.push(`/playlists/${playlistId}`);
	};

	const getPrivacyIcon = (status: PrivacyStatus) => {
		switch (status) {
			case "private":
				return <Lock className="w-4 h-4" />;
			case "unlisted":
				return <Eye className="w-4 h-4" />;
			case "public":
				return <Globe className="w-4 h-4" />;
		}
	};

	if (status === "loading" || isLoading) return <div>Loading...</div>;
	if (error) return <div>Error loading playlists: {error.message}</div>;
	if (!playlists) return <div>No playlists found.</div>;

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Your Playlists</h1>
			<Input
				type="text"
				placeholder="Search playlists..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="mb-4"
			/>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
				{filteredPlaylists.map((playlist) => (
					<Card
						key={playlist.id}
						className="youtube-card cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
						onClick={() => handlePlaylistClick(playlist.id)}
					>
						<div className="relative aspect-video">
							<Image
								src={playlist.snippet.thumbnails.medium.url}
								alt={playlist.snippet.title}
								layout="fill"
								objectFit="cover"
								className="rounded-t-lg"
							/>
							<div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
								{playlist.contentDetails.itemCount} videos
							</div>
						</div>
						<CardContent className="youtube-card-content flex-grow">
							<h3 className="youtube-card-title">{playlist.snippet.title}</h3>
							<div className="youtube-card-privacy">
								{getPrivacyIcon(playlist.status.privacyStatus)}
								<span className="ml-1 capitalize">{playlist.status.privacyStatus}</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};
