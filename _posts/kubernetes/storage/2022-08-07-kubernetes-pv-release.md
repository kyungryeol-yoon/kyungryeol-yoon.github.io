---
title: "[Kubernetes] Release 상태의 PV를 Available 상태로 변경"
date: 2022-08-07
categories: [Kubernetes, Storage]
tags: [kubernetes, storage]
---

- helm으로 설치된 경우 동적 프로비저닝을 통해 PV/PVC 가 동적으로 사용되었을 경우, helm으로 uninstall을 하게 되면 사용되었던 PV 자원의 상태는 release 상태가 된다.
- 이 경우 PV는 이전에 매핑된 PVC의 ref 요소가 남아 있어 다음에 다시 helm 으로 설치하게 되면 이전에 사용했던 PV 를 다시 사용하는 것이 아니라 새로운 PV 를 생성하여 사용하게 된다.
- 이전에 사용했던 PV는 그대로 release 상태로 남아 있게 된다.

- 이 경우 helm 삭제시 삭제 후 PV의 spec.claimRef를 null로 지정하게 되면 다음에 다시 helm 으로 설치하는 경우, 이전에 사용했던 PV 를 다시 사용할 수 있다.

 
```bash
kubectl patch pv [pvname] --patch '{"spec":{claimRef": null}}'

kubectl patch pv [pvname] -p '{"spec":{"claimRef": null}}'
```