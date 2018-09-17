import * as React from "react";

export interface NavbarProps {
    activeContext: string
}
export class Navbar extends React.Component<NavbarProps, {}> {
    render() {
        return <nav className="navbar ren-black-background">
            <div className="container-fluid ren-navbar-container">
                <div className="navbar-header">
                    <NavbarSandwichButton/>
                </div>

                <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul className="nav navbar-nav">
                        <NavbarEntry
                            title='Home' link='/'
                            active={this.props.activeContext === 'home'}
                        />
                        <NavbarEntry
                            title='Sportvoeding' link='/sportvoeding'
                            tooltip='Ontdek ons assortiment sportvoeding'
                            active={this.props.activeContext === 'sportvoeding'}
                        />
                        <NavbarEntry
                            title='Merken' link='/merken'
                            tooltip='Ontdek al onze merken'
                            active={this.props.activeContext === 'merken'}
                        />
                        <NavbarEntry
                            title='Contact' link='/contact'
                            tooltip='Contacteer ons'
                            active={this.props.activeContext === 'contact'}
                        />
                    </ul>

                    <NavbarRightSide />
                </div>
            </div>
        </nav>;
    }
}

class NavbarSandwichButton extends React.Component {
    render() {
        return <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                       data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"/>
            <span className="icon-bar"/>
            <span className="icon-bar"/>
        </button>
    }
}

export interface NavbarEntryProps {
    link: string
    title: string
    active: boolean
    tooltip?: string
}

class NavbarEntry extends React.Component<NavbarEntryProps, {}> {
    renderLinkWithOutTooltip () {
        return <a href={this.props.link}>{this.props.title}</a>;
    }

    renderLinkWithTooltip () {
        return <a data-tooltip title={this.props.tooltip} href={this.props.link}>{this.props.title}</a>;
    }

    render() {
        return <li className={this.props.active ? 'active' : ''}>
            {
                this.props.tooltip ? this.renderLinkWithTooltip() : this.renderLinkWithOutTooltip()
            }
        </li>

    }
}

class NavbarRightSide extends React.Component {
    render() {
        return <ul className="nav navbar-nav navbar-right">
            <li>
                <a className='ren-navbar-sociallink' href="https://www.facebook.com/rentessenderlo"
                   target="_blank">
                        <span data-tooltip title='Vind ons op Facebook'
                              className='ren-navbar-sociallink-span-container'>
                            <i className="fa fa-facebook fa-lg"/>
                        </span>
                </a>
            </li>
        </ul>
    }
}