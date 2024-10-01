# SAVED - Advanced YouTube Video Search and Collection Manager

![SAVED Logo](path_to_logo_image)

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

## Getting Started

[... rest of the Getting Started section remains the same ...]

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