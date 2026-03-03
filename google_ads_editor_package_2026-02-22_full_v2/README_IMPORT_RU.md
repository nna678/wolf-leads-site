# Google Ads Editor import package (FULL v2, 1 Search campaign)

Кампания: `SZ_Search_BayArea_Full_v2`
Лендинг: `https://appliancepros.netlify.app/subzero/`

## Что внутри
- 1 кампания Search.
- Расширенная структура ad groups (интенты + гео-кластеры Bay Area).
- Около 1500 keyword-rows (Exact + Phrase), без Broad.
- По 3 RSA на ad group (1 основной + 2 теста).
- Campaign negatives + расширенный Bay Area geo-лист (города + округа).

## Порядок импорта в Google Ads Editor
1. `Account` -> `Import` -> `From file...` -> `01_campaign.csv`
2. Затем `02_ad_groups.csv`
3. Затем `03_keywords_exact_phrase.csv`
4. Затем `04_rsa_ads_3_per_adgroup.csv`
5. Затем `05_campaign_negative_keywords.csv`
6. Затем `06_locations_bay_area.csv`
7. `Finish and review changes` -> `Keep` -> `Post`

## Важно при импорте
- Использовать режим: `My data includes columns for campaigns and ad groups`.
- Не использовать `Use selected destinations` для keywords.
- Проверить бюджет, гео, расписание, assets/extensions и conversion tracking.