# SEO Audit Prompt — адаптированный под проект Sub-Zero / Wolf Repair

**Роль:** Principal SEO + Technical SEO + CRO + Senior Frontend (Static HTML) + GA4/GTM аналитик + QA + редактор.

**Цель:** Поднять органику (SEO) и не ухудшить конверсию платного трафика.

**Проект:** Сайт ремонта Sub-Zero/Wolf на Netlify. Статический HTML (нет Next.js/React). Маршруты — папки и `index.html`: корень, `subzero/`, `wolf/`, `services/`, `brands/subzero/`, `brands/wolf/`.

---

## ВАЖНО: разделение страниц

### A) SEO-страницы (можно менять под органику)
- `/services/` — `services/index.html`
- `/brands/subzero/` — `brands/subzero/index.html`
- `/brands/wolf/` — `brands/wolf/index.html`

Эти страницы можно расширять: контент, зоны обслуживания, FAQ, Schema, внутренняя перелинковка, заголовки H2/H3.

### B) Paid-лендинги (НЕ ТРОГАТЬ структуру и конверсию)
- `/` — `index.html` (главная)
- `/subzero/` — `subzero/index.html`
- `/wolf/` — `wolf/index.html`

Не менять: форму, CTA, блоки с ремонтами, табы, модалки, скрипты конверсии. Допустимы только осторожные правки: meta (title/description/canonical), минимальные дополнения Schema, без изменения вёрстки и сценариев.

### C) Главная страница (/)
Можно «ещё немного адаптировать» под SEO: уточнить meta, canonical, Schema (LocalBusiness/FAQPage), не трогая форму, кнопки, аккордеон и платный сценарий.

---

## ЧТО СДЕЛАТЬ (в порядке приоритета)

### ШАГ 1 — Технический аудит индексации
- Проверить: `robots.txt`, `sitemap.xml`, meta robots, canonical на всех страницах, редиректы в `netlify.toml`.
- Убедиться, что в `robots.txt` есть строка: `Sitemap: https://wolf-subzero-repair.netlify.app/sitemap.xml` (или актуальный домен).
- SEO-страницы: index, follow; canonical на себя.
- Paid-лендинги: не делать noindex без явного решения; canonical на себя.
- Если sitemap генерируется вручную — держать в актуальном состоянии все индексируемые URL.

### ШАГ 2 — On-page SEO (унификация мета)
- Для каждой страницы задать уникальные: Title (≤ 60 символов), Description (≤ 155), ровно один H1, логичную структуру H2/H3.
- Учитывать интенты: repair, service, same day, city, appliance type, brand (Sub-Zero, Wolf).
- Не менять разметку и контент платных лендингов; при необходимости — только title/description.

### ШАГ 3 — Структурированные данные (Schema)
- JSON-LD: LocalBusiness (или ProfessionalService), при необходимости Service, FAQPage (где есть FAQ), BreadcrumbList где уместно.
- Консистентность NAP (phone, address, company) по всему сайту.
- Проверка через Rich Results Test / Search Console.

### ШАГ 4 — Локальная SEO-архитектура
- Зоны обслуживания уже расширены на SEO-страницах (Bay Area, LA, San Diego, Seattle + города).
- Возможные следующие шаги (без тонких дублей): отдельные location-страницы только при наличии уникального контента (локальные сигналы, время выезда, FAQ, отзывы). Иначе — не создавать.
- Карта внутренней перелинковки: главная ↔ services, brands/subzero, brands/wolf; перекрёстные ссылки между брендами и услугами.

### ШАГ 5 — Performance / CWV
- Изображения: lazy loading, атрибуты width/height где нужно, preload для hero при необходимости.
- В `netlify.toml`: кеширование, сжатие (если ещё не настроено).

### ШАГ 6 — CRO без вреда SEO
- На SEO-страницах: полезные блоки (признаки поломок, что проверяем, процесс, гарантии) — уже частично есть, можно дополнять.
- На paid-лендингах: не менять форму, CTA и сценарии.
- Формы: валидация, a11y, микро-тексты, доверие — проверять без ломки текущего поведения.

---

## ФОРМАТ ОТВЕТА (для исполнителя аудита)

1. **Таблица:** Страница → (SEO / Paid) → Index/Noindex → Canonical → Что исправить.
2. **Топ-15 проблем** по приоритету (P0/P1/P2) с указанием файлов и строк.
3. **Патчи кода:** какие файлы создать/изменить, код блоками (готов к copy-paste).
4. **Чеклист после деплоя:** что проверить в Search Console (coverage, sitemaps, canonical, rich results) и как быстро валидировать.

---

## ДАННЫЕ ПРОЕКТА

- **Стек:** статический HTML, Netlify, GTM, Netlify Functions (`netlify/functions/lead.js`).
- **Файлы:** `index.html`, `subzero/index.html`, `wolf/index.html`, `services/index.html`, `brands/subzero/index.html`, `brands/wolf/index.html`; `robots.txt`, `sitemap.xml`, `netlify.toml`; изображения в `assets/images/repairs/`.
- **Домен/контакты:** привести к одному каноническому (например wolf-subzero-repair.netlify.app или прод-домен); NAP единообразно во всех Schema и футерах.
- **FAQ и кейсы:** использовать для Schema FAQPage и внутренней перелинковки на SEO-страницах.

---

## Что можно улучшить дальше (идеи без обязательного выполнения)

- Добавить BreadcrumbList Schema на SEO-страницах.
- Расширить FAQ на SEO-страницах (2–5 вопросов с уникальными ответами) и синхронизировать с FAQPage Schema.
- Проверить и при необходимости расширить `areaServed` в LocalBusiness (регионы + ключевые города).
- Отдельные location-страницы только при готовности писать уникальный контент под каждый город/регион.
- Регулярная сверка sitemap.xml со списком индексируемых URL после добавления новых страниц.
