# Magic Rag redemption — live form field reference

Captured 2026-09-18 from the live NetSuite "Online Lead Form" embedded at
`/mg` (compid 4480470, formid 22). `sections/main-magic-rag.liquid` keeps
using this same NetSuite form as-is (see the section's schema — `form_url`
setting), so nothing below is needed for the page to work.

This is only here in case the form is ever rebuilt as a native Shopify
form instead of the NetSuite iframe — so the field list doesn't have to be
re-captured from the live site.

| Field | Type | Required | Notes |
|---|---|---|---|
| Customer Order Number | text | yes | |
| What did you purchase? | select | yes | Range Hood, Kitchen Sink, Kitchen Faucet, Bathtub, Shower Panel, Shower Head, Tub Filler, Bathroom Faucet, Bathroom Mirror |
| Where did you purchase? | text | yes | Free text, e.g. retailer name |
| Nickname used for review | text | yes | The name/handle the customer posted their review under |
| First name | text | yes | |
| Last name | text | yes | |
| Email | text | yes | |
| Phone | text | no | |
| Address | text | yes | |
| City | text | yes | |
| State | select | yes | Full US state list + DC + Puerto Rico + Armed Forces Americas/Europe/Pacific |
| Zip/postal code | text | yes | |
| Country | select | yes | Full ISO country list, defaults to "United States" |
| Link to Review URL | text | yes | Prefilled with "http://" |

Submit button label: "Submit form". Footer note: "* Required fields".
