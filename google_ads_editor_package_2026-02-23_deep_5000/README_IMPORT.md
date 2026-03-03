# Google Ads Editor Import Package — Exact + Phrase Only (10K Keywords)

**One campaign.** No broad match. Target leads on exact and phrase only; add broad later if volume is needed.

## Import order

1. **01_campaign.csv** — Single campaign: `SZ_Search_BayArea_ExactPhrase_2026`
2. **02_ad_groups.csv** — 52 themed ad groups (intent + geo)
3. **03_keywords_10000_master.csv** — 5,000 unique keywords × Exact + Phrase = 10,000 rows (or use **03a_keywords_core_exact_phrase.csv**, same content)
4. **04_rsa_ads_1_per_adgroup.csv** — 3 RSAs per ad group (urgency / trust / value)
5. **05_campaign_negative_keywords.csv** — Campaign-level negatives (no shopping/parts/DIY/install)

## Structure

- **Keywords:** 5,000 unique phrases; each in **Exact** and **Phrase** → 10,000 keyword rows total. No Broad.
- **Ad groups:** Tight themes (e.g. Core Brand Repair, Core Near Me, Freezer Repair, Ice Maker Repair, Geo SanFrancisco Repair) for maximum ad relevance and Quality Score.
- **Seed data:** Keywords from `key.xlsx` (branded Sub-Zero repair/service) plus geo and intent expansions.

## Notes

- Bay Area focused for Sub-Zero repair/service leads.
- Negatives exclude other brands, parts, DIY, install/cleaning, and shopping intent.
- To add broad later: create a separate campaign and use the same negatives.
