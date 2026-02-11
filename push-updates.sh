#!/bin/bash
# Отправка всех обновлений в git. Запуск: ./push-updates.sh
# Сообщение коммита можно поменять ниже (переменная COMMIT_MSG).

cd "$(dirname "$0")"

COMMIT_MSG="Updates: Same-day or next-day copy, form focus on first field, remove faster form CTA"

git add -A
git status
git commit -m "$COMMIT_MSG"
git push
