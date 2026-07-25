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
        onPopoverMouseEnter: { type: Function, optional: true },
        onPopoverMouseLeave: { type: Function, optional: true },
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

    onMouseEnter() {
        this.props.onPopoverMouseEnter?.();
    }

    onMouseLeave() {
        this.props.onPopoverMouseLeave?.();
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
