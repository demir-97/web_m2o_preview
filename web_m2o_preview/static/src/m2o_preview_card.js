import { Component, onWillStart, onWillUpdateProps, proxy, t, useProps } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class M2oPreviewCard extends Component {
    static template = "web_m2o_preview.M2oPreviewCard";
    // Odoo 20's OWL declares props as an instance `useProps(schema)` built
    // from the `t` type helpers instead of a plain `static props` object.
    props = useProps({
        resModel: t.string(),
        resId: t.number(),
        fieldNames: t.array(),
        imageField: t.string().optional(),
    });

    setup() {
        this.orm = useService("orm");
        // `proxy` is the Odoo 20 replacement for useState: same
        // property-access API, reads inside a render subscribe to it.
        this.state = proxy({ loading: true, data: null, labels: {} });
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
