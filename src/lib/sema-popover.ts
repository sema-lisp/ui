import { html, css } from 'lit';
import { property, query } from 'lit/decorators.js';
import { SemaElement } from '../internal/sema-element.js';
import { FocusTrapController, getFocusableElements } from '../internal/controllers/focus-trap.js';

export type PopoverPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'
  | 'left'
  | 'right';

/**
 * `<sema-popover>` — a generic anchored popover.
 *
 * Put the trigger in `slot="trigger"` and the floating content in the default slot.
 * Opens on trigger click (or hover via `open-on="hover"`).
 *
 * **Focus & keyboard (WAI-ARIA menu-button pattern):** opening moves focus into the
 * panel (a child `<sema-menu>` focuses its first item); Escape, outside-click, Tab, and
 * focus leaving the popover all close it; Escape/Tab return focus to the trigger. The
 * trigger gets `aria-haspopup` + `aria-expanded`. Add the **`modal`** attribute for
 * dialog-like content that should hard-trap Tab instead of closing on Tab/focus-out.
 *
 * **Positioning:** the panel is `position: fixed`, so it always escapes `overflow`-
 * clipping ancestors instead of being clipped by them. On open it measures the
 * trigger with `getBoundingClientRect()` and sets viewport-relative coordinates,
 * flipping vertically (`bottom-*` ↔ `top-*`) when the preferred side would cross the
 * viewport edge. Because the fixed coordinates go stale if the page scrolls or
 * resizes, the popover closes on either while open (scrolling *inside* the popover's
 * own light-DOM content is exempt, so a scrollable slotted panel doesn't self-close).
 *
 * Emits `sema-open` / `sema-close`. A child `<sema-menu>`'s `sema-select` auto-closes it.
 */
export class SemaPopover extends SemaElement {
  static styles = [
    SemaElement.base,
    css`
      :host {
        display: inline-block;
        position: relative;
      }
      /* Fixed (not absolute) so the panel escapes overflow-clipping ancestors — a
         plain overflow:hidden/auto container does not clip a fixed descendant.
         top/left are set inline by _reposition() (measured from the trigger's
         getBoundingClientRect() once the panel has laid out); left unset here,
         the panel sits at its default fixed origin only for the single
         pre-measurement frame right after open flips true. */
      .panel {
        position: fixed;
        z-index: 300;
        min-width: max-content;
        background: var(--bg-elevated, #141414);
        border: 1px solid var(--border, #1e1e1e);
        border-radius: var(--radius-md, 4px);
        padding: var(--space-xs, 4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      }
      .panel[hidden] {
        display: none;
      }
    `,
  ];

  /** Open state. */
  @property({ type: Boolean, reflect: true }) open = false;
  /** Where the panel sits relative to the trigger. */
  @property({ reflect: true }) placement: PopoverPlacement = 'bottom-start';
  /** How the popover opens. */
  @property({ attribute: 'open-on' }) openOn: 'click' | 'hover' = 'click';
  /** Hard-trap Tab focus inside the panel (for dialog-like content). */
  @property({ type: Boolean, reflect: true }) modal = false;

  @query('.panel') private _panel!: HTMLElement;
  private _triggerEl: HTMLElement | null = null;

  // Trap focus only for modal popovers; menus self-manage focus (roving tabindex).
  private _focusTrap = new FocusTrapController(this, {
    getContainer: () => this._panel,
    isActive: () => this.open && this.modal,
  });

  private _onDocPointer = (e: Event) => {
    if (!e.composedPath().includes(this)) this.hide(false);
  };

  // The fixed coordinates computed in _reposition() are only valid until the page's
  // scroll offset or viewport size changes, so close rather than track them live.
  // A scroll bubbling up from the popover's own light-DOM content (composedPath
  // includes `this`) is exempt so a scrollable slotted panel doesn't self-close.
  private _onViewportChange = (e: Event) => {
    if (e.composedPath().includes(this)) return;
    this.hide(false);
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    window.removeEventListener('scroll', this._onViewportChange, true);
    window.removeEventListener('resize', this._onViewportChange);
    // Don't leave a reconnected popover stuck-open with a stale aria-expanded.
    if (this.open) {
      this._triggerEl?.setAttribute('aria-expanded', 'false');
      this.open = false;
    }
    this._triggerEl = null;
  }

  private get _trigger(): HTMLElement | null {
    return this.querySelector<HTMLElement>('[slot="trigger"]');
  }

  /** Measure the trigger and place the (fixed) panel at viewport-relative
   * coordinates, flipping vertically when the preferred side doesn't fit but the
   * opposite side does. Called once the panel has laid out (post-`updateComplete`),
   * since it needs the panel's real dimensions. */
  private _reposition() {
    const trigger = this._triggerEl;
    const panel = this._panel;
    if (!trigger || !panel) return;
    const gap = 4;
    const tr = trigger.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();

    const preferAbove = this.placement.startsWith('top');
    const fitsAbove = tr.top - gap - pr.height >= 0;
    const fitsBelow = tr.bottom + gap + pr.height <= window.innerHeight;
    let renderAbove = preferAbove;
    if (preferAbove && !fitsAbove && fitsBelow) renderAbove = false;
    if (!preferAbove && !fitsBelow && fitsAbove) renderAbove = true;

    let top: number;
    let left: number;
    switch (this.placement) {
      case 'left':
        top = tr.top;
        left = tr.left - gap - pr.width;
        break;
      case 'right':
        top = tr.top;
        left = tr.right + gap;
        break;
      default: // bottom-start, bottom-end, top-start, top-end
        top = renderAbove ? tr.top - gap - pr.height : tr.bottom + gap;
        left = this.placement.endsWith('end') ? tr.right - pr.width : tr.left;
    }

    // Clamp X so an edge-adjacent trigger can't push the panel off-viewport.
    left = Math.max(gap, Math.min(left, window.innerWidth - pr.width - gap));

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }

  show() {
    if (this.open) return;
    this._triggerEl = this._trigger;
    this.open = true;
    const trigger = this._triggerEl;
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute(
        'aria-haspopup',
        this.querySelector('sema-menu') ? 'menu' : this.modal ? 'dialog' : 'true',
      );
    }
    document.addEventListener('pointerdown', this._onDocPointer, true);
    window.addEventListener('scroll', this._onViewportChange, true);
    window.addEventListener('resize', this._onViewportChange);
    this.dispatchEvent(new CustomEvent('sema-open', { bubbles: true, composed: true }));
    // Position the panel and move focus into it (a menu focuses its first item) —
    // both need the post-render panel, so they run after updateComplete.
    this.updateComplete.then(() => {
      if (!this.open) return;
      this._reposition();
      const menu = this.querySelector('sema-menu') as (HTMLElement & { focusFirst?: () => void }) | null;
      if (menu?.focusFirst) menu.focusFirst();
      // getFocusableElements walks shadow roots + slots, so it finds slotted content
      // (a plain panel.querySelector cannot cross the slot/shadow boundary).
      else getFocusableElements(this._panel)[0]?.focus();
    });
  }

  /** Close the popover. By default returns focus to the trigger (Esc/Tab/select). */
  hide(restoreFocus = true) {
    if (!this.open) return;
    this.open = false;
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    window.removeEventListener('scroll', this._onViewportChange, true);
    window.removeEventListener('resize', this._onViewportChange);
    // Resolve the live trigger (it may have been re-slotted) and fall back to the cached ref.
    const trigger = this._trigger ?? this._triggerEl;
    trigger?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger?.focus({ preventScroll: true });
    this.dispatchEvent(new CustomEvent('sema-close', { bubbles: true, composed: true }));
  }

  toggle() {
    if (this.open) this.hide();
    else this.show();
  }

  private _onTriggerClick = () => {
    if (this.openOn === 'click') this.toggle();
  };
  private _onPointerEnter = () => {
    if (this.openOn === 'hover') this.show();
  };
  private _onPointerLeave = () => {
    if (this.openOn === 'hover') this.hide(false);
  };

  private _onKeydown = (e: KeyboardEvent) => {
    if (!this.open) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();
      this.hide(true);
    } else if (e.key === 'Tab' && !this.modal) {
      // Menus don't trap: close and let Tab move focus on from the trigger.
      this.hide(true);
    }
  };

  private _onFocusOut = (e: FocusEvent) => {
    if (this.modal || !this.open) return;
    const next = e.relatedTarget as Node | null;
    // `next` retargets to the light-DOM ancestor when crossing shadow boundaries,
    // so light-DOM containment is the right check for slotted menus/content.
    if (next && this.contains(next)) return;
    this.hide(false);
  };

  private _onSelect = () => this.hide(true); // child menu chose an item

  render() {
    return html`
      <span
        class="trigger"
        part="trigger"
        @click=${this._onTriggerClick}
        @pointerenter=${this._onPointerEnter}
        @pointerleave=${this._onPointerLeave}
        @keydown=${this._onKeydown}
      >
        <slot name="trigger"></slot>
      </span>
      <div
        class="panel"
        part="panel"
        role="presentation"
        ?hidden=${!this.open}
        @keydown=${this._onKeydown}
        @focusout=${this._onFocusOut}
        @sema-select=${this._onSelect}
        @pointerenter=${this._onPointerEnter}
        @pointerleave=${this._onPointerLeave}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sema-popover': SemaPopover;
  }
}
customElements.define('sema-popover', SemaPopover);
