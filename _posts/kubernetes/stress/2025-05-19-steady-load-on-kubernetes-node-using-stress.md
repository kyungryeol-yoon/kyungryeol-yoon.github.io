---
title: "[Kubernetes] Steady Load on Kubernetes Node Using Stress"
date: 2025-05-19
categories: [Kubernetes, Stress]
tags: [kubernetes, stress]
---

## stress 설치

```bash
RUN apt-get update && apt-get install -y stress bc
```

## ConfigMap 설정

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: stress-script
  namespace: chip-anlyzer
data:
  stress-control.sh: |
    #!/bin/bash

    TARGET_CPU_USAGE=$TARGET_CPU
    echo "TARGET_CPU_USAGE = $TARGET_CPU_USAGE"

    TARGET_MEMORY_USAGE=$TARGET_MEM
    echo "TARGET_MEMORY_USAGE=$TARGET_MEMORY_USAGE"

    TIMEOUT=$TIMEOUT
    echo "TIMEOUT = $TIMEOUT"

    while true; do
      echo "##### CPU Check #####"
      TOTAL_CORES=$(nproc)
      echo "TOTAL_CORES = $TOTAL_CORES"

      CURRENT_IDLE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print $1}')
      echo "CURRENT_IDLE = $CURRENT_IDLE"

      CURRENT_CPU_USAGE=$(echo "100 - $CURRENT_IDLE" | bc -l)
      echo "CURRENT_CPU_USAGE = $CURRENT_CPU_USAGE"

      NEEDED_CPU_USAGE=$(echo "$TARGET_CPU_USAGE - $CURRENT_CPU_USAGE" | bc -l)
      echo "NEEDED_CPU_USAGE = $NEEDED_CPU_USAGE"

      TARGET_CPU_CORES=$(echo "$NEEDED_CPU_USAGE * $TOTAL_CORES / 100" | bc -l)
      echo "TARGET_CPU_CORES = $TARGET_CPU_CORES"

      TARGET_CPU_CORES_ROUNDED=$(echo "($TARGET_CPU_CORES+0.5)/1" | bc)
      echo "TARGET_CPU_CORES_ROUNDED = $TARGET_CPU_CORES_ROUNDED"


      echo "##### Memory Check #####"
      TOTAL_MEMORY=$(grep MemTotal /proc/meminfo | awk '{print $2}')
      echo "TOTAL_MEMORY = $TOTAL_MEMORY

      FREE_MEMORY=$(grep MemFree /proc/meminfo | awk '{print $2}')
      echo "FREE_MEMORY = $FREE_MEMORY"

      BUFFERS=$(grep Buffers /proc/meminfo | awk '{print $2}')
      echo "BUFFERS = $BUFFERS"

      CACHED=$(grep "^Cached" /proc/meminfo | awk '{print $2}')
      echo "CACHED = $CACHED"

      USED_MEMORY=$((TOTAL_MEMORY - FRESS_MEMORY - BUFFERS - CACHED))
      echo "USED_MEMORY = $USED_MEMORY"

      TARGET_MEMORY=$(echo "$TOTAL_MEMORY * $TARGET_MEMORY_USAGE / 100" | bc)
      echo "TARGET_MEMORY = $TARGET_MEMORY"

      NEEDED_MEMORY=$((TARGET_MEMORY - USED_MEMORY))
      echo "NEEDED_MEMORY = $NEEDED_MEMORY"

      # MB로 계산하고 싶을 때(반올림 추가)
      NEEDED_MEMORY_ROUNDED=$(echo "($NEEDED_MEMORY + 1023) / 1024" | bc)
      echo "NEEDED_MEMORY_ROUNDED = $NEEDED_MEMORY_ROUNDED"

      if (( $(echo "$TARGET_CPU_CORES_ROUNDED > 0" | bc -l) )) && (( NEEDED_MEMORY > 1023 )); then
        echo "Adding Stress CPU: $TARGET_CPU_CORES_ROUNDED / Memory: $NEEDED_MEMORY KB."
        stress --cpu $TARGET_CPU_CORES_ROUNDED --vm 1 --vm-bytes ${NEEDED_MEMORY}k --vm-hang 0 --verbose --timeout ${TIMEOUT}s
      elif (( $(echo "$TARGET_CPU_CORES_ROUNDED > 0" | bc -l) )) && (( NEEDED_MEMORY <= 1023 )); then
        echo "Adding Stress CPU:  $TARGET_CPU_CORES_ROUNDED."
        stress --cpu $TARGET_CPU_CORES_ROUNDED --vm-hang 0 --verbose --timeout ${TIMEOUT}s
      elif (( $(echo "$TARGET_CPU_CORES_ROUNDED <= 0" | bc -l) )) && (( NEEDED_MEMORY > 1023 )); then
        echo "Adding Stress Memory: $NEEDED_MEMORY KB."
        stress --vm 1 --vm-bytes ${NEEDED_MEMORY}k --vm-hang 0 --verbose --timeout ${TIMEOUT}s
      else
        echo "No Stress Needed."
      fi

      wait

      sleep 1

    done
```

## DaemonSet 설정

```yaml
apiVersion: apps/v1
kind: DaemoSet
metadata:
  labels:
    app: chip-analyzer-master
  name: chip-analyzer-master
  namespace: chip-analyzer
spec:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 5
      maxSurge: 0
  selector:
    matchLabels:
      app: chip-analyzer-master
  template:
    metadata:
      labels:
        app: chip-analyzer-master
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoreDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                - key: node-role.kubernetes.io/control-plane
                   operator: Exists
      tolerations:
        - key: node-role.kubernetes.io/control-plane
           operator: Exists
           effect: NoSchedule
        - key: node-role.kubernetes.io/master
           operator: Exists
           effect: NoSchedule
      containers:
      - env:
        - name: TARGET_CPU
           value: '50'
        - name: TARGET_MEM
           value: '50'
        - name: TIMEOUT
           value: '300'
        image: stress:v1.0
        command: ["/bin/bash", "/scripts/stress-control.sh"]
        volumeMounts:
        - name: script-volume
           mountPath: /scripts
        imagePullPolicy: Always
        name: chip-analyzer-master
      restartPolicy: Always
      volumes:
      - name: script-volume
         configMap:
           name: stress-script
           defaultMode: 0775
```