import * as React from "react";
import {Navbar, NavbarProps} from "./Navbar";

export class PageHeader extends React.Component<NavbarProps, {}> {
    render() {
        return <div>
            <MainLogo />
            <Navbar activeContext={this.props.activeContext}/>
        </div>
    }
}

class MainLogo extends React.Component {
    render() {
        return <div className="row ren-main-logo-container">
            <div className="col-md-12">
                <img className='ren-main-logo-img' src='/img/logo.png'/>
            </div>
        </div>
    }
}