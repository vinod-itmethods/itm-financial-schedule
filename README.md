# Forge Financial Schedule

A modern internal web app for creating and managing DSP pricing and financial schedules.
Replaces manual Excel workflows with a live, collaborative, browser-based tool.

**Live URL:** https://itm-one.online

---

## Features

- **Dynamic pricing grid** — up to 8 tool columns + Transit Hub, all services from the DSP template
- **Configurator panel** — toggle each service Mandatory / Included / Optional / Hidden
- **Auto-calculations** — One-Time (N), Monthly (O), Annual (P) totals update in real time
- **EPSS pricing** — host-count × configurable rate (default $175/host/month)
- **Implementation pricing** — days × configurable rate (default $250/day)
- **Discounts** — Platform Setup and Implementation/Migration discounts
- **25 DevOps tools** — GitLab, CloudBees, Coder, GitHub, Jira, etc. + free-text
- **Team collaboration** — schedules saved server-side, shared across the team
- **Export to Excel / PDF / Image**

---

## Tech Stack

Next.js 16 · TypeScript · Tailwind CSS · Zustand · xlsx · html2canvas · jsPDF · Docker · nginx · Let's Encrypt

---

## Infrastructure

### Hosting

| Component | Details |
|-----------|---------|
| **Cloud** | AWS EC2 — `i-0a18493e836990c06` (us-east-1b) |
| **OS** | Amazon Linux 2023 |
| **Stack** | Docker Compose (nginx + Next.js app + Certbot) |
| **Domain** | `itm-one.online` |
| **DNS** | Cloudflare (A record → `54.88.149.149`, proxy off) |
| **SSL** | Let's Encrypt (auto-renews every 60 days via certbot container) |
| **AWS Profile** | `onedevops` |

### Architecture

```
Internet → Cloudflare DNS → EC2 (54.88.149.149)
                                  │
                              nginx:443 (SSL)
                                  │
                            app:3000 (Next.js)
```

---

## Security

### IP Allowlist (VPN Only)

Access is restricted at the nginx level. Only the following IPs can reach the site:

| IP | Description |
|----|-------------|
| `99.250.82.141` | VPN client IP |
| `34.199.220.45` | VPN/server IP |

Any other IP receives `403 Forbidden`.

To add or remove IPs, edit `nginx.prod.conf` lines 34–37 and reload nginx:

```bash
./scripts/forge-connect.sh nginx-reload
```

### SSL / TLS

- TLS 1.2 and 1.3 only
- HSTS with 2-year max-age (`includeSubDomains`)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- Certificate: Let's Encrypt — expires 2026-06-07 (auto-renews)

### EC2 Access — No SSH Keys

The EC2 instance uses **AWS SSM Session Manager**. No `.pem` files or SSH keys are stored anywhere.

IAM role `ForgeFinancialSSMRole` (with `AmazonSSMManagedInstanceCore`) is attached to the instance.

---

## EC2 Access & Operations

Use the helper script — requires the `onedevops` AWS profile:

```bash
# Open interactive shell on the EC2 instance
./scripts/forge-connect.sh

# Run a one-off command
./scripts/forge-connect.sh run "docker ps"

# Deploy latest code from main branch
./scripts/forge-connect.sh deploy

# Tail application logs
./scripts/forge-connect.sh logs

# Reload nginx (after config changes)
./scripts/forge-connect.sh nginx-reload
```

Or use raw AWS CLI:

```bash
aws --profile onedevops ssm start-session --target i-0a18493e836990c06
```

---

## CI/CD — GitHub Actions

Every push to `main` automatically deploys to EC2 via SSM (no SSH keys, no stored AWS credentials).

Uses **GitHub OIDC → AWS IAM** federation:

| GitHub Secret | Value |
|---------------|-------|
| `AWS_DEPLOY_ROLE_ARN` | `arn:aws:iam::381491959603:role/ForgeFinancialGHADeployRole` |
| `EC2_INSTANCE_ID` | `i-0a18493e836990c06` |

The deploy role has minimal permissions — SSM `SendCommand` on this instance only.

---

## Local Development

```bash
npm install
npm run dev
# open http://localhost:3000
```

---

## First-Time Production Deploy (new server)

If ever migrating to a new EC2 instance:

**1. Point DNS**

In Cloudflare, update the A record for `itm-one.online` to the new EC2 IP (proxy: off).

**2. Attach SSM IAM Profile**

```bash
aws --profile onedevops ec2 associate-iam-instance-profile \
  --instance-id <new-instance-id> \
  --iam-instance-profile Name=ForgeFinancialInstanceProfile
```

**3. Clone repo on the server**

```bash
git clone https://github.com/vinod-itmethods/itm-financial-schedule.git /app/itm-financial-schedule
```

**4. Add swap (prevents OOM during build)**

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo "/swapfile swap swap defaults 0 0" | sudo tee -a /etc/fstab
```

**5. Issue SSL cert**

```bash
# Start temp nginx for ACME challenge
docker run -d --name nginx-tmp -p 80:80 \
  -v $(pwd)/nginx.http-only.conf:/etc/nginx/conf.d/default.conf:ro \
  -v certbot_www:/var/www/certbot nginx:alpine

# Issue cert
docker run --rm \
  -v certbot_certs:/etc/letsencrypt \
  -v certbot_www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  --email admin@itmethods.com --agree-tos --no-eff-email \
  -d itm-one.online

docker rm -f nginx-tmp
```

**6. Copy cert to compose volume and start stack**

```bash
docker run --rm \
  -v certbot_certs:/src \
  -v itm-financial-schedule_certbot_certs:/dst \
  alpine sh -c "cp -a /src/. /dst/"

docker compose -f docker-compose.prod.yml up -d --build
```

---

## Docker Compose Stacks

| File | Purpose |
|------|---------|
| `docker-compose.prod.yml` | **Production** — nginx + SSL + certbot auto-renew |
| `docker-compose.ec2.yml` | Simple HTTP-only stack (legacy, no longer used) |

---

## File Reference

| File | Purpose |
|------|---------|
| `nginx.prod.conf` | nginx config — SSL, IP allowlist, proxy, security headers |
| `nginx.http-only.conf` | Temp nginx config used only during cert issuance |
| `deploy.sh` | Legacy deploy script (replaced by GitHub Actions + SSM) |
| `scripts/forge-connect.sh` | EC2 access and operations helper |
| `.github/workflows/deploy.yml` | CI/CD — deploys on push to main via SSM |
| `Dockerfile` | Multi-stage Next.js production build |
