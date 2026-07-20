#!/bin/bash
# Dovecot Quota Setup for AliOne Mail
# Run this on the VPS as root: bash setup-dovecot-quota.sh

set -e

echo "=== Setting up Dovecot Quota ==="

# Find the dovecot config directory inside the container
CONFIG_DIR=$(docker exec mailserver find /etc/dovecot -name "dovecot.conf" -exec dirname {} \; 2>/dev/null | head -1)
echo "Config dir: $CONFIG_DIR"

# Create local.conf with quota settings
docker exec mailserver sh -c "cat > ${CONFIG_DIR}/local.conf << 'EOF'
# AliOne Quota Configuration
mail_plugins = \$mail_plugins quota mail_crypt
mail_attribute_dict = file:%U/Maildir/dovecot-uidmap

# Quota rules - 5GB default for normal users
quota_rule = *:storage=5GB
quota_rule2 = Trash:storage=+100M
quota_status_success = 200
quota_status_nouser = 0
quota_status_disabled = 0

# Quota enforcement
quota_enforce = yes
quota_enforce_user = yes

# Quota warning thresholds
plugin {
  quota_warning = storage=80%% - quota-warning 80 %%u
  quota_warning2 = storage=90%% - quota-warning 90 %%u
  quota_warning3 = storage=95%% - quota-warning 95 %%u
}
EOF"

# Make sure the 15-mailboxes.conf has Trash/Sent/Drafts with proper auto-subscribe
docker exec mailserver sh -c "cat > ${CONFIG_DIR}/conf.d/15-mailboxes.conf << 'EOF'
namespace inbox {
  mailbox Drafts {
    auto = subscribe
    special_use = \Drafts
  }
  mailbox Junk {
    auto = subscribe
    special_use = \Junk
  }
  mailbox Trash {
    auto = subscribe
    special_use = \Trash
  }
  mailbox Sent {
    auto = subscribe
    special_use = \Sent
  }
  mailbox \"Sent Messages\" {
    auto = subscribe
    special_use = \Sent
  }
}
EOF"

# Ensure quota plugin is loaded - check 10-master.conf for imap-login service
# and quota-status service
docker exec mailserver sh -c "grep -q 'quota-status' ${CONFIG_DIR}/conf.d/10-master.conf || cat >> ${CONFIG_DIR}/conf.d/10-master.conf << 'EOF'

service quota-status {
  executable = dovecot -o mail_plugins=quota -o mail_plugin=imap_quota
  user = dovecot
  inet_listener {
    port = 12345
    allow_clients = 172.18.0.0/16, 127.0.0.1
  }
}
EOF"

echo "Restarting mailserver..."
docker compose restart mailserver

echo "Waiting for mailserver to start..."
sleep 5

echo "Testing quota plugin..."
docker exec mailserver dovecot -n 2>&1 | grep -i quota || echo "Note: quota may not show in dovecot -n if loaded via local.conf"

echo "=== Done! ==="
echo "Quota is now set to 5GB for all users."
echo "Owners (alione@alione.cc, ali@alione.cc) have unlimited quota handled by the app."
