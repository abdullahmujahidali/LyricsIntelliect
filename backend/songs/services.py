import json
import logging
from typing import Any, Dict, Optional, Tuple

import requests
from django.conf import settings
from django.core.cache import cache
from openai import OpenAI

logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.OPENAI_API_KEY)


class LyricsService:
    @staticmethod
    def fetch_lyrics(artist: str, title: str) -> Tuple[bool, str, Optional[str]]:
        """
        Fetch lyrics from Musixmatch API

        Returns:
            Tuple[bool, str, Optional[str]]: (success, message, lyrics)
        """
        cache_key = f"lyrics_{artist.lower()}_{title.lower()}"
        cached_lyrics = cache.get(cache_key)
        if cached_lyrics:
            logger.info("Lyrics for %s - %s fetched from cache", artist, title)
            return True, "Lyrics fetched from cache", cached_lyrics

        try:
            search_url = f"{settings.MUSIXMATCH_API_BASE_URL}/matcher.lyrics.get"
            params = {
                "apikey": settings.MUSIXMATCH_API_KEY,
                "q_artist": artist,
                "q_track": title,
                "format": "json",
            }

            response = requests.get(search_url, params=params, timeout=10)
            data = response.json()
            if data.get("message", {}).get("header", {}).get("status_code") != 200:
                logger.warning("Musixmatch API error for %s - %s", artist, title)
                return False, "Song not found or API error", None
            lyrics_data = data.get("message", {}).get("body", {}).get("lyrics", {})
            lyrics = lyrics_data.get("lyrics_body", "")

            if not lyrics:
                logger.warning("No lyrics found for %s - %s", artist, title)
                return False, "No lyrics found for this song", None

            cache.set(cache_key, lyrics, settings.LYRICS_CACHE_TTL)
            logger.info("Lyrics for %s - %s fetched from API and cached", artist, title)

            return True, "Lyrics fetched successfully", lyrics

        except Exception as e:
            logger.error("Error fetching lyrics for %s - %s: %s", artist, title, str(e))
            return False, f"Error fetching lyrics: {str(e)}", None


class AnalysisService:
    @staticmethod
    def analyze_lyrics(lyrics: str) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Analyze lyrics using OpenAI API to get summary and countries mentioned

        Returns:
            Tuple[bool, str, Dict[str, Any]]: (success, message, analysis_data)
        """
        if not lyrics:
            logger.warning("No lyrics provided for analysis")
            return False, "No lyrics to analyze", {}

        cache_key = f"analysis_{hash(lyrics)}"
        cached_analysis = cache.get(cache_key)
        if cached_analysis:
            logger.info("Analysis fetched from cache")
            return True, "Analysis fetched from cache", cached_analysis

        try:
            prompt = f"""
            Analyze the following song lyrics and provide:
            1. A one-sentence summary of what the song is about
            2. A list of all countries mentioned in the lyrics
            
            Lyrics:
            {lyrics}
            
            Respond in JSON format:
            {{
                "summary": "One sentence that summarizes what the song is about",
                "countries": ["Country1", "Country2", ...]
            }}
            """
            if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith(
                "sk-proj-"
            ):
                logger.error(
                    "Invalid OpenAI API key format: using test/project key instead of production key"
                )
                return False, "Invalid OpenAI API key configuration", {}

            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that analyzes song lyrics.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=settings.OPENAI_TEMPERATURE,
                max_tokens=settings.OPENAI_MAX_TOKENS,
            )
            content = response.choices[0].message.content
            try:
                analysis_data = json.loads(content)
                if not isinstance(analysis_data, dict):
                    logger.warning("OpenAI returned non-dictionary response")
                    return False, "Invalid response format from OpenAI", {}
                if "summary" not in analysis_data:
                    analysis_data["summary"] = (
                        "Unable to generate summary for this song."
                    )

                if "countries" not in analysis_data or not isinstance(
                    analysis_data["countries"], list
                ):
                    analysis_data["countries"] = []

                cache.set(cache_key, analysis_data, settings.ANALYSIS_CACHE_TTL)
                logger.info("Lyrics successfully analyzed and cached")

                return True, "Lyrics analyzed successfully", analysis_data

            except json.JSONDecodeError:
                logger.warning("Failed to parse JSON from OpenAI response")
                summary = "Unable to generate summary for this song."
                countries = []

                if "summary" in content.lower():
                    summary_parts = content.split("summary")
                    if len(summary_parts) > 1:
                        summary_text = summary_parts[1].split("\n")[0]
                        summary = summary_text.strip('": ,')

                if "countries" in content.lower():
                    countries_parts = content.split("countries")
                    if len(countries_parts) > 1:
                        countries_text = countries_parts[1].strip()
                        if "[" in countries_text and "]" in countries_text:
                            countries_list = countries_text[
                                countries_text.find("[") + 1 : countries_text.find("]")
                            ]
                            countries = [
                                c.strip(" \"'")
                                for c in countries_list.split(",")
                                if c.strip()
                            ]
                analysis_data = {"summary": summary, "countries": countries}
                if summary != "Unable to generate summary for this song.":
                    cache.set(cache_key, analysis_data, settings.ANALYSIS_CACHE_TTL)
                    logger.info("Partial analysis results cached")

                return True, "Lyrics analyzed with partial results", analysis_data

        except Exception as e:
            logger.error("Error analyzing lyrics: %s", str(e), exc_info=True)
            return False, f"Error analyzing lyrics: {str(e)}", {}
