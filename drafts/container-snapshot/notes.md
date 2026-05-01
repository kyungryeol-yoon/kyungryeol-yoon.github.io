컨테이너 환경(특히 Kubernetes나 Containerd)에서 특정 snapshot 디렉토리가 용량을 과하게 차지할 때, 어떤 컨테이너가 범인인지 찾아내는 과정은 아주 유용한 블로그 주제입니다.
독자들이 기술적 흐름을 쉽게 이해할 수 있도록 블로그 초안 구조와 추가로 메모/조사해야 할 핵심 포인트를 정리해 드립니다.
1. 블로그 글 초안 가이드
제목 후보
• [Troubleshooting] 컨테이너 디스크 용량 부족 해결: OverlayFS 스냅샷의 주인 찾기
• 범인은 이 안에 있어! containerd의 거대 스냅샷과 연결된 앱 추적하기
• du -sh로 발견한 /appdata/cri/... 폴더, 어떤 Pod의 데이터일까?
글의 흐름 (서론-본론-결론)
1) 서론: 문제 발생
• 서버 디스크 용량 경고 발생.
• du -sh * 명령어로 추적하다 보니 /appdata/cri/io.containerd.snapshotter.v1.overlayfs/snapshots/ 하위의 특정 숫자 폴더(예: 11773)가 수십 GB를 차지하고 있는 상황 설명.
2) 본론: 추적 과정
• 시도 1: mount | grep 11773을 통해 마운트 정보 확인 (하지만 여기서 바로 앱 이름이 안 나오는 경우가 많음).
• 시도 2: 컨테이너 런타임 도구(crictl 또는 ctr)를 활용한 역추적.
• 핵심 로직: Snapshot ID → Container ID → Pod Name으로 이어지는 연결 고리 설명.
3) 해결 및 예방
• 용량을 많이 먹는 앱의 로그 설정(Log Rotation) 확인.
• 컨테이너 내부의 임시 파일 생성 로직 점검.
• crictl rmi --prune 등을 통한 미사용 이미지/컨테이너 정리.
2. 추가로 찾고 메모해야 할 자료 (블로그 퀄리티 Up)
글을 쓰실 때 아래 내용들을 터미널에서 직접 확인하고 캡처하거나 메모해 두시면 좋습니다.
① Snapshot ID와 Container 연결하는 법
mount 명령어로 안 나올 때, 가장 확실한 방법은 crictl을 사용하는 것입니다. (K8s 환경 기준)
• 메모할 명령어: # 모든 컨테이너의 정보를 상세히 출력하여 snapshot ID가 포함되어 있는지 확인 crictl ps -a | awk '{print $1}' | xargs -I {} sh -c "echo Container: {}; crictl inspect {} | grep 11773"  위 명령어에서 결과가 나오는 Container ID를 찾으면 성공입니다.
② inspect 결과의 구조
• crictl inspect <ID> 결과값 중에서 info.snapshotter나 rootfs 관련 섹션에 해당 ID(11773)가 어떻게 박혀 있는지 스크린샷을 찍어두세요. 이게 블로그의 '결정적 증거'가 됩니다.
③ 관련 개념 설명 (간략 메모)
• OverlayFS란? 컨테이너가 Lower(이미지)와 Upper(쓰기 계층)를 합쳐서 하나의 파일시스템으로 보여주는 방식.
• Snapshotter: containerd가 컨테이너 레이어를 관리하는 메커니즘.
④ 해결책 공유
• 단순히 폴더를 rm -rf 하면 안 된다는 점을 강조하세요. (컨테이너 런타임이 꼬일 수 있음)
• 해당 Pod를 kubectl delete pod 하거나, 앱 내부의 어떤 경로에 파일이 쌓였는지 ls -R로 확인하는 과정을 추가하면 좋습니다.
3. 요약 메모 (블로그 작성 시 참고용)
• 발생 경로: /appdata/cri/io.containerd.snapshotter.v1.overlayfs/snapshots/
• 사용한 도구: du, mount, grep, crictl (또는 docker inspect)
• 핵심 질문: "이 숫자로 된 폴더가 대체 어떤 서비스의 레이어인가?"
• 결론: Snapshot ID는 컨테이너의 Write Layer이며, 이를 추적해 로그 폭발이나 임시 파일 누수를 잡아야 함.
이 정도 내용을 바탕으로 터미널 스크린샷과 함께 정리하시면 훌륭한 기술 블로그 포스팅이 될 것 같습니다! 작성하시다 막히는 명령어가 있으면 더 물어봐 주세요.
혹시 지금 바로 특정 snapshot ID에 대응하는 컨테이너 이름을 찾는 정확한 명령어가 필요하신가요?