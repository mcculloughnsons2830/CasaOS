# Intellectual-Property Checklist — MsFitZ Society

A practical, plain-English checklist for protecting this project: the **code**,
the **brand**, and the **AENIGMA** persona.

> ⚠️ **Not legal advice.** This is orientation, written to help you ask the right
> questions and move quickly. Fees, forms, and rules change and vary by country.
> For anything you want airtight, confirm with a licensed IP attorney. Defaults
> below assume the **United States**; international notes are flagged.

---

## 1. Copyright — your code & written content

Copyright protects your **original expression**: the source code, the UI text,
the README, and the AENIGMA prompt. It does **not** protect general ideas
(astrology, sacred geometry) or third-party libraries (they keep their own
licenses).

- [x] **Automatic on creation** — you already own copyright the moment it's
      written. Nothing to file for that to be true.
- [x] **Mark it** — `LICENSE` (proprietary, All Rights Reserved) + a `©` header
      on every source file. *(Done.)*
- [ ] **Set the legal holder** — replace "MsFitZ Society" in `LICENSE` and the
      `package.json` `author` field with your exact legal name or LLC.
- [ ] **Keep dated records** — the git history timestamps authorship. Keep the
      repo private until you're ready to publish.
- [ ] **(Optional) Register with the U.S. Copyright Office** — at
      [copyright.gov](https://www.copyright.gov) (eCO online filing). Modest fee
      (roughly $45–$65). Registration isn't required to *own* the work, but it's
      required before you can **sue** for infringement and unlocks **statutory
      damages + attorney's fees** — worth it once the product has real value.
- [ ] **International** — the Berne Convention means your copyright is recognized
      in ~180 countries automatically; you don't file per-country.

## 2. Trademark — your brand (name + logo)

Trademark protects **brand identifiers** — "MsFitZ Society," "AENIGMA," the bear
logo — i.e. how customers recognize *you*. This is **separate from copyright**
and is what stops a competitor from using your name.

- [ ] **Use ™ now** — you can put **™** next to "MsFitZ Society" / "AENIGMA"
      today (common-law trademark, no filing needed). Use **®** *only after* a
      registration is granted.
- [ ] **Clearance search** — before filing, search the
      [USPTO TESS database](https://www.uspto.gov/trademarks/search) and a plain
      web/app-store search to make sure the names aren't already taken in your
      space.
- [ ] **Pick the right classes** — software/apps are typically **Class 9** (and
      often **Class 42** for SaaS / online services). You file per class.
- [ ] **File with the USPTO** — via [TEAS](https://www.uspto.gov/trademarks)
      (Trademark Electronic Application System). Expect a government fee per class
      (commonly ~$250–$350/class) plus optional attorney fees.
  - **In use** vs **intent-to-use**: if the app is live, file "use in commerce"
    with a **specimen** (a screenshot showing the mark on the live product). If
    not launched yet, file **intent-to-use (1-B)** to lock your priority date.
- [ ] **Logo vs wordmark** — consider registering both the **wordmark** (the text
      "MsFitZ Society," protects the name in any font) and the **design mark**
      (the bear logo). The wordmark is usually the higher priority.
- [ ] **International** — to protect the brand abroad, the **Madrid Protocol**
      (via WIPO) lets you extend a U.S. application to many countries from one
      filing.

## 3. The AENIGMA persona

- [x] Original work (not a clone of anyone's branded AI) — **copyrightable as
      written content**, covered by your `LICENSE`. *(Done.)*
- [ ] If "AENIGMA" becomes a public-facing product name, treat it as a
      **trademark** too (section 2) and run a clearance search.

## 4. Domains & handles (cheap, do-this-week)

- [ ] Register the matching **domain(s)** (e.g. `.com`, `.ai`) before announcing.
- [ ] Grab the **social / app-store handles** to keep the brand consistent and
      block squatters.

## 5. Secrets & data hygiene (protects the business, not just the IP)

- [x] `.env` is gitignored; no keys in the repo. *(Done.)*
- [ ] Rotate any key that's ever been shared (e.g. pasted in chat).
- [ ] If you collect users' birth data, add a short **privacy policy** and don't
      store more than you need. (The app currently computes charts without
      persisting personal data.)

---

### Fast path (if you only do four things)

1. Put your **legal name** in `LICENSE` + `package.json`.
2. Start using **™** on "MsFitZ Society" and "AENIGMA" today.
3. Do a **USPTO + web clearance search** on both names.
4. File the **wordmark** trademark (Class 9/42) — intent-to-use if pre-launch —
   and register the **copyright** once the product has real value.
