import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * `nc-charts`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class NcCharts extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'nc-charts',
      },
    };
  }
}

window.customElements.define('nc-charts', NcCharts);
