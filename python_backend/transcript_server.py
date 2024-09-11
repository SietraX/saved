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
            return {"transcript": result.data[0]["transcript"], "status": "existing"}
        
        # If not, fetch from YouTube and store in Supabase
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to get English transcript first
            try:
                transcript = transcript_list.find_transcript(['en'])
            except:
                # If English is not available, get any available transcript
                transcript = next(iter(transcript_list._manually_created_transcripts.values())) or next(iter(transcript_list._generated_transcripts.values()))
            
            # If still no transcript, raise an exception
            if not transcript:
                raise Exception("No transcript available for this video")
            
            formatted_transcript = [
                {
                    "text": entry["text"],
                    "start": entry["start"],
                    "duration": entry["duration"]
                }
                for entry in transcript.fetch()
            ]
        except Exception as youtube_error:
            logger.error(f"Error fetching transcript from YouTube: {str(youtube_error)}")
            raise HTTPException(status_code=404, detail=f"Transcript not found for video ID: {video_id}")

        # Fetch video details from YouTube API
        try:
            video_response = youtube.videos().list(
                part="snippet,contentDetails",
                id=video_id
            ).execute()

            if not video_response.get('items'):
                raise HTTPException(status_code=404, detail=f"Video not found for ID: {video_id}")

            video_info = video_response['items'][0]
        except Exception as youtube_api_error:
            logger.error(f"Error fetching video details from YouTube API: {str(youtube_api_error)}")
            raise HTTPException(status_code=500, detail="Error fetching video details")
        
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
            "language": transcript.language_code,
            "is_generated": transcript.is_generated,
            "duration": duration_seconds,
            "fetch_count": 1,
            "last_fetched": datetime.utcnow().isoformat(),
            "processing_status": "completed"
        }).execute()
        
        return {"transcript": formatted_transcript, "status": "new"}
    except Exception as e:
        logger.error(f"Unexpected error in get_transcript: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)