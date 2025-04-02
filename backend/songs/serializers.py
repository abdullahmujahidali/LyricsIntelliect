from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Song

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model (minimal)"""

    class Meta:
        model = User
        fields = ["id", "email", "full_name"]
        read_only_fields = ["id", "email", "full_name"]


class SongSerializer(serializers.ModelSerializer):
    """Serializer for Song model"""

    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Song
        fields = [
            "id",
            "artist",
            "title",
            "status",
            "message",
            "summary",
            "countries",
            "created",
            "modified",
            "created_by",
        ]
        read_only_fields = [
            "status",
            "message",
            "summary",
            "countries",
            "created",
            "modified",
            "created_by",
        ]


class SongDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed Song information"""

    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Song
        fields = [
            "id",
            "artist",
            "title",
            "lyrics",
            "summary",
            "countries",
            "status",
            "message",
            "created",
            "modified",
            "created_by",
        ]
        read_only_fields = ["created", "modified", "created_by"]
