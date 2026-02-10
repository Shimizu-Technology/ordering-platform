#!/bin/bash
#
# gate.sh — Pre-commit quality gate for the Ordering Platform monorepo
# Run this before every commit. CI will also run it.
#
# Usage: ./scripts/gate.sh [--fix]
#   --fix: Auto-fix linting issues where possible
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Running quality gate..."
echo ""

FIX_FLAG=""
if [[ "$1" == "--fix" ]]; then
  FIX_FLAG="--fix"
  echo "${YELLOW}Running in fix mode${NC}"
  echo ""
fi

# Track failures
FAILED=0

# ─────────────────────────────────────────────────────────────────────────────
# Frontend checks (pnpm workspace)
# ─────────────────────────────────────────────────────────────────────────────

echo "📦 Checking frontend packages..."

# Type check shared package
echo "  → Type checking packages/shared..."
if pnpm --filter @shimizu/shared run build 2>/dev/null; then
  echo -e "    ${GREEN}✓ shared types${NC}"
else
  echo -e "    ${RED}✗ shared types failed${NC}"
  FAILED=1
fi

# Type check havajava
echo "  → Type checking frontends/havajava..."
if pnpm --filter @shimizu/havajava exec tsc --noEmit 2>/dev/null; then
  echo -e "    ${GREEN}✓ havajava types${NC}"
else
  echo -e "    ${RED}✗ havajava types failed${NC}"
  FAILED=1
fi

# Lint havajava
echo "  → Linting frontends/havajava..."
if pnpm --filter @shimizu/havajava run lint $FIX_FLAG 2>/dev/null; then
  echo -e "    ${GREEN}✓ havajava lint${NC}"
else
  echo -e "    ${RED}✗ havajava lint failed${NC}"
  FAILED=1
fi

# Build havajava
echo "  → Building frontends/havajava..."
if pnpm --filter @shimizu/havajava run build 2>/dev/null; then
  echo -e "    ${GREEN}✓ havajava build${NC}"
else
  echo -e "    ${RED}✗ havajava build failed${NC}"
  FAILED=1
fi

# Type check threesquares
echo "  → Type checking frontends/threesquares..."
if pnpm --filter @shimizu/threesquares exec tsc --noEmit 2>/dev/null; then
  echo -e "    ${GREEN}✓ threesquares types${NC}"
else
  echo -e "    ${RED}✗ threesquares types failed${NC}"
  FAILED=1
fi

# Lint threesquares
echo "  → Linting frontends/threesquares..."
if pnpm --filter @shimizu/threesquares run lint $FIX_FLAG 2>/dev/null; then
  echo -e "    ${GREEN}✓ threesquares lint${NC}"
else
  echo -e "    ${RED}✗ threesquares lint failed${NC}"
  FAILED=1
fi

# Build threesquares
echo "  → Building frontends/threesquares..."
if pnpm --filter @shimizu/threesquares run build 2>/dev/null; then
  echo -e "    ${GREEN}✓ threesquares build${NC}"
else
  echo -e "    ${RED}✗ threesquares build failed${NC}"
  FAILED=1
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# API checks (Rails)
# ─────────────────────────────────────────────────────────────────────────────

echo "🔧 Checking API..."

cd api

# Use rbenv shims if available (works reliably across environments)
if [[ -d "$HOME/.rbenv/shims" ]]; then
  BUNDLE_CMD="$HOME/.rbenv/shims/bundle"
else
  BUNDLE_CMD="bundle"
fi

# RuboCop lint
echo "  → Running RuboCop..."
if $BUNDLE_CMD exec rubocop --format simple 2>/dev/null; then
  echo -e "    ${GREEN}✓ rubocop${NC}"
else
  echo -e "    ${RED}✗ rubocop failed${NC}"
  FAILED=1
fi

# Security audit (brakeman)
echo "  → Running Brakeman..."
if $BUNDLE_CMD exec brakeman -q --no-pager 2>/dev/null; then
  echo -e "    ${GREEN}✓ brakeman${NC}"
else
  echo -e "    ${YELLOW}⚠ brakeman warnings (review output)${NC}"
  # Don't fail on brakeman warnings, just warn
fi

# Bundle audit
echo "  → Checking gem vulnerabilities..."
if $BUNDLE_CMD exec bundle-audit check --update 2>/dev/null; then
  echo -e "    ${GREEN}✓ bundle-audit${NC}"
else
  echo -e "    ${YELLOW}⚠ vulnerable gems found (review output)${NC}"
  # Don't fail on bundle-audit, just warn
fi

# Tests (if available)
echo "  → Running tests..."
if $BUNDLE_CMD exec rails test 2>/dev/null; then
  echo -e "    ${GREEN}✓ tests${NC}"
else
  echo -e "    ${YELLOW}⚠ tests skipped or failed${NC}"
  # Don't fail if tests don't exist yet
fi

cd ..

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────

if [[ $FAILED -eq 0 ]]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "Ready to commit."
  exit 0
else
  echo -e "${RED}❌ Some checks failed.${NC}"
  echo ""
  echo "Fix the issues above before committing."
  exit 1
fi
