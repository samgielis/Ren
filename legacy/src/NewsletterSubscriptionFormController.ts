import {AnalyticsTracker} from "./analytics/AnalyticsTracker";

declare var VR: VerticalResponse;

interface VerticalResponse {
    SignupForm: any
}

const VR_FORM_ELEMENT_REFERENCE = 'vr-signup-form-17592186047291';
const REN_INPUT_ELEMENT_REFERENCE = 'ren-nieuwsbrief-input-field';
const REN_NEWSLETTER_BUTTON_REFERENCE = 'ren-nieuwsbrief-button';

export class NewsletterSubscriptionFormController {


    constructor(private _analyticsTracker: AnalyticsTracker) {
        document.addEventListener("DOMContentLoaded", () => {
            this._initForm();
        });
    }

    private _initForm() {
        if (!(window as any).VR || !VR.SignupForm) {
            return;
        }

        if (!document.getElementById(VR_FORM_ELEMENT_REFERENCE)) {
            return;
        }

        const visibleButton = document.getElementById(REN_NEWSLETTER_BUTTON_REFERENCE);

        if (!visibleButton) {
            return;
        }

        new VR.SignupForm({
            id: "17592186047291",
            element: VR_FORM_ELEMENT_REFERENCE,
            endpoint: "https://marketingsuite.verticalresponse.com/se/",
            submitLabel: "Submitting...",
            invalidEmailMessage: "Invalid email address",
            generalErrorMessage: "An error occurred",
            notFoundMessage: "Signup form not found",
            successMessage: "Success!",
            nonMailableMessage: "Nonmailable address"
        });

        visibleButton.addEventListener('click', this._handleSubmission);
    }

    private _handleSubmission = () => {
        let container = document.querySelector('.ren-nieuwsbrief-container');
        let input: HTMLInputElement = <HTMLInputElement>document.getElementById(REN_INPUT_ELEMENT_REFERENCE);
        let hiddenInput: HTMLInputElement = <HTMLInputElement>document.querySelector('#vr-hidden-input-field'),
            hiddenSubmit: HTMLElement = <HTMLElement>document.querySelector('#vr-hidden-submit-btn');

        if (!input || !hiddenInput || !input.value || !hiddenSubmit) {
            return;
        }

        this._analyticsTracker.trackSubscription(input.value);

        hiddenInput.value = input.value;
        hiddenSubmit.click();

        container.classList.add('ren-nieuwsbrief-subscribed')
    };
}