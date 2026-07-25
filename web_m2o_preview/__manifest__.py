{
    'name': 'Many2one Hover Preview | Quick Peek Card for Many2one Fields',
    'version': '19.0.1.0.0',
    'category': 'Productivity',
    'author': 'Meisanqo',
    'support': 'meisanqo@outlook.com',
    'summary': 'Hover preview card for any many2one field — no click needed.',
    'description': """
Many2one Hover Preview
=======================

A drop-in field widget, `many2one_preview`, for any many2one field. It adds
a small eye icon next to the field; hovering it (or tapping it on touch
devices) shows a compact preview card of the linked record — its name, an
optional image, and any extra fields you choose — without navigating away
from the current form.

Usage
-----

Add the widget to any many2one `<field>` tag in a view::

    <field name="partner_id" widget="many2one_preview"
           options="{'preview_fields': 'email,phone,city', 'preview_image_field': 'avatar_128'}"/>

Options (all optional):

- `preview_fields`: comma-separated technical field names of the linked
  model to show in the card (e.g. "email,phone,city"). If omitted, the card
  only shows the record's name and, if configured, its image.
- `preview_image_field`: technical name of an image field on the linked
  model to show in the card (e.g. "avatar_128", "image_128"). If omitted, no
  image is shown.

The normal many2one behavior (search, create, open) is untouched — the
preview is purely additive, triggered only by the eye icon, and only reads
data, it never changes anything.
""",
    'depends': ['web'],
    'images': ['static/description/banner.png'],
    'data': [],
    'assets': {
        'web.assets_backend': [
            'web_m2o_preview/static/src/**/*',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'OPL-1',
    'price': 9.0,
    'currency': 'USD',
}
