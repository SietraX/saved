from fastapi import FastAPI, HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from googleapiclient.discovery import build
from datetime import datetime
from isodate import parse_duration
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

# Add these debug logs
logger.debug(f"NEXT_PUBLIC_SUPABASE_URL: {os.getenv('NEXT_PUBLIC_SUPABASE_URL')}")
logger.debug(f"SUPABASE_SERVICE_ROLE_KEY: {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}")

app = FastAPI()

# Supabase client initialization
supabase: Client = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# YouTube API client initialization
youtube = build('youtube', 'v3', developerKey=os.getenv("YOUTUBE_API_KEY"))

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this to your Next.js app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/transcript/{video_id}")
async def get_transcript(video_id: str):
    try:
        # Check if transcript exists in Supabase
        result = supabase.table("video_transcripts").select("*").eq("video_id", video_id).execute()
        
        if result.data:
            # Update fetch count and last_fetched
            supabase.table("video_transcripts").update({
                "fetch_count": result.data[0]["fetch_count"] + 1,
                "last_fetched": datetime.utcnow().isoformat()
            }).eq("video_id", video_id).execute()
            return {"transcript": result.data[0]["transcript"]}
        
        # If not, fetch from YouTube and store in Supabase
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        formatted_transcript = [
            {
                "text": entry["text"],
                "start": entry["start"],
                "duration": entry["duration"]
            }
            for entry in transcript
        ]
        
        # Fetch video details from YouTube API
        video_response = youtube.videos().list(
            part="snippet,contentDetails",
            id=video_id
        ).execute()

        video_info = video_response['items'][0]
        
        # Parse duration to seconds
        duration_iso = video_info['contentDetails']['duration']
        duration_seconds = int(parse_duration(duration_iso).total_seconds())
        
        # Store in Supabase
        supabase.table("video_transcripts").insert({
            "video_id": video_id,
            "transcript": formatted_transcript,
            "title": video_info['snippet']['title'],
            "channel_id": video_info['snippet']['channelId'],
            "channel_title": video_info['snippet']['channelTitle'],
            "published_at": video_info['snippet']['publishedAt'],
            "language": video_info['snippet'].get('defaultAudioLanguage', 'unknown'),
            "is_generated": True,  # Assuming all fetched transcripts are auto-generated
            "duration": duration_seconds,
            "fetch_count": 1,
            "last_fetched": datetime.utcnow().isoformat(),
            "processing_status": "completed"
        }).execute()
        
        return {"transcript": formatted_transcript}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)