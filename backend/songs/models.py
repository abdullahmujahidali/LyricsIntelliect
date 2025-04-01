from django.db import models


class Song(models.Model):

    artist = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    lyrics = models.TextField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    countries = models.JSONField(default=list, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Song"
        verbose_name_plural = "Songs"
        ordering = ["-created_at"]
        unique_together = ["artist", "title"]

    def __str__(self):
        return f"{self.artist} - {self.title}"
