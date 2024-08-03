from google.cloud import spanner

spanner_client = spanner.Client()
instance = spanner_client.instance('buckbuddiesapp')
database = instance.database('test_db')