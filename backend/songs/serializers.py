from rest_framework import serializers

from .models import Song


class SongSerializer(serializers.ModelSerializer):
    """Serializer for Song model"""

    class Meta:
        model = Song
        fields = [
            "id",
            "artist",
            "title",
            "lyrics",
            "summary",
            "countries",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "lyrics",
            "summary",
            "countries",
            "created_at",
            "updated_at",
        ]


class SongDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed Song information"""

    class Meta:
        model = Song
        fields = [
            "id",
            "artist",
            "title",
            "lyrics",
            "summary",
            "countries",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
