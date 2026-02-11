#!/bin/bash
# Универсальная отправка обновлений в git. Запуск: ./push-updates.sh
# Сообщение коммита меняй в переменной COMMIT_MSG ниже.

set -e
cd "$(dirname "$0")"

COMMIT_MSG="Updates: Same-day or next-day copy, form focus, geo fallbacks, remove Denver"

git add -A
git status

if git diff --staged --quiet; then
  echo "Нет изменений для коммита."
  exit 0
fi

git commit -m "$COMMIT_MSG"
git pull --rebase
git push
