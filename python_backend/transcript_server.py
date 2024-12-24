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
from logging.handlers import RotatingFileHandler

# Set up file logging
log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
log_file = 'transcript_server.log'
file_handler = RotatingFileHandler(log_file, maxBytes=10485760, backupCount=5)  # 10MB per file, keep 5 files
file_handler.setFormatter(log_formatter)

# Set up console logging
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)

# Configure root logger
logging.basicConfig(level=logging.INFO, handlers=[file_handler, console_handler])
logger = logging.getLogger(__name__)

load_dotenv()

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
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8001",
        "http://127.0.0.1:8001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/transcript/{video_id}")
async def get_transcript(video_id: str):
    try:
        logger.info(f"Processing transcript for video {video_id}")
        
        # Check if transcript exists in Supabase
        result = supabase.table("video_transcripts").select("*").eq("video_id", video_id).execute()
        
        if result.data:
            # Update fetch count and last_fetched
            update_result = supabase.table("video_transcripts").update({
                "fetch_count": result.data[0]["fetch_count"] + 1,
                "last_fetched": datetime.utcnow().isoformat()
            }).eq("video_id", video_id).execute()
            return {"transcript": result.data[0]["transcript"], "status": "existing"}
        
        try:
            # Get all available transcripts
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to get English transcript first
            try:
                transcript = transcript_list.find_transcript(['en'])
            except Exception:
                # If English is not available, try to get any available transcript
                try:
                    transcript = transcript_list.find_manually_created_transcript()
                except:
                    try:
                        transcript = transcript_list.find_generated_transcript()
                    except:
                        logger.error(f"No transcript available for video {video_id}")
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
            logger.error(f"Error fetching transcript: {str(youtube_error)}")
            raise HTTPException(status_code=404, detail=f"Transcript not found for video ID: {video_id}")

        # Fetch video details from YouTube API
        try:
            video_response = youtube.videos().list(
                part="snippet,contentDetails",
                id=video_id
            ).execute()

            if not video_response.get('items'):
                logger.error(f"No video found for ID: {video_id}")
                raise HTTPException(status_code=404, detail=f"Video not found for ID: {video_id}")

            video_info = video_response['items'][0]
        except Exception as youtube_api_error:
            logger.error(f"Error fetching video details: {str(youtube_api_error)}")
            raise HTTPException(status_code=500, detail="Error fetching video details")
        
        # Parse duration to seconds
        duration_iso = video_info['contentDetails']['duration']
        duration_seconds = int(parse_duration(duration_iso).total_seconds())
        
        # Store in Supabase
        insert_data = {
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
        }
        
        insert_result = supabase.table("video_transcripts").insert(insert_data).execute()
        logger.info(f"Successfully processed transcript for video {video_id}")
        
        return {"transcript": formatted_transcript, "status": "new"}
    except Exception as e:
        logger.error(f"Error processing transcript: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)