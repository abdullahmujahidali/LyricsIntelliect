from django.db import models
from model_utils.models import TimeStampedModel, UUIDModel


class Song(TimeStampedModel, UUIDModel):

    artist = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    lyrics = models.TextField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    countries = models.JSONField(default=list, blank=True, null=True)

    class Meta:
        verbose_name = "Song"
        verbose_name_plural = "Songs"
        ordering = ["-created"]
        unique_together = ["artist", "title"]

    def __str__(self):
        return f"{self.artist} - {self.title}"
