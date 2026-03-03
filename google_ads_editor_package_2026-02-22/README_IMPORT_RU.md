# Google Ads Editor import package (1 Search campaign)

Кампания: `SZ_Search_BayArea_Core`
Лендинг: `https://appliancepros.netlify.app/subzero/`

## Что внутри
- `01_campaign.csv` — создаёт кампанию Search.
- `02_ad_groups.csv` — создаёт ad groups.
- `03_keywords_exact_phrase.csv` — только Exact и Phrase.
- `04_rsa_ads_3_per_adgroup.csv` — по 3 RSA на ad group (1 primary + 2 tests).
- `05_campaign_negative_keywords.csv` — campaign-level минус-слова.
- `05a_negative_keywords_paste.txt` — быстрый список для вставки в Campaign negatives.
- `06_locations_bay_area.csv` — гео-таргетинг Bay Area (список городов).

## Порядок импорта в Google Ads Editor
1. `Account` -> `Import` -> `From file...` -> выбери `01_campaign.csv`.
2. Аналогично импортируй `02_ad_groups.csv`.
3. Импортируй `03_keywords_exact_phrase.csv`.
4. Импортируй `04_rsa_ads_3_per_adgroup.csv`.
5. Импортируй `05_campaign_negative_keywords.csv`.
6. Импортируй `06_locations_bay_area.csv`.
7. Нажми `Keep` / `Finish and review changes`, затем `Post`.

## Важно проверить перед Post
- Дневной бюджет (`Campaign daily budget`) под ваш лимит.
- Корректно ли распознались гео-локации из `06_locations_bay_area.csv`.
- График показа, номер телефона в assets/extensions, conversion tracking.
- Статусы всех сущностей: Enabled.