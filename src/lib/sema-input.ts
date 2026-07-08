import { html, css, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { SemaElement } from '../internal/sema-element.js';
import controlStyles from '../styles/control.css?inline';

/**
 * `<sema-input>` — a themed, form-associated text input.
 *
 * Participates in `<form>` (FormData, reset) via ElementInternals. Re-emits `change`
 * (native `change` is composed: false); native `input` already crosses the shadow
 * boundary. `value` is reflected to the property for two-way use.
 */
export class SemaInput extends SemaElement {
  static formAssociated = true;
  static styles = [
    SemaElement.base,
    unsafeCSS(controlStyles),
    css`
      :host {
        display: block;
      }
      :host([readonly]) .control {
        opacity: 0.6;
        cursor: default;
      }
    `,
  ];

  @property() value = '';
  @property() type = 'text';
  @property() placeholder = '';
  @property() name = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  /** Display-only: the value is submitted but not editable. */
  @property({ type: Boolean, reflect: true }) readonly = false;
  /** Maximum number of characters the control accepts (omit for no limit). */
  @property({ type: Number }) maxlength?: number;

  private _internals = this.attachInternals();

  // Host aria-* attributes (set e.g. by <sema-field>) must be mirrored onto the
  // inner control, where AT computes name/description — re-render when they change.
  static get observedAttributes() {
    return [...super.observedAttributes, 'aria-label', 'aria-description', 'aria-invalid'];
  }

  attributeChangedCallback(name: string, old: string | null, value: string | null) {
    super.attributeChangedCallback(name, old, value);
    if (name.startsWith('aria-')) this.requestUpdate();
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('value')) this._internals.setFormValue(this.value);
  }

  formResetCallback() {
    this.value = '';
    this._internals.setFormValue('');
  }

  private _onInput = (e: Event) => {
    this.value = (e.target as HTMLInputElement).value;
    this._internals.setFormValue(this.value);
  };
  private _onChange = () => {
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };
  // Match a native single-line text input: Enter submits the associated form.
  // The inner <input> lives in shadow DOM, so implicit submission never reaches
  // the light-DOM form; requestSubmit() (via ElementInternals.form) restores it.
  private _onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.isComposing) this._internals.form?.requestSubmit();
  };

  render() {
    return html`<input
      class="control"
      part="control"
      .value=${live(this.value)}
      type=${this.type}
      placeholder=${this.placeholder}
      ?disabled=${this.disabled}
      ?required=${this.required}
      ?readonly=${this.readonly}
      maxlength=${ifDefined(this.maxlength)}
      aria-label=${this.getAttribute('aria-label') || this.name || 'input'}
      aria-description=${ifDefined(this.getAttribute('aria-description') ?? undefined)}
      aria-invalid=${ifDefined(this.getAttribute('aria-invalid') ?? undefined)}
      @input=${this._onInput}
      @change=${this._onChange}
      @keydown=${this._onKeydown}
    />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sema-input': SemaInput;
  }
}
customElements.define('sema-input', SemaInput);
