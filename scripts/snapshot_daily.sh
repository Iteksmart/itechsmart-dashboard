#!/usr/bin/env sh
set -eu

TODAY="$(date -u +%F)"
STATUS_JSON="$(curl -fsS https://api.itechsmart.dev/v1/status/live || echo '{}')"
RECEIPT_JSON="$(curl -fsS https://api.itechsmart.dev/api/v1/verify/auditor-report || echo '{}')"

CONTAINERS="$(printf '%s' "$STATUS_JSON" | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{let j={};try{j=JSON.parse(s)}catch{};console.log(j.infrastructure?.containers_running||j.containers_running||0)})")"
AUTONOMY="$(printf '%s' "$STATUS_JSON" | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{let j={};try{j=JSON.parse(s)}catch{};console.log(j.autonomy?.current_verified_rate_pct||j.autonomy_rate_pct||0)})")"
TOTAL="$(printf '%s' "$RECEIPT_JSON" | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{let j={};try{j=JSON.parse(s)}catch{};console.log(j.raw_ledger_entries||j.total_receipts||0)})")"
ACTION="$(printf '%s' "$RECEIPT_JSON" | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{let j={};try{j=JSON.parse(s)}catch{};console.log(j.non_telemetry_action_receipts||j.action_receipts||0)})")"

docker exec suite-postgres psql -U itechsmart -d core_db -v ON_ERROR_STOP=1 -c "
INSERT INTO platform_daily (snapshot_date, containers_running, total_receipts, action_receipts, autonomy_rate_pct)
VALUES ('$TODAY', $CONTAINERS, $TOTAL, $ACTION, $AUTONOMY)
ON CONFLICT (snapshot_date) DO UPDATE SET
containers_running=EXCLUDED.containers_running,
total_receipts=EXCLUDED.total_receipts,
action_receipts=EXCLUDED.action_receipts,
autonomy_rate_pct=EXCLUDED.autonomy_rate_pct;
INSERT INTO analytics_snapshots (snapshot_date, metric_key, metric_value, source)
VALUES ('$TODAY', 'gtm_status_live', '$STATUS_JSON'::jsonb, 'api.itechsmart.dev')
ON CONFLICT (snapshot_date, metric_key) DO UPDATE SET metric_value=EXCLUDED.metric_value, source=EXCLUDED.source;
"
