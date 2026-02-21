# Generated migration for adding profile_image field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='patientprofile',
            name='profile_image',
            field=models.ImageField(blank=True, null=True, upload_to='patient_profiles/'),
        ),
    ]
