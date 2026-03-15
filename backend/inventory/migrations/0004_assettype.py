from django.db import migrations, models


def seed_asset_types(apps, schema_editor):
    AssetType = apps.get_model("inventory", "AssetType")
    AssetType.objects.get_or_create(
        code="FIXED_ASSET",
        defaults={"label": "Fixed Asset", "is_consumable": False, "is_active": True},
    )
    AssetType.objects.get_or_create(
        code="CONSUMABLE",
        defaults={"label": "Consumable", "is_consumable": True, "is_active": True},
    )


def unseed_asset_types(apps, schema_editor):
    AssetType = apps.get_model("inventory", "AssetType")
    AssetType.objects.filter(code__in=["FIXED_ASSET", "CONSUMABLE"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("inventory", "0003_consumablestocktransaction_inventoryitem_amount_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="AssetType",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=16, unique=True)),
                ("label", models.CharField(max_length=64)),
                ("is_consumable", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["id"]},
        ),
        migrations.RunPython(seed_asset_types, unseed_asset_types),
    ]
