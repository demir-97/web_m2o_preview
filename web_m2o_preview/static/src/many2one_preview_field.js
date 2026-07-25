import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useState } from "@odoo/owl";
import { Many2OneField, many2OneField } from "@web/views/fields/many2one/many2one_field";
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
        super.setup();
        this.previewState = useState({ open: false });
    }

    get previewFieldNames() {
        return (this.props.previewFields || "")
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean);
    }

    // `resId`/`relation` are inherited getters from Many2OneField:
    // this.value is the [id, display_name] tuple in 17.0/18.0.
    get previewResId() {
        return this.resId;
    }

    // The card is rendered as a plain DOM child of the same wrapper as the
    // trigger icon (no popover/portal involved) specifically so that a
    // single mouseenter/mouseleave pair on the wrapper is enough: the mouse
    // moving between the icon and the card never leaves the wrapper's own
    // DOM subtree, so the browser never fires a spurious leave/enter cycle
    // no matter how the card happens to be positioned or sized. An earlier
    // version used `usePopover`, which renders its content through a
    // portal into a separate `.o_popover` wrapper elsewhere in the
    // document — the mouse crossing into *that* subtree caused real
    // mouseleave events on the trigger with no reliable way to tell "this
    // left to the card" from "this left the widget entirely", which kept
    // causing an open/close flicker.
    onWrapperMouseEnter() {
        if (this.previewResId) {
            this.previewState.open = true;
        }
    }

    onWrapperMouseLeave() {
        this.previewState.open = false;
    }

    onPreviewClick(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.previewState.open = !this.previewState.open;
    }
}

registry.category("fields").add("many2one_preview", {
    ...many2OneField,
    component: Many2OnePreviewField,
    displayName: _t("Many2one (hover preview)"),
    supportedOptions: [
        ...many2OneField.supportedOptions,
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
            ...many2OneField.extractProps(staticInfo, dynamicInfo),
            previewFields: staticInfo.options.preview_fields,
            previewImageField: staticInfo.options.preview_image_field,
        };
    },
});
