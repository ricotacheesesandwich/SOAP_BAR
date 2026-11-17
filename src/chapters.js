/**
 * Every wheel gesture advances a whole chapter; a chapter is never tied
 * to how far the user keeps scrolling. Edit this list to reorder the tour.
 * Use asset() for GitHub Pages project subpaths rather than /assets URLs.
 */
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

export const chapters = [
  {
    id: 'door', title: 'Door Handle', section: '01 — THE ENTRANCE',
    image: asset('door-neutral.webp'), position: 'center center', mobilePosition: '12% center', baseScale: 1,
    origin: '29% 48%', portal: '24% 49%', zoom: 0.14,
    story: {
      eyebrow: 'WELCOME TO SOAP BAR',
      title: 'Door Handle',
      description: '두 개의 비눗방울이 맞닿은 형태에서 출발한 문손잡이. 선명한 라임과 핑크가 방으로 들어가는 첫 순간을 특별하게 만듭니다.',
      position: 'right',
    },
  },
  {
    id: 'threshold', title: 'Step Inside', section: '02 — STEP INSIDE',
    image: asset('door-open.webp'), position: 'center center', mobilePosition: '38% center', baseScale: 1,
    origin: '30% 51%', portal: '29% 51%', zoom: 0.30,
  },
  {
    id: 'bedroom', title: 'A Softer Room', section: '03 — THE BEDROOM',
    image: asset('bedroom-soft.webp'), position: 'center center', baseScale: 1,
    origin: '73% 39%', portal: '69% 39%', zoom: 0.16,
    story: {
      eyebrow: 'INSIDE THE ROOM',
      title: 'A Softer Room',
      description: '부드러운 핑크빛 공간에 톡 튀는 비눗방울 형태의 오브제를 더했습니다. 공간 곳곳의 제품을 살펴보세요.',
      position: 'left',
    },
  },
  {
    id: 'mirror', title: 'Mirror', section: '04 — THE MIRROR',
    image: asset('mirror.webp'), position: 'center center', mobilePosition: '64% center', baseScale: 1,
    origin: '69% 44%', portal: '69% 44%', zoom: 0.15,
  },
  {
    id: 'bathroom', title: 'The Bathroom', section: '05 — THE BATHROOM',
    image: asset('bathroom.webp'), position: 'center center', mobilePosition: '38% center', baseScale: 1,
    origin: '36% 59%', portal: '35% 59%', zoom: 0.16,
    story: {
      eyebrow: 'EXPLORE THE DETAILS',
      title: 'The Bathroom',
      description: '작은 소품 하나에도 SOAP BAR만의 동그란 리듬을 담았습니다.',
      position: 'top-right',
    },
  },
  {
    id: 'sink', title: 'Wash Basin', section: '06 — THE WASH BASIN',
    image: asset('sink.webp'), position: 'center center', baseScale: 1,
    origin: '82% 40%', portal: '82% 40%', zoom: 0.13,
  },
  {
    id: 'towel', title: 'Towel Bar', section: '07 — TOWEL BAR',
    image: asset('towel-bar.webp'), position: 'center center', baseScale: 1,
    origin: '70% 55%', portal: '71% 56%', zoom: 0.14,
  },
  {
    id: 'dish', title: 'Soap Dish', section: '08 — SOAP DISH',
    image: asset('soap-dish.webp'), position: 'center center', baseScale: 1,
    origin: '48% 55%', portal: '48% 55%', zoom: 0.14,
  },
  {
    id: 'hook', title: 'Towel Hook', section: '09 — TOWEL HOOK',
    image: asset('towel-hook.webp'), position: 'center center', baseScale: 1,
    origin: '62% 43%', portal: '62% 43%', zoom: 0.12,
  },
  {
    id: 'goodbye', title: 'Room by Room', section: '10 — SOAP BAR',
    image: asset('outro.webp'), position: 'center center', baseScale: 1,
    origin: '70% 46%', portal: '70% 46%', zoom: 0.12,
    story: {
      eyebrow: 'THANKS FOR VISITING',
      title: 'Room by Room',
      description: '일상적인 공간에 즐거운 감각을 더하는 작은 오브제, SOAP BAR.',
      position: 'right',
    },
  },
];
