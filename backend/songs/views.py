from django.core.cache import cache
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

from .models import Song
from .serializers import SongDetailSerializer, SongSerializer
from .services import LyricsService
from .tasks import analyze_song_task


class IsCreatorOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow creators of a song or admins to edit it
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user or request.user.is_staff


class SongViewSet(viewsets.ModelViewSet):
    """ViewSet for Song model"""

    queryset = Song.objects.all()
    serializer_class = SongSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ["artist", "title"]
    filterset_fields = ["artist", "title", "status"]
    permission_classes = [permissions.IsAuthenticated, IsCreatorOrAdmin]

    def get_queryset(self):
        """
        This view should return a list of all songs for admin
        or only user's songs for regular users
        """
        user = self.request.user
        if user.is_staff:
            return Song.objects.all()
        return Song.objects.filter(created_by=user)

    def get_serializer_class(self):
        if self.action in ["retrieve", "update", "partial_update"]:
            return SongDetailSerializer
        return SongSerializer

    def create(self, request, *args, **kwargs):
        """Create a new song and queue it for analysis"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        artist = serializer.validated_data["artist"]
        title = serializer.validated_data["title"]
        existing_song = Song.objects.filter(
            artist__iexact=artist, title__iexact=title, created_by=request.user
        ).first()

        if existing_song:
            return Response(
                {
                    "message": "Song already exists",
                    "data": SongDetailSerializer(existing_song).data,
                },
                status=status.HTTP_200_OK,
            )
        song_exists, error_message = LyricsService.check_song_exists(artist, title)
        if not song_exists:
            return Response(
                {"message": f"Cannot analyze song: {error_message}", "success": False},
                status=status.HTTP_400_BAD_REQUEST,
            )
        song = serializer.save(status="pending", created_by=request.user)
        task = analyze_song_task.delay(str(song.id))
        song.task_id = task.id
        song.save(update_fields=["task_id"])

        return Response(
            {
                "message": "Song created and queued for analysis",
                "data": SongDetailSerializer(song).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def reanalyze(self, request, pk=None):
        """Re-analyze an existing song"""
        song = self.get_object()
        song_exists, error_message = LyricsService.check_song_exists(
            song.artist, song.title
        )

        if not song_exists:
            return Response(
                {
                    "message": f"Cannot reanalyze song: {error_message}",
                    "success": False,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        cache_key_lyrics = f"lyrics_{song.artist.lower()}_{song.title.lower()}"
        cache_key_analysis = f"analysis_{hash(song.lyrics if song.lyrics else '')}"
        cache.delete(cache_key_lyrics)
        cache.delete(cache_key_analysis)
        song.status = "pending"
        song.message = ""
        song.save(update_fields=["status", "message"])
        task = analyze_song_task.delay(str(song.id))
        song.task_id = task.id
        song.save(update_fields=["task_id"])

        return Response(
            {
                "message": "Song queued for re-analysis",
                "data": SongDetailSerializer(song).data,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=True, methods=["get"])
    def status(self, request, pk=None):
        """Get the current analysis status of a song"""
        song = self.get_object()
        response_data = {
            "status": song.status,
        }

        if song.status == "completed":
            response_data["message"] = "Analysis completed successfully"
            return Response(response_data, status=status.HTTP_200_OK)
        elif song.status == "processing":
            response_data["message"] = "Song is being processed"
            return Response(response_data, status=status.HTTP_202_ACCEPTED)
        elif song.status == "pending":
            response_data["message"] = "Song is queued for analysis"
            return Response(response_data, status=status.HTTP_202_ACCEPTED)
        elif song.status == "error":
            response_data["message"] = song.message
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        else:
            response_data["message"] = "Unknown status"
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
