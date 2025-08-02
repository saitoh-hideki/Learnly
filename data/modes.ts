import { Mode } from '@/store/useStore'

export const mainLearningModes: Mode[] = [
  {
    id: 'news-learning',
    name: 'ニュースで学ぶ',
    description: '毎日1つのニュースを起点に、自分の言葉で深く学び、デジタル提案までアウトプット',
    icon: '📰',
    popularity: 0,
    features: [
      '✅ デイリーニュースで最新トレンドをキャッチ',
      '✅ AIとの対話で深い理解を促進',
      '✅ 実践的なデジタル提案を作成'
    ]
  },
  {
    id: 'theme-learning',
    name: 'テーマで学ぶ',
    description: '7日間の体系的なテーマ学習で、分野別の専門知識を深める',
    icon: '📘',
    popularity: 0,
    features: [
      '✅ 7日間の段階的学習プログラム',
      '✅ 分野別の専門知識を体系的に習得',
      '✅ 最終日に総合的なアウトプット作成'
    ]
  }
]

export const learningModes: Mode[] = [
  {
    id: 'business',
    name: 'ビジネス・経営',
    description: '経営戦略・企業動向について学ぶ（DX、サステナビリティなど）',
    icon: '💼',
    popularity: 0
  },
  {
    id: 'technology',
    name: 'テクノロジー・IT',
    description: 'AI・Web技術の最新トレンドを追う（生成AI、Web3など）',
    icon: '💻',
    popularity: 0
  },
  {
    id: 'economics',
    name: '経済・金融',
    description: '金融市場・投資について理解を深める（金利政策、ESG投資など）',
    icon: '📊',
    popularity: 0
  },
  {
    id: 'science',
    name: '科学・研究',
    description: '研究成果・発見について学ぶ（医療、宇宙開発など）',
    icon: '🔬',
    popularity: 0
  },
  {
    id: 'education',
    name: '教育・学習',
    description: '学び方・教育改革について理解する（EdTech、STEAMなど）',
    icon: '📚',
    popularity: 0
  },
  {
    id: 'health',
    name: '健康・医療',
    description: '健康管理・予防医療について学ぶ（メンタルヘルス、栄養学など）',
    icon: '🏥',
    popularity: 0
  },
  {
    id: 'environment',
    name: '環境・サステナビリティ',
    description: '気候変動・脱炭素について理解する（再エネ、プラ削減など）',
    icon: '🌱',
    popularity: 0
  },
  {
    id: 'society',
    name: '社会・政治',
    description: '社会課題・政策について学ぶ（ジェンダー、国際問題など）',
    icon: '🏛️',
    popularity: 0
  },
  {
    id: 'lifestyle',
    name: '文化・ライフスタイル',
    description: '生活・価値観について理解する（Z世代文化、ワークライフバランスなど）',
    icon: '🌟',
    popularity: 0
  }
]