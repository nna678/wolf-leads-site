# Чеклист: sitemap и GSC

## Что уже сделано в проекте

- **sitemap.xml** — валидный XML, `lastmod` в прошлом (2025-02-02), без лишних атрибутов.
- **robots.txt** — `Allow: /` и `Sitemap: https://appliancepros.netlify.app/sitemap.xml`.
- **_headers** — для `/sitemap.xml` и `/robots.txt` задан правильный `Content-Type` (application/xml и text/plain).
- **netlify.toml** — те же заголовки в `[[headers]]`.
- **_redirects** — явная отдача `/sitemap.xml` и `/robots.txt` с кодом 200 (чтобы Netlify точно отдавал файлы).

Атрибут `data-tag-assistant-present` в XML в браузере добавляет расширение (Tag Assistant), в самом файле его нет — на GSC это не влияет.

---

## После каждого деплоя

1. **Проверить отдачу sitemap (в терминале):**
   ```bash
   curl -I https://appliancepros.netlify.app/sitemap.xml
   ```
   Ожидается:
   - `HTTP/2 200`
   - `content-type: application/xml; charset=utf-8` (или `application/xml`).

2. **Проверить в браузере (режим инкогнито):**
   - Открыть: https://appliancepros.netlify.app/sitemap.xml
   - Должно быть дерево XML с `<urlset>` и списком `<url>`, без HTML страницы.

---

## В Netlify (панель)

- **Build & deploy** — ничего специально для sitemap не нужно.
- **Post processing** — если включено «Asset optimization», для `.xml` оно обычно не мешает; при проблемах можно отключить и пересобрать.
- **Очистка кэша:** Site configuration → Build & deploy → «Clear cache and retry deploy» — имеет смысл один раз после добавления _headers/_redirects, затем снова задеплоить.

---

## В Google Search Console

1. **Индексирование → Файлы Sitemap**
   - Удалить старую запись sitemap (три точки → Удалить), если статус «Не получено».
   - Добавить снова: в поле ввести только `sitemap.xml` → Отправить.

2. **Проверка URL**
   - URL: `https://appliancepros.netlify.app/sitemap.xml`
   - Нажать «Проверить URL вживую» (Test live URL) — GSC проверит текущую отдачу.
   - Если в ответе виден XML и статус 200 — через 1–2 дня sitemap обычно переходит в «Успешно» и появляются «Обнаружено страниц».

3. **Сроки**
   - После «Отправить» sitemap GSC может обрабатывать его от нескольких часов до 1–2 дней.
   - «Запросить индексирование» для самого URL sitemap ускоряет проверку, но не заменяет ожидание обработки в разделе «Файлы Sitemap».

---

## Если по-прежнему «Не получено»

- Убедиться, что в репозитории есть и закоммичены: `sitemap.xml`, `robots.txt`, `_headers`, `_redirects`, актуальный `netlify.toml`, и последний деплой прошёл без ошибок.
- Ещё раз проверить `curl -I` и «Проверить URL вживую» в GSC — какой код ответа и заголовок `Content-Type`.
- Один раз сделать «Clear cache and retry deploy» в Netlify и снова отправить sitemap в GSC.
