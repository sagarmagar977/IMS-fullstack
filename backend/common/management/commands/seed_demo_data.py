from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed a reduced-size demo dataset for Supabase/Render environments."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Preview demo seed changes without writing data.")
        parser.add_argument(
            "--target-items",
            type=int,
            default=180,
            help="Override the compact profile item count.",
        )
        parser.add_argument(
            "--target-assignments",
            type=int,
            default=60,
            help="Override the compact profile assignment count.",
        )

    def handle(self, *args, **options):
        call_command(
            "seed_prd_data",
            profile="compact",
            target_items=options["target_items"],
            target_assignments=options["target_assignments"],
            dry_run=options["dry_run"],
            stdout=self.stdout,
        )
