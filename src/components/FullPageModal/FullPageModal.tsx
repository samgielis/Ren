import * as React from "react";

export interface FullPageModalProps {
    text: string
}

export interface FullPageModalState {
    showing: boolean
}

export class FullPageModal extends React.Component<FullPageModalProps, FullPageModalState> {

    componentWillMount(): void {
        this.setState({showing: true});
    }

    hide = () => {
        this.setState({showing: false});
    };

    render() {
        if (!this.state.showing) {
            return <div></div>
        }

        return <div className='ren-temporary-warning'>
            <div className='ren-temporary-warning-content'>
                <p>
                    Beste klanten.
                </p>
                <p>
                    In het belang van de gezondheid van zowel personeel als klanten, heb ik besloten om de winkel
                    voorlopig te sluiten tot en met 5 april. Wel kan je ons contacteren om bepaalde bestellingen op te sturen via de post. Ook onze outlet shop blijft open.
                </p>
                <p>
                    <a href={"https://shop.rensport.be/pages/aanbod-tijdens-corona-crisis"}>Lees hier meer.</a>
                </p>
                <p>
                    Bedankt voor jullie begrip.
                </p>
                <p>
                    Groetjes, Christel.
                </p>
                <button onClick={this.hide}>OK</button>

            </div>
        </div>
    }
}