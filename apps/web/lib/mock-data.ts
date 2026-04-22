import type {
  AlertEvent,
  AssetAnalysisPayload,
  DashboardPayload,
  ExplorePayload,
  PortfolioPosition,
  RecommendationSnapshot,
  UserProfile,
  WatchlistItem,
} from "@investment-research/contracts";


const iso = "2026-04-22T13:18:00.000Z";

const recommendations: RecommendationSnapshot[] = [
  {
    asset_id: "crypto-btc",
    symbol: "BTC/USD",
    name: "Bitcoin",
    asset_class: "crypto",
    recommendation_label: "매수",
    confidence: 82,
    holding_window: "4시간-10일",
    current_price: 78235.09,
    change_percent_24h: 2.47,
    target_range: { low: 81010.12, high: 82420.44, basis: "score+volatility" },
    stop_range: { low: 75880.25, high: 76640.55, basis: "score+volatility" },
    invalidation_condition: "가격이 75880.25 아래로 밀리고 추세 신호가 약화되면 현재 시나리오는 무효입니다.",
    key_drivers: [
      "상승 추세가 유지되며 추세 추종 진입이 유효합니다.",
      "거래량이 방향성을 지지합니다.",
      "파생시장 포지셔닝이 과열 없이 우호적입니다."
    ],
    risk_flags: [
      {
        title: "리스크 관리 필요",
        severity: "low",
        detail: "추천이 긍정적이더라도 포지션 크기와 손절 기준은 사전에 고정해야 합니다."
      }
    ],
    signals: [
      {
        id: "trend",
        label: "추세",
        value: 0.81,
        sentiment: "bullish",
        description: "상승 추세가 유지되며 추세 추종 진입이 유효합니다."
      },
      {
        id: "volatility",
        label: "변동성",
        value: 0.68,
        sentiment: "bullish",
        description: "변동성이 통제 가능한 수준이라 리스크 관리가 수월합니다."
      },
      {
        id: "derivatives",
        label: "파생심리",
        value: 0.7,
        sentiment: "bullish",
        description: "파생시장 포지셔닝이 과열 없이 우호적입니다."
      }
    ],
    as_of: iso,
    tradingview_symbol: "BINANCE:BTCUSDT",
    explanation:
      "Bitcoin은 현재 매수 관점입니다. 주요 배경은 추세 우위와 파생심리 안정입니다. 목표 구간은 81010.12~82420.44, 손절 구간은 75880.25~76640.55로 제시합니다.",
    score: 78.8
  },
  {
    asset_id: "stock-nvda",
    symbol: "NVDA",
    name: "NVIDIA",
    asset_class: "stock",
    recommendation_label: "매수",
    confidence: 85,
    holding_window: "3일-6주",
    current_price: 118.42,
    change_percent_24h: 4.73,
    target_range: { low: 123.15, high: 125.88, basis: "score+volatility" },
    stop_range: { low: 113.11, high: 114.82, basis: "score+volatility" },
    invalidation_condition: "가격이 113.11 아래로 밀리고 추세 신호가 약화되면 현재 시나리오는 무효입니다.",
    key_drivers: [
      "상승 추세가 유지되며 추세 추종 진입이 유효합니다.",
      "기초 체력/상대강도가 우수합니다.",
      "거래량이 방향성을 지지합니다."
    ],
    risk_flags: [
      {
        title: "리스크 관리 필요",
        severity: "low",
        detail: "추세는 강하지만 급등 이후 분할 진입이 유리합니다."
      }
    ],
    signals: [
      {
        id: "trend",
        label: "추세",
        value: 0.92,
        sentiment: "bullish",
        description: "상승 추세가 유지되며 추세 추종 진입이 유효합니다."
      }
    ],
    as_of: iso,
    tradingview_symbol: "NASDAQ:NVDA",
    explanation:
      "NVIDIA는 현재 매수 관점입니다. AI 인프라 수요와 상대강도 우위가 유지되고 있습니다.",
    score: 82.1
  },
  {
    asset_id: "etf-gld",
    symbol: "GLD",
    name: "SPDR Gold Shares",
    asset_class: "etf",
    recommendation_label: "관망",
    confidence: 63,
    holding_window: "3일-6주",
    current_price: 247.55,
    change_percent_24h: 0.75,
    target_range: { low: 251.2, high: 254.6, basis: "score+volatility" },
    stop_range: { low: 242.8, high: 244.1, basis: "score+volatility" },
    invalidation_condition: "가격이 242.80 아래로 밀리면 안전자산 시나리오 재평가가 필요합니다.",
    key_drivers: [
      "변동성이 통제 가능한 수준이라 리스크 관리가 수월합니다.",
      "거시 불확실성 헤지 수요가 유지됩니다."
    ],
    risk_flags: [
      {
        title: "상승 탄력 제한",
        severity: "medium",
        detail: "방어 자산 성격이 강해 기대 수익률이 제한적일 수 있습니다."
      }
    ],
    signals: [
      {
        id: "trend",
        label: "추세",
        value: 0.59,
        sentiment: "neutral",
        description: "추세 우위가 뚜렷하지 않아 추가 확인이 필요합니다."
      }
    ],
    as_of: iso,
    tradingview_symbol: "AMEX:GLD",
    explanation:
      "GLD는 관망 관점입니다. 방어적 성격은 좋지만 추세 가속은 아직 제한적입니다.",
    score: 58.2
  }
];

export const alertsMock: AlertEvent[] = [
  {
    id: "alert-btc",
    asset_id: "crypto-btc",
    title: "BTC 추천 유지",
    detail: "비트코인 구조가 매수 관점으로 유지되고 있습니다.",
    level: "info",
    is_read: false,
    created_at: iso
  },
  {
    id: "alert-gld",
    asset_id: "etf-gld",
    title: "GLD 추세 둔화",
    detail: "관망 구간이 길어질 수 있어 비중 확대 전 재확인이 필요합니다.",
    level: "warning",
    is_read: false,
    created_at: iso
  }
];

export const dashboardMock: DashboardPayload = {
  generated_at: iso,
  market_context: {
    summary: "미국주식은 선택적 강세, 코인은 구조적 모멘텀이 우세한 장세입니다.",
    breadth: "상위 감시 우주 기준 매수 시그널 우세",
    volatility_regime: "상승 추세 우위",
    leaders: ["BTC/USD", "NVDA", "AAPL"]
  },
  top_ideas: recommendations,
  alerts_preview: alertsMock,
  filters: {
    asset_classes: ["stock", "etf", "crypto"],
    recommendation_labels: ["매수", "관망", "회피"]
  }
};

export const assetDetailMock: AssetAnalysisPayload = {
  asset: recommendations[0],
  market_snapshot: {
    day_high: 78545.89,
    day_low: 76146.45,
    volume: 0.725,
    previous_close: 76348
  },
  technical_summary: [
    "4시간봉 기준 고점/저점이 동반 상승 중입니다.",
    "일봉 기준 추세선 상단에서 거래량이 유지되고 있습니다.",
    "파생시장 과열은 크지 않아 추세 추종 구조가 유효합니다."
  ],
  risk_summary: [
    "손절 구간 이탈 시 즉시 시나리오를 폐기하는 편이 좋습니다.",
    "암호자산 특성상 주말 변동성 확대를 고려해야 합니다."
  ]
};

export const exploreMock: ExplorePayload = {
  items: recommendations,
  total: recommendations.length,
  page: 1,
  page_size: 12
};

export const watchlistMock: WatchlistItem[] = [
  { asset_id: "crypto-btc", added_at: iso },
  { asset_id: "stock-nvda", added_at: iso }
];

export const portfolioMock: PortfolioPosition[] = [
  { asset_id: "stock-nvda", quantity: 14, average_cost: 104.2, note: "AI 인프라 코어 포지션" },
  { asset_id: "etf-gld", quantity: 6, average_cost: 240.5, note: "리스크 헤지" }
];

export const profileMock: UserProfile = {
  user_id: "demo-user",
  email: "demo@example.com",
  risk_tolerance: "balanced",
  time_horizon: "hybrid",
  preferred_asset_classes: ["stock", "crypto"],
  locale: "ko-KR",
  completed_onboarding: true
};

