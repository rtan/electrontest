import * as React from "react";
import {TreeGrid} from "orbi/renderer/component/fancy/treegrid";

export interface FancyProps {
    // todo golden-layout type definition
    glContainer: any;

    id: any;
}

export interface FancyState {
    isReload: boolean
}

export class Fancy extends React.Component<FancyProps, FancyState> {
    constructor(props: FancyProps) {
        super(props);
        this.state = {isReload: false};
    }

    reload() {
        this.setState({isReload: true});
    }

    componentDidUpdate() {
        if (this.state.isReload) {
            setTimeout(() => {
                this.setState({
                    isReload: false
                });
                this.forceUpdate();
            }, 100);
        }
    }

    render() {
        if (this.state.isReload) {
            return (
                <div>loading...</div>
            );
        }
        return (
            <TreeGrid id={this.props.id} glContainer={this.props.glContainer} onReload={() => this.reload()}/>
        );
    }

}
