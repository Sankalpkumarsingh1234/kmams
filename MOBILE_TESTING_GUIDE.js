/*
╔════════════════════════════════════════════════════════════════════════════╗
║                   MOBILE RESPONSIVENESS TEST GUIDE                          ║
║              GigShield - Test on 480px width (Mobile), 768px (Tablet)       ║
╚════════════════════════════════════════════════════════════════════════════╝

HOW TO TEST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTION 1: Chrome DevTools (Fastest)
  1. Open app: http://localhost:5175
  2. Press F12 (DevTools)
  3. Click device toggle (Ctrl+Shift+M)
  4. Select iPhone 12 / iPhone SE (375-480px width)
  5. Or set custom width: 480px
  6. Reload page & test all 4 screens
  7. Test in Landscape mode too

OPTION 2: Android Phone (Real Device)
  1. Connect phone via USB (USB Debugging enabled)
  2. Chrome DevTools → Remote devices
  3. Or visit: http://<your-computer-ip>:5175 from phone
  4. Test onboarding → risk → policy → dashboard flows

OPTION 3: iPhone/iPad Simulator
  1. iPhone XR: 414px width (similar to test conditions)
  2. iPhone SE: 375px width (smallest)
  3. iPad: 768px width (tablet)


CHECKLIST - CRITICAL ISSUES TO FIX:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─ ONBOARDING SCREEN (Step 1/4) ─────────────────────────────────────────────
│
│ ☐ Form labels readable (not cramped)
│ ☐ Input fields full-width, 44px tall (tap-friendly)
│ ☐ Font size ≥ 16px (prevents iOS auto-zoom)
│ ☐ Button text not cut off
│ ☐ Platform selector (Zomato/Swiggy) both visible
│ ☐ Pin code input accepts 6 digits
│ ☐ Error messages visible below inputs
│ ☐ CTA button ("Calculate risk") spans full width
│

│ EXPECTED BEHAVIOR:
│ • All form fields stack vertically
│ • No horizontal scroll needed
│ • Inputs take full 85-90% of card width
│ • Submit button takes 100% width at bottom
│

├─ RISK SCREEN (Step 2/4) ───────────────────────────────────────────────────
│
│ ☐ NFI Gauge (circular) fits in viewport
│ ☐ Risk factor boxes stack below gauge (not beside)
│ ☐ Each factor box: label + value visible
│ ☐ Text not truncated
│ ☐ Warning box (zone info) is readable
│ ☐ "See options" button accessible
│

│ EXPECTED BEHAVIOR:
│ • Gauge: 100-120px diameter
│ • Boxes: full width below gauge
│ • Font sizes: 12px labels, 13px values
│ • No horizontal scroll
│

├─ POLICY SCREEN (Step 3/4) ─────────────────────────────────────────────────
│
│ ☐ Tier cards (Basic/Standard/Premium) stack vertically
│ ☐ Each card shows: name, coverage, price
│ ☐ Selected tier expands breakdown (no overflow)
│ ☐ Prices clearly visible (₹XX format)
│ ☐ Breakdown details legible (Base, Surcharge, Loyalty)
│ ☐ "Activate shield" button full width
│

│ EXPECTED BEHAVIOR:
│ • 1 card per row (not 3 wide)
│ • Expanded breakdown: 90% card width
│ • Font: 14px card header, 11px breakdown
│ • Prices right-aligned
│

├─ DASHBOARD (Step 4/4) ─────────────────────────────────────────────────────
│
│ ☐ Header (Welcome back, status badge) on one line or stacked
│ ☐ Tab bar: tabs scroll horizontally (not all visible)
│ ☐ Active tab highlight clear
│ ☐ 3-column stats grid collapses to 1-2 columns
│ ☐ Storm alert: full-width, text wraps
│ ☐ Disruption feed items don't have horizontal scroll
│ ☐ Each feed item: icon + info + severity badge visible
│ ☐ UPI flow (payout states) progress bars visible
│

│ EXPECTED BEHAVIOR:
│ • Header: name below logo (stacked on 480px)
│ • Tabs: horizontal scroll, 5-6 visible (not all 8)
│ • Stats: 1x3 grid on mobile, 2x2 on 600px+
│ • Feed: 100% width items, no side scroll
│

├─ GLOBAL/HEADER ───────────────────────────────────────────────────────────
│
│ ☐ GigShield logo + title visible
│ ☐ Language toggle button (EN/हिंदी) clickable
│ ☐ INSURER VIEW button present & clickable
│ ☐ Header doesn't push content down on scroll
│ ☐ Header text (logo + subtitle) fits on 1 line or wraps nicely
│

│ EXPECTED BEHAVIOR:
│ • Header: 14px padding (not 22px like desktop)
│ • Logo: 28px diameter
│ • Buttons: 8-10px padding, 10px font
│ • No overflow on language button


LAYOUT BREAKPOINTS (Already in CSS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@media (max-width: 768px) {
  - Tablet adjustments
}

@media (max-width: 480px) {
  - Mobile critical fixes:
    * Input font: 16px (prevents iOS zoom)
    * Button font: 16px
    * Padding: reduced 12px gap
    * Grid: 1 column
    * Font sizes: -2px from desktop


COMMON MOBILE ISSUES & SOLUTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ ISSUE: Text is cut off / overlapping
✓ SOLUTION: Add max-width container, reduce padding, use flex wrapping

❌ ISSUE: Button too small to tap (< 44px)
✓ SOLUTION: Increase padding, line-height to 44-48px min

❌ ISSUE: Horizontal scroll (content wider than screen)
✓ SOLUTION: Remove fixed widths, use max-width for cards, add overflow-x: hidden

❌ ISSUE: Form inputs zoom in iOS when focused
✓ SOLUTION: Set font-size ≥ 16px for inputs

❌ ISSUE: Header/tabs not enough space
✓ SOLUTION: Use horizontal scroll for tabs, short text abbreviations

❌ ISSUE: Images too big
✓ SOLUTION: Use max-width: 100%, height: auto

❌ ISSUE: Grid breaks on small screens
✓ SOLUTION: Use 1-column layout on 480px, 2-column at 600px+


PERFORMANCE NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Animations on 480px: Keep under 0.5s (battery impact)
• No heavy shadows deep-box-shadows (= fewer pixels)
• Use will-change sparingly
• Test on low-end Android (Galaxy A12, Poco, etc.)


DEVICES TO TEST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Portrait mode (critical):
  • iPhone SE (375px) ← minimum screen width
  • iPhone 12 (390px)
  • Galaxy S21 (360px)
  • Galaxy A12 (360px)

Landscape mode (test briefly):
  • Any phone rotated

Tablet:
  • iPad 7th gen (810px)
  • Galaxy Tab (600px)


TESTING COMMAND:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In VS Code terminal:
  # Generate responsive screenshot at multiple sizes
  npm run responsive-test  (if configured)
  
Or manually via DevTools:
  • Capture screenshot at 480px, 600px, 768px widths
  • Compare on phone if available


REPORT ISSUES FOUND:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Document issues as:
  Screen: [Onboarding/Risk/Policy/Dashboard]
  Issue: [Description]
  Width: [480px/600px/768px]
  Device: [iPhone SE/Galaxy A12/iPad]
  Fix: [Adjust padding/font/grid/etc]

*/
