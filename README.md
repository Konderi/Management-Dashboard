# NEXUS // Infrastructure Control Plane & Dashboard

[![Repository](https://img.shields.io/badge/GitHub-Konderi%2FManagement--Dashboard-blue?logo=github)](https://github.com/Konderi/Management-Dashboard.git)
[![Domain](https://img.shields.io/badge/Ingress-dashboard.konderi.fi-orange?logo=cloudflare)](https://dashboard.konderi.fi)
[![Deployment](https://img.shields.io/badge/Deployment-pve--control%20(VLAN%2020)-success)]()
[![Security](https://img.shields.io/badge/Auth-Cloudflare%20Zero%20Trust%20%2B%20PIN-purple)]()

A high-performance, cyber-sleek centralized management platform and telemetry dashboard for homelab and edge infrastructure.

---

## 🌐 Connected Infrastructure Fleet

- **Ubiquiti Dream Machine SE (UDM-SE)**: WAN latency, 2.5 GbE & 10G SFP+ telemetry, client tracking, DPI breakdown.
- **Ubiquiti U7 Mesh**: Wi-Fi 7 (802.11be) tri-band spectrum analyzer (6GHz 320MHz MLO / 5GHz / 2.4GHz), client PHY rates & signal tracking.
- **Aruba 2530-8G-PoE+ Switch (J9774A)**: Interactive 8-port + 2 SFP visual faceplate, live PoE power budget (67W), and click-to-power-cycle PoE ports to remotely reboot attached hardware.
- **Proxmox VE Fleet**:
  - **Standalone Control Node (`pve-control`)**: HP ProDesk 600 G3 (`192.168.50.15` / `192.168.20.15`).
  - **3-Node Compute Cluster (`pve-01`, `pve-02`, `pve-03`)**: HP EliteDesk 800 G4 Minis (`192.168.50.11-13`) with Corosync HA quorum.
  - VM/LXC power actions (Start, Reboot, Stop) and real-time CPU/RAM telemetry.
- **Kubernetes Cluster**: Node health, pod status matrix with namespace filtering, and zero-downtime deployment rollout restart triggers.
- **AI Worker Nodes**: Dual GPU acceleration (NVIDIA RTX 4090 24GB + A100 SXM4 80GB), VRAM allocation bars, wattage, temperature, loaded model tags (Ollama & vLLM), and interactive inference throughput benchmark sandbox (tokens/sec).
- **BotFarm Trading Fleet**: Live algorithmic trading telemetry across 5 Freqtrade bots (Konderi, Konderi Dynamic, Tehoz, Zeller, Coali) with live PnL, win rates, and container restart actions.
- **Security & Remote Ingress**: Outbound **Cloudflare Tunnel (`cloudflared`)** on `dashboard.konderi.fi` with **Cloudflare Access (Zero Trust)** JWT validation, and local Admin PIN fallback for direct LAN / **Ubiquiti WifiMan VPN** access.

---

## 🏗️ Architecture & Deployment Strategy

### Where Should This Run?

> [!IMPORTANT]
> **Recommended Target:** Deploy on the **Standalone Control Node (`pve-control` - HP ProDesk 600 G3)** in **VLAN 20 (Management VLAN: `192.168.20.10`)** via Docker Compose or a dedicated Debian 12 LXC (CT ID 105).

#### Why Not on the 3-Node Compute Cluster?
1. **Out-of-Band Management & Survivability**: If the 3-node cluster loses quorum, undergoes a cluster-wide reboot, or encounters maintenance during Ceph/Corosync updates, the standalone control node remains 100% operational. If the dashboard were hosted on the cluster, you'd lose visibility and management control at the exact moment an outage occurs.
2. **Resource Isolation from Trading & AI Workloads**: The 3-node compute cluster is dedicated to heavy workloads (Kubernetes, BotFarm Freqtrade bot fleet, backtesting, and AI models). The management control plane must have guaranteed CPU/RAM and never experience latency spikes from algorithmic backtesting.
3. **Network VLAN 20 Access**: The standalone node has direct trunk/access to VLAN 20 (`192.168.20.0/24`) where the Aruba switch management IP (`192.168.20.2`) and UDM-SE management interfaces reside.

```
 [ Public Internet ]
          │
          ▼
 [ Cloudflare Edge PoP (Helsinki / Stockholm) ]
          │ (Zero Trust Identity Provider: OTP / Google / GitHub)
          │ (Checks Cf-Access-Jwt-Assertion)
          ▼ (Outbound Encrypted Tunnel - 0 Open Router Ports)
 [ cloudflared Daemon on pve-control ]
          │
          ▼
 [ NEXUS Control Plane (:3001) ] ── pve-control (HP ProDesk 600 G3, VLAN 20)
   ├── Express REST API + Server-Sent Events (SSE) Live Stream
   ├── Cloudflare JWT / Local PIN Security Middleware
   ├── Device Drivers (UniFi, Aruba REST/SSH, Proxmox, K8s, Ollama, vLLM)
   └── Reactive Cyber-Glassmorphic React 19 Frontend
          │
  ┌───────┼──────────────────────────────┬──────────────────────────────┐
  ▼       ▼                              ▼                              ▼
UDM-SE  Aruba 2530-8G-PoE        Proxmox VE Cluster             AI Worker Nodes
Gateway   ├── Port 1: U7 Mesh     ├── pve-01 (EliteDesk Mini)    ├── Node 01: RTX 4090
          ├── Port 2: UDM-SE      ├── pve-02 (EliteDesk Mini)    │   └── Ollama (Llama 3.3)
          ├── Port 3-4: AI Nodes  └── pve-03 (EliteDesk Mini)    └── Node 02: A100 SXM4
          ├── Port 5: Proxmox        ├── Kubernetes Cluster          └── vLLM (DeepSeek-R1)
          ├── Port 6: G5 Cam         └── BotFarm Trading Bots
          └── Port 7: HomeAssistant
```

---

## 🔒 What Else Is Needed From Cloudflare?

Beyond the domain (`konderi.fi`) and the tunnel (`cloudflared`), here is the complete checklist of Cloudflare components used:

| Cloudflare Component | Purpose | How to Configure |
| :--- | :--- | :--- |
| **Cloudflare Zero Trust** | Identity and Access Management (IAM) gatekeeper | Free plan (up to 50 seats) at `one.dash.cloudflare.com`. |
| **Cloudflare Access Application** | Blocks public access to `dashboard.konderi.fi` before traffic touches your homelab | **Access** → **Applications** → **Add an Application** → **Self-hosted**. Hostname: `dashboard.konderi.fi`. |
| **Identity Provider (IdP)** | Authenticates you (OTP to email, Google, GitHub, or Passkey/FIDO2) | **Settings** → **Authentication** → **Login Methods**. (One-time PIN requires zero external setup). |
| **Access Policy** | Whitelists allowed users | Rule: `Include` → `Emails` (e.g. `your.email@gmail.com`). |
| **Application Audience Tag (`AUD`)** | Cryptographic verification | In Application settings, copy the **AUD tag** and set `CF_ZERO_TRUST_AUD` in `.env`. The backend validates the cryptographic signature of `Cf-Access-Jwt-Assertion`. |
| **SSL/TLS Mode** | End-to-end encryption | In Cloudflare DNS/SSL tab, set SSL mode to **Full** or **Full (Strict)**. Edge certs are automatically renewed. |
| **WAF & Bot Protection** | Defense-in-depth | Enable **Bot Fight Mode** and optionally a rate limiting rule (e.g. max 100 req/min). |

---

## 🚀 Quick Start & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/Konderi/Management-Dashboard.git
cd Management-Dashboard
npm install
```

### 2. Run Development Servers
Starts both the Express backend (`:3001`) and Vite dev server (`:3000`):
```bash
npm run dev:all
```
Open `http://localhost:3000` in your browser.

---

## 📦 Production Deployment on Proxmox (`pve-control`)

### Option A: Docker Compose (Recommended)

1. Create a directory on `pve-control`:
   ```bash
   mkdir -p /opt/management-dashboard
   cd /opt/management-dashboard
   ```
2. Copy `docker-compose.yml`, `Dockerfile`, and `.env.example` to the host:
   ```bash
   cp .env.example .env
   # Edit .env with your Cloudflare tunnel token, Proxmox API token, and credentials
   nano .env
   ```
3. Start the stack:
   ```bash
   docker compose up -d --build
   ```
4. Verify containers are healthy:
   ```bash
   docker compose ps
   docker compose logs -f
   ```

### Option B: Proxmox LXC Container (Debian 12)

1. On `pve-control` Proxmox web UI (`https://192.168.50.15:8006`):
   - Create CT: ID `105`, hostname `nexus-control`.
   - Template: `debian-12-standard`.
   - Disks: 16 GB SSD.
   - CPU: 2 vCPUs.
   - RAM: 2048 MB.
   - Network: Bridge `vmbr0`, VLAN Tag `20`, IPv4 `192.168.20.10/24`, Gateway `192.168.20.1`.
2. Inside the container:
   ```bash
   apt update && apt install -y curl git docker.io docker-compose-plugin
   git clone https://github.com/Konderi/Management-Dashboard.git /opt/nexus
   cd /opt/nexus
   cp .env.example .env
   nano .env
   docker compose up -d --build
   ```

---

## 🔑 Environment Variables Reference

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | Backend HTTP port |
| `NODE_ENV` | `production` | Node environment |
| `UNIFI_HOST` | `https://192.168.1.1` | Ubiquiti UDM-SE IP/Hostname |
| `UNIFI_USER` | `admin` | UniFi local administrator |
| `UNIFI_PASS` | - | UniFi local password |
| `ARUBA_HOST` | `https://192.168.20.2` | Aruba 2530-8G switch IP (VLAN 20) |
| `ARUBA_USER` | `manager` | Aruba switch admin user |
| `ARUBA_PASS` | - | Aruba switch admin password |
| `PROXMOX_HOST` | `https://192.168.50.15:8006` | Proxmox VE API endpoint |
| `PVE_TOKEN_USER` | `root@pam!nexus` | Proxmox API token ID |
| `PVE_TOKEN_SECRET`| - | Proxmox API secret UUID |
| `OLLAMA_HOST` | `http://192.168.50.21:11434` | Ollama AI server URL |
| `VLLM_HOST` | `http://192.168.50.22:8000` | vLLM OpenAI-compatible endpoint |
| `CF_TUNNEL_TOKEN` | - | Cloudflare Zero Trust Tunnel Token |
| `CF_TEAM_NAME` | `konderi` | Cloudflare Zero Trust team domain |
| `CF_ZERO_TRUST_AUD`| - | Application Audience tag for JWT validation |
| `LOCAL_AUTH_PIN` | `1337` | Local fallback PIN for direct LAN / VPN access |

---

## 🛡️ License

MIT © [Toni Joronen (Konderi)](https://github.com/Konderi)