import logging

from celery import shared_task
from django.db import transaction

from .models import Song
from .services import AnalysisService, LyricsService

logger = logging.getLogger(__name__)


@shared_task(bind=True, name="analyze_song_task")
def analyze_song_task(self, song_id):
    """
    Celery task to analyze a song's lyrics asynchronously

    Args:
        song_id: UUID of the song to analyze
    """
    logger.info("Starting analysis for song %s", song_id)

    try:
        song = Song.objects.get(id=song_id)
        song.status = "processing"
        song.save(update_fields=["status"])

        lyrics_success, lyrics_message, lyrics = LyricsService.fetch_lyrics(
            song.artist, song.title
        )

        if not lyrics_success:
            logger.error(
                "Failed to fetch lyrics for song %s: %s", song_id, lyrics_message
            )
            song.status = "error"
            song.message = f"Failed to fetch lyrics: {lyrics_message}"
            song.save(update_fields=["status", "message"])
            return False

        song.lyrics = lyrics
        song.save(update_fields=["lyrics"])

        analysis_success, analysis_message, analysis_data = (
            AnalysisService.analyze_lyrics(lyrics)
        )

        if not analysis_success:
            logger.error(
                "Failed to analyze lyrics for song %s: %s", song_id, analysis_message
            )
            song.status = "error"
            song.message = f"Failed to analyze lyrics: {analysis_message}"
            song.save(update_fields=["status", "message"])
            return False

        with transaction.atomic():
            song.summary = analysis_data.get("summary", "")
            song.countries = analysis_data.get("countries", [])
            song.status = "completed"
            song.message = ""
            song.save()

        logger.info("Successfully analyzed song %s", song_id)
        return True

    except Song.DoesNotExist:
        logger.error("Song with ID %s does not exist", song_id)
        return False
    except Exception as e:
        message = str(e)
        logger.exception("Error analyzing song %s: %s", song_id, message)
        try:
            song = Song.objects.get(id=song_id)
            song.status = "error"
            song.message = f"Unexpected error during analysis: {message}"
            song.save(update_fields=["status", "message"])
        except Exception as inner_e:
            logger.exception("Failed to update song error status: %s", str(inner_e))
        return False
