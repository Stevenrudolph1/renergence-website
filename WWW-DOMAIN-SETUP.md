# www.renergence.com — DigitalOcean Setup Explainer

**Goal:** Make the site accessible at both `renergence.com` and `www.renergence.com`, with one redirecting to the other (so there's one canonical URL, which is better for SEO and avoids duplicate content).

**Hosting:** DigitalOcean App Platform (static site, auto-deploys from GitHub)

---

## What's actually happening right now

When someone types `renergence.com` into a browser, their computer does a DNS lookup — it asks "what IP address does this domain point to?" DO App Platform answered that question when you first set up the custom domain.

`www.renergence.com` is a *different* hostname. Right now it probably goes nowhere, or errors. You need to tell both DNS and DO App Platform that it's valid.

---

## The two-part fix

### Part 1 — DNS: Add a www record

Wherever your DNS is managed (likely your domain registrar — check who you registered renergence.com with), you need to add one record:

```
Type:  CNAME
Name:  www
Value: renergence.com.   ← note the trailing dot, some registrars need it
```

This tells the internet: "www.renergence.com is an alias for renergence.com."

If your DNS is already managed through DigitalOcean (you can check: Networking → Domains in the DO dashboard), add the CNAME record there instead.

---

### Part 2 — DO App Platform: Add www as a domain

Adding the DNS record isn't enough on its own. DO App Platform also needs to know it's supposed to serve traffic for `www.renergence.com`. Otherwise DO will reject the request even if DNS routes it correctly.

Steps:
1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com) → Apps
2. Click on the renergence-website app
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter `www.renergence.com`
6. DO will provision an SSL certificate for it automatically (may take a few minutes)

---

## Redirect: pick one canonical URL

Once both domains work, you want one to redirect to the other — otherwise Google sees two versions of your site. The standard choice is `www` → bare (`renergence.com`).

**The limitation:** DO App Platform's static site hosting does not have a built-in redirect rule between two custom domains. It can redirect HTTP → HTTPS automatically, but not `www` → bare.

**Your options, staying on DO:**

### Option A — Serve both, no redirect (simplest, minor SEO tradeoff)
Both `renergence.com` and `www.renergence.com` work and show the same site. No redirect. Google may split link equity between the two, but you can mitigate this by adding a canonical tag to your HTML:

```html
<link rel="canonical" href="https://renergence.com/" />
```

Add this in the `<head>` of every page. This tells Google which URL is authoritative, even if both work.

**This is the lowest-effort path and acceptable for a site at this stage.**

### Option B — DO Droplet as a redirect server (more infrastructure)
Spin up a $6/mo DO Droplet running nginx with a single redirect rule. All traffic hitting `www.renergence.com` gets a 301 redirect to `renergence.com`. The static site stays on App Platform.

This is overkill for now unless SEO is a pressing concern.

---

## Summary: what to actually do

1. **Add CNAME record** at your DNS provider: `www` → `renergence.com.`
2. **Add `www.renergence.com` as a domain** in DO App Platform → Settings → Domains
3. **Add canonical tag** to every page `<head>`:
   ```html
   <link rel="canonical" href="https://renergence.com/" />
   ```
4. Done. Both URLs work. Canonical tag handles SEO. No redirect infrastructure needed.

---

## Note on "typing https://"

Users never need to type `https://`. Modern browsers prepend it automatically. DO App Platform also auto-redirects HTTP → HTTPS. This is already handled and requires nothing on your end.
