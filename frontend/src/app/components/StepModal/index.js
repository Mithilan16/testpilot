// @flow

import classnames from 'classnames';
import { Localized } from 'fluent-react/compat';
import React from 'react';

type StepModalDialogProps = {
  onCancel: Function,
  onComplete: Function,
  wrapperClass: String,
  stepNextPing: Function,
  stepBackPing: Function,
  stepToDotPing: Function
}

type StepModalDialogState = {
  currentStep: number
}

export default class StepModal extends React.Component {
  props: StepModalDialogProps
  state: StepModalDialogState

  modalContainer: Object

  constructor(props: StepModalDialogProps) {
    super(props);
    this.state = { currentStep: 0 };
  }

  componentDidMount() {
    this.modalContainer.focus();
  }

  render() {
    const { headerTitle } = this.props;
    const { currentStep } = this.state;

    const steps = this.props.steps || [];

    const atStart = (currentStep === 0);
    const atEnd   = (currentStep === steps.length - 1);

    return (
      <div className="modal-container" tabIndex="0"
           ref={modalContainer => { this.modalContainer = modalContainer; }}
           onKeyDown={e => this.handleKeyDown(e)}>
        <div className={`modal ${this.props.wrapperClass}`}>
          <header className="modal-header-wrapper">
            {headerTitle}
            <div className="modal-cancel" onClick={e => this.cancel(e)}/>
          </header>

          {steps.map((step, idx) => (idx === currentStep) && (this.props.renderStep(steps)))}

          <div className="step-actions">
            <div onClick={() => this.stepBack()}
                 className={classnames('step-back', { hidden: atStart })}><div/></div>
            <div onClick={() => this.stepNext()}
                 className={classnames('step-next', { 'no-display': atEnd })}><div/></div>
            <Localized id="stepDoneButton">
              <div onClick={e => this.complete(e)}
                   className={classnames('step-done', { 'no-display': !atEnd })}>Done</div>
            </Localized>
          </div>
        </div>
      </div>
    );
  }

  renderDots(steps: Array<any>, currentStep: number) {
    const dots = steps.map((el, index) => {
      if (currentStep === index) return (<div key={index} className="current dot"></div>);
      return (<div key={index} className="dot" onClick={e => this.stepToDot(e, index)} ></div>);
    });

    return dots;
  }

  cancel(e: Object) {
    e.preventDefault();
    // todo, make sure ga ping is in the cancel method
    if (this.props.onCancel) { this.props.onCancel(e); }
  }

  complete(e: Object) {
    e.preventDefault();
    // todo, make sure ga ping is in the onComplete method
    if (this.props.onComplete) { this.props.onComplete(e); }
  }

  stepToDot(e: Object, index: number) {
    e.preventDefault();
    this.setState({ currentStep: index });

    this.props.stepToDotPing(index);
  }

  stepBack() {
    const { currentStep } = this.state;

    const newStep = Math.max(currentStep - 1, 0);
    this.setState({ currentStep: newStep });

    this.props.stepBackPing(newStep);
  }

  stepNext() {
    const { currentStep } = this.state;

    const newStep = Math.min(currentStep + 1,
                             this.props.steps.length - 1);
    this.setState({ currentStep: newStep });

    this.props.stepNextPing(newStep);
  }

  handleKeyDown(ev: Object) {
    const { steps } = this.props;
    ev.preventDefault();
    switch (ev.key) {
      case 'Escape':
        this.cancel(e);
        break;
      case 'ArrowRight':
        this.stepNext();
        break;
      case 'ArrowLeft':
        this.stepBack();
        break;
      case 'Enter': {
        const { currentStep } = this.state;
        const atEnd = (currentStep === steps.length - 1);
        if (atEnd) this.complete(ev);
        break;
      }
      default:
        break;
    }
  }
}
