---
title: "[Kubernetes] Install Helm"
date: 2024-03-12
categories: [Kubernetes, Helm]
tags: [Kubernetes, Helm]
---

# Install Helm

> 설치 참고 : https://helm.sh/docs/intro/install/
{: .prompt-info }

## Script 방식
```
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3

chmod +x get_helm.sh

./get_helm.sh

helm version
```

## Windows
### choco 이용
```
choco install kubernetes-helm
```

### scoop 이용
```
scoop install helm
```

## Apt 이용 (Debian/Ubuntu)
```
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```