
// FIX: Removed a circular import of `AppView` from the same file, which was causing a conflict with the enum declaration.
export enum AppView {
  Home = 'home',
  GeneralChat = 'general_chat',

  // Document Generators
  DadkhastHoghooghi = 'dadkhast_hoghooghi',
  DadkhastSabti = 'dadkhast_sabti',
  ShekayatKeyfari = 'shekayat_keyfari',
  DadkhastEdareKar = 'dadkhast_edare_kar',
  ShokvaieTazirat = 'shokvaie_tazirat',
  LayeheHoghooghi = 'layehe_hoghooghi',
  LayeheKeyfari = 'layehe_keyfari',
  LayeheEdareKar = 'layehe_edare_kar',
  LayeheSabti = 'layehe_sabti',
  LayeheKhanevadeh = 'layehe_khanevadeh',

  // Calculator
  CostCalculator = 'cost_calculator',

  // Chat/Analysis
  EjrayeAhkamHoghooghi = 'ejraye_ahkam_hoghooghi',
  EjrayeAhkamKeyfari = 'ejraye_ahkam_keyfari',
  LegalAnalysis = 'legal_analysis',
}

export type LegalDocumentType =
  | 'dadkhast_hoghooghi'
  | 'dadkhast_sabti'
  | 'shekayat_keyfari'
  | 'dadkhast_edare_kar'
  | 'shokvaie_tazirat'
  | 'layehe_hoghooghi'
  | 'layehe_keyfari'
  | 'layehe_edare_kar'
  | 'layehe_sabti'
  | 'layehe_khanevadeh';

export const legalDocumentTypeMap: { [key in LegalDocumentType]: string } = {
  dadkhast_hoghooghi: 'دادخواست حقوقی',
  dadkhast_sabti: 'دادخواست ثبتی',
  shekayat_keyfari: 'شکواییه کیفری',
  dadkhast_edare_kar: 'دادخواست اداره کار',
  shokvaie_tazirat: 'شکواییه تعزیرات',
  layehe_hoghooghi: 'لایحه حقوقی',
  layehe_keyfari: 'لایحه کیفری',
  layehe_edare_kar: 'لایحه اداره کار',
  layehe_sabti: 'لایحه ثبتی',
  layehe_khanevadeh: 'لایحه خانواده',
};

export const viewToDocumentTypeMap: Partial<Record<AppView, LegalDocumentType>> = {
  [AppView.DadkhastHoghooghi]: 'dadkhast_hoghooghi',
  [AppView.DadkhastSabti]: 'dadkhast_sabti',
  [AppView.ShekayatKeyfari]: 'shekayat_keyfari',
  [AppView.DadkhastEdareKar]: 'dadkhast_edare_kar',
  [AppView.ShokvaieTazirat]: 'shokvaie_tazirat',
  [AppView.LayeheHoghooghi]: 'layehe_hoghooghi',
  [AppView.LayeheKeyfari]: 'layehe_keyfari',
  [AppView.LayeheEdareKar]: 'layehe_edare_kar',
  [AppView.LayeheSabti]: 'layehe_sabti',
  [AppView.LayeheKhanevadeh]: 'layehe_khanevadeh',
};
