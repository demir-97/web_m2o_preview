# Many2one Hover Preview

**See who's behind a many2one field without leaving the form.**

Adds a small eye icon next to any many2one field using the `many2one_preview`
widget. Hover it (or tap it on a touch device) and a small card pops up with
the linked record's name, an optional image, and any extra fields you choose
— no navigation, no extra click to open the record.

## Usage

```xml
<field name="partner_id" widget="many2one_preview"
       options="{'preview_fields': 'email,phone,city', 'preview_image_field': 'avatar_128'}"/>
```

- `preview_fields` (optional): comma-separated technical field names of the
  linked model to show in the card.
- `preview_image_field` (optional): technical name of an image field on the
  linked model (e.g. `avatar_128`, `image_128`). Omit it to show no image.

The normal many2one behavior — search, quick create, opening the record — is
untouched; the preview is purely additive and read-only.

## Technical

One new field widget (`many2one_preview`, extends the core `Many2OneField`)
plus a small popover component. No models, no views, no security rules
shipped — nothing changes until you add the widget yourself.

---
Author: Meisanqo — meisanqo@outlook.com
