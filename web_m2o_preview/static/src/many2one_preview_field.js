import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { usePopover } from "@web/core/popover/popover_hook";
import {
    Many2OneField,
    m2oSupportedOptions,
    m2oSupportedTypes,
    extractM2OFieldProps,
} from "@web/views/fields/many2one/many2one_field";
import { M2oPreviewPopover } from "./m2o_preview_popover";

export class Many2OnePreviewField extends Many2OneField {
    static template = "web_m2o_preview.Many2OnePreviewField";
    static props = {
        ...Many2OneField.props,
        previewFields: { type: String, optional: true },
        previewImageField: { type: String, optional: true },
    };

    setup() {
        this.orm = useService("orm");
        this.m2oPreviewPopover = usePopover(M2oPreviewPopover, { position: "top" });
    }

    get previewFieldNames() {
        return (this.props.previewFields || "")
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean);
    }

    // The raw many2one value is `{id, display_name}` in 19.0 and
    // `[id, display_name]` in 17.0/18.0 — support both.
    get currentResId() {
        const value = this.props.record.data[this.props.name];
        if (!value) {
            return false;
        }
        return Array.isArray(value) ? value[0] : value.id;
    }

    get relation() {
        return this.props.record.fields[this.props.name].relation;
    }

    onPreviewMouseEnter(ev) {
        const resId = this.currentResId;
        if (!resId) {
            return;
        }
        this.m2oPreviewPopover.open(ev.currentTarget, {
            resModel: this.relation,
            resId,
            fieldNames: this.previewFieldNames,
            imageField: this.props.previewImageField || "",
        });
    }

    onPreviewMouseLeave() {
        this.m2oPreviewPopover.close();
    }

    onPreviewClick(ev) {
        // Keep the icon usable on touch devices / keyboard: toggle on click,
        // don't let the click bubble to the many2one widget underneath.
        ev.stopPropagation();
        ev.preventDefault();
        if (this.m2oPreviewPopover.isOpen) {
            this.m2oPreviewPopover.close();
        } else {
            this.onPreviewMouseEnter(ev);
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
