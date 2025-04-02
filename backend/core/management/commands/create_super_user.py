from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a superuser with a predefined email and password"

    def handle(self, *args, **kwargs):
        User = get_user_model()
        email = "test@test.com"
        password = "testpass123"

        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, password=password)
            self.stdout.write(
                self.style.SUCCESS(f"Superuser {email} created successfully.")
            )
        else:
            self.stdout.write(self.style.WARNING(f"Superuser {email} already exists."))
