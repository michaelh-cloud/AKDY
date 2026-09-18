# Warranty registration — live form field reference

Captured 2026-09-18 from the live NetSuite "Online Lead Form" embedded at
`/warranty` (compid 4480470, formid 15). `sections/main-warranty.liquid`
keeps using this same NetSuite form as-is (see the section's schema —
`form_url` setting), so nothing below is needed for the page to work.

This is only here in case the form is ever rebuilt as a native Shopify
form (e.g. via a Shopify Flow + metafields, or a warranty-registration
app) instead of the NetSuite iframe — so the field list doesn't have to be
re-captured from the live site.

Intro copy shown above the fields: "To receive warranty service, your
product must be registered within 30 days of purchase."

| Field | Type | Required | Notes |
|---|---|---|---|
| First name | text | yes | |
| Last name | text | yes | |
| Email | text | yes | |
| Phone | text | no | |
| Address | text | yes | |
| City | text | yes | |
| State | select | yes | Full US state list + DC + Puerto Rico + Armed Forces Americas/Europe/Pacific |
| Zip/postal code | text | yes | |
| Country | select | yes | Full ISO country list, defaults to "United States" |
| PID (found at package box) | text | yes | Product ID from the packaging |
| Customer Order Number | text | yes | |
| Purchase Date | text (date picker) | yes | Live form uses a custom "Pick" popup; a native `<input type="date">` is the direct equivalent |
| Where did you purchase? | text | yes | Free text, e.g. retailer name |

Submit button label: "Submit form". Footer note: "* Required fields".
