import * as React from "react";

export interface FullPageModalProps {
  text: string;
}

export interface FullPageModalState {
  showing: boolean;
}

export class FullPageModal extends React.Component<
  FullPageModalProps,
  FullPageModalState
> {
  componentWillMount(): void {
    this.setState({ showing: true });
  }

  hide = () => {
    this.setState({ showing: false });
  };

  render() {
    if (!this.state.showing) {
      return <div></div>;
    }

    return (
      <div className="ren-temporary-warning">
        <div className="ren-temporary-warning-content">
          <div
            className="ren-modal-close"
            onClick={this.hide}
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <span>X</span>
          </div>
          <img src="/img/ddd.jpg" width="100%" />
        </div>
      </div>
    );
  }
}
