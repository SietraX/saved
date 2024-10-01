# SAVED - Advanced YouTube Video Search and Collection Manager
<img width="50" src="https://github.com/user-attachments/assets/164837a9-924b-4511-bd10-4b2b3ef6f11e" alt="SAVED" title="SAVED"/> 

## Project Overview

SAVED is a web application designed to help users manage, organize, and search their YouTube collections. The platform allows users to create custom collections, clone YouTube playlists, and efficiently manage their video content across different categories. With its advanced search functionality, users can find specific moments within videos based on keywords.

## Key Features

- Advanced keyword search across video transcripts
- Custom collection creation and management
- YouTube playlist cloning
- Video transcript fetching and storage
- User authentication with Google
- Responsive design for various devices

## 🛠 Tech Stack

<div>
	<img width="50" src="https://user-images.githubusercontent.com/25181517/183890598-19a0ac2d-e88a-4005-a8df-1ee36782fde1.png" alt="TypeScript" title="TypeScript"/>
	<img width="50" src="https://user-images.githubusercontent.com/25181517/183897015-94a058a6-b86e-4e42-a37f-bf92061753e5.png" alt="React" title="React"/>
	<img width="50" src="https://github.com/marwin1991/profile-technology-icons/assets/136815194/5f8c622c-c217-4649-b0a9-7e0ee24bd704" alt="Next.js" title="Next.js"/>
	<img width="50" src="https://github.com/user-attachments/assets/e40fc76b-c8d8-47c3-bb53-c7795abaf596" alt="Supabase" title="Supabase"/>
	<img width="50" src="https://user-images.githubusercontent.com/25181517/202896760-337261ed-ee92-4979-84c4-d4b829c7355d.png" alt="Tailwind CSS" title="Tailwind CSS"/>
	<img width="50" src="https://github.com/user-attachments/assets/e4bd419a-2a4a-459a-ba9a-d3324e693c4d" alt="ShadCn UI" title="ShadCn UI"/>
</div>

- **Frontend**: TypeScript, React 18, Next.js 14
- **Backend**: Next.js API Routes, Python (FastAPI)
- **Database**: Supabase
- **Authentication**: NextAuth.js with Google provider
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Hooks and Context API

## 📚 Libraries and Tools

<div>
  <img width="50" src="https://github.com/user-attachments/assets/e40fc76b-c8d8-47c3-bb53-c7795abaf596" alt="Supabase" title="Supabase"/>
  <img width="50" height="50" src="https://github.com/user-attachments/assets/b94e49e7-bfa4-4de4-afca-61db0ba40e38" alt="Radix UI Icon" title="Radix UI" />
  <img width="50" height="50" src="https://github.com/user-attachments/assets/2e8972d6-e639-4a7e-80a0-08ed304160be" alt="date-fns Icon" title="date-fns" />
</div>

- **User authentication**: next-auth
- **Database interactions**: @supabase/supabase-js
- **UI components**: @radix-ui/react-*, shadcn/ui
- **Form handling**: react-hook-form
- **Data fetching**: SWR
- **YouTube API**: googleapis
- **Drag and drop**: @hello-pangea/dnd

## Advanced Search Feature

SAVED's core functionality is its advanced search capability. Users can enter keywords to search across their entire video collection, including:

- Video titles
- Video descriptions
- Transcripts (if available)

The search results display:
- Relevant video thumbnails
- Timestamps where the keyword was found in the transcript
- A brief context snippet around the keyword

Users can click on a timestamp to jump directly to that moment in the video, making it easy to find specific content within long videos or across multiple videos in their collection.

## Pages

### Welcome Screen
![Welcome Screen](path_to_welcome_screen_screenshot)

The landing page introduces users to the SAVED platform. It displays a welcome message and provides options to sign in with Google or access collections for authenticated users.

### Saved Collections
![Saved Collections](path_to_saved_collections_screenshot)

This page displays the user's custom collections. Users can:
- View all their created collections
- Create new collections
- Edit existing collections
- Delete collections
- Reorder collections
- Access the advanced search functionality

### YouTube Collections
![YouTube Collections](path_to_youtube_collections_screenshot)

This page provides a tabbed interface for managing various YouTube content:

1. **Playlists Tab**
   - Displays the user's YouTube playlists
   - Allows cloning of playlists to saved collections
   - Provides playlist information and video counts

2. **Liked Videos Tab**
   - Shows videos the user has liked on YouTube
   - Allows adding liked videos to saved collections

3. **Watch Later Tab**
   - Displays videos added to the user's Watch Later list
   - Enables adding these videos to saved collections

### Playlist View
![Playlist View](path_to_playlist_view_screenshot)

When a user selects a specific playlist, this page shows:
- List of videos in the playlist
- Options to add individual videos to saved collections
- Basic video information (title, thumbnail, etc.)

### Advanced Search
![Advanced Search](path_to_advanced_search_screenshot)

The advanced search feature allows users to:
- Search across all their collections or select specific ones
- Find videos by title, description, or transcript content
- View search results with relevant timestamps
- Jump directly to specific moments in videos based on search results

### Collection Details
![Collection Details](path_to_collection_details_screenshot)

This page shows the contents of a specific saved collection:
- List of videos in the collection
- Options to remove videos from the collection
- Ability to play videos directly from this page

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Python (v3.7 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/saved.git
   cd saved
   ```

2. Install frontend dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory and add the necessary environment variables (Supabase, Google OAuth, etc.)

4. Run the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Set up the Python backend
   ```
   cd python_backend
   python -m venv venv
   venv/Scripts/activate  # On Windows
   source venv/bin/activate  # On macOS/Linux
   pip install -r requirements.txt
   ```

6. Run the FastAPI server
   ```
   python transcript_server.py
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js app directory
  - `(protected)/`: Routes that require authentication
  - `(public)/`: Public routes
  - `api/`: API routes
- `components/`: React components
- `hooks/`: Custom React hooks
- `lib/`: Utility functions and shared code
- `types/`: TypeScript type definitions
- `python_backend/`: Python FastAPI server for transcript handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
