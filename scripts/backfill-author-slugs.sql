-- Backfill simple slugs from names where missing (ASCII approximation done in app later if needed)
UPDATE User SET slug = CONCAT('yazar-', LOWER(SUBSTRING(id, -8))) WHERE slug IS NULL OR slug = '';
