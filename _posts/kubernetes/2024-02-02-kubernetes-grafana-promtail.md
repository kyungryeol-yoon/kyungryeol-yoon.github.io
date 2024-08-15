---
title: "[Kubernetes] Grafana Promtail"
date: 2024-02-02
categories: [Kubernetes, Grafana]
tags: [Kubernetes, Grafana, Promtail]
---

### Promtail
Loki가 로그를 저장하는 역할을 하면 Promtail은 application에서 로그를 전달하는 agent의 역할을 한다.\\
Promtail 이외에도 Bit, Fluentd, LogStash 등을 사용할 수 있다.\\
kubernetes는 node 별로 /var/log/pods 아래에 모든 pod의 로그가 기록된다.\\
daemonset으로 설정하고 node별로 로그를 수집하도록 처리를 하면 된다.\\
promtail의 설치는 아래 가이드 문서를 참고하면 된다.\\

https://grafana.com/docs/loki/latest/clients/promtail/installation/


설치 방식은 sidecar, daemonset 방식이 있는데 daemonset 방식을 추천한다고 한다.
- **daemonset** - 각 노드마다 promtail pod가 실행되어 해당 노드 장비에서 실행 중인 파드의 로그를 추적
- **sidecar** - 각 파드에 container로 추가되어 실행, 해당 파드 내부에서 로그 파일을 읽어서 Loki로 전송
pod마다 agent 형태로 설정하는 것보다 daemonset을 하나 띄워 해당 node의 pod들을 찾아 로그를 수집하는 것이 훨씬 편한 것 같다.\\
Prometheus가 저장소와 polling 역할을 같이 담당하는 반면 Promtail은 저장소의 역할은 하지 않고 로그를 찾아 저장소로 push 하는 역할을 한다.\\
하지만 설정 방식이나 문법은 크게 차이가 없다.