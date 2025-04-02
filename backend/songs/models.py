from django.db import models
from model_utils.models import TimeStampedModel, UUIDModel


class Song(TimeStampedModel, UUIDModel):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("error", "Error"),
    )

    artist = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    lyrics = models.TextField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    countries = models.JSONField(default=list, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    message = models.TextField(blank=True, null=True)
    task_id = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="songs"
    )

    class Meta:
        verbose_name = "Song"
        verbose_name_plural = "Songs"
        ordering = ["-created"]
        unique_together = ["artist", "title"]

    def __str__(self):
        return f"{self.artist} - {self.title}"
