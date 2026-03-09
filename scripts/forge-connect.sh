#!/bin/bash
# Forge Financial — EC2 Access via AWS SSM Session Manager
# No SSH keys needed. Uses your AWS profile (onedevops).
#
# Usage:
#   ./scripts/forge-connect.sh              # Open interactive shell
#   ./scripts/forge-connect.sh run "cmd"    # Run a single command
#   ./scripts/forge-connect.sh deploy       # Rebuild & restart the app
#   ./scripts/forge-connect.sh logs         # Tail container logs
#   ./scripts/forge-connect.sh nginx-reload # Reload nginx (prod stack)

set -e

INSTANCE_ID="i-0a18493e836990c06"
AWS_PROFILE="onedevops"
REGION="us-east-1"

_ssm_run() {
  local cmd="$1"
  CMD_ID=$(aws --profile "$AWS_PROFILE" --region "$REGION" ssm send-command \
    --instance-ids "$INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=[\"$cmd\"]" \
    --query "Command.CommandId" \
    --output text)

  sleep 4
  aws --profile "$AWS_PROFILE" --region "$REGION" ssm get-command-invocation \
    --command-id "$CMD_ID" \
    --instance-id "$INSTANCE_ID" \
    --query "StandardOutputContent" \
    --output text
}

case "${1:-shell}" in
  shell)
    echo "==> Opening SSM session to Forge Financial (${INSTANCE_ID})..."
    aws --profile "$AWS_PROFILE" --region "$REGION" ssm start-session \
      --target "$INSTANCE_ID"
    ;;

  run)
    shift
    _ssm_run "$*"
    ;;

  deploy)
    echo "==> Deploying latest code..."
    _ssm_run "cd /app/itm-financial-schedule && git pull origin main && docker compose -f docker-compose.ec2.yml up -d --build && docker image prune -f && echo DONE"
    ;;

  logs)
    echo "==> Tailing logs (Ctrl+C to stop)..."
    aws --profile "$AWS_PROFILE" --region "$REGION" ssm start-session \
      --target "$INSTANCE_ID" \
      --document-name "AWS-StartInteractiveCommand" \
      --parameters 'command=["docker logs -f forge-financial"]'
    ;;

  nginx-reload)
    echo "==> Reloading nginx..."
    _ssm_run "docker compose -f /app/itm-financial-schedule/docker-compose.prod.yml exec nginx nginx -s reload && echo Reloaded"
    ;;

  *)
    echo "Usage: $0 [shell|run <cmd>|deploy|logs|nginx-reload]"
    exit 1
    ;;
esac
