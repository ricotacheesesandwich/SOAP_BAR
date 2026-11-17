# SOAP BAR — Room by Room

사용자가 제공한 디자인 이미지 11장과 문 열림 영상 1개로 제작한 **React + TypeScript + Vite** 기반의 공간 탐색 웹사이트입니다.
GitHub Pages에 배포하도록 설정되어 있으며 Vercel이나 별도 서버는 필요하지 않습니다.

## 구성

- 닫힌 문 → **실제 문 열림 영상(4초)** → 문 안쪽 → 침실 → 거울 → 욕실 → 세면대 → 수건걸이 → 비누받침 → 수건고리 → 엔딩
- 마우스 휠을 한 번 굴리면 다음 장면의 전환이 **자동으로 끝까지 재생**됩니다. 스크롤 거리가 애니메이션 진행률을 제어하지 않습니다.
- 전환 중에는 추가 휠 입력을 무시합니다. 이전 장면으로 돌아가거나 INDEX에서 건너뛰는 것도 가능합니다.
- 장면 전환: 이전 이미지는 **한 방향으로만 확대**, 다음 이미지는 원래 크기로 나타납니다. 화면이 줄어들었다 커지는 반동 효과는 없습니다.
- 데스크톱 휠/키보드, 모바일 스와이프, 양쪽 화살표, INDEX 버튼을 지원합니다.
- 하단 스크롤 안내 배너는 없습니다.
- 모션 감소 시스템 설정을 사용하면 전환 효과 없이 곧바로 다음 장면으로 이동합니다.

## 1. 개발 실행

Node.js 22 이상 권장.

```bash
npm install
npm run dev
```

터미널에 나타나는 `http://localhost:5173/` 주소를 브라우저에서 열면 됩니다.

설치 없이 시연하려면 ZIP에 들어 있는 `preview-standalone.html`을 브라우저에서 열어주세요. 이 HTML은 시연용 별도 실행본이며, 실제 사이트 소스는 `src/`에 있습니다.

## 2. GitHub Pages 배포

1. GitHub에서 **공개(Public)** 저장소를 새로 만듭니다. 예: `soapbar-portfolio`.
2. VS Code에서 **이 프로젝트 폴더 자체**를 열고 아래를 실행합니다.

```bash
git init
git add .
git commit -m "feat: build soapbar spatial portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_ID/soapbar-portfolio.git
git push -u origin main
```

3. GitHub의 `Settings → Pages → Build and deployment → Source`에서 **GitHub Actions**를 선택합니다.
4. `Actions`에서 `Deploy SOAP BAR to GitHub Pages`가 성공했는지 확인합니다.
5. 접속 주소: `https://YOUR_GITHUB_ID.github.io/soapbar-portfolio/`

다른 이름의 저장소도 가능합니다. `vite.config.ts`가 GitHub Actions의 `GITHUB_REPOSITORY`를 읽어 자동으로 `base` 경로를 설정합니다. `YOUR_GITHUB_ID`와 저장소 이름은 본인 것으로 교체하세요.

이후에는 다음 명령으로 재배포됩니다.

```bash
git add .
git commit -m "update: refine soapbar experience"
git push origin main
```

*기존 저장소에서 작업 중이라면 `git init`과 `git remote add origin`은 다시 실행하지 마세요.*

## 3. 수정할 파일

| 파일 | 용도 |
| --- | --- |
| `src/chapters.js` | 장면 순서·제목·설명·이미지·화면 초점·확대 정도 |
| `src/experience.js` | 휠/스와이프 인식, 문 열림 영상, 화면 전환 시간 |
| `src/App.tsx` | React 화면 구조와 내비게이션 |
| `src/styles.css` | 색상·타이포·버튼·반응형 디자인 |
| `public/assets/` | 제공한 이미지 11장 및 문 열림 영상 1개 |
| `.github/workflows/deploy.yml` | GitHub Pages 자동 빌드·배포 |

장면 내용을 추가할 때에는 `src/chapters.js`에 객체를 추가합니다. 영상이나 이미지를 추가할 때에는 `public/assets`에 파일을 놓고 `asset('이름.webp')` 형태로 설정합니다. `/assets/이름.webp` 같은 절대 경로로 작성하면 GitHub Pages 저장소 하위 경로에서 깨질 수 있습니다.

전환 모양을 바꾸려면 `ordinaryTransition()`의 `duration: 1180`을 조절합니다. 첫 장면에서 문이 열리는 시간은 **원본 영상 길이**에 맞춰 재생됩니다.

## 제작 관련 참고

- 사진에 글자가 포함된 장면은 원본 이미지를 그대로 보존했습니다. 텍스트를 각각 수정하려면 텍스트 없는 원본 렌더 이미지가 필요합니다.
- 이 사이트는 제공된 사진을 활용하는 2.5D 전환 방식입니다. 실제 방 전체를 자유 시점으로 조작하는 3D 모델링은 포함되어 있지 않습니다.
- 동영상은 H.264 MP4 형식으로 포함되어 있습니다. 재생이 불가능한 환경에서는 정적 장면으로 넘어가도록 대체 동작을 마련했습니다.
- 현재 실행 환경에서는 npm 레지스트리 네트워크 연결이 제한되어 `npm run build`까지 검증하지 못했습니다. 별도 HTML 실행본의 장면 이동·역방향·INDEX·모바일 화면은 Chromium에서 확인했습니다.
