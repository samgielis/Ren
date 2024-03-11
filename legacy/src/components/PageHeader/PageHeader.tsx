import * as React from "react";
import { Navbar, NavbarProps } from "./Navbar";
import { FullPageModal } from "../FullPageModal/FullPageModal";

export class PageHeader extends React.Component<NavbarProps, {}> {
  render() {
    return (
      // <FullPageModal text={""}></FullPageModal>
      <div>
        <MainLogo />
        <Navbar activeContext={this.props.activeContext} />
      </div>
    );
  }
}

class MainLogo extends React.Component {
  render() {
    return (
      <div className="ren-main-logo-container">
          <img className="ren-main-logo-img" src="/img/logo.png" />
      </div>
    );
  }
}
