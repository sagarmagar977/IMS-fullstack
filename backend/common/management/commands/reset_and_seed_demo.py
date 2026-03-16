from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Flush the database and reseed a compact demo dataset. Intended for clean Supabase/Render setups."

    def add_arguments(self, parser):
        parser.add_argument(
            "--yes-i-understand",
            action="store_true",
            help="Acknowledge that this command deletes existing database data before reseeding.",
        )
        parser.add_argument("--dry-run", action="store_true", help="Preview the seed step without writing new demo data.")
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
        if options["dry_run"]:
            self.stdout.write(self.style.WARNING("Dry run: skipping flush and bootstrap; previewing compact seed only."))
            call_command(
                "seed_demo_data",
                target_items=options["target_items"],
                target_assignments=options["target_assignments"],
                dry_run=True,
                stdout=self.stdout,
            )
            self.stdout.write(self.style.SUCCESS("Dry run completed."))
            return

        if not options["yes_i_understand"]:
            raise CommandError("Refusing to flush data without --yes-i-understand.")

        self.stdout.write(self.style.WARNING("Flushing database..."))
        call_command("flush", interactive=False, stdout=self.stdout)

        self.stdout.write(self.style.WARNING("Bootstrapping admin if environment variables are configured..."))
        call_command("bootstrap_admin", stdout=self.stdout)

        self.stdout.write(self.style.WARNING("Seeding compact demo dataset..."))
        call_command(
            "seed_demo_data",
            target_items=options["target_items"],
            target_assignments=options["target_assignments"],
            stdout=self.stdout,
        )

        self.stdout.write(self.style.SUCCESS("Database reset and demo seed completed."))
