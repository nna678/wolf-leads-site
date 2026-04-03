# Google Ads Editor Import Package — Hyper Segmentation v3+ (Quality Score / CTR / CR Boost)

Campaign: `SZ_Search_BayArea_Hyper_ExactPhrase_2026_v3`
Landing page: `https://my-appliance-repair.pro/subzero/`

## What was improved in v3+
- Added new geo and high-intent ad groups to tighten query-to-ad relevance.
- Expanded exact/phrase keywords for new clusters with no duplicate rows.
- Added stricter campaign and ad-group negatives to cut low-intent traffic.
- Increased RSA volume and intent-specific messaging for expected CTR and ad relevance.
- Expanded sitelinks, callouts, structured snippets, and Bay Area location coverage.
- Kept old structure intact and only added/expanded entities.

## Import order
1. 01_campaign.csv
2. 02_ad_groups.csv
3. 03_keywords_12000_master.csv (or 03a_keywords_exact_phrase.csv)
4. 04_rsa_ads_3_per_adgroup.csv
5. 05_campaign_negative_keywords.csv
6. 06_ad_group_negative_keywords.csv
7. 07_sitelinks.csv
8. 08_callouts.csv
9. 09_structured_snippets.csv
10. 10_locations_bay_area.csv

## Post-import (recommended)
- Use conversion goals focused on qualified lead actions.
- Keep exact/phrase priority and monitor search terms daily in launch week.
- Promote top-performing RSAs and replace low-rated assets weekly.
