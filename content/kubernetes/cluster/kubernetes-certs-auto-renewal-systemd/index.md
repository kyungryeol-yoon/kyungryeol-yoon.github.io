---
title: "[Kubernetes] 🔐 kubeadm 인증서 자동 갱신: systemd 타이머로 만료 방지하기"
date: 2026-05-26
tags: [kubernetes, kubeadm, certificate, systemd, timer, security, pki, renewal]
description: "kubeadm으로 구축한 Kubernetes 클러스터의 인증서를 systemd 타이머와 서비스로 자동 갱신하는 방법을 단계별로 정리했습니다. 만료 30일 전 감지 후 kubeadm certs renew all로 1년 연장합니다."
---

kubeadm으로 설치한 Kubernetes 클러스터의 컨트롤 플레인 인증서는 기본 유효기간이 **1년**입니다.
운영 중인 클러스터에서 인증서가 만료되면 API 서버, 컨트롤러 매니저, 스케줄러가 통신을 멈추면서 클러스터 전체가 마비됩니다.
이 글에서는 **systemd 타이머**로 만료 30일 전에 자동으로 `kubeadm certs renew all`을 실행하여 인증서를 무중단으로 갱신하는 방법을 정리합니다.

---

## 🔑 kubeadm 인증서란?

kubeadm은 클러스터 부트스트랩 시 컨트롤 플레인 구성요소가 사용하는 TLS 인증서를 자동으로 생성합니다.
모든 인증서는 `/etc/kubernetes/pki/` 경로에 저장됩니다.

| 구분 | 인증서 | 용도 |
|------|--------|------|
| CA | `ca.crt`, `ca.key` | 클러스터 루트 CA (유효기간 10년) |
| API Server | `apiserver.crt` | kube-apiserver HTTPS |
| API Server (kubelet) | `apiserver-kubelet-client.crt` | apiserver → kubelet 통신 |
| Front Proxy | `front-proxy-*.crt` | Aggregation Layer |
| etcd | `etcd/*.crt` | etcd 멤버 간 + 클라이언트 통신 |
| kubeconfig 내 인증서 | `admin.conf`, `controller-manager.conf`, `scheduler.conf` | 컨트롤 플레인 컴포넌트 인증 |

> **Tip**: CA 인증서는 10년이지만 그 외 leaf 인증서는 모두 **1년**입니다. CA가 만료되면 클러스터 재설치 수준의 작업이 필요하니, leaf 인증서 갱신 시 CA 만료일도 함께 확인해야 합니다.

---

## 🔍 인증서 만료일 확인하기

### kubeadm으로 확인

`kubeadm certs check-expiration` 명령으로 모든 인증서의 만료일을 한 번에 확인할 수 있습니다.

```bash
sudo kubeadm certs check-expiration
```

출력 예시:

```text
CERTIFICATE                EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY   EXTERNALLY MANAGED
admin.conf                 May 26, 2027 03:00 UTC   364d            ca                      no
apiserver                  May 26, 2027 03:00 UTC   364d            ca                      no
apiserver-kubelet-client   May 26, 2027 03:00 UTC   364d            ca                      no
controller-manager.conf    May 26, 2027 03:00 UTC   364d            ca                      no
etcd-server                May 26, 2027 03:00 UTC   364d            etcd-ca                 no
front-proxy-client         May 26, 2027 03:00 UTC   364d            front-proxy-ca          no
scheduler.conf             May 26, 2027 03:00 UTC   364d            ca                      no

CERTIFICATE AUTHORITY      EXPIRES                  RESIDUAL TIME
ca                         May 24, 2036 03:00 UTC   9y
etcd-ca                    May 24, 2036 03:00 UTC   9y
front-proxy-ca             May 24, 2036 03:00 UTC   9y
```

### openssl로 개별 확인

특정 인증서만 빠르게 확인하고 싶다면 `openssl`을 사용합니다.

```bash
sudo openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -enddate
# notAfter=May 26 03:00:00 2027 GMT
```

---

## 🛠️ 수동 갱신 방법

긴급 상황에서는 `kubeadm certs renew all`로 즉시 갱신할 수 있습니다.

```bash
# 1. 모든 인증서 갱신 (남은 기간과 무관하게 1년 연장)
sudo kubeadm certs renew all

# 2. 컨트롤 플레인 Pod 재시작 (정적 Pod이므로 컨테이너만 재기동)
sudo crictl pods --namespace kube-system \
  --name 'kube-apiserver-*|kube-controller-manager-*|kube-scheduler-*|etcd-*' -q \
  | xargs sudo crictl rmp -f

# 3. admin.conf 백업 후 .kube/config 갱신
sudo cp /etc/kubernetes/admin.conf /root/.kube/config
```

> ⚠️ kubelet 인증서(`/var/lib/kubelet/pki/kubelet-client-current.pem`)는 별도로 자동 회전됩니다. `kubelet.conf`에 `rotateCertificates: true`가 설정되어 있는지 확인하세요.

---

## ⏰ systemd 타이머로 자동 갱신 구성하기

수동 갱신은 휴먼 에러로 누락되기 쉽습니다.
**매주 월요일 새벽 3시에 만료일을 점검하고, 30일 미만이면 자동으로 갱신**하는 systemd 타이머를 구성합니다.

### 동작 흐름

```text
k8s-certs-renew.timer  (매주 월 03:00)
        │ 트리거
        ▼
k8s-certs-renew.service  (oneshot)
        │ ExecStart
        ▼
/usr/local/bin/kube-scripts/k8s-certs-renew.sh
        │
        ├─ kubeadm certs check-expiration
        ├─ 만료까지 30일 미만이면:
        │    ├─ kubeadm certs renew all
        │    ├─ crictl로 컨트롤 플레인 Pod 재기동
        │    └─ admin.conf → /root/.kube/config 복사
        └─ apiserver 기동 대기 (6443 포트)
```

### 1️⃣ 갱신 스크립트 작성

`/usr/local/bin/kube-scripts/k8s-certs-renew.sh` 파일을 생성합니다.

```bash
sudo mkdir -p /usr/local/bin/kube-scripts
sudo tee /usr/local/bin/kube-scripts/k8s-certs-renew.sh > /dev/null <<'EOF'
#!/bin/bash
kubeadmCerts='/usr/local/bin/kubeadm certs'

getCertValidDays() {
  local earliestExpireDate
  earliestExpireDate=$(${kubeadmCerts} check-expiration \
    | grep -o "[A-Za-z]\{3,4\}\s\w\w,\s[0-9]\{4,\}\s\w*:\w*\s\w*\s*" \
    | xargs -I {} date -d {} +%s | sort | head -n 1)
  local today
  today="$(date +%s)"
  echo -n $(( (earliestExpireDate - today) / (24 * 60 * 60) ))
}

echo "## Expiration before renewal ##"
${kubeadmCerts} check-expiration

if [ "$(getCertValidDays)" -lt 30 ]; then
  echo "## Renewing certificates managed by kubeadm ##"
  ${kubeadmCerts} renew all

  echo "## Restarting control plane pods managed by kubeadm ##"
  crictl pods --namespace kube-system \
    --name 'kube-scheduler-*|kube-controller-manager-*|kube-apiserver-*|etcd-*' -q \
    | xargs crictl rmp -f

  echo "## Updating /root/.kube/config ##"
  cp /etc/kubernetes/admin.conf /root/.kube/config
fi

echo "## Waiting for apiserver to be up again ##"
until printf "" 2>>/dev/null >>/dev/tcp/127.0.0.1/6443; do sleep 1; done

echo "## Expiration after renewal ##"
${kubeadmCerts} check-expiration
EOF

sudo chmod +x /usr/local/bin/kube-scripts/k8s-certs-renew.sh
```

> **Tip**: `kubeadm` 바이너리 경로는 환경마다 다릅니다. `which kubeadm`으로 확인 후 스크립트의 `kubeadmCerts` 변수를 조정하세요. (`/usr/bin/kubeadm` 또는 `/usr/local/bin/kubeadm`)

### 2️⃣ systemd 서비스 작성

`/etc/systemd/system/k8s-certs-renew.service` 파일을 생성합니다.

```bash
sudo tee /etc/systemd/system/k8s-certs-renew.service > /dev/null <<EOF
[Unit]
Description=Renew K8S control plane certificates

[Service]
Type=oneshot
ExecStart=/usr/local/bin/kube-scripts/k8s-certs-renew.sh
EOF
```

### 3️⃣ systemd 타이머 작성

`/etc/systemd/system/k8s-certs-renew.timer` 파일을 생성합니다.

```bash
sudo tee /etc/systemd/system/k8s-certs-renew.timer > /dev/null <<EOF
[Unit]
Description=Timer to renew K8S control plane certificates

[Timer]
OnCalendar=Mon *-*-* 03:00:00
Unit=k8s-certs-renew.service

[Install]
WantedBy=multi-user.target
EOF
```

### 4️⃣ 타이머 활성화

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now k8s-certs-renew.timer
```

### 5️⃣ 타이머 상태 확인

```bash
# 다음 실행 시각 확인
systemctl list-timers k8s-certs-renew.timer

# 서비스 로그 확인
journalctl -u k8s-certs-renew.service --no-pager
```

출력 예시:

```text
NEXT                        LEFT     LAST PASSED UNIT                       ACTIVATES
Mon 2026-06-01 03:00:00 UTC 5d 10h   -    -      k8s-certs-renew.timer      k8s-certs-renew.service
```

---

## 🧪 동작 테스트

실제 만료가 임박하지 않아도 수동으로 서비스를 실행해 동작을 검증할 수 있습니다.

```bash
# 수동 실행 (renew 분기는 타지 않고 check-expiration만 출력됨)
sudo systemctl start k8s-certs-renew.service

# 결과 확인
journalctl -u k8s-certs-renew.service -f
```

만료 30일 미만 조건을 강제로 만들고 싶다면 스크립트의 `if [ "$(getCertValidDays)" -lt 30 ]` 부분을 임시로 `-lt 9999`로 변경한 뒤 실행 → 동작 확인 후 원복합니다.

---

## ⚠️ 운영 시 주의사항

| 항목 | 내용 |
|------|------|
| **HA 클러스터** | 모든 컨트롤 플레인 노드에 동일한 타이머를 설치해야 합니다. 노드별로 인증서가 따로 발급되어 있습니다. |
| **CA 만료** | CA 인증서는 `kubeadm certs renew all`로 갱신되지 않습니다. 10년 만료가 가까워지면 별도 절차가 필요합니다. |
| **kubeconfig 사용자** | `/root/.kube/config`만 갱신됩니다. 다른 사용자가 사용하는 kubeconfig도 별도로 업데이트해야 합니다. |
| **외부 관리 인증서** | `EXTERNALLY MANAGED=yes`로 표시되는 인증서는 갱신되지 않습니다. (예: Vault, cert-manager 발급) |
| **etcd 백업** | 갱신 작업 전 반드시 etcd 스냅샷을 확보합니다. |

---

## ❓ 자주 묻는 질문

### Q. kubeadm으로 설치하지 않은 클러스터에도 적용 가능한가요?

**아니요.** 이 스크립트는 `kubeadm certs renew` 명령에 의존합니다. kubespray로 설치한 클러스터는 kubeadm 기반이라 적용 가능하지만, k3s나 RKE2처럼 자체 인증서 관리 메커니즘이 있는 배포판은 각 도구가 제공하는 회전 방식을 사용해야 합니다.

### Q. 인증서 유효기간을 1년보다 길게 설정할 수 있나요?

**가능합니다.** `kubeadm init` 시 `--cert-validity-period` 플래그(v1.31+)를 사용하거나 `ClusterConfiguration`에서 `certificateValidityPeriod`를 설정합니다. 다만 보안 모범 사례는 짧은 주기로 자주 갱신하는 것이라, 1년을 유지하고 자동화를 도입하는 편이 권장됩니다.

### Q. 갱신 시 클러스터가 중단되나요?

**컨트롤 플레인 Pod 재기동 시 수 초간 API 응답이 지연**될 수 있지만, 워크로드(Pod)에는 영향이 없습니다. HA 클러스터라면 노드별 타이머를 동일 시각으로 설정하지 말고 5~10분 간격으로 분산하는 것이 안전합니다.

### Q. `kubelet` 인증서는 어떻게 갱신되나요?

kubelet 인증서는 `RotateKubeletClientCertificate` 기능 게이트(기본 활성화)에 의해 **자동 회전**됩니다. `kubeadm certs renew`가 관여하지 않습니다. `/var/lib/kubelet/pki/` 아래의 `kubelet-client-current.pem` 심볼릭 링크가 주기적으로 갱신됩니다.

### Q. 갱신 후 `kubectl` 명령이 실패합니다.

`/etc/kubernetes/admin.conf`의 인증서는 갱신됐지만 사용자 홈의 `~/.kube/config`가 갱신되지 않은 경우입니다. 다음 명령으로 동기화합니다.

```bash
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

---

## 📚 참고

- [Kubernetes 공식 문서: Certificate Management with kubeadm](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/)
- [Kubernetes 공식 문서: PKI certificates and requirements](https://kubernetes.io/docs/setup/best-practices/certificates/)
- [kubeadm reference: certs renew](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-certs/)
- [systemd.timer 매뉴얼](https://www.freedesktop.org/software/systemd/man/systemd.timer.html)
