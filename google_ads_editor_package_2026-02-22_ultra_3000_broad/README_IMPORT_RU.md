# Google Ads Editor import package (ULTRA 3000+, Broad-only keywords)

Кампания: `SZ_Search_BayArea_ULTRA3000_Broad`
Лендинг: `https://appliancepros.netlify.app/subzero/`

## Что внутри
- 1 кампания Search.
- Объединены все ключи из `key.xlsx` + расширения + синонимы + опечатки + problem семантика.
- `03_keywords_broad_3000plus.csv`: 3000+ ключевых фраз в ОДНОМ типе соответствия (`Broad`).
- По 3 RSA на ad group (1 основной + 2 теста).
- Широкий Bay Area geo-лист (9 counties + города).

## Порядок импорта
1. `Account` -> `Import` -> `From file...` -> `01_campaign.csv`
2. Затем `02_ad_groups.csv`
3. Затем `03_keywords_broad_3000plus.csv`
4. Затем `04_rsa_ads_3_per_adgroup.csv`
5. Затем `05_campaign_negative_keywords.csv`
6. Затем `06_locations_bay_area.csv`
7. `Finish and review changes` -> `Keep` -> `Post`

## Важно
- Для keywords выбрать режим: `My data includes columns for campaigns and ad groups`.
- Не использовать `Use selected destinations`, иначе будут размножаться строки.
- Если трафик слишком широкий, начни с пониженного CPC и ежедневной минусации search terms.