import { Component, onWillStart, onWillUpdateProps, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class M2oPreviewCard extends Component {
    static template = "web_m2o_preview.M2oPreviewCard";
    static props = {
        resModel: String,
        resId: Number,
        fieldNames: Array,
        imageField: { type: String, optional: true },
    };

    setup() {
        this.orm = useService("orm");
        this.state = useState({ loading: true, data: null, labels: {} });
        onWillStart(() => this.loadPreviewData(this.props));
        onWillUpdateProps((nextProps) => {
            if (nextProps.resModel !== this.props.resModel || nextProps.resId !== this.props.resId) {
                this.state.loading = true;
                return this.loadPreviewData(nextProps);
            }
        });
    }

    async loadPreviewData(props) {
        const fieldNames = ["display_name", ...props.fieldNames];
        const [record] = await this.orm.read(props.resModel, [props.resId], fieldNames);
        let labels = {};
        if (props.fieldNames.length) {
            labels = await this.orm.call(props.resModel, "fields_get", [props.fieldNames, ["string"]]);
        }
        this.state.data = record;
        this.state.labels = labels;
        this.state.loading = false;
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
