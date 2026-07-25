/** @odoo-module **/

import { Component, onWillStart, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class M2oPreviewPopover extends Component {
    static template = "web_m2o_preview.M2oPreviewPopover";
    static props = {
        resModel: String,
        resId: Number,
        fieldNames: Array,
        imageField: { type: String, optional: true },
        close: { type: Function, optional: true },
    };

    setup() {
        this.orm = useService("orm");
        this.state = useState({ loading: true, data: null, labels: {} });
        onWillStart(() => this.loadPreviewData());
    }

    async loadPreviewData() {
        const fieldNames = ["display_name", ...this.props.fieldNames];
        const [record] = await this.orm.read(this.props.resModel, [this.props.resId], fieldNames);
        let labels = {};
        if (this.props.fieldNames.length) {
            labels = await this.orm.call(this.props.resModel, "fields_get", [
                this.props.fieldNames,
                ["string"],
            ]);
        }
        this.state.data = record;
        this.state.labels = labels;
        this.state.loading = false;
    }

    onMouseLeave(ev) {
        // Mirror the trigger's own overlap guard: moving back onto the
        // trigger icon shouldn't close the popover either, otherwise the
        // two mouseleave handlers can fight and flicker.
        if (ev && ev.relatedTarget && ev.relatedTarget.closest && ev.relatedTarget.closest(".o_m2o_preview_trigger")) {
            return;
        }
        this.props.close();
    }

    get imageUrl() {
        return `/web/image/${this.props.resModel}/${this.props.resId}/${this.props.imageField}`;
    }

    fieldLabel(fieldName) {
        return (this.state.labels[fieldName] && this.state.labels[fieldName].string) || fieldName;
    }

    fieldValue(fieldName) {
        const value = this.state.data[fieldName];
        if (Array.isArray(value)) {
            return value[1];
        }
        if (value && typeof value === "object" && "display_name" in value) {
            return value.display_name;
        }
        if (value === false || value === undefined || value === null) {
            return "";
        }
        return String(value);
    }
}
