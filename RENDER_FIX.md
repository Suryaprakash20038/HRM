If your page is not showing up on Render, it is likely due to the "SPA Rewrite Rule".

1. Go to your **Render Dashboard**.
2. Select your **Frontend (Static Site)** service.
3. Go to **Settings** -> **Redirects/Rewrites**.
4. Add the following rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`

Without this rule, any page other than `index.html` (like `/walkthrough` or `/login`) will return a 404 error if refreshed or navigated to directly.
