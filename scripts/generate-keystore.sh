#!/usr/bin/env bash
# scripts/generate-keystore.sh
# 生成 VirtualXposed release 签名 keystore，并输出 base64 编码，
# 用于存入 GitHub Secrets (VXP_KEYSTORE_BASE64)。
# 首次配置 CI 签名时运行一次。keystore 一旦用于发布 Release 后不可更换（否则签名不一致）。

set -euo pipefail

OUT="${1:-release.jks}"
ALIAS="vxp"
STORE_PWD="virtualxposed"
KEY_PWD="virtualxposed"

if [ -f "$OUT" ]; then
  echo "ERROR: $OUT 已存在，如需重新生成请先删除或指定其他路径。" >&2
  exit 1
fi

echo "==> 生成 keystore: $OUT (alias=$ALIAS)"
keytool -genkeypair -v \
  -keystore "$OUT" \
  -storetype JKS \
  -keyalg RSA -keysize 2048 -validity 36500 \
  -alias "$ALIAS" \
  -storepass "$STORE_PWD" \
  -keypass "$KEY_PWD" \
  -dname "CN=VirtualXposed, OU=Dev, O=android-security-engineer, C=CN"

echo ""
echo "==> 完成。请将以下值填入 GitHub 仓库 Secrets（Settings → Secrets and variables → Actions）："
echo ""
echo "  VXP_KEYSTORE_BASE64 : $(base64 -w 0 "$OUT")"
echo "  VXP_KEY_ALIAS       : $ALIAS"
echo "  VXP_STORE_PWD       : $STORE_PWD"
echo "  VXP_KEY_PWD         : $KEY_PWD"
echo ""
echo "⚠️  妥善保管 $OUT，丢失后无法发布同签名的后续版本。"
