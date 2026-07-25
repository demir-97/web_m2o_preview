import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useState } from "@odoo/owl";
import {
    Many2OneField,
    m2oSupportedOptions,
    m2oSupportedTypes,
    extractM2OFieldProps,
} from "@web/views/fields/many2one/many2one_field";
import { M2oPreviewCard } from "./m2o_preview_card";

export class Many2OnePreviewField extends Many2OneField {
    static template = "web_m2o_preview.Many2OnePreviewField";
    static components = { ...Many2OneField.components, M2oPreviewCard };
    static props = {
        ...Many2OneField.props,
        previewFields: { type: String, optional: true },
        previewImageField: { type: String, optional: true },
    };

    setup() {
        this.previewState = useState({ open: false, style: "" });
    }

    get previewFieldNames() {
        return (this.props.previewFields || "")
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean);
    }

    // The raw many2one value is `{id, display_name}` in 19.0 and
    // `[id, display_name]` in 17.0/18.0 — support both.
    get previewResId() {
        const value = this.props.record.data[this.props.name];
        if (!value) {
            return false;
        }
        return Array.isArray(value) ? value[0] : value.id;
    }

    get relation() {
        return this.props.record.fields[this.props.name].relation;
    }

    // The card is rendered as a plain DOM child of the same small wrapper as
    // the trigger icon (no popover/portal involved) — that wrapper contains
    // only the eye icon and the card, *not* the many2one field itself, so
    // hovering the field doesn't open the card, only hovering the icon (or
    // the card) does. Because both are always DOM descendants of that one
    // wrapper, the browser only fires a real mouseleave once the cursor
    // leaves their combined bounding region, however closely the card is
    // positioned relative to the icon. An earlier version used `usePopover`,
    // which renders its content through a portal into a separate
    // `.o_popover` wrapper elsewhere in the document — the mouse crossing
    // into *that* subtree caused real mouseleave events on the trigger with
    // no reliable way to tell "this left to the card" from "this left the
    // widget entirely", which caused an open/close flicker.
    onWrapperMouseEnter(ev) {
        if (!this.previewResId) {
            return;
        }
        // `position: fixed`, anchored from the *viewport* edges (not the
        // trigger's own offsetParent), so the card renders on top of
        // whatever the page looks like right now and is never clipped by an
        // `overflow: hidden` ancestor (a form sheet, a table cell, ...) the
        // way a plain `position: absolute` card confined to this wrapper
        // would be. Anchoring via `bottom`/`right` instead of `top`/`left`
        // means the card grows upward/leftward as its async content loads,
        // without needing to know its final size up front.
        const rect = ev.currentTarget.getBoundingClientRect();
        this.previewState.style =
            `position: fixed; bottom: ${window.innerHeight - rect.top + 6}px; ` +
            `right: ${window.innerWidth - rect.right}px;`;
        this.previewState.open = true;
    }

    onWrapperMouseLeave() {
        this.previewState.open = false;
    }

    onPreviewClick(ev) {
        // Keep the icon usable on touch devices / keyboard: toggle on click,
        // don't let the click bubble to the many2one widget underneath.
        ev.stopPropagation();
        ev.preventDefault();
        if (this.previewState.open) {
            this.previewState.open = false;
        } else {
            this.onWrapperMouseEnter(ev);
        }
    }
}

registry.category("fields").add("many2one_preview", {
    component: Many2OnePreviewField,
    displayName: _t("Many2one (hover preview)"),
    supportedTypes: m2oSupportedTypes,
    supportedOptions: [
        ...m2oSupportedOptions,
        {
            label: _t("Preview fields"),
            name: "preview_fields",
            type: "string",
            help: _t("Comma-separated technical field names to show in the hover preview card."),
        },
        {
            label: _t("Preview image field"),
            name: "preview_image_field",
            type: "string",
            help: _t("Technical name of an image field to show in the hover preview card (e.g. avatar_128)."),
        },
    ],
    extractProps(staticInfo, dynamicInfo) {
        return {
            ...extractM2OFieldProps(staticInfo, dynamicInfo),
            previewFields: staticInfo.options.preview_fields,
            previewImageField: staticInfo.options.preview_image_field,
        };
    },
});
