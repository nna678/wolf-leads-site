# Google Ads Editor Import Package — Hyper Segmentation (No Door, No Cost/Quote)

Campaign: `SZ_Search_BayArea_Hyper_ExactPhrase_2026`
Landing page: `https://appliance-pros.netlify.app/subzero/`
Keywords: 6000 Exact + 6000 Phrase = 12000 rows
Broad keywords: none

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

## Rules applied
- Door/gasket/seal/hinge/handle removed from positives and added to negatives.
- Cost/quote intent excluded from positives.
- Technician/repairman/mechanic/specialist cluster expanded.
- Hyper-segmentation by intent, appliance, symptom, and city.
