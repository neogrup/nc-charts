import {PolymerElement, html} from '@polymer/polymer/polymer-element.js'
import {HighchartsPolymer} from './nc-charts-behavior.js'
import {SharedStyles} from './shared-styles.js';


class NcCharts extends HighchartsPolymer.ChartBehavior(HighchartsPolymer.BaseBehavior(PolymerElement)) {
  static get template() {
    return html`
      ${SharedStyles}
      <div id="Chart"  on-click="_checkSelected"></div>
      <slot></slot>
    `;
  }
  
  static get properties() {
    return {
      type: {
        type: String, 
        value: 'spline', 
        observer: '_updateType'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.__createChart()
  }
}

window.customElements.define('nc-charts', NcCharts);
