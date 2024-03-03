---
title: "Kubernetes Kubekey Artifact"
date: 2024-03-01
categories: [Kubernetes, Kubekey]
tags: [Kubernetes, Kubekey, Artifact]
---

# offline 설치 위한 artifact 파일 생성
## version 참고
- kubernetes와 관련된 image는 https://github.com/kubesphere/ks-installer/releases 에서 주요 release에만 포함되는 image-list.txt파일을 참고
- kubekey의 버전별로 kubernetes, kubesphere의 최신 지원 버전이 있음
    - kubekey/version/components.json
    - kubekey/cmd/kk/pkg/version/kubesphere/version_enum.go
    - kubekey/cmd/kk/pkg/version/kubernetes/version_enum.go
- default 버전에 대한 설정은 kubekey/cmd/kk/apis/kubekey/v1alpha2/default.go 파일에 있다

참고)
https://kubesphere.io/docs/v3.4/installing-on-linux/introduction/air-gapped-installation
https://github.com/kubesphere/kubekey/blob/v3.0.13/docs/manifest-example.md

# kubekey artifact 설치
curl -sfL https://get-kk.kubesphere.io | VERSION=v3.0.7 sh -

chmod +x kk
or
sudo cp kk /usr/local/bin


1.kk_artifact.md

sudo ./kk artifact export -m artifact-3.0.7.yaml -o artifact-3.0.7.tar.gz

artifact 파일로 클러스터 설치하기

sudo ./kk create config --with-kubesphere v3.4.1 --with-kubernetes v1.24.9 -f config-sample.yaml

// registry 먼저 설치
$ kk init registry -f config-sample.yaml -a artifact-3.0.7.tar.gz 

// cluster 설치
$ kk create cluster -f config-sample.yaml -a artifact-3.0.7.tar.gz