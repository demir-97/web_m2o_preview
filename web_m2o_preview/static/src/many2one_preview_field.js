import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { usePopover } from "@web/core/popover/popover_hook";
import { Many2OneField, many2OneField } from "@web/views/fields/many2one/many2one_field";
import { M2oPreviewPopover } from "./m2o_preview_popover";

export class Many2OnePreviewField extends Many2OneField {
    static template = "web_m2o_preview.Many2OnePreviewField";
    static props = {
        ...Many2OneField.props,
        previewFields: { type: String, optional: true },
        previewImageField: { type: String, optional: true },
    };

    setup() {
        super.setup();
        this.m2oPreviewPopover = usePopover(M2oPreviewPopover, { position: "top" });
    }

    get previewFieldNames() {
        return (this.props.previewFields || "")
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean);
    }

    onPreviewMouseEnter(ev) {
        // `resId`/`relation` are inherited getters from Many2OneField:
        // this.value is the [id, display_name] tuple in 17.0/18.0.
        if (!this.resId) {
            return;
        }
        this.m2oPreviewPopover.open(ev.currentTarget, {
            resModel: this.relation,
            resId: this.resId,
            fieldNames: this.previewFieldNames,
            imageField: this.props.previewImageField || "",
        });
    }

    onPreviewMouseLeave(ev) {
        // The popover renders next to (and can visually overlap) the trigger
        // icon; when it does, the browser fires this mouseleave with
        // `relatedTarget` pointing into the popover itself, even though the
        // mouse never really left the widget — closing here would
        // immediately re-open on the next mouseenter, causing a flicker
        // loop. Let the popover's own mouseleave decide instead.
        if (ev && ev.relatedTarget && ev.relatedTarget.closest && ev.relatedTarget.closest(".o_m2o_preview_popover")) {
            return;
        }
        this.m2oPreviewPopover.close();
    }

    onPreviewClick(ev) {
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
