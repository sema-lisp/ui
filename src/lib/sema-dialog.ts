import { html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { SemaElement } from '../internal/sema-element.js';
import { FocusTrapController } from '../internal/controllers/focus-trap.js';

/**
 * `<sema-dialog>` — a modal dialog with a focus trap, backdrop click, Escape
 * close, scroll lock, and header/body/footer slots.
 *
 * Emits `sema-open` / `sema-close` (aligned with `<sema-popover>`).
 */
export class SemaDialog extends SemaElement {
  static styles = [
    SemaElement.base,
    css`
      :host {
        display: none;
      }
      /* Give the open host a real box matching what is visually painted: its
         only child (.backdrop) is position:fixed and out of flow, so without
         this the host computes 0x0 and visibility checks (a11y tools,
         Playwright toBeVisible) report the shown dialog as hidden. */
      :host([open]) {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 500;
      }

      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.6);
        animation: fadeIn 0.15s ease;
      }

      .dialog {
        background: var(--bg-elevated, #141414);
        border: 1px solid var(--border, #1e1e1e);
        border-radius: var(--radius-xl, 8px);
        min-width: 320px;
        max-width: 480px;
        width: 90vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        animation: slideUp 0.15s ease;
      }

      .header {
        font-family: var(--serif, 'Cormorant', Georgia, serif);
        font-size: var(--text-3xl, 22px);
        font-weight: 400;
        color: var(--text-primary, #d8d0c0);
        padding: var(--space-lg, 24px) var(--space-lg, 24px) 0;
      }

      .body {
        font-family: var(--serif, 'Cormorant', Georgia, serif);
        font-size: var(--text-2xl, 18px);
        line-height: 1.7;
        color: var(--text-secondary, #a09888);
        padding: var(--space-md, 16px) var(--space-lg, 24px);
        overflow-y: auto;
      }

      .footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-lg, 24px);
        padding: 0 var(--space-lg, 24px) var(--space-lg, 24px);
        border-top: none;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ attribute: 'label' }) label?: string;

  private _labelId = `sema-dialog-${Math.random().toString(36).slice(2, 8)}`;
  private _bodyId = `sema-dialog-body-${Math.random().toString(36).slice(2, 8)}`;

  private _focusTrap = new FocusTrapController(this, {
    getContainer: (host) => host,
    isActive: (host) => host.open,
    lockScroll: true,
  });

  // Escape must close the dialog wherever focus is, including outside the shadow
  // root, so the listener lives on document (attached only while open).
  private _onDocKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    // The focus trap falls back to focusing the container (the host) when the
    // dialog has no focusable content.
    this.tabIndex = -1;
    // Reconnect while open schedules no update, so re-attach here (idempotent).
    if (this.open) document.addEventListener('keydown', this._onDocKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onDocKeydown);
  }

  render() {
    if (!this.open) return html``;
    return html`
      <div class="backdrop" role="presentation" @click=${this._onBackdropClick}>
        <div class="dialog" role="dialog" aria-modal="true"
             aria-labelledby=${this.label ? this._labelId : nothing}
             aria-label=${this.label ? nothing : this.getAttribute('aria-label') || 'Dialog'}
             aria-describedby=${this._bodyId}>
          ${this.label ? html`<div class="header" id=${this._labelId}>${this.label}</div>` : ''}
          <div class="body" id=${this._bodyId}><slot></slot></div>
          <div class="footer"><slot name="footer"></slot></div>
        </div>
      </div>
    `;
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('open')) {
      if (this.open) {
        document.addEventListener('keydown', this._onDocKeydown);
        this.dispatchEvent(new CustomEvent('sema-open', { bubbles: true, composed: true }));
      } else {
        document.removeEventListener('keydown', this._onDocKeydown);
        this.dispatchEvent(new CustomEvent('sema-close', { bubbles: true, composed: true }));
      }
    }
  }

  close() {
    this.open = false;
  }

  show() {
    this.open = true;
  }

  private _onBackdropClick(e: Event) {
    if ((e.target as HTMLElement).classList.contains('backdrop')) {
      this.close();
    }
  }
}

declare global { interface HTMLElementTagNameMap { 'sema-dialog': SemaDialog } }
customElements.define('sema-dialog', SemaDialog);
